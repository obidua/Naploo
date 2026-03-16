import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';

export default function RootLayout() {
  const systemScheme = useColorScheme() ?? 'light';
  const { mode } = useThemeStore();
  const scheme = mode === 'system' ? systemScheme : mode;
  const c = Colors[scheme];
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking Details' }} />
        <Stack.Screen name="room/[id]" options={{ title: 'Room Details' }} />
        <Stack.Screen name="room/create" options={{ title: 'Add Room' }} />
        <Stack.Screen name="pods/index" options={{ title: 'Pod Sets' }} />
        <Stack.Screen name="pods/layout" options={{ headerShown: false }} />
        <Stack.Screen name="payout/request" options={{ title: 'Request Payout' }} />
        <Stack.Screen name="property/edit" options={{ title: 'Edit Property' }} />
      </Stack>
    </>
  );
}
