import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore } from '@/store/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/services/api';

export default function ProfileScreen() {
  const { colors: c } = useTheme();
  const { mode, setMode } = useThemeStore();
  const router = useRouter();
  const { user, partner, logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authApi.logout();
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: c.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: c.primary }]}>
              {(user?.firstName?.[0] ?? 'P').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: c.text }]}>
            {user?.firstName ?? 'Partner'} {user?.lastName ?? ''}
          </Text>
          <Text style={[styles.phone, { color: c.textSecondary }]}>{user?.phone}</Text>
          {user?.role && (
            <View style={[styles.roleBadge, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.roleText, { color: c.primary }]}>
                {user.role.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Partner Info */}
        {partner && (
          <Card style={styles.infoCard}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Business Info</Text>
            <InfoRow label="Business Name" value={partner.businessName} c={c} />
            <InfoRow label="Type" value={partner.businessType} c={c} />
            <InfoRow label="Model" value={partner.partnershipModel?.replace('_', ' ')} c={c} />
            <InfoRow label="Commission" value={`${partner.commissionPercent}%`} c={c} />
            <InfoRow label="City" value={partner.city ?? '-'} c={c} />
            <InfoRow label="Status" value={partner.status} c={c} />
          </Card>
        )}

        {/* Menu items */}
        <Card style={styles.menuCard} padded={false}>
          <MenuItem icon="business-outline" label="Edit Property" c={c} onPress={() => router.push('/property/edit' as any)} />
          <MenuItem icon="document-text-outline" label="Agreement & Docs" c={c} onPress={() => Alert.alert('Documents', 'Your agreement documents are available in the partner portal.')} />
          <MenuItem icon="bar-chart-outline" label="Analytics" c={c} onPress={() => router.push('/(tabs)/earnings')} />
          <MenuItem icon="star-outline" label="Reviews" c={c} onPress={() => Alert.alert('Reviews', 'Your property has 156 reviews with an avg rating of 4.3★')} />
          <MenuItem icon="notifications-outline" label="Notifications" c={c} onPress={() => Alert.alert('Notifications', 'Push notifications are enabled. Manage from your device settings.')} />
          <MenuItem icon="help-circle-outline" label="Help & Support" c={c} onPress={() => Linking.openURL('mailto:partners@naploo.com')} />
          <MenuItem icon="shield-checkmark-outline" label="Terms & Privacy" c={c} onPress={() => Linking.openURL('https://naploo.com/terms')} />
          <MenuItem icon="information-circle-outline" label="About Naploo" c={c} onPress={() => Linking.openURL('https://naploo.com/about')} last />
        </Card>

        {/* Theme Switcher */}
        <Text style={[styles.sectionLabel, { color: c.textTertiary }]}>APPEARANCE</Text>
        <Card style={styles.menuCard} padded={false}>
          <View style={styles.themeRow}>
            {(['system', 'light', 'dark'] as const).map((opt) => {
              const selected = mode === opt;
              const icon = opt === 'system' ? 'phone-portrait-outline' : opt === 'light' ? 'sunny-outline' : 'moon-outline';
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setMode(opt)}
                  style={[
                    styles.themeOption,
                    selected && { backgroundColor: c.primary + '15', borderColor: c.primary },
                  ]}
                >
                  <Ionicons name={icon} size={22} color={selected ? c.primary : c.textSecondary} />
                  <Text style={[styles.themeLabel, { color: selected ? c.primary : c.text }]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: Spacing.xl }}
          textStyle={{ color: c.error }}
        />

        <Text style={[styles.version, { color: c.textTertiary }]}>
          Naploo Partner v1.0.0
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, c }: { label: string; value: string | undefined | null; c: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value ?? '-'}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  c,
  onPress,
  last,
}: {
  icon: any;
  label: string;
  c: any;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && { borderBottomWidth: 1, borderBottomColor: c.divider }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={c.textSecondary} />
      <Text style={[styles.menuLabel, { color: c.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  phone: {
    fontSize: FontSize.md,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontSize: FontSize.sm,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  themeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginTop: Spacing.xl,
  },
});
