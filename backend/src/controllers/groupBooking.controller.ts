import { Request, Response } from 'express';
import prisma from '../config/database';
import { createNotification } from './notification.controller';

/**
 * Create a new group booking
 * POST /api/group-bookings
 */
export const createGroupBooking = async (
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

    const {
      equipmentId,
      startDate,
      endDate,
      minParticipants,
      maxParticipants,
      isPublic,
      expiresAt,
      notes,
    } = req.body;

    // Validate required fields
    if (!equipmentId || !startDate || !endDate || !minParticipants || !maxParticipants) {
      res.status(400).json({
        status: 'error',
        message: 'Equipment ID, start date, end date, min and max participants are required',
      });
      return;
    }

    // Validate participants
    if (minParticipants < 2) {
      res.status(400).json({
        status: 'error',
        message: 'Minimum participants must be at least 2',
      });
      return;
    }

    if (maxParticipants < minParticipants) {
      res.status(400).json({
        status: 'error',
        message: 'Maximum participants must be greater than or equal to minimum participants',
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

    // Validate expiry date if provided
    if (expiresAt) {
      const expires = new Date(expiresAt);
      if (expires < now) {
        res.status(400).json({
          status: 'error',
          message: 'Expiry date cannot be in the past',
        });
        return;
      }
      if (expires > start) {
        res.status(400).json({
          status: 'error',
          message: 'Expiry date must be before the start date',
        });
        return;
      }
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

    // Check for booking conflicts (both individual and group bookings)
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

    const conflictingGroupBookings = await prisma.groupBooking.findMany({
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

    if (conflictingBookings.length > 0 || conflictingGroupBookings.length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Equipment is already booked for the selected dates',
      });
      return;
    }

    // Calculate total days and price
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = Number(equipment.pricePerDay) * totalDays;

    // Create group booking
    const groupBooking = await prisma.groupBooking.create({
      data: {
        equipmentId,
        initiatorId: req.user.userId,
        startDate: start,
        endDate: end,
        totalDays,
        pricePerDay: equipment.pricePerDay,
        totalPrice,
        minParticipants,
        maxParticipants,
        isPublic: isPublic !== undefined ? isPublic : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes || null,
        status: 'OPEN',
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
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        participants: {
          include: {
            farmer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Group booking created successfully',
      data: { groupBooking },
    });
  } catch (error) {
    console.error('Create group booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create group booking',
    });
  }
};

/**
 * Get all group bookings (with filters)
 * GET /api/group-bookings
 */
export const getAllGroupBookings = async (
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

    const { status, equipmentId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter based on user role
    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by equipment if provided
    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    // Role-based filtering
    if (req.user.role === 'FARMER') {
      // Farmers see:
      // 1. Group bookings they initiated
      // 2. Group bookings they joined
      // 3. Public open group bookings
      where.OR = [
        { initiatorId: req.user.userId },
        {
          participants: {
            some: { farmerId: req.user.userId },
          },
        },
        {
          AND: [
            { isPublic: true },
            { status: 'OPEN' },
          ],
        },
      ];
    } else if (req.user.role === 'PLATFORM_OWNER') {
      // Platform owners see group bookings for their equipment
      const ownerEquipment = await prisma.equipment.findMany({
        where: { ownerId: req.user.userId },
        select: { id: true },
      });
      const equipmentIds = ownerEquipment.map((e) => e.id);
      where.equipmentId = { in: equipmentIds };
    }
    // Admins see all group bookings (no additional filter)

    // Get group bookings with pagination
    const [groupBookings, total] = await Promise.all([
      prisma.groupBooking.findMany({
        where,
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
                },
              },
            },
          },
          initiator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          participants: {
            include: {
              farmer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.groupBooking.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        groupBookings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get group bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch group bookings',
    });
  }
};

/**
 * Get a single group booking by ID
 * GET /api/group-bookings/:id
 */
export const getGroupBookingById = async (
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

    const groupBooking = await prisma.groupBooking.findUnique({
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
              },
            },
          },
        },
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        participants: {
          include: {
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
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!groupBooking) {
      res.status(404).json({
        status: 'error',
        message: 'Group booking not found',
      });
      return;
    }

    // Check authorization
    const isInitiator = groupBooking.initiatorId === req.user?.userId;
    const isParticipant = groupBooking.participants.some(
      (p) => p.farmerId === req.user?.userId
    );
    const isEquipmentOwner = groupBooking.equipment.ownerId === req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isInitiator && !isParticipant && !isEquipmentOwner && !isAdmin) {
      // If not involved and it's private, deny access
      if (!groupBooking.isPublic) {
        res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this group booking',
        });
        return;
      }
    }

    res.json({
      status: 'success',
      data: { groupBooking },
    });
  } catch (error) {
    console.error('Get group booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch group booking',
    });
  }
};

/**
 * Join a group booking
 * POST /api/group-bookings/:id/join
 */
