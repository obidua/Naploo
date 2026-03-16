import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type PodStatus = 'active' | 'inactive' | 'maintenance';

interface LayoutSlot {
  row: number;
  col: number;
  position: 'upper' | 'lower';
  type: 'single' | 'double';
  status: PodStatus;
  label: string;
}

const ROW_LABELS = 'ABCDEFGHIJ';

export default function PodLayoutScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();

  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(4);
  const [slots, setSlots] = useState<LayoutSlot[]>(() => generateSlots(2, 4));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  function generateSlots(r: number, co: number): LayoutSlot[] {
    const result: LayoutSlot[] = [];
    for (let row = 0; row < r; row++) {
      for (let col = 0; col < co; col++) {
        for (const pos of ['lower', 'upper'] as const) {
          const label = `${ROW_LABELS[row]}${col + 1}-${pos === 'lower' ? 'L' : 'U'}`;
          result.push({ row, col, position: pos, type: 'single', status: 'active', label });
        }
      }
    }
    return result;
  }

  function updateLayout(newRows: number, newCols: number) {
    setRows(newRows);
    setCols(newCols);
    setSlots(generateSlots(newRows, newCols));
    setSelectedSlot(null);
  }

  function toggleSlotStatus(label: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.label !== label) return s;
        const order: PodStatus[] = ['active', 'inactive', 'maintenance'];
        const next = order[(order.indexOf(s.status) + 1) % order.length];
        return { ...s, status: next };
      })
    );
  }

  function toggleSlotType(label: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.label !== label) return s;
        return { ...s, type: s.type === 'single' ? 'double' : 'single' };
      })
    );
  }

  const statusColor: Record<PodStatus, string> = {
    active: '#16a34a',
    inactive: '#64748b',
    maintenance: '#d97706',
  };

  const activeCount = slots.filter((s) => s.status === 'active').length;
  const inactiveCount = slots.filter((s) => s.status === 'inactive').length;
  const maintenanceCount = slots.filter((s) => s.status === 'maintenance').length;
  const selected = selectedSlot ? slots.find((s) => s.label === selectedSlot) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Pod Layout Setup</Text>
        <TouchableOpacity onPress={() => Alert.alert('Saved', 'Pod layout configuration saved!')}>
          <Text style={[styles.saveBtn, { color: c.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        Configure your pod alignment. Tap pods to change status, long press for type.
      </Text>

      {/* Grid Size Controls */}
      <View style={[styles.sizeCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.sizeTitle, { color: c.text }]}>Grid Size</Text>
        <View style={styles.sizeRow}>
          <View style={styles.sizeControl}>
            <Text style={[styles.sizeLabel, { color: c.textSecondary }]}>Rows</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => rows > 1 && updateLayout(rows - 1, cols)} style={[styles.stepBtn, { borderColor: c.border }]}>
                <Ionicons name="remove" size={16} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.stepVal, { color: c.primary }]}>{rows}</Text>
              <TouchableOpacity onPress={() => rows < 10 && updateLayout(rows + 1, cols)} style={[styles.stepBtn, { borderColor: c.border }]}>
                <Ionicons name="add" size={16} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.sizeDivider, { backgroundColor: c.divider }]} />
          <View style={styles.sizeControl}>
            <Text style={[styles.sizeLabel, { color: c.textSecondary }]}>Pods Per Row</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => cols > 1 && updateLayout(rows, cols - 1)} style={[styles.stepBtn, { borderColor: c.border }]}>
                <Ionicons name="remove" size={16} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.stepVal, { color: c.primary }]}>{cols}</Text>
              <TouchableOpacity onPress={() => cols < 10 && updateLayout(rows, cols + 1)} style={[styles.stepBtn, { borderColor: c.border }]}>
                <Ionicons name="add" size={16} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={[styles.totalText, { color: c.textTertiary }]}>
          Total: {slots.length} pods ({rows} rows × {cols} sets × 2 levels)
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: statusColor.active + '18' }]}>
          <View style={[styles.statDot, { backgroundColor: statusColor.active }]} />
          <Text style={[styles.statText, { color: statusColor.active }]}>{activeCount} Active</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: statusColor.inactive + '18' }]}>
          <View style={[styles.statDot, { backgroundColor: statusColor.inactive }]} />
          <Text style={[styles.statText, { color: statusColor.inactive }]}>{inactiveCount} Inactive</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: statusColor.maintenance + '18' }]}>
          <View style={[styles.statDot, { backgroundColor: statusColor.maintenance }]} />
          <Text style={[styles.statText, { color: statusColor.maintenance }]}>{maintenanceCount} Maint.</Text>
        </View>
      </View>

      {/* Pod Layout Grid */}
      <View style={[styles.gridCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.gridHeader}>
          <Ionicons name="bed-outline" size={16} color={c.primary} />
          <Text style={[styles.gridTitle, { color: c.text }]}>Pod Alignment Preview</Text>
        </View>

        {/* Entrance */}
        <View style={[styles.entranceBar, { borderColor: c.primary + '40' }]}>
          <Text style={[styles.entranceText, { color: c.primary }]}>ENTRANCE</Text>
        </View>

        {/* Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.grid}>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <View key={rowIdx} style={styles.gridRow}>
                <Text style={[styles.rowLbl, { color: c.textTertiary }]}>{ROW_LABELS[rowIdx]}</Text>
                {Array.from({ length: cols }).map((_, colIdx) => {
                  const upper = slots.find((s) => s.row === rowIdx && s.col === colIdx && s.position === 'upper');
                  const lower = slots.find((s) => s.row === rowIdx && s.col === colIdx && s.position === 'lower');
                  return (
                    <View key={colIdx} style={styles.podSet}>
                      {upper && (
                        <TouchableOpacity
                          onPress={() => { toggleSlotStatus(upper.label); setSelectedSlot(upper.label); }}
                          onLongPress={() => toggleSlotType(upper.label)}
                          style={[
                            styles.podCell,
                            {
                              backgroundColor: statusColor[upper.status] + '20',
                              borderColor: selectedSlot === upper.label ? c.primary : statusColor[upper.status],
                              borderWidth: selectedSlot === upper.label ? 2 : 1,
                            },
                          ]}
                        >
                          <Text style={[styles.podCellLabel, { color: statusColor[upper.status] }]}>
                            {upper.label.split('-')[0]}
                          </Text>
                          <Text style={[styles.podCellPos, { color: statusColor[upper.status] }]}>UP</Text>
                          {upper.type === 'double' && (
                            <Ionicons name="people" size={8} color={statusColor[upper.status]} />
                          )}
                        </TouchableOpacity>
                      )}
                      {lower && (
                        <TouchableOpacity
                          onPress={() => { toggleSlotStatus(lower.label); setSelectedSlot(lower.label); }}
                          onLongPress={() => toggleSlotType(lower.label)}
                          style={[
                            styles.podCell,
                            {
                              backgroundColor: statusColor[lower.status] + '20',
                              borderColor: selectedSlot === lower.label ? c.primary : statusColor[lower.status],
                              borderWidth: selectedSlot === lower.label ? 2 : 1,
                            },
                          ]}
                        >
                          <Text style={[styles.podCellLabel, { color: statusColor[lower.status] }]}>
                            {lower.label.split('-')[0]}
                          </Text>
                          <Text style={[styles.podCellPos, { color: statusColor[lower.status] }]}>LO</Text>
                          {lower.type === 'double' && (
                            <Ionicons name="people" size={8} color={statusColor[lower.status]} />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Aisle */}
        <View style={[styles.aisleLine, { borderColor: c.divider }]}>
          <Text style={[styles.aisleText, { color: c.textTertiary }]}>── AISLE ──</Text>
        </View>
      </View>

      {/* Selected Pod Details */}
      {selected && (
        <View style={[styles.detailCard, { backgroundColor: c.surface, borderColor: c.primary }]}>
          <Text style={[styles.detailTitle, { color: c.text }]}>Pod {selected.label}</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Position:</Text>
            <Text style={[styles.detailVal, { color: c.text }]}>{selected.position}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Type:</Text>
            <TouchableOpacity onPress={() => toggleSlotType(selected.label)}>
              <Text style={[styles.detailVal, { color: c.primary }]}>{selected.type} ✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Status:</Text>
            <Text style={[styles.detailVal, { color: statusColor[selected.status] }]}>{selected.status}</Text>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.helpCard, { backgroundColor: c.primary + '08', borderColor: c.primary + '30' }]}>
        <Ionicons name="information-circle" size={18} color={c.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.helpTitle, { color: c.text }]}>How Pod Layout Works</Text>
          <Text style={[styles.helpText, { color: c.textSecondary }]}>
            • Each column is a pod set (upper + lower bunk){'\n'}
            • Tap a pod to cycle: Active → Inactive → Maintenance{'\n'}
            • Long press to toggle Single ↔ Double bed{'\n'}
            • Adjust rows and pods per row to match your space
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  saveBtn: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.sm, marginBottom: Spacing.lg },

  sizeCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  sizeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  sizeRow: { flexDirection: 'row', gap: Spacing.md },
  sizeControl: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  sizeLabel: { fontSize: FontSize.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, minWidth: 30, textAlign: 'center' },
  sizeDivider: { width: 1 },
  totalText: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.md },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: Spacing.sm, borderRadius: BorderRadius.lg },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  gridCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.lg },
  gridHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  gridTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

  entranceBar: { alignSelf: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1, borderStyle: 'dashed', marginBottom: Spacing.md },
  entranceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 2 },

  grid: { gap: Spacing.sm },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowLbl: { width: 16, fontSize: FontSize.xs, fontWeight: FontWeight.bold, textAlign: 'center' },
  podSet: { gap: 3, alignItems: 'center' },
  podCell: {
    width: 44, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', gap: 1,
  },
  podCellLabel: { fontSize: 8, fontWeight: FontWeight.bold },
  podCellPos: { fontSize: 7 },

  aisleLine: { borderTopWidth: 1, borderStyle: 'dashed', paddingTop: Spacing.sm, marginTop: Spacing.md, alignItems: 'center' },
  aisleText: { fontSize: FontSize.xs, letterSpacing: 2 },

  detailCard: { borderRadius: BorderRadius.lg, borderWidth: 2, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg },
  detailTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: FontSize.sm },
  detailVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  helpCard: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  helpTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 4 },
  helpText: { fontSize: FontSize.xs, lineHeight: 18 },
});
