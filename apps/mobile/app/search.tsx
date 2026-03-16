import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Keyboard,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { PodCard } from '@/components/PodCard';
import { filterProperties, filterPods, getCities, getProperties, getPods } from '@/store/app';
import { useSearchStore } from '@/store/search';
import { formatCurrency } from '@/utils';
import { format } from 'date-fns';
import type { Property, Pod } from '@/types';

type ViewMode = 'properties' | 'pods';
type SortBy = 'relevance' | 'price_low' | 'price_high' | 'rating';

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const urlParams = useLocalSearchParams<{ city?: string; type?: string }>();
  const searchStore = useSearchStore();

  // Initialize from search store (home page filters) or URL params
  const storeCity = searchStore.params.city;
  const initialCity = urlParams.city || storeCity || '';

  const [query, setQuery] = useState(initialCity);
  const [viewMode, setViewMode] = useState<ViewMode>('properties');
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  const [selectedType, setSelectedType] = useState<string>(urlParams.type || 'all');
  const [selectedPodType, setSelectedPodType] = useState<'all' | 'single' | 'double'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const allCities = getCities();
  const allProperties = getProperties();
  const allPods = getPods();

  // Read guests/pods from store for display
  const storeGuests = searchStore.params.guests || 1;
  const storePods = searchStore.params.pods || 1;
  const storeCheckIn = searchStore.params.checkIn;
  const storeCheckOut = searchStore.params.checkOut;

  const inputRef = useRef<TextInput>(null);

  const results = useMemo(() => {
    return filterProperties({
      query: query || undefined,
      city: selectedCity,
      type: (selectedType === 'all' ? undefined : selectedType) as any,
      minRating,
      priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
      priceMax: priceRange[1] < 5000 ? priceRange[1] : undefined,
      sortBy,
    });
  }, [query, selectedCity, selectedType, priceRange, minRating, sortBy]);

  const podResults = useMemo(() => {
    return filterPods({
      query: query || undefined,
      city: selectedCity,
      type: selectedPodType !== 'all' ? selectedPodType : undefined,
      sortBy: sortBy === 'price_low' ? 'price_low' : sortBy === 'price_high' ? 'price_high' : sortBy === 'rating' ? 'rating' : undefined,
    });
  }, [query, selectedCity, selectedPodType, sortBy]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const cityMatches = allCities.filter((c) => c.name.toLowerCase().includes(q));
    const propMatches = allProperties.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 3);
    return [
      ...cityMatches.map((c) => ({ type: 'city' as const, id: c.id, name: c.name, subtitle: `${c.propertyCount} properties` })),
      ...propMatches.map((p) => ({ type: 'property' as const, id: p.id, name: p.name, subtitle: p.city })),
    ];
  }, [query]);

  const activeData = viewMode === 'properties' ? results : podResults;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search city, hotel, or pod..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchTextInput, { color: colors.text }]}
            autoFocus={!initialCity}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSelectedCity(null); }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && query.length >= 2 && (
        <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={`${s.type}-${s.id}`}
              onPress={() => {
                if (s.type === 'city') {
                  setSelectedCity(s.name);
                  setQuery(s.name);
                } else {
                  router.push(`/property/${s.id}`);
                }
                Keyboard.dismiss();
              }}
              style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
            >
              <Ionicons
                name={s.type === 'city' ? 'location-outline' : 'business-outline'}
                size={18}
                color={colors.textSecondary}
              />
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionName, { color: colors.text }]}>{s.name}</Text>
                <Text style={[styles.suggestionSub, { color: colors.textTertiary }]}>{s.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Info Bar — shows filters from home page */}
      {(storeCheckIn || storeGuests > 1 || storePods > 1) && (
        <View style={[styles.searchInfoBar, { backgroundColor: colors.primary + '10', borderBottomColor: colors.divider }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
            {storeCheckIn && (
              <View style={[styles.infoPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                <Text style={[styles.infoPillText, { color: colors.text }]}>
                  {format(new Date(storeCheckIn), 'dd MMM')}{storeCheckOut ? ` - ${format(new Date(storeCheckOut), 'dd MMM')}` : ''}
                </Text>
              </View>
            )}
            <View style={[styles.infoPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="people-outline" size={12} color={colors.primary} />
              <Text style={[styles.infoPillText, { color: colors.text }]}>
                {storeGuests} Guest{storeGuests > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={[styles.infoPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="bed-outline" size={12} color={colors.primary} />
              <Text style={[styles.infoPillText, { color: colors.text }]}>
                {storePods} Pod{storePods > 1 ? 's' : ''}
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
          {/* View toggle */}
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'properties' ? 'pods' : 'properties')}
            style={[styles.filterChip, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
          >
            <Ionicons name={viewMode === 'properties' ? 'business-outline' : 'bed-outline'} size={14} color={colors.primary} />
            <Text style={[styles.filterChipText, { color: colors.primary }]}>
              {viewMode === 'properties' ? 'Properties' : 'Pods'}
            </Text>
          </TouchableOpacity>

          {/* Pod type: Single / Double */}
          <TouchableOpacity
            onPress={() => {
              const types: ('all' | 'single' | 'double')[] = ['all', 'single', 'double'];
              setSelectedPodType(types[(types.indexOf(selectedPodType) + 1) % types.length]);
            }}
            style={[styles.filterChip, {
              borderColor: selectedPodType !== 'all' ? colors.primary : colors.border,
              backgroundColor: selectedPodType !== 'all' ? colors.primary + '15' : colors.surface,
            }]}
          >
            <Ionicons name="person-outline" size={14} color={selectedPodType !== 'all' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.filterChipText, { color: selectedPodType !== 'all' ? colors.primary : colors.textSecondary }]}>
              {selectedPodType === 'all' ? 'Pod Type' : selectedPodType === 'single' ? '1 Person' : '2 Person'}
            </Text>
          </TouchableOpacity>

          {/* Sort */}
          <TouchableOpacity
            onPress={() => {
              const opts: SortBy[] = ['relevance', 'price_low', 'price_high', 'rating'];
              setSortBy(opts[(opts.indexOf(sortBy) + 1) % opts.length]);
            }}
            style={[styles.filterChip, {
              borderColor: sortBy !== 'relevance' ? colors.primary : colors.border,
              backgroundColor: sortBy !== 'relevance' ? colors.primary + '15' : colors.surface,
            }]}
          >
            <Ionicons name="swap-vertical-outline" size={14} color={sortBy !== 'relevance' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.filterChipText, { color: sortBy !== 'relevance' ? colors.primary : colors.textSecondary }]}>
              {sortBy === 'relevance' ? 'Sort' : sortBy === 'price_low' ? 'Price ↑' : sortBy === 'price_high' ? 'Price ↓' : 'Rating'}
            </Text>
          </TouchableOpacity>

          {/* Rating filter */}
          <TouchableOpacity
            onPress={() => setMinRating(minRating >= 4 ? 0 : minRating + 1)}
            style={[styles.filterChip, {
              borderColor: minRating > 0 ? colors.primary : colors.border,
              backgroundColor: minRating > 0 ? colors.primary + '15' : colors.surface,
            }]}
          >
            <Ionicons name="star-outline" size={14} color={minRating > 0 ? colors.primary : colors.textSecondary} />
            <Text style={[styles.filterChipText, { color: minRating > 0 ? colors.primary : colors.textSecondary }]}>
              {minRating > 0 ? `${minRating}+ ★` : 'Rating'}
            </Text>
          </TouchableOpacity>

          {/* Type filter */}
          <TouchableOpacity
            onPress={() => {
              const types = ['all', 'hotel', 'homestay'];
              setSelectedType(types[(types.indexOf(selectedType) + 1) % types.length]);
            }}
            style={[styles.filterChip, {
              borderColor: selectedType !== 'all' ? colors.primary : colors.border,
              backgroundColor: selectedType !== 'all' ? colors.primary + '15' : colors.surface,
            }]}
          >
            <Ionicons name="options-outline" size={14} color={selectedType !== 'all' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.filterChipText, { color: selectedType !== 'all' ? colors.primary : colors.textSecondary }]}>
              {selectedType === 'all' ? 'Type' : selectedType === 'hotel' ? 'Hotels' : 'Homestays'}
            </Text>
          </TouchableOpacity>

          {/* Clear filters */}
          {(minRating > 0 || selectedType !== 'all' || selectedPodType !== 'all' || sortBy !== 'relevance' || selectedCity) && (
            <TouchableOpacity
              onPress={() => { setMinRating(0); setSelectedType('all'); setSelectedPodType('all'); setSortBy('relevance'); setSelectedCity(null); setQuery(''); }}
              style={[styles.filterChip, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}
            >
              <Ionicons name="close" size={14} color={colors.error} />
              <Text style={[styles.filterChipText, { color: colors.error }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
          {viewMode === 'properties' ? results.length : podResults.length} {viewMode === 'properties' ? 'properties' : 'pods'}
        </Text>
        <View style={styles.sortOptions}>
          {(['relevance', 'price_low', 'rating'] as SortBy[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortBy === s ? colors.primary + '15' : 'transparent',
                  borderColor: sortBy === s ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                style={[styles.sortChipText, { color: sortBy === s ? colors.primary : colors.textTertiary }]}
              >
                {s === 'relevance' ? 'Relevance' : s === 'price_low' ? 'Price ↑' : 'Rating ↓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      {viewMode === 'properties' ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => <PropertyCard property={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Try a different search or adjust filters
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={podResults}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => <PodCard pod={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bed-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No pods found</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Try a different search or adjust filters
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: FontSize.md,
  },
  suggestions: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  suggestionContent: { flex: 1 },
  suggestionName: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  suggestionSub: { fontSize: FontSize.xs },
  searchInfoBar: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  infoPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  filterBar: {
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: { fontSize: FontSize.sm },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  resultCount: { fontSize: FontSize.sm },
  sortOptions: { flexDirection: 'row', gap: Spacing.xs },
  sortChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sortChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['6xl'],
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyDesc: { fontSize: FontSize.sm },
});
