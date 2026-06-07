// LIVE properties module — reads from the data store + API.
// Backwards-compatible exports so screens that already import from
// '@/data/properties' continue to work.
import type { Property, Pod, City } from '@/types';
import { useDataStore } from '@/store/app';
import { propertiesApi } from '@/services/api';

interface Deal {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  color: string;
  image?: string;
}

const IMAGE_BASE = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://naploo.com';
function abs(p?: string): string {
  if (!p) return `${IMAGE_BASE}/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png`;
  if (p.startsWith('http')) return encodeURI(p);
  return encodeURI(`${IMAGE_BASE}${p}`);
}

// ─── Live array proxies (snapshot at import time = empty; updated after loadAll)
// We keep these as `get*()` functions so existing code calling them still works.
export function getAllProperties(): Property[] {
  return useDataStore.getState().properties;
}
export function getAllPods(): Pod[] {
  return useDataStore.getState().pods;
}
export function getAllCities(): City[] {
  return useDataStore.getState().cities;
}

// For legacy code that imports `properties`, `pods`, `cities` as array names,
// we expose getter-backed Proxy arrays.
function makeArrayProxy<T>(getter: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) {
      const arr = getter();
      const v = (arr as any)[prop];
      return typeof v === 'function' ? v.bind(arr) : v;
    },
  });
}

export const properties = makeArrayProxy(getAllProperties);
export const pods = makeArrayProxy(getAllPods);
export const cities = makeArrayProxy(getAllCities);

// Static fallback deals (UX only — no DB table for promos yet)
const FALLBACK_DEAL_IMG = `${IMAGE_BASE}/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png`;
export const deals: Deal[] = [
  { id: 'd1', title: 'First Pod Free!', subtitle: 'Book your first pod stay & get ₹100 off', code: 'WELCOME10', color: '#7c3aed', image: FALLBACK_DEAL_IMG },
  { id: 'd2', title: 'Weekend Special', subtitle: 'Flat 30% off bookings', code: 'WEEKEND30', color: '#ec4899', image: FALLBACK_DEAL_IMG },
  { id: 'd3', title: 'NAPLOO50', subtitle: 'Flat ₹50 off any booking', code: 'NAPLOO50', color: '#10b981', image: FALLBACK_DEAL_IMG },
];

// Pod layouts are still pseudo-randomized client-side based on capacity.
export const podLayouts: any = {};

export function searchProperties(q: string): Property[] {
  const term = q.toLowerCase();
  return getAllProperties().filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.address.toLowerCase().includes(term)
  );
}

export function getPropertyById(id: string): Property | undefined {
  return getAllProperties().find((p) => p.id === id);
}

export function getPodsByProperty(propertyId: string): Pod[] {
  return getAllPods().filter((p) => p.propertyId === propertyId);
}

export function getPropertiesByCity(city: string): Property[] {
  return getAllProperties().filter((p) => p.city.toLowerCase() === city.toLowerCase());
}

export function getPopularCities(): City[] {
  return getAllCities().slice(0, 8);
}

// ─── Async loader for property detail — fetches if not in store
export async function loadPropertyDetail(propertyId: string): Promise<{
  property: Property;
  rooms: any[];
  pods: Pod[];
} | null> {
  const res = await propertiesApi.getById(propertyId);
  if (!res.data) return null;
  const h: any = res.data;
  const property: Property = {
    id: h.id,
    name: h.name,
    type: h.type === 'homestay' ? 'homestay' : 'hotel',
    city: h.city,
    state: h.state || '',
    address: h.address,
    description: h.description || `${h.name} in ${h.city}.`,
    rating: h.rating || 0,
    reviewsCount: h.reviews || 0,
    images: (h.images || []).map(abs),
    amenities: h.amenities || [],
    podsCount: h.podsCount || 0,
    roomsCount: h.roomsCount || 0,
    podStartPrice: h.podStartPrice || 0,
    roomStartPrice: h.roomStartPrice || 0,
    latitude: h.latitude,
    longitude: h.longitude,
    isVerified: true,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    policies: ['No smoking in rooms', 'Government ID required'],
  } as unknown as Property;

  const podList: Pod[] = (h.pods || []).map((p: any) => ({
    id: p.id,
    name: p.name || 'Sleeping Pod',
    propertyId: h.id,
    propertyName: h.name,
    city: h.city,
    image: abs(p.image || h.images?.[0]),
    series: p.series || 'Naploo',
    type: 'single',
    position: 'upper',
    status: 'available',
    features: { ac: true, charger: true, tv: false, light: true, ventilation: true },
    hourlyRate: p.price || h.podStartPrice || 150,
    rating: h.rating || 0,
    reviewsCount: h.reviews || 0,
    available: p.available !== false,
    amenities: p.amenities || ['AC', 'Charger', 'Reading Light'],
  } as unknown as Pod));

  return { property, rooms: h.rooms || [], pods: podList };
}

// Pod layout for the visual seat-map. Synthesizes a grid from the property's pod count.
export function getPodLayout(propertyId: string): any {
  const p = getPropertyById(propertyId);
  const total = p?.podsCount || 8;
  const cols = Math.min(6, Math.ceil(Math.sqrt(total * 1.5)));
  const rows = Math.ceil(total / cols);
  const layout = Array.from({ length: rows }, (_, r) => ({
    rowNumber: r + 1,
    slots: Array.from({ length: cols }, (_, c) => {
      const idx = r * cols + c;
      const status = idx >= total ? 'maintenance' : Math.random() < 0.7 ? 'available' : 'occupied';
      const type = Math.random() < 0.5 ? 'single' : 'double';
      return {
        id: `${propertyId}-${r}-${c}`,
        row: r + 1,
        col: c + 1,
        status,
        type,
        price: 150 + (type === 'double' ? 100 : 0),
        features: { ac: true, charger: true, tv: false, light: true, ventilation: true },
      };
    }),
  }));
  const availablePods = layout.reduce(
    (s, row) => s + row.slots.filter((sl: any) => sl.status === 'available').length,
    0
  );
  return { propertyId, rows, cols, layout, totalPods: total, availablePods };
}
