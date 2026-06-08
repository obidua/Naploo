import * as SecureStore from 'expo-secure-store';
import type { ApiResponse, AuthTokens } from '@/types';

// Gateway base URL. Override via EXPO_PUBLIC_API_URL at build time.
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.naploo.com';

// ─── Token storage ────────────────────────────────────────────
async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('accessToken');
}
async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync('refreshToken');
}
export async function setTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync('accessToken', tokens.accessToken);
  await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
}
async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      if (data.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = await getToken();
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  }
  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && auth) {
    if (await tryRefresh()) {
      const newToken = await getToken();
      reqHeaders['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Adapters: backend → app's Property/Room/Pod shape ────────
const FALLBACK_IMAGE = 'https://naploo.com/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png';

function parseJsonArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') {
    try {
      let p = JSON.parse(v);
      if (typeof p === 'string') p = JSON.parse(p);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function adaptHotelCard(h: any) {
  const images = parseJsonArr(h.images);
  return {
    id: h.id,
    name: h.businessName,
    type: h.businessType,
    city: h.city,
    state: h.state,
    address: h.address,
    description: h.description ?? '',
    rating: Number(h.rating) || 0,
    reviews: Number(h.totalReviews) || 0,
    images: images.length ? images : [FALLBACK_IMAGE],
    amenities: parseJsonArr(h.amenities),
    podsCount: (h.podSetCount ?? h.summary?.podSetCount ?? 0) * 2,
    roomsCount: h.roomCount ?? h.summary?.roomCount ?? 0,
    podStartPrice: Number(h.minPodHourlyRate ?? h.summary?.minPodHourlyRate ?? 0),
    roomStartPrice: Number(h.minRoomRate ?? h.summary?.minRoomRate ?? 0),
    distanceKm: h.distanceKm,
    latitude: Number(h.latitude) || undefined,
    longitude: Number(h.longitude) || undefined,
  };
}

function adaptRoom(r: any) {
  return {
    id: r.id,
    propertyId: r.partnerId,
    name: r.name || `${r.roomType} room`,
    roomType: r.roomType,
    maxGuests: r.maxGuests,
    bedConfig: `${r.numBeds || 1} ${r.bedType || 'double'}`,
    pricePerNight: Number(r.dailyRate),
    amenities: Array.isArray(r.amenities) ? r.amenities : parseJsonArr(r.amenities),
    image: (Array.isArray(r.images) && r.images.length ? r.images[0] : FALLBACK_IMAGE),
    available: r.isActive && r.status === 'available',
  };
}

function adaptPodSet(ps: any, hotel: any) {
  return {
    id: ps.id,
    setNumber: ps.setNumber,
    name: `Pod set ${ps.setNumber}`,
    series: ps.section || 'Naploo Smart Pod',
    hotelId: hotel.id,
    hotelName: hotel.businessName,
    price: Number(ps.hourlyRate),
    image: parseJsonArr(hotel.images)[0] || FALLBACK_IMAGE,
    amenities: ['AC', 'Charger', 'Reading Light'],
    available: (ps.pods || []).some((p: any) => p.status === 'available'),
    // Inner pods carry the real position (upper/lower), type (single/double)
    // and status so the seat-map can drive its grid + pricing from real
    // partner data instead of synthesizing a fake +50 markup.
    pods: (ps.pods || []).map((p: any) => ({
      id: p.id,
      podNumber: p.podNumber,
      displayName: p.displayName,
      position: p.position,
      podType: p.podType,
      maxOccupancy: p.maxOccupancy,
      dimensions: p.dimensions,
      hourlyRate: Number(p.hourlyRate ?? ps.hourlyRate),
      status: p.status,
      features: p.features,
    })),
  };
}

function adaptStandalonePod(p: any, hotel: any) {
  return {
    id: `single-${p.id}`,
    setNumber: p.podNumber,
    name: p.displayName || `Single pod ${p.podNumber}`,
    series: `${p.podType || 'single'} standalone`,
    hotelId: hotel.id,
    hotelName: hotel.businessName,
    price: Number(p.hourlyRate),
    image: parseJsonArr(hotel.images)[0] || FALLBACK_IMAGE,
    amenities: ['AC', 'Charger', 'Reading Light'],
    available: p.status === 'available',
    isStandalone: true,
    pods: [{
      id: p.id,
      podNumber: p.podNumber,
      displayName: p.displayName,
      position: 'single',
      podType: p.podType,
      maxOccupancy: p.maxOccupancy,
      dimensions: p.dimensions,
      hourlyRate: Number(p.hourlyRate),
      status: p.status,
      features: p.features,
    }],
  };
}

function adaptBooking(b: any) {
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    kind: b.bookingType,
    propertyName: b.hotel?.name || 'Naploo Stay',
    propertyAddress: b.hotel?.address || b.hotel?.city || '',
    itemName: b.unit?.type === 'room' ? `Room ${b.unit.roomNumber}` : `Pod ${b.unit?.podNumber || ''}`,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    hours: b.hours,
    guests: b.guestCount || 1,
    subtotal: Number(b.subtotal),
    taxes: Number(b.gst),
    total: Number(b.total),
    status: b.status,
    createdAt: b.createdAt,
  };
}

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) =>
    request<{ success: boolean; message: string; otp?: string }>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: { phone },
      auth: false,
    }),
  verifyOtp: (phone: string, otp: string, name?: string, email?: string) =>
    request<{ success: boolean; isNewUser: boolean; user: any; accessToken: string; refreshToken: string }>(
      '/api/v1/auth/verify-otp',
      { method: 'POST', body: { phone, otp, name, email }, auth: false }
    ),
  login: (email: string, password: string) =>
    request<{ success: boolean; user: any; accessToken: string; refreshToken: string }>(
      '/api/v1/auth/login',
      { method: 'POST', body: { email, password }, auth: false }
    ),
  getMe: () => request<{ success: boolean; user: any }>('/api/v1/auth/me'),
  updateProfile: (data: Record<string, unknown>) =>
    request<{ success: boolean; user: any }>('/api/v1/auth/profile', { method: 'PATCH', body: data }),
  logout: () => clearTokens(),
};

