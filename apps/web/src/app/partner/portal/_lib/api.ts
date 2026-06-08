// Partner portal data layer — talks to the gateway and uses the auth-store JWT.
import { api, authApi } from '@/lib/api';
import type { PodCatalogueModel } from '@/lib/podCatalogue';

export interface PartnerRoom {
  id: string;
  roomNumber: string;
  name?: string;
  roomType: string;
  maxGuests: number;
  bedType: string;
  numBeds: number;
  dailyRate: number;
  extraGuestCharge: number;
  status: string;
  isActive: boolean;
  amenities: string[];
  images: string[];
  description?: string;
}

export interface PartnerPod {
  id: string;
  partnerId?: string;
  podSetId?: string | null;
  podNumber: string;
  displayName?: string;
  position: string;
  podType: 'single' | 'double' | 'king';
  maxOccupancy: number;
  dimensions?: string;
  hourlyRate: number;
  isStandalone: boolean;
  status: string;
}

export interface PartnerPodSet {
  id: string;
  setNumber: string;
  section?: string;
  hourlyRate: number;
  floor: number;
  isActive: boolean;
  pods: PartnerPod[];
}

export interface PartnerHotel {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  rating: number;
  totalReviews: number;
  status: string;
  rooms: PartnerRoom[];
  podSets: PartnerPodSet[];
  standalonePods?: PartnerPod[];
}

export interface PartnerBooking {
  id: string;
  bookingNumber: string;
  bookingType: 'pod' | 'room';
  checkIn: string;
  checkOut: string;
  guestCount: number;
  total: string;
  ownerShare: string;
  status: string;
  createdAt: string;
  unit?: { type: string; roomNumber?: string; podNumber?: string };
}

const REVENUE_STATUSES = ['confirmed', 'checked_in', 'checked_out'];

export async function loginPartner(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await authApi.login(email, password);
  if (res.error || !res.data?.success) return { ok: false, error: res.error || 'Invalid credentials' };
  const role = res.data.user.role;
  if (!['partner', 'admin', 'super_admin'].includes(role)) return { ok: false, error: 'Partner access required' };
  return { ok: true };
}

export async function getMyHotel(): Promise<PartnerHotel | null> {
  const r = await api.get<{ hotel: PartnerHotel }>('/api/v1/hotels/me');
  return r.data?.hotel ?? null;
}

export async function getPartnerBookings(partnerId: string): Promise<PartnerBooking[]> {
  const r = await api.get<{ bookings: PartnerBooking[] }>(`/api/v1/partner/${partnerId}/bookings`);
  return r.data?.bookings ?? [];
}

export async function getPodCatalogue(): Promise<PodCatalogueModel[]> {
  const r = await api.get<{ success: boolean; models: PodCatalogueModel[] }>('/api/v1/pod-catalogue');
  return r.data?.models ?? [];
}

export async function createRoom(hotelId: string, input: {
  roomNumber: string;
  name?: string;
  roomType?: string;
  maxGuests?: number;
  bedType?: string;
  numBeds?: number;
  floor?: number;
  areaSqFt?: number;
  dailyRate: number;
  extraGuestCharge?: number;
  amenities?: string[];
  description?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const r = await api.post<{ success: boolean; message?: string }>(`/api/v1/hotels/${hotelId}/rooms`, input);
  if (r.error || !r.data?.success) return { ok: false, error: r.error || r.data?.message || 'Failed to add room' };
  return { ok: true };
}

export async function updateRoom(roomId: string, patch: Partial<PartnerRoom>): Promise<{ ok: boolean; error?: string }> {
  const r = await api.patch<{ success: boolean; message?: string }>(`/api/v1/rooms/${roomId}`, patch);
  if (r.error || !r.data?.success) return { ok: false, error: r.error || r.data?.message || 'Failed to update room' };
  return { ok: true };
}

export async function createPodSet(hotelId: string, input: {
  mode?: 'set' | 'single';
  setNumber: string;
  podNumber?: string;
  podName?: string;
  upperPodNumber?: string;
  upperPodName?: string;
  lowerPodNumber?: string;
  lowerPodName?: string;
  podType?: 'single' | 'double' | 'king';
  maxOccupancy?: number;
  dimensions?: string;
  hourlyRate: number;
  upperHourlyRate?: number;
  lowerHourlyRate?: number;
  floor?: number;
  section?: string;
  ownership?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const r = await api.post<{ success: boolean; message?: string }>(`/api/v1/hotels/${hotelId}/pod-sets`, input);
  if (r.error || !r.data?.success) return { ok: false, error: r.error || r.data?.message || 'Failed to add pod set' };
  return { ok: true };
}

export async function updatePodSet(podSetId: string, patch: Partial<PartnerPodSet>): Promise<{ ok: boolean; error?: string }> {
  const r = await api.patch<{ success: boolean; message?: string }>(`/api/v1/pod-sets/${podSetId}`, patch);
  if (r.error || !r.data?.success) return { ok: false, error: r.error || r.data?.message || 'Failed to update pod set' };
  return { ok: true };
}

export function computeEarnings(bookings: PartnerBooking[]) {
  const revBookings = bookings.filter((b) => REVENUE_STATUSES.includes(b.status));
  const totalRevenue = revBookings.reduce((s, b) => s + Number(b.total), 0);
  const myShare = revBookings.reduce((s, b) => s + Number(b.ownerShare), 0);
  const last30 = revBookings.filter((b) => new Date(b.createdAt) > new Date(Date.now() - 30 * 86400000));
  const last30Revenue = last30.reduce((s, b) => s + Number(b.total), 0);
  const last30Share = last30.reduce((s, b) => s + Number(b.ownerShare), 0);
  return {
    totalRevenue: Math.round(totalRevenue),
    myShare: Math.round(myShare),
    last30Revenue: Math.round(last30Revenue),
    last30Share: Math.round(last30Share),
    totalBookings: bookings.length,
    revenueBookings: revBookings.length,
  };
}
