import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '@/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.naploo.com';

// ─── Token storage + refresh ─────────────────────────────────
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

const FALLBACK_IMAGE = 'https://naploo.com/Pods_Images/For%20Website%20main%20images/Main%20Pods%20Image.png';

function imageUrl(value?: string): string {
  if (!value) return FALLBACK_IMAGE;
  const url = value.startsWith('http') ? value : `https://naploo.com${value}`;
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
}

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

// ─── Auth (email/password partner login) ─────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; user: any; accessToken: string; refreshToken: string }>(
      '/api/v1/auth/login',
      { method: 'POST', body: { email, password }, auth: false }
    ),
  sendOtp: (phone: string) =>
    request<{ success: boolean; otp?: string }>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: { phone },
      auth: false,
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ success: boolean; user: any; accessToken: string; refreshToken: string }>(
      '/api/v1/auth/verify-otp',
      { method: 'POST', body: { phone, otp }, auth: false }
    ),
  getMe: () => request<{ success: boolean; user: any }>('/api/v1/auth/me'),
  logout: () => clearTokens(),
};

// ─── Partner hotel + inventory ───────────────────────────────
export const partnerApi = {
  getMyHotel: async () => {
    const res = await request<{ success: boolean; hotel: any }>('/api/v1/hotels/me');
    const h = res.hotel;
    return {
      id: h.id,
      businessName: h.businessName,
      businessType: h.businessType,
      description: h.description ?? '',
      address: h.address,
      city: h.city,
      state: h.state,
      pincode: h.pincode,
      rating: Number(h.rating) || 0,
      totalReviews: h.totalReviews || 0,
      status: h.status,
      images: parseJsonArr(h.images).length ? parseJsonArr(h.images).map(imageUrl) : [FALLBACK_IMAGE],
      amenities: parseJsonArr(h.amenities),
      rooms: (h.rooms || []).map((r: any) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        name: r.name,
        roomType: r.roomType,
        maxGuests: r.maxGuests,
        bedType: r.bedType,
        numBeds: r.numBeds,
        dailyRate: Number(r.dailyRate),
        extraGuestCharge: Number(r.extraGuestCharge) || 0,
        amenities: Array.isArray(r.amenities) ? r.amenities : parseJsonArr(r.amenities),
        status: r.status,
        isActive: r.isActive,
      })),
      podSets: (h.podSets || []).map((s: any) => ({
        id: s.id,
        setNumber: s.setNumber,
        section: s.section,
        floor: s.floor,
        hourlyRate: Number(s.hourlyRate),
        isActive: s.isActive,
        pods: s.pods || [],
      })),
    };
  },
  createRoom: (hotelId: string, input: any) =>
    request<{ success: boolean; room: any }>(`/api/v1/hotels/${hotelId}/rooms`, { method: 'POST', body: input }),
  updateRoom: (roomId: string, patch: any) =>
    request<{ success: boolean; room: any }>(`/api/v1/rooms/${roomId}`, { method: 'PATCH', body: patch }),
  createPodSet: (hotelId: string, input: any) =>
    request<{ success: boolean; podSet: any }>(`/api/v1/hotels/${hotelId}/pod-sets`, { method: 'POST', body: input }),
  updatePodSet: (podSetId: string, patch: any) =>
    request<{ success: boolean; podSet: any }>(`/api/v1/pod-sets/${podSetId}`, { method: 'PATCH', body: patch }),
  getBookings: async (partnerId: string) => {
    const res = await request<{ success: boolean; bookings: any[] }>(`/api/v1/partner/${partnerId}/bookings`);
    return (res.bookings || []).map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      kind: b.bookingType,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      hours: b.hours,
      nights: b.nights,
      guests: b.guestCount,
      total: Number(b.total),
      ownerShare: Number(b.ownerShare),
      status: b.status,
      createdAt: b.createdAt,
      unit: b.unit,
    }));
  },
};

export { clearTokens, getToken };
