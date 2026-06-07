import { create } from 'zustand';
import type { Property, Pod, Booking, City, BookingStatus } from '@/types';
import { propertiesApi, bookingsApi } from '@/services/api';

const IMAGE_BASE = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://naploo.com';

function absolutize(path?: string): string {
  if (!path) return `${IMAGE_BASE}/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png`;
  const url = path.startsWith('http') ? path : `${IMAGE_BASE}${path}`;
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
}

// ─── Hotel → Property/Pod adapters ────────────────────────────
function hotelToProperty(h: any): Property {
  return {
    id: h.id,
    name: h.name,
    type: h.type === 'homestay' ? 'homestay' : 'hotel',
    city: h.city,
    state: h.state || '',
    address: h.address,
    description: h.description || `${h.name} in ${h.city}. Premium accommodation with Naploo sleeping pods.`,
    rating: h.rating || 0,
    reviewsCount: h.reviews || 0,
    images: (h.images || []).map(absolutize),
    amenities: h.amenities || [],
    podsCount: h.podsCount || 0,
    roomsCount: h.roomsCount || 0,
    podStartPrice: h.podStartPrice || 0,
    roomStartPrice: h.roomStartPrice || 0,
    latitude: h.latitude,
    longitude: h.longitude,
    distance: h.distanceKm,
    isVerified: true,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    policies: ['No smoking in rooms', 'Government ID required'],
  } as unknown as Property;
}

function backendPodSetToPod(ps: any, hotel: any): Pod {
  return {
    id: ps.id,
    name: `Sleeping Pod ${ps.setNumber || ''}`.trim(),
    propertyId: hotel.id,
    propertyName: hotel.name || hotel.businessName,
    city: hotel.city,
    image: hotel.images?.[0] ? absolutize(hotel.images[0]) : absolutize(),
    series: ps.section || 'Naploo Smart Pod',
    type: 'single',
    position: 'upper',
    status: 'available',
    features: { ac: true, charger: true, tv: false, light: true, ventilation: true },
    hourlyRate: ps.hourlyRate || 150,
    rating: hotel.rating || 0,
    reviewsCount: hotel.reviews || 0,
    available: ps.available !== false,
    amenities: ['AC', 'Charger', 'Reading Light', 'Ventilation'],
  } as unknown as Pod;
}

// ─── Favorites Store ─────────────────────────────────────────
interface FavoritesState {
  favoriteIds: Set<string>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.favoriteIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favoriteIds: next };
    }),
  isFavorite: (id) => get().favoriteIds.has(id),
}));

// ─── Live Data Store (replaces static data/properties) ───────
interface DataState {
  properties: Property[];
  pods: Pod[];
  cities: City[];
  loadedAt: number | null;
  loading: boolean;
  error: string | null;
  loadAll: (force?: boolean) => Promise<void>;
}

const DEAL_IMG = `${IMAGE_BASE}/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png`;
const DEALS_STATIC = [
  { id: 'd1', title: 'First Pod Free!', subtitle: 'Book your first pod stay & get ₹100 off', code: 'WELCOME10', color: '#7c3aed', image: DEAL_IMG },
  { id: 'd2', title: 'Weekend Special', subtitle: 'Flat 30% off bookings', code: 'WEEKEND30', color: '#ec4899', image: DEAL_IMG },
  { id: 'd3', title: 'NAPLOO50', subtitle: 'Flat ₹50 off any booking', code: 'NAPLOO50', color: '#10b981', image: DEAL_IMG },
];

