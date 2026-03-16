import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, useColorScheme, type TextInputProps } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input({ label, error, icon, style, ...props }, ref) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: c.inputBg,
            borderColor: error ? c.error : c.inputBorder,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={c.textTertiary}
          style={[styles.input, { color: c.text }, style]}
          {...props}
        />
      </View>
      {error && <Text style={[styles.error, { color: c.error }]}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.lg,
  },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.md },
  error: { fontSize: FontSize.xs, marginLeft: 2 },
});
