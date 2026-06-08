// Naploo data layer — talks to the real API gateway and adapts backend DTOs
// to the UI interfaces (Property / Room / Pod / Booking) the components expect.
import { api } from './api';
import type { Property } from '@/components/pods/PropertyCard';
import type { Pod } from '@/components/pods/PodCard';
import type { Room } from '@/data/rooms';
import type { Booking, BookingStatus, BookingKind } from '@/store/bookings';
import type { StayMode } from '@/data/search';

const FALLBACK_IMAGE = '/Pods_Images/For Website main images/Main Pods Image.png';

// ─── Backend DTO shapes (partial) ─────────────────────────────
interface HotelCard {
  id: string;
  businessName: string;
  businessType: 'hotel' | 'homestay';
  description?: string;
  address: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  amenities?: string[];
  rating?: number;
  totalReviews?: number;
  minRoomRate?: number | null;
  minPodHourlyRate?: number | null;
  roomCount?: number;
  podSetCount?: number;
  podCount?: number;
  standalonePodCount?: number;
  distanceKm?: number;
  summary?: {
    roomCount: number;
    podSetCount: number;
    podCount?: number;
    standalonePodCount?: number;
    minRoomRate: number | null;
    minPodHourlyRate: number | null;
  };
}

interface BackendRoom {
  id: string;
  partnerId: string;
  roomNumber: string;
  name?: string;
  roomType: string;
  maxGuests: number;
  bedType: string;
  numBeds: number;
  areaSqFt?: number;
  dailyRate: number;
  weeklyRate?: number | null;
  amenities: string[];
  images: string[];
  status: string;
  isActive: boolean;
  description?: string;
}

interface BackendPodSet {
  id: string;
  setNumber: string;
  section?: string;
  hourlyRate: number;
  isActive: boolean;
  pods: BackendPod[];
}

interface BackendPod {
  id: string;
  podSetId?: string | null;
  podNumber: string;
  displayName?: string;
  position: string;
  podType?: 'single' | 'double' | 'king';
  maxOccupancy?: number;
  dimensions?: string;
  hourlyRate?: number;
  isStandalone?: boolean;
  status: string;
  features?: Record<string, boolean>;
}

// ─── Adapters ─────────────────────────────────────────────────
function cardToProperty(h: HotelCard): Property {
  const minRoom = h.minRoomRate ?? h.summary?.minRoomRate ?? 0;
  const minPod = h.minPodHourlyRate ?? h.summary?.minPodHourlyRate ?? 0;
  const images = h.images && h.images.length ? h.images : [FALLBACK_IMAGE];
  return {
    id: h.id,
    name: h.businessName,
    type: h.businessType,
    city: h.city,
    address: h.address,
    rating: h.rating ?? 0,
    reviews: h.totalReviews ?? 0,
    description: h.description ?? '',
    images,
    amenities: h.amenities ?? [],
    podsCount: h.podCount ?? h.summary?.podCount ?? ((h.podSetCount ?? h.summary?.podSetCount ?? 0) * 2 + (h.standalonePodCount ?? h.summary?.standalonePodCount ?? 0)),
    roomsCount: h.roomCount ?? h.summary?.roomCount ?? 0,
    podStartPrice: minPod ?? 0,
    roomStartPrice: minRoom ?? 0,
  };
}

const ROOM_CATEGORY: Record<string, Room['category']> = {
  standard: 'standard',
  deluxe: 'deluxe',
  suite: 'suite',
  family: 'family',
  dormitory: 'standard',
};

