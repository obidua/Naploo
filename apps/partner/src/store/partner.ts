import { create } from 'zustand';
import type { Booking, Room, Payout, DashboardStats } from '@/types';

// ─── Bookings Store ───
const BOOKINGS: Booking[] = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  bookingNumber: `NAP-2025${String(i + 1).padStart(4, '0')}`,
  userId: `u-${i + 1}`,
  bookingType: (i % 3 === 0 ? 'pod' : 'room') as 'pod' | 'room',
  podId: i % 3 === 0 ? `pod-${i + 1}` : null,
  roomId: i % 3 !== 0 ? `room-${i + 1}` : null,
  guestCount: (i % 3) + 1,
  guestNames: null,
  checkIn: new Date(Date.now() + (i - 5) * 86400000).toISOString(),
  checkOut: new Date(Date.now() + (i - 4) * 86400000).toISOString(),
  actualCheckIn: null,
  actualCheckOut: null,
  hours: i % 3 === 0 ? 3 : null,
  nights: i % 3 !== 0 ? 1 : null,
  baseRate: i % 3 === 0 ? 299 : 1800,
  subtotal: 1200 + i * 350,
  extraCharges: 0,
  discount: 0,
  gst: Math.round((1200 + i * 350) * 0.12),
  total: Math.round((1200 + i * 350) * 1.12),
  ownerShare: Math.round((1200 + i * 350) * 0.6),
  naplooShare: Math.round((1200 + i * 350) * 0.4),
  partnerCommission: Math.round((1200 + i * 350) * 0.1),
  couponCode: null,
  status: (['confirmed', 'checked_in', 'checked_out', 'pending', 'cancelled'] as const)[i % 5],
  cancelledAt: null,
  cancelReason: null,
  specialRequests: null,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  guest: {
    firstName: ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram'][i % 5],
    lastName: ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][i % 5],
    phone: `98765432${String(10 + i).slice(-2)}`,
  },
}));

type BookingFilter = 'all' | 'today' | 'upcoming' | 'checked_in' | 'completed';

interface PartnerBookingsState {
  bookings: Booking[];
  getFiltered: (filter: BookingFilter) => Booking[];
  getBooking: (id: string) => Booking | undefined;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
}

export const usePartnerBookingsStore = create<PartnerBookingsState>((set, get) => ({
  bookings: BOOKINGS,

  getFiltered: (filter) => {
    const all = get().bookings;
    const today = new Date().toDateString();
    switch (filter) {
      case 'today':
        return all.filter((b) => new Date(b.checkIn).toDateString() === today);
      case 'upcoming':
        return all.filter((b) => ['confirmed', 'pending'].includes(b.status) && new Date(b.checkIn) > new Date());
      case 'checked_in':
        return all.filter((b) => b.status === 'checked_in');
      case 'completed':
        return all.filter((b) => ['checked_out', 'cancelled', 'no_show'].includes(b.status));
      default:
        return all;
    }
  },

  getBooking: (id) => get().bookings.find((b) => b.id === id),

  checkIn: (id) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'checked_in' as const, actualCheckIn: new Date().toISOString() } : b
      ),
    })),

  checkOut: (id) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'checked_out' as const, actualCheckOut: new Date().toISOString() } : b
      ),
    })),
}));

// ─── Rooms Store ───
const ROOMS: Room[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  partnerId: 'p1',
  roomNumber: `${(i % 3) + 1}0${i + 1}`,
  name: ['Standard Room', 'Deluxe Double', 'Family Suite', 'King Room'][i % 4],
  roomType: (['standard', 'deluxe', 'suite', 'family'] as const)[i % 4],
  floor: (i % 3) + 1,
  maxGuests: (i % 3) + 2,
  bedType: (['double', 'queen', 'king', 'single'] as const)[i % 4],
  numBeds: i % 2 === 0 ? 1 : 2,
  areaSqFt: 200 + i * 50,
  dailyRate: 1200 + i * 400,
  weeklyRate: (1200 + i * 400) * 6,
  extraGuestCharge: 500,
  status: (['available', 'occupied', 'maintenance', 'available'] as const)[i % 4],
  isActive: true,
  amenities: ['WiFi', 'AC', 'TV', ...(i >= 2 ? ['Mini Bar'] : []), ...(i >= 4 ? ['Balcony'] : [])],
  images: [],
  description: null,
  checkInTime: '14:00',
  checkOutTime: '11:00',
}));

interface RoomsState {
  rooms: Room[];
  getRoom: (id: string) => Room | undefined;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  toggleStatus: (id: string) => void;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: ROOMS,

