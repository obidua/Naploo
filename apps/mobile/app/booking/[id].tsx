import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useBookingsStore } from '@/store/app';
import { formatCurrency, formatDate } from '@/utils';
import { getPropertyById } from '@/data/properties';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'success' as const, icon: 'checkmark-circle' },
  pending: { label: 'Pending', color: 'warning' as const, icon: 'time' },
  cancelled: { label: 'Cancelled', color: 'error' as const, icon: 'close-circle' },
  checked_out: { label: 'Completed', color: 'info' as const, icon: 'flag' },
  checked_in: { label: 'Checked In', color: 'success' as const, icon: 'log-in' },
  no_show: { label: 'No Show', color: 'error' as const, icon: 'alert-circle' },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [cancelling, setCancelling] = useState(false);

  const { getBooking, cancelBooking } = useBookingsStore();
  const booking = getBooking(id || '');
  const property = booking ? getPropertyById(booking.propertyId) : undefined;

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>Booking not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }} />
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation policy may apply.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            cancelBooking(booking.id);
            setCancelling(false);
            Alert.alert('Booking Cancelled', 'Your refund will be processed within 3-5 business days.');
            router.back();
          },
        },
      ]
    );
  };

  const handleCallProperty = () => {
    if (property) {
      Linking.openURL(`tel:+919876543210`);
    }
  };

  const handleDirections = () => {
    if (property) {
      const query = encodeURIComponent(`${property.name}, ${property.address}, ${property.city}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Alert.alert('Options', undefined, [
              { text: 'Share Booking', onPress: () => {
                const { Share: RNShare } = require('react-native');
                RNShare.share({ message: `Booking ${booking.bookingNumber} at ${booking.propertyName}, ${booking.city}` });
              }},
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: statusConfig.color === 'success' ? colors.successLight : colors.warningLight },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={24}
            color={statusConfig.color === 'success' ? colors.success : colors.warning}
          />
          <View>
            <Text
              style={[
                styles.statusTitle,
                { color: statusConfig.color === 'success' ? colors.success : colors.warning },
              ]}
            >
              Booking {statusConfig.label}
            </Text>
            <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
              {booking.bookingNumber}
            </Text>
          </View>
        </View>

        {/* Property Card */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.propertyHeader}>
            <View style={[styles.propertyIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="business" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.propertyName, { color: colors.text }]}>{booking.propertyName}</Text>
              <Text style={[styles.propertyAddress, { color: colors.textSecondary }]}>
                {property ? `${property.address}, ${property.city}` : booking.city}
              </Text>
            </View>
          </View>

          <View style={styles.propertyActions}>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: colors.primaryLight }]}
              onPress={handleCallProperty}
            >
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionChipText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: colors.primaryLight }]}
              onPress={handleDirections}
            >
              <Ionicons name="navigate-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionChipText, { color: colors.primary }]}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Timeline */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Timeline</Text>

          <View style={styles.timeline}>
            <TimelineItem
              icon="log-in-outline"
              label="Check In"
              value={formatDate(new Date(booking.checkIn))}
              time={new Date(booking.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              colors={colors}
              isActive
            />
            <View style={[styles.timelineLine, { borderLeftColor: colors.primary }]} />
            <TimelineItem
              icon="time-outline"
              label="Duration"
              value={`${booking.duration || 1} ${booking.bookingType === 'pod' ? 'hours' : 'nights'}`}
              colors={colors}
            />
            <View style={[styles.timelineLine, { borderLeftColor: colors.borderLight }]} />
            <TimelineItem
              icon="log-out-outline"
              label="Check Out"
              value={formatDate(new Date(booking.checkOut))}
              time={new Date(booking.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              colors={colors}
            />
          </View>
        </View>

        {/* Booking Info */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Info</Text>

          <InfoRow label="Type" colors={colors}>
            <Badge text={booking.bookingType === 'pod' ? 'Pod' : 'Room'} variant="primary" />
          </InfoRow>
          <InfoRow label={booking.bookingType === 'pod' ? 'Pod' : 'Room'} value={booking.podId || booking.roomId || '-'} colors={colors} />
          <InfoRow label="Guests" value={`${booking.guestCount}`} colors={colors} />
          <InfoRow label="City" value={booking.city || '-'} colors={colors} />
          <InfoRow label="Booked On" value={formatDate(new Date(booking.createdAt))} colors={colors} />
        </View>

        {/* Payment Details */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {formatCurrency(booking.baseRate)} × {booking.duration || 1}{' '}
              {booking.bookingType === 'pod' ? 'hr' : 'night'}
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              {formatCurrency(booking.subtotal)}
            </Text>
          </View>

          {booking.discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.priceValue, { color: colors.success }]}>
                -{formatCurrency(booking.discount)}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>GST (12%)</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              {formatCurrency(booking.gst)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Paid</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(booking.totalAmount)}
            </Text>
          </View>

          <View style={[styles.paymentMethodRow, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.paymentMethodText, { color: colors.textSecondary }]}>
              Paid via {booking.paymentStatus === 'paid' ? 'UPI' : 'Pending'}
            </Text>
            <Text style={[styles.paymentIdText, { color: colors.textTertiary }]}>
              {booking.bookingNumber}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {(booking.status === 'confirmed' || booking.status === 'pending') && (
          <View style={{ gap: Spacing.sm }}>
            <Button
              title="Download Invoice"
              onPress={() => Alert.alert('Coming Soon', 'Invoice download will be available shortly.')}
              variant="outline"
              fullWidth
              icon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
            />
            <Button
              title={cancelling ? 'Cancelling...' : 'Cancel Booking'}
              onPress={handleCancel}
              variant="ghost"
              fullWidth
              loading={cancelling}
              icon={!cancelling ? <Ionicons name="close-circle-outline" size={18} color={colors.error} /> : undefined}
              style={{ borderColor: colors.error }}
              textStyle={{ color: colors.error }}
            />
          </View>
        )}

        {/* Support */}
        <TouchableOpacity style={[styles.supportRow, { backgroundColor: colors.surfaceElevated }]}>
          <Ionicons name="headset-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.text }]}>Need Help?</Text>
            <Text style={[styles.supportSub, { color: colors.textSecondary }]}>
              Contact support for booking related queries
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function TimelineItem({
  icon,
  label,
  value,
  time,
  colors,
  isActive,
}: {
  icon: string;
  label: string;
  value: string;
  time?: string;
  colors: any;
  isActive?: boolean;
}) {
  return (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineDot,
          { backgroundColor: isActive ? colors.primary : colors.borderLight },
        ]}
      >
        <Ionicons name={icon as any} size={14} color={isActive ? '#fff' : colors.textTertiary} />
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineLabel, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[styles.timelineValue, { color: colors.text }]}>{value}</Text>
      </View>
      {time && (
        <Text style={[styles.timelineTime, { color: colors.primary }]}>{time}</Text>
      )}
    </View>
  );
}

function InfoRow({
  label,
  value,
  children,
  colors,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
      {children || <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: Spacing.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  statusTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  statusSub: { fontSize: FontSize.sm },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  propertyAddress: { fontSize: FontSize.sm },
  propertyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  actionChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  timeline: { paddingLeft: Spacing.xs },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    height: 20,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginLeft: 13,
  },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: FontSize.xs },
  timelineValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  timelineTime: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: FontSize.sm },
  infoValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { fontSize: FontSize.md },
  priceValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  divider: { height: 1 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  totalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  paymentMethodText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  paymentIdText: { fontSize: FontSize.xs, marginLeft: 'auto' },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  supportTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  supportSub: { fontSize: FontSize.sm },
});
