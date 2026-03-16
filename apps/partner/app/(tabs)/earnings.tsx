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
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePayoutsStore, getEarningsData, getDashboardStats } from '@/store/partner';
import type { Payout } from '@/types';

const PAYOUT_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'error',
};

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export default function EarningsScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const payouts = usePayoutsStore((s) => s.payouts);
  const stats = getDashboardStats();
  const earnings = getEarningsData(period);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const totalEarned = stats.totalRevenue;
  const monthEarned = earnings.totalEarned;
  const pendingPayout = stats.pendingPayouts;
  const avgBookingValue = earnings.avgBookingValue;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {/* Revenue Overview Card */}
        <Card style={StyleSheet.flatten([styles.revenueCard, { backgroundColor: c.primary }])}>
          <Text style={styles.revenueLabel}>Total Earnings</Text>
          <Text style={styles.revenueValue}>{formatCurrency(totalEarned)}</Text>
          <View style={styles.revenueRow}>
            <View>
              <Text style={styles.revenueSub}>This Month</Text>
              <Text style={styles.revenueSubVal}>{formatCurrency(monthEarned)}</Text>
            </View>
            <View>
              <Text style={styles.revenueSub}>Pending Payout</Text>
              <Text style={styles.revenueSubVal}>{formatCurrency(pendingPayout)}</Text>
            </View>
          </View>
        </Card>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatCard title="Avg Booking" value={formatCurrency(avgBookingValue)} icon="analytics-outline" color={c.info} />
          <StatCard title="Commission" value="10%" icon="trending-up" color={c.accent} />
        </View>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.periodBtn,
                { backgroundColor: period === p ? c.primary : c.surface, borderColor: period === p ? c.primary : c.border },
              ]}
            >
              <Text style={{ color: period === p ? c.textInverse : c.textSecondary, fontWeight: FontWeight.medium, fontSize: FontSize.sm, textTransform: 'capitalize' }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue split */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Revenue Split</Text>
        <Card>
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: c.primary }]} />
              <View>
                <Text style={[styles.splitLabel, { color: c.textSecondary }]}>Your Share (60%)</Text>
                <Text style={[styles.splitVal, { color: c.text }]}>{formatCurrency(monthEarned * 0.6)}</Text>
              </View>
            </View>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: c.textTertiary }]} />
              <View>
                <Text style={[styles.splitLabel, { color: c.textSecondary }]}>Naploo (40%)</Text>
                <Text style={[styles.splitVal, { color: c.text }]}>{formatCurrency(monthEarned * 0.4)}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Payouts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Payouts</Text>
          <Button
            title="Request Payout"
            size="sm"
            onPress={() => router.push('/payout/request' as any)}
          />
        </View>

        {payouts.map((p) => (
          <Card key={p.id} style={styles.payoutCard}>
            <View style={styles.payoutRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payoutAmount, { color: c.text }]}>
                  {formatCurrency(p.netAmount)}
                </Text>
                <Text style={[styles.payoutPeriod, { color: c.textSecondary }]}>
                  {p.periodStart} → {p.periodEnd}
                </Text>
                {p.tdsDeducted > 0 && (
                  <Text style={[styles.tds, { color: c.textTertiary }]}>
                    TDS: {formatCurrency(p.tdsDeducted)}
                  </Text>
                )}
              </View>
              <Badge
                text={p.status}
                variant={PAYOUT_STATUS_VARIANT[p.status] ?? 'default'}
              />
            </View>
          </Card>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg },
  revenueCard: {
    marginBottom: Spacing.md,
  },
  revenueLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
  },
  revenueValue: {
    color: '#fff',
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    marginVertical: Spacing.xs,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  revenueSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.xs,
  },
  revenueSubVal: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  periodBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  splitRow: {
    gap: Spacing.md,
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  splitLabel: {
    fontSize: FontSize.sm,
  },
  splitVal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  payoutCard: {
    marginBottom: Spacing.sm,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  payoutPeriod: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  tds: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
