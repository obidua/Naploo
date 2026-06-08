import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { api, formatMoney } from '../../src/api';

export default function DashboardScreen() {
  const [data, setData] = useState<{ enrolled: boolean; investor: any; investments: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const r = await api.me();
    if (r.data) setData({ enrolled: r.data.enrolled, investor: r.data.investor, investments: r.data.investments || [] });
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function enroll() {
    setLoading(true);
    await api.enroll();
    await load();
  }

  if (loading && !data) return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#0d9488" size="large" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {!data?.enrolled ? (
          <LinearGradient colors={['#10b981', '#0d9488']} style={{ borderRadius: 20, padding: 24 }}>
            <Ionicons name="trending-up" size={36} color="white" />
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginTop: 10 }}>Become a Naploo Investor</Text>
            <Text style={{ color: 'white', opacity: 0.9, fontSize: 13, marginTop: 6 }}>Buy pod sets at partner hotels. Earn 35-60% per booking. 3x guaranteed return.</Text>
            <TouchableOpacity onPress={enroll} style={{ marginTop: 16, padding: 12, backgroundColor: 'white', borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#0d9488', fontWeight: '700' }}>Enroll as investor</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <>
            <LinearGradient colors={['#10b981', '#0d9488']} style={{ borderRadius: 20, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Investor Dashboard</Text>
              <Text style={{ color: 'white', opacity: 0.85, fontSize: 12, marginTop: 4 }}>Status: {String(data.investor.status).toUpperCase().replace('_', ' ')}</Text>
            </LinearGradient>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Kpi label="Total invested" value={formatMoney(data.investor.totalInvested)} icon={<Ionicons name="cash" size={20} color="white" />} colors={['#3b82f6', '#06b6d4']} />
              <Kpi label="Total earned" value={formatMoney(data.investor.totalEarned)} icon={<Ionicons name="trending-up" size={20} color="white" />} colors={['#10b981', '#0d9488']} />
              <Kpi label="Pod sets" value={String(data.investor.totalPodSets || 0)} icon={<Ionicons name="cube" size={20} color="white" />} colors={['#8b5cf6', '#a855f7']} />
              <Kpi label="3x guarantee" value={formatMoney(data.investments.reduce((s, i) => s + Number(i.guaranteeAmount || 0), 0))} icon={<Ionicons name="wallet" size={20} color="white" />} colors={['#f59e0b', '#f97316']} />
            </View>

            <TouchableOpacity onPress={() => router.push('/(tabs)/offers')} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0' }}>
              <View>
                <Text style={{ fontWeight: '700', color: '#0f172a' }}>Browse open offers</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>New premises looking for investors</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#0d9488" />
            </TouchableOpacity>

            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>Active investments</Text>
              {data.investments.length === 0 ? (
                <Text style={{ color: '#94a3b8', fontSize: 13, paddingVertical: 12 }}>No investments yet.</Text>
              ) : data.investments.slice(0, 5).map((inv: any) => (
                <View key={inv.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '600', color: '#0f172a' }}>{inv.invoiceNumber}</Text>
                    <Text style={{ fontWeight: '700' }}>{formatMoney(inv.totalAmount)}</Text>
                  </View>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{inv.podSetCount} sets · {inv.deliveryOption}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ label, value, icon, colors }: { label: string; value: string; icon: any; colors: [string, string] }) {
  return (
    <View style={{ width: '48.5%', backgroundColor: 'white', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
      <LinearGradient colors={colors} style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {icon}
      </LinearGradient>
      <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>{value}</Text>
    </View>
  );
}
