// LIVE admin data — wired to the gateway.
// Reusing the original mock shape (D.mockUsers, D.mockBookings, etc.)
// so the page's 71 references continue to work; the store fetches real
// data on AdminDashboard mount and re-renders the views.
import { create } from 'zustand';
import { api } from '@/lib/api';
import * as T from './types';

// ─── Local backend DTOs (subset of fields we use) ─────────────
interface BackendUser {
  id: string; phone: string; email: string | null; firstName: string | null; lastName: string | null;
  role: string; status: string; kycStatus: string; city: string | null; createdAt: string;
}
interface BackendPartner {
  id: string; userId: string; businessName: string; businessType: string; partnershipModel: string;
  gstNumber: string | null; address: string; city: string; state: string; pincode: string;
  contactPerson: string | null; contactPhone: string | null; contactEmail: string | null;
  commissionPercent: string | number | null; agreementStartDate: string | null;
  agreementEndDate: string | null; status: string; rating: string | number | null; totalReviews: number | null;
  amenities: any; images: any; createdAt: string;
}
interface BackendBooking {
  id: string; bookingNumber: string; userId: string; bookingType: string;
  podId: string | null; roomId: string | null; guestCount: number | null; checkIn: string; checkOut: string;
  hours: number | null; nights: number | null; baseRate: string; subtotal: string; extraCharges: string;
  discount: string; gst: string; total: string; ownerShare: string; naplooShare: string;
  partnerCommission: string; couponCode: string | null; status: string; createdAt: string;
  hotelName?: string;
}
interface BackendInvestor {
  id: string; userId: string; status: string; totalInvested: string | number;
  totalEarned: string | number; totalPodSets: number; createdAt: string;
}
interface BackendPayment {
  id: string; userId: string; bookingId: string | null; amount: string; currency: string;
  status: string; paymentMethod: string | null; razorpayOrderId: string | null;
  razorpayPaymentId: string | null; refundedAmount?: string | null; refundReason?: string | null; createdAt: string;
}
interface BackendPayout {
  id: string; userId: string; payoutType: string; amount: string; tdsDeducted: string;
  netAmount: string; bankAccountNumber: string | null; bankIfsc?: string | null; bankName?: string | null;
  transferId: string | null; transferMode: string | null; status: string; periodStart?: string | null;
  periodEnd?: string | null; createdAt: string; processedAt: string | null;
}
interface OverviewResp {
  totalRevenue: number; naplooRevenue: number; partnerRevenue: number; amountCollected: number;
  totalBookings: number; podBookings: number; roomBookings: number; bookingsByStatus: Record<string, number>;
  totalUsers: number; usersByRole: Record<string, number>; totalPartners: number; activePartners: number;
  pendingPartners: number; totalRooms: number; totalPodSets: number; totalPods: number; averageBookingValue: number;
}

// ─── Adapters → original mock shape ───────────────────────────
function toUser(u: BackendUser): T.AdminUser {
  return {
    id: u.id,
    phone: u.phone,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    role: u.role as T.UserRole,
    status: (u.status === 'active' || u.status === 'pending' ? u.status : (u.status as T.UserStatus)) as T.UserStatus,
    kycStatus: (u.kycStatus === 'not_submitted' ? 'not_started' : u.kycStatus) as T.KycStatus,
    referralCode: '',
    phoneVerified: false,
    emailVerified: false,
    city: u.city || undefined,
    createdAt: u.createdAt,
    totalBookings: 0,
    totalSpent: 0,
  };
}

function toPartner(p: BackendPartner): T.Partner {
  return {
    id: p.id,
    userId: p.userId,
    userName: '',
    businessName: p.businessName,
    businessType: p.businessType as any,
    partnershipModel: p.partnershipModel as any,
    gstNumber: p.gstNumber || undefined,
    address: p.address,
    city: p.city,
    state: p.state,
    pincode: p.pincode,
    contactPerson: p.contactPerson || '',
    contactPhone: p.contactPhone || '',
    contactEmail: p.contactEmail || '',
    commissionPercent: Number(p.commissionPercent) || 0,
    agreementStart: p.agreementStartDate || undefined,
    agreementEnd: p.agreementEndDate || undefined,
    status: p.status as any,
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(p.rating) || 0,
    totalReviews: p.totalReviews || 0,
    totalPods: 0,
    totalRooms: 0,
    monthlyRevenue: 0,
    createdAt: p.createdAt,
  };
}

function toBooking(b: BackendBooking): T.Booking {
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    userId: b.userId,
    userName: '',
    userPhone: '',
    bookingType: b.bookingType as any,
    propertyName: b.hotelName || '-',
    location: '',
    guestCount: b.guestCount || 1,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    hours: b.hours || undefined,
    nights: b.nights || undefined,
    baseRate: Number(b.baseRate),
    subtotal: Number(b.subtotal),
    extraCharges: Number(b.extraCharges),
    discount: Number(b.discount),
    gstAmount: Number(b.gst),
    totalAmount: Number(b.total),
    ownerShare: Number(b.ownerShare),
    naplooShare: Number(b.naplooShare),
    partnerCommission: Number(b.partnerCommission),
    couponCode: b.couponCode || undefined,
    status: b.status as any,
    createdAt: b.createdAt,
  };
}

