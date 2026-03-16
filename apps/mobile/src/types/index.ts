// ─── User & Auth Types ───
export interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role: 'customer' | 'investor' | 'partner' | 'associate' | 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'suspended' | 'blocked';
  city?: string;
  state?: string;
  referralCode?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Property / Hotel Types ───
export interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'homestay';
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  amenities: string[];
  podsCount: number;
  roomsCount: number;
  podStartPrice: number;
  roomStartPrice: number;
  isVerified: boolean;
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  contactPhone?: string;
  contactEmail?: string;
}

// ─── Pod Types ───
export type PodSeries =
  | 'ABS Flagship'
  | 'Space Series'
  | 'Galaxy Series'
  | 'Cosmos Series'
  | 'Back to Future 2047'
  | 'E-Sports Series'
  | 'Wooden Series'
  | 'Made in India T1'
  | 'Online Red Studio';

export interface Pod {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  series: PodSeries;
  position: 'upper' | 'lower';
  type: 'single' | 'double';
  hourlyRate: number;
  image: string;
  amenities: PodAmenity[];
  features: PodFeatures;
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
  city: string;
  rating: number;
  reviewsCount: number;
}

export interface PodFeatures {
  ac: boolean;
  tv: boolean;
  charger: boolean;
  light: boolean;
  ventilation: boolean;
  wifi: boolean;
  locker: boolean;
  mirror: boolean;
}

export type PodAmenity =
  | 'AC'
  | 'TV'
  | 'WiFi'
  | 'Charger'
  | 'Light'
  | 'Ventilation'
  | 'Locker'
  | 'Mirror'
  | 'Fresh Linen'
  | 'Reading Light'
  | 'USB Port'
  | 'Power Outlet';

// ─── Pod Layout / Seat-map Types ───
export type PodSlotStatus = 'available' | 'occupied' | 'selected' | 'maintenance';

export interface PodSlot {
  id: string;
  label: string; // e.g. "A1-L", "A1-U"
  row: number;
  col: number;
  position: 'upper' | 'lower';
  type: 'single' | 'double';
  series: PodSeries;
  hourlyRate: number;
  status: PodSlotStatus;
  amenities: PodAmenity[];
  features: PodFeatures;
}

export interface PodRow {
  rowIndex: number;
  label: string; // e.g. "Row A"
  slots: PodSlot[];
}

export interface PodLayout {
  propertyId: string;
  rows: number;
  cols: number; // pods per row (one side)
  layout: PodRow[];
  totalPods: number;
  availablePods: number;
}

// ─── Room Types ───
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'dorm';
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'bunk';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  type: RoomType;
  bedType: BedType;
  floor: number;
  capacity: number;
  dailyRate: number;
  weeklyRate?: number;
  extraGuestCharge: number;
  amenities: string[];
  images: string[];
  description: string;
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
}

// ─── Booking Types ───
export type BookingType = 'pod' | 'room';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  bookingType: BookingType;
  podId?: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  duration?: number; // hourly for pods
  guestCount: number;
  guestNames?: string[];
  baseRate: number;
  subtotal: number;
  extraCharges: number;
  discount: number;
  gst: number;
  totalAmount: number;
  couponCode?: string;
  specialRequests?: string;
  status: BookingStatus;
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
  city: string;
}

export interface BookingRequest {
  propertyId: string;
  bookingType: BookingType;
  podId?: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  duration?: number;
  guestCount: number;
  guestNames?: string[];
  couponCode?: string;
  specialRequests?: string;
}

// ─── Search & Filter Types ───
export interface SearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  pods?: number;
  podType?: 'single' | 'double';
  type?: 'hotel' | 'homestay' | 'pod' | 'all';
}

export interface FilterParams {
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  amenities?: string[];
  propertyType?: ('hotel' | 'homestay')[];
  podSeries?: PodSeries[];
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'reviews' | 'distance';
  freeCancel?: boolean;
  payAtHotel?: boolean;
}

// ─── Review Types ───
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  propertyId: string;
  bookingId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  travelType?: 'solo' | 'couple' | 'family' | 'business' | 'friends';
  createdAt: string;
}

// ─── Location Types ───
export interface City {
  id: string;
  name: string;
  state: string;
  image: string;
  propertyCount: number;
  podCount: number;
  isPopular: boolean;
}

// ─── Payment Types ───
export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
}

// ─── Coupon Types ───
export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  validUntil: string;
  applicableOn: BookingType[];
}

// ─── API Response Types ───
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
