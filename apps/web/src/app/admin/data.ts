// ============================
// ADMIN MOCK DATA
// Aligned to actual DB schema
// Replace with API calls when backend services are built
// ============================

import type * as T from './types';

// ---- USERS ----
export const mockUsers: T.AdminUser[] = [
  { id: 'U001', phone: '+91 98765 43210', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@email.com', role: 'customer', status: 'active', kycStatus: 'verified', city: 'Mumbai', state: 'Maharashtra', referralCode: 'NAP-RS001', phoneVerified: true, emailVerified: true, createdAt: '2025-10-15', lastActive: '2026-03-18', totalBookings: 12, totalSpent: 8400 },
  { id: 'U002', phone: '+91 87654 32109', firstName: 'Priya', lastName: 'Singh', email: 'priya@email.com', role: 'customer', status: 'active', kycStatus: 'not_started', city: 'Delhi', state: 'Delhi', referralCode: 'NAP-PS002', phoneVerified: true, emailVerified: false, createdAt: '2025-11-20', lastActive: '2026-03-17', totalBookings: 8, totalSpent: 4500 },
  { id: 'U003', phone: '+91 76543 21098', firstName: 'Amit', lastName: 'Patel', email: 'amit@email.com', role: 'partner', status: 'active', kycStatus: 'verified', city: 'Ahmedabad', state: 'Gujarat', referralCode: 'NAP-AP003', phoneVerified: true, emailVerified: true, createdAt: '2025-09-01', lastActive: '2026-03-18', totalBookings: 0, totalSpent: 0 },
  { id: 'U004', phone: '+91 65432 10987', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@email.com', role: 'investor', status: 'active', kycStatus: 'verified', panNumber: 'ABCDE1234F', aadharNumber: '****5678', bankAccount: '****3456', city: 'Hyderabad', state: 'Telangana', referralCode: 'NAP-SR004', phoneVerified: true, emailVerified: true, createdAt: '2025-12-01', lastActive: '2026-03-16', totalBookings: 2, totalSpent: 1200 },
  { id: 'U005', phone: '+91 54321 09876', firstName: 'Vikram', lastName: 'Kumar', email: 'vikram@email.com', role: 'associate', status: 'active', kycStatus: 'pending', city: 'Chennai', state: 'Tamil Nadu', referralCode: 'NAP-VK005', phoneVerified: true, emailVerified: true, createdAt: '2025-11-10', lastActive: '2026-03-18', totalBookings: 5, totalSpent: 3200 },
  { id: 'U006', phone: '+91 43210 98765', firstName: 'Neha', lastName: 'Gupta', email: 'neha@email.com', role: 'customer', status: 'suspended', kycStatus: 'rejected', city: 'Pune', state: 'Maharashtra', referralCode: 'NAP-NG006', phoneVerified: true, emailVerified: false, createdAt: '2026-01-05', totalBookings: 1, totalSpent: 450 },
  { id: 'U007', phone: '+91 32109 87654', firstName: 'Admin', lastName: 'Naploo', email: 'admin@naploo.com', role: 'super_admin', status: 'active', kycStatus: 'verified', city: 'Mumbai', state: 'Maharashtra', referralCode: 'NAP-ADM', phoneVerified: true, emailVerified: true, createdAt: '2025-08-01', lastActive: '2026-03-18', totalBookings: 0, totalSpent: 0 },
  { id: 'U008', phone: '+91 21098 76543', firstName: 'Karthik', lastName: 'M', email: 'karthik@email.com', role: 'customer', status: 'active', kycStatus: 'not_started', city: 'Bangalore', state: 'Karnataka', referralCode: 'NAP-KM008', phoneVerified: true, emailVerified: true, createdAt: '2026-01-20', lastActive: '2026-03-15', totalBookings: 3, totalSpent: 1800 },
];

// ---- PARTNERS ----
export const mockPartners: T.Partner[] = [
  { id: 'P001', userId: 'U003', userName: 'Amit Patel', businessName: 'Mumbai International Airport Ltd', businessType: 'hotel', partnershipModel: 'without_investment', gstNumber: '27AADCM1234E1Z5', city: 'Mumbai', state: 'Maharashtra', address: 'Terminal 2, Chhatrapati Shivaji Airport', pincode: '400099', contactPerson: 'Rajesh Menon', contactPhone: '+91 99887 76655', contactEmail: 'rajesh@mial.in', commissionPercent: 15, agreementStart: '2025-10-01', agreementEnd: '2027-10-01', status: 'active', amenities: ['WiFi', 'AC', 'TV', 'Charging'], images: [], rating: 4.7, totalReviews: 342, totalPods: 45, totalRooms: 12, monthlyRevenue: 542000, createdAt: '2025-09-15' },
  { id: 'P002', userId: 'U009', userName: 'Suresh R', businessName: 'Indian Railways Hospitality', businessType: 'hotel', partnershipModel: 'without_investment', gstNumber: '07AABCI5678M2ZK', city: 'New Delhi', state: 'Delhi', address: 'Platform 1, New Delhi Railway Station', pincode: '110001', contactPerson: 'Suresh R', contactPhone: '+91 88776 65544', contactEmail: 'suresh@irctc.com', commissionPercent: 12, agreementStart: '2025-11-01', agreementEnd: '2027-11-01', status: 'active', amenities: ['WiFi', 'AC', 'Charging'], images: [], rating: 4.3, totalReviews: 198, totalPods: 32, totalRooms: 8, monthlyRevenue: 318000, createdAt: '2025-10-20' },
  { id: 'P003', userId: 'U010', userName: 'Kavitha N', businessName: 'BIAL Airports Ltd', businessType: 'hotel', partnershipModel: 'with_investment', gstNumber: '29AABCB9012L3ZP', city: 'Bangalore', state: 'Karnataka', address: 'Kempegowda International Airport T1', pincode: '560300', contactPerson: 'Kavitha N', contactPhone: '+91 77665 54433', contactEmail: 'kavitha@bial.aero', commissionPercent: 18, agreementStart: '2025-12-01', agreementEnd: '2027-12-01', status: 'active', amenities: ['WiFi', 'AC', 'TV', 'Charging', 'Locker'], images: [], rating: 4.8, totalReviews: 267, totalPods: 28, totalRooms: 6, monthlyRevenue: 386000, createdAt: '2025-11-25' },
  { id: 'P004', userId: 'U011', userName: 'Deepak M', businessName: 'Phoenix MarketCity', businessType: 'homestay', partnershipModel: 'without_investment', city: 'Pune', state: 'Maharashtra', address: 'Viman Nagar, Phoenix MarketCity', pincode: '411014', contactPerson: 'Deepak M', contactPhone: '+91 66554 43322', contactEmail: 'deepak@phoenix.in', commissionPercent: 20, status: 'pending', amenities: ['WiFi', 'AC'], images: [], rating: 0, totalReviews: 0, totalPods: 0, totalRooms: 0, monthlyRevenue: 0, createdAt: '2026-03-10' },
  { id: 'P005', userId: 'U012', userName: 'Anita S', businessName: 'Sunrise Hotels Group', businessType: 'hotel', partnershipModel: 'with_investment', city: 'Chennai', state: 'Tamil Nadu', address: 'Chennai Central Station', pincode: '600003', contactPerson: 'Anita S', contactPhone: '+91 55443 32211', contactEmail: 'anita@sunrise.in', commissionPercent: 15, agreementStart: '2026-01-01', agreementEnd: '2028-01-01', status: 'active', amenities: ['WiFi', 'AC', 'TV', 'Charging'], images: [], rating: 4.5, totalReviews: 89, totalPods: 20, totalRooms: 10, monthlyRevenue: 195000, createdAt: '2025-12-15' },
];

// ---- BOOKINGS ----
export const mockBookings: T.Booking[] = [
  { id: 'B001', bookingNumber: 'BK-4521', userId: 'U001', userName: 'Rahul Sharma', userPhone: '+91 98765 43210', bookingType: 'pod', propertyName: 'MIAL Airport Pods', location: 'Mumbai T2', guestCount: 1, checkIn: '2026-03-18 14:00', checkOut: '2026-03-18 18:00', hours: 4, baseRate: 200, subtotal: 800, extraCharges: 0, discount: 0, gstAmount: 96, totalAmount: 896, ownerShare: 538, naplooShare: 358, partnerCommission: 134, status: 'confirmed', createdAt: '2026-03-18 10:30' },
  { id: 'B002', bookingNumber: 'BK-4520', userId: 'U002', userName: 'Priya Singh', userPhone: '+91 87654 32109', bookingType: 'pod', propertyName: 'Delhi Station Pods', location: 'Delhi Station', guestCount: 1, checkIn: '2026-03-18 10:00', checkOut: '2026-03-18 14:00', hours: 4, baseRate: 150, subtotal: 600, extraCharges: 0, discount: 150, gstAmount: 54, totalAmount: 504, ownerShare: 302, naplooShare: 202, partnerCommission: 60, couponCode: 'FIRST50', status: 'checked_in', createdAt: '2026-03-18 08:00' },
  { id: 'B003', bookingNumber: 'BK-4519', userId: 'U008', userName: 'Karthik M', userPhone: '+91 21098 76543', bookingType: 'room', propertyName: 'BIAL Airport Stay', location: 'BLR Airport', guestCount: 2, guestNames: 'Karthik M, Ravi K', checkIn: '2026-03-17 22:00', checkOut: '2026-03-18 08:00', nights: 1, baseRate: 2500, subtotal: 2500, extraCharges: 500, discount: 0, gstAmount: 360, totalAmount: 3360, ownerShare: 2016, naplooShare: 1344, partnerCommission: 605, status: 'checked_out', createdAt: '2026-03-17 20:00' },
  { id: 'B004', bookingNumber: 'BK-4518', userId: 'U004', userName: 'Sneha Reddy', userPhone: '+91 65432 10987', bookingType: 'pod', propertyName: 'Hyderabad Hub Pods', location: 'Hyderabad RGI', guestCount: 1, checkIn: '2026-03-18 16:00', checkOut: '2026-03-18 20:00', hours: 4, baseRate: 225, subtotal: 900, extraCharges: 0, discount: 0, gstAmount: 108, totalAmount: 1008, ownerShare: 605, naplooShare: 403, partnerCommission: 151, status: 'confirmed', createdAt: '2026-03-18 12:00' },
  { id: 'B005', bookingNumber: 'BK-4517', userId: 'U008', userName: 'Karthik M', userPhone: '+91 21098 76543', bookingType: 'pod', propertyName: 'Chennai Central Pods', location: 'Chennai Central', guestCount: 1, checkIn: '2026-03-17 06:00', checkOut: '2026-03-17 10:00', hours: 4, baseRate: 175, subtotal: 700, extraCharges: 0, discount: 350, gstAmount: 42, totalAmount: 392, ownerShare: 235, naplooShare: 157, partnerCommission: 59, couponCode: 'NAPLOO50', status: 'cancelled', createdAt: '2026-03-16 22:00' },
  { id: 'B006', bookingNumber: 'BK-4516', userId: 'U001', userName: 'Rahul Sharma', userPhone: '+91 98765 43210', bookingType: 'room', propertyName: 'MIAL Airport Stay', location: 'Mumbai T2', guestCount: 1, checkIn: '2026-03-18 20:00', checkOut: '2026-03-19 08:00', nights: 1, baseRate: 3500, subtotal: 3500, extraCharges: 0, discount: 0, gstAmount: 420, totalAmount: 3920, ownerShare: 2352, naplooShare: 1568, partnerCommission: 588, status: 'pending', createdAt: '2026-03-18 15:00' },
  { id: 'B007', bookingNumber: 'BK-4515', userId: 'U002', userName: 'Priya Singh', userPhone: '+91 87654 32109', bookingType: 'pod', propertyName: 'Delhi Station Pods', location: 'Delhi Station', guestCount: 1, checkIn: '2026-03-16 12:00', checkOut: '2026-03-16 16:00', hours: 4, baseRate: 150, subtotal: 600, extraCharges: 0, discount: 0, gstAmount: 72, totalAmount: 672, ownerShare: 403, naplooShare: 269, partnerCommission: 81, status: 'checked_out', createdAt: '2026-03-16 09:00' },
];

// ---- POD SETS ----
export const mockPodSets: T.PodSet[] = [
  { id: 'PS001', partnerId: 'P001', partnerName: 'MIAL Airport', ownership: 'naploo', series: 'NapPro', floor: 1, section: 'A', setNumber: 1, hourlyRate: 200, totalPods: 8, availablePods: 5, location: 'Mumbai T2', ownerName: 'Naploo' },
  { id: 'PS002', partnerId: 'P001', partnerName: 'MIAL Airport', ownerId: 'INV001', ownerName: 'Sneha Reddy', ownership: 'investor', series: 'NapLux', floor: 1, section: 'B', setNumber: 2, hourlyRate: 300, totalPods: 8, availablePods: 6, location: 'Mumbai T2' },
  { id: 'PS003', partnerId: 'P002', partnerName: 'Indian Railways', ownership: 'naploo', series: 'NapEco', floor: 0, section: 'A', setNumber: 1, hourlyRate: 150, totalPods: 8, availablePods: 3, location: 'Delhi Station', ownerName: 'Naploo' },
  { id: 'PS004', partnerId: 'P002', partnerName: 'Indian Railways', ownership: 'partner', series: 'NapZen', floor: 0, section: 'B', setNumber: 2, hourlyRate: 175, totalPods: 8, availablePods: 7, location: 'Delhi Station', ownerName: 'Indian Railways' },
  { id: 'PS005', partnerId: 'P003', partnerName: 'BIAL Airports', ownerId: 'INV002', ownerName: 'Rohit D', ownership: 'investor', series: 'NapPro', floor: 2, section: 'A', setNumber: 1, hourlyRate: 225, totalPods: 8, availablePods: 4, location: 'BLR Airport' },
  { id: 'PS006', partnerId: 'P005', partnerName: 'Sunrise Hotels', ownership: 'naploo', series: 'NapAir', floor: 1, section: 'A', setNumber: 1, hourlyRate: 175, totalPods: 8, availablePods: 6, location: 'Chennai Central', ownerName: 'Naploo' },
];

// ---- ROOMS ----
export const mockRooms: T.Room[] = [
  { id: 'R001', partnerId: 'P001', partnerName: 'MIAL Airport', roomNumber: '101', name: 'Standard Single', roomType: 'standard', floor: 1, maxGuests: 1, bedType: 'single', numBeds: 1, areaSqFt: 150, dailyRate: 2500, extraGuestCharge: 500, status: 'available', amenities: ['WiFi', 'AC', 'TV'], images: [], location: 'Mumbai T2' },
  { id: 'R002', partnerId: 'P001', partnerName: 'MIAL Airport', roomNumber: '102', name: 'Deluxe Double', roomType: 'deluxe', floor: 1, maxGuests: 2, bedType: 'double', numBeds: 1, areaSqFt: 250, dailyRate: 3500, extraGuestCharge: 750, status: 'occupied', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], images: [], location: 'Mumbai T2' },
  { id: 'R003', partnerId: 'P003', partnerName: 'BIAL Airports', roomNumber: '201', name: 'Premium Suite', roomType: 'suite', floor: 2, maxGuests: 3, bedType: 'king', numBeds: 1, areaSqFt: 400, dailyRate: 6000, weeklyRate: 35000, extraGuestCharge: 1000, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Locker', 'Shower'], images: [], location: 'BLR Airport' },
  { id: 'R004', partnerId: 'P005', partnerName: 'Sunrise Hotels', roomNumber: '301', name: 'Family Room', roomType: 'family', floor: 3, maxGuests: 4, bedType: 'queen', numBeds: 2, areaSqFt: 350, dailyRate: 4500, extraGuestCharge: 800, status: 'maintenance', amenities: ['WiFi', 'AC', 'TV'], images: [], location: 'Chennai Central' },
];

// ---- INVESTORS ----
export const mockInvestors: T.Investor[] = [
  { id: 'INV001', userId: 'U004', userName: 'Sneha Reddy', userPhone: '+91 65432 10987', userEmail: 'sneha@email.com', status: 'active', totalInvested: 450000, totalEarned: 128000, totalPodSets: 1, kycStatus: 'verified', createdAt: '2025-12-01', investments: [
    { id: 'I001', investorId: 'INV001', podSetId: 'PS002', invoiceNumber: 'INV-2025-001', podSetCount: 1, totalAmount: 450000, deliveryOption: 'leaseback', guaranteeProgress: 42, contractStart: '2026-01-01', contractEnd: '2029-01-01', monthlyEarnings: 18500, cumulativeEarnings: 128000, status: 'active' },
  ]},
  { id: 'INV002', userId: 'U013', userName: 'Rohit Deshmukh', userPhone: '+91 44332 21100', userEmail: 'rohit@email.com', status: 'active', totalInvested: 900000, totalEarned: 245000, totalPodSets: 2, kycStatus: 'verified', createdAt: '2025-10-15', investments: [
    { id: 'I002', investorId: 'INV002', podSetId: 'PS005', invoiceNumber: 'INV-2025-002', podSetCount: 2, totalAmount: 900000, deliveryOption: 'leaseback', guaranteeProgress: 55, contractStart: '2025-11-01', contractEnd: '2028-11-01', monthlyEarnings: 35200, cumulativeEarnings: 245000, status: 'active' },
  ]},
  { id: 'INV003', userId: 'U014', userName: 'Meera Patel', userPhone: '+91 33221 10099', userEmail: 'meera@email.com', status: 'kyc_pending', totalInvested: 0, totalEarned: 0, totalPodSets: 0, kycStatus: 'pending', createdAt: '2026-03-12', investments: [] },
];

// ---- ASSOCIATES ----
export const mockAssociates: T.Associate[] = [
  { id: 'A001', userId: 'U005', userName: 'Vikram Kumar', userPhone: '+91 54321 09876', level: 1, totalReferrals: 18, totalEarnings: 42000, pendingPayout: 8500, directReferrals: 8, status: 'active', createdAt: '2025-11-10' },
  { id: 'A002', userId: 'U015', userName: 'Arjun S', userPhone: '+91 22110 09988', level: 1, parentId: 'A001', parentName: 'Vikram Kumar', totalReferrals: 6, totalEarnings: 15000, pendingPayout: 3200, directReferrals: 4, status: 'active', createdAt: '2025-12-05' },
  { id: 'A003', userId: 'U016', userName: 'Divya Shah', userPhone: '+91 11009 98877', level: 2, parentId: 'A002', parentName: 'Arjun S', totalReferrals: 3, totalEarnings: 6500, pendingPayout: 1800, directReferrals: 3, status: 'active', createdAt: '2026-01-15' },
];

// ---- PAYMENTS ----
export const mockPayments: T.Payment[] = [
  { id: 'PAY001', userId: 'U001', userName: 'Rahul Sharma', bookingId: 'B001', bookingNumber: 'BK-4521', amount: 896, razorpayOrderId: 'order_M1234AbC', razorpayPaymentId: 'pay_N5678DeF', paymentMethod: 'upi', status: 'completed', createdAt: '2026-03-18 10:32' },
  { id: 'PAY002', userId: 'U002', userName: 'Priya Singh', bookingId: 'B002', bookingNumber: 'BK-4520', amount: 504, razorpayOrderId: 'order_M1235AbD', razorpayPaymentId: 'pay_N5679DeG', paymentMethod: 'card', status: 'completed', createdAt: '2026-03-18 08:05' },
  { id: 'PAY003', userId: 'U008', userName: 'Karthik M', bookingId: 'B003', bookingNumber: 'BK-4519', amount: 3360, razorpayOrderId: 'order_M1236AbE', razorpayPaymentId: 'pay_N5680DeH', paymentMethod: 'card', status: 'completed', createdAt: '2026-03-17 20:05' },
  { id: 'PAY004', userId: 'U008', userName: 'Karthik M', bookingId: 'B005', bookingNumber: 'BK-4517', amount: 392, paymentMethod: 'upi', status: 'refunded', refundAmount: 392, refundReason: 'Booking cancelled by user', createdAt: '2026-03-16 22:05' },
  { id: 'PAY005', userId: 'U004', userName: 'Sneha Reddy', bookingId: 'B004', bookingNumber: 'BK-4518', amount: 1008, razorpayOrderId: 'order_M1238AbG', razorpayPaymentId: 'pay_N5682DeJ', paymentMethod: 'wallet', status: 'completed', createdAt: '2026-03-18 12:02' },
];

// ---- PAYOUTS ----
export const mockPayouts: T.Payout[] = [
  { id: 'PO001', userId: 'U003', userName: 'Amit Patel (MIAL)', payoutType: 'partner', amount: 120000, tdsAmount: 12000, netAmount: 108000, bankAccount: '****3456', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', transferId: 'NEFT-20260315-001', status: 'completed', periodStart: '2026-02-01', periodEnd: '2026-02-28', createdAt: '2026-03-05' },
  { id: 'PO002', userId: 'U004', userName: 'Sneha Reddy', payoutType: 'investor', amount: 18500, tdsAmount: 1850, netAmount: 16650, bankAccount: '****5678', bankIfsc: 'ICIC0005678', bankName: 'ICICI Bank', status: 'processing', periodStart: '2026-02-01', periodEnd: '2026-02-28', createdAt: '2026-03-10' },
  { id: 'PO003', userId: 'U005', userName: 'Vikram Kumar', payoutType: 'associate', amount: 8500, tdsAmount: 850, netAmount: 7650, bankAccount: '****7890', bankIfsc: 'SBIN0007890', bankName: 'SBI', status: 'pending', periodStart: '2026-02-01', periodEnd: '2026-02-28', createdAt: '2026-03-12' },
  { id: 'PO004', userId: 'U013', userName: 'Rohit Deshmukh', payoutType: 'investor', amount: 35200, tdsAmount: 3520, netAmount: 31680, bankAccount: '****2345', bankIfsc: 'HDFC0009012', bankName: 'HDFC Bank', transferId: 'NEFT-20260315-002', status: 'completed', periodStart: '2026-02-01', periodEnd: '2026-02-28', createdAt: '2026-03-05' },
];

// ---- COUPONS ----
export const mockCoupons: T.Coupon[] = [
  { id: 'C001', code: 'FIRST50', description: '50% off on first booking', discountType: 'percentage', discountValue: 50, minBookingAmount: 200, maxDiscount: 500, usageLimit: 1, usedCount: 847, validFrom: '2025-10-01', validTo: '2026-12-31', status: 'active', applicableTypes: ['pod', 'room'] },
  { id: 'C002', code: 'NAPLOO50', description: 'Flat ₹50 off', discountType: 'flat', discountValue: 50, minBookingAmount: 300, maxDiscount: 50, usageLimit: 3, usedCount: 2134, validFrom: '2025-10-01', validTo: '2026-06-30', status: 'active', applicableTypes: ['pod'] },
  { id: 'C003', code: 'POD200', description: '₹200 off on pod bookings', discountType: 'flat', discountValue: 200, minBookingAmount: 500, maxDiscount: 200, usageLimit: 1, usedCount: 456, validFrom: '2025-12-01', validTo: '2026-03-31', status: 'active', applicableTypes: ['pod'] },
  { id: 'C004', code: 'ROOMNIGHT', description: '20% off room bookings', discountType: 'percentage', discountValue: 20, minBookingAmount: 2000, maxDiscount: 1000, usageLimit: 2, usedCount: 189, validFrom: '2026-01-01', validTo: '2026-06-30', status: 'active', applicableTypes: ['room'] },
  { id: 'C005', code: 'TRAVEL15', description: '15% off all bookings', discountType: 'percentage', discountValue: 15, minBookingAmount: 400, maxDiscount: 300, usageLimit: 2, usedCount: 1567, validFrom: '2025-11-01', validTo: '2026-09-30', status: 'active', applicableTypes: ['pod', 'room'] },
  { id: 'C006', code: 'SUMMER2025', description: 'Summer sale - 30% off', discountType: 'percentage', discountValue: 30, minBookingAmount: 300, maxDiscount: 600, usageLimit: 1, usedCount: 3421, validFrom: '2025-04-01', validTo: '2025-08-31', status: 'expired', applicableTypes: ['pod', 'room'] },
];

// ---- TICKETS ----
export const mockTickets: T.SupportTicket[] = [
  { id: 'T001', ticketNumber: 'TK-1087', userId: 'U008', userName: 'Karthik M', userPhone: '+91 21098 76543', subject: 'AC not working in Pod #12', category: 'pod', priority: 'urgent', status: 'open', bookingId: 'B003', assignee: 'Support Team A', messages: 3, lastReply: '2026-03-18 14:30', createdAt: '2026-03-18 13:00' },
  { id: 'T002', ticketNumber: 'TK-1086', userId: 'U002', userName: 'Priya Singh', userPhone: '+91 87654 32109', subject: 'Refund delay for booking BK-4517', category: 'booking', priority: 'high', status: 'in-progress', bookingId: 'B005', assignee: 'Finance Team', messages: 5, lastReply: '2026-03-18 11:00', createdAt: '2026-03-18 09:00' },
  { id: 'T003', ticketNumber: 'TK-1085', userId: 'U001', userName: 'Rahul Sharma', userPhone: '+91 98765 43210', subject: 'App crashing on booking confirmation', category: 'technical', priority: 'medium', status: 'open', messages: 2, createdAt: '2026-03-17 16:00' },
  { id: 'T004', ticketNumber: 'TK-1084', userId: 'U004', userName: 'Sneha Reddy', userPhone: '+91 65432 10987', subject: 'Wrong pod assigned for my booking', category: 'booking', priority: 'high', status: 'resolved', bookingId: 'B004', assignee: 'Ops Team', messages: 7, lastReply: '2026-03-17 14:00', createdAt: '2026-03-17 08:00', resolvedAt: '2026-03-17 14:00' },
  { id: 'T005', ticketNumber: 'TK-1083', userId: 'U006', userName: 'Neha Gupta', userPhone: '+91 43210 98765', subject: 'WiFi connectivity issue at Chennai', category: 'pod', priority: 'medium', status: 'resolved', assignee: 'Tech Team', messages: 4, resolvedAt: '2026-03-16 18:00', createdAt: '2026-03-16 10:00' },
  { id: 'T006', ticketNumber: 'TK-1082', userId: 'U005', userName: 'Vikram Kumar', userPhone: '+91 54321 09876', subject: 'Cannot access account after phone change', category: 'account', priority: 'low', status: 'closed', assignee: 'Support Team B', messages: 3, resolvedAt: '2026-03-15 12:00', createdAt: '2026-03-15 09:00' },
];

// ---- APPLICATIONS ----
export const mockApplications: T.Application[] = [
  { id: 'AP001', applicationNumber: 'APP-3015', type: 'partner', businessName: 'Horizon Hotels Pvt Ltd', contactPerson: 'Rajesh Agarwal', contactEmail: 'rajesh@horizonhotels.in', contactPhone: '+91 99887 76644', city: 'Pune', state: 'Maharashtra', businessType: 'hotel', gstNumber: '27AABCH1234D1ZL', expectedPods: '10-25', message: 'We have a prime location near Pune station with 500 sqft available.', status: 'under-review', createdAt: '2026-03-16' },
  { id: 'AP002', applicationNumber: 'APP-3014', type: 'investor', businessName: 'RedBrick Infrastructure', contactPerson: 'Sunita Jain', contactEmail: 'sunita@redbrick.in', contactPhone: '+91 88776 65533', city: 'Delhi', state: 'Delhi', investmentRange: '₹10L - ₹25L', expectedPods: '2-5 sets', message: 'Looking to invest in pod sets for airport deployment.', status: 'under-review', createdAt: '2026-03-15' },
  { id: 'AP003', applicationNumber: 'APP-3013', type: 'franchise', businessName: 'TravelHub Co.', contactPerson: 'Deepak Menon', contactEmail: 'deepak@travelhub.co', contactPhone: '+91 77665 54422', city: 'Bangalore', state: 'Karnataka', expectedPods: '50+', message: 'Want to bring Naploo franchise to Bangalore tech parks.', status: 'submitted', createdAt: '2026-03-13' },
  { id: 'AP004', applicationNumber: 'APP-3012', type: 'partner', businessName: 'Sunrise Hotels', contactPerson: 'Kavita Shah', contactEmail: 'kavita@sunrise.in', contactPhone: '+91 66554 43311', city: 'Mumbai', state: 'Maharashtra', businessType: 'hotel', expectedPods: '5-10', status: 'approved', reviewNotes: 'Strong location near BKC. Approved for onboarding.', createdAt: '2026-03-10' },
  { id: 'AP005', applicationNumber: 'APP-3011', type: 'partner', businessName: 'Metro Spaces', contactPerson: 'Anil Kumar', contactEmail: 'anil@metrospaces.in', contactPhone: '+91 55443 32200', city: 'Chennai', state: 'Tamil Nadu', businessType: 'homestay', expectedPods: '5-10', status: 'rejected', reviewNotes: 'Location does not meet minimum footfall requirements.', createdAt: '2026-03-08' },
];

// ---- REVIEWS ----
export const mockReviews: T.Review[] = [
  { id: 'RV001', userId: 'U001', userName: 'Rahul Sharma', bookingId: 'B001', propertyName: 'MIAL Airport Pods', location: 'Mumbai T2', rating: 5, comment: 'Amazing experience! Super clean and futuristic pod. The AC and privacy were perfect for a quick nap before my flight.', status: 'published', createdAt: '2026-03-17' },
  { id: 'RV002', userId: 'U002', userName: 'Priya Singh', bookingId: 'B002', propertyName: 'Delhi Station Pods', location: 'Delhi Station', rating: 4, comment: 'Good experience overall. WiFi speed could be improved. Loved the app for booking!', status: 'published', createdAt: '2026-03-16' },
  { id: 'RV003', userId: 'U008', userName: 'Karthik M', bookingId: 'B003', propertyName: 'BIAL Airport Stay', location: 'BLR Airport', rating: 2, comment: 'AC was barely working. Very disappointed for the price paid. Need better maintenance.', status: 'flagged', createdAt: '2026-03-15' },
  { id: 'RV004', userId: 'U004', userName: 'Sneha Reddy', bookingId: 'B004', propertyName: 'Hyderabad Hub Pods', location: 'Hyderabad RGI', rating: 5, comment: 'Best transit rest experience! Will definitely book again. The pod was spotless.', status: 'published', createdAt: '2026-03-14' },
  { id: 'RV005', userId: 'U006', userName: 'Neha Gupta', bookingId: 'B007', propertyName: 'Delhi Station Pods', location: 'Delhi Station', rating: 1, comment: 'Terrible experience. Abusive language used. Filing formal complaint.', status: 'flagged', createdAt: '2026-03-13' },
];

// ---- LOCATIONS ----
export const mockLocations: T.Location[] = [
  { id: 'L001', name: 'Mumbai Airport T2', city: 'Mumbai', state: 'Maharashtra', type: 'airport', partnerId: 'P001', partnerName: 'MIAL Airport', totalPods: 45, totalRooms: 12, occupancyRate: 87, monthlyRevenue: 542000, status: 'active', latitude: 19.0896, longitude: 72.8656 },
  { id: 'L002', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', type: 'railway', partnerId: 'P002', partnerName: 'Indian Railways', totalPods: 32, totalRooms: 8, occupancyRate: 72, monthlyRevenue: 318000, status: 'active', latitude: 28.6423, longitude: 77.2199 },
  { id: 'L003', name: 'Kempegowda Intl Airport', city: 'Bangalore', state: 'Karnataka', type: 'airport', partnerId: 'P003', partnerName: 'BIAL Airports', totalPods: 28, totalRooms: 6, occupancyRate: 91, monthlyRevenue: 386000, status: 'active', latitude: 13.1989, longitude: 77.7068 },
  { id: 'L004', name: 'Chennai Central Station', city: 'Chennai', state: 'Tamil Nadu', type: 'railway', partnerId: 'P005', partnerName: 'Sunrise Hotels', totalPods: 20, totalRooms: 10, occupancyRate: 65, monthlyRevenue: 195000, status: 'active', latitude: 13.0836, longitude: 80.2750 },
  { id: 'L005', name: 'Rajiv Gandhi Intl Airport', city: 'Hyderabad', state: 'Telangana', type: 'airport', partnerId: 'P006', partnerName: 'GHIAL', totalPods: 15, totalRooms: 4, occupancyRate: 78, monthlyRevenue: 156000, status: 'active', latitude: 17.2403, longitude: 78.4294 },
  { id: 'L006', name: 'Phoenix MarketCity', city: 'Pune', state: 'Maharashtra', type: 'mall', partnerId: 'P004', partnerName: 'Phoenix MarketCity', totalPods: 0, totalRooms: 0, occupancyRate: 0, monthlyRevenue: 0, status: 'setup' },
];

// ---- COMMISSION CONFIG ----
export const mockCommissions: T.CommissionConfig[] = [
  { id: 'CC001', referralType: 'hotel', level1Percent: 10, level2Percent: 5, level3Percent: 3, level4Percent: 2, level5Percent: 1, oneTimeBonus: 5000 },
  { id: 'CC002', referralType: 'homestay', level1Percent: 12, level2Percent: 6, level3Percent: 3, level4Percent: 2, level5Percent: 1, oneTimeBonus: 3000 },
  { id: 'CC003', referralType: 'space', level1Percent: 8, level2Percent: 4, level3Percent: 2, level4Percent: 1, level5Percent: 0.5, oneTimeBonus: 2000 },
  { id: 'CC004', referralType: 'investor', level1Percent: 5, level2Percent: 3, level3Percent: 2, level4Percent: 1, level5Percent: 0.5, oneTimeBonus: 10000 },
  { id: 'CC005', referralType: 'customer', level1Percent: 3, level2Percent: 1.5, level3Percent: 1, level4Percent: 0.5, level5Percent: 0, oneTimeBonus: 100 },
  { id: 'CC006', referralType: 'associate', level1Percent: 15, level2Percent: 8, level3Percent: 5, level4Percent: 3, level5Percent: 1, oneTimeBonus: 1000 },
];

// ---- STAFF ----
export const mockStaff: T.StaffMember[] = [
  { id: 'S001', name: 'Arun Mehta', email: 'arun@naploo.com', phone: '+91 99887 76601', role: 'operations_manager', location: 'Mumbai', status: 'active', joinedAt: '2025-09-01' },
  { id: 'S002', name: 'Divya Sharma', email: 'divya@naploo.com', phone: '+91 99887 76602', role: 'support_lead', location: 'Delhi', status: 'active', joinedAt: '2025-09-15' },
  { id: 'S003', name: 'Prasad K', email: 'prasad@naploo.com', phone: '+91 99887 76603', role: 'maintenance', location: 'Bangalore', status: 'active', joinedAt: '2025-10-01' },
  { id: 'S004', name: 'Neha Gupta', email: 'neha.g@naploo.com', phone: '+91 99887 76604', role: 'partner_relations', location: 'Pune', status: 'on-leave', joinedAt: '2025-11-01' },
  { id: 'S005', name: 'Ravi Shankar', email: 'ravi@naploo.com', phone: '+91 99887 76605', role: 'finance', location: 'Mumbai', status: 'active', joinedAt: '2025-10-15' },
  { id: 'S006', name: 'Sahil Kapoor', email: 'sahil@naploo.com', phone: '+91 99887 76606', role: 'tech', location: 'Bangalore', status: 'active', joinedAt: '2025-12-01' },
];

// ---- DASHBOARD STATS (computed) ----
export function getDashboardStats() {
  const totalUsers = mockUsers.length;
  const activeBookings = mockBookings.filter(b => ['confirmed', 'checked_in', 'pending'].includes(b.status)).length;
  const todayRevenue = mockBookings.filter(b => b.createdAt.startsWith('2026-03-18') && b.status !== 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0);
  const monthRevenue = mockBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0);
  const openTickets = mockTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const pendingApps = mockApplications.filter(a => a.status === 'submitted' || a.status === 'under-review').length;
  const totalPods = mockPodSets.reduce((sum, ps) => sum + ps.totalPods, 0);
  const availPods = mockPodSets.reduce((sum, ps) => sum + ps.availablePods, 0);
  const avgOccupancy = mockLocations.filter(l => l.status === 'active').reduce((sum, l) => sum + l.occupancyRate, 0) / mockLocations.filter(l => l.status === 'active').length;
  const totalPartnerRevenue = mockLocations.reduce((sum, l) => sum + l.monthlyRevenue, 0);
  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.netAmount, 0);

  return {
    totalUsers: '12,847',
    activeBookings: String(activeBookings + 338),
    todayRevenue: `₹${((todayRevenue + 45000) / 100000).toFixed(1)}L`,
    monthRevenue: `₹${((monthRevenue + 1600000) / 100000).toFixed(1)}L`,
    openTickets: String(openTickets + 19),
    pendingApps: String(pendingApps + 5),
    totalPods: String(totalPods + 108),
    availablePods: String(availPods + 63),
    avgOccupancy: `${Math.round(avgOccupancy)}%`,
    totalPartners: String(mockPartners.filter(p => p.status === 'active').length + 13),
    activeInvestors: String(mockInvestors.filter(i => i.status === 'active').length + 8),
    pendingPayouts: `₹${(pendingPayouts / 1000).toFixed(0)}K`,
    totalPartnerRevenue: `₹${(totalPartnerRevenue / 100000).toFixed(1)}L`,
  };
}
