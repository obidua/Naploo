// Naploo Partner Design System — White & Purple Professional Theme
export const Colors = {
  light: {
    primary: '#7c3aed',        // Vibrant purple (same brand)
    primaryLight: '#a78bfa',
    primaryDark: '#6d28d9',
    secondary: '#8b5cf6',
    secondaryLight: '#c4b5fd',
    accent: '#0d9488',
    accentLight: '#14b8a6',

    background: '#ffffff',
    surface: '#faf8ff',
    surfaceElevated: '#ffffff',
    card: '#ffffff',

    text: '#1e1b4b',
    textSecondary: '#4c1d95',
    textTertiary: '#a8a0c8',
    textInverse: '#ffffff',

    border: '#ede9fe',
    borderLight: '#f5f3ff',
    divider: '#ede9fe',

    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#d97706',
    warningLight: '#fef3c7',
    error: '#dc2626',
    errorLight: '#fee2e2',
    info: '#2563eb',
    infoLight: '#dbeafe',

    inputBg: '#faf8ff',
    inputBorder: '#ddd6fe',
    inputFocus: '#7c3aed',

    tabBar: '#ffffff',
    tabBarBorder: '#ede9fe',
    tabActive: '#7c3aed',
    tabInactive: '#a8a0c8',

    skeleton: '#ede9fe',
    overlay: 'rgba(30, 27, 75, 0.5)',

    badge: '#dc2626',
    badgeText: '#ffffff',
  },
  dark: {
    primary: '#a78bfa',
    primaryLight: '#c4b5fd',
    primaryDark: '#8b5cf6',
    secondary: '#c4b5fd',
    secondaryLight: '#ddd6fe',
    accent: '#14b8a6',
    accentLight: '#2dd4bf',

    background: '#0f0a1e',
    surface: '#1a1333',
    surfaceElevated: '#2d2450',
    card: '#1a1333',

    text: '#f5f3ff',
    textSecondary: '#c4b5fd',
    textTertiary: '#7c6fad',
    textInverse: '#0f0a1e',

    border: '#2d2450',
    borderLight: '#1a1333',
    divider: '#2d2450',

    success: '#4ade80',
    successLight: '#14532d',
    warning: '#fbbf24',
    warningLight: '#78350f',
    error: '#f87171',
    errorLight: '#7f1d1d',
    info: '#60a5fa',
    infoLight: '#1e3a5f',

    inputBg: '#1a1333',
    inputBorder: '#2d2450',
    inputFocus: '#a78bfa',

    tabBar: '#1a1333',
    tabBarBorder: '#2d2450',
    tabActive: '#a78bfa',
    tabInactive: '#7c6fad',

    skeleton: '#2d2450',
    overlay: 'rgba(0, 0, 0, 0.7)',

    badge: '#dc2626',
    badgeText: '#ffffff',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export function useColors(scheme: 'light' | 'dark' = 'light') {
  return Colors[scheme];
}