function toInvestor(i: BackendInvestor, userByIdx: Record<string, BackendUser>): T.Investor {
  const u = userByIdx[i.userId];
  return {
    id: i.id,
    userId: i.userId,
    userName: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '',
    userPhone: u?.phone || '',
    userEmail: u?.email || '',
    status: i.status as any,
    totalInvested: Number(i.totalInvested),
    totalEarned: Number(i.totalEarned),
    totalPodSets: i.totalPodSets,
    kycStatus: 'pending' as T.KycStatus,
    createdAt: i.createdAt,
    investments: [],
  };
}

function toPayment(p: BackendPayment): T.Payment {
  return {
    id: p.id,
    userId: p.userId,
    userName: '',
    bookingId: p.bookingId || '',
    bookingNumber: '',
    amount: Number(p.amount),
    razorpayOrderId: p.razorpayOrderId || undefined,
    razorpayPaymentId: p.razorpayPaymentId || undefined,
    paymentMethod: (p.paymentMethod as any) || 'razorpay',
    status: p.status as any,
    refundAmount: Number(p.refundedAmount || 0),
    refundReason: p.refundReason || undefined,
    createdAt: p.createdAt,
  };
}

function toPayout(p: BackendPayout): T.Payout {
  return {
    id: p.id,
    userId: p.userId,
    userName: '',
    payoutType: p.payoutType as any,
    amount: Number(p.amount),
    tdsAmount: Number(p.tdsDeducted),
    netAmount: Number(p.netAmount),
    bankAccount: p.bankAccountNumber || '',
    bankIfsc: p.bankIfsc || '',
    bankName: p.bankName || '',
    transferId: p.transferId || undefined,
    status: p.status as any,
    periodStart: p.periodStart || '',
    periodEnd: p.periodEnd || '',
    createdAt: p.createdAt,
  };
}

