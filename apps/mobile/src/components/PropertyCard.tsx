import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { useFavoritesStore } from '@/store/app';
import { formatCurrency } from '@/utils';
import type { Property } from '@/types';

const CARD_WIDTH = Dimensions.get('window').width - Spacing.lg * 2;

interface PropertyCardProps {
  property: Property;
  variant?: 'vertical' | 'horizontal';
}

export function PropertyCard({ property, variant = 'vertical' }: PropertyCardProps) {
  const { colors } = useTheme();
  const { toggle, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(property.id);

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={[styles.hCard, Shadow.md, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
      >
        <Image
          source={{ uri: property.images[0] }}
          style={styles.hImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.hContent}>
          <View style={styles.hHeader}>
            <Badge text={property.type === 'hotel' ? 'Hotel' : 'Homestay'} variant={property.type === 'hotel' ? 'primary' : 'secondary'} />
            {property.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            )}
          </View>
          <Text style={[styles.hName, { color: colors.text }]} numberOfLines={1}>
            {property.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.locationText, { color: colors.textTertiary }]} numberOfLines={1}>
              {property.city}
            </Text>
          </View>
          <Rating rating={property.rating} reviewsCount={property.reviewsCount} size="sm" />
          <View style={styles.hPricing}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatCurrency(property.podStartPrice)}
              <Text style={[styles.priceUnit, { color: colors.textTertiary }]}>/hr</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.card, Shadow.lg, { backgroundColor: colors.card }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.imageOverlay}>
          <Badge
            text={property.type === 'hotel' ? 'Hotel' : 'Homestay'}
            variant={property.type === 'hotel' ? 'primary' : 'secondary'}
          />
          <TouchableOpacity style={styles.heartButton} onPress={() => toggle(property.id)}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#ef4444' : '#fff'} />
          </TouchableOpacity>
        </View>
        {property.isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={10} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {property.name}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.locationText, { color: colors.textTertiary }]} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        <Rating rating={property.rating} reviewsCount={property.reviewsCount} size="sm" />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="bed-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {property.podsCount} Pods
            </Text>
          </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {property.roomsCount} Rooms
            </Text>
          </View>
        </View>

        <View style={styles.amenityRow}>
          {property.amenities.slice(0, 4).map((a) => (
            <View key={a} style={[styles.amenityChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{a}</Text>
            </View>
          ))}
          {property.amenities.length > 4 && (
            <Text style={[styles.moreAmenities, { color: colors.textTertiary }]}>
              +{property.amenities.length - 4}
            </Text>
          )}
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Pods from</Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatCurrency(property.podStartPrice)}
              <Text style={[styles.priceUnit, { color: colors.textTertiary }]}>/hr</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Rooms from</Text>
            <Text style={[styles.price, { color: colors.text }]}>
              {formatCurrency(property.roomStartPrice)}
              <Text style={[styles.priceUnit, { color: colors.textTertiary }]}>/night</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  verifiedText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: undefined,
  },
  statText: {
    fontSize: FontSize.sm,
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  amenityChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  amenityText: {
    fontSize: FontSize.xs,
  },
  moreAmenities: {
    fontSize: FontSize.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  priceLabel: {
    fontSize: FontSize.xs,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  priceUnit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  // Horizontal variant
  hCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hImage: {
    width: 120,
    height: 130,
  },
  hContent: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  hHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  hPricing: {
    marginTop: 'auto',
  },
});
