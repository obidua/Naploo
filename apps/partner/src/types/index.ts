// ─── User ───
export interface User {
  id: string;
  email: string | null;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: 'customer' | 'investor' | 'partner' | 'associate' | 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'suspended' | 'blocked';
  city: string | null;
  state: string | null;
}

// ─── Partner ───
export interface Partner {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'hotel' | 'homestay';
  partnershipModel: 'without_investment' | 'with_investment';
  gstNumber: string | null;
  panNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string | null;
  commissionPercent: number;
  agreementStartDate: string | null;
  agreementEndDate: string | null;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'terminated';
  description: string | null;
  amenities: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  createdAt: string;
}

// ─── Pod Set ───
export interface PodSet {
  id: string;
  partnerId: string;
  ownership: 'naploo' | 'investor' | 'partner';
  floor: number;
  section: string | null;
  setNumber: string;
  hourlyRate: number;
  isActive: boolean;
  installedAt: string | null;
}

// ─── Pod ───
export interface Pod {
  id: string;
  podSetId: string;
  podNumber: string;
  position: 'upper' | 'lower';
  podType: 'single' | 'double';
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
  hasAC: boolean;
  hasTV: boolean;
  hasCharger: boolean;
  hasLight: boolean;
  hasVentilation: boolean;
  lastMaintenanceAt: string | null;
}

// ─── Room ───
export interface Room {
  id: string;
  partnerId: string;
  roomNumber: string;
  name: string;
  roomType: 'standard' | 'deluxe' | 'suite' | 'family' | 'dormitory';
  floor: number;
  maxGuests: number;
  bedType: 'single' | 'double' | 'queen' | 'king' | 'bunk';
  numBeds: number;
  areaSqFt: number | null;
  dailyRate: number;
  weeklyRate: number | null;
  extraGuestCharge: number;
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
  isActive: boolean;
  amenities: string[];
  images: string[];
  description: string | null;
  checkInTime: string;
  checkOutTime: string;
}

// ─── Booking ───
export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  bookingType: 'pod' | 'room';
  podId: string | null;
  roomId: string | null;
  guestCount: number;
  guestNames: string[] | null;
  checkIn: string;
  checkOut: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
  hours: number | null;
  nights: number | null;
  baseRate: number;
  subtotal: number;
  extraCharges: number;
  discount: number;
  gst: number;
  total: number;
  ownerShare: number;
  naplooShare: number;
  partnerCommission: number;
  couponCode: string | null;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  cancelledAt: string | null;
  cancelReason: string | null;
  specialRequests: string | null;
  createdAt: string;
  // Joined
  guest?: { firstName: string; lastName: string; phone: string };
  room?: Room;
  pod?: Pod;
}

// ─── Payout ───
export interface Payout {
  id: string;
  userId: string;
  payoutType: 'partner';
  amount: number;
  tdsDeducted: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  periodStart: string;
  periodEnd: string;
  processedAt: string | null;
  createdAt: string;
}

// ─── Dashboard Stats ───
export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  monthRevenue: number;
  occupancyRate: number;
  totalRooms: number;
  totalPods: number;
  pendingPayouts: number;
  rating: number;
  totalReviews: number;
}

// ─── API ───
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
