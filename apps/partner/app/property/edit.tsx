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
import { useAuthStore } from '@/store/auth';

export default function EditPropertyScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const partner = useAuthStore((s) => s.partner);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessName: partner?.businessName ?? '',
    description: partner?.description ?? '',
    address: partner?.address ?? '',
    city: partner?.city ?? '',
    state: partner?.state ?? '',
    pincode: partner?.pincode ?? '',
    contactPerson: partner?.contactPerson ?? '',
    contactPhone: partner?.contactPhone ?? '',
    contactEmail: partner?.contactEmail ?? '',
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.businessName) {
      Alert.alert('Required', 'Business name is required');
      return;
    }
    // Update partner profile in auth store
    const updatePartner = useAuthStore.getState().setPartner;
    const current = useAuthStore.getState().partner;
    if (current) {
      updatePartner({ ...current, ...form });
    }
    Alert.alert('Success', 'Property updated', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Business Details</Text>
        <View style={styles.fields}>
          <Input label="Business Name *" value={form.businessName} onChangeText={(v: string) => update('businessName', v)} />
          <Input label="Description" value={form.description} onChangeText={(v: string) => update('description', v)} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Location</Text>
        <View style={styles.fields}>
          <Input label="Address" value={form.address} onChangeText={(v: string) => update('address', v)} />
          <Input label="City" value={form.city} onChangeText={(v: string) => update('city', v)} />
          <Input label="State" value={form.state} onChangeText={(v: string) => update('state', v)} />
          <Input label="Pincode" value={form.pincode} onChangeText={(v: string) => update('pincode', v)} keyboardType="number-pad" maxLength={6} />
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Contact</Text>
        <View style={styles.fields}>
          <Input label="Contact Person" value={form.contactPerson} onChangeText={(v: string) => update('contactPerson', v)} />
          <Input label="Contact Phone" value={form.contactPhone} onChangeText={(v: string) => update('contactPhone', v)} keyboardType="phone-pad" />
          <Input label="Contact Email" value={form.contactEmail} onChangeText={(v: string) => update('contactEmail', v)} keyboardType="email-address" autoCapitalize="none" />
        </View>
      </Card>

      <Button title="Save Changes" onPress={handleSave} loading={loading} style={{ marginTop: Spacing.md }} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  fields: { gap: Spacing.md },
});
