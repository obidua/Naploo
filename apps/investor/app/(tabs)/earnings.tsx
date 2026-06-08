import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { api, formatMoney } from '../../src/api';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await api.me();
      const invs = me.data?.investments || [];
      const all: any[] = [];
      for (const inv of invs) {
        const er = await api.earningsFor(inv.id);
        if (er.data?.earnings) all.push(...er.data.earnings.map((e: any) => ({ ...e, inv })));
      }
      all.sort((a, b) => new Date(b.earnedAt || b.created_at).getTime() - new Date(a.earnedAt || a.created_at).getTime());
      setEarnings(all);
      setTotalEarned(all.reduce((s, e) => s + Number(e.investorShare || 0), 0));
      setLoading(false);
    })();
  }, []);

  if (loading) return <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0d9488" /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>Earnings</Text>

        <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 20, borderRadius: 16 }}>
          <Text style={{ color: 'white', fontSize: 11, textTransform: 'uppercase', fontWeight: '600', opacity: 0.9 }}>Lifetime earnings</Text>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 }}>{formatMoney(totalEarned)}</Text>
          <Text style={{ color: 'white', fontSize: 11, opacity: 0.85, marginTop: 4 }}>{earnings.length} payouts</Text>
        </LinearGradient>

        {earnings.length === 0 ? (
          <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center' }}>
            <Ionicons name="trending-up" size={40} color="#cbd5e1" />
            <Text style={{ color: '#64748b', marginTop: 8 }}>No earnings yet.</Text>
          </View>
        ) : earnings.map((e) => (
          <View key={e.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View>
              <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{e.inv?.invoiceNumber}</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(e.earnedAt || e.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={{ fontWeight: '800', color: '#0d9488', fontSize: 15 }}>+{formatMoney(e.investorShare || 0)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
