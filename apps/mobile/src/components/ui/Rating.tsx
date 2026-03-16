import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { FontSize, Spacing } from '@/theme';

interface RatingProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function Rating({ rating, reviewsCount, size = 'md', showCount = true }: RatingProps) {
  const { colors } = useTheme();

  const iconSizes = { sm: 12, md: 16, lg: 20 };
  const fontSizes = { sm: FontSize.xs, md: FontSize.sm, lg: FontSize.md };
  const iconSize = iconSizes[size];
  const fontSize = fontSizes[size];

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: fullStars }, (_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={iconSize} color={colors.starFilled} />
        ))}
        {hasHalf && (
          <Ionicons name="star-half" size={iconSize} color={colors.starFilled} />
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={iconSize} color={colors.starEmpty} />
        ))}
      </View>
      <Text style={[styles.rating, { color: colors.text, fontSize }]}>
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewsCount !== undefined && (
        <Text style={[styles.count, { color: colors.textTertiary, fontSize: fontSize - 1 }]}>
          ({reviewsCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  rating: {
    fontWeight: '600',
  },
  count: {},
});
