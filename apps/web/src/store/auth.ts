import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      
      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'naploo-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
