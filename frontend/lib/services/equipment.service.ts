import api from './api';
import {
  Equipment,
  CreateEquipmentData,
  EquipmentFilters,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const equipmentService = {
  /**
   * Get all equipment with filters
   */
  getAll: async (filters?: EquipmentFilters): Promise<PaginatedResponse<Equipment>> => {
    console.log('[Equipment Service] Fetching equipment with filters:', filters);
    const response = await api.get<any>(
      '/equipment',
      { params: filters }
    );

    console.log('[Equipment Service] Raw response:', response.data);

    if (response.data.data) {
      // Backend returns { status, data: { equipment: [], pagination: {} } }
      const result = {
        data: response.data.data.equipment || response.data.data.data || [],
        pagination: response.data.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      console.log('[Equipment Service] Parsed result:', result);
      return result;
    }

    console.log('[Equipment Service] No data found, returning empty');
    return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Get equipment by ID
   */
  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get<ApiResponse<{ equipment: Equipment }>>(
      `/equipment/${id}`
    );

    if (response.data.data?.equipment) {
      return response.data.data.equipment;
    }

    throw new Error('Equipment not found');
  },

  /**
   * Create new equipment
   */
  create: async (data: CreateEquipmentData): Promise<Equipment> => {
    const response = await api.post<ApiResponse<{ equipment: Equipment }>>(
      '/equipment',
      data
    );

    if (response.data.data?.equipment) {
      return response.data.data.equipment;
    }

    throw new Error('Failed to create equipment');
  },

  /**
   * Update equipment
   */
  update: async (id: string, data: Partial<CreateEquipmentData>): Promise<Equipment> => {
    const response = await api.put<ApiResponse<{ equipment: Equipment }>>(
      `/equipment/${id}`,
      data
    );

    if (response.data.data?.equipment) {
      return response.data.data.equipment;
    }

    throw new Error('Failed to update equipment');
  },

  /**
   * Delete equipment
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },

  /**
   * Get current user's equipment
   */
  getMyEquipment: async (page = 1, limit = 20): Promise<PaginatedResponse<Equipment>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Equipment>>>(
      '/equipment/my-equipment',
      { params: { page, limit } }
    );

    if (response.data.data) {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    }

    return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Get equipment by owner ID
   */
  getByOwner: async (
    ownerId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Equipment>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Equipment>>>(
      `/equipment/owner/${ownerId}`,
      { params: { page, limit } }
    );

    if (response.data.data) {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    }

    return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },
};
