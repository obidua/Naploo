import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'primary', size = 'sm', style }: BadgeProps) {
  const { colors } = useTheme();

  const variants: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: colors.primary + '20', text: colors.primary },
    secondary: { bg: colors.secondary + '20', text: colors.secondary },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    error: { bg: colors.errorLight, text: colors.error },
    info: { bg: colors.infoLight, text: colors.info },
    neutral: { bg: colors.surface, text: colors.textSecondary },
  };

  const v = variants[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: v.text,
            fontSize: isSmall ? FontSize.xs : FontSize.sm,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
});
