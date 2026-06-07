import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, AppState } from 'react-native';
import { create } from 'zustand';

// ─── Types ───
interface NearbyPodLocation {
  id: string;
  name: string;
  type: 'airport' | 'railway' | 'highway' | 'hospital' | 'bus_stand' | 'tourist' | 'commercial' | 'mall' | 'general';
  lat: number;
  lng: number;
  distance?: number; // km
  podsAvailable: number;
  priceFrom: number;
}

interface TravelContext {
  isMoving: boolean;
  currentSpeed: number; // km/h
  avgSpeed: number;
  travelDuration: number; // minutes since started moving
  distanceTraveled: number; // km
  lastRestTime: number; // timestamp
  location: { lat: number; lng: number } | null;
}

interface SmartAlertsState {
  isEnabled: boolean;
  isTracking: boolean;
  travelContext: TravelContext;
  nearbyPods: NearbyPodLocation[];
  lastNotificationTime: number;
  setEnabled: (v: boolean) => void;
  updateContext: (partial: Partial<TravelContext>) => void;
  setNearbyPods: (pods: NearbyPodLocation[]) => void;
}

// ─── Store ───
export const useSmartAlertsStore = create<SmartAlertsState>((set) => ({
  isEnabled: true,
  isTracking: false,
  travelContext: {
    isMoving: false,
    currentSpeed: 0,
    avgSpeed: 0,
    travelDuration: 0,
    distanceTraveled: 0,
    lastRestTime: Date.now(),
    location: null,
  },
  nearbyPods: [],
  lastNotificationTime: 0,
  setEnabled: (v) => set({ isEnabled: v }),
  updateContext: (partial) =>
    set((state) => ({
      travelContext: { ...state.travelContext, ...partial },
    })),
  setNearbyPods: (pods) => set({ nearbyPods: pods }),
}));

// ─── Notification Setup ───
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function setupNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('smart-alerts', {
      name: 'Smart Travel Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
      description: 'Rest reminders and nearby pod notifications',
    });
  }

  if (existingStatus !== 'granted') return null;

  // Skip push token in dev / when no EAS projectId is configured.
  // (Local notifications still work without it; only Expo's push server needs it.)
  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants as any).easConfig?.projectId;
  if (!projectId) {
    console.log('[smartAlerts] No EAS projectId — skipping push token registration');
    return null;
  }
  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (e) {
    console.warn('[smartAlerts] getExpoPushTokenAsync failed:', e);
    return null;
  }
}

// ─── Location Permission ───
export async function requestLocationPermission(): Promise<boolean> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return false;
  // Try background for travel tracking
  if (Platform.OS !== 'web') {
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    // Background is optional — foreground is enough for basic features
  }
  return true;
}