function backendRoomToRoom(r: BackendRoom, hotelImages: string[]): Room {
  const amenities = Array.isArray(r.amenities) ? r.amenities : [];
  return {
    id: r.id,
    propertyId: r.partnerId,
    name: r.name || `${r.roomType.charAt(0).toUpperCase() + r.roomType.slice(1)} Room`,
    category: ROOM_CATEGORY[r.roomType] ?? 'standard',
    pricePerNight: Number(r.dailyRate),
    originalPrice: Math.round(Number(r.dailyRate) * 1.15),
    capacity: { adults: r.maxGuests ?? 2, children: 0 },
    bedConfig: `${r.numBeds ?? 1} ${r.bedType ?? 'double'} bed${(r.numBeds ?? 1) > 1 ? 's' : ''}`,
    sizeSqFt: r.areaSqFt ?? 200,
    amenities,
    image: (r.images && r.images.length ? r.images[0] : hotelImages[0]) || FALLBACK_IMAGE,
    available: r.isActive && r.status === 'available' ? Math.max(1, 5) : 0,
    refundable: true,
    breakfast: amenities.some((a) => a.toLowerCase().includes('breakfast')),
  };
}

function podSetToPods(ps: BackendPodSet, hotel: HotelCard): Pod[] {
  const hotelImages = hotel.images && hotel.images.length ? hotel.images : [FALLBACK_IMAGE];
  const podList = ps.pods && ps.pods.length ? ps.pods : [];
  // One UI entry per individual pod (bunk).
  return podList.map((p) => {
    const f = p.features || {};
    const amenities: string[] = [];
    if (f.hasAC) amenities.push('AC');
    if (f.hasTV) amenities.push('TV');
    if (f.hasCharger) amenities.push('Charger');
    if (f.hasLight) amenities.push('Reading Light');
    if (f.hasVentilation) amenities.push('Ventilation');
    const positionLabel = p.position === 'upper' ? 'Upper bunk' : p.position === 'lower' ? 'Lower bunk' : (p.position || 'Bunk');
    return {
      id: p.id, // real pod id (single bunk)
      name: p.displayName || `Pod ${ps.setNumber} — ${positionLabel}`,
      series: ps.section || 'Naploo Smart Pod',
      hotelId: hotel.id,
      hotelName: hotel.businessName,
      hotelType: hotel.businessType,
      location: hotel.address,
      city: hotel.city,
      price: Number(p.hourlyRate ?? ps.hourlyRate),
      rating: hotel.rating ?? 0,
      reviews: hotel.totalReviews ?? 0,
      image: hotelImages[0],
      amenities: amenities.length ? amenities : ['AC', 'Charger', 'Reading Light'],
      available: p.status === 'available',
      podSetId: ps.id,
      position: p.position,
      podNumber: p.podNumber,
    };
  });
}

function standalonePodToPod(p: BackendPod, hotel: HotelCard): Pod {
  const hotelImages = hotel.images && hotel.images.length ? hotel.images : [FALLBACK_IMAGE];
  const f = p.features || {};
  const amenities: string[] = [];
  if (f.hasAC) amenities.push('AC');
  if (f.hasTV) amenities.push('TV');
  if (f.hasCharger) amenities.push('Charger');
  if (f.hasLight) amenities.push('Reading Light');
  if (f.hasVentilation) amenities.push('Ventilation');
  return {
    id: p.id,
    name: p.displayName || `Pod ${p.podNumber}`,
    series: `${p.podType || 'single'} standalone`,
    hotelId: hotel.id,
    hotelName: hotel.businessName,
    hotelType: hotel.businessType,
    location: hotel.address,
    city: hotel.city,
    price: Number(p.hourlyRate ?? 0),
    rating: hotel.rating ?? 0,
    reviews: hotel.totalReviews ?? 0,
    image: hotelImages[0],
    amenities: amenities.length ? amenities : ['AC', 'Charger', 'Reading Light'],
    available: p.status === 'available',
    podSetId: p.podSetId || undefined,
    position: p.position,
    podNumber: p.podNumber,
  };
}

const STATUS_MAP: Record<string, BookingStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  checked_in: 'confirmed',
  checked_out: 'completed',
  cancelled: 'cancelled',
  no_show: 'cancelled',
};

