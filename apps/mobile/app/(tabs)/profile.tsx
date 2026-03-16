import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useBookingsStore, useFavoritesStore } from '@/store/app';
import { useThemeStore } from '@/store/theme';
import { useSmartAlertsStore, startSmartTracking, stopSmartTracking } from '@/services/smartAlerts';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { bookings } = useBookingsStore();
  const { favoriteIds } = useFavoritesStore();
  const { mode, setMode } = useThemeStore();
  const { isEnabled: smartAlertsEnabled, setEnabled: setSmartAlertsEnabled, isTracking } = useSmartAlertsStore();

  const handleToggleSmartAlerts = (value: boolean) => {
    setSmartAlertsEnabled(value);
    if (value) startSmartTracking();
    else stopSmartTracking();
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.guestAvatar, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="person-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.text }]}>Welcome to Naploo</Text>
        <Text style={[styles.guestDesc, { color: colors.textSecondary }]}>
          Login to manage bookings, earn rewards, and access exclusive deals
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.loginBtnText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Naploo User';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon! You can update your name, email, and photo.');
  };

  const menuSections = [
    {
      title: 'Quick Actions',
      items: [
        { icon: 'receipt-outline' as const, label: 'My Bookings', onPress: () => router.push('/(tabs)/bookings') },
        { icon: 'heart-outline' as const, label: 'Saved Properties', badge: String(favoriteIds.size), onPress: () => router.push('/(tabs)/explore') },
        { icon: 'gift-outline' as const, label: 'Deals & Offers', onPress: () => router.push('/search') },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'person-outline' as const, label: 'Personal Information', onPress: handleEditProfile },
        { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Push notification preferences coming soon.') },
      ],
    },
    {
      title: 'Travel Safety',
      items: [
        {
          icon: 'shield-checkmark-outline' as const,
          label: 'Smart Rest Alerts',
          subtitle: isTracking ? 'Active — monitoring your journey' : 'Get reminders when you need rest',
          toggle: true,
          toggleValue: smartAlertsEnabled,
          onToggle: handleToggleSmartAlerts,
          onPress: () => {},
        },
        { icon: 'location-outline' as const, label: 'Nearby Pod Suggestions', onPress: () => Alert.alert('Nearby Pods', 'Naploo uses your location to suggest the nearest pods when you travel. Enable Smart Rest Alerts for automatic suggestions.') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline' as const, label: 'Help & FAQs', onPress: () => Linking.openURL('https://naploo.com/help') },
        { icon: 'chatbubble-outline' as const, label: 'Contact Support', onPress: () => Linking.openURL('mailto:support@naploo.com') },
        { icon: 'document-text-outline' as const, label: 'Terms & Privacy', onPress: () => Linking.openURL('https://naploo.com/terms') },
        { icon: 'information-circle-outline' as const, label: 'About Naploo', onPress: () => Linking.openURL('https://naploo.com/about') },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user.phone}</Text>
          {user.email && (
            <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{user.email}</Text>
          )}
        </View>
        <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        {[
          { value: String(bookings.length), label: 'Bookings' },
          { value: String(favoriteIds.size), label: 'Saved' },
          { value: user.referralCode || '--', label: 'Referral' },
        ].map((s, i) => (
          <View key={s.label} style={[styles.statItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.divider }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={[styles.menuTitle, { color: colors.textTertiary }]}>
            {section.title}
          </Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            {section.items.map((item: any, i: number) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                activeOpacity={item.toggle ? 1 : 0.7}
                style={[
                  styles.menuItem,
                  i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 1 }}>{item.subtitle}</Text>
                  )}
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={item.toggleValue ? colors.primary : '#f4f3f4'}
                  />
                ) : item.badge ? (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                {!item.toggle && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Theme Switcher */}
      <View style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: colors.textTertiary }]}>APPEARANCE</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
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
                    selected && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
                  ]}
                >
                  <Ionicons name={icon} size={22} color={selected ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.themeLabel, { color: selected ? colors.primary : colors.text }]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={() => {
          logout();
          router.replace('/(tabs)');
        }}
        style={[styles.logoutBtn, { borderColor: colors.error }]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textTertiary }]}>
        Naploo v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  guestAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  guestDesc: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: Spacing['3xl'] },
  loginBtn: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  loginBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  // Profile
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  profileInfo: { flex: 1 },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  userPhone: { fontSize: FontSize.sm, marginTop: 2 },
  userEmail: { fontSize: FontSize.xs, marginTop: 2 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  // Menu
  menuSection: { marginBottom: Spacing.lg },
  menuTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  badgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  // Theme Switcher
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
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  version: { fontSize: FontSize.xs, textAlign: 'center' },
});
