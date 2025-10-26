import api from './api';
import {
  GroupBooking,
  CreateGroupBookingData,
  JoinGroupBookingData,
  GroupBookingStatus,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const groupBookingService = {
  /**
   * Create a new group booking
   */
  create: async (data: CreateGroupBookingData): Promise<GroupBooking> => {
    const response = await api.post<ApiResponse<{ groupBooking: GroupBooking }>>(
      '/group-bookings',
      data
    );

    if (response.data.data?.groupBooking) {
      return response.data.data.groupBooking;
    }

    throw new Error('Failed to create group booking');
  },

  /**
   * Get all group bookings (filtered by user role)
   */
  getAll: async (
    page = 1,
    limit = 20,
    status?: GroupBookingStatus,
    equipmentId?: string
  ): Promise<PaginatedResponse<GroupBooking>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<GroupBooking>>>(
      '/group-bookings',
      { params: { page, limit, status, equipmentId } }
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
   * Get a group booking by ID
   */
  getById: async (id: string): Promise<GroupBooking> => {
    const response = await api.get<ApiResponse<{ groupBooking: GroupBooking }>>(
      `/group-bookings/${id}`
    );

    if (response.data.data?.groupBooking) {
      return response.data.data.groupBooking;
    }

    throw new Error('Group booking not found');
  },

  /**
   * Join a group booking
   */
  join: async (id: string, data?: JoinGroupBookingData): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(
      `/group-bookings/${id}/join`,
      data || {}
    );

    if (response.data.data) {
      return response.data.data;
    }

    throw new Error('Failed to join group booking');
  },

  /**
   * Leave a group booking
   */
  leave: async (id: string): Promise<void> => {
    await api.delete(`/group-bookings/${id}/leave`);
  },

  /**
   * Update group booking status (owner/admin only)
   */
  updateStatus: async (id: string, status: GroupBookingStatus): Promise<GroupBooking> => {
    const response = await api.patch<ApiResponse<{ groupBooking: GroupBooking }>>(
      `/group-bookings/${id}/status`,
      { status }
    );

    if (response.data.data?.groupBooking) {
      return response.data.data.groupBooking;
    }

    throw new Error('Failed to update group booking status');
  },

  /**
   * Cancel a group booking (initiator/admin only)
   */
  cancel: async (id: string, reason?: string): Promise<GroupBooking> => {
    const response = await api.patch<ApiResponse<{ groupBooking: GroupBooking }>>(
      `/group-bookings/${id}/cancel`,
      { reason }
    );

    if (response.data.data?.groupBooking) {
      return response.data.data.groupBooking;
    }

    throw new Error('Failed to cancel group booking');
  },

  /**
   * Get available group bookings for equipment
   */
  getAvailableForEquipment: async (
    equipmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<GroupBooking[]> => {
    const response = await api.get<ApiResponse<{ groupBookings: GroupBooking[] }>>(
      `/group-bookings/available/${equipmentId}`,
      { params: { startDate, endDate } }
    );

    if (response.data.data?.groupBookings) {
      return response.data.data.groupBookings;
    }

    return [];
  },

  /**
   * Initialize payment for group booking participant
   */
  initializePayment: async (groupBookingId: string, email: string, token: string): Promise<{
    authorization_url: string;
    reference: string;
    amount: number;
  }> => {
    const response = await api.post<{
      success: boolean;
      data: {
        authorization_url: string;
        reference: string;
        amount: number;
      };
    }>(
      '/payments/initialize-group',
      { groupBookingId, email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Failed to initialize payment');
  },

  /**
   * Verify group booking payment
   */
  verifyPayment: async (reference: string): Promise<any> => {
    const response = await api.get<{
      success: boolean;
      data: any;
    }>(`/payments/verify-group/${reference}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Payment verification failed');
  },
};
