// Naploo Design System — White & Purple Premium Theme
export const Colors = {
  light: {
    primary: '#7c3aed',        // Vibrant purple
    primaryLight: '#a78bfa',   // Light purple
    primaryDark: '#6d28d9',    // Deep purple
    secondary: '#8b5cf6',      // Violet
    secondaryLight: '#c4b5fd', // Pale violet
    accent: '#06b6d4',         // Cyan accent
    accentLight: '#22d3ee',

    background: '#ffffff',
    surface: '#faf8ff',        // Very faint purple tint
    surfaceElevated: '#ffffff',
    card: '#ffffff',

    text: '#1e1b4b',          // Deep indigo-black
    textSecondary: '#4c1d95',  // Purple-tinted secondary
    textTertiary: '#a8a0c8',   // Muted purple-gray
    textInverse: '#ffffff',

    border: '#ede9fe',         // Light purple border
    borderLight: '#f5f3ff',    // Very light purple
    divider: '#ede9fe',

    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
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

    starFilled: '#f59e0b',
    starEmpty: '#ede9fe',

    badge: '#ef4444',
    badgeText: '#ffffff',
  },
  dark: {
    primary: '#a78bfa',        // Bright lilac in dark mode
    primaryLight: '#c4b5fd',
    primaryDark: '#8b5cf6',
    secondary: '#c4b5fd',
    secondaryLight: '#ddd6fe',
    accent: '#22d3ee',
    accentLight: '#67e8f9',

    background: '#0f0a1e',     // Deep purple-black
    surface: '#1a1333',        // Dark purple surface
    surfaceElevated: '#2d2450', // Elevated purple
    card: '#1a1333',

    text: '#f5f3ff',
    textSecondary: '#c4b5fd',
    textTertiary: '#7c6fad',
    textInverse: '#0f0a1e',

    border: '#2d2450',
    borderLight: '#1a1333',
    divider: '#2d2450',

    success: '#34d399',
    successLight: '#064e3b',
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

    starFilled: '#fbbf24',
    starEmpty: '#2d2450',

    badge: '#ef4444',
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
  '5xl': 48,
  '6xl': 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