// ─── Simulated Nearby Pod Locations (India-wide coverage) ───
const POD_NETWORK: NearbyPodLocation[] = [
  // Airports
  { id: 'np-del-ap', name: 'Delhi Airport T3', type: 'airport', lat: 28.5562, lng: 77.1000, podsAvailable: 24, priceFrom: 199 },
  { id: 'np-bom-ap', name: 'Mumbai Airport T2', type: 'airport', lat: 19.0896, lng: 72.8656, podsAvailable: 18, priceFrom: 249 },
  { id: 'np-blr-ap', name: 'Bangalore Airport', type: 'airport', lat: 13.1986, lng: 77.7066, podsAvailable: 16, priceFrom: 199 },
  { id: 'np-maa-ap', name: 'Chennai Airport', type: 'airport', lat: 12.9941, lng: 80.1709, podsAvailable: 12, priceFrom: 179 },
  { id: 'np-hyd-ap', name: 'Hyderabad Airport', type: 'airport', lat: 17.2403, lng: 78.4294, podsAvailable: 14, priceFrom: 199 },
  // Railway Stations
  { id: 'np-del-rly', name: 'New Delhi Railway', type: 'railway', lat: 28.6424, lng: 77.2192, podsAvailable: 20, priceFrom: 149 },
  { id: 'np-bom-cst', name: 'Mumbai CST', type: 'railway', lat: 18.9398, lng: 72.8355, podsAvailable: 16, priceFrom: 149 },
  { id: 'np-maa-central', name: 'Chennai Central', type: 'railway', lat: 13.0833, lng: 80.2750, podsAvailable: 14, priceFrom: 129 },
  { id: 'np-hyd-stn', name: 'Secunderabad Junction', type: 'railway', lat: 17.4337, lng: 78.5011, podsAvailable: 12, priceFrom: 149 },
  // Highways
  { id: 'np-mum-pune-hw', name: 'Mumbai-Pune Expressway', type: 'highway', lat: 18.7500, lng: 73.4000, podsAvailable: 8, priceFrom: 99 },
  { id: 'np-del-agra-hw', name: 'Delhi-Agra Highway', type: 'highway', lat: 27.8000, lng: 77.6000, podsAvailable: 6, priceFrom: 99 },
  { id: 'np-blr-mys-hw', name: 'Bangalore-Mysore Highway', type: 'highway', lat: 12.5000, lng: 76.8000, podsAvailable: 8, priceFrom: 99 },
  { id: 'np-nh48-hw', name: 'NH48 Rest Stop Dharuhera', type: 'highway', lat: 28.2076, lng: 76.7960, podsAvailable: 10, priceFrom: 99 },
  // Hospitals
  { id: 'np-aiims', name: 'Near AIIMS Delhi', type: 'hospital', lat: 28.5672, lng: 77.2100, podsAvailable: 8, priceFrom: 149 },
  { id: 'np-fortis-blr', name: 'Near Fortis Bangalore', type: 'hospital', lat: 12.9600, lng: 77.6400, podsAvailable: 6, priceFrom: 149 },
  // Bus Stands
  { id: 'np-del-isbt', name: 'ISBT Kashmere Gate', type: 'bus_stand', lat: 28.6683, lng: 77.2296, podsAvailable: 12, priceFrom: 99 },
  { id: 'np-blr-majestic', name: 'Majestic Bus Stand', type: 'bus_stand', lat: 12.9772, lng: 77.5714, podsAvailable: 10, priceFrom: 99 },
  // Tourist Places
  { id: 'np-agra-taj', name: 'Near Taj Mahal', type: 'tourist', lat: 27.1751, lng: 78.0421, podsAvailable: 12, priceFrom: 179 },
  { id: 'np-jaipur-hawa', name: 'Near Hawa Mahal', type: 'tourist', lat: 26.9239, lng: 75.8267, podsAvailable: 10, priceFrom: 149 },
  { id: 'np-goa-calangute', name: 'Calangute Beach Goa', type: 'tourist', lat: 15.5437, lng: 73.7554, podsAvailable: 14, priceFrom: 199 },
  // Commercial / IT Parks
  { id: 'np-blr-ecity', name: 'Electronic City BLR', type: 'commercial', lat: 12.8449, lng: 77.6603, podsAvailable: 20, priceFrom: 149 },
  { id: 'np-hyd-hitech', name: 'HITEC City Hyderabad', type: 'commercial', lat: 17.4435, lng: 78.3772, podsAvailable: 16, priceFrom: 149 },
  { id: 'np-pun-hinjewadi', name: 'Hinjewadi IT Park Pune', type: 'commercial', lat: 18.5912, lng: 73.7389, podsAvailable: 14, priceFrom: 149 },
  { id: 'np-gurgaon-cyber', name: 'Cyber City Gurgaon', type: 'commercial', lat: 28.4949, lng: 77.0882, podsAvailable: 18, priceFrom: 179 },
  // Malls
  { id: 'np-del-mall', name: 'Select City Walk Delhi', type: 'mall', lat: 28.5285, lng: 77.2189, podsAvailable: 8, priceFrom: 199 },
  { id: 'np-mum-phoenix', name: 'Phoenix Mall Mumbai', type: 'mall', lat: 19.0022, lng: 72.8263, podsAvailable: 10, priceFrom: 199 },
];

// ─── Distance Calculation (Haversine) ───
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Get Nearby Pods ───
export function getNearbyPods(lat: number, lng: number, radiusKm: number = 25): NearbyPodLocation[] {
  return POD_NETWORK
    .map((pod) => ({
      ...pod,
      distance: haversineDistance(lat, lng, pod.lat, pod.lng),
    }))
    .filter((pod) => pod.distance! <= radiusKm)
    .sort((a, b) => a.distance! - b.distance!);
}

// ─── Location Type Emoji & Label ───
export function getLocationTypeInfo(type: NearbyPodLocation['type']): { emoji: string; label: string } {
  const map: Record<string, { emoji: string; label: string }> = {
    airport: { emoji: '✈️', label: 'Airport' },
    railway: { emoji: '🚂', label: 'Railway Station' },
    highway: { emoji: '🛣️', label: 'Highway Rest Stop' },
    hospital: { emoji: '🏥', label: 'Hospital' },
    bus_stand: { emoji: '🚌', label: 'Bus Stand' },
    tourist: { emoji: '🏛️', label: 'Tourist Spot' },
    commercial: { emoji: '🏢', label: 'IT/Commercial' },
    mall: { emoji: '🛍️', label: 'Mall' },
    general: { emoji: '📍', label: 'General' },
  };
  return map[type] || map.general;
}

// ─── Smart Alert Messages ───
const REST_MESSAGES = [
  { title: '🛏️ Time for a Power Nap!', body: "You've been driving for {mins} minutes. A {duration}-min rest can boost alertness by 54%. Nearest pod: {name} ({dist} km)" },
  { title: '☕ Rest & Recharge Nearby', body: "Long journey? Take a break at {name}, just {dist} km away. Pods from ₹{price}/hr. Your safety matters!" },
  { title: '⚡ Naploo Pit Stop Ahead', body: '{name} is just {dist} km away. Fresh up, grab a meal, take a quick nap. Pods available now!' },
  { title: '🌙 Feeling Drowsy?', body: "Research shows driving tired is as dangerous as drunk driving. {name} has {pods} pods available, {dist} km from you." },
  { title: '🎯 Smart Rest Reminder', body: "You've covered {km} km. Top drivers take 15-min breaks every 2 hours. {name} — {dist} km, pods from ₹{price}/hr" },
];

