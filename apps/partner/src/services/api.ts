import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '@/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.naploo.com';

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
    if (data.accessToken && data.refreshToken) {
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
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
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await getToken();
    if (token) requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = await getToken();
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth API ───
export const authApi = {
  sendOtp: (phone: string) =>
    request<{ success: boolean; message: string; otp?: string }>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: { phone },
      auth: false,
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<{
      success: boolean;
      message: string;
      isNewUser: boolean;
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp },
      auth: false,
    }),

  getMe: () => request<{ success: boolean; user: any }>('/api/v1/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    request<{ success: boolean; user: any }>('/api/v1/auth/profile', {
      method: 'PUT',
      body: data,
    }),

  logout: () => clearTokens(),
};

// ─── Partner API ───
export const partnerApi = {
  getDashboard: () =>
    request<any>('/api/v1/partners/dashboard'),

  getProfile: () =>
    request<any>('/api/v1/partners/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    request<any>('/api/v1/partners/profile', { method: 'PUT', body: data }),

  // Rooms
  getRooms: (page = 1) =>
    request<any>(`/api/v1/partners/rooms?page=${page}`),

  getRoom: (id: string) =>
    request<any>(`/api/v1/partners/rooms/${encodeURIComponent(id)}`),

  updateRoom: (id: string, data: Record<string, unknown>) =>
    request<any>(`/api/v1/partners/rooms/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),

  createRoom: (data: Record<string, unknown>) =>
    request<any>('/api/v1/partners/rooms', { method: 'POST', body: data }),

  // Pods
  getPodSets: (page = 1) =>
    request<any>(`/api/v1/partners/pod-sets?page=${page}`),

  getPodSet: (id: string) =>
    request<any>(`/api/v1/partners/pod-sets/${encodeURIComponent(id)}`),

  updatePod: (id: string, data: Record<string, unknown>) =>
    request<any>(`/api/v1/partners/pods/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),

  // Bookings
  getBookings: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
    return request<any>(`/api/v1/partners/bookings?${qs}`);
  },

  getBooking: (id: string) =>
    request<any>(`/api/v1/partners/bookings/${encodeURIComponent(id)}`),

  checkIn: (id: string) =>
    request<any>(`/api/v1/partners/bookings/${encodeURIComponent(id)}/check-in`, { method: 'POST' }),

  checkOut: (id: string) =>
    request<any>(`/api/v1/partners/bookings/${encodeURIComponent(id)}/check-out`, { method: 'POST' }),

  // Earnings
  getEarnings: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params);
    return request<any>(`/api/v1/partners/earnings?${qs}`);
  },

  getPayouts: (page = 1) =>
    request<any>(`/api/v1/partners/payouts?page=${page}`),

  requestPayout: (data: Record<string, unknown>) =>
    request<any>('/api/v1/partners/payouts', { method: 'POST', body: data }),

  // Analytics
  getAnalytics: (period: string = 'month') =>
    request<any>(`/api/v1/partners/analytics?period=${encodeURIComponent(period)}`),
};