// ─── Hotels / search / nearby ─────────────────────────────────
export const propertiesApi = {
  search: async (params: { location?: string; type?: string; mode?: 'pods' | 'rooms' } = {}) => {
    const q = new URLSearchParams();
    if (params.location) q.set('q', params.location);
    if (params.type) q.set('type', params.type);
    if (params.mode === 'pods') q.set('hasPods', 'true');
    if (params.mode === 'rooms') q.set('hasRooms', 'true');
    const data = await request<{ success: boolean; results: any[] }>(`/api/v1/search?${q.toString()}`, { auth: false });
    return { success: true, data: data.results.map(adaptHotelCard) };
  },
  nearby: async (lat: number, lng: number, radiusKm = 25) => {
    const q = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusKm) });
    const data = await request<{ success: boolean; results: any[] }>(`/api/v1/nearby?${q.toString()}`, { auth: false });
    return { success: true, data: data.results.map(adaptHotelCard) };
  },
  getById: async (id: string) => {
    const data = await request<{ success: boolean; hotel: any }>(`/api/v1/hotels/${encodeURIComponent(id)}`, { auth: false });
    const h = data.hotel;
    const rooms = (h.rooms || []).map(adaptRoom);
    const podSets = [
      ...(h.podSets || []).map((s: any) => adaptPodSet(s, h)),
      ...(h.standalonePods || []).map((p: any) => adaptStandalonePod(p, h)),
    ];
    const pods = podSets;
    // The /hotels/:id detail endpoint does NOT include a `summary` block,
    // so derive Pods/Rooms counts and start prices from the actual arrays
    // (each pod set holds 2 sleeping pods — upper + lower).
    const podCount = podSets.reduce((acc: number, s: any) => acc + (s.pods?.length || 2), 0);
    const minRoomRate = rooms.length
      ? Math.min(...rooms.map((r: any) => Number(r.pricePerNight) || Infinity).filter((n: number) => Number.isFinite(n)))
      : 0;
    const minPodRate = podSets.length
      ? Math.min(...podSets.map((s: any) => Number(s.price ?? s.hourlyRate) || Infinity).filter((n: number) => Number.isFinite(n)))
      : 0;
    const card = adaptHotelCard(h);
    return {
      success: true,
      data: {
        ...card,
        podsCount: podCount || card.podsCount,
        roomsCount: rooms.length || card.roomsCount,
        podStartPrice: Number.isFinite(minPodRate) && minPodRate > 0 ? minPodRate : card.podStartPrice,
        roomStartPrice: Number.isFinite(minRoomRate) && minRoomRate > 0 ? minRoomRate : card.roomStartPrice,
        rooms,
        pods,
        // Raw podSets (with per-set hourlyRate + inner pods) so the seat
        // map can render the real grid + the real partner-set pricing
        // for each pod (no more synthetic +50 markup).
        podSets,
      },
    };
  },
  getRooms: async (propertyId: string) => {
    const data = await request<{ success: boolean; rooms: any[] }>(`/api/v1/hotels/${encodeURIComponent(propertyId)}/rooms`, { auth: false });
    return { success: true, data: data.rooms.map(adaptRoom) };
  },
  getPods: async (propertyId: string) => {
    const data = await request<{ success: boolean; podSets: any[]; standalonePods?: any[] }>(`/api/v1/hotels/${encodeURIComponent(propertyId)}/pods`, { auth: false });
    return { success: true, data: [...(data.podSets || []), ...(data.standalonePods || []).map((p: any) => ({ ...adaptStandalonePod(p, { id: propertyId, businessName: '', images: [] }), hourlyRate: p.hourlyRate }))] };
  },
  getCities: () => request<{ cities: { city: string; state: string; count: number }[] }>(`/api/v1/cities`, { auth: false }),
};

