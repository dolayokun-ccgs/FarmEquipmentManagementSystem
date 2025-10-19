import { Request, Response } from 'express';
import prisma from '../config/database';
import { createNotification } from './notification.controller';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { equipmentId, startDate, endDate, notes } = req.body;

    // Validate required fields
    if (!equipmentId || !startDate || !endDate) {
      res.status(400).json({
        status: 'error',
        message: 'Equipment ID, start date, and end date are required',
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      res.status(400).json({
        status: 'error',
        message: 'Start date cannot be in the past',
      });
      return;
    }

    if (end <= start) {
      res.status(400).json({
        status: 'error',
        message: 'End date must be after start date',
      });
      return;
    }

    // Check if equipment exists and is available
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { owner: true },
    });

    if (!equipment) {
      res.status(404).json({
        status: 'error',
        message: 'Equipment not found',
      });
      return;
    }

    if (!equipment.isAvailable) {
      res.status(400).json({
        status: 'error',
        message: 'Equipment is not available',
      });
      return;
    }

    // Check for booking conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        equipmentId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Equipment is already booked for the selected dates',
        conflictingDates: conflictingBookings.map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
        })),
      });
      return;
    }

    // Calculate total days and price
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = Number(equipment.pricePerDay) * totalDays;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        equipmentId,
        farmerId: req.user.userId,
        startDate: start,
        endDate: end,
        totalDays,
        pricePerDay: equipment.pricePerDay,
        totalPrice,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        equipment: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Notify equipment owner about new booking request
    await createNotification(
      equipment.ownerId,
      'BOOKING_CREATED',
      'New Booking Request',
      `${booking.farmer.firstName} ${booking.farmer.lastName} has requested to book your ${equipment.name} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      { bookingId: booking.id, equipmentId: equipment.id }
    );

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
    });
  }
};

/**
 * Get all bookings (with filters)
 * GET /api/bookings
 */
export const getAllBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { page = 1, limit = 20, status, equipmentId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const where: any = {};

    // Users can only see their own bookings (farmers) or bookings for their equipment (owners)
    if (req.user.role === 'FARMER') {
      where.farmerId = req.user.userId;
    } else if (req.user.role === 'PLATFORM_OWNER') {
      where.equipment = {
        ownerId: req.user.userId,
      };
    }
    // Admin can see all

    if (status) {
      where.status = status as string;
    }

    if (equipmentId) {
      where.equipmentId = equipmentId as string;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          equipment: {
            include: {
              category: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
          farmer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
    });
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                profileImage: true,
              },
            },
          },
        },
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
      return;
    }

    // Check authorization
    const isOwner = booking.equipment.ownerId === req.user.userId;
    const isFarmer = booking.farmerId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isFarmer && !isAdmin) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have access to this booking',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking',
    });
  }
};

/**
 * Update booking status (confirm/reject by owner)
 * PATCH /api/bookings/:id/status
 */
export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        status: 'error',
        message: 'Status is required',
      });
      return;
    }

    // Get booking with equipment owner
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        equipment: {
          select: { ownerId: true },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
      return;
    }

    // Only equipment owner or admin can update status
    if (
      booking.equipment.ownerId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        status: 'error',
        message: 'Only the equipment owner can update booking status',
      });
      return;
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: status as string,
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      },
      include: {
        equipment: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Notify farmer based on status update
    if (status === 'CONFIRMED') {
      await createNotification(
        updatedBooking.farmerId,
        'BOOKING_CONFIRMED',
        'Booking Confirmed!',
        `Your booking request for ${updatedBooking.equipment.name} has been confirmed by ${updatedBooking.equipment.owner.firstName} ${updatedBooking.equipment.owner.lastName}`,
        { bookingId: updatedBooking.id, equipmentId: updatedBooking.equipmentId }
      );
    } else if (status === 'CANCELLED') {
      await createNotification(
        updatedBooking.farmerId,
        'BOOKING_CANCELLED',
        'Booking Cancelled',
        `Your booking for ${updatedBooking.equipment.name} has been cancelled by the equipment owner`,
        { bookingId: updatedBooking.id, equipmentId: updatedBooking.equipmentId }
      );
    } else if (status === 'ACTIVE') {
      await createNotification(
        updatedBooking.farmerId,
        'BOOKING_ACTIVE',
        'Booking Active',
        `Your booking for ${updatedBooking.equipment.name} is now active. Enjoy!`,
        { bookingId: updatedBooking.id, equipmentId: updatedBooking.equipmentId }
      );
    } else if (status === 'COMPLETED') {
      // Notify both farmer and equipment owner
      await createNotification(
        updatedBooking.farmerId,
        'BOOKING_COMPLETED',
        'Booking Completed',
        `Your booking for ${updatedBooking.equipment.name} has been completed. Please leave a review!`,
        { bookingId: updatedBooking.id, equipmentId: updatedBooking.equipmentId }
      );
      await createNotification(
        updatedBooking.equipment.ownerId,
        'BOOKING_COMPLETED',
        'Booking Completed',
        `The booking for your ${updatedBooking.equipment.name} by ${updatedBooking.farmer.firstName} ${updatedBooking.farmer.lastName} has been completed`,
        { bookingId: updatedBooking.id, equipmentId: updatedBooking.equipmentId }
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status',
    });
  }
};

/**
 * Cancel booking (by farmer)
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
      return;
    }

    // Only the farmer who made the booking can cancel it
    if (booking.farmerId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You can only cancel your own bookings',
      });
      return;
    }

    // Cannot cancel completed bookings
    if (booking.status === 'COMPLETED') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot cancel a completed booking',
      });
      return;
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || null,
      },
      include: {
        equipment: {
          include: {
            category: true,
          },
        },
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify equipment owner about the cancellation
    await createNotification(
      booking.equipment.ownerId,
      'BOOKING_CANCELLED',
      'Booking Cancelled',
      `${updatedBooking.farmer.firstName} ${updatedBooking.farmer.lastName} has cancelled their booking for your ${booking.equipment.name}${cancellationReason ? `. Reason: ${cancellationReason}` : ''}`,
      { bookingId: updatedBooking.id, equipmentId: booking.equipment.id }
    );

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel booking',
    });
  }
};

/**
 * Get equipment availability
 * GET /api/bookings/availability/:equipmentId
 */
export const getEquipmentAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { equipmentId } = req.params;
    const { startDate, endDate } = req.query;

    // Get all confirmed/active bookings for this equipment
    const bookings = await prisma.booking.findMany({
      where: {
        equipmentId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        ...(startDate &&
          endDate && {
            OR: [
              {
                startDate: {
                  lte: new Date(endDate as string),
                },
                endDate: {
                  gte: new Date(startDate as string),
                },
              },
            ],
          }),
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        equipmentId,
        bookedDates: bookings,
        isAvailable: bookings.length === 0,
      },
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch availability',
    });
  }
};
