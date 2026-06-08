// PMS API extension — appended to /partner/portal/_lib/api.ts
import { api } from '@/lib/api';

// ─── PMS data shapes ──────────────────────────────────────────
export interface PartnerConfig {
  partnerId: string;
  staffRole: 'owner' | 'manager' | 'front_desk';
  tier: string;
  roomCountBand: string;
  featuresEnabled: {
    modules: Record<string, boolean>;
    tax_preset: string;
    ui_density: string;
    wizard_completed: boolean;
  };
  currency: string;
  timezone: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface WalkInInput {
  kind: 'room' | 'pod';
  unitId: string;
  /** For pod walk-ins: specific bunk id within the pod set. */
  podId?: string;
  checkIn: string;       // ISO date-time
  nights?: number;
  hours?: number;
  guestCount?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  discount?: number;
  notes?: string;
  checkInNow?: boolean;
  payment?: {
    method: 'cash' | 'card' | 'upi' | 'razorpay' | 'cashfree' | 'wallet' | 'bank_transfer' | 'pay_later';
    amount?: number;
    reference?: string;
  };
}

export interface FolioCharge {
  id: string;
  folioId: string;
  kind: 'room' | 'pod' | 'service' | 'fnb' | 'extra_guest' | 'tax' | 'discount' | 'adjustment';
  description: string;
  qty: number;
  unitPrice: string;
  amount: string;
  taxable: boolean;
  createdAt: string;
}

export interface FolioPayment {
  id: string;
  folioId: string;
  method: string;
  amount: string;
  reference?: string;
  createdAt: string;
}

export interface FolioDetail {
  folio: {
    id: string;
    status: 'open' | 'closed' | 'void';
    totalCharges: string;
    totalPayments: string;
    balance: string;
    openedAt: string;
    closedAt?: string;
  };
  booking: any;
  charges: FolioCharge[];
  payments: FolioPayment[];
}

export interface TodaySummary {
  arrivalsToday: number;
  departuresToday: number;
  inHouse: number;
  openFolios: number;
  totalDues: number;
}

// ─── PMS API surface ──────────────────────────────────────────
export const pmsApi = {
  // Config
  getConfig: () => api.get<PartnerConfig & { success: boolean }>('/api/v1/pms/me/config'),
  updateConfig: (patch: Partial<PartnerConfig>) =>
    api.patch<{ success: boolean }>('/api/v1/pms/me/config', patch),

  // Walk-in booking
  walkIn: (input: WalkInInput) =>
    api.post<{ success: boolean; booking: any; folio: any; summary: any; message?: string }>(
      '/api/v1/pms/walk-in', input
    ),

  // Folio operations
  getFolio: (id: string) =>
    api.get<FolioDetail & { success: boolean }>(`/api/v1/pms/folios/${id}`),
  addCharge: (folioId: string, input: { kind: string; description: string; qty: number; unitPrice: number; taxable?: boolean }) =>
    api.post<{ success: boolean; charge: FolioCharge; folioBalance: number; message?: string }>(
      `/api/v1/pms/folios/${folioId}/charges`, input
    ),
  takePayment: (folioId: string, input: { method: string; amount: number; reference?: string }) =>
    api.post<{ success: boolean; payment: FolioPayment; folioBalance: number; message?: string }>(
      `/api/v1/pms/folios/${folioId}/payments`, input
    ),
  checkout: (folioId: string, input?: { allowDues?: boolean; customerGstNumber?: string }) =>
    api.post<{ success: boolean; invoice: any; folioClosed: boolean; message?: string }>(
      `/api/v1/pms/folios/${folioId}/checkout`, input ?? {}
    ),

  // Today operations
  today: () =>
    api.get<{ success: boolean; summary: TodaySummary; arrivalsToday: any[]; departuresToday: any[]; inHouse: any[]; openFolios: any[] }>(
      '/api/v1/pms/today'
    ),

  // Booking lifecycle
  checkIn: (bookingId: string) =>
    api.post<{ success: boolean; booking: any }>(`/api/v1/pms/bookings/${bookingId}/check-in`, {}),
  checkOut: (bookingId: string) =>
    api.post<{ success: boolean; booking: any }>(`/api/v1/pms/bookings/${bookingId}/check-out`, {}),

  // Housekeeping
  housekeepingBoard: () =>
    api.get<{ success: boolean; rooms: any[]; podSets: any[]; standalonePods?: any[] }>('/api/v1/pms/housekeeping/board'),
  setHousekeepingStatus: (input: { roomId?: string; podId?: string; status: string; note?: string }) =>
    api.post<{ success: boolean }>('/api/v1/pms/housekeeping/status', input),

  // Staff
  getStaff: () => api.get<{ success: boolean; staff: any[] }>('/api/v1/pms/staff'),
  inviteStaff: (input: { phone: string; name?: string; email?: string; role: 'owner' | 'manager' | 'front_desk' }) =>
    api.post<{ success: boolean; staff: any; message?: string }>('/api/v1/pms/staff/invite', input),
  updateStaff: (id: string, patch: { role?: string; status?: string }) =>
    api.patch<{ success: boolean }>(`/api/v1/pms/staff/${id}`, patch),

  // Taxes
  getTaxes: () => api.get<{ success: boolean; taxes: any[] }>('/api/v1/pms/taxes'),
  addTax: (input: { name: string; kind: string; percent: number; appliesTo: string; hsnCode?: string; isInclusive?: boolean }) =>
    api.post<{ success: boolean; tax: any }>('/api/v1/pms/taxes', input),

  // Services
  getServices: () => api.get<{ success: boolean; services: any[] }>('/api/v1/pms/services'),
  addService: (input: { name: string; kind: string; price: number; taxable?: boolean; isPerNight?: boolean; isPerPerson?: boolean }) =>
    api.post<{ success: boolean; service: any }>('/api/v1/pms/services', input),
};

// ─── Module gating helper ─────────────────────────────────────
export function isModuleEnabled(config: PartnerConfig | null, key: string): boolean {
  if (!config) return false;
  return !!config.featuresEnabled?.modules?.[key];
}

// ─── Currency formatter (uses config.currency) ────────────────
export function formatMoney(value: number | string, currency = 'INR'): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  if (Math.abs(n) >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `${symbol}${(n / 100000).toFixed(2)} L`;
  return `${symbol}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
