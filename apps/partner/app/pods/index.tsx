import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { PodSet, Pod } from '@/types';
import { useMemo } from 'react';

function generatePodSets(): (PodSet & { pods: Pod[] })[] {
  const sections = ['A', 'B', 'C'];
  const ownerships: PodSet['ownership'][] = ['naploo', 'investor', 'naploo'];
  const podTypes: Pod['podType'][] = ['single', 'double', 'single'];
  const statuses: Pod['status'][] = ['available', 'occupied', 'maintenance', 'available', 'available', 'available'];

  return sections.map((section, i) => ({
    id: String(i + 1),
    partnerId: 'p1',
    ownership: ownerships[i],
    floor: Math.floor(i / 2) + 1,
    section,
    setNumber: `PS-${String(i + 1).padStart(3, '0')}`,
    hourlyRate: i % 2 === 0 ? 150 : 200,
    isActive: true,
    installedAt: `2024-${String(8 + i).padStart(2, '0')}-01`,
    pods: [
      { id: `p${i * 2 + 1}`, podSetId: String(i + 1), podNumber: `${section}${Math.floor(i / 2) + 1}-U`, position: 'upper' as const, podType: podTypes[i], status: statuses[i * 2], hasAC: true, hasTV: true, hasCharger: true, hasLight: true, hasVentilation: true, lastMaintenanceAt: null },
      { id: `p${i * 2 + 2}`, podSetId: String(i + 1), podNumber: `${section}${Math.floor(i / 2) + 1}-L`, position: 'lower' as const, podType: podTypes[i], status: statuses[i * 2 + 1], hasAC: true, hasTV: true, hasCharger: true, hasLight: true, hasVentilation: true, lastMaintenanceAt: statuses[i * 2 + 1] === 'maintenance' ? '2025-01-10' : null },
    ],
  }));
}

const POD_STATUS_COLOR: Record<string, string> = {
  available: '#16a34a',
  occupied: '#7c3aed',
  maintenance: '#d97706',
  inactive: '#dc2626',
};

export default function PodsScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();

  const podSets = useMemo(() => generatePodSets(), []);
  const allPods = useMemo(() => podSets.flatMap((s) => s.pods), [podSets]);
  const counts = useMemo(() => ({
    available: allPods.filter((p) => p.status === 'available').length,
    occupied: allPods.filter((p) => p.status === 'occupied').length,
    maintenance: allPods.filter((p) => p.status === 'maintenance').length,
  }), [allPods]);

  function renderPodSet({ item }: { item: (typeof podSets)[0] }) {
    return (
      <Card style={styles.setCard}>
        <View style={styles.setHeader}>
          <View>
            <Text style={[styles.setNum, { color: c.text }]}>{item.setNumber}</Text>
            <Text style={[styles.setSub, { color: c.textSecondary }]}>
              Floor {item.floor} · Section {item.section}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.rate, { color: c.primary }]}>₹{item.hourlyRate}/hr</Text>
            <Badge text={item.ownership} variant={item.ownership === 'naploo' ? 'info' : item.ownership === 'investor' ? 'warning' : 'success'} />
          </View>
        </View>

        <View style={[styles.podsGrid, { borderTopColor: c.divider }]}>
          {item.pods.map((pod) => (
            <View key={pod.id} style={[styles.podItem, { backgroundColor: c.surface }]}>
              <View style={[styles.statusDot, { backgroundColor: POD_STATUS_COLOR[pod.status] }]} />
              <View>
                <Text style={[styles.podNum, { color: c.text }]}>{pod.podNumber}</Text>
                <Text style={[styles.podDetail, { color: c.textTertiary }]}>
                  {pod.position} · {pod.podType}
                </Text>
              </View>
              <Text style={[styles.podStatus, { color: POD_STATUS_COLOR[pod.status] }]}>
                {pod.status}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <FlatList
      data={podSets}
      renderItem={renderPodSet}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: c.background }}
      ListHeaderComponent={
        <View>
          {/* Layout Config Button */}
          <TouchableOpacity
            onPress={() => router.push('/pods/layout')}
            style={[styles.layoutBtn, { backgroundColor: c.primary + '12', borderColor: c.primary + '40' }]}
          >
            <Ionicons name="grid-outline" size={20} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.layoutBtnTitle, { color: c.text }]}>Pod Layout Setup</Text>
              <Text style={[styles.layoutBtnSub, { color: c.textSecondary }]}>Configure pod alignment, rows & positions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.primary} />
          </TouchableOpacity>

          <View style={styles.summary}>
            <View style={[styles.summaryItem, { backgroundColor: '#16a34a15' }]}>
              <Text style={[styles.summaryVal, { color: '#16a34a' }]}>{counts.available}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Available</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.summaryVal, { color: c.primary }]}>{counts.occupied}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Occupied</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: '#d9770615' }]}>
              <Text style={[styles.summaryVal, { color: '#d97706' }]}>{counts.maintenance}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Maintenance</Text>
            </View>
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg },
  layoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  layoutBtnTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  layoutBtnSub: { fontSize: FontSize.xs, marginTop: 2 },
  summary: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  summaryVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, marginTop: 2 },
  setCard: { marginBottom: Spacing.md },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  setNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  setSub: { fontSize: FontSize.sm, marginTop: 2 },
  rate: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  podsGrid: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.sm },
  podItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  podNum: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  podDetail: { fontSize: FontSize.xs },
  podStatus: { marginLeft: 'auto', fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
});