const NEARBY_MESSAGES = [
  { title: '📍 Naploo Pod Near You!', body: "{name} — {pods} pods available from ₹{price}/hr. Perfect for a quick rest!" },
  { title: '🏨 Rest Stop Ahead', body: "You're near {name}. Need a break? {pods} pods ready, starting at ₹{price}/hr" },
];

// ─── Send Smart Notification ───
async function sendSmartNotification(
  type: 'rest_reminder' | 'nearby_pod',
  pod: NearbyPodLocation,
  context: TravelContext
) {
  const store = useSmartAlertsStore.getState();
  // Don't spam — min 30 min between notifications
  if (Date.now() - store.lastNotificationTime < 30 * 60 * 1000) return;

  const messages = type === 'rest_reminder' ? REST_MESSAGES : NEARBY_MESSAGES;
  const template = messages[Math.floor(Math.random() * messages.length)];

  const body = template.body
    .replace('{mins}', String(Math.round(context.travelDuration)))
    .replace('{name}', pod.name)
    .replace('{dist}', pod.distance?.toFixed(1) || '?')
    .replace('{price}', String(pod.priceFrom))
    .replace('{pods}', String(pod.podsAvailable))
    .replace('{km}', String(Math.round(context.distanceTraveled)))
    .replace('{duration}', '20');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: template.title,
      body,
      data: { type: 'smart_alert', podId: pod.id, podName: pod.name },
      ...(Platform.OS === 'android' && { channelId: 'smart-alerts' }),
    },
    trigger: null, // immediate
  });

  useSmartAlertsStore.setState({ lastNotificationTime: Date.now() });
}

// ─── Speed Tracking State ───
let locationSubscription: Location.LocationSubscription | null = null;
let speedHistory: number[] = [];
let travelStartTime: number = 0;
let lastLat = 0;
let lastLng = 0;
let totalDistance = 0;

// ─── Start Smart Tracking ───
export async function startSmartTracking() {
  const store = useSmartAlertsStore.getState();
  if (!store.isEnabled) return;

  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  speedHistory = [];
  travelStartTime = Date.now();
  totalDistance = 0;

  useSmartAlertsStore.setState({ isTracking: true });

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 500, // Update every 500m
      timeInterval: 30000, // or every 30s
    },
    (location) => {
      const { latitude, longitude, speed } = location.coords;
      const speedKmh = (speed || 0) * 3.6; // m/s to km/h

      // Update distance
      if (lastLat && lastLng) {
        totalDistance += haversineDistance(lastLat, lastLng, latitude, longitude);
      }
      lastLat = latitude;
      lastLng = longitude;

      // Track speed
      speedHistory.push(speedKmh);
      if (speedHistory.length > 20) speedHistory.shift();
      const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;

      const isMoving = avgSpeed > 15; // Moving if avg > 15 km/h
      const travelDuration = isMoving ? (Date.now() - travelStartTime) / 60000 : 0;

      const context: TravelContext = {
        isMoving,
        currentSpeed: speedKmh,
        avgSpeed,
        travelDuration,
        distanceTraveled: totalDistance,
        lastRestTime: isMoving ? store.travelContext.lastRestTime : Date.now(),
        location: { lat: latitude, lng: longitude },
      };

      store.updateContext(context);

      // Find nearby pods
      const nearby = getNearbyPods(latitude, longitude, 25);
      store.setNearbyPods(nearby);

      // Smart alerts logic
      if (nearby.length > 0) {
        const closestPod = nearby[0];

        // Rest reminder: driving > 90 min continuously
        if (isMoving && travelDuration > 90) {
          sendSmartNotification('rest_reminder', closestPod, context);
        }
        // Rest reminder: driving > 2 hours since last rest
        else if (isMoving && (Date.now() - context.lastRestTime) > 2 * 60 * 60 * 1000) {
          sendSmartNotification('rest_reminder', closestPod, context);
        }
        // Nearby pod alert: within 5km and user is slowing down (possibly looking for rest)
        else if (closestPod.distance! < 5 && speedKmh < 30 && avgSpeed > 40) {
          sendSmartNotification('nearby_pod', closestPod, context);
        }
        // Late night driving (10 PM - 5 AM)
        else if (isMoving && travelDuration > 30) {
          const hour = new Date().getHours();
          if (hour >= 22 || hour < 5) {
            sendSmartNotification('rest_reminder', closestPod, context);
          }
        }
      }

      // Reset travel timer if stopped for > 15 min
      if (!isMoving) {
        travelStartTime = Date.now();
      }
    }
  );
}

// ─── Stop Tracking ───
export function stopSmartTracking() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
  useSmartAlertsStore.setState({ isTracking: false });
  speedHistory = [];
  totalDistance = 0;
}

// ─── Get Current Location Once ───
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch {
    return null;
  }
}
