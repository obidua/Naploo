import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/useTheme';
import { setupNotifications, startSmartTracking, stopSmartTracking } from '@/services/smartAlerts';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    // Initialize smart alerts
    setupNotifications();
    startSmartTracking();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') startSmartTracking();
    });

    return () => {
      sub.remove();
      stopSmartTracking();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="booking/confirm" />
        <Stack.Screen name="booking/success" />
      </Stack>
    </>
  );
}
