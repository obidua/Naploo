import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Share,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils';

export default function BookingSuccessScreen() {
  const params = useLocalSearchParams<{
    bookingNumber: string;
    propertyName: string;
    propertyId?: string;
    itemName: string;
    type: string;
    total: string;
    city: string;
    duration: string;
  }>();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  // Compact mode for small phones / landscape — shrinks the success icon
  // and gaps so the action buttons stay above the home indicator.
  const compact = winH < 720;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      const deepLink = `https://naploo.com/property/${params.propertyId}`;
      await Share.share({
        message: `🎉 Just booked ${params.itemName} at ${params.propertyName}, ${params.city} via Naploo! Booking: ${params.bookingNumber}\n\n${deepLink}`,
        url: deepLink,
      });
    } catch {}
  };

  const duration = Number(params.duration) || 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + (compact ? Spacing.md : Spacing.xl),
          paddingBottom: insets.bottom + Spacing.xl,
          gap: compact ? Spacing.md : Spacing.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon */}
      <Animated.View
        style={[
          styles.iconCircle,
          compact && styles.iconCircleCompact,
          { backgroundColor: colors.successLight, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.iconInner, compact && styles.iconInnerCompact, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={compact ? 36 : 48} color="#fff" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          gap: Spacing.xs,
        }}
      >
        <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your {params.type === 'pod' ? 'pod' : 'room'} has been reserved
        </Text>
      </Animated.View>

      {/* Booking Card */}
      <Animated.View
        style={[
          styles.card,
          Shadow.md,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderLight,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Booking Number */}
        <View style={[styles.bookingNumberBox, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.bookingNumberLabel, { color: colors.primary }]}>Booking Number</Text>
          <Text style={[styles.bookingNumber, { color: colors.primary }]}>{params.bookingNumber}</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <DetailRow
            icon="business-outline"
            label="Property"
            value={params.propertyName}
            colors={colors}
          />
          <DetailRow
            icon={params.type === 'pod' ? 'bed-outline' : 'key-outline'}
            label={params.type === 'pod' ? 'Pod' : 'Room'}
            value={params.itemName}
            colors={colors}
          />
          <DetailRow
            icon="location-outline"
            label="Location"
            value={params.city}
            colors={colors}
          />
          <DetailRow
            icon="time-outline"
            label="Duration"
            value={`${duration} ${params.type === 'pod' ? `hour${duration > 1 ? 's' : ''}` : `night${duration > 1 ? 's' : ''}`}`}
            colors={colors}
          />
          <View style={[styles.detailDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Amount Paid</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(Number(params.total) || 0)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Confirmation Note */}
      <Animated.View
        style={[
          styles.noteBox,
          { backgroundColor: colors.infoLight, opacity: fadeAnim },
        ]}
      >
        <Ionicons name="mail-outline" size={16} color={colors.info} />
        <Text style={[styles.noteText, { color: colors.info }]}>
          Confirmation details sent to your phone & email
        </Text>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Button
          title="View Booking"
          onPress={() =>
            router.replace({
              pathname: '/booking/[id]',
              params: { id: params.bookingNumber },
            })
          }
          size="lg"
          fullWidth
        />
        <Button
          title="Share Booking"
          onPress={handleShare}
          variant="outline"
          size="lg"
          fullWidth
          icon={<Ionicons name="share-outline" size={18} color={colors.primary} />}
        />
        <Button
          title="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          variant="ghost"
          size="md"
        />
      </Animated.View>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={16} color={colors.textTertiary} />
      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  iconCircleCompact: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginTop: Spacing.sm,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCompact: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bookingNumberBox: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  bookingNumberLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookingNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  details: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    width: 70,
  },
  detailValue: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  noteText: {
    fontSize: FontSize.sm,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
