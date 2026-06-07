// Extension to PMS API client — appended exports
import { api } from '@/lib/api';

export interface RatePlan {
  id: string; name: string; kind: string; baseMultiplier: string;
  minNights?: number; maxNights?: number;
  validFrom?: string; validTo?: string;
  appliesToRoomTypes?: any; blockCheckInDays?: any;
  isActive: boolean; createdAt: string;
}

export const pmsApiExt = {
  // Rate plans
  listRatePlans: () => api.get<{ success: boolean; plans: RatePlan[] }>('/api/v1/pms/rates'),
  createRatePlan: (input: any) => api.post<{ success: boolean; plan: RatePlan }>('/api/v1/pms/rates', input),
  updateRatePlan: (id: string, patch: any) => api.patch<{ success: boolean }>(`/api/v1/pms/rates/${id}`, patch),

  // Outlets + menu
  listOutlets: () => api.get<{ success: boolean; outlets: any[] }>('/api/v1/pms/outlets'),
  createOutlet: (input: { name: string; kind: string }) => api.post<{ success: boolean; outlet: any }>('/api/v1/pms/outlets', input),
  getMenu: (outletId: string) => api.get<{ success: boolean; categories: any[]; items: any[] }>(`/api/v1/pms/outlets/${outletId}/menu`),
  addCategory: (outletId: string, name: string) => api.post<{ success: boolean }>(`/api/v1/pms/outlets/${outletId}/categories`, { name }),
  addMenuItem: (outletId: string, input: any) => api.post<{ success: boolean; item: any }>(`/api/v1/pms/outlets/${outletId}/items`, input),
  updateMenuItem: (id: string, patch: any) => api.patch<{ success: boolean }>(`/api/v1/pms/menu-items/${id}`, patch),

  // Table orders
  listOrders: (outletId: string, status?: string) =>
    api.get<{ success: boolean; orders: any[] }>(`/api/v1/pms/outlets/${outletId}/orders${status ? '?status=' + status : ''}`),
  createOrder: (outletId: string, input: { tableNo?: string; folioId?: string }) =>
    api.post<{ success: boolean; order: any }>(`/api/v1/pms/outlets/${outletId}/orders`, input),
  getOrder: (id: string) => api.get<{ success: boolean; order: any; items: any[] }>(`/api/v1/pms/orders/${id}`),
  addOrderItem: (id: string, input: { menuItemId: string; qty: number; note?: string }) =>
    api.post<{ success: boolean; orderTotal: number }>(`/api/v1/pms/orders/${id}/items`, input),
  closeOrder: (id: string, folioId?: string) =>
    api.post<{ success: boolean }>(`/api/v1/pms/orders/${id}/close`, { folioId }),

  // Reports
  occupancyReport: () => api.get<{
    success: boolean; totalRooms: number; totalPodSets: number; avgOccupancy30d: number;
    series: { day: string; occupied: number; total: number; rate: number }[];
  }>('/api/v1/pms/reports/occupancy'),
  revenueReport: (days = 30) => api.get<{
    success: boolean; days: number; totalRevenue: number; totalShare: number; totalBookings: number; avgBookingValue: number;
    series: { day: string; revenue: number; bookings: number; share: number }[];
  }>(`/api/v1/pms/reports/revenue?days=${days}`),
  taxReport: () => api.get<{
    success: boolean; totalInvoices: number; totalGross: number; totalTax: number;
    months: { month: string; gross: number; tax: number; count: number }[];
  }>('/api/v1/pms/reports/tax'),

  // Invoices
  listInvoices: () => api.get<{ success: boolean; invoices: any[] }>('/api/v1/pms/invoices'),
  invoicePdfUrl: (id: string) => `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/pms/invoices/${id}/pdf`,

  // Calendar
  calendar: (start?: string, days = 14) =>
    api.get<{
      success: boolean; startDate: string; days: number; dayKeys: string[];
      rooms: any[]; podSets: any[]; bookings: any[];
    }>(`/api/v1/pms/calendar?${start ? 'start=' + start + '&' : ''}days=${days}`),

  // API keys (for OTA partners)
  listApiKeys: () => api.get<{ success: boolean; keys: any[] }>('/api/v1/pms/api-keys'),
  createApiKey: (input: { name: string; scopes?: string[] }) =>
    api.post<{ success: boolean; api_key: string; key_prefix: string }>('/api/v1/pms/api-keys', input),
  revokeApiKey: (id: string) => api.delete<{ success: boolean }>(`/api/v1/pms/api-keys/${id}`),
};
