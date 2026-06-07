import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { PodSeatMap } from '@/components/PodSeatMap';
import { BookingDateTimePicker } from '@/components/BookingDateTimePicker';
import { getPropertyById, getPodsByProperty, getPodLayout, getPodLayoutFromSets, loadPropertyDetail } from '@/data/properties';
import { useDataStore } from '@/store/app';
import { useFavoritesStore } from '@/store/app';
import { useSearchStore } from '@/store/search';
import { formatCurrency } from '@/utils';
import { IMAGE_CACHE_POLICY, IMAGE_PLACEHOLDER_BLURHASH, fastImageSource, prefetchImages } from '@/utils/images';
import type { Pod, Room, PodSlot, PodRow, Review } from '@/types';
import { format, addHours, addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'overview' | 'pods' | 'rooms' | 'reviews';

// Generate rooms dynamically by property
function generateRooms(propertyId: string, count: number, startPrice: number): Room[] {
  const types: Array<{ type: Room['type']; bed: Room['bedType']; mult: number }> = [
    { type: 'standard', bed: 'double', mult: 1 },
    { type: 'deluxe', bed: 'queen', mult: 1.5 },
    { type: 'suite', bed: 'king', mult: 2.5 },
    { type: 'family', bed: 'king', mult: 2 },
  ];
  return Array.from({ length: Math.min(count, types.length) }, (_, i) => {
    const t = types[i % types.length];
    return {
      id: `${propertyId}-r${i + 1}`,
      propertyId,
      roomNumber: `${(i + 1) * 100 + 1}`,
      type: t.type,
      bedType: t.bed,
      floor: i + 1,
      capacity: t.type === 'family' ? 4 : 2,
      dailyRate: Math.round(startPrice * t.mult),
      extraGuestCharge: Math.round(startPrice * 0.2),
      amenities: ['WiFi', 'AC', 'TV', 'Bathroom', ...(i >= 1 ? ['Mini Bar'] : []), ...(i >= 2 ? ['Balcony', 'Jacuzzi'] : [])],
      images: [],
      description: `${t.type.charAt(0).toUpperCase() + t.type.slice(1)} room with premium amenities`,
      status: 'available' as const,
    };
  });
}

// Generate reviews dynamically
function generateReviews(propertyId: string, rating: number, count: number): Review[] {
  const names = ['Arjun M.', 'Priya S.', 'Rahul K.', 'Sneha T.', 'Vikram P.', 'Anita R.'];
  const comments = [
    'Amazing pod experience! Very clean and comfortable. Will come back again.',
    'Great location and the pods are super futuristic. Loved the AC and privacy.',
    'Perfect for a transit stay. Quick check-in, clean pods, good WiFi.',
    'Really impressed with the hygiene standards. Pod was cozy and quiet.',
    'Best budget accommodation. The pods have everything you need.',
    'Cool concept! The sleeping pod was way better than expected.',
  ];
  const types: Review['travelType'][] = ['solo', 'couple', 'business', 'friends', 'family'];
  return Array.from({ length: Math.min(count, 6) }, (_, i) => ({
    id: `${propertyId}-review-${i + 1}`,
    userId: `user-${i + 1}`,
    userName: names[i % names.length],
    propertyId,
    bookingId: `b-${i + 1}`,
    rating: Math.max(3, Math.min(5, rating + (i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.5 : 0))),
    comment: comments[i % comments.length],
    travelType: types[i % types.length],
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 7).toISOString(),
  }));
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const searchParams = useSearchStore((s) => s.params);

  // Subscribe to the live data store so we re-render after loadAll().
  const storeProperties = useDataStore((s) => s.properties);
  const [livePods, setLivePods] = useState<Pod[]>([]);
  const [livePodSets, setLivePodSets] = useState<any[]>([]);
  const [liveProperty, setLiveProperty] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    // Make sure list-level data is loaded too (in case user deep-links here).
    useDataStore.getState().loadAll().catch(() => {});
    setLoadingDetail(true);
    loadPropertyDetail(id)
      .then((res) => {
        if (res) {
          setLiveProperty(res.property);
          setLivePods(res.pods);
          setLivePodSets(res.podSets || []);
        }
        setLoadingDetail(false);
      })
      .catch(() => setLoadingDetail(false));
  }, [id]);

  // Prefer the detailed fetch; fall back to the list entry while it loads.
  const property = liveProperty || storeProperties.find((p) => p.id === id) || getPropertyById(id);
  const propertyPods = useMemo(() => (livePods.length ? livePods : property ? getPodsByProperty(property.id) : []), [property, livePods]);
  // Prefer the real backend-driven layout (uses partner-configured per-set
  // hourlyRate). Only fall back to the synthesized grid if the detail call
  // has not returned podSets yet.
  const podLayout = useMemo(
    () => {
      if (!property) return undefined;
      if (livePodSets && livePodSets.length > 0) {
        return getPodLayoutFromSets(property.id, livePodSets);
      }
      return getPodLayout(property.id);
    },
    [property, livePodSets]
  );
  const rooms = useMemo(() => (property ? generateRooms(property.id, property.roomsCount, property.roomStartPrice) : []), [property]);
  const reviews = useMemo(() => (property ? generateReviews(property.id, property.rating, 6) : []), [property]);
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const isFav = property ? isFavorite(property.id) : false;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [selectedPodSlot, setSelectedPodSlot] = useState<PodSlot | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [podHours, setPodHours] = useState(2);
  const [roomNights, setRoomNights] = useState(() => {
    if (searchParams.checkIn && searchParams.checkOut) {
      const nights = differenceInCalendarDays(parseISO(searchParams.checkOut), parseISO(searchParams.checkIn));
      return nights > 0 ? nights : 1;
    }
    return 1;
  });
  const [guests, setGuests] = useState(searchParams.guests || 1);
  const [roomQty, setRoomQty] = useState(searchParams.rooms || 1);
  const [bedTypeFilter, setBedTypeFilter] = useState<'all' | 'single' | 'double'>('all');
  const [roomCheckIn, setRoomCheckIn] = useState(() => {
    if (searchParams.checkIn) return parseISO(searchParams.checkIn);
    return new Date();
  });
  const [roomCheckOut, setRoomCheckOut] = useState(() => {
    if (searchParams.checkOut) return parseISO(searchParams.checkOut);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  // Date/Time state — prefill from search store
  const [bookingDate, setBookingDate] = useState(() => {
    if (searchParams.checkIn) {
      return parseISO(searchParams.checkIn);
    }
    return new Date();
  });
  const [bookingTime, setBookingTime] = useState(() => {
    // Use property check-in time if available
    if (property?.checkInTime) {
      // checkInTime is like "2:00 PM" or "14:00"
      const t = property.checkInTime;
      const match24 = t.match(/(\d{1,2}):(\d{2})/);
      if (match24) {
        const ampmMatch = t.match(/(AM|PM)/i);
        let h = parseInt(match24[1]);
        const m = match24[2];
        if (ampmMatch) {
          const ampm = ampmMatch[1].toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
        }
        return `${String(h).padStart(2, '0')}:${m}`;
      }
    }
    return '14:00';
  });

  useEffect(() => {
    if (property) prefetchImages(property.images, 8);
  }, [property]);

  if (!property) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Property not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const handleShare = () => {
    const deepLink = `https://naploo.com/property/${property.id}`;
    Share.share({
      message: `Check out ${property.name} in ${property.city} on Naploo! Pods from ${formatCurrency(property.podStartPrice)}/hr.\n\n${deepLink}`,
      title: property.name,
      url: deepLink,
    });
  };

  const handleToggleFavorite = () => {
    toggleFav(property.id);
  };

  const handleBookPod = () => {
    if (!selectedPodSlot) {
      Alert.alert('Select a Pod', 'Tap on an available pod on the map to select it');
      return;
    }
    const [h, m] = bookingTime.split(':').map(Number);
    const checkIn = new Date(bookingDate);
    checkIn.setHours(h, m, 0, 0);
    const checkOut = addHours(checkIn, podHours);

    // When the seat-map was built from real podSets, `selectedPodSlot.id`
    // is already the real podSet UUID. Fall back to the legacy index lookup
    // only when we are still on the synthesized layout (livePodSets empty).
    let bookingItemId: string = selectedPodSlot.id;
    if ((!livePodSets || livePodSets.length === 0) && livePods.length > 0) {
      const slotIndex = Math.max(
        0,
        (selectedPodSlot.row || 0) * 2 + (selectedPodSlot.position === 'upper' ? 1 : 0)
      );
      const realPod = livePods[Math.min(slotIndex, livePods.length - 1)];
      if (realPod?.id) bookingItemId = realPod.id;
    }

    router.push({
      pathname: '/booking/confirm',
      params: {
        propertyId: property.id,
        propertyName: property.name,
        type: 'pod',
        itemId: bookingItemId,
        itemName: `Pod ${selectedPodSlot.label} (${selectedPodSlot.series})`,
        rate: String(selectedPodSlot.hourlyRate),
        duration: String(podHours),
        guests: String(guests),
        city: property.city,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        podLabel: selectedPodSlot.label,
        podPosition: selectedPodSlot.position,
      },
    });
  };

  const handleBookRoom = () => {
    if (!selectedRoom) {
      Alert.alert('Select a Room', 'Please select a room to continue');
      return;
    }
    router.push({
      pathname: '/booking/confirm',
      params: {
        propertyId: property.id,
        propertyName: property.name,
        type: 'room',
        itemId: selectedRoom.id,
        itemName: `${selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)} Room`,
        rate: String(selectedRoom.dailyRate),
        duration: String(roomNights),
        guests: String(guests),
        roomQty: String(roomQty),
        city: property.city,
        checkIn: roomCheckIn.toISOString(),
        checkOut: roomCheckOut.toISOString(),
      },
    });
  };

  // Room date helpers
  const handleRoomCheckInChange = (date: Date) => {
    setRoomCheckIn(date);
    const nights = differenceInCalendarDays(roomCheckOut, date);
    if (nights < 1) {
      const newCheckOut = addDays(date, 1);
      setRoomCheckOut(newCheckOut);
      setRoomNights(1);
    } else {
      setRoomNights(nights);
    }
  };

  const handleRoomCheckOutChange = (date: Date) => {
    if (differenceInCalendarDays(date, roomCheckIn) < 1) return;
    setRoomCheckOut(date);
    setRoomNights(differenceInCalendarDays(date, roomCheckIn));
  };

  const handleRoomNightsChange = (n: number) => {
    setRoomNights(n);
    setRoomCheckOut(addDays(roomCheckIn, n));
  };

  // Pod price for selected slot
  const podTotalPrice = selectedPodSlot ? selectedPodSlot.hourlyRate * podHours : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Image Gallery ── */}
        <View style={styles.gallery}>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
            }}
            renderItem={({ item }) => (
              <Image
                source={fastImageSource(item)}
                style={styles.galleryImage}
                contentFit="cover"
                placeholder={{ blurhash: IMAGE_PLACEHOLDER_BLURHASH }}
                cachePolicy={IMAGE_CACHE_POLICY}
                transition={120}
              />
            )}
            keyExtractor={(_, i) => String(i)}
          />
          <View style={[styles.galleryOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.galleryBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity onPress={handleShare} style={styles.galleryBtn}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.galleryBtn}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#ef4444' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dots}>
            {property.images.map((_: any, i: number) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === imageIndex ? '#fff' : 'rgba(255,255,255,0.5)' }]} />
            ))}
          </View>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{imageIndex + 1}/{property.images.length}</Text>
          </View>
        </View>

        {/* ── Property Info ── */}
        <View style={styles.info}>
          <View style={styles.infoHeader}>
            <View style={styles.infoBadges}>
              <Badge text={property.type === 'hotel' ? 'Hotel' : 'Homestay'} variant="primary" />
              {property.isVerified && <Badge text="✓ Verified" variant="success" />}
            </View>
            <Rating rating={property.rating} reviewsCount={property.reviewsCount} size="md" />
          </View>
          <Text style={[styles.propertyName, { color: colors.text }]}>{property.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {property.address}, {property.city}
            </Text>
          </View>
          <View style={[styles.quickStats, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            {[
              { icon: 'bed-outline' as const, value: `${property.podsCount}`, label: 'Pods' },
              { icon: 'business-outline' as const, value: `${property.roomsCount}`, label: 'Rooms' },
              { icon: 'time-outline' as const, value: property.checkInTime, label: 'Check-in' },
              { icon: 'star' as const, value: `${property.rating}`, label: 'Rating' },
            ].map((s, i) => (
              <View key={s.label} style={[styles.quickStat, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.divider }]}>
                <Ionicons name={s.icon} size={18} color={colors.primary} />
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={[styles.tabs, { borderBottomColor: colors.divider }]}>
          {(['overview', 'pods', 'rooms', 'reviews'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textTertiary }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{property.description}</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((a: string) => (
                <View key={a} style={[styles.amenityItem, { backgroundColor: colors.surface }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.amenityLabel, { color: colors.textSecondary }]}>{a}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Policies</Text>
            {property.policies.map((p: string) => (
              <View key={p} style={styles.policyRow}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
                <Text style={[styles.policyText, { color: colors.textSecondary }]}>{p}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing</Text>
            <View style={[styles.pricingCard, { backgroundColor: colors.surface }]}>
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>Pods from</Text>
                <Text style={[styles.pricingValue, { color: colors.primary }]}>
                  {formatCurrency(property.podStartPrice)}/hr
                </Text>
              </View>
              <View style={[styles.pricingDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>Rooms from</Text>
                <Text style={[styles.pricingValue, { color: colors.text }]}>
                  {formatCurrency(property.roomStartPrice)}/night
                </Text>
              </View>
            </View>

            {/* Quick Book CTAs — Pod (hourly) AND Room (nightly) */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => setActiveTab('pods')}
                style={[styles.quickBookCta, { flex: 1, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
              >
                <View style={styles.quickBookLeft}>
                  <Ionicons name="bed" size={22} color={colors.primary} />
                  <View>
                    <Text style={[styles.quickBookTitle, { color: colors.primary }]}>Book Pod</Text>
                    <Text style={[styles.quickBookSub, { color: colors.textSecondary }]}>
                      {`From ${formatCurrency(property.podStartPrice)}/hr`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('rooms')}
                style={[styles.quickBookCta, { flex: 1, backgroundColor: '#10b98110', borderColor: '#10b981' }]}
              >
                <View style={styles.quickBookLeft}>
                  <Ionicons name="business" size={22} color="#10b981" />
                  <View>
                    <Text style={[styles.quickBookTitle, { color: '#10b981' }]}>Book Room</Text>
                    <Text style={[styles.quickBookSub, { color: colors.textSecondary }]}>
                      {`From ${formatCurrency(property.roomStartPrice)}/night`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Pods Tab - Futuristic Seat Map ── */}
        {activeTab === 'pods' && (
          <View style={styles.tabContent}>
            {/* Step 1: Date & Time */}
            <View style={[styles.bookingStep, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNum}>1</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Date & Time</Text>
              </View>
              <BookingDateTimePicker
                selectedDate={bookingDate}
                selectedTime={bookingTime}
                duration={podHours}
                onDateChange={setBookingDate}
                onTimeChange={setBookingTime}
                onDurationChange={setPodHours}
              />
            </View>

            {/* Step 2: Pod Type Filter */}
            <View style={[styles.bookingStep, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Your Pod</Text>
              </View>

              {/* Bed type filter */}
              <View style={styles.bedTypeRow}>
                {(['all', 'single', 'double'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setBedTypeFilter(t)}
                    style={[
                      styles.bedTypeChip,
                      {
                        backgroundColor: bedTypeFilter === t ? colors.primary : 'transparent',
                        borderColor: bedTypeFilter === t ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={t === 'single' ? 'person' : t === 'double' ? 'people' : 'grid'}
                      size={14}
                      color={bedTypeFilter === t ? '#fff' : colors.textSecondary}
                    />
                    <Text style={{ color: bedTypeFilter === t ? '#fff' : colors.textSecondary, fontSize: FontSize.sm }}>
                      {t === 'all' ? 'All Pods' : t === 'single' ? 'Single' : 'Double'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interactive Seat Map */}
              {podLayout ? (
                <PodSeatMap
                  layout={bedTypeFilter === 'all' ? podLayout : {
                    ...podLayout,
                    layout: podLayout.layout.map((row: PodRow) => ({
                      ...row,
                      slots: row.slots.map((slot: PodSlot) => ({
                        ...slot,
                        status: slot.type === bedTypeFilter ? slot.status : ('maintenance' as const),
                      })),
                    })),
                  }}
                  onSelectPod={setSelectedPodSlot}
                  selectedPodId={selectedPodSlot?.id}
                />
              ) : (
                <View style={styles.emptyTab}>
                  <Ionicons name="bed-outline" size={40} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No pod layout available
                  </Text>
                </View>
              )}
            </View>

            {/* Selected Pod Details */}
            {selectedPodSlot && (
              <View style={[styles.selectedPodCard, Shadow.md, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <View style={styles.selectedPodHeader}>
                  <View style={[styles.podLabelBig, { backgroundColor: colors.primary }]}>
                    <Text style={styles.podLabelBigText}>{selectedPodSlot.label}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedPodName, { color: colors.text }]}>
                      Pod {selectedPodSlot.label}
                    </Text>
                    <Text style={[styles.selectedPodSeries, { color: colors.textSecondary }]}>
                      {selectedPodSlot.series} · {selectedPodSlot.position} · {selectedPodSlot.type}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.selectedPodPrice, { color: colors.primary }]}>
                      {formatCurrency(podTotalPrice)}
                    </Text>
                    <Text style={[styles.selectedPodUnit, { color: colors.textTertiary }]}>
                      {formatCurrency(selectedPodSlot.hourlyRate)}/hr × {podHours}h
                    </Text>
                  </View>
                </View>

                {/* Amenities */}
                <View style={styles.selectedPodAmenities}>
                  {selectedPodSlot.amenities.map((a) => (
                    <View key={a} style={[styles.miniAmenity, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.miniAmenityText, { color: colors.textSecondary }]}>{a}</Text>
                    </View>
                  ))}
                </View>

                {/* Booking Summary */}
                <View style={[styles.bookingSummary, { borderTopColor: colors.divider }]}>
                  <View style={styles.summaryRow}>
                    <Ionicons name="calendar" size={14} color={colors.textTertiary} />
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                      {format(bookingDate, 'EEE, dd MMM yyyy')}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="time" size={14} color={colors.textTertiary} />
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                      {bookingTime} → {(() => {
                        const [h, m] = bookingTime.split(':').map(Number);
                        return `${String((h + podHours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                      })()} ({podHours}h)
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Rooms Tab ── */}
        {activeTab === 'rooms' && (
          <View style={styles.tabContent}>
            {/* Step 1: Dates */}
            <View style={[styles.bookingStep, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNum}>1</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Select Dates</Text>
              </View>

              {/* Check-in / Check-out date cards */}
              <View style={styles.roomDateRow}>
                <View style={[styles.roomDateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="log-in-outline" size={18} color={colors.primary} />
                  <View>
                    <Text style={[styles.roomDateLabel, { color: colors.textTertiary }]}>Check-in</Text>
                    <Text style={[styles.roomDateValue, { color: colors.text }]}>{format(roomCheckIn, 'EEE, dd MMM')}</Text>
                    <Text style={[styles.roomDateYear, { color: colors.textTertiary }]}>{format(roomCheckIn, 'yyyy')}</Text>
                  </View>
                </View>
                <View style={[styles.roomNightsBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="moon" size={12} color="#fff" />
                  <Text style={styles.roomNightsBadgeText}>{roomNights}N</Text>
                </View>
                <View style={[styles.roomDateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="log-out-outline" size={18} color={colors.primary} />
                  <View>
                    <Text style={[styles.roomDateLabel, { color: colors.textTertiary }]}>Check-out</Text>
                    <Text style={[styles.roomDateValue, { color: colors.text }]}>{format(roomCheckOut, 'EEE, dd MMM')}</Text>
                    <Text style={[styles.roomDateYear, { color: colors.textTertiary }]}>{format(roomCheckOut, 'yyyy')}</Text>
                  </View>
                </View>
              </View>

              {/* Date scroll for quick selection */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                {Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)).map((date) => {
                  const isCheckIn = format(date, 'yyyy-MM-dd') === format(roomCheckIn, 'yyyy-MM-dd');
                  const isCheckOut = format(date, 'yyyy-MM-dd') === format(roomCheckOut, 'yyyy-MM-dd');
                  const isBetween = date > roomCheckIn && date < roomCheckOut;
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      onPress={() => {
                        if (!isCheckIn && !isCheckOut) {
                          if (date >= startOfDay(new Date())) handleRoomCheckInChange(date);
                        }
                      }}
                      style={[
                        styles.roomDateChip,
                        {
                          backgroundColor: isCheckIn || isCheckOut ? colors.primary : isBetween ? colors.primary + '15' : colors.card,
                          borderColor: isCheckIn || isCheckOut ? colors.primary : isBetween ? colors.primary + '30' : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: isCheckIn || isCheckOut ? '#fff' : colors.textTertiary }}>
                        {isToday ? 'Today' : format(date, 'EEE')}
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: isCheckIn || isCheckOut ? '#fff' : colors.text }}>
                        {format(date, 'd')}
                      </Text>
                      <Text style={{ fontSize: 10, color: isCheckIn || isCheckOut ? 'rgba(255,255,255,0.7)' : colors.textTertiary }}>
                        {format(date, 'MMM')}
                      </Text>
                      {isCheckIn && <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>IN</Text>}
                      {isCheckOut && <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>OUT</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Step 2: Guests & Rooms */}
            <View style={[styles.bookingStep, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Guests & Rooms</Text>
              </View>
              <View style={styles.roomControls}>
                <View style={styles.durationRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Ionicons name="moon-outline" size={18} color={colors.primary} />
                    <Text style={[styles.durationLabel, { color: colors.text }]}>Nights</Text>
                  </View>
                  <View style={styles.durationControls}>
                    <TouchableOpacity onPress={() => handleRoomNightsChange(Math.max(1, roomNights - 1))} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.durationValue, { color: colors.primary }]}>{roomNights}</Text>
                    <TouchableOpacity onPress={() => handleRoomNightsChange(roomNights + 1)} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.durationRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Ionicons name="people-outline" size={18} color={colors.primary} />
                    <Text style={[styles.durationLabel, { color: colors.text }]}>Guests</Text>
                  </View>
                  <View style={styles.durationControls}>
                    <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.durationValue, { color: colors.primary }]}>{guests}</Text>
                    <TouchableOpacity onPress={() => setGuests(guests + 1)} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.durationRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Ionicons name="key-outline" size={18} color={colors.primary} />
                    <Text style={[styles.durationLabel, { color: colors.text }]}>Rooms</Text>
                  </View>
                  <View style={styles.durationControls}>
                    <TouchableOpacity onPress={() => setRoomQty(Math.max(1, roomQty - 1))} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.durationValue, { color: colors.primary }]}>{roomQty}</Text>
                    <TouchableOpacity onPress={() => setRoomQty(roomQty + 1)} style={[styles.durationBtn, { borderColor: colors.border }]}>
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Step 3: Select Room Type */}
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Select Room Type</Text>
            </View>
            {rooms.map((room) => {
              const roomTotal = room.dailyRate * roomNights * roomQty;
              const isSelected = selectedRoom?.id === room.id;
              return (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => setSelectedRoom(isSelected ? null : room)}
                  activeOpacity={0.9}
                  style={[styles.roomItem, Shadow.sm, { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.borderLight, borderWidth: isSelected ? 2 : 1 }]}
                >
                  <View style={styles.roomHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roomType, { color: colors.text }]}>{room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room</Text>
                      <Text style={[styles.roomBed, { color: colors.textTertiary }]}>{room.bedType.charAt(0).toUpperCase() + room.bedType.slice(1)} Bed · Max {room.capacity} guests</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                  </View>
                  <Text style={[styles.roomDesc, { color: colors.textSecondary }]}>{room.description}</Text>
                  <View style={styles.roomAmenities}>
                    {room.amenities.map((a) => (
                      <View key={a} style={[styles.roomAmenityChip, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.roomAmenityText, { color: colors.textSecondary }]}>{a}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Rich pricing breakdown */}
                  <View style={[styles.roomPricingBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <View style={styles.roomPriceRow}>
                      <Text style={[styles.roomPrice, { color: colors.primary }]}>{formatCurrency(roomTotal)}</Text>
                      <Text style={[styles.roomPriceUnit, { color: colors.textTertiary }]}>
                        {formatCurrency(room.dailyRate)}/night × {roomNights}N{roomQty > 1 ? ` × ${roomQty} rooms` : ''}
                      </Text>
                    </View>
                    {guests > room.capacity && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons name="information-circle" size={14} color="#f59e0b" />
                        <Text style={{ fontSize: 11, color: '#f59e0b' }}>
                          Extra guest charge: +{formatCurrency(room.extraGuestCharge)}/night per extra guest
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="log-in-outline" size={12} color={colors.textTertiary} />
                        <Text style={{ fontSize: 11, color: colors.textTertiary }}>Check-in: {property.checkInTime}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="log-out-outline" size={12} color={colors.textTertiary} />
                        <Text style={{ fontSize: 11, color: colors.textTertiary }}>Check-out: {property.checkOutTime || '11:00 AM'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.reviewSummary}>
              <View style={styles.reviewScore}>
                <Text style={[styles.reviewScoreNum, { color: colors.primary }]}>{property.rating}</Text>
                <Rating rating={property.rating} showCount={false} size="lg" />
                <Text style={[styles.reviewTotal, { color: colors.textTertiary }]}>{property.reviewsCount} reviews</Text>
              </View>
            </View>
            {reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.reviewAvatarText}>{review.userName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: colors.text }]}>{review.userName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                      <Rating rating={review.rating} showCount={false} size="sm" />
                      <Text style={[styles.reviewMeta, { color: colors.textTertiary }]}>· {review.travelType}</Text>
                    </View>
                  </View>
                  <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
                    {format(new Date(review.createdAt), 'dd MMM')}
                  </Text>
                </View>
                <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Booking Bar ── */}
      {(activeTab === 'pods' || activeTab === 'rooms') && (
        <View style={[styles.bookingBar, Shadow.xl, { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md, borderTopColor: colors.divider }]}>
          <View style={styles.bookingBarContent}>
            <View>
              {activeTab === 'pods' && selectedPodSlot ? (
                <>
                  <Text style={[styles.bookingTotal, { color: colors.primary }]}>
                    {formatCurrency(podTotalPrice)}
                  </Text>
                  <Text style={[styles.bookingDetail, { color: colors.textTertiary }]}>
                    Pod {selectedPodSlot.label} · {podHours}h · {format(bookingDate, 'dd MMM')}
                  </Text>
                </>
              ) : activeTab === 'rooms' && selectedRoom ? (
                <>
                  <Text style={[styles.bookingTotal, { color: colors.primary }]}>
                    {formatCurrency(selectedRoom.dailyRate * roomNights * roomQty)}
                  </Text>
                  <Text style={[styles.bookingDetail, { color: colors.textTertiary }]}>
                    {roomNights} night{roomNights > 1 ? 's' : ''} · {roomQty} room{roomQty > 1 ? 's' : ''} · {selectedRoom.type}
                  </Text>
                </>
              ) : (
                <Text style={[styles.bookingHint, { color: colors.textTertiary }]}>
                  {activeTab === 'pods' ? 'Select a pod on the map' : 'Select a room to book'}
                </Text>
              )}
            </View>
            <Button
              title={activeTab === 'pods' ? 'Book Pod' : 'Book Room'}
              onPress={activeTab === 'pods' ? handleBookPod : handleBookRoom}
              disabled={activeTab === 'pods' ? !selectedPodSlot : !selectedRoom}
              size="lg"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  gallery: { position: 'relative' },
  galleryImage: { width: SCREEN_WIDTH, height: 320 },
  galleryOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
  },
  galleryBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: Spacing.lg, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  imageCounter: { position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  imageCounterText: { color: '#fff', fontSize: FontSize.xs },

  info: { padding: Spacing.lg, gap: Spacing.sm },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoBadges: { flexDirection: 'row', gap: Spacing.sm },
  propertyName: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FontSize.sm, flex: 1 },
  quickStats: { flexDirection: 'row', borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginTop: Spacing.sm },
  quickStat: { flex: 1, alignItems: 'center', gap: 4 },
  quickStatValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickStatLabel: { fontSize: FontSize.xs },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: Spacing.lg },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  tabContent: { padding: Spacing.lg, gap: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  sectionSubtitle: { fontSize: FontSize.sm },
  description: { fontSize: FontSize.md, lineHeight: 24 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg },
  amenityLabel: { fontSize: FontSize.sm },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  policyText: { fontSize: FontSize.sm },
  pricingCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pricingLabel: { fontSize: FontSize.md },
  pricingValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  pricingDivider: { height: 1, marginVertical: Spacing.md },

  // Quick Book CTA
  quickBookCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1, marginTop: Spacing.sm,
  },
  quickBookLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  quickBookTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickBookSub: { fontSize: FontSize.xs },

  // Booking Steps
  bookingStep: {
    borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stepTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

  // Bed type filter
  bedTypeRow: { flexDirection: 'row', gap: Spacing.sm },
  bedTypeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1,
  },

  // Selected Pod Card
  selectedPodCard: {
    borderRadius: BorderRadius.xl, borderWidth: 2, padding: Spacing.lg, gap: Spacing.md,
  },
  selectedPodHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  podLabelBig: {
    width: 48, height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center',
  },
  podLabelBigText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  selectedPodName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  selectedPodSeries: { fontSize: FontSize.sm },
  selectedPodPrice: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  selectedPodUnit: { fontSize: FontSize.xs },
  selectedPodAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  miniAmenity: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  miniAmenityText: { fontSize: FontSize.xs },
  bookingSummary: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { fontSize: FontSize.sm },

  // Duration
  durationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  durationControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  durationBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  durationValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, minWidth: 50, textAlign: 'center' },

  // Room items
  roomControls: { gap: Spacing.md },
  roomItem: { borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomType: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  roomBed: { fontSize: FontSize.sm, marginTop: 2 },
  roomDesc: { fontSize: FontSize.sm },
  roomAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  roomAmenityChip: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  roomAmenityText: { fontSize: FontSize.xs },
  roomPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  roomPrice: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  roomPriceUnit: { fontSize: FontSize.sm },
  roomPricingBox: { borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1 },

  // Room dates
  roomDateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  roomDateCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1 },
  roomDateLabel: { fontSize: 10 },
  roomDateValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  roomDateYear: { fontSize: 10 },
  roomNightsBadge: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full, flexDirection: 'row', gap: 2 },
  roomNightsBadgeText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.bold },
  roomDateChip: { width: 54, paddingVertical: 6, borderRadius: BorderRadius.lg, borderWidth: 1, alignItems: 'center', gap: 1 },

  // Reviews
  reviewSummary: { alignItems: 'center', paddingVertical: Spacing.lg },
  reviewScore: { alignItems: 'center', gap: Spacing.sm },
  reviewScoreNum: { fontSize: FontSize['4xl'], fontWeight: FontWeight.bold },
  reviewTotal: { fontSize: FontSize.sm },
  reviewCard: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  reviewName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  reviewMeta: { fontSize: FontSize.xs },
  reviewDate: { fontSize: FontSize.xs },
  reviewComment: { fontSize: FontSize.sm, lineHeight: 20 },
  emptyTab: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center' },

  // Booking Bar
  bookingBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingTop: Spacing.md, paddingHorizontal: Spacing.lg },
  bookingBarContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingTotal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  bookingDetail: { fontSize: FontSize.xs },
  bookingHint: { fontSize: FontSize.sm },
});
