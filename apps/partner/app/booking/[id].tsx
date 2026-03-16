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
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePartnerBookingsStore } from '@/store/partner';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  confirmed: 'info',
  checked_in: 'success',
  checked_out: 'default',
  pending: 'warning',
  cancelled: 'error',
  no_show: 'error',
};

export default function BookingDetailScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const { getBooking, checkIn: storeCheckIn, checkOut: storeCheckOut } = usePartnerBookingsStore();
  const booking = getBooking(id || '');

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.textSecondary }}>Booking not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }} />
      </View>
    );
  }

  async function handleCheckIn() {
    Alert.alert('Check In', `Check in ${booking!.guest?.firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check In',
        onPress: () => {
          storeCheckIn(booking!.id);
          Alert.alert('Success', 'Guest checked in');
        },
      },
    ]);
  }

  async function handleCheckOut() {
    Alert.alert('Check Out', `Check out ${booking!.guest?.firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check Out',
        onPress: () => {
          storeCheckOut(booking!.id);
          Alert.alert('Success', 'Guest checked out');
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={styles.scroll}>
      {/* Booking header */}
      <Card style={StyleSheet.flatten([styles.headerCard, { backgroundColor: c.primary }])}>
        <View style={styles.headerRow}>
          <Text style={styles.headerNum}>{booking.bookingNumber}</Text>
          <Badge text={booking.status.replace('_', ' ')} variant={STATUS_VARIANT[booking.status]} />
        </View>
        <Text style={styles.headerType}>
          {booking.bookingType === 'pod' ? 'Pod Booking' : 'Room Booking'}
        </Text>
        <Text style={styles.headerAmount}>₹{booking.total}</Text>
      </Card>

      {/* Guest Info */}
      <Card>
        <SectionTitle text="Guest Information" c={c} />
        <InfoRow icon="person" label="Name" value={`${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`} c={c} />
        <InfoRow icon="call" label="Phone" value={booking.guest?.phone || '-'} c={c} />
        <InfoRow icon="people" label="Guests" value={`${booking.guestCount} guests`} c={c} />
        {booking.guestNames && (
          <InfoRow icon="list" label="Names" value={booking.guestNames.join(', ')} c={c} />
        )}
      </Card>

      {/* Stay Details */}
      <Card>
        <SectionTitle text="Stay Details" c={c} />
        <InfoRow icon="enter" label="Check-in" value={new Date(booking.checkIn).toLocaleString('en-IN')} c={c} />
        <InfoRow icon="exit" label="Check-out" value={new Date(booking.checkOut).toLocaleString('en-IN')} c={c} />
        <InfoRow icon="moon" label="Duration" value={`${booking.nights || booking.hours || 1} ${booking.bookingType === 'pod' ? 'hours' : 'nights'}`} c={c} />
        {booking.specialRequests && (
          <InfoRow icon="chatbubble" label="Requests" value={booking.specialRequests} c={c} />
        )}
      </Card>

      {/* Payment Breakdown */}
      <Card>
        <SectionTitle text="Payment Breakdown" c={c} />
        <PriceRow label="Base Rate" value={`₹${booking.baseRate}`} c={c} />
        <PriceRow label="Subtotal" value={`₹${booking.subtotal}`} c={c} />
        <PriceRow label="GST (12%)" value={`₹${booking.gst}`} c={c} />
        <View style={[styles.totalRow, { borderTopColor: c.divider }]}>
          <Text style={[styles.totalLabel, { color: c.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: c.text }]}>₹{booking.total}</Text>
        </View>
      </Card>

      {/* Revenue Split */}
      <Card>
        <SectionTitle text="Your Earnings" c={c} />
        <PriceRow label="Owner Share (60%)" value={`₹${booking.ownerShare}`} c={c} bold />
        <PriceRow label="Naploo Share (40%)" value={`₹${booking.naplooShare}`} c={c} />
        <PriceRow label="Your Commission" value={`₹${booking.partnerCommission}`} c={c} />
      </Card>

      {/* Actions */}
      {booking.status === 'confirmed' && (
        <Button title="Check In Guest" onPress={handleCheckIn} loading={loading} style={{ marginTop: Spacing.lg }} />
      )}
      {booking.status === 'checked_in' && (
        <Button title="Check Out Guest" onPress={handleCheckOut} loading={loading} style={{ marginTop: Spacing.lg }} />
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionTitle({ text, c }: { text: string; c: any }) {
  return <Text style={[styles.sectionTitle, { color: c.text }]}>{text}</Text>;
}

function InfoRow({ icon, label, value, c }: { icon: string; label: string; value: string; c: any }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={c.textTertiary} />
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

function PriceRow({ label, value, c, bold }: { label: string; value: string; c: any; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: bold ? c.success : c.text, fontWeight: bold ? FontWeight.bold : FontWeight.medium }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  headerCard: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  headerNum: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  headerType: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  headerAmount: { color: '#fff', fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  infoLabel: { width: 70, fontSize: FontSize.sm },
  infoValue: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  priceLabel: { fontSize: FontSize.sm },
  priceValue: { fontSize: FontSize.sm },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
