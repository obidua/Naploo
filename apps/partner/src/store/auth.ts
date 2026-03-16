import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, Partner } from '@/types';

interface AuthState {
  user: User | null;
  partner: Partner | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User) => void;
  setPartner: (partner: Partner) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  partner: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => {
    SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setPartner: (partner) => {
    SecureStore.setItemAsync('partner', JSON.stringify(partner));
    set({ partner });
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
    SecureStore.deleteItemAsync('partner');
    SecureStore.deleteItemAsync('accessToken');
    SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, partner: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      const partnerStr = await SecureStore.getItemAsync('partner');
      const token = await SecureStore.getItemAsync('accessToken');
      if (userStr && token) {
        set({
          user: JSON.parse(userStr),
          partner: partnerStr ? JSON.parse(partnerStr) : null,
          isAuthenticated: true,
        });
      }
    } catch {
      // Ignore
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));
