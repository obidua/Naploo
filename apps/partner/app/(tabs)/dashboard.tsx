import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { getDashboardStats, usePartnerBookingsStore } from '@/store/partner';
import type { DashboardStats, Booking } from '@/types';

function formatCurrency(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  confirmed: 'info',
  checked_in: 'success',
  checked_out: 'default',
  pending: 'warning',
  cancelled: 'error',
  no_show: 'error',
};

export default function DashboardScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const allBookings = usePartnerBookingsStore((s) => s.bookings);
  const stats = getDashboardStats();
  const recentBookings = allBookings.slice(0, 3);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: fetch real data from partnerApi.getDashboard()
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>{greeting} 👋</Text>
            <Text style={[styles.name, { color: c.text }]}>
              {user?.firstName || 'Partner'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: c.surface }]}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <Ionicons name="notifications-outline" size={22} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Today Check-ins"
            value={stats.todayCheckIns}
            icon="enter-outline"
            color={c.info}
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon="time-outline"
            color={c.success}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Month Revenue"
            value={formatCurrency(stats.monthRevenue)}
            icon="trending-up"
            color={c.primary}
          />
          <StatCard
            title="Occupancy"
            value={`${stats.occupancyRate}%`}
            icon="pie-chart-outline"
            color={c.secondary}
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { label: 'Rooms', icon: 'bed-outline' as const, route: '/(tabs)/inventory' },
            { label: 'Pods', icon: 'cube-outline' as const, route: '/pods' },
            { label: 'Payouts', icon: 'cash-outline' as const, route: '/payout/request' },
            { label: 'Property', icon: 'business-outline' as const, route: '/property/edit' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: c.surface }]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: c.primary + '18' }]}>
                <Ionicons name={a.icon} size={20} color={c.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: c.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
            <Text style={{ color: c.primary, fontWeight: FontWeight.semibold }}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentBookings.map((b) => (
          <TouchableOpacity
            key={b.id}
            onPress={() => router.push(`/booking/${b.id}` as any)}
          >
            <Card style={styles.bookingCard}>
              <View style={styles.bookingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bookingNum, { color: c.text }]}>{b.bookingNumber}</Text>
                  <Text style={[styles.guestName, { color: c.textSecondary }]}>
                    {b.guest?.firstName} {b.guest?.lastName} · {b.guestCount} guest
                    {b.guestCount > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.amount, { color: c.text }]}>₹{b.total}</Text>
                  <Badge
                    text={b.status.replace('_', ' ')}
                    variant={STATUS_VARIANT[b.status] ?? 'default'}
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Property Summary */}
        <Text style={[styles.sectionTitle, { color: c.text, marginTop: Spacing.md }]}>
          Property Summary
        </Text>
        <Card>
          <View style={styles.summaryRow}>
            <SummaryItem label="Rooms" value={String(stats.totalRooms)} c={c} />
            <SummaryItem label="Pods" value={String(stats.totalPods)} c={c} />
            <SummaryItem label="Rating" value={stats.rating.toFixed(1)} c={c} />
            <SummaryItem label="Reviews" value={String(stats.totalReviews)} c={c} />
          </View>
        </Card>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, c }: { label: string; value: string; c: any }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.sm },
  name: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  bookingCard: {
    marginBottom: Spacing.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  guestName: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
