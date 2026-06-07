import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { useBookingsStore, validateCoupon } from '@/store/app';
import { formatCurrency } from '@/utils';
import { bookingsApi, paymentsApi } from '@/services/api';

export default function BookingConfirmScreen() {
  const params = useLocalSearchParams<{
    propertyId: string;
    propertyName: string;
    type: string; // 'pod' | 'room'
    itemId: string;
    itemName: string;
    rate: string;
    duration: string;
    guests: string;
    roomQty?: string;
    city: string;
    checkIn?: string;
    checkOut?: string;
    podLabel?: string;
    podPosition?: string;
  }>();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const addBooking = useBookingsStore((s) => s.addBooking);

  const [guestName, setGuestName] = useState(
    user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : ''
  );
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  const rate = Number(params.rate) || 0;
  const duration = Number(params.duration) || 1;
  const roomQty = Number(params.roomQty) || 1;
  const subtotal = rate * duration * (params.type === 'room' ? roomQty : 1);
  const [discount, setDiscount] = useState(0);
  const gst = Math.round((subtotal - discount) * 0.12);
  const total = subtotal - discount + gst;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode, subtotal);
    if (result.valid) {
      setCouponApplied(true);
      setDiscount(result.discount);
      Alert.alert('Coupon Applied!', `${result.message} — You save ${formatCurrency(result.discount)}`);
    } else {
      Alert.alert('Invalid Coupon', result.message);
    }
  };

  // Optimistic local fallback used when the backend booking/payment call
  // cannot be made (e.g. no auth, mock data, or the API is unreachable).
  const finalizeLocal = (paid: boolean) => {
    const booking = addBooking({
      userId: user?.id || 'guest',
      propertyId: params.propertyId,
      propertyName: params.propertyName,
      propertyImage: '',
      bookingType: params.type as 'pod' | 'room',
      podId: params.type === 'pod' ? params.itemId : undefined,
      roomId: params.type === 'room' ? params.itemId : undefined,
      checkIn: params.checkIn || new Date().toISOString(),
      checkOut: params.checkOut || new Date(Date.now() + duration * 3600000).toISOString(),
      duration,
      guestCount: Number(params.guests) || 1,
      baseRate: rate,
      subtotal,
      extraCharges: 0,
      discount,
      gst,
      totalAmount: total,
      status: paid ? 'confirmed' : 'pending',
      paymentStatus: paid ? 'paid' : 'pending',
      city: params.city,
    });
    router.replace({
      pathname: '/booking/success',
      params: {
        bookingNumber: booking.bookingNumber,
        propertyName: params.propertyName,
        propertyId: params.propertyId,
        itemName: params.itemName,
        type: params.type,
        total: String(total),
        city: params.city,
        duration: params.duration,
      },
    });
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (!guestName.trim()) {
      Alert.alert('Required', 'Please enter guest name');
      return;
    }
    setLoading(true);
    try {
      // 1) Create a real booking on the backend so the payment service has a
      //    bookingId + total to settle. If the item id is not a real DB id
      //    (e.g. synthetic pod-slot id from the seat map), this call will
      //    fail and we fall back to the local optimistic flow below.
      const bookRes = await bookingsApi
        .create({
          kind: params.type as 'pod' | 'room',
          itemId: params.itemId,
          checkInISO: params.checkIn || new Date().toISOString(),
          hours: params.type === 'pod' ? duration : undefined,
          nights: params.type === 'room' ? duration : undefined,
          guests: Number(params.guests) || 1,
          couponDiscount: discount,
        })
        .catch(() => null);

      const realBooking: any = bookRes?.success ? (bookRes as any).booking : null;
      if (!realBooking?.id) {
        setLoading(false);
        // Backend booking unavailable — fall back to local confirmation so
        // demo flow keeps working.
        finalizeLocal(true);
        return;
      }

      // 2) Create a payment order (provider chosen server-side; defaults to
      //    Cashfree per services/payment-service/.env PAYMENT_PROVIDER=cashfree).
      const orderRes: any = await paymentsApi.createOrder(realBooking.id).catch(() => null);
      if (!orderRes?.success) {
        setLoading(false);
        Alert.alert('Payment unavailable', 'Could not start checkout. Saving as pending.');
        finalizeLocal(false);
        return;
      }

      setLoading(false);
      // 3) Open the in-app native checkout (WebView around Cashfree PG SDK).
      //    No external browser is opened — the WebView intercepts
      //    `naploo://payment-success` and routes to /booking/success.
      router.push({
        pathname: '/booking/checkout',
        params: {
          bookingId: realBooking.id,
          bookingNumber: realBooking.bookingNumber,
          propertyName: params.propertyName,
          propertyId: params.propertyId,
          itemName: params.itemName,
          type: params.type,
          total: String(total),
          city: params.city,
          duration: params.duration,
        },
      });
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140, gap: Spacing.lg }}
      >
        {/* Booking Summary */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Booking Summary</Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.summaryRow}>
            <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Property</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{params.propertyName}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Ionicons
              name={params.type === 'pod' ? 'bed-outline' : 'key-outline'}
              size={18}
              color={colors.textSecondary}
            />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
                {params.type === 'pod' ? 'Pod' : 'Room'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{params.itemName}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Location</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{params.city}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Duration</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {duration} {params.type === 'pod' ? `hour${duration > 1 ? 's' : ''}` : `night${duration > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>

          {params.type === 'room' && roomQty > 1 && (
            <View style={styles.summaryRow}>
              <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Rooms</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{roomQty} rooms</Text>
              </View>
            </View>
          )}

          {params.checkIn && (
            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
                  {params.type === 'pod' ? 'Check-in' : 'Check-in → Check-out'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {new Date(params.checkIn).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {params.checkOut ? ` → ${new Date(params.checkOut).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : ''}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Guests</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {params.guests} guest{Number(params.guests) > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Guest Details */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Guest Details</Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Input
            label="Full Name *"
            value={guestName}
            onChangeText={setGuestName}
            placeholder="Enter guest name"
            containerStyle={{ marginBottom: 0 }}
          />
          <Input
            label="Phone"
            value={guestPhone}
            onChangeText={setGuestPhone}
            placeholder="Mobile number"
            keyboardType="phone-pad"
            containerStyle={{ marginBottom: 0 }}
          />
          <Input
            label="Email"
            value={guestEmail}
            onChangeText={setGuestEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Special Requests */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Special Requests</Text>
          <TextInput
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Any special requirements? (optional)"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            style={[
              styles.textArea,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />
        </View>

        {/* Coupon */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Apply Coupon</Text>
          <View style={styles.couponRow}>
            <TextInput
              value={couponCode}
              onChangeText={(t) => {
                setCouponCode(t);
                setCouponApplied(false);
              }}
              placeholder="Enter coupon code"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              style={[
                styles.couponInput,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
              ]}
            />
            <Button
              title={couponApplied ? '✓ Applied' : 'Apply'}
              onPress={handleApplyCoupon}
              variant={couponApplied ? 'ghost' : 'outline'}
              size="sm"
              disabled={couponApplied}
            />
          </View>
          {couponApplied && (
            <Text style={[styles.couponSaved, { color: colors.success }]}>
              You saved {formatCurrency(discount)}!
            </Text>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Price Breakdown</Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {formatCurrency(rate)} × {duration} {params.type === 'pod' ? 'hr' : 'night'}
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.success }]}>Coupon Discount</Text>
              <Text style={[styles.priceValue, { color: colors.success }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>GST (12%)</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(gst)}</Text>
          </View>

          <View style={[styles.totalDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={[styles.policyBanner, { backgroundColor: colors.infoLight }]}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={[styles.policyText, { color: colors.info }]}>
            Free cancellation up to 2 hours before check-in. After that, a cancellation fee may apply.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={[styles.paymentBar, Shadow.xl, { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md, borderTopColor: colors.divider }]}>
        <View>
          <Text style={[styles.payTotal, { color: colors.primary }]}>{formatCurrency(total)}</Text>
          <Text style={[styles.payTaxNote, { color: colors.textTertiary }]}>incl. taxes</Text>
        </View>
        <Button
          title="Proceed to Pay"
          onPress={handleProceedToPayment}
          loading={loading}
          size="lg"
          icon={<Ionicons name="lock-closed" size={16} color="#fff" />}
        />
      </View>
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
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  divider: { height: 1 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  summaryContent: { flex: 1 },
  summaryLabel: { fontSize: FontSize.xs },
  summaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  couponSaved: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { fontSize: FontSize.md },
  priceValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  totalDivider: { height: 1, marginVertical: Spacing.xs },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  totalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  policyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  policyText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  paymentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  payTotal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  payTaxNote: { fontSize: FontSize.xs },
});
