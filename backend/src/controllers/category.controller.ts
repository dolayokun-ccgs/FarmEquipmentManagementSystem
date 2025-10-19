import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: {
          select: { equipment: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: { categories, count: categories.length },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories',
    });
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        equipment: {
          take: 10,
          where: { isAvailable: true },
        },
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category',
    });
  }
};

/**
 * Create a new category (Admin only)
 * POST /api/categories
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, iconUrl, parentId } = req.body;

    if (!name) {
      res.status(400).json({
        status: 'error',
        message: 'Category name is required',
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        iconUrl: iconUrl || null,
        parentId: parentId || null,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create category',
    });
  }
};
