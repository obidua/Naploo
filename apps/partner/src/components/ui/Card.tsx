import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  const { colors: c } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.border },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.lg,
  },
});
