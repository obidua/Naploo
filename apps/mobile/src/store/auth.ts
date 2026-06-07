import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: User) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  // Persist the user record (awaited) so that closing the app immediately
  // after login can never lose the session. The token itself is already
  // awaited inside services/api.ts setTokens().
  setUser: async (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch {
      // ignore — token already persisted; profile will refetch on next call
    }
  },

  updateUser: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    set({ user: updated });
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(updated));
    } catch {}
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    await Promise.all([
      SecureStore.deleteItemAsync('user').catch(() => {}),
      SecureStore.deleteItemAsync('accessToken').catch(() => {}),
      SecureStore.deleteItemAsync('refreshToken').catch(() => {}),
    ]);
  },

  setLoading: (isLoading) => set({ isLoading }),

  // Rehydrate the session on cold start. We treat the local user + token as
  // the source of truth and only mark the session as authenticated if both
  // exist. Network failures (e.g. offline) must NOT log the user out — the
  // backend /auth/me check is intentionally not performed here.
  hydrate: async () => {
    try {
      const [userStr, token] = await Promise.all([
        SecureStore.getItemAsync('user'),
        SecureStore.getItemAsync('accessToken'),
      ]);
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true });
        } catch {
          // Corrupted blob — drop it but keep the token so the next API
          // call can still authenticate and refresh the profile.
          await SecureStore.deleteItemAsync('user').catch(() => {});
        }
      }
    } catch {
      // Ignore SecureStore failures so the app still boots.
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },
}));
