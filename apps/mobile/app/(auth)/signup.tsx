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
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { authApi, setTokens } from '@/services/api';

type Step = 'details' | 'phone' | 'otp';

export default function SignupScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleContinue = () => {
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Terms', 'Please accept the terms & conditions');
      return;
    }
    setStep('phone');
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(`+91${phone}`);
      if (res.otp) setDevOtp(res.otp);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(`+91${phone}`, otpCode);
      await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      await setUser({ ...res.user, firstName, lastName, email });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const stepTitles = {
    details: { title: 'Create Account', desc: 'Join Naploo and start booking' },
    phone: { title: 'Your Phone', desc: "We'll send a verification code" },
    otp: { title: 'Verify OTP', desc: `Code sent to +91 ${phone}` },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <LinearGradient
        colors={isDark ? ['#2e1065', '#0f0a1e'] : ['#8b5cf6', '#7c3aed']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        <TouchableOpacity
          onPress={() => (step === 'details' ? router.back() : setStep(step === 'otp' ? 'phone' : 'details'))}
          style={styles.backBtn}
        >
          <Ionicons name={step === 'details' ? 'close' : 'arrow-back'} size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>naploo</Text>

          {/* Step indicator */}
          <View style={styles.steps}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      s <= (step === 'details' ? 1 : step === 'phone' ? 2 : 3)
                        ? '#fff'
                        : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.headerTitle}>{stepTitles[step].title}</Text>
          <Text style={styles.headerDesc}>{stepTitles[step].desc}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.form, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: Spacing['2xl'], gap: Spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'details' && (
          <>
            <Input
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              autoFocus
            />
            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={styles.termsRow}
            >
              <Ionicons
                name={acceptTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={acceptTerms ? colors.primary : colors.textTertiary}
              />
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                I agree to Naploo's{' '}
                <Text style={{ color: colors.primary }}>Terms & Conditions</Text> and{' '}
                <Text style={{ color: colors.primary }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button title="Continue" onPress={handleContinue} fullWidth size="lg" />

            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'phone' && (
          <>
            <View style={[styles.phoneInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
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
          </>
        )}

        {step === 'otp' && (
          <>
            {devOtp ? (
              <View style={[styles.devBanner, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="bug-outline" size={16} color={colors.warning} />
                <Text style={[styles.devText, { color: colors.warning }]}>Dev OTP: {devOtp}</Text>
              </View>
            ) : null}

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpRefs.current[index] = ref; }}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(index, val)}
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
              title="Create Account"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={otp.join('').length !== 6}
              fullWidth
              size="lg"
              variant="secondary"
            />
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
  backBtn: {
    alignSelf: 'flex-start',
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  header: { marginTop: Spacing.md },
  logo: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  steps: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stepDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  headerDesc: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  termsText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  switchText: {
    fontSize: FontSize.md,
    textAlign: 'center',
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
});
