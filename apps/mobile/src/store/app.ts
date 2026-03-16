import { create } from 'zustand';
import type { Property, Pod, Booking, City, BookingStatus } from '@/types';
import { properties, pods, cities, deals, podLayouts, searchProperties } from '@/data/properties';

// ─── Favorites Store ───
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

// ─── Bookings Store ───
let bookingCounter = 3;

const initialBookings: Booking[] = [
  {
    id: '1',
    bookingNumber: 'NAP-260315-001',
    userId: '1',
    propertyId: 'hotel-sapphire',
    propertyName: 'Hotel Sapphire',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    bookingType: 'pod',
    podId: 'pod-1',
    checkIn: '2026-03-20T14:00:00Z',
    checkOut: '2026-03-20T18:00:00Z',
    duration: 4,
    guestCount: 1,
    baseRate: 199,
    subtotal: 796,
    extraCharges: 0,
    discount: 0,
    gst: 96,
    totalAmount: 892,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-03-15T10:00:00Z',
    city: 'Jaipur',
  },
  {
    id: '2',
    bookingNumber: 'NAP-260310-002',
    userId: '1',
    propertyId: 'beach-bliss',
    propertyName: 'Beach Bliss Resort',
    propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    bookingType: 'room',
    roomId: 'room-1',
    checkIn: '2026-03-25T14:00:00Z',
    checkOut: '2026-03-27T11:00:00Z',
    guestCount: 2,
    baseRate: 2199,
    subtotal: 4398,
    extraCharges: 0,
    discount: 500,
    gst: 468,
    totalAmount: 4366,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-03-10T10:00:00Z',
    city: 'Goa',
  },
  {
    id: '3',
    bookingNumber: 'NAP-260301-003',
    userId: '1',
    propertyId: 'city-star',
    propertyName: 'City Star Hotel',
    propertyImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    bookingType: 'pod',
    podId: 'pod-5',
    checkIn: '2026-03-05T08:00:00Z',
    checkOut: '2026-03-05T11:00:00Z',
    duration: 3,
    guestCount: 1,
    baseRate: 179,
    subtotal: 537,
    extraCharges: 0,
    discount: 0,
    gst: 65,
    totalAmount: 602,
    status: 'checked_out',
    paymentStatus: 'paid',
    createdAt: '2026-03-01T10:00:00Z',
    city: 'Delhi',
  },
];

interface BookingsState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt'>) => Booking;
  cancelBooking: (id: string) => void;
  getBooking: (id: string) => Booking | undefined;
  getByStatus: (tab: 'upcoming' | 'past' | 'cancelled') => Booking[];
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: initialBookings,

  addBooking: (data) => {
    bookingCounter++;
    const now = new Date().toISOString();
    const num = `NAP-${now.slice(2, 10).replace(/-/g, '')}-${String(bookingCounter).padStart(3, '0')}`;
    const booking: Booking = {
      ...data,
      id: String(bookingCounter),
      bookingNumber: num,
      createdAt: now,
    };
    set((state) => ({ bookings: [booking, ...state.bookings] }));
    return booking;
  },

  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: 'refunded' as const } : b
      ),
    })),

  getBooking: (id) => get().bookings.find((b) => b.id === id || b.bookingNumber === id),

  getByStatus: (tab) => {
    const all = get().bookings;
    if (tab === 'upcoming') return all.filter((b) => ['pending', 'confirmed', 'checked_in'].includes(b.status));
    if (tab === 'past') return all.filter((b) => ['checked_out'].includes(b.status));
    return all.filter((b) => ['cancelled', 'no_show'].includes(b.status));
  },
}));

// ─── Coupons ───
interface CouponDef {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minAmount: number;
  description: string;
}

