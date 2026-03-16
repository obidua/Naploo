import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { useBookingsStore } from '@/store/app';
import { formatCurrency, formatDate } from '@/utils';
import type { Booking, BookingStatus } from '@/types';

type Tab = 'upcoming' | 'past' | 'cancelled';

const statusConfig: Record<BookingStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  checked_in: { label: 'Checked In', variant: 'info' },
  checked_out: { label: 'Completed', variant: 'neutral' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  no_show: { label: 'No Show', variant: 'error' },
};

export default function BookingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { getByStatus } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const filteredBookings = getByStatus(activeTab);

  const onRefresh = () => {
    setRefreshing(true);
    // Re-read from store triggers re-render
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Bookings</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Login to view your bookings and manage reservations
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.loginBtnText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.divider }]}>
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.textTertiary },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          return (
            <TouchableOpacity
              onPress={() => router.push(`/booking/${item.id}` as any)}
              activeOpacity={0.9}
              style={[styles.bookingCard, Shadow.md, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={[styles.bookingNumber, { color: colors.textTertiary }]}>
                    {item.bookingNumber}
                  </Text>
                  <Text style={[styles.propertyName, { color: colors.text }]}>
                    {item.propertyName}
                  </Text>
                </View>
                <Badge text={config.label} variant={config.variant} />
              </View>

              <View style={[styles.bookingDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.bookingDetails}>
                <View style={styles.bookingDetail}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.city}</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <Ionicons
                    name={item.bookingType === 'pod' ? 'bed-outline' : 'business-outline'}
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {item.bookingType === 'pod'
                      ? `Pod · ${item.duration}hr`
                      : `Room · ${item.guestCount} guest${item.guestCount > 1 ? 's' : ''}`}
                  </Text>
                </View>
                <View style={styles.bookingDetail}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {formatDate(item.checkIn)}
                  </Text>
                </View>
              </View>

              <View style={[styles.bookingFooter, { borderTopColor: colors.divider }]}>
                <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {activeTab} bookings
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {activeTab === 'upcoming'
                ? 'Book a pod or room to see your reservations here'
                : 'Your past bookings will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: Spacing.md },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bookingCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingNumber: { fontSize: FontSize.xs, marginBottom: 2 },
  propertyName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  bookingDivider: { height: 1, marginVertical: Spacing.md },
  bookingDetails: { gap: Spacing.sm },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: { fontSize: FontSize.sm },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: undefined,
  },
  totalLabel: { fontSize: FontSize.sm },
  totalAmount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: Spacing['3xl'] },
  loginBtn: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  loginBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
