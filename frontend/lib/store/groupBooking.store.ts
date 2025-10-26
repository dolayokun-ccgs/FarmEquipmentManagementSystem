import { create } from 'zustand';
import {
  GroupBooking,
  CreateGroupBookingData,
  JoinGroupBookingData,
  GroupBookingStatus,
  PaginatedResponse,
} from '../types';
import { groupBookingService } from '../services/groupBooking.service';

interface GroupBookingState {
  groupBookings: GroupBooking[];
  currentGroupBooking: GroupBooking | null;
  availableGroupBookings: GroupBooking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGroupBookings: (
    page?: number,
    limit?: number,
    status?: GroupBookingStatus,
    equipmentId?: string
  ) => Promise<void>;
  fetchGroupBookingById: (id: string) => Promise<void>;
  createGroupBooking: (data: CreateGroupBookingData) => Promise<GroupBooking>;
  joinGroupBooking: (id: string, data?: JoinGroupBookingData) => Promise<void>;
  leaveGroupBooking: (id: string) => Promise<void>;
  updateGroupBookingStatus: (id: string, status: GroupBookingStatus) => Promise<GroupBooking>;
  cancelGroupBooking: (id: string, reason?: string) => Promise<GroupBooking>;
  fetchAvailableGroupBookings: (
    equipmentId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  clearCurrentGroupBooking: () => void;
  clearError: () => void;
}

export const useGroupBookingStore = create<GroupBookingState>((set) => ({
  groupBookings: [],
  currentGroupBooking: null,
  availableGroupBookings: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  fetchGroupBookings: async (
    page = 1,
    limit = 20,
    status?: GroupBookingStatus,
    equipmentId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<GroupBooking> = await groupBookingService.getAll(
        page,
        limit,
        status,
        equipmentId
      );
      set({
        groupBookings: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch group bookings',
        isLoading: false,
      });
    }
  },

  fetchGroupBookingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const groupBooking = await groupBookingService.getById(id);
      set({ currentGroupBooking: groupBooking, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch group booking details',
        isLoading: false,
      });
    }
  },

  createGroupBooking: async (data: CreateGroupBookingData) => {
    set({ isLoading: true, error: null });
    try {
      const groupBooking = await groupBookingService.create(data);
      set((state) => ({
        groupBookings: [groupBooking, ...state.groupBookings],
        currentGroupBooking: groupBooking,
        isLoading: false,
      }));
      return groupBooking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create group booking',
        isLoading: false,
      });
      throw error;
    }
  },

  joinGroupBooking: async (id: string, data?: JoinGroupBookingData) => {
    set({ isLoading: true, error: null });
    try {
      await groupBookingService.join(id, data);
      // Refresh the current group booking to get updated participant list
      const groupBooking = await groupBookingService.getById(id);
      set({ currentGroupBooking: groupBooking, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to join group booking',
        isLoading: false,
      });
      throw error;
    }
  },

  leaveGroupBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupBookingService.leave(id);
      // Refresh the current group booking
      const groupBooking = await groupBookingService.getById(id);
      set({ currentGroupBooking: groupBooking, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to leave group booking',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGroupBookingStatus: async (id: string, status: GroupBookingStatus) => {
    set({ isLoading: true, error: null });
    try {
      const groupBooking = await groupBookingService.updateStatus(id, status);
      set((state) => ({
        groupBookings: state.groupBookings.map((gb) =>
          gb.id === id ? groupBooking : gb
        ),
        currentGroupBooking:
          state.currentGroupBooking?.id === id ? groupBooking : state.currentGroupBooking,
        isLoading: false,
      }));
      return groupBooking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update group booking status',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelGroupBooking: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const groupBooking = await groupBookingService.cancel(id, reason);
      set((state) => ({
        groupBookings: state.groupBookings.map((gb) =>
          gb.id === id ? groupBooking : gb
        ),
        currentGroupBooking:
          state.currentGroupBooking?.id === id ? groupBooking : state.currentGroupBooking,
        isLoading: false,
      }));
      return groupBooking;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel group booking',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchAvailableGroupBookings: async (
    equipmentId: string,
    startDate?: string,
    endDate?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const groupBookings = await groupBookingService.getAvailableForEquipment(
        equipmentId,
        startDate,
        endDate
      );
      set({
        availableGroupBookings: groupBookings,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch available group bookings',
        isLoading: false,
      });
    }
  },

  clearCurrentGroupBooking: () => {
    set({ currentGroupBooking: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