// ─── Zustand store ────────────────────────────────────────────
interface AdminState {
  loading: boolean;
  loadedAt: number | null;
  mockUsers: T.AdminUser[];
  mockPartners: T.Partner[];
  mockBookings: T.Booking[];
  mockPodSets: T.PodSet[];
  mockRooms: T.Room[];
  mockInvestors: T.Investor[];
  mockAssociates: T.Associate[];
  mockPayments: T.Payment[];
  mockPayouts: T.Payout[];
  mockCoupons: T.Coupon[];
  mockTickets: T.SupportTicket[];
  mockApplications: T.Application[];
  mockReviews: T.Review[];
  mockLocations: T.Location[];
  mockCommissions: T.CommissionConfig[];
  mockStaff: T.StaffMember[];
  overview: OverviewResp | null;
  loadAll: () => Promise<void>;
  getDashboardStats: () => {
    totalUsers: string;
    activeBookings: string;
    monthRevenue: string;
    openTickets: string;
    totalPartners: string;
    activeInvestors: string;
    totalPods: string;
    avgOccupancy: string;
    pendingApps: string;
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const r = await api.get<any>(path);
  if (r.error || !r.data) return null;
  return r.data as T;
}


// ── QloApps-parity adapters ──────────────────────────────────
function couponBE(r: any) {
  return {
    id: r.id,
    code: r.code,
    description: r.name || '',
    discountType: (r.kind === 'flat' ? 'flat' : 'percentage') as 'percentage' | 'flat',
    discountValue: Number(r.value || 0),
    minBookingAmount: Number(r.min_amount || 0),
    maxDiscount: Number(r.max_discount || 0),
    usageLimit: Number(r.max_uses || 0),
    timesUsed: Number(r.uses || 0),
    validFrom: r.starts_at || r.created_at,
    validUntil: r.ends_at || r.created_at,
    applicableFor: (r.scope as any) || 'global',
    status: r.status,
    createdAt: r.created_at,
  } as any;
}
function ticketBE(r: any) {
  return {
    id: r.id,
    ticketNumber: r.id.slice(0, 8).toUpperCase(),
    userId: r.user_id || '',
    userName: [r.first_name, r.last_name].filter(Boolean).join(' ') || '—',
    userPhone: r.phone || '',
    subject: r.subject,
    category: 'general' as any,
    priority: r.priority as any,
    status: r.status === 'open' ? 'open' : (r.status === 'resolved' ? 'resolved' : (r.status === 'closed' ? 'closed' : 'in-progress')) as any,
    description: r.body || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  } as any;
}
function reviewBE(r: any) {
  return {
    id: r.id,
    userId: r.user_id || '',
    userName: [r.first_name, r.last_name].filter(Boolean).join(' ') || 'Anonymous',
    bookingId: r.booking_id || '',
    propertyName: r.partner_name || '—',
    location: '',
    rating: Number(r.rating || 0),
    comment: r.body || '',
    title: r.title || '',
    createdAt: r.created_at,
    status: r.status,
  } as any;
}

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export const useAdminData = create<AdminState>((set, get) => ({
  loading: false,
  loadedAt: null,
  mockUsers: [],
  mockPartners: [],
  mockBookings: [],
  mockPodSets: [],
  mockRooms: [],
  mockInvestors: [],
  mockAssociates: [],
  mockPayments: [],
  mockPayouts: [],
  mockCoupons: [],
  mockTickets: [],
  mockApplications: [],
  mockReviews: [],
  mockLocations: [],
  mockCommissions: [],
  mockStaff: [],
  overview: null,

  getDashboardStats: () => {
    const s = get();
    const o = s.overview;
    const activeStatuses = ['confirmed', 'checked_in'];
    const activeBookings = s.mockBookings.filter((b) => activeStatuses.includes(b.status as string)).length;
    const openTickets = s.mockTickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
    const totalRooms = o?.totalRooms ?? 0;
    const totalPods = o?.totalPods ?? 0;
    const activeInvestors = s.mockInvestors.filter((i) => i.status === 'active').length;
    const activePartners = o?.activePartners ?? s.mockPartners.filter((p) => p.status === 'active').length;
    return {
      totalUsers: (o?.totalUsers ?? s.mockUsers.length).toLocaleString('en-IN'),
      activeBookings: String(activeBookings),
      monthRevenue: formatINR(o?.totalRevenue ?? 0),
      openTickets: String(openTickets),
      totalPartners: String(activePartners),
      activeInvestors: String(activeInvestors),
      totalPods: String(totalPods + totalRooms),
      avgOccupancy: totalPods + totalRooms > 0 ? `${Math.round((activeBookings / (totalPods + totalRooms)) * 100)}%` : '—',
      pendingApps: String(s.mockApplications.filter((a) => a.status === 'submitted' || a.status === 'under-review').length),
    };
  },

  loadAll: async () => {
    set({ loading: true });
    const [usersResp, partnersResp, bookingsResp, paymentsResp, payoutsResp, investorsResp, overviewResp, couponsResp, ticketsResp, reviewsResp, refundsResp] = await Promise.all([
      fetchJson<{ users: BackendUser[] }>('/api/v1/admin/users'),
      fetchJson<{ partners: BackendPartner[] }>('/api/v1/admin/partners'),
      fetchJson<{ bookings: BackendBooking[] }>('/api/v1/admin/bookings'),
      fetchJson<{ payments: BackendPayment[] }>('/api/v1/admin/payments'),
      fetchJson<{ payouts: BackendPayout[] }>('/api/v1/admin/payouts'),
      fetchJson<{ investors: BackendInvestor[] }>('/api/v1/admin/investors'),
      fetchJson<{ overview: OverviewResp }>('/api/v1/analytics/overview'),
      fetchJson<{ coupons: any[] }>('/api/v1/admin/coupons'),
      fetchJson<{ tickets: any[] }>('/api/v1/admin/tickets'),
      fetchJson<{ reviews: any[] }>('/api/v1/admin/reviews'),
      fetchJson<{ refunds: any[] }>('/api/v1/admin/refunds'),
    ]);

    const allUsers = usersResp?.users || [];
    const userByIdx: Record<string, BackendUser> = {};
    for (const u of allUsers) userByIdx[u.id] = u;

    set({
      loading: false,
      loadedAt: Date.now(),
      mockUsers: allUsers.map(toUser),
      mockPartners: (partnersResp?.partners || []).map(toPartner),
      mockBookings: (bookingsResp?.bookings || []).map(toBooking),
      mockPayments: (paymentsResp?.payments || []).map(toPayment),
      mockPayouts: (payoutsResp?.payouts || []).map(toPayout),
      mockInvestors: (investorsResp?.investors || []).map((i) => toInvestor(i, userByIdx)),
      overview: overviewResp?.overview || null,
      // The following tables don't have admin endpoints yet — leave empty so the
      // tab shows a clean empty state instead of stale fake rows.
      mockPodSets: [],
      mockRooms: [],
      mockAssociates: [],
      mockCoupons: (couponsResp?.coupons || []).map(couponBE),
      mockTickets: (ticketsResp?.tickets || []).map(ticketBE),
      mockApplications: [],
      mockReviews: (reviewsResp?.reviews || []).map(reviewBE),
      mockLocations: [],
      mockCommissions: [],
      mockStaff: [],
    });
  },
}));

// ─── Backwards-compatible static exports (initially empty) ────
// Allow `import * as D from './data'` in legacy spots; views that call the
// hook get reactive data instead.
export const mockUsers: T.AdminUser[] = [];
export const mockPartners: T.Partner[] = [];
export const mockBookings: T.Booking[] = [];
export const mockPodSets: T.PodSet[] = [];
export const mockRooms: T.Room[] = [];
export const mockInvestors: T.Investor[] = [];
export const mockAssociates: T.Associate[] = [];
export const mockPayments: T.Payment[] = [];
export const mockPayouts: T.Payout[] = [];
export const mockCoupons: T.Coupon[] = [];
export const mockTickets: T.SupportTicket[] = [];
export const mockApplications: T.Application[] = [];
export const mockReviews: T.Review[] = [];
export const mockLocations: T.Location[] = [];
export const mockCommissions: T.CommissionConfig[] = [];
export const mockStaff: T.StaffMember[] = [];
