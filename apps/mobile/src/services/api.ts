import * as SecureStore from 'expo-secure-store';
import type { ApiResponse, AuthTokens } from '@/types';

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
      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
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
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expired — try refresh
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

// ─── Properties API ───
export const propertiesApi = {
  search: (params: Record<string, string | number | boolean>) => {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, String(val));
      }
    }
    return request<ApiResponse<any>>(`/api/v1/properties?${qs}`, { auth: false });
  },

  getById: (id: string) =>
    request<ApiResponse<any>>(`/api/v1/properties/${encodeURIComponent(id)}`, { auth: false }),

  getRooms: (propertyId: string) =>
    request<ApiResponse<any>>(`/api/v1/properties/${encodeURIComponent(propertyId)}/rooms`, { auth: false }),

  getPods: (propertyId: string) =>
    request<ApiResponse<any>>(`/api/v1/properties/${encodeURIComponent(propertyId)}/pods`, { auth: false }),

  getReviews: (propertyId: string, page = 1) =>
    request<ApiResponse<any>>(`/api/v1/properties/${encodeURIComponent(propertyId)}/reviews?page=${page}`, { auth: false }),
};

// ─── Pods API ───
export const podsApi = {
  search: (params: Record<string, string | number | boolean>) => {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, String(val));
      }
    }
    return request<ApiResponse<any>>(`/api/v1/pods?${qs}`, { auth: false });
  },

  getById: (id: string) =>
    request<ApiResponse<any>>(`/api/v1/pods/${encodeURIComponent(id)}`, { auth: false }),

  getAvailability: (id: string, date: string) =>
    request<ApiResponse<any>>(`/api/v1/pods/${encodeURIComponent(id)}/availability?date=${encodeURIComponent(date)}`, { auth: false }),
};

// ─── Bookings API ───
export const bookingsApi = {
  create: (data: Record<string, unknown>) =>
    request<ApiResponse<any>>('/api/v1/bookings', {
      method: 'POST',
      body: data,
    }),

  getMyBookings: (page = 1, status?: string) => {
    const qs = new URLSearchParams({ page: String(page) });
    if (status) qs.set('status', status);
    return request<ApiResponse<any>>(`/api/v1/bookings?${qs}`);
  },

  getById: (id: string) =>
    request<ApiResponse<any>>(`/api/v1/bookings/${encodeURIComponent(id)}`),

  cancel: (id: string, reason?: string) =>
    request<ApiResponse<any>>(`/api/v1/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: { reason },
    }),
};

// ─── Coupons API ───
export const couponsApi = {
  validate: (code: string, bookingType: string, amount: number) =>
    request<ApiResponse<any>>('/api/v1/coupons/validate', {
      method: 'POST',
      body: { code, bookingType, amount },
    }),
};

export { clearTokens, getToken };
