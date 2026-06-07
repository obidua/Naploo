import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { PodCard } from '@/components/PodCard';
import { NearbyPodsBar } from '@/components/NearbyPodsBar';
import { getPopularCities } from '@/data/properties';
import { getHeroStats, getProperties, getPods, getDeals, useFavoritesStore, useDataStore } from '@/store/app';
import { formatCurrency } from '@/utils';
import { ensureUserLocation, useSmartAlertsStore } from '@/services/smartAlerts';
import { IMAGE_CACHE_POLICY, IMAGE_PLACEHOLDER_BLURHASH, fastImageSource, prefetchImages } from '@/utils/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // Subscribe to the live data store — re-renders after loadAll() resolves
  const storeProperties = useDataStore((s) => s.properties);
  const storePods = useDataStore((s) => s.pods);
  const storeCities = useDataStore((s) => s.cities);
  const loadAll = useDataStore((s) => s.loadAll);
  const locationLabel = useSmartAlertsStore((s) => s.locationLabel);
  const locationPermission = useSmartAlertsStore((s) => s.locationPermission);

  useEffect(() => {
    loadAll().catch(() => {});
  }, [loadAll]);

  useEffect(() => {
    ensureUserLocation({ prompt: true }).catch(() => {});
  }, []);

  // storeProperties is used as a dependency so heroStats refresh after fetch
  const popularCities = storeCities.length ? storeCities.slice(0, 8) : getPopularCities();
  const heroStats = useMemo(() => getHeroStats(), [storeProperties, storePods, storeCities]);
  const properties = storeProperties.length ? storeProperties : getProperties();
  const pods = storePods.length ? storePods : getPods();
  const deals = getDeals();

  useEffect(() => {
    prefetchImages([
      ...deals.slice(0, 4).map((deal) => deal.image),
      ...popularCities.slice(0, 6).map((city) => city.image),
      ...pods.slice(0, 6).map((pod) => pod.image),
      ...properties.slice(0, 4).map((property) => property.images[0]),
    ], 20);
  }, [deals, popularCities, pods, properties]);

  const handleLocationPress = () => {
    ensureUserLocation({ prompt: true }).catch(() => {});
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* ── Hero Section ── */}
      <LinearGradient
        colors={isDark ? ['#2e1065', '#1e1b4b', '#0f0a1e'] : ['#7c3aed', '#8b5cf6', '#a78bfa']}
        style={[styles.hero, { paddingTop: insets.top + Spacing.lg }]}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroLogo}>naploo</Text>
            <Text style={styles.heroTagline}>India's First Pod Hotel</Text>
            <TouchableOpacity
              onPress={handleLocationPress}
              activeOpacity={0.8}
              style={styles.locationChip}
            >
              <Ionicons name="location" size={13} color="#fff" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationLabel || (locationPermission === 'denied' ? 'Tap to enable location' : 'Detecting your location')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/bookings')}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroStats}>
          {heroStats.map((s) => (
            <View key={s.label} style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{s.num}</Text>
              <Text style={styles.heroStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* ── Search Bar (overlapping hero) ── */}
      <View style={styles.searchWrapper}>
        <SearchBar collapsible />
      </View>

      {/* ── Nearby Pods — Location Aware ── */}
      <View style={[styles.section, { paddingHorizontal: Spacing.lg }]}>
        <NearbyPodsBar />
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          {[
            { icon: 'bed-outline' as const, label: 'Pods', color: '#7c3aed', route: '/search?type=pod' },
            { icon: 'business-outline' as const, label: 'Hotels', color: '#8b5cf6', route: '/search?type=hotel' },
            { icon: 'home-outline' as const, label: 'Homestay', color: '#a78bfa', route: '/search?type=homestay' },
            { icon: 'time-outline' as const, label: 'Hourly', color: '#6d28d9', route: '/search?type=pod' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={styles.quickAction}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Deals & Offers ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Deals & Offers</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={deals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/search')}
              style={[styles.dealCard, { backgroundColor: item.color }]}
            >
              <View style={styles.dealContent}>
                <Text style={styles.dealTitle}>{item.title}</Text>
                <Text style={styles.dealSubtitle}>{item.subtitle}</Text>
                <View style={styles.dealCode}>
                  <Text style={styles.dealCodeText}>Use: {item.code}</Text>
                </View>
              </View>
              <Image
                source={fastImageSource(item.image)}
                style={styles.dealImage}
                contentFit="cover"
                placeholder={{ blurhash: IMAGE_PLACEHOLDER_BLURHASH }}
                cachePolicy={IMAGE_CACHE_POLICY}
                transition={120}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Popular Cities ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Cities</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/search?city=${item.name}` as any)}
              activeOpacity={0.9}
              style={styles.cityCard}
            >
              <Image
                source={fastImageSource(item.image)}
                style={styles.cityImage}
                contentFit="cover"
                placeholder={{ blurhash: IMAGE_PLACEHOLDER_BLURHASH }}
                cachePolicy={IMAGE_CACHE_POLICY}
                transition={120}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.cityGradient}
              >
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.cityCount}>{item.propertyCount} properties</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Featured Pods ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Pods</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={pods.filter((p) => p.status === 'available').slice(0, 6)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          renderItem={({ item }) => <PodCard pod={item} />}
        />
      </View>

      {/* ── Top Rated Properties ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Rated</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.propertyList}>
          {properties
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
            .map((property) => (
              <View key={property.id} style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
                <PropertyCard property={property} />
              </View>
            ))}
        </View>
      </View>

      {/* ── Naploo Everywhere ── */}
      <View style={[styles.section, { paddingHorizontal: Spacing.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
          Naploo — Everywhere You Go
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 }}>
          Find pods at airports, railways, highways, hospitals, tourist places, bus stands, IT parks & malls across India.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {[
            { emoji: '✈️', label: 'Airports', count: '25+' },
            { emoji: '🚂', label: 'Railways', count: '40+' },
            { emoji: '🛣️', label: 'Highways', count: '100+' },
            { emoji: '🏥', label: 'Hospitals', count: '30+' },
            { emoji: '🚌', label: 'Bus Stands', count: '35+' },
            { emoji: '🏛️', label: 'Tourist', count: '50+' },
            { emoji: '🏢', label: 'IT Parks', count: '45+' },
            { emoji: '🛍️', label: 'Malls', count: '20+' },
          ].map((loc) => (
            <TouchableOpacity
              key={loc.label}
              onPress={() => router.push('/search' as any)}
              style={[{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8,
                borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight,
              }]}
            >
              <Text style={{ fontSize: 16 }}>{loc.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{loc.label}</Text>
              <Text style={{ fontSize: 10, color: colors.primary }}>{loc.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Travel Smart ── */}
      <View style={[styles.section, { paddingHorizontal: Spacing.lg }]}>
        <View style={[{
          backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff',
          borderRadius: 20, padding: Spacing.lg, gap: Spacing.md,
          borderWidth: 1, borderColor: isDark ? '#312e81' : '#ddd6fe',
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Travel Smart with Naploo</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Your safety companion on the road</Text>
            </View>
          </View>
          {[
            { icon: '📍', text: 'Auto-detects when you need rest based on travel time & speed' },
            { icon: '🔔', text: 'Smart notifications suggest nearby pods when you drive long hours' },
            { icon: '🌙', text: 'Late-night driving alerts with nearest rest stop locations' },
            { icon: '⚡', text: 'Quick 20-min power naps proven to boost alertness by 54%' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 1 }}>{item.icon}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 19 }}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Why Naploo ── */}
      <View style={[styles.section, { paddingHorizontal: Spacing.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.lg }]}>
          Why Book with Naploo?
        </Text>
        {[
          { icon: 'flash-outline' as const, title: 'Instant Booking', desc: 'Book pods in seconds, check-in within minutes' },
          { icon: 'shield-checkmark-outline' as const, title: '100% Safe & Hygienic', desc: 'Sanitized pods with contactless check-in' },
          { icon: 'wallet-outline' as const, title: 'Best Price Guarantee', desc: 'Pods starting at just ₹149/hour' },
          { icon: 'time-outline' as const, title: 'Flexible Hourly Stays', desc: 'Book for 1-12 hours, perfect for transit' },
        ].map((item) => (
          <View key={item.title} style={[styles.featureRow, { borderBottomColor: colors.divider }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Hero
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLogo: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroTagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  locationChip: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    maxWidth: SCREEN_WIDTH * 0.58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationText: {
    flexShrink: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  notifBtn: {
    position: 'relative',
    padding: Spacing.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#7c3aed',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing['2xl'],
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNum: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroStatLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  // Search
  searchWrapper: {
    marginTop: -50,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  // Sections
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  // Deals
  dealCard: {
    width: SCREEN_WIDTH * 0.75,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 130,
  },
  dealContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  dealTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  dealSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  dealCode: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  dealCodeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  dealImage: {
    width: 110,
    height: '100%',
    opacity: 0.85,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  // Cities
  cityCard: {
    width: 150,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  cityGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: Spacing['3xl'],
  },
  cityName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  cityCount: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  // Properties
  propertyList: {},
  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
