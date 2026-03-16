import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';
import { useColorScheme } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const bgColor = {
    primary: c.primary,
    secondary: c.surface,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const borderColor = variant === 'outline' ? c.primary : 'transparent';

  const txtColor = {
    primary: c.textInverse,
    secondary: c.text,
    outline: c.primary,
    ghost: c.primary,
  }[variant];

  const height = { sm: 36, md: 48, lg: 56 }[size];
  const fontSize = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          height,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'outline' && styles.outlined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: txtColor, fontSize }, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  outlined: {
    borderWidth: 1.5,
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
});
