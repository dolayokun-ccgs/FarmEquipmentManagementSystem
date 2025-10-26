import { create } from 'zustand';
import { Equipment, EquipmentFilters, PaginatedResponse } from '../types';
import { equipmentService } from '../services/equipment.service';

interface EquipmentState {
  equipment: Equipment[];
  currentEquipment: Equipment | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEquipment: (filters?: EquipmentFilters) => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<void>;
  createEquipment: (data: any) => Promise<Equipment>;
  updateEquipment: (id: string, data: any) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  fetchMyEquipment: (page?: number, limit?: number) => Promise<void>;
  clearCurrentEquipment: () => void;
  clearError: () => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: [],
  currentEquipment: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  fetchEquipment: async (filters?: EquipmentFilters) => {
    console.log('[Equipment Store] Fetching equipment...');
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<Equipment> = await equipmentService.getAll(filters);
      console.log('[Equipment Store] Setting state with:', response);
      set({
        equipment: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
      console.log('[Equipment Store] State updated successfully');
    } catch (error: any) {
      console.error('[Equipment Store] Error fetching equipment:', error);
      set({
        error: error.message || 'Failed to fetch equipment',
        isLoading: false,
      });
    }
  },

  fetchEquipmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const equipment = await equipmentService.getById(id);
      set({ currentEquipment: equipment, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch equipment details',
        isLoading: false,
      });
    }
  },

  createEquipment: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const equipment = await equipmentService.create(data);
      set((state) => ({
        equipment: [equipment, ...state.equipment],
        isLoading: false,
      }));
      return equipment;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create equipment',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEquipment: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const equipment = await equipmentService.update(id, data);
      set((state) => ({
        equipment: state.equipment.map((e) => (e.id === id ? equipment : e)),
        currentEquipment: state.currentEquipment?.id === id ? equipment : state.currentEquipment,
        isLoading: false,
      }));
      return equipment;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update equipment',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEquipment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await equipmentService.delete(id);
      set((state) => ({
        equipment: state.equipment.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete equipment',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMyEquipment: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipmentService.getMyEquipment(page, limit);
      set({
        equipment: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch your equipment',
        isLoading: false,
      });
    }
  },

  clearCurrentEquipment: () => {
    set({ currentEquipment: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
