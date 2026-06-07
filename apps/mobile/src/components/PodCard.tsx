import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils';
import { IMAGE_CACHE_POLICY, IMAGE_PLACEHOLDER_BLURHASH, fastImageSource } from '@/utils/images';
import type { Pod } from '@/types';

interface PodCardProps {
  pod: Pod;
}

export function PodCard({ pod }: PodCardProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    router.push(`/property/${pod.propertyId}?podId=${pod.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.card, Shadow.md, { backgroundColor: colors.card }]}
    >
      <Image
        source={fastImageSource(pod.image)}
        style={styles.image}
        contentFit="cover"
        placeholder={{ blurhash: IMAGE_PLACEHOLDER_BLURHASH }}
        cachePolicy={IMAGE_CACHE_POLICY}
        transition={120}
      />
      <View style={styles.badges}>
        <Badge text={pod.series} variant="primary" />
        <Badge
          text={pod.status === 'available' ? 'Available' : 'Occupied'}
          variant={pod.status === 'available' ? 'success' : 'error'}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {pod.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="business-outline" size={12} color={colors.textTertiary} />
          <Text style={[styles.subtext, { color: colors.textTertiary }]} numberOfLines={1}>
            {pod.propertyName} · {pod.city}
          </Text>
        </View>

        <View style={styles.amenities}>
          {pod.amenities.slice(0, 4).map((a) => (
            <View key={a} style={[styles.amenityChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.starFilled} />
            <Text style={[styles.ratingText, { color: colors.text }]}>{pod.rating}</Text>
            <Text style={[styles.reviewText, { color: colors.textTertiary }]}>
              ({pod.reviewsCount})
            </Text>
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(pod.hourlyRate)}
            <Text style={[styles.priceUnit, { color: colors.textTertiary }]}>/hr</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    width: 220,
  },
  image: {
    width: '100%',
    height: 150,
  },
  badges: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    gap: 4,
  },
  content: {
    padding: Spacing.md,
    gap: 4,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtext: {
    fontSize: FontSize.xs,
    flex: 1,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  amenityChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  amenityText: {
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  reviewText: {
    fontSize: FontSize.xs,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  priceUnit: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
  },
});
