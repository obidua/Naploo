// ============================
// ADMIN DASHBOARD TYPES
// Aligned to DB schema (19 tables)
// ============================

// User roles from DB
export type UserRole = 'customer' | 'investor' | 'partner' | 'associate' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KycStatus;
  panNumber?: string;
  aadharNumber?: string;
  bankAccount?: string;
  bankIfsc?: string;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  referralCode: string;
  referredBy?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastActive?: string;
  totalBookings: number;
  totalSpent: number;
}

// Partner - from partners table
export type PartnerStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'terminated';
export type BusinessType = 'hotel' | 'homestay';
export type PartnershipModel = 'without_investment' | 'with_investment';

export interface Partner {
  id: string;
  userId: string;
  userName: string;
  businessName: string;
  businessType: BusinessType;
  partnershipModel: PartnershipModel;
  gstNumber?: string;
  panNumber?: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  commissionPercent: number;
  agreementStart?: string;
  agreementEnd?: string;
  agreementDocument?: string;
  status: PartnerStatus;
  amenities: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  totalPods: number;
  totalRooms: number;
  monthlyRevenue: number;
  createdAt: string;
}

// Booking - from bookings table
export type BookingType = 'pod' | 'room';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  bookingType: BookingType;
  podId?: string;
  roomId?: string;
  propertyName: string;
  location: string;
  guestCount: number;
  guestNames?: string;
  checkIn: string;
  checkOut: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  hours?: number;
  nights?: number;
  baseRate: number;
  subtotal: number;
  extraCharges: number;
  discount: number;
  gstAmount: number;
  totalAmount: number;
  ownerShare: number;
  naplooShare: number;
  partnerCommission: number;
  couponCode?: string;
  status: BookingStatus;
  specialRequests?: string;
  adminNotes?: string;
  createdAt: string;
}

// Pod & PodSet - from pods/podSets tables
export type PodOwnership = 'naploo' | 'investor' | 'partner';
export type PodPosition = 'upper' | 'lower';
export type PodType = 'single' | 'double';
export type PodStatus = 'available' | 'occupied' | 'maintenance' | 'offline';
export type PodSeries = 'NapZen' | 'NapPro' | 'NapEco' | 'NapLux' | 'NapDuo' | 'NapAir' | 'NapCube' | 'NapPad' | 'NapStal';

export interface PodSet {
  id: string;
  partnerId: string;
  partnerName: string;
  ownerId?: string;
  ownerName?: string;
  ownership: PodOwnership;
  series: PodSeries;
  floor: number;
  section: string;
  setNumber: number;
  hourlyRate: number;
  totalPods: number;
  availablePods: number;
  location: string;
}

export interface Pod {
  id: string;
  podSetId: string;
  podNumber: string;
  position: PodPosition;
  podType: PodType;
  status: PodStatus;
  series: PodSeries;
  features: { ac: boolean; tv: boolean; charger: boolean; light: boolean; ventilation: boolean };
  lastMaintenance?: string;
  nextMaintenance?: string;
}

// Room - from rooms table
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'dormitory';
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'bunk';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'blocked';

export interface Room {
  id: string;
  partnerId: string;
  partnerName: string;
  roomNumber: string;
  name: string;
  roomType: RoomType;
  floor: number;
  maxGuests: number;
  bedType: BedType;
  numBeds: number;
  areaSqFt: number;
  dailyRate: number;
  weeklyRate?: number;
  extraGuestCharge: number;
  status: RoomStatus;
  amenities: string[];
  images: string[];
  location: string;
}

// Investor - from investors/investments tables
export type InvestorStatus = 'pending' | 'kyc_pending' | 'approved' | 'active' | 'suspended' | 'blocked';

export interface Investor {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  status: InvestorStatus;
  totalInvested: number;
  totalEarned: number;
  totalPodSets: number;
  kycStatus: KycStatus;
  investments: Investment[];
  createdAt: string;
}

export interface Investment {
  id: string;
  investorId: string;
  podSetId: string;
  invoiceNumber: string;
  podSetCount: number;
  totalAmount: number;
  deliveryOption: 'doorstep' | 'leaseback';
  guaranteeProgress: number;
  contractStart: string;
  contractEnd: string;
  monthlyEarnings: number;
  cumulativeEarnings: number;
  status: 'active' | 'completed' | 'terminated';
}

// Associate (Referral) - from associates table
export interface Associate {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  level: number;
  parentId?: string;
  parentName?: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  directReferrals: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Payment - from payments table
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'razorpay' | 'cashfree' | 'upi' | 'card' | 'wallet' | 'netbanking' | 'cash';

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
}

// Payout - from payouts table
export type PayoutType = 'partner' | 'investor' | 'associate';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  payoutType: PayoutType;
  amount: number;
  tdsAmount: number;
  netAmount: number;
  bankAccount: string;
  bankIfsc: string;
  bankName: string;
  transferId?: string;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

// Coupon
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minBookingAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: CouponStatus;
  applicableTypes: BookingType[];
}

// Ticket
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketCategory = 'booking' | 'pod' | 'account' | 'safety' | 'general' | 'technical';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  bookingId?: string;
  assignee?: string;
  messages: number;
  lastReply?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Application
export type ApplicationType = 'partner' | 'investor' | 'franchise';
export type ApplicationStatus = 'submitted' | 'under-review' | 'approved' | 'rejected';

export interface Application {
  id: string;
  applicationNumber: string;
  type: ApplicationType;
  businessName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  businessType?: string;
  gstNumber?: string;
  investmentRange?: string;
  expectedPods?: string;
  message?: string;
  status: ApplicationStatus;
  reviewNotes?: string;
  createdAt: string;
}

// Review
export interface Review {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  propertyName: string;
  location: string;
  rating: number;
  comment: string;
  status: 'published' | 'flagged' | 'hidden';
  createdAt: string;
}

// Location
export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'airport' | 'railway' | 'bus_stand' | 'hospital' | 'tourist' | 'it_park' | 'mall' | 'highway';
  partnerId: string;
  partnerName: string;
  totalPods: number;
  totalRooms: number;
  occupancyRate: number;
  monthlyRevenue: number;
  status: 'active' | 'setup' | 'inactive';
  latitude?: number;
  longitude?: number;
}

// Commission Config - from commissionConfig table
export type ReferralType = 'hotel' | 'homestay' | 'space' | 'investor' | 'customer' | 'associate';

export interface CommissionConfig {
  id: string;
  referralType: ReferralType;
  level1Percent: number;
  level2Percent: number;
  level3Percent: number;
  level4Percent: number;
  level5Percent: number;
  oneTimeBonus: number;
}

// Staff
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'operations_manager' | 'support_lead' | 'maintenance' | 'partner_relations' | 'finance' | 'tech';
  location: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinedAt: string;
}

// Active page type for sidebar routing
export type AdminPage = 'dashboard' | 'users' | 'partners' | 'pods' | 'rooms' |
  'bookings' | 'investors' | 'associates' | 'revenue' | 'payments' | 'payouts' |
  'coupons' | 'investor-offers' | 'naploo-team' | 'tickets' | 'applications' | 'reviews' | 'locations' |
  'commissions' | 'staff' | 'analytics' | 'marketing' | 'content' |
  'notifications' | 'settings';
