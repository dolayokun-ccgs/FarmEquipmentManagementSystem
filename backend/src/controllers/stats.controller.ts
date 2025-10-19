import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get dashboard statistics for platform owners and admins
 * GET /api/stats/dashboard
 */
export const getDashboardStats = async (
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

    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build where clause based on user role
    const equipmentWhere = userRole === 'PLATFORM_OWNER' ? { ownerId: userId } : {};
    const bookingWhere =
      userRole === 'PLATFORM_OWNER'
        ? { equipment: { ownerId: userId } }
        : {};

    // Get statistics
    const [
      totalEquipment,
      availableEquipment,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      thisMonthRevenue,
      totalFarmers,
    ] = await Promise.all([
      // Total equipment
      prisma.equipment.count({ where: equipmentWhere }),

      // Available equipment
      prisma.equipment.count({
        where: { ...equipmentWhere, isAvailable: true },
      }),

      // Total bookings
      prisma.booking.count({ where: bookingWhere }),

      // Pending bookings
      prisma.booking.count({
        where: { ...bookingWhere, status: 'PENDING' },
      }),

      // Confirmed bookings
      prisma.booking.count({
        where: { ...bookingWhere, status: 'CONFIRMED' },
      }),

      // Active bookings
      prisma.booking.count({
        where: { ...bookingWhere, status: 'ACTIVE' },
      }),

      // Completed bookings
      prisma.booking.count({
        where: { ...bookingWhere, status: 'COMPLETED' },
      }),

      // Cancelled bookings
      prisma.booking.count({
        where: { ...bookingWhere, status: 'CANCELLED' },
      }),

      // Total revenue (from completed bookings)
      prisma.booking.aggregate({
        where: { ...bookingWhere, status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),

      // This month revenue
      prisma.booking.aggregate({
        where: {
          ...bookingWhere,
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalPrice: true },
      }),

      // Total unique farmers (for platform owners/admins)
      userRole === 'FARMER'
        ? 0
        : prisma.booking
            .findMany({
              where: bookingWhere,
              select: { farmerId: true },
              distinct: ['farmerId'],
            })
            .then((bookings) => bookings.length),
    ]);

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: bookingWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            images: true,
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

    // Get top performing equipment
    const topEquipment = await prisma.equipment.findMany({
      where: equipmentWhere,
      take: 5,
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          where: { status: 'COMPLETED' },
          select: { totalPrice: true },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
    });

    // Calculate revenue for top equipment
    const topEquipmentWithRevenue = topEquipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      images: eq.images,
      totalBookings: eq._count.bookings,
      totalRevenue: eq.bookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0
      ),
    }));

    // Get all bookings from last 6 months to calculate trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentBookingsForTrends = await prisma.booking.findMany({
      where: {
        ...bookingWhere,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
        totalPrice: true,
      },
    });

    // Group by month manually
    const monthlyData: { [key: string]: { count: number; revenue: number } } =
      {};

    recentBookingsForTrends.forEach((booking) => {
      const month = `${booking.createdAt.getFullYear()}-${String(
        booking.createdAt.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, revenue: 0 };
      }

      monthlyData[month].count++;
      if (booking.status === 'COMPLETED') {
        monthlyData[month].revenue += Number(booking.totalPrice);
      }
    });

    // Convert to array and sort
    const monthlyBookings = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalEquipment,
          availableEquipment,
          totalBookings,
          totalFarmers,
          totalRevenue: Number(totalRevenue._sum.totalPrice) || 0,
          thisMonthRevenue: Number(thisMonthRevenue._sum.totalPrice) || 0,
        },
        bookings: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        recentBookings,
        topEquipment: topEquipmentWithRevenue,
        trends: {
          monthly: monthlyBookings,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
    });
  }
};
