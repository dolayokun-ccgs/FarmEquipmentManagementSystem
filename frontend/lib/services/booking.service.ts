import api from './api';
import {
  Booking,
  CreateBookingData,
  BookingStatus,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const bookingService = {
  /**
   * Create a new booking
   */
  create: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post<ApiResponse<{ booking: Booking }>>(
      '/bookings',
      data
    );

    if (response.data.data?.booking) {
      return response.data.data.booking;
    }

    throw new Error('Failed to create booking');
  },

  /**
   * Get all bookings (filtered by user role)
   */
  getAll: async (
    page = 1,
    limit = 20,
    status?: BookingStatus,
    equipmentId?: string
  ): Promise<PaginatedResponse<Booking>> => {
    console.log('[Booking Service] Fetching bookings with params:', { page, limit, status, equipmentId });
    const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      '/bookings',
      { params: { page, limit, status, equipmentId } }
    );

    console.log('[Booking Service] Raw response:', response.data);

    if (response.data.data) {
      const result = {
        data: response.data.data.bookings || response.data.data.data || [],
        pagination: response.data.data.pagination,
      };
      console.log('[Booking Service] Parsed result:', result);
      return result;
    }

    console.log('[Booking Service] No data found, returning empty');
    return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}`
    );

    if (response.data.data?.booking) {
      return response.data.data.booking;
    }

    throw new Error('Booking not found');
  },

  /**
   * Update booking status (equipment owner)
   */
  updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    const response = await api.patch<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}/status`,
      { status }
    );

    if (response.data.data?.booking) {
      return response.data.data.booking;
    }

    throw new Error('Failed to update booking status');
  },

  /**
   * Update booking (farmer - only if payment is PENDING)
   */
  update: async (
    id: string,
    data: { startDate?: string; endDate?: string; notes?: string }
  ): Promise<Booking> => {
    console.log('[Booking Service] Updating booking:', id, data);
    const response = await api.patch<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}`,
      data
    );

    if (response.data.data?.booking) {
      return response.data.data.booking;
    }

    throw new Error('Failed to update booking');
  },

  /**
   * Delete booking (farmer - only if payment is PENDING)
   */
  delete: async (id: string): Promise<void> => {
    console.log('[Booking Service] Deleting booking:', id);
    const response = await api.delete<ApiResponse<void>>(
      `/bookings/${id}`
    );

    if (response.data.status === 'success') {
      return;
    }

    throw new Error('Failed to delete booking');
  },

  /**
   * Cancel booking (farmer)
   */
  cancel: async (id: string, cancellationReason?: string): Promise<Booking> => {
    const response = await api.patch<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}/cancel`,
      { cancellationReason }
    );

    if (response.data.data?.booking) {
      return response.data.data.booking;
    }

    throw new Error('Failed to cancel booking');
  },

  /**
   * Get equipment availability
   */
  checkAvailability: async (
    equipmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    equipmentId: string;
    bookedDates: Array<{ id: string; startDate: string; endDate: string; status: string }>;
    isAvailable: boolean;
  }> => {
    const response = await api.get(
      `/bookings/availability/${equipmentId}`,
      { params: { startDate, endDate } }
    );

    if (response.data.data) {
      return response.data.data;
    }

    throw new Error('Failed to check availability');
  },
};
