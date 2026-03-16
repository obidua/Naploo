import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const iconColor = color ?? c.primary;

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: c.text }]}>{value}</Text>
      <Text style={[styles.title, { color: c.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: c.textTertiary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
