import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => {
    SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    SecureStore.setItemAsync('user', JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    SecureStore.deleteItemAsync('user');
    SecureStore.deleteItemAsync('accessToken');
    SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('accessToken');
      if (userStr && token) {
        set({ user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch {
      // Ignore parse errors
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));
