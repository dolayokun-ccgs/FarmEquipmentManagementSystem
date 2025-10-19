import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get all equipment with filters and pagination
 * GET /api/equipment
 */
export const getAllEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      locationState,
      minPrice,
      maxPrice,
      condition,
      isAvailable,
      search,
      tags,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build filter conditions
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (locationState) {
      where.locationState = locationState as string;
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = Number(minPrice);
      if (maxPrice) where.pricePerDay.lte = Number(maxPrice);
    }

    if (condition) {
      where.condition = condition as string;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    if (tags) {
      // Filter by tags - tags is a JSON string array, check if it contains the requested tag
      where.tags = { contains: tags as string };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { locationCity: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get equipment with pagination
    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: {
            select: { id: true, name: true, iconUrl: true },
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.equipment.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        equipment,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch equipment',
    });
  }
};

/**
 * Get equipment by ID
 * GET /api/equipment/:id
 */
export const getEquipmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
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
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!equipment) {
      res.status(404).json({
        status: 'error',
        message: 'Equipment not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { equipment },
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch equipment',
    });
  }
};

/**
 * Create new equipment
 * POST /api/equipment
 */
export const createEquipment = async (
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

    // Only platform owners can create equipment
    if (req.user.role !== 'PLATFORM_OWNER' && req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Only platform owners can create equipment',
      });
      return;
    }

    const {
      name,
      description,
      categoryId,
      pricePerDay,
      currency,
      condition,
      locationAddress,
      locationCity,
      locationState,
      locationCountry,
      latitude,
      longitude,
      images,
      specifications,
      tags,
    } = req.body;

    // Validate required fields
    if (!name || !categoryId || !pricePerDay) {
      res.status(400).json({
        status: 'error',
        message: 'Name, category, and price are required',
      });
      return;
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
      return;
    }

    // Create equipment
    const equipment = await prisma.equipment.create({
      data: {
        ownerId: req.user.userId,
        name,
        description: description || null,
        categoryId,
        pricePerDay: Number(pricePerDay),
        currency: currency || 'NGN',
        condition: condition || 'GOOD',
        locationAddress: locationAddress || null,
        locationCity: locationCity || null,
        locationState: locationState || null,
        locationCountry: locationCountry || 'Nigeria',
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        images: images || null,
        specifications: specifications || null,
        tags: tags || null,
      },
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
    });

    res.status(201).json({
      status: 'success',
      message: 'Equipment created successfully',
      data: { equipment },
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create equipment',
    });
  }
};

/**
 * Update equipment
 * PUT /api/equipment/:id
 */
export const updateEquipment = async (
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

    // Check if equipment exists and user is the owner
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      res.status(404).json({
        status: 'error',
        message: 'Equipment not found',
      });
      return;
    }

    // Only the owner or admin can update
    if (
      existingEquipment.ownerId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({
        status: 'error',
        message: 'You can only update your own equipment',
      });
      return;
    }

    const {
      name,
      description,
      categoryId,
      pricePerDay,
      currency,
      condition,
      locationAddress,
      locationCity,
      locationState,
      locationCountry,
      latitude,
      longitude,
      isAvailable,
      images,
      specifications,
      tags,
    } = req.body;

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(pricePerDay && { pricePerDay: Number(pricePerDay) }),
        ...(currency && { currency }),
        ...(condition && { condition }),
        ...(locationAddress !== undefined && { locationAddress }),
        ...(locationCity !== undefined && { locationCity }),
        ...(locationState !== undefined && { locationState }),
        ...(locationCountry && { locationCountry }),
        ...(latitude !== undefined && { latitude: latitude ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? Number(longitude) : null }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(images !== undefined && { images }),
        ...(specifications !== undefined && { specifications }),
        ...(tags !== undefined && { tags }),
      },
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
    });

    res.status(200).json({
      status: 'success',
      message: 'Equipment updated successfully',
      data: { equipment },
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update equipment',
    });
  }
};

/**
 * Delete equipment
 * DELETE /api/equipment/:id
 */
export const deleteEquipment = async (
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

    // Check if equipment exists and user is the owner
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] },
          },
        },
      },
    });

    if (!equipment) {
      res.status(404).json({
        status: 'error',
        message: 'Equipment not found',
      });
      return;
    }

    // Only the owner or admin can delete
    if (equipment.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You can only delete your own equipment',
      });
      return;
    }

    // Check for active bookings
    if (equipment.bookings.length > 0) {
      res.status(400).json({
        status: 'error',
        message: 'Cannot delete equipment with active bookings',
      });
      return;
    }

    // Delete equipment
    await prisma.equipment.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Equipment deleted successfully',
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete equipment',
    });
  }
};

/**
 * Get equipment by owner
 * GET /api/equipment/owner/:ownerId
 */
export const getEquipmentByOwner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where: { ownerId },
        skip,
        take: Number(limit),
        include: {
          category: true,
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.equipment.count({ where: { ownerId } }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        equipment,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get owner equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch owner equipment',
    });
  }
};

/**
 * Get my equipment (current user's equipment)
 * GET /api/equipment/my-equipment
 */
export const getMyEquipment = async (
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

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where: { ownerId: req.user.userId },
        skip,
        take: Number(limit),
        include: {
          category: true,
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.equipment.count({ where: { ownerId: req.user.userId } }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        equipment,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get my equipment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch equipment',
    });
  }
};
