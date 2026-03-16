import { create } from 'zustand';
import { Appearance } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getEffectiveScheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  setMode: (mode) => set({ mode }),
  getEffectiveScheme: () => {
    const { mode } = get();
    if (mode === 'system') {
      return (Appearance.getColorScheme() as 'light' | 'dark') ?? 'light';
    }
    return mode;
  },
}));
