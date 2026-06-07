import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { useSearchStore } from '@/store/search';
import { cities } from '@/data/properties';
import { getProperties } from '@/store/app';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface SearchBarProps {
  onSearch?: () => void;
  compact?: boolean;
  collapsible?: boolean;
}

type ActiveModal = null | 'city' | 'dates' | 'guests';

export function SearchBar({ onSearch, compact = false, collapsible = false }: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const { params, setParams, addRecentSearch } = useSearchStore();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [datePickTarget, setDatePickTarget] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [tempGuests, setTempGuests] = useState(params.guests || 1);
  const [tempRooms, setTempRooms] = useState(params.rooms || 1);
  const [tempPods, setTempPods] = useState(params.pods || 1);
  const [collapsed, setCollapsed] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const checkInStr = params.checkIn || format(new Date(), 'yyyy-MM-dd');
  const checkOutStr = params.checkOut || format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const properties = getProperties();

  const searchTokens = cityQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchesQuery = (value: string) => searchTokens.every((token) => value.toLowerCase().includes(token));
  const filteredCities = searchTokens.length
    ? cities.filter((c) => matchesQuery(`${c.name} ${c.state}`))
    : cities;
  const filteredProperties = searchTokens.length
    ? properties
        .filter((p) => matchesQuery(`${p.name} ${p.city} ${p.state} ${p.address} ${p.description} ${(p.amenities || []).join(' ')}`))
        .slice(0, 8)
    : [];

  const handleSearch = () => {
    addRecentSearch(params);
    if (onSearch) {
      onSearch();
    } else {
      router.push({
        pathname: '/search',
        params: {
          q: params.query || params.city || undefined,
          city: params.city || undefined,
          type: params.type && params.type !== 'all' ? params.type : undefined,
        },
      });
    }
  };

  const handleCitySelect = (cityName: string) => {
    setParams({ city: cityName, query: undefined });
    setActiveModal(null);
    setCityQuery('');
  };

  const handlePropertySelect = (property: any) => {
    setParams({ city: property.city, query: property.name });
    setActiveModal(null);
    setCityQuery('');
  };

  const handleQuerySelect = () => {
    const query = cityQuery.trim();
    if (!query) return;
    setParams({ city: undefined, query });
    setActiveModal(null);
    setCityQuery('');
  };

  const handleDayPress = useCallback((day: { dateString: string }) => {
    if (datePickTarget === 'checkIn') {
      setParams({ checkIn: day.dateString });
      // Auto-adjust check-out if it's before or same as new check-in
      if (!params.checkOut || !isBefore(new Date(day.dateString), new Date(params.checkOut))) {
        setParams({ checkOut: format(addDays(new Date(day.dateString), 1), 'yyyy-MM-dd') });
      }
      setDatePickTarget('checkOut');
    } else {
      if (isBefore(new Date(day.dateString), new Date(checkInStr)) || day.dateString === checkInStr) {
        // If picked date is before check-in, treat as new check-in
        setParams({ checkIn: day.dateString, checkOut: format(addDays(new Date(day.dateString), 1), 'yyyy-MM-dd') });
        setDatePickTarget('checkOut');
      } else {
        setParams({ checkOut: day.dateString });
        setActiveModal(null);
      }
    }
  }, [datePickTarget, checkInStr, params.checkOut, setParams]);

  const handleGuestsDone = () => {
    if (tempRooms === 0 && tempPods === 0) {
      setTempPods(1); // Ensure at least one pod or room
      return;
    }
    setParams({ guests: tempGuests, rooms: tempRooms, pods: tempPods });
    setActiveModal(null);
  };

  // Build marked dates for calendar
  const markedDates: Record<string, any> = {};
  const ciDate = new Date(checkInStr);
  const coDate = new Date(checkOutStr);
  for (let d = new Date(ciDate); d <= coDate; d = addDays(d, 1)) {
    const ds = format(d, 'yyyy-MM-dd');
    const isStart = ds === checkInStr;
    const isEnd = ds === checkOutStr;
    markedDates[ds] = {
      color: isStart || isEnd ? colors.primary : colors.primary + '30',
      textColor: isStart || isEnd ? '#fff' : colors.text,
      startingDay: isStart,
      endingDay: isEnd,
    };
  }

  const calendarTheme = {
    backgroundColor: colors.card,
    calendarBackground: colors.card,
    textSectionTitleColor: colors.textSecondary,
    dayTextColor: colors.text,
    todayTextColor: colors.primary,
    monthTextColor: colors.text,
    textDisabledColor: colors.textTertiary + '60',
    arrowColor: colors.primary,
    textMonthFontWeight: 'bold' as const,
  };

  const destinationText = params.query || params.city || 'Anywhere';
  const summaryText = `${destinationText} · ${params.checkIn ? format(new Date(params.checkIn), 'dd MMM') : 'Any dates'} · ${params.guests || 1} guest${(params.guests || 1) > 1 ? 's' : ''}${(params.pods || 0) > 0 ? ` · ${params.pods} pod${params.pods! > 1 ? 's' : ''}` : ''}${(params.rooms || 0) > 0 ? ` · ${params.rooms} room${params.rooms! > 1 ? 's' : ''}` : ''}`;

  // ── Compact variant (used on Explore/other screens) ──
  if (compact || collapsed) {
    return (
      <TouchableOpacity
        onPress={() => (collapsed ? setCollapsed(false) : router.push('/search'))}
        activeOpacity={0.9}
        style={[
          styles.compactBar,
          Shadow.md,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.primary} />
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]}>
            Where are you going?
          </Text>
          <Text style={[styles.compactSub, { color: colors.textTertiary }]}>
            {summaryText}
          </Text>
        </View>
        <View style={[styles.filterBtn, { borderColor: colors.border }]}> 
          <Ionicons name={collapsed ? 'chevron-down' : 'options-outline'} size={18} color={colors.text} />
        </View>
      </TouchableOpacity>
    );
  }

  // ── Full search card (Home screen) ──
  return (
    <>
      <View
        style={[
          styles.searchCard,
          Shadow.lg,
          { backgroundColor: colors.card },
        ]}
      >
        {collapsible && (
          <TouchableOpacity
            onPress={() => setCollapsed(true)}
            style={[styles.collapseBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={16} color={colors.primary} />
            <Text style={[styles.collapseText, { color: colors.primary }]}>Minimize search</Text>
          </TouchableOpacity>
        )}
        <View style={styles.searchHeader}>
          <Ionicons name="search" size={22} color={colors.primary} />
          <Text style={[styles.searchTitle, { color: colors.text }]}>
            Find your perfect stay
          </Text>
        </View>

        {/* City / Destination */}
        <TouchableOpacity
          onPress={() => setActiveModal('city')}
          style={[styles.searchRow, { borderBottomColor: colors.divider }]}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
          <View style={styles.searchField}>
            <Text style={[styles.searchLabel, { color: colors.textTertiary }]}>City / Destination</Text>
            <Text style={[styles.searchValue, { color: params.query || params.city ? colors.text : colors.textTertiary }]}> 
              {params.query || params.city || 'Search hotels, places & pods'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Dates */}
        <View style={styles.dateGuestRow}>
          <TouchableOpacity
            onPress={() => { setDatePickTarget('checkIn'); setActiveModal('dates'); }}
            style={[styles.dateField, { borderRightColor: colors.divider }]}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <View>
              <Text style={[styles.searchLabel, { color: colors.textTertiary }]}>Check-in</Text>
              <Text style={[styles.searchValue, { color: colors.text }]}>
                {format(new Date(checkInStr), 'dd MMM')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setDatePickTarget('checkOut'); setActiveModal('dates'); }}
            style={styles.dateField}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <View>
              <Text style={[styles.searchLabel, { color: colors.textTertiary }]}>Check-out</Text>
              <Text style={[styles.searchValue, { color: colors.text }]}>
                {format(new Date(checkOutStr), 'dd MMM')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Guests & Rooms */}
        <TouchableOpacity
          onPress={() => { setTempGuests(params.guests || 1); setTempRooms(params.rooms || 1); setTempPods(params.pods || 1); setActiveModal('guests'); }}
          style={[styles.searchRow, { borderBottomWidth: 0 }]}
          activeOpacity={0.7}
        >
          <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
          <View style={styles.searchField}>
            <Text style={[styles.searchLabel, { color: colors.textTertiary }]}>Guests, Rooms & Pods</Text>
            <Text style={[styles.searchValue, { color: colors.text }]}>
              {params.guests || 1} Guest{(params.guests || 1) > 1 ? 's' : ''}{(params.rooms || 0) > 0 ? `, ${params.rooms} Room${params.rooms! > 1 ? 's' : ''}` : ''}{(params.pods || 0) > 0 ? `, ${params.pods} Pod${params.pods! > 1 ? 's' : ''}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════ CITY MODAL ═══════ */}
      <Modal visible={activeModal === 'city'} animationType="slide" transparent>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Search Destination</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setCityQuery(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.citySearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textTertiary} />
              <TextInput
                style={[styles.citySearchInput, { color: colors.text }]}
                placeholder="Hotel, city, airport, area..."
                placeholderTextColor={colors.textTertiary}
                value={cityQuery}
                onChangeText={setCityQuery}
                autoFocus
              />
            </View>
            <FlatList
              data={[...filteredProperties.map((property) => ({ kind: 'property' as const, property })), ...filteredCities.map((city) => ({ kind: 'city' as const, city }))]}
              keyExtractor={(item) => item.kind === 'property' ? `property-${item.property.id}` : `city-${item.city.id}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => item.kind === 'property' ? handlePropertySelect(item.property) : handleCitySelect(item.city.name)}
                  style={[styles.cityItem, { borderBottomColor: colors.divider }]}
                >
                  <Ionicons name={item.kind === 'property' ? 'business' : 'location'} size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cityName, { color: colors.text }]}>
                      {item.kind === 'property' ? item.property.name : item.city.name}
                    </Text>
                    <Text style={[styles.cityState, { color: colors.textSecondary }]}>
                      {item.kind === 'property'
                        ? `${item.property.address}, ${item.property.city}`
                        : `${item.city.state} · ${item.city.propertyCount} properties · ${item.city.podCount} pods`}
                    </Text>
                  </View>
                  {((item.kind === 'property' && params.query === item.property.name) || (item.kind === 'city' && params.city === item.city.name)) && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                cityQuery.trim() ? (
                  <TouchableOpacity onPress={handleQuerySelect} style={[styles.cityItem, { borderBottomColor: colors.divider }]}> 
                    <Ionicons name="search" size={20} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cityName, { color: colors.text }]}>Search for “{cityQuery.trim()}”</Text>
                      <Text style={[styles.cityState, { color: colors.textSecondary }]}>Hotel name, address, destination, or area</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No destinations found</Text>
                )
              }
            />
          </View>
        </View>
      </Modal>

      {/* ═══════ DATE PICKER MODAL ═══════ */}
      <Modal visible={activeModal === 'dates'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select {datePickTarget === 'checkIn' ? 'Check-in' : 'Check-out'} Date
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Date summary */}
            <View style={styles.dateSummaryRow}>
              <Pressable
                onPress={() => setDatePickTarget('checkIn')}
                style={[
                  styles.dateSummaryBox,
                  { backgroundColor: datePickTarget === 'checkIn' ? colors.primary + '20' : colors.surface, borderColor: datePickTarget === 'checkIn' ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.dateSummaryLabel, { color: colors.textSecondary }]}>Check-in</Text>
                <Text style={[styles.dateSummaryValue, { color: colors.text }]}>
                  {format(new Date(checkInStr), 'dd MMM yyyy')}
                </Text>
              </Pressable>
              <Ionicons name="arrow-forward" size={18} color={colors.textTertiary} />
              <Pressable
                onPress={() => setDatePickTarget('checkOut')}
                style={[
                  styles.dateSummaryBox,
                  { backgroundColor: datePickTarget === 'checkOut' ? colors.primary + '20' : colors.surface, borderColor: datePickTarget === 'checkOut' ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.dateSummaryLabel, { color: colors.textSecondary }]}>Check-out</Text>
                <Text style={[styles.dateSummaryValue, { color: colors.text }]}>
                  {format(new Date(checkOutStr), 'dd MMM yyyy')}
                </Text>
              </Pressable>
            </View>

            <Calendar
              markingType="period"
              markedDates={markedDates}
              onDayPress={handleDayPress}
              minDate={today}
              theme={calendarTheme}
              style={{ borderRadius: BorderRadius.md }}
            />

            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[styles.modalDoneBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════ GUESTS & ROOMS MODAL ═══════ */}
      <Modal visible={activeModal === 'guests'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: 480 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Guests, Rooms & Pods</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Rooms */}
            <View style={[styles.counterRow, { borderBottomColor: colors.divider }]}>
              <View>
                <Text style={[styles.counterLabel, { color: colors.text }]}>Rooms</Text>
                <Text style={[styles.counterSub, { color: colors.textSecondary }]}>Number of rooms</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  onPress={() => setTempRooms(Math.max(0, tempRooms - 1))}
                  style={[styles.counterBtn, { borderColor: colors.border, opacity: tempRooms <= 0 ? 0.4 : 1 }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.text }]}>{tempRooms}</Text>
                <TouchableOpacity
                  onPress={() => setTempRooms(Math.min(10, tempRooms + 1))}
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Guests */}
            <View style={[styles.counterRow, { borderBottomColor: colors.divider }]}>
              <View>
                <Text style={[styles.counterLabel, { color: colors.text }]}>Guests</Text>
                <Text style={[styles.counterSub, { color: colors.textSecondary }]}>Total number of guests</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  onPress={() => setTempGuests(Math.max(1, tempGuests - 1))}
                  style={[styles.counterBtn, { borderColor: colors.border, opacity: tempGuests <= 1 ? 0.4 : 1 }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.text }]}>{tempGuests}</Text>
                <TouchableOpacity
                  onPress={() => setTempGuests(Math.min(20, tempGuests + 1))}
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pods */}
            <View style={styles.counterRow}>
              <View>
                <Text style={[styles.counterLabel, { color: colors.text }]}>Pods</Text>
                <Text style={[styles.counterSub, { color: colors.textSecondary }]}>Number of pods</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  onPress={() => setTempPods(Math.max(0, tempPods - 1))}
                  style={[styles.counterBtn, { borderColor: colors.border, opacity: tempPods <= 0 ? 0.4 : 1 }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.text }]}>{tempPods}</Text>
                <TouchableOpacity
                  onPress={() => setTempPods(Math.min(10, tempPods + 1))}
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {tempRooms === 0 && tempPods === 0 && (
              <Text style={[styles.validationMsg, { color: colors.error }]}>
                Select at least 1 room or 1 pod
              </Text>
            )}

            <TouchableOpacity
              onPress={handleGuestsDone}
              style={[styles.modalDoneBtn, { backgroundColor: tempRooms === 0 && tempPods === 0 ? colors.textTertiary : colors.primary }]}
              disabled={tempRooms === 0 && tempPods === 0}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Compact variant ──
  compactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  compactContent: { flex: 1 },
  compactTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  compactSub: { fontSize: FontSize.xs },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  collapseText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  // ── Full search card ──
  searchCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  searchField: { flex: 1 },
  searchLabel: { fontSize: FontSize.xs, marginBottom: 2 },
  searchValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  dateGuestRow: { flexDirection: 'row' },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    paddingRight: Spacing.md,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  // ── Modal shared ──
  validationMsg: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  modalDoneBtn: {
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  modalDoneBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  // ── City modal ──
  citySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  citySearchInput: { flex: 1, fontSize: FontSize.md },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  cityName: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  cityState: { fontSize: FontSize.xs, marginTop: 2 },
  emptyText: { textAlign: 'center', padding: Spacing.xl, fontSize: FontSize.sm },
  // ── Date modal ──
  dateSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  dateSummaryBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateSummaryLabel: { fontSize: FontSize.xs, marginBottom: 2 },
  dateSummaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  // ── Guests modal ──
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  counterLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  counterSub: { fontSize: FontSize.xs, marginTop: 2 },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, minWidth: 28, textAlign: 'center' },
});