export const joinGroupBooking = async (
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
    const { notes } = req.body;

    // Get group booking
    const groupBooking = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        equipment: true,
        participants: true,
      },
    });

    if (!groupBooking) {
      res.status(404).json({
        status: 'error',
        message: 'Group booking not found',
      });
      return;
    }

    // Check if group booking is still open
    if (groupBooking.status !== 'OPEN' && groupBooking.status !== 'FILLED') {
      res.status(400).json({
        status: 'error',
        message: 'This group booking is no longer accepting participants',
      });
      return;
    }

    // Check if group booking has expired
    if (groupBooking.expiresAt && new Date() > groupBooking.expiresAt) {
      res.status(400).json({
        status: 'error',
        message: 'This group booking has expired',
      });
      return;
    }

    // Check if already joined
    const existingParticipant = groupBooking.participants.find(
      (p) => p.farmerId === req.user!.userId
    );

    if (existingParticipant) {
      res.status(400).json({
        status: 'error',
        message: 'You have already joined this group booking',
      });
      return;
    }

    // Check if group is full
    if (groupBooking.participants.length >= groupBooking.maxParticipants) {
      res.status(400).json({
        status: 'error',
        message: 'This group booking is full',
      });
      return;
    }

    // Calculate share amount
    const currentParticipants = groupBooking.participants.length + 1;
    const shareAmount = Number(groupBooking.totalPrice) / currentParticipants;

    // Add participant
    const participant = await prisma.groupParticipant.create({
      data: {
        groupBookingId: id,
        farmerId: req.user.userId,
        shareAmount,
        notes: notes || null,
      },
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        groupBooking: {
          include: {
            equipment: true,
            initiator: true,
          },
        },
      },
    });

    // Recalculate share amounts for all participants
    await recalculateShareAmounts(id);

    // Update group booking status if full
    const updatedGroupBooking = await prisma.groupBooking.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (updatedGroupBooking && updatedGroupBooking.participants.length >= updatedGroupBooking.maxParticipants) {
      await prisma.groupBooking.update({
        where: { id },
        data: { status: 'FILLED' },
      });
    }

    // Notify group initiator
    const participantWithFarmer = participant as typeof participant & { farmer: { firstName: string; lastName: string } };
    await createNotification(
      groupBooking.initiatorId,
      'GROUP_BOOKING_JOINED',
      'New Participant Joined',
      `${participantWithFarmer.farmer.firstName} ${participantWithFarmer.farmer.lastName} has joined your group booking for ${groupBooking.equipment.name}`,
      { groupBookingId: id, participantId: participant.id }
    );

    res.status(201).json({
      status: 'success',
      message: 'Successfully joined group booking',
      data: { participant },
    });
  } catch (error) {
    console.error('Join group booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join group booking',
    });
  }
};

/**
 * Leave a group booking
 * DELETE /api/group-bookings/:id/leave
 */
export const leaveGroupBooking = async (
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

    // Find participant record
    const participant = await prisma.groupParticipant.findFirst({
      where: {
        groupBookingId: id,
        farmerId: req.user.userId,
      },
      include: {
        farmer: true,
        groupBooking: {
          include: {
            initiator: true,
            equipment: true,
          },
        },
      },
    });

    if (!participant) {
      res.status(404).json({
        status: 'error',
        message: 'You are not a participant of this group booking',
      });
      return;
    }

    // Check if already paid
    if (participant.paymentStatus === 'PAID') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot leave after payment. Please contact support for refund.',
      });
      return;
    }

    // Check if group booking is confirmed or active
    if (participant.groupBooking.status === 'CONFIRMED' || participant.groupBooking.status === 'ACTIVE') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot leave a confirmed or active group booking',
      });
      return;
    }

    // Remove participant
    await prisma.groupParticipant.delete({
      where: { id: participant.id },
    });

    // Recalculate share amounts for remaining participants
    await recalculateShareAmounts(id);

    // Update group booking status if no longer full
    await prisma.groupBooking.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    // Notify group initiator (fetch farmer separately for notification)
    const farmerInfo = await prisma.user.findUnique({
      where: { id: participant.farmerId }
    });

    if (farmerInfo) {
      await createNotification(
        participant.groupBooking.initiatorId,
        'GROUP_BOOKING_LEFT',
        'Participant Left',
        `${farmerInfo.firstName} ${farmerInfo.lastName} has left your group booking for ${participant.groupBooking.equipment.name}`,
        { groupBookingId: id }
      );
    }

    res.json({
      status: 'success',
      message: 'Successfully left group booking',
    });
  } catch (error) {
    console.error('Leave group booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave group booking',
    });
  }
};

/**
 * Update group booking status (equipment owner or admin)
 * PATCH /api/group-bookings/:id/status
 */
