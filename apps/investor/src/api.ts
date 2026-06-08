// Investor app — minimal API client
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://naploo.com';

async function getToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem('access_token'); } catch { return null; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const token = await getToken();
    const headers: any = { 'Content-Type': 'application/json', ...(init.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { error: (j as any)?.message || `HTTP ${r.status}` };
    return { data: j as T };
  } catch (e: any) {
    return { error: e.message || 'Network error' };
  }
}

export const api = {
  // Auth
  sendOtp: (phone: string) => request<{ success: boolean }>('/api/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ success: boolean; user: any; accessToken: string; refreshToken: string }>(
      '/api/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }
    ),

  // Investor profile
  me: () => request<{ enrolled: boolean; investor: any | null; investments: any[] }>('/api/v1/investors/me'),
  enroll: () => request<{ success: boolean; investor: any }>('/api/v1/investors/enroll', { method: 'POST', body: '{}' }),

  // Offers
  listOffers: () => request<{ offers: any[] }>('/api/v1/investors/offers'),
  getOffer: (id: string) => request<{ offer: any; myResponse: any | null }>(`/api/v1/investors/offers/${id}`),
  respondToOffer: (id: string, podSetsRequested: number, deliveryOption: string, notes?: string) =>
    request<{ success: boolean; response: any; totalAmount: number; message?: string }>(
      `/api/v1/investors/offers/${id}/respond`,
      { method: 'POST', body: JSON.stringify({ podSetsRequested, deliveryOption, notes }) }
    ),
  myOffers: () => request<{ responses: any[] }>('/api/v1/investors/my-offers'),

  // Investments + earnings
  earningsFor: (investmentId: string) => request<{ earnings: any[] }>(`/api/v1/investors/investments/${investmentId}/earnings`),
};

export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export async function logout() {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
}
