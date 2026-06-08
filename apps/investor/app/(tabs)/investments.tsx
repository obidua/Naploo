import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, formatMoney } from '../../src/api';

export default function InvestmentsScreen() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await api.me();
      if (r.data?.investments) setInvestments(r.data.investments);
      setLoading(false);
    })();
  }, []);

  if (loading) return <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0d9488" /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>My investments</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Pod sets you've claimed.</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}>
        {investments.length === 0 ? (
          <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center' }}>
            <Ionicons name="cube" size={40} color="#cbd5e1" />
            <Text style={{ color: '#64748b', marginTop: 8 }}>No investments yet.</Text>
          </View>
        ) : investments.map((inv) => {
          const earned = Number(inv.earnedSoFar || 0);
          const guarantee = Number(inv.guaranteeAmount || 0);
          const progress = guarantee > 0 ? Math.min(100, Math.round((earned / guarantee) * 100)) : 0;
          return (
            <View key={inv.id} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{inv.invoiceNumber}</Text>
                <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#065f46', textTransform: 'uppercase' }}>{inv.status}</Text>
                </View>
              </View>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{inv.podSetCount} pod sets · {inv.deliveryOption}</Text>

              <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                <View><Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Invested</Text><Text style={{ fontWeight: '700', fontSize: 16 }}>{formatMoney(inv.totalAmount)}</Text></View>
                <View><Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>3x guarantee</Text><Text style={{ fontWeight: '700', fontSize: 16, color: '#0d9488' }}>{formatMoney(guarantee)}</Text></View>
              </View>

              <View style={{ marginTop: 12 }}>
                <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ width: `${progress}%`, height: '100%', backgroundColor: inv.guaranteeReached ? '#10b981' : '#3b82f6' }} />
                </View>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'right' }}>{progress}% of guarantee · {formatMoney(earned)} earned</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
