import { pgTable, uuid, varchar, text, timestamp, decimal, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { pods } from './pods';
import { rooms } from './rooms';

// Enums
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
]);

export const bookingTypeEnum = pgEnum('booking_type', [
  'pod',       // Pod booking (hourly, 1-12 hours)
  'room'       // Room booking (daily, per night)
]);

// Bookings - supports both Pod and Room bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingNumber: varchar('booking_number', { length: 20 }).unique().notNull(),
  
  // User
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Booking Type (pod or room)
  bookingType: bookingTypeEnum('booking_type').default('pod').notNull(),
  
  // Pod (for pod bookings)
  podId: uuid('pod_id').references(() => pods.id),
  
  // Room (for room bookings)
  roomId: uuid('room_id').references(() => rooms.id),
  
  // Guest Details (for room bookings)
  guestCount: integer('guest_count').default(1),
  guestNames: text('guest_names'), // JSON array of guest names
  
  // Time
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  actualCheckIn: timestamp('actual_check_in'),
  actualCheckOut: timestamp('actual_check_out'),
  
  // Duration
  hours: integer('hours'), // For pod bookings
  nights: integer('nights'), // For room bookings
  
  // Pricing
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }).notNull(), // Hourly or daily rate
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  extraCharges: decimal('extra_charges', { precision: 10, scale: 2 }).default('0'), // Extra guest charges, etc.
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  gst: decimal('gst', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  
  // Revenue Split (stored for historical accuracy)
  ownerShare: decimal('owner_share', { precision: 10, scale: 2 }).notNull(),     // 60%
  naplooShare: decimal('naploo_share', { precision: 10, scale: 2 }).notNull(),   // 40%
  partnerCommission: decimal('partner_commission', { precision: 10, scale: 2 }).default('0'),
  
  // Coupon
  couponCode: varchar('coupon_code', { length: 20 }),
  couponDiscount: decimal('coupon_discount', { precision: 10, scale: 2 }).default('0'),
  
  // Status
  status: bookingStatusEnum('status').default('pending').notNull(),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),
  
  // Notes
  specialRequests: text('special_requests'),
  adminNotes: text('admin_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Booking relations
export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  pod: one(pods, {
    fields: [bookings.podId],
    references: [pods.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
}));

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
