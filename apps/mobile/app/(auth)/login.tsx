import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { authApi, setTokens } from '@/services/api';

type Step = 'phone' | 'otp';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(`+91${phone}`);
      if (res.otp) setDevOtp(res.otp);
      setStep('otp');
      startCountdown();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(`+91${phone}`, otpCode);
      await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      setUser(res.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i + index < 6) newOtp[i + index] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <LinearGradient
        colors={isDark ? ['#2e1065', '#0f0a1e'] : ['#7c3aed', '#6d28d9']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Close button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>naploo</Text>
          <Text style={styles.headerTitle}>
            {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
          </Text>
          <Text style={styles.headerDesc}>
            {step === 'phone'
              ? 'Enter your mobile number to login'
              : `We've sent a 6-digit code to +91 ${phone}`}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.form, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: Spacing['2xl'], gap: Spacing.lg, paddingBottom: insets.bottom + 280 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {step === 'phone' ? (
          <>
            <View style={[styles.phoneInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <View style={styles.countryCode}>
                <Text style={[styles.flag]}>🇮🇳</Text>
                <Text style={[styles.codeText, { color: colors.text }]}>+91</Text>
                <View style={[styles.codeDivider, { backgroundColor: colors.divider }]} />
              </View>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={10}
                style={[styles.phoneTextInput, { color: colors.text }]}
                autoFocus
              />
            </View>

            <Button
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              disabled={phone.length !== 10}
              fullWidth
              size="lg"
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={[styles.signupLink]}
            >
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                New to Naploo?{' '}
                <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>
                  Sign Up
                </Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {devOtp ? (
              <View style={[styles.devBanner, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="bug-outline" size={16} color={colors.warning} />
                <Text style={[styles.devText, { color: colors.warning }]}>
                  Dev OTP: {devOtp}
                </Text>
              </View>
            ) : null}

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpRefs.current[index] = ref; }}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(index, val)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: digit ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      borderWidth: digit ? 2 : 1,
                    },
                  ]}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <Button
              title="Verify & Login"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={otp.join('').length !== 6}
              fullWidth
              size="lg"
            />

            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={[styles.resendText, { color: colors.textTertiary }]}>
                  Resend OTP in {countdown}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
              }}
            >
              <Text style={[styles.changePhone, { color: colors.textSecondary }]}>
                Change phone number
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  header: {
    marginTop: Spacing.lg,
  },
  logo: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  headerDesc: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.sm,
  },
  form: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    height: 56,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  flag: { fontSize: 20 },
  codeText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  codeDivider: { width: 1, height: 28, marginLeft: Spacing.sm },
  phoneTextInput: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    paddingHorizontal: Spacing.md,
    letterSpacing: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.sm },
  signupLink: { alignItems: 'center' },
  signupText: { fontSize: FontSize.md },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  devText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  changePhone: { fontSize: FontSize.sm, textAlign: 'center' },
});
