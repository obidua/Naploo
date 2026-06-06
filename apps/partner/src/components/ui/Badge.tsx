import React from 'react';
import { View, Text, StyleSheet } from "react-native";
import { FontSize, FontWeight, Spacing, BorderRadius } from "@/theme";
import { useTheme } from '@/theme/useTheme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export function Badge({ text, variant = 'default' }: BadgeProps) {
  const { colors: c } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; fg: string }> = {
    success: { bg: c.successLight, fg: c.success },
    warning: { bg: c.warningLight, fg: c.warning },
    error: { bg: c.errorLight, fg: c.error },
    info: { bg: c.infoLight, fg: c.info },
    default: { bg: c.surface, fg: c.textSecondary },
  };

  const { bg, fg } = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
});
