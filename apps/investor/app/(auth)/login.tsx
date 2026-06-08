import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { api } from '../../src/api';

export default function LoginScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    if (phone.length < 10) { setError('Enter valid mobile number'); return; }
    setBusy(true); setError('');
    const r = await api.sendOtp(phone);
    setBusy(false);
    if (r.error || !r.data?.success) { setError('Could not send OTP'); return; }
    setStep('otp');
  }

  async function verifyOtp() {
    if (otp.length < 4) { setError('Enter OTP'); return; }
    setBusy(true); setError('');
    const r = await api.verifyOtp(phone, otp);
    setBusy(false);
    if (r.error || !r.data?.success) { setError('Invalid OTP'); return; }
    await AsyncStorage.multiSet([
      ['access_token', r.data.accessToken],
      ['refresh_token', r.data.refreshToken],
      ['user', JSON.stringify(r.data.user)],
    ]);
    router.replace('/(tabs)/dashboard');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <LinearGradient colors={['#10b981', '#0d9488']} style={{ width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="trending-up" size={36} color="white" />
            </LinearGradient>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Naploo Investor</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Track pod investments + earnings</Text>
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, gap: 16 }}>
            {step === 'phone' ? (
              <>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Mobile number</Text>
                <TextInput
                  value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder="98765 43210" maxLength={10} keyboardType="phone-pad"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16 }}
                />
                {error ? <Text style={{ color: '#dc2626', fontSize: 12 }}>{error}</Text> : null}
                <TouchableOpacity onPress={sendOtp} disabled={busy} style={{ marginTop: 8 }}>
                  <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 14, borderRadius: 12, alignItems: 'center' }}>
                    {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Send OTP</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>OTP sent to +91 {phone}</Text>
                <TextInput
                  value={otp} onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •" maxLength={6} keyboardType="number-pad"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 20, textAlign: 'center', letterSpacing: 6 }}
                />
                {error ? <Text style={{ color: '#dc2626', fontSize: 12 }}>{error}</Text> : null}
                <TouchableOpacity onPress={verifyOtp} disabled={busy} style={{ marginTop: 8 }}>
                  <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 14, borderRadius: 12, alignItems: 'center' }}>
                    {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Verify & sign in</Text>}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); }}>
                  <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>Change number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
