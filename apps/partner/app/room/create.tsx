import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoomsStore } from '@/store/partner';

export default function CreateRoomScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    roomNumber: '',
    name: '',
    roomType: 'standard',
    floor: '1',
    maxGuests: '2',
    bedType: 'double',
    dailyRate: '',
    description: '',
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const { addRoom } = useRoomsStore();

  async function handleCreate() {
    if (!form.roomNumber || !form.name || !form.dailyRate) {
      Alert.alert('Required', 'Please fill room number, name, and daily rate');
      return;
    }
    addRoom({
      partnerId: 'p1',
      roomNumber: form.roomNumber,
      name: form.name,
      roomType: form.roomType as any,
      floor: Number(form.floor) || 1,
      maxGuests: Number(form.maxGuests) || 2,
      bedType: form.bedType as any,
      numBeds: 1,
      areaSqFt: 0,
      dailyRate: Number(form.dailyRate),
      weeklyRate: Number(form.dailyRate) * 6,
      extraGuestCharge: 500,
      status: 'available',
      isActive: true,
      amenities: ['WiFi', 'AC'],
      images: [],
      description: form.description || null,
      checkInTime: '14:00',
      checkOutTime: '11:00',
    });
    Alert.alert('Success', 'Room created successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Basic Info</Text>
        <View style={styles.fields}>
          <Input label="Room Number *" placeholder="e.g. 201" value={form.roomNumber} onChangeText={(v: string) => update('roomNumber', v)} />
          <Input label="Room Name *" placeholder="e.g. Deluxe Double" value={form.name} onChangeText={(v: string) => update('name', v)} />
          <Input label="Floor" placeholder="1" value={form.floor} onChangeText={(v: string) => update('floor', v)} keyboardType="number-pad" />
          <Input label="Max Guests" placeholder="2" value={form.maxGuests} onChangeText={(v: string) => update('maxGuests', v)} keyboardType="number-pad" />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Pricing</Text>
        <View style={styles.fields}>
          <Input label="Daily Rate (₹) *" placeholder="e.g. 2400" value={form.dailyRate} onChangeText={(v: string) => update('dailyRate', v)} keyboardType="numeric" />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Description</Text>
        <Input
          placeholder="Brief description of the room..."
          value={form.description}
          onChangeText={(v: string) => update('description', v)}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />
      </Card>

      <Button title="Create Room" onPress={handleCreate} loading={loading} style={{ marginTop: Spacing.md }} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  fields: { gap: Spacing.md },
});