const COUPONS: CouponDef[] = [
  { code: 'FIRSTPOD', discountType: 'flat', discountValue: 199, maxDiscount: 199, minAmount: 0, description: '₹199 off on your first pod booking' },
  { code: 'WEEKEND30', discountType: 'percentage', discountValue: 30, maxDiscount: 1000, minAmount: 500, description: '30% off weekend bookings (max ₹1000)' },
  { code: 'GOAVIBES', discountType: 'flat', discountValue: 50, maxDiscount: 50, minAmount: 0, description: '₹50 off on Goa bookings' },
  { code: 'COUPLE499', discountType: 'flat', discountValue: 100, maxDiscount: 100, minAmount: 400, description: '₹100 off couple pod pack' },
  { code: 'NAPLOO10', discountType: 'percentage', discountValue: 10, maxDiscount: 500, minAmount: 200, description: '10% off any booking (max ₹500)' },
];

export function validateCoupon(code: string, amount: number): { valid: boolean; discount: number; message: string } {
  const coupon = COUPONS.find((c) => c.code === code.toUpperCase().trim());
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
  if (amount < coupon.minAmount) return { valid: false, discount: 0, message: `Minimum booking amount ₹${coupon.minAmount} required` };
  const discount = coupon.discountType === 'flat'
    ? Math.min(coupon.discountValue, coupon.maxDiscount)
    : Math.min(Math.round(amount * coupon.discountValue / 100), coupon.maxDiscount);
  return { valid: true, discount, message: coupon.description };
}

// ─── App Data Helpers (centralized data access) ───
export function getProperties(): Property[] { return properties; }
export function getCities(): City[] { return cities; }
export function getDeals() { return deals; }
export function getPods(): Pod[] { return pods; }

export function getHeroStats() {
  const totalPods = properties.reduce((s, p) => s + p.podsCount, 0);
  const totalCities = new Set(properties.map((p) => p.city)).size;
  const minPrice = Math.min(...pods.map((p) => p.hourlyRate));
  const avgRating = (properties.reduce((s, p) => s + p.rating, 0) / properties.length).toFixed(1);
  return [
    { num: `${totalPods}+`, label: 'Pods' },
    { num: `${totalCities}+`, label: 'Cities' },
    { num: `₹${minPrice}`, label: 'Starting' },
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
  let result = opts.query ? searchProperties(opts.query) : [...properties];
  if (opts.city) result = result.filter((p) => p.city.toLowerCase() === opts.city!.toLowerCase());
  if (opts.type && opts.type !== 'all') result = result.filter((p) => p.type === opts.type);
  if (opts.minRating && opts.minRating > 0) result = result.filter((p) => p.rating >= opts.minRating!);
  if (opts.priceMin != null) result = result.filter((p) => p.podStartPrice >= opts.priceMin!);
  if (opts.priceMax != null) result = result.filter((p) => p.podStartPrice <= opts.priceMax!);

  switch (opts.sortBy) {
    case 'price_low': result.sort((a, b) => a.podStartPrice - b.podStartPrice); break;
    case 'price_high': result.sort((a, b) => b.podStartPrice - a.podStartPrice); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    case 'reviews': result.sort((a, b) => b.reviewsCount - a.reviewsCount); break;
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
  let result = [...pods];
  if (opts.query) {
    const q = opts.query.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.propertyName.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.series.toLowerCase().includes(q));
  }
  if (opts.city) result = result.filter((p) => p.city.toLowerCase() === opts.city!.toLowerCase());
  if (opts.type) result = result.filter((p) => p.type === opts.type);
  if (opts.series) result = result.filter((p) => p.series === opts.series);
  if (opts.minRating && opts.minRating > 0) result = result.filter((p) => p.rating >= opts.minRating!);
  if (opts.priceMin != null) result = result.filter((p) => p.hourlyRate >= opts.priceMin!);
  if (opts.priceMax != null) result = result.filter((p) => p.hourlyRate <= opts.priceMax!);

  switch (opts.sortBy) {
    case 'price_low': result.sort((a, b) => a.hourlyRate - b.hourlyRate); break;
    case 'price_high': result.sort((a, b) => b.hourlyRate - a.hourlyRate); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
  }
  return result;
}
