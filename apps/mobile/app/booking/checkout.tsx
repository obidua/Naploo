import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/theme/useTheme';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { paymentsApi, bookingsApi } from '@/services/api';

// In-app native checkout. Loads the hosted Cashfree (or Razorpay) page
// served by the payment service, which uses the official PG Web SDK.
// We intercept the `naploo://payment-success?bookingId=...` redirect inside
// the WebView so the user never leaves the app and never bounces to Chrome.
export default function BookingCheckoutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);

  const params = useLocalSearchParams<{
    bookingId: string;
    bookingNumber?: string;
    propertyName?: string;
    propertyId?: string;
    itemName?: string;
    type?: string;
    total?: string;
    city?: string;
    duration?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const url = paymentsApi.getCheckoutUrl(params.bookingId);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync('accessToken').then((t) => {
      if (mounted) setToken(t);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Cancel the in-flight booking on the server so the partner's inventory
  // is released immediately and the payment row is not left dangling in
  // `pending` forever. Safe to call from any dismiss path \u2014 the booking
  // service no-ops if the booking is already cancelled or completed.
  const cancelBookingAndExit = async (silent: boolean = false) => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await bookingsApi.cancel(params.bookingId, 'User cancelled at payment screen');
    } catch {
      // Even if the cancel call fails (offline, etc.) we still close the
      // screen so the user isn't stuck. A background job / next refresh
      // will surface the pending state.
    }
    setCancelling(false);
    if (!silent) {
      Alert.alert('Payment cancelled', 'Your booking has been cancelled.');
    }
    router.back();
  };

  const confirmCancel = () => {
    Alert.alert(
      'Cancel payment?',
      'This will cancel your booking. You can rebook anytime.',
      [
        { text: 'Keep paying', style: 'cancel' },
        { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBookingAndExit(false) },
      ]
    );
  };

  // Intercept `naploo://` redirects so we don't actually leave the app.
  const onShouldStartLoadWithRequest = (req: { url: string }) => {
    const target = req.url || '';
    if (target.startsWith('naploo://payment-success')) {
      router.replace({
        pathname: '/booking/success',
        params: {
          bookingNumber: params.bookingNumber || params.bookingId,
          propertyName: params.propertyName,
          propertyId: params.propertyId,
          itemName: params.itemName,
          type: params.type,
          total: params.total,
          city: params.city,
          duration: params.duration,
        },
      });
      return false;
    }
    if (target.startsWith('naploo://payment-cancelled')) {
      // Auto-cancel the booking server-side so it doesn't linger as
      // `pending`. We don't show an extra confirm prompt here because the
      // PG SDK already told us the user dismissed/failed.
      cancelBookingAndExit(false);
      return false;
    }
    // Allow https/http including the hosted checkout host and the Cashfree
    // SDK CDN.
    return true;
  };

  // Some Android UPI intents fire onShouldStartLoadWithRequest unreliably,
  // so also watch onNavigationStateChange as a backstop.
  const onNavigationStateChange = (nav: WebViewNavigation) => {
    if (nav.url?.startsWith('naploo://payment-success')) {
      onShouldStartLoadWithRequest({ url: nav.url });
    } else if (nav.url?.startsWith('naploo://payment-cancelled')) {
      onShouldStartLoadWithRequest({ url: nav.url });
    }
  };

  // Hardware back: confirm cancel.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmCancel();
      return true;
    });
    return () => sub.remove();
  }, [cancelling]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={confirmCancel}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Checkout</Text>
          {params.total ? (
            <Text style={[styles.headerSub, { color: colors.textTertiary }]}>Pay ₹{params.total}</Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webRef}
        source={{ uri: url, headers: token ? { Authorization: `Bearer ${token}` } : undefined }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onNavigationStateChange={onNavigationStateChange}
        onError={(e) => {
          setLoading(false);
          Alert.alert('Payment unavailable', e.nativeEvent.description || 'Unable to load secure checkout. Please try again.');
        }}
        style={{ flex: 1, backgroundColor: '#0f0a1e' }}
      />

      {loading && (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Loading secure checkout…</Text>
        </View>
      )}

      {/* Always-visible cancel button below the checkout so the user
          has an obvious way out (and so any pending payment is cancelled
          server-side, releasing the pod for someone else). */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.sm), borderTopColor: colors.divider, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={confirmCancel}
          disabled={cancelling}
          activeOpacity={0.85}
          style={[styles.cancelBtn, { borderColor: colors.error || '#dc2626', opacity: cancelling ? 0.6 : 1 }]}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color={colors.error || '#dc2626'} />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={18} color={colors.error || '#dc2626'} />
              <Text style={[styles.cancelText, { color: colors.error || '#dc2626' }]}>
                Cancel Payment
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6, width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'center' },
  headerSub: { fontSize: FontSize.xs, marginTop: 2, textAlign: 'center' },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,10,30,0.6)',
  },
  loaderText: { marginTop: 12, fontSize: FontSize.sm },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  cancelText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
