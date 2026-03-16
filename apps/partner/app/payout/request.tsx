import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, Spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePayoutsStore, getDashboardStats } from '@/store/partner';

export default function RequestPayoutScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { requestPayout } = usePayoutsStore();
  const availableBalance = getDashboardStats().pendingPayouts;

  const [form, setForm] = useState({
    amount: String(availableBalance),
    bankAccount: '••••••1234',
    bankIfsc: 'HDFC0001234',
    bankName: 'HDFC Bank',
  });

  async function handleRequest() {
    const amount = Number(form.amount);
    if (!amount || amount <= 0 || amount > availableBalance) {
      Alert.alert('Invalid', `Amount must be between ₹1 and ₹${availableBalance}`);
      return;
    }
    requestPayout();
    Alert.alert('Success', 'Payout request submitted. It will be processed within 2-3 business days.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {/* Balance card */}
      <Card style={StyleSheet.flatten([styles.balanceCard, { backgroundColor: c.primary }])}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₹{availableBalance.toLocaleString('en-IN')}</Text>
        <Text style={styles.balanceNote}>After 10% TDS deduction, you'll receive ₹{(availableBalance * 0.9).toLocaleString('en-IN')}</Text>
      </Card>

      {/* Amount */}
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Payout Amount</Text>
        <Input
          label="Amount (₹)"
          placeholder="Enter amount"
          value={form.amount}
          onChangeText={(v: string) => setForm((p) => ({ ...p, amount: v }))}
          keyboardType="numeric"
        />
      </Card>

      {/* Bank Details */}
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Bank Account</Text>
        <View style={styles.bankRow}>
          <Text style={[styles.bankLabel, { color: c.textSecondary }]}>Bank</Text>
          <Text style={[styles.bankValue, { color: c.text }]}>{form.bankName}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={[styles.bankLabel, { color: c.textSecondary }]}>Account</Text>
          <Text style={[styles.bankValue, { color: c.text }]}>{form.bankAccount}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={[styles.bankLabel, { color: c.textSecondary }]}>IFSC</Text>
          <Text style={[styles.bankValue, { color: c.text }]}>{form.bankIfsc}</Text>
        </View>
      </Card>

      <Button title="Request Payout" onPress={handleRequest} loading={loading} style={{ marginTop: Spacing.md }} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  balanceCard: {},
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  balanceValue: { color: '#fff', fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, marginVertical: Spacing.xs },
  balanceNote: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  bankLabel: { fontSize: FontSize.sm },
  bankValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
