import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { api, formatMoney } from '../../src/api';

export default function OffersScreen() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any | null>(null);

  const load = useCallback(async () => {
    const r = await api.listOffers();
    if (r.data?.offers) setOffers(r.data.offers);
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0d9488" /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>Open offers</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Properties looking for pod investors.</Text>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />} contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}>
        {offers.length === 0 ? (
          <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center' }}>
            <Ionicons name="briefcase" size={40} color="#cbd5e1" />
            <Text style={{ color: '#64748b', marginTop: 8 }}>No open offers right now.</Text>
          </View>
        ) : offers.map((o) => (
          <View key={o.id} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 16 }}>{o.property_name}</Text>
                {o.location ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Ionicons name="location" size={12} color="#64748b" /><Text style={{ color: '#64748b', fontSize: 12 }}>{o.location}</Text>
                  </View>
                ) : null}
              </View>
              {o.my_response_status ? (
                <View style={{ backgroundColor: o.my_response_status === 'accepted' ? '#d1fae5' : '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: o.my_response_status === 'accepted' ? '#065f46' : '#92400e', textTransform: 'uppercase' }}>{o.my_response_status}</Text>
                </View>
              ) : null}
            </View>

            {o.description ? <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }} numberOfLines={3}>{o.description}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <Cell label="₹/set" value={formatMoney(o.price_per_set)} />
              <Cell label="Available" value={`${o.sets_remaining}/${o.total_sets_available}`} />
              {o.expected_monthly_yield ? <Cell label="Monthly yield" value={formatMoney(o.expected_monthly_yield)} color="#0d9488" /> : null}
            </View>

            {!o.my_response_status ? (
              <TouchableOpacity onPress={() => setActiveOffer(o)} style={{ marginTop: 12 }}>
                <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Respond</Text>
                  <Ionicons name="arrow-forward" size={14} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>

      {activeOffer && <RespondModal offer={activeOffer} onClose={() => setActiveOffer(null)} onSaved={() => { setActiveOffer(null); load(); }} />}
    </SafeAreaView>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View>
      <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: color || '#0f172a', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

function RespondModal({ offer, onClose, onSaved }: { offer: any; onClose: () => void; onSaved: () => void }) {
  const [count, setCount] = useState(1);
  const [delivery, setDelivery] = useState<string>(offer.delivery_default || 'leaseback');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const baseAmount = count * Number(offer.price_per_set);
  const total = Math.round(baseAmount * 1.18);
  const max = offer.sets_remaining;

  async function save() {
    setBusy(true); setError('');
    const r = await api.respondToOffer(offer.id, count, delivery);
    setBusy(false);
    if (!r.data?.success) { setError(r.data?.message || r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <Modal visible animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Respond</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#64748b" /></TouchableOpacity>
          </View>

          <Text style={{ color: '#64748b', fontSize: 13 }}>Investing in <Text style={{ fontWeight: '700', color: '#0f172a' }}>{offer.property_name}</Text></Text>

          <View>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Number of pod sets</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => setCount(Math.max(1, count - 1))} style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="remove" size={18} color="#0f172a" /></TouchableOpacity>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '800' }}>{count}</Text>
              <TouchableOpacity onPress={() => setCount(Math.min(max, count + 1))} style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={18} color="#0f172a" /></TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>{max} remaining</Text>
          </View>

          <View>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Delivery</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['leaseback', 'doorstep'].map((d) => (
                <TouchableOpacity key={d} onPress={() => setDelivery(d)} style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: delivery === d ? '#10b981' : '#e2e8f0', backgroundColor: delivery === d ? '#d1fae5' : 'white' }}>
                  <Text style={{ fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>{d}</Text>
                  <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{d === 'leaseback' ? 'Pods at partner hotel' : 'Delivered to you'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, gap: 4 }}>
            <Row label="Base" value={formatMoney(baseAmount)} />
            <Row label="GST 18%" value={formatMoney(total - baseAmount)} />
            <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
            <Row label="Total" value={formatMoney(total)} bold />
          </View>

          {error ? <Text style={{ color: '#dc2626', fontSize: 12 }}>{error}</Text> : null}

          <TouchableOpacity onPress={save} disabled={busy}>
            <LinearGradient colors={['#10b981', '#0d9488']} style={{ padding: 14, borderRadius: 12, alignItems: 'center' }}>
              {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Submit response</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: bold ? '#0f172a' : '#64748b', fontWeight: bold ? '700' : '500' }}>{label}</Text>
      <Text style={{ color: '#0f172a', fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  );
}
