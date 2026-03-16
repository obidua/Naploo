import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/theme';
import { getCurrentLocation, getNearbyPods, getLocationTypeInfo, useSmartAlertsStore } from '@/services/smartAlerts';
import { formatCurrency } from '@/utils';

export function NearbyPodsBar() {
  const { colors } = useTheme();
  const { isTracking, nearbyPods, travelContext } = useSmartAlertsStore();
  const [loading, setLoading] = useState(false);
  const [localPods, setLocalPods] = useState(nearbyPods);

  useEffect(() => {
    if (nearbyPods.length > 0) {
      setLocalPods(nearbyPods);
    } else {
      // Fetch once if not tracking
      fetchNearby();
    }
  }, [nearbyPods]);

  const fetchNearby = async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      const pods = getNearbyPods(loc.lat, loc.lng, 50);
      setLocalPods(pods);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textTertiary }]}>Finding pods near you...</Text>
      </View>
    );
  }

  if (localPods.length === 0) return null;

  const topPods = localPods.slice(0, 3);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={[styles.liveDot, { backgroundColor: '#22c55e' }]} />
          <Text style={[styles.title, { color: colors.text }]}>Nearby Pods</Text>
        </View>
        {travelContext.isMoving && (
          <View style={[styles.travelBadge, { backgroundColor: '#7c3aed15' }]}>
            <Ionicons name="car" size={12} color={colors.primary} />
            <Text style={{ fontSize: 10, color: colors.primary }}>
              {Math.round(travelContext.currentSpeed)} km/h
            </Text>
          </View>
        )}
      </View>
      {topPods.map((pod) => {
        const info = getLocationTypeInfo(pod.type);
        return (
          <TouchableOpacity
            key={pod.id}
            onPress={() => router.push('/search' as any)}
            style={[styles.podRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          >
            <View style={[styles.podIcon, { backgroundColor: colors.primary + '15' }]}>
              <Text style={{ fontSize: 20 }}>{info.emoji}</Text>
            </View>
            <View style={styles.podInfo}>
              <Text style={[styles.podName, { color: colors.text }]} numberOfLines={1}>{pod.name}</Text>
              <View style={styles.podMeta}>
                <Text style={[styles.podMetaText, { color: colors.textTertiary }]}>{info.label}</Text>
                <Text style={[styles.podMetaText, { color: colors.textTertiary }]}>·</Text>
                <Text style={[styles.podMetaText, { color: colors.textTertiary }]}>{pod.podsAvailable} pods</Text>
              </View>
            </View>
            <View style={styles.podRight}>
              <Text style={[styles.podDist, { color: colors.primary }]}>
                {pod.distance ? `${pod.distance.toFixed(1)} km` : '—'}
              </Text>
              <Text style={{ fontSize: 10, color: colors.textTertiary }}>
                from {formatCurrency(pod.priceFrom)}/hr
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {travelContext.isMoving && travelContext.travelDuration > 30 && (
        <View style={[styles.restTip, { backgroundColor: '#fef3c7', borderColor: '#fbbf24' }]}>
          <Text style={{ fontSize: 13 }}>💡</Text>
          <Text style={{ fontSize: 12, color: '#92400e', flex: 1 }}>
            You've been driving for {Math.round(travelContext.travelDuration)} min. A short break can boost alertness!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  loadingText: { fontSize: FontSize.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  travelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  podRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1 },
  podIcon: { width: 44, height: 44, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  podInfo: { flex: 1, gap: 2 },
  podName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  podMeta: { flexDirection: 'row', gap: 4 },
  podMetaText: { fontSize: 11 },
  podRight: { alignItems: 'flex-end' },
  podDist: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  restTip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1 },
});