function backendBookingToUi(b: any): Booking {
  const kind: BookingKind = b.bookingType === 'room' ? 'room' : 'pod';
  const unitName = b.unit
    ? b.unit.type === 'room'
      ? `Room ${b.unit.roomNumber}${b.unit.name ? ` — ${b.unit.name}` : ''}`
      : `Sleeping Pod ${b.unit.podNumber}`
    : kind === 'room'
      ? 'Hotel Room'
      : 'Sleeping Pod';
  return {
    id: b.id,
    kind,
    propertyId: b.hotel?.id || '',
    propertyName: b.hotel?.name || 'Naploo Stay',
    propertyAddress: b.hotel?.address || b.hotel?.city || '',
    itemId: b.roomId || b.podId || '',
    itemName: unitName,
    itemImage: FALLBACK_IMAGE,
    startTime: kind === 'pod' ? b.checkIn : undefined,
    durationHours: b.hours ?? undefined,
    checkIn: kind === 'room' ? String(b.checkIn).slice(0, 10) : undefined,
    checkOut: kind === 'room' ? String(b.checkOut).slice(0, 10) : undefined,
    nights: b.nights ?? undefined,
    guests: b.guestCount ?? 1,
    rooms: kind === 'room' ? 1 : undefined,
    pricePerUnit: Number(b.baseRate ?? 0),
    subtotal: Number(b.subtotal ?? 0),
    taxes: Number(b.gst ?? 0),
    total: Number(b.total ?? 0),
    guestName: '',
    guestPhone: '',
    status: STATUS_MAP[b.status] ?? 'pending',
    bookingCode: b.bookingNumber,
    createdAt: b.createdAt,
  };
}

// ─── Public functions ─────────────────────────────────────────
export interface HotelSearchInput {
  location?: string;
  mode?: StayMode;
  type?: 'hotel' | 'homestay' | '';
  sortBy?: 'recommended' | 'price-asc' | 'price-desc' | 'rating';
}

export async function searchHotels(input: HotelSearchInput): Promise<Property[]> {
  const q = new URLSearchParams();
  if (input.location) q.set('q', input.location);
  if (input.type) q.set('type', input.type);
  if (input.mode === 'pods') q.set('hasPods', 'true');
  if (input.mode === 'rooms') q.set('hasRooms', 'true');
  if (input.sortBy === 'price-asc') q.set('sort', 'price_asc');
  else if (input.sortBy === 'price-desc') q.set('sort', 'price_desc');
  const res = await api.get<{ success: boolean; results: HotelCard[] }>(`/api/v1/search?${q.toString()}`);
  if (res.error || !res.data?.results) return [];
  return res.data.results.map(cardToProperty);
}

export async function nearbyHotels(lat: number, lng: number, radiusKm = 25, mode?: StayMode): Promise<Property[]> {
  const q = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusKm) });
  if (mode === 'pods') q.set('hasPods', 'true');
  if (mode === 'rooms') q.set('hasRooms', 'true');
  const res = await api.get<{ success: boolean; results: HotelCard[] }>(`/api/v1/nearby?${q.toString()}`);
  if (res.error || !res.data?.results) return [];
  return res.data.results.map(cardToProperty);
}

