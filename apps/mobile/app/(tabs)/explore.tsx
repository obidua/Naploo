import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { getCities, filterProperties } from '@/store/app';
import type { Property } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SortOption = 'rating' | 'price_low' | 'price_high' | 'reviews';
type ViewMode = 'list' | 'map';

export default function ExploreScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'hotel' | 'homestay'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSortModal, setShowSortModal] = useState(false);

  const allCities = getCities();

  const filteredProperties = useMemo(() => {
    return filterProperties({
      city: selectedCity,
      type: selectedType,
      sortBy: sortBy,
    });
  }, [selectedCity, selectedType, sortBy]);

  const sortLabel: Record<SortOption, string> = {
    rating: 'Top Rated',
    price_low: 'Price: Low',
    price_high: 'Price: High',
    reviews: 'Most Reviews',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
        <View style={styles.headerRight}>
          {/* View Toggle */}
          <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
            >
              <Ionicons name="list" size={16} color={viewMode === 'list' ? '#fff' : colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              style={[styles.viewToggleBtn, viewMode === 'map' && { backgroundColor: colors.primary }]}
            >
              <Ionicons name="map" size={16} color={viewMode === 'map' ? '#fff' : colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        onPress={() => router.push('/search')}
        style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>
          Where are you going?
        </Text>
        <View style={[styles.searchDivider, { backgroundColor: colors.divider }]} />
        <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>Any dates</Text>
        <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>·</Text>
        <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>Guests</Text>
        <View style={[styles.filterIconBtn, { borderColor: colors.border }]}>
          <Ionicons name="options-outline" size={16} color={colors.text} />
        </View>
      </TouchableOpacity>

      {/* City Filter - FIXED with proper contrast */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
      >
        <TouchableOpacity
          onPress={() => setSelectedCity(null)}
          style={[
            styles.filterChip,
            {
              backgroundColor: !selectedCity ? colors.primary : colors.surface,
              borderColor: !selectedCity ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: !selectedCity ? '#ffffff' : colors.text, fontWeight: !selectedCity ? FontWeight.semibold : FontWeight.medium },
            ]}
          >
            All Cities
          </Text>
        </TouchableOpacity>
        {allCities.map((city) => {
          const isSelected = selectedCity === city.name;
          return (
            <TouchableOpacity
              key={city.id}
              onPress={() => setSelectedCity(isSelected ? null : city.name)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isSelected ? '#ffffff' : colors.text, fontWeight: isSelected ? FontWeight.semibold : FontWeight.medium },
                ]}
              >
                {city.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Type + Sort Row */}
      <View style={styles.typeRow}>
        <View style={styles.typeChips}>
          {(['all', 'hotel', 'homestay'] as const).map((type) => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isActive ? colors.primary + '18' : 'transparent',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: isActive ? colors.primary : colors.text },
                  ]}
                >
                  {type === 'all' ? 'All' : type === 'hotel' ? 'Hotels' : 'Homestays'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={() => {
            const opts: SortOption[] = ['rating', 'price_low', 'price_high', 'reviews'];
            const next = opts[(opts.indexOf(sortBy) + 1) % opts.length];
            setSortBy(next);
          }}
          style={[styles.sortBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="swap-vertical-outline" size={16} color={colors.primary} />
          <Text style={[styles.sortText, { color: colors.text }]}>{sortLabel[sortBy]}</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
        {filteredProperties.length} properties found
      </Text>

      {/* Map View */}
      {viewMode === 'map' ? (
        <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={colors.primary} />
            <Text style={[styles.mapText, { color: colors.text }]}>Map View</Text>
            <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>
              Showing {filteredProperties.length} properties
              {selectedCity ? ` in ${selectedCity}` : ' across all cities'}
            </Text>
            {/* Property pins list below map */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mapCards}>
              {filteredProperties.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push(`/property/${p.id}`)}
                  style={[styles.mapCard, Shadow.md, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.mapCardName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                  <Text style={[styles.mapCardCity, { color: colors.textTertiary }]}>{p.city}</Text>
                  <View style={styles.mapCardRow}>
                    <Ionicons name="star" size={12} color={colors.starFilled} />
                    <Text style={[styles.mapCardRating, { color: colors.text }]}>{p.rating}</Text>
                    <Text style={[styles.mapCardPrice, { color: colors.primary }]}>₹{p.podStartPrice}/hr</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* List View */
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => <PropertyCard property={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No properties found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Try changing your filters or selecting a different city
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },

  viewToggle: {
    flexDirection: 'row', borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1, gap: Spacing.sm,
  },
  searchPlaceholder: { fontSize: FontSize.sm },
  searchDivider: { width: 1, height: 16 },
  filterIconBtn: {
    marginLeft: 'auto', width: 32, height: 32, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  filterScroll: { maxHeight: 44, marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1,
  },
  filterChipText: {
    fontSize: FontSize.sm,
  },

  typeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  typeChips: { flexDirection: 'row', gap: Spacing.sm },
  typeChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1,
  },
  typeText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1,
  },
  sortText: { fontSize: FontSize.sm },

  resultCount: { fontSize: FontSize.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },

  // Map View
  mapContainer: { flex: 1, margin: Spacing.lg, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, minHeight: 300 },
  mapText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: Spacing.md },
  mapSubtext: { fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.xs },
  mapCards: { marginTop: Spacing.xl, maxHeight: 90 },
  mapCard: {
    width: 160, padding: Spacing.md, borderRadius: BorderRadius.lg, marginRight: Spacing.sm,
  },
  mapCardName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  mapCardCity: { fontSize: FontSize.xs },
  mapCardRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  mapCardRating: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  mapCardPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginLeft: 'auto' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: Spacing['6xl'], gap: Spacing.sm },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptySubtext: { fontSize: FontSize.sm, textAlign: 'center' },
});
