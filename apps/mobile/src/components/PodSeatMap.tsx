import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';
import type { PodLayout, PodSlot, PodSlotStatus } from '@/types';
import { formatCurrency } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PodSeatMapProps {
  layout: PodLayout;
  onSelectPod: (pod: PodSlot | null) => void;
  selectedPodId?: string;
}

const STATUS_COLORS: Record<PodSlotStatus, { bg: string; border: string; text: string }> = {
  available: { bg: 'rgba(124, 58, 237, 0.1)', border: '#7c3aed', text: '#7c3aed' },
  occupied: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
  selected: { bg: '#7c3aed', border: '#8b5cf6', text: '#ffffff' },
  maintenance: { bg: 'rgba(100, 116, 139, 0.1)', border: '#64748b', text: '#64748b' },
};

const DARK_STATUS_COLORS: Record<PodSlotStatus, { bg: string; border: string; text: string }> = {
  available: { bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa', text: '#a78bfa' },
  occupied: { bg: 'rgba(248, 113, 113, 0.15)', border: '#f87171', text: '#f87171' },
  selected: { bg: '#a78bfa', border: '#c4b5fd', text: '#0f0a1e' },
  maintenance: { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748b', text: '#64748b' },
};

export function PodSeatMap({ layout, onSelectPod, selectedPodId }: PodSeatMapProps) {
  const { colors, isDark } = useTheme();
  const statusColors = isDark ? DARK_STATUS_COLORS : STATUS_COLORS;
  const podWidth = Math.min(48, (SCREEN_WIDTH - 120) / (layout.cols * 2 + 1));

  const handlePress = (slot: PodSlot) => {
    if (slot.status !== 'available' && slot.status !== 'selected') return;
    if (selectedPodId === slot.id) {
      onSelectPod(null);
    } else {
      onSelectPod(slot);
    }
  };

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        {(['available', 'selected', 'occupied', 'maintenance'] as PodSlotStatus[]).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: statusColors[status].bg, borderColor: statusColors[status].border },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Pod Map */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.mapWrapper}>
          {/* Entrance label */}
          <View style={[styles.entranceBar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
            <Ionicons name="enter-outline" size={14} color={colors.primary} />
            <Text style={[styles.entranceText, { color: colors.primary }]}>ENTRANCE</Text>
          </View>

          {/* Aisle + Rows */}
          {layout.layout.map((row, rIdx) => (
            <View key={row.rowIndex ?? rIdx} style={styles.rowContainer}>
              {/* Row label */}
              <View style={styles.rowLabel}>
                <Text style={[styles.rowLabelText, { color: colors.textTertiary }]}>
                  {String(row.label ?? `R${(row.rowIndex ?? rIdx) + 1}`).replace('Row ', '')}
                </Text>
              </View>

              {/* Pod sets (2 high per column) */}
              <View style={styles.podSetRow}>
                {Array.from({ length: layout.cols }).map((_, colIdx) => {
                  const upperSlot = row.slots.find((s) => s.col === colIdx && s.position === 'upper');
                  const lowerSlot = row.slots.find((s) => s.col === colIdx && s.position === 'lower');
                  return (
                    <View key={colIdx} style={styles.podSet}>
                      {/* Upper pod */}
                      {upperSlot && (
                        <PodSlotView
                          slot={{ ...upperSlot, status: selectedPodId === upperSlot.id ? 'selected' : upperSlot.status }}
                          colors={statusColors}
                          size={podWidth}
                          onPress={() => handlePress(upperSlot)}
                          themeColors={colors}
                        />
                      )}
                      {/* Lower pod */}
                      {lowerSlot && (
                        <PodSlotView
                          slot={{ ...lowerSlot, status: selectedPodId === lowerSlot.id ? 'selected' : lowerSlot.status }}
                          colors={statusColors}
                          size={podWidth}
                          onPress={() => handlePress(lowerSlot)}
                          themeColors={colors}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Aisle */}
          <View style={[styles.aisleBar, { borderColor: colors.divider }]}>
            <Text style={[styles.aisleText, { color: colors.textTertiary }]}>─── AISLE ───</Text>
          </View>
        </View>
      </ScrollView>

      {/* Stats */}
      <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.success }]}>{layout.availablePods}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Available</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.error }]}>{layout.totalPods - layout.availablePods}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Occupied</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.text }]}>{layout.totalPods}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total</Text>
        </View>
      </View>
    </View>
  );
}

function PodSlotView({
  slot,
  colors,
  size,
  onPress,
  themeColors,
}: {
  slot: PodSlot & { status: PodSlotStatus };
  colors: Record<PodSlotStatus, { bg: string; border: string; text: string }>;
  size: number;
  onPress: () => void;
  themeColors: any;
}) {
  const sc = colors[slot.status];
  const isSelectable = slot.status === 'available' || slot.status === 'selected';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isSelectable}
      activeOpacity={0.7}
      style={[
        styles.podSlot,
        {
          width: size,
          height: size * 0.7,
          backgroundColor: sc.bg,
          borderColor: sc.border,
          borderWidth: slot.status === 'selected' ? 2 : 1,
        },
      ]}
    >
      <Ionicons
        name={slot.position === 'upper' ? 'arrow-up' : 'arrow-down'}
        size={8}
        color={sc.text}
      />
      <Text
        style={[styles.podSlotLabel, { color: sc.text, fontSize: Math.max(7, size * 0.18) }]}
        numberOfLines={1}
      >
        {slot.label.split('-')[0]}
      </Text>
      <Text style={[styles.podSlotPos, { color: sc.text, fontSize: Math.max(6, size * 0.14) }]}>
        {slot.position === 'upper' ? 'UP' : 'LO'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendText: { fontSize: FontSize.xs },

  mapWrapper: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: SCREEN_WIDTH - 32,
  },

  entranceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  entranceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 2 },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    width: 20,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rowLabelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  podSetRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  podSet: {
    gap: 3,
    alignItems: 'center',
  },

  podSlot: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  podSlotLabel: {
    fontWeight: FontWeight.bold,
  },
  podSlotPos: {
    fontWeight: FontWeight.medium,
  },

  aisleBar: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  aisleText: {
    fontSize: FontSize.xs,
    letterSpacing: 3,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs },
  statDivider: { width: 1, height: '100%' },
});
