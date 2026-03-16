import { useColorScheme } from 'react-native';
import { Colors } from './index';
import { useThemeStore } from '@/store/theme';

export function useTheme() {
  const systemScheme = useColorScheme() ?? 'light';
  const { mode } = useThemeStore();
  const scheme = mode === 'system' ? systemScheme : mode;
  const isDark = scheme === 'dark';
  const colors = Colors[scheme];

  return { colors, isDark, scheme };
}
