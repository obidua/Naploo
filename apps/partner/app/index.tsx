import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const router = useRouter();
  const { colors: c } = useTheme();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isHydrated, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.brand, { color: c.primary }]}>Naploo Partner</Text>
      <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: FontSize['3xl'], fontWeight: '700' },
});
