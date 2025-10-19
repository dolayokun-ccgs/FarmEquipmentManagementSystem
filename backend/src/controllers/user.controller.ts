import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const { page = '1', limit = '20', role, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          state: true,
          lga: true,
          role: true,
          isVerified: true,
          profileImage: true,
          createdAt: true,
          lastLogin: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        state: true,
        lga: true,
        role: true,
        isVerified: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
    });
  }
};

/**
 * Update user (Admin only)
 * PATCH /api/users/:id
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const { id } = req.params;
    const { firstName, lastName, phoneNumber, state, lga, role, isVerified } =
      req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        state: state || existingUser.state,
        lga: lga || existingUser.lga,
        role: role || existingUser.role,
        isVerified: isVerified !== undefined ? isVerified : existingUser.isVerified,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        state: true,
        lga: true,
        role: true,
        isVerified: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
    });
  }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.userId) {
      res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account',
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
    });
  }
};

/**
 * Create new user (Admin only)
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      state,
      lga,
      role,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({
        status: 'error',
        message: 'Email, password, first name, last name, and role are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        state,
        lga,
        role,
        isVerified: true, // Admin-created users are auto-verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        state: true,
        lga: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user: newUser },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
    });
  }
};

/**
 * Get user statistics (Admin only)
 * GET /api/users/stats/summary
 */
export const getUserStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
      return;
    }

    const [
      totalUsers,
      totalFarmers,
      totalPlatformOwners,
      totalAdmins,
      verifiedUsers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'PLATFORM_OWNER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        byRole: {
          farmers: totalFarmers,
          platformOwners: totalPlatformOwners,
          admins: totalAdmins,
        },
        verifiedUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics',
    });
  }
};
