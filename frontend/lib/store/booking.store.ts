import { create } from 'zustand';
import { Booking, CreateBookingData, BookingStatus, PaginatedResponse } from '../types';
import { bookingService } from '../services/booking.service';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBookings: (page?: number, limit?: number, status?: BookingStatus, equipmentId?: string) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (data: CreateBookingData) => Promise<Booking>;
  updateBooking: (id: string, data: { startDate?: string; endDate?: string; notes?: string }) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Booking>;
  cancelBooking: (id: string, reason?: string) => Promise<Booking>;
  checkAvailability: (equipmentId: string, startDate?: string, endDate?: string) => Promise<any>;
  clearCurrentBooking: () => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  fetchBookings: async (page = 1, limit = 20, status?: BookingStatus, equipmentId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<Booking> = await bookingService.getAll(page, limit, status, equipmentId);
      set({
        bookings: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch bookings',
        isLoading: false,
      });
    }
  },

  fetchBookingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.getById(id);
      set({ currentBooking: booking, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch booking details',
        isLoading: false,
      });
    }
  },

  createBooking: async (data: CreateBookingData) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.create(data);
      set((state) => ({
        bookings: [booking, ...state.bookings],
        currentBooking: booking,
        isLoading: false,
      }));
      return booking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create booking',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBooking: async (id: string, data: { startDate?: string; endDate?: string; notes?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.update(id, data);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
        currentBooking: state.currentBooking?.id === id ? booking : state.currentBooking,
        isLoading: false,
      }));
      return booking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update booking',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await bookingService.delete(id);
      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        currentBooking: state.currentBooking?.id === id ? null : state.currentBooking,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete booking',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBookingStatus: async (id: string, status: BookingStatus) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.updateStatus(id, status);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
        currentBooking: state.currentBooking?.id === id ? booking : state.currentBooking,
        isLoading: false,
      }));
      return booking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update booking status',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelBooking: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.cancel(id, reason);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
        currentBooking: state.currentBooking?.id === id ? booking : state.currentBooking,
        isLoading: false,
      }));
      return booking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel booking',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAvailability: async (equipmentId: string, startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const availability = await bookingService.checkAvailability(equipmentId, startDate, endDate);
      set({ isLoading: false });
      return availability;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to check availability',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentBooking: () => {
    set({ currentBooking: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