export const useDataStore = create<DataState>((set, get) => ({
  properties: [],
  pods: [],
  cities: [],
  loadedAt: null,
  loading: false,
  error: null,
  loadAll: async (force = false) => {
    const state = get();
    if (!force && state.loadedAt && Date.now() - state.loadedAt < 60 * 1000) return; // 60s cache
    set({ loading: true, error: null });
    try {
      const [searchRes, citiesRes] = await Promise.all([
        propertiesApi.search({}),
        propertiesApi.getCities(),
      ]);
      const hotelCards = searchRes.data || [];
      const properties = hotelCards.map(hotelToProperty);
      // Synthesize a Pod entry per partner so the home page Pod sections render
      const pods: Pod[] = hotelCards
        .filter((h: any) => h.podsCount > 0)
        .map((h: any) =>
          backendPodSetToPod(
            { id: `${h.id}-set`, setNumber: '01', hourlyRate: h.podStartPrice || 150, available: true },
            h
          )
        );
      const cities: City[] = (citiesRes.cities || []).map((c) => ({
        id: c.city.toLowerCase().replace(/\s+/g, '-'),
        name: c.city,
        state: c.state,
        propertyCount: c.count,
        podCount: 0,
        isPopular: true,
        image: absolutize('/Pods_Images/Home Page Images/IMG_1642.JPG'),
      })) as unknown as City[];
      set({ properties, pods, cities, loadedAt: Date.now(), loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load', loading: false });
    }
  },
}));

// ─── Live Bookings Store ─────────────────────────────────────
interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  loadedAt: number | null;
  reload: () => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<boolean>;
  getByStatus: (filter: 'upcoming' | 'past' | 'cancelled' | 'all') => Booking[];
  getById: (id: string) => Booking | undefined;
  getBooking: (id: string) => Booking | undefined;
  addBooking: (b: Partial<Booking>) => Booking;
}

function adaptBookingToLocal(b: any): Booking {
  const propName = b.propertyName || 'Naploo Stay';
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    userId: '',
    propertyId: '',
    propertyName: propName,
    propertyImage: absolutize(),
    bookingType: b.kind || b.bookingType || 'pod',
    podId: '',
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    duration: b.hours || 0,
    guestCount: b.guests || 1,
    baseRate: 0,
    subtotal: b.subtotal || 0,
    extraCharges: 0,
    discount: 0,
    gst: b.taxes || 0,
    totalAmount: b.total || 0,
    status: b.status as BookingStatus,
    paymentStatus: ['confirmed', 'checked_in', 'checked_out'].includes(b.status) ? 'paid' : 'pending',
    createdAt: b.createdAt,
    city: '',
  } as Booking;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  loading: false,
  loadedAt: null,
  reload: async () => {
    set({ loading: true });
    try {
      const res = await bookingsApi.list();
      set({
        bookings: (res.data || []).map(adaptBookingToLocal),
        loadedAt: Date.now(),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
  cancelBooking: async (id: string, reason?: string) => {
    const res = await bookingsApi.cancel(id, reason);
    if (res.success) {
      await get().reload();
      return true;
    }
    return false;
  },
  getByStatus: (filter) => {
    const all = get().bookings;
    if (filter === 'all') return all;
    if (filter === 'cancelled') return all.filter((b) => b.status === 'cancelled');
    if (filter === 'past') return all.filter((b) => b.status === 'checked_out');
    // upcoming
    return all.filter((b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'checked_in');
  },
  getById: (id) => get().bookings.find((b) => b.id === id),
  getBooking: (id) => get().bookings.find((b) => b.id === id),
  // Optimistic local add used by checkout confirm screens before the real API booking lands.
  addBooking: (b) => {
    const draft = {
      id: b.id || `local-${Date.now()}`,
      bookingNumber: b.bookingNumber || `NPL-LOCAL-${Date.now()}`,
      userId: b.userId || '',
      propertyId: b.propertyId || '',
      propertyName: b.propertyName || 'Naploo Stay',
      propertyImage: b.propertyImage || '',
      bookingType: b.bookingType || 'pod',
      podId: b.podId || '',
      checkIn: b.checkIn || new Date().toISOString(),
      checkOut: b.checkOut || new Date().toISOString(),
      duration: b.duration || 0,
      guestCount: b.guestCount || 1,
      baseRate: b.baseRate || 0,
      subtotal: b.subtotal || 0,
      extraCharges: b.extraCharges || 0,
      discount: b.discount || 0,
      gst: b.gst || 0,
      totalAmount: b.totalAmount || 0,
      status: b.status || 'pending',
      paymentStatus: b.paymentStatus || 'pending',
      createdAt: b.createdAt || new Date().toISOString(),
      city: b.city || '',
    } as Booking;
    set((s) => ({ bookings: [draft, ...s.bookings] }));
    return draft;
  },
}));

// ─── Coupons (static — same codes the web checkout accepts) ──
const COUPONS = [
  { code: 'WELCOME10', discountType: 'percent' as const, discountValue: 10, minAmount: 0, maxDiscount: 500, description: '10% off your stay' },
  { code: 'NAPLOO50', discountType: 'flat' as const, discountValue: 50, minAmount: 0, maxDiscount: 50, description: 'Flat ₹50 off' },
  { code: 'WEEKEND30', discountType: 'percent' as const, discountValue: 30, minAmount: 1000, maxDiscount: 1000, description: '30% off weekend bookings' },
];

export function validateCoupon(code: string, amount: number): { valid: boolean; discount: number; message: string } {
  const coupon = COUPONS.find((c) => c.code === code.toUpperCase().trim());
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
  if (amount < coupon.minAmount) return { valid: false, discount: 0, message: `Minimum amount ₹${coupon.minAmount} required` };
  const discount =
    coupon.discountType === 'flat'
      ? Math.min(coupon.discountValue, coupon.maxDiscount)
      : Math.min(Math.round((amount * coupon.discountValue) / 100), coupon.maxDiscount);
  return { valid: true, discount, message: coupon.description };
}

// ─── Public accessors (backwards-compatible with static API) ─
export function getProperties(): Property[] {
  return useDataStore.getState().properties;
}
export function getCities(): City[] {
  return useDataStore.getState().cities;
}
export function getDeals() {
  return DEALS_STATIC;
}
export function getPods(): Pod[] {
  return useDataStore.getState().pods;
}

export function getHeroStats() {
  const state = useDataStore.getState();
  const totalPods = state.properties.reduce((s, p) => s + (p.podsCount || 0), 0);
  const totalCities = state.cities.length || new Set(state.properties.map((p) => p.city)).size;
  const podRates = state.pods.map((p) => p.hourlyRate).filter((n) => n > 0);
  const minPrice = podRates.length ? Math.min(...podRates) : 0;
  const ratings = state.properties.map((p) => p.rating).filter((n) => n > 0);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : '0.0';
  return [
    { num: `${totalPods}+`, label: 'Pods' },
    { num: `${totalCities}+`, label: 'Cities' },
    { num: minPrice > 0 ? `₹${minPrice}` : '—', label: 'Starting' },
    { num: `${avgRating}★`, label: 'Rating' },
  ];
}

export function filterProperties(opts: {
  query?: string;
  city?: string | null;
  type?: 'all' | 'hotel' | 'homestay';
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'reviews' | 'relevance';
}): Property[] {
  let result = [...useDataStore.getState().properties];
  if (opts.query) {
    const tokens = opts.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    result = result.filter((p) => {
      const haystack = [
        p.name,
        p.type,
        p.city,
        p.state,
        p.address,
        p.description,
        ...(p.amenities || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }
  if (opts.city) result = result.filter((p) => p.city.toLowerCase() === opts.city!.toLowerCase());
  if (opts.type && opts.type !== 'all') result = result.filter((p) => p.type === opts.type);
  if (opts.minRating && opts.minRating > 0) result = result.filter((p) => p.rating >= opts.minRating!);
  if (opts.priceMin != null) result = result.filter((p) => p.podStartPrice >= opts.priceMin!);
  if (opts.priceMax != null) result = result.filter((p) => p.podStartPrice <= opts.priceMax!);

  switch (opts.sortBy) {
    case 'price_low':
      result.sort((a, b) => a.podStartPrice - b.podStartPrice);
      break;
    case 'price_high':
      result.sort((a, b) => b.podStartPrice - a.podStartPrice);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews':
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
  }
  return result;
}

export function filterPods(opts: {
  query?: string;
  city?: string | null;
  type?: 'single' | 'double' | null;
  series?: string | null;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'price_low' | 'price_high' | 'rating';
}): Pod[] {
  let result = [...useDataStore.getState().pods];
  if (opts.query) {
    const tokens = opts.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    result = result.filter((p) => {
      const haystack = [
        p.name,
        p.propertyName,
        p.city,
        p.series,
        p.type,
        p.position,
        ...(p.amenities || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }
  if (opts.city) result = result.filter((p) => p.city.toLowerCase() === opts.city!.toLowerCase());
  if (opts.minRating && opts.minRating > 0) result = result.filter((p) => p.rating >= opts.minRating!);
  if (opts.priceMin != null) result = result.filter((p) => p.hourlyRate >= opts.priceMin!);
  if (opts.priceMax != null) result = result.filter((p) => p.hourlyRate <= opts.priceMax!);

  switch (opts.sortBy) {
    case 'price_low':
      result.sort((a, b) => a.hourlyRate - b.hourlyRate);
      break;
    case 'price_high':
      result.sort((a, b) => b.hourlyRate - a.hourlyRate);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
  }
  return result;
}
