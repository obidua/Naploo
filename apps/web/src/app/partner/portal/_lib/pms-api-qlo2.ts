// Client for sidebar gap parity endpoints
import { api } from '@/lib/api';

export interface LoyaltyProgram {
  id: string; partner_id: string; name: string;
  earn_rate: string; redeem_value: string; min_redeem: number;
  status: string;
}
export interface LoyaltyMember {
  id: string; user_id: string; points: number;
  lifetime_earned: number; lifetime_redeemed: number; tier: string;
  first_name?: string; last_name?: string; email?: string; phone?: string;
}
export interface ConciergeRequest {
  id: string; kind: string; title: string; details?: string;
  scheduled_at?: string; status: string; price: string;
  first_name?: string; last_name?: string; phone?: string;
  booking_number?: string; created_at: string;
}
export interface SpaService {
  id: string; name: string; description?: string;
  duration_mins: number; price: string; category: string; status: string;
}
export interface SpaAppointment {
  id: string; service_id?: string; service_name?: string;
  guest_name?: string; guest_phone?: string;
  scheduled_at: string; duration_mins?: number; price?: string;
  status: string; notes?: string;
}

export const pmsQlo2Api = {
  // Loyalty
  getProgram: () => api.get<{ success: boolean; program: LoyaltyProgram }>('/api/v1/pms/loyalty/program'),
  updateProgram: (i: Partial<{ name: string; earnRate: number; redeemValue: number; minRedeem: number; status: string }>) =>
    api.put<{ success: boolean }>('/api/v1/pms/loyalty/program', i),
  listMembers: () => api.get<{ success: boolean; members: LoyaltyMember[] }>('/api/v1/pms/loyalty/members'),

  // Concierge
  listConcierge: () => api.get<{ success: boolean; requests: ConciergeRequest[] }>('/api/v1/pms/concierge/requests'),
  createConcierge: (i: { kind: string; title: string; details?: string; scheduledAt?: string; price?: number; bookingId?: string; guestUserId?: string }) =>
    api.post<{ success: boolean; request: ConciergeRequest }>('/api/v1/pms/concierge/requests', i),
  updateConcierge: (id: string, i: { status?: string; assignedTo?: string }) =>
    api.put<{ success: boolean }>(`/api/v1/pms/concierge/requests/${id}`, i),

  // Spa
  listSpaServices: () => api.get<{ success: boolean; services: SpaService[] }>('/api/v1/pms/spa/services'),
  createSpaService: (i: { name: string; description?: string; durationMins?: number; price?: number; category?: string }) =>
    api.post<{ success: boolean; service: SpaService }>('/api/v1/pms/spa/services', i),
  deleteSpaService: (id: string) => api.delete<{ success: boolean }>(`/api/v1/pms/spa/services/${id}`),
  listSpaAppointments: () => api.get<{ success: boolean; appointments: SpaAppointment[] }>('/api/v1/pms/spa/appointments'),
  createSpaAppointment: (i: { serviceId?: string; guestName?: string; guestPhone?: string; scheduledAt: string; durationMins?: number; price?: number; notes?: string }) =>
    api.post<{ success: boolean; appointment: SpaAppointment }>('/api/v1/pms/spa/appointments', i),
};