  getRoom: (id) => get().rooms.find((r) => r.id === id),

  addRoom: (room) => {
    const id = String(get().rooms.length + 1);
    set((s) => ({ rooms: [...s.rooms, { ...room, id }] }));
  },

  updateRoom: (id, data) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  toggleStatus: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'available' ? ('maintenance' as const) : ('available' as const) }
          : r
      ),
    })),
}));

// ─── Payouts Store ───
const PAYOUTS: Payout[] = [
  { id: '1', userId: 'p1', payoutType: 'partner', amount: 12500, netAmount: 11250, tdsDeducted: 1250, status: 'completed', periodStart: '2025-01-01', periodEnd: '2025-01-15', processedAt: '2025-01-18', createdAt: '2025-01-16' },
  { id: '2', userId: 'p1', payoutType: 'partner', amount: 15800, netAmount: 14220, tdsDeducted: 1580, status: 'completed', periodStart: '2025-01-16', periodEnd: '2025-01-31', processedAt: '2025-02-04', createdAt: '2025-02-01' },
  { id: '3', userId: 'p1', payoutType: 'partner', amount: 9200, netAmount: 8280, tdsDeducted: 920, status: 'processing', periodStart: '2025-02-01', periodEnd: '2025-02-15', processedAt: null, createdAt: '2025-02-16' },
  { id: '4', userId: 'p1', payoutType: 'partner', amount: 23400, netAmount: 21060, tdsDeducted: 2340, status: 'pending', periodStart: '2025-02-16', periodEnd: '2025-02-28', processedAt: null, createdAt: '2025-03-01' },
];

interface PayoutsState {
  payouts: Payout[];
  requestPayout: () => void;
}

export const usePayoutsStore = create<PayoutsState>((set, get) => ({
  payouts: PAYOUTS,
  requestPayout: () => {
    const pending = get().payouts.find((p) => p.status === 'pending');
    if (pending) {
      set((s) => ({
        payouts: s.payouts.map((p) => (p.id === pending.id ? { ...p, status: 'processing' as const } : p)),
      }));
    }
  },
}));

// ─── Dashboard Stats (computed) ───
export function getDashboardStats(): DashboardStats {
  const bookings = usePartnerBookingsStore.getState().bookings;
  const rooms = useRoomsStore.getState().rooms;
  const today = new Date().toDateString();

  const todayBookings = bookings.filter((b) => new Date(b.checkIn).toDateString() === today);
  const activeBookings = bookings.filter((b) => ['confirmed', 'checked_in'].includes(b.status));
  const totalRevenue = bookings.reduce((s, b) => s + b.ownerShare, 0);
  const thisMonth = new Date().getMonth();
  const monthBookings = bookings.filter((b) => new Date(b.createdAt).getMonth() === thisMonth);
  const monthRevenue = monthBookings.reduce((s, b) => s + b.ownerShare, 0);
  const occupied = rooms.filter((r) => r.status === 'occupied').length;
  const available = rooms.filter((r) => r.status === 'available' || r.status === 'occupied').length;
  const pendingPayouts = usePayoutsStore.getState().payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + p.netAmount, 0);

  return {
    totalBookings: bookings.length,
    activeBookings: activeBookings.length,
    todayCheckIns: todayBookings.filter((b) => ['confirmed', 'pending'].includes(b.status)).length,
    todayCheckOuts: todayBookings.filter((b) => b.status === 'checked_in').length,
    totalRevenue,
    monthRevenue,
    occupancyRate: available > 0 ? Math.round((occupied / available) * 100) : 0,
    totalRooms: rooms.length,
    totalPods: 32,
    pendingPayouts,
    rating: 4.3,
    totalReviews: 156,
  };
}

// ─── Earnings helpers ───
export function getEarningsData(period: 'week' | 'month' | 'year') {
  const bookings = usePartnerBookingsStore.getState().bookings;
  const now = new Date();
  let filtered: Booking[];

  switch (period) {
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      filtered = bookings.filter((b) => new Date(b.createdAt) >= weekAgo);
      break;
    }
    case 'year': {
      filtered = bookings.filter((b) => new Date(b.createdAt).getFullYear() === now.getFullYear());
      break;
    }
    default: {
      filtered = bookings.filter((b) => new Date(b.createdAt).getMonth() === now.getMonth());
    }
  }

  const totalEarned = filtered.reduce((s, b) => s + b.ownerShare, 0);
  const avgBookingValue = filtered.length > 0 ? Math.round(totalEarned / filtered.length) : 0;
  return { totalEarned, avgBookingValue, bookingCount: filtered.length };
}
