import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/theme/useTheme';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { paymentsApi } from '@/services/api';

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
      Alert.alert('Payment cancelled', 'You can retry the payment or change your booking.');
      router.back();
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
      Alert.alert('Cancel payment?', 'Your booking will remain pending.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Cancel payment', style: 'destructive', onPress: () => router.back() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Cancel payment?', 'Your booking will remain pending.', [
              { text: 'Stay', style: 'cancel' },
              { text: 'Cancel payment', style: 'destructive', onPress: () => router.back() },
            ]);
          }}
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
});
