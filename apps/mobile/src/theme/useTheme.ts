import { useColorScheme } from 'react-native';
import { Colors } from './index';
import { useThemeStore } from '@/store/theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();
  const effectiveScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return { colors, isDark, colorScheme: effectiveScheme };
}
