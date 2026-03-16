import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRoomsStore } from '@/store/partner';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  occupied: 'info' as any,
  maintenance: 'warning',
  inactive: 'error',
};

export default function RoomDetailScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRoom, toggleStatus } = useRoomsStore();
  const room = getRoom(id || '');

  if (!room) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[{ color: c.textSecondary }]}>Room not found</Text>
      </View>
    );
  }

  function handleToggleStatus() {
    const newStatus = room!.status === 'available' ? 'maintenance' : 'available';
    Alert.alert(
      'Update Status',
      `Mark room as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          toggleStatus(room!.id);
          Alert.alert('Done', `Room marked as ${newStatus}`);
        } },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={styles.scroll}>
      {/* Room Header */}
      <Card style={StyleSheet.flatten([styles.headerCard, { backgroundColor: c.primary }])}>
        <View style={styles.headerRow}>
          <Text style={styles.headerName}>{room.name}</Text>
          <Badge text={room.status} variant={STATUS_VARIANT[room.status]} />
        </View>
        <Text style={styles.headerSub}>Room #{room.roomNumber} · Floor {room.floor}</Text>
        <Text style={styles.headerPrice}>₹{room.dailyRate}<Text style={styles.perNight}>/night</Text></Text>
      </Card>

      {/* Details */}
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Room Details</Text>
        <InfoRow label="Type" value={room.roomType} c={c} />
        <InfoRow label="Bed Type" value={`${room.numBeds}x ${room.bedType}`} c={c} />
        <InfoRow label="Max Guests" value={String(room.maxGuests)} c={c} />
        <InfoRow label="Area" value={room.areaSqFt ? `${room.areaSqFt} sq ft` : '-'} c={c} />
        <InfoRow label="Check-in" value={room.checkInTime} c={c} />
        <InfoRow label="Check-out" value={room.checkOutTime} c={c} />
      </Card>

      {/* Pricing */}
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Pricing</Text>
        <InfoRow label="Daily Rate" value={`₹${room.dailyRate}`} c={c} />
        <InfoRow label="Weekly Rate" value={room.weeklyRate ? `₹${room.weeklyRate}` : '-'} c={c} />
        <InfoRow label="Extra Guest" value={`₹${room.extraGuestCharge || 0}`} c={c} />
      </Card>

      {/* Amenities */}
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Amenities</Text>
        <View style={styles.amenityRow}>
          {(room.amenities || []).map((a) => (
            <View key={a} style={[styles.amenityChip, { backgroundColor: c.surface }]}>
              <Ionicons name="checkmark-circle" size={14} color={c.success} />
              <Text style={[styles.amenityText, { color: c.text }]}>{a}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Description */}
      {room.description && (
        <Card>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Description</Text>
          <Text style={[styles.description, { color: c.textSecondary }]}>{room.description}</Text>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Edit Room"
          variant="outline"
          onPress={() => Alert.alert('Edit Room', 'Edit functionality coming soon')}
          style={{ flex: 1 }}
        />
        <Button
          title={room.status === 'available' ? 'Set Maintenance' : 'Set Available'}
          variant={room.status === 'available' ? 'secondary' : 'primary'}
          onPress={handleToggleStatus}
          style={{ flex: 1 }}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value, c }: { label: string; value: string; c: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  headerCard: {},
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerName: { color: '#fff', fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginTop: 4 },
  headerPrice: { color: '#fff', fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, marginTop: Spacing.md },
  perNight: { fontSize: FontSize.md, fontWeight: FontWeight.regular },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  infoLabel: { fontSize: FontSize.sm },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, textTransform: 'capitalize' },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 20 },
  amenityText: { fontSize: FontSize.sm },
  description: { fontSize: FontSize.sm, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
});
