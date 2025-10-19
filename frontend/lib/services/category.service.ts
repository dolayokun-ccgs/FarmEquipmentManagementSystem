import api from './api';
import { Category, ApiResponse } from '../types';

export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<{ categories: Category[]; count: number }>>(
      '/categories'
    );

    if (response.data.data?.categories) {
      return response.data.data.categories;
    }

    return [];
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<{ category: Category }>>(
      `/categories/${id}`
    );

    if (response.data.data?.category) {
      return response.data.data.category;
    }

    throw new Error('Category not found');
  },
};
