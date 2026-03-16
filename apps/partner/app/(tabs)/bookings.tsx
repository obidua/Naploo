import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePartnerBookingsStore } from '@/store/partner';
import type { Booking } from '@/types';

type BookingFilter = 'all' | 'today' | 'upcoming' | 'checked_in' | 'completed';

const FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'checked_in', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  confirmed: 'info',
  checked_in: 'success',
  checked_out: 'default',
  pending: 'warning',
  cancelled: 'error',
  no_show: 'error',
};

export default function BookingsScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const getFiltered = usePartnerBookingsStore((s) => s.getFiltered);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const filtered = getFiltered(filter);

  function renderBooking({ item }: { item: Booking }) {
    const checkInDate = new Date(item.checkIn);

    return (
      <TouchableOpacity onPress={() => router.push(`/booking/${item.id}` as any)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.typeTag}>
              <Ionicons
                name={item.bookingType === 'pod' ? 'cube' : 'bed'}
                size={14}
                color={c.primary}
              />
              <Text style={[styles.typeText, { color: c.primary }]}>
                {item.bookingType === 'pod' ? 'Pod' : 'Room'}
              </Text>
            </View>
            <Badge
              text={item.status.replace('_', ' ')}
              variant={STATUS_VARIANT[item.status] ?? 'default'}
            />
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.bookingNum, { color: c.text }]}>{item.bookingNumber}</Text>
            <Text style={[styles.guest, { color: c.textSecondary }]}>
              {item.guest?.firstName} {item.guest?.lastName} · {item.guestCount} guest
              {item.guestCount > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.date, { color: c.textTertiary }]}>
              <Ionicons name="calendar-outline" size={12} color={c.textTertiary} />{' '}
              {checkInDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: c.divider }]}>
            <Text style={[styles.amount, { color: c.text }]}>₹{item.total}</Text>
            <Text style={[styles.yourShare, { color: c.success }]}>
              Your share: ₹{item.ownerShare}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f.key ? c.primary : c.surface,
                borderColor: filter === f.key ? c.primary : c.border,
              },
            ]}
          >
            <Text
              style={{
                color: filter === f.key ? c.textInverse : c.textSecondary,
                fontSize: FontSize.sm,
                fontWeight: FontWeight.medium,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={c.textTertiary} />
            <Text style={{ color: c.textSecondary, marginTop: Spacing.md }}>No bookings found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  cardBody: {
    marginBottom: Spacing.sm,
  },
  bookingNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  guest: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  date: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  amount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  yourShare: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
});