export async function getHotel(id: string): Promise<{ property: Property; rooms: Room[]; pods: Pod[] } | null> {
  const res = await api.get<{ success: boolean; hotel: any }>(`/api/v1/hotels/${id}`);
  if (res.error || !res.data?.hotel) return null;
  const h = res.data.hotel as HotelCard & { rooms: BackendRoom[]; podSets: BackendPodSet[]; standalonePods?: BackendPod[] };
  const hotelImages = h.images && h.images.length ? h.images : [FALLBACK_IMAGE];
  const roomRates = (h.rooms || []).map((r) => Number(r.dailyRate)).filter((n) => !isNaN(n));
  const standalonePods = h.standalonePods || [];
  const podRates = [
    ...(h.podSets || []).map((p) => Number(p.hourlyRate)),
    ...standalonePods.map((p) => Number(p.hourlyRate)),
  ].filter((n) => !isNaN(n));
  const property: Property = {
    ...cardToProperty(h),
    roomsCount: (h.rooms || []).filter((r) => r.isActive).length,
    podsCount: (h.podSets || []).filter((p) => p.isActive).reduce((sum, p) => sum + (p.pods?.length || 0), 0) + standalonePods.length,
    roomStartPrice: roomRates.length ? Math.min(...roomRates) : 0,
    podStartPrice: podRates.length ? Math.min(...podRates) : 0,
  };
  const rooms = (h.rooms || []).filter((r) => r.isActive).map((r) => backendRoomToRoom(r, hotelImages));
  const pods = [
    ...(h.podSets || []).filter((p) => p.isActive).flatMap((p) => podSetToPods(p, h)),
    ...standalonePods.map((p) => standalonePodToPod(p, h)),
  ];
  return { property, rooms, pods };
}

export interface QuoteInput {
  kind: BookingKind;
  itemId: string; // roomId or podId (single bunk)
  checkInISO: string;
  hours?: number;
  nights?: number;
  guestCount?: number;
  couponDiscount?: number;
}

export interface Quote {
  baseRate: number;
  units: number;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
}

export async function getQuote(input: QuoteInput): Promise<Quote | null> {
  const body =
    input.kind === 'pod'
      ? { bookingType: 'pod', podId: input.itemId, checkIn: input.checkInISO, hours: input.hours, guestCount: input.guestCount, couponDiscount: input.couponDiscount ?? 0 }
      : { bookingType: 'room', roomId: input.itemId, checkIn: input.checkInISO, nights: input.nights, guestCount: input.guestCount, couponDiscount: input.couponDiscount ?? 0 };
  const res = await api.post<any>('/api/v1/quote', body);
  if (res.error || !res.data?.success) return null;
  const d = res.data;
  return {
    baseRate: Number(d.baseRate),
    units: Number(d.units),
    subtotal: Number(d.subtotal),
    discount: Number(d.discount),
    gst: Number(d.gst),
    total: Number(d.total),
  };
}

export interface CreateBookingInput {
  userId: string;
  kind: BookingKind;
  itemId: string; // roomId or podId (single bunk)
  checkInISO: string;
  hours?: number; // pods
  nights?: number; // rooms
  guestCount: number;
  couponDiscount?: number;
}

export async function createBooking(input: CreateBookingInput): Promise<{ id: string; total: number } | { error: string }> {
  const body =
    input.kind === 'pod'
      ? {
          userId: input.userId,
          bookingType: 'pod',
          podId: input.itemId,
          checkIn: input.checkInISO,
          hours: input.hours,
          guestCount: input.guestCount,
          couponDiscount: input.couponDiscount ?? 0,
        }
      : {
          userId: input.userId,
          bookingType: 'room',
          roomId: input.itemId,
          checkIn: input.checkInISO,
          nights: input.nights,
          guestCount: input.guestCount,
          couponDiscount: input.couponDiscount ?? 0,
        };
  const res = await api.post<{ success: boolean; message?: string; booking: any }>('/api/v1/bookings', body);
  if (res.error || !res.data?.booking) return { error: res.error || res.data?.message || 'Booking failed' };
  return { id: res.data.booking.id, total: Number(res.data.booking.total) };
}

interface OrderInfo {
  success: boolean;
  provider?: 'razorpay' | 'cashfree';
  mock: boolean;
  order: { id: string; amount: number; currency: string };
  keyId?: string;
  cashfree?: {
    mode: 'production' | 'sandbox' | string;
    paymentSessionId: string;
    cfOrderId?: string;
    orderStatus?: string;
  };
  paymentId: string;
}

