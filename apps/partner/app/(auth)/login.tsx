import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi, setTokens } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { colors: c } = useTheme();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const otpRef = useRef<TextInput>(null);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSendOtp() {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid', 'Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(cleanPhone);
      if (res.otp) setDevOtp(res.otp);
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 4) {
      Alert.alert('Invalid', 'Enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await authApi.verifyOtp(cleanPhone, otp);
      await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      setUser(res.user);

      // Check if user is a partner/admin - for now any role can use the app
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Invalid OTP');
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
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Manage your property, bookings & earnings
          </Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <Input
              label="Phone Number"
              placeholder="Enter your registered phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={13}
              icon={<Ionicons name="call-outline" size={20} color={c.textTertiary} />}
            />
            <Button title="Send OTP" onPress={handleSendOtp} loading={loading} />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.otpInfo, { color: c.textSecondary }]}>
              OTP sent to +91 {phone.replace(/\D/g, '')}
            </Text>
            {devOtp ? (
              <Text style={[styles.devOtp, { color: c.success }]}>Dev OTP: {devOtp}</Text>
            ) : null}
            <Input
              label="Enter OTP"
              placeholder="6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              ref={otpRef}
              icon={<Ionicons name="lock-closed-outline" size={20} color={c.textTertiary} />}
            />
            <Button title="Verify & Login" onPress={handleVerifyOtp} loading={loading} />
            <Button
              title="Change Number"
              variant="ghost"
              onPress={() => {
                setStep('phone');
                setOtp('');
                setDevOtp('');
              }}
            />
          </View>
        )}
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
  otpInfo: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  devOtp: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});