export const updateGroupBookingStatus = async (
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

    const validStatuses = ['OPEN', 'FILLED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
      return;
    }

    // Get group booking
    const groupBooking = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        equipment: true,
        participants: true,
      },
    });

    if (!groupBooking) {
      res.status(404).json({
        status: 'error',
        message: 'Group booking not found',
      });
      return;
    }

    // Check authorization (equipment owner or admin)
    if (
      groupBooking.equipment.ownerId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this group booking',
      });
      return;
    }

    // If confirming, check that minimum participants met and all paid
    if (status === 'CONFIRMED') {
      if (groupBooking.participants.length < groupBooking.minParticipants) {
        res.status(400).json({
          status: 'error',
          message: `Minimum ${groupBooking.minParticipants} participants required`,
        });
        return;
      }

      const allPaid = groupBooking.participants.every((p) => p.paymentStatus === 'PAID');
      if (!allPaid) {
        res.status(400).json({
          status: 'error',
          message: 'All participants must complete payment before confirmation',
        });
        return;
      }
    }

    // Update status
    const updateData: any = { status };
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const updatedGroupBooking = await prisma.groupBooking.update({
      where: { id },
      data: updateData,
      include: {
        equipment: true,
        initiator: true,
        participants: {
          include: {
            farmer: true,
          },
        },
      },
    });

    // Send notifications to all participants
    const notificationMessage =
      status === 'CONFIRMED'
        ? 'Your group booking has been confirmed by the equipment owner'
        : status === 'CANCELLED'
        ? 'Your group booking has been cancelled'
        : `Group booking status updated to ${status}`;

    for (const participant of updatedGroupBooking.participants) {
      await createNotification(
        participant.farmerId,
        `GROUP_BOOKING_${status}`,
        'Group Booking Update',
        notificationMessage,
        { groupBookingId: id }
      );
    }

    // Also notify initiator
    await createNotification(
      updatedGroupBooking.initiatorId,
      `GROUP_BOOKING_${status}`,
      'Group Booking Update',
      notificationMessage,
      { groupBookingId: id }
    );

    res.json({
      status: 'success',
      message: 'Group booking status updated successfully',
      data: { groupBooking: updatedGroupBooking },
    });
  } catch (error) {
    console.error('Update group booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update group booking status',
    });
  }
};

/**
 * Cancel group booking (initiator or admin)
 * PATCH /api/group-bookings/:id/cancel
 */
export const cancelGroupBooking = async (
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
    const { reason } = req.body;

    // Get group booking
    const groupBooking = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        equipment: true,
        participants: {
          include: {
            farmer: true,
          },
        },
      },
    });

    if (!groupBooking) {
      res.status(404).json({
        status: 'error',
        message: 'Group booking not found',
      });
      return;
    }

    // Check authorization (initiator or admin)
    if (
      groupBooking.initiatorId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to cancel this group booking',
      });
      return;
    }

    // Cannot cancel completed bookings
    if (groupBooking.status === 'COMPLETED') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot cancel a completed group booking',
      });
      return;
    }

    // Update status
    const updatedGroupBooking = await prisma.groupBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: reason ? `${groupBooking.notes || ''}\nCancellation reason: ${reason}` : groupBooking.notes,
      },
      include: {
        equipment: true,
        participants: {
          include: {
            farmer: true,
          },
        },
      },
    });

    // Notify all participants
    for (const participant of updatedGroupBooking.participants) {
      await createNotification(
        participant.farmerId,
        'GROUP_BOOKING_CANCELLED',
        'Group Booking Cancelled',
        `The group booking for ${groupBooking.equipment.name} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        { groupBookingId: id }
      );
    }

    res.json({
      status: 'success',
      message: 'Group booking cancelled successfully',
      data: { groupBooking: updatedGroupBooking },
    });
  } catch (error) {
    console.error('Cancel group booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel group booking',
    });
  }
};

/**
 * Get available group bookings for equipment
 * GET /api/group-bookings/available/:equipmentId
 */
export const getAvailableGroupBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { equipmentId } = req.params;
    const { startDate, endDate } = req.query;

    // Build where clause
    const where: any = {
      equipmentId,
      status: 'OPEN',
      isPublic: true,
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      where.AND = [
        { startDate: { gte: start } },
        { endDate: { lte: end } },
      ];
    }

    // Only show non-expired bookings
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ];

    const groupBookings = await prisma.groupBooking.findMany({
      where,
      include: {
        equipment: {
          include: {
            category: true,
          },
        },
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        participants: {
          select: {
            id: true,
            farmerId: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { groupBookings },
    });
  } catch (error) {
    console.error('Get available group bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available group bookings',
    });
  }
};

/**
 * Helper function to recalculate share amounts for all participants
 */
async function recalculateShareAmounts(groupBookingId: string): Promise<void> {
  const groupBooking = await prisma.groupBooking.findUnique({
    where: { id: groupBookingId },
    include: { participants: true },
  });

  if (!groupBooking) return;

  const participantCount = groupBooking.participants.length;
  if (participantCount === 0) return;

  const shareAmount = Number(groupBooking.totalPrice) / participantCount;

  // Update all participants
  await Promise.all(
    groupBooking.participants.map((participant) =>
      prisma.groupParticipant.update({
        where: { id: participant.id },
        data: { shareAmount },
      })
    )
  );
}
