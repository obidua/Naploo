import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, Shadow, Spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, padding = Spacing.lg, elevated = true }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elevated && Shadow.md,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