export async function createOrder(bookingId: string): Promise<OrderInfo | { error: string }> {
  const res = await api.post<OrderInfo>('/api/v1/payments/create-order', { bookingId });
  if (res.error || !res.data?.order) return { error: res.error || 'Could not start payment' };
  return res.data;
}

export async function verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const res = await api.post<{ success: boolean }>('/api/v1/payments/verify', {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  });
  return !!res.data?.success;
}

export async function verifyCashfreePayment(orderId: string): Promise<boolean> {
  const res = await api.post<{ success: boolean; paid?: boolean; orderStatus?: string }>('/api/v1/payments/cashfree/verify', {
    order_id: orderId,
  });
  return !!res.data?.success || !!res.data?.paid;
}

// Load Razorpay checkout script once
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function loadCashfree(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Cashfree) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// High-level: pay for a booking. In mock mode (no live keys) we confirm directly.
export async function payForBooking(
  bookingId: string,
  prefill: { name?: string; email?: string; contact?: string }
): Promise<{ paid: boolean; error?: string }> {
  const order = await createOrder(bookingId);
  if ('error' in order) return { paid: false, error: order.error };

  // Mock mode → no real gateway; confirm immediately.
  if (order.mock || order.keyId?.includes('MOCK')) {
    const ok = await verifyPayment(order.order.id, `pay_mock_${Date.now()}`, 'mock_signature');
    return { paid: ok, error: ok ? undefined : 'Payment verification failed' };
  }

  if (order.provider === 'cashfree') {
    if (!order.cashfree?.paymentSessionId) return { paid: false, error: 'Cashfree payment session missing' };
    const loaded = await loadCashfree();
    if (!loaded) return { paid: false, error: 'Could not load Cashfree checkout' };

    try {
      const cashfree = (window as any).Cashfree({ mode: order.cashfree.mode === 'production' ? 'production' : 'sandbox' });
      const result = await cashfree.checkout({
        paymentSessionId: order.cashfree.paymentSessionId,
        redirectTarget: '_modal',
      });
      if (result?.error) return { paid: false, error: result.error.message || 'Cashfree payment failed' };
      const ok = await verifyCashfreePayment(order.order.id);
      return { paid: ok, error: ok ? undefined : 'Cashfree payment verification failed' };
    } catch (e: any) {
      return { paid: false, error: e?.message || 'Cashfree checkout failed' };
    }
  }

  const loaded = await loadRazorpay();
  if (!loaded) return { paid: false, error: 'Could not load payment gateway' };

  return new Promise((resolve) => {
    const rzp = new (window as any).Razorpay({
      key: order.keyId,
      amount: order.order.amount,
      currency: order.order.currency,
      name: 'Naploo',
      description: 'Stay booking',
      order_id: order.order.id,
      prefill,
      theme: { color: '#7c3aed' },
      handler: async (resp: any) => {
        const ok = await verifyPayment(resp.razorpay_order_id, resp.razorpay_payment_id, resp.razorpay_signature);
        resolve({ paid: ok, error: ok ? undefined : 'Payment verification failed' });
      },
      modal: { ondismiss: () => resolve({ paid: false, error: 'Payment cancelled' }) },
    });
    rzp.open();
  });
}

export async function getBooking(id: string): Promise<Booking | null> {
  const res = await api.get<{ success: boolean; booking: any }>(`/api/v1/bookings/${id}`);
  if (res.error || !res.data?.booking) return null;
  return backendBookingToUi(res.data.booking);
}

export async function listMyBookings(userId: string): Promise<Booking[]> {
  const res = await api.get<{ success: boolean; bookings: any[] }>(`/api/v1/bookings?userId=${userId}`);
  if (res.error || !res.data?.bookings) return [];
  return res.data.bookings.map(backendBookingToUi);
}

export async function cancelBooking(id: string, reason?: string): Promise<boolean> {
  const res = await api.post<{ success: boolean }>(`/api/v1/bookings/${id}/cancel`, { reason });
  return !!res.data?.success;
}
