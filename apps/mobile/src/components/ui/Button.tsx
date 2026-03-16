import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const variants: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: '#ffffff' },
    secondary: { bg: colors.secondary, text: '#ffffff' },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', text: colors.primary },
    danger: { bg: colors.error, text: '#ffffff' },
  };

  const sizes: Record<Size, { height: number; paddingH: number; fontSize: number }> = {
    sm: { height: 36, paddingH: Spacing.md, fontSize: FontSize.sm },
    md: { height: 48, paddingH: Spacing.xl, fontSize: FontSize.md },
    lg: { height: 56, paddingH: Spacing['2xl'], fontSize: FontSize.lg },
  };

  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          height: s.height,
          paddingHorizontal: s.paddingH,
          borderColor: v.border || 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          opacity: isDisabled ? 0.6 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: v.text, fontSize: s.fontSize },
              icon ? { marginLeft: Spacing.sm } : undefined,
              iconRight ? { marginRight: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight}
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
    borderRadius: BorderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
});