// ─── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  quote: (input: { kind: 'pod' | 'room'; itemId: string; checkInISO: string; hours?: number; nights?: number; guests?: number; couponDiscount?: number }) =>
    request<any>('/api/v1/quote', {
      method: 'POST',
      body: input.kind === 'pod'
        ? { bookingType: 'pod', podId: input.itemId, checkIn: input.checkInISO, hours: input.hours, guestCount: input.guests, couponDiscount: input.couponDiscount ?? 0 }
        : { bookingType: 'room', roomId: input.itemId, checkIn: input.checkInISO, nights: input.nights, guestCount: input.guests, couponDiscount: input.couponDiscount ?? 0 },
    }),
  create: (input: { kind: 'pod' | 'room'; itemId: string; checkInISO: string; hours?: number; nights?: number; guests?: number; couponDiscount?: number }) =>
    request<{ success: boolean; booking: any }>('/api/v1/bookings', {
      method: 'POST',
      body: input.kind === 'pod'
        ? { bookingType: 'pod', podId: input.itemId, checkIn: input.checkInISO, hours: input.hours, guestCount: input.guests, couponDiscount: input.couponDiscount ?? 0 }
        : { bookingType: 'room', roomId: input.itemId, checkIn: input.checkInISO, nights: input.nights, guestCount: input.guests, couponDiscount: input.couponDiscount ?? 0 },
    }),
  list: async () => {
    const data = await request<{ success: boolean; bookings: any[] }>(`/api/v1/bookings`);
    return { success: true, data: (data.bookings || []).map(adaptBooking) };
  },
  getById: async (id: string) => {
    const data = await request<{ success: boolean; booking: any }>(`/api/v1/bookings/${encodeURIComponent(id)}`);
    return { success: true, data: adaptBooking(data.booking) };
  },
  cancel: (id: string, reason?: string) =>
    request<{ success: boolean }>(`/api/v1/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: { reason } }),
};

// ─── Payments ─────────────────────────────────────────────────
export const paymentsApi = {
  createOrder: (bookingId: string) =>
    request<{ success: boolean; mock: boolean; order: { id: string; amount: number; currency: string }; keyId: string }>(
      '/api/v1/payments/create-order',
      { method: 'POST', body: { bookingId } }
    ),
  verify: (orderId: string, paymentId: string, signature: string) =>
    request<{ success: boolean; bookingConfirmed: boolean }>(
      '/api/v1/payments/verify',
      { method: 'POST', body: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } }
    ),
  // Hosted-checkout URL — open this in a WebView. The page auto-launches
  // Razorpay checkout, verifies the signature server-side, and redirects to
  // `naploo://payment-success?bookingId=...` (or payment-cancelled) on completion.
  getCheckoutUrl: (bookingId: string) => `${API_BASE}/api/v1/payments/checkout/${encodeURIComponent(bookingId)}`,
};

export { clearTokens, getToken };
