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
import { Button } from '@/components/ui/Button';
import { useRoomsStore } from '@/store/partner';
import type { Room } from '@/types';

type InventoryTab = 'rooms' | 'pods';

const ROOM_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  occupied: 'info' as any,
  maintenance: 'warning',
  inactive: 'error',
};

export default function InventoryScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<InventoryTab>('rooms');
  const [refreshing, setRefreshing] = useState(false);
  const rooms = useRoomsStore((s) => s.rooms);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  function renderRoom({ item }: { item: Room }) {
    return (
      <TouchableOpacity onPress={() => router.push(`/room/${item.id}` as any)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.roomIcon, { backgroundColor: c.primary + '15' }]}>
              <Ionicons name="bed-outline" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roomName, { color: c.text }]}>{item.name}</Text>
              <Text style={[styles.roomNum, { color: c.textSecondary }]}>
                Room {item.roomNumber} · Floor {item.floor}
              </Text>
            </View>
            <Badge text={item.status} variant={ROOM_STATUS_VARIANT[item.status] ?? 'default'} />
          </View>

          <View style={[styles.details, { borderTopColor: c.divider }]}>
            <DetailItem icon="people-outline" text={`${item.maxGuests} guests`} c={c} />
            <DetailItem icon="bed-outline" text={`${item.bedType} bed`} c={c} />
            <DetailItem icon="resize-outline" text={item.areaSqFt ? `${item.areaSqFt} sqft` : '-'} c={c} />
          </View>

          <View style={styles.pricing}>
            <Text style={[styles.price, { color: c.text }]}>₹{item.dailyRate}</Text>
            <Text style={[styles.perNight, { color: c.textTertiary }]}>/night</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      {/* Tab toggle */}
      <View style={[styles.tabRow, { backgroundColor: c.surface }]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'rooms' && { backgroundColor: c.primary }]}
          onPress={() => setTab('rooms')}
        >
          <Ionicons name="bed" size={16} color={tab === 'rooms' ? c.textInverse : c.textSecondary} />
          <Text style={{ color: tab === 'rooms' ? c.textInverse : c.textSecondary, fontWeight: FontWeight.semibold }}>
            Rooms ({rooms.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'pods' && { backgroundColor: c.primary }]}
          onPress={() => setTab('pods')}
        >
          <Ionicons name="cube" size={16} color={tab === 'pods' ? c.textInverse : c.textSecondary} />
          <Text style={{ color: tab === 'pods' ? c.textInverse : c.textSecondary, fontWeight: FontWeight.semibold }}>
            Pods (32)
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'rooms' ? (
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
          }
          ListFooterComponent={
            <Button
              title="+ Add Room"
              variant="outline"
              onPress={() => router.push('/room/create' as any)}
              style={{ marginTop: Spacing.md }}
            />
          }
        />
      ) : (
        <View style={styles.podPlaceholder}>
          <TouchableOpacity
            style={[styles.podCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push('/pods' as any)}
          >
            <Ionicons name="cube-outline" size={40} color={c.primary} />
            <Text style={[styles.podTitle, { color: c.text }]}>Manage Pod Sets</Text>
            <Text style={[styles.podSub, { color: c.textSecondary }]}>
              4 pod sets · 32 individual pods
            </Text>
            <Ionicons name="chevron-forward" size={20} color={c.textTertiary} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function DetailItem({ icon, text, c }: { icon: any; text: string; c: any }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={14} color={c.textTertiary} />
      <Text style={[styles.detailText, { color: c.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    margin: Spacing.lg,
    backgroundColor: '#f1f5f9',
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
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
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  roomNum: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FontSize.xs,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  perNight: {
    fontSize: FontSize.sm,
    marginLeft: 4,
  },
  podPlaceholder: {
    padding: Spacing.lg,
  },
  podCard: {
    alignItems: 'center',
    padding: Spacing['3xl'],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  podTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  podSub: {
    fontSize: FontSize.sm,
  },
});
