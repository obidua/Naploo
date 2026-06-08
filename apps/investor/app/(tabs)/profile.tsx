import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { api, logout } from '../../src/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
      const r = await api.me();
      if (r.data?.investor) setInvestor(r.data.investor);
      setLoading(false);
    })();
  }, []);

  async function doLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (loading) return <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0d9488" /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 20, borderRadius: 16, alignItems: 'center' }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="person" size={36} color="#0d9488" />
          </View>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Investor'}</Text>
          <Text style={{ color: 'white', opacity: 0.85, fontSize: 13, marginTop: 4 }}>{user?.phone || user?.email}</Text>
        </LinearGradient>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Row icon={<Ionicons name="call" size={16} color="#64748b" />} label="Phone" value={user?.phone || '—'} />
          <Row icon={<Ionicons name="mail" size={16} color="#64748b" />} label="Email" value={user?.email || '—'} />
          <Row icon={<Ionicons name="person" size={16} color="#64748b" />} label="Role" value={user?.role || '—'} />
        </View>

        {investor && (
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {investor.status === 'approved' || investor.status === 'active' ? <Ionicons name="shield-checkmark" size={18} color="#10b981" /> : <Ionicons name="alert-circle" size={18} color="#f59e0b" />}
              <Text style={{ fontWeight: '700', color: '#0f172a' }}>KYC: {String(investor.status).toUpperCase().replace('_', ' ')}</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              {investor.status === 'approved' || investor.status === 'active'
                ? 'You can claim pod sets anytime from Offers.'
                : 'Submit KYC documents to admin (email: investors@naploo.com) to begin investing.'}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={doLogout} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fecaca' }}>
          <Ionicons name="log-out" size={18} color="#dc2626" />
          <Text style={{ fontWeight: '600', color: '#dc2626' }}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: '#0f172a', fontWeight: '500' }}>{value}</Text>
      </View>
    </View>
  );
}
