import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type BookingKind = 'pod' | 'room';

export interface Booking {
  id: string;
  kind: BookingKind;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  // Pod
  startTime?: string; // ISO
  durationHours?: number;
  // Room
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  nights?: number;
  // Common
  guests: number;
  rooms?: number;
  pricePerUnit: number; // per hour or per night
  subtotal: number;
  taxes: number;
  total: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  status: BookingStatus;
  bookingCode: string;
  createdAt: string; // ISO
}

interface BookingsState {
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  getBookingById: (id: string) => Booking | undefined;
  cancelBooking: (id: string) => void;
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],
      addBooking: (b) =>
        set((s) => ({
          bookings: [b, ...s.bookings],
        })),
      getBookingById: (id) => get().bookings.find((b) => b.id === id),
      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b
          ),
        })),
    }),
    { name: 'naploo-bookings' }
  )
);

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'NP';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function computeTaxes(subtotal: number): number {
  // GST 12% on accommodation < ₹7,500/unit, 18% above. Simplified flat 12% here.
  return Math.round(subtotal * 0.12);
}
