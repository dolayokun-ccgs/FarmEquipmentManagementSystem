import { create } from 'zustand';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    state?: string;
    lga?: string;
    profileImage?: string;
  }) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getUserFromStorage(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      const token = authService.getToken();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.register(data);
      const token = authService.getToken();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUser: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      const token = authService.getToken();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    state?: string;
    lga?: string;
    profileImage?: string;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.updateProfile(data);
      const token = authService.getToken();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    const token = user ? authService.getToken() : null;
    set({ user, token, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
