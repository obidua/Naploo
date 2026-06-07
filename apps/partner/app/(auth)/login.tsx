import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi, setTokens } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { colors: c } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert('Invalid', 'Enter your partner email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(cleanEmail, password);
      await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      setUser(res.user);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Login failed', e.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: c.primary + '15' }]}>
            <Ionicons name="business" size={48} color={c.primary} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Naploo Partner</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Manage your property, bookings & earnings</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="partner@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            icon={<Ionicons name="mail-outline" size={20} color={c.textTertiary} />}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            icon={<Ionicons name="lock-closed-outline" size={20} color={c.textTertiary} />}
          />
          <Button title="Login" onPress={handleLogin} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
});
