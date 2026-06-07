import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { bookings } from './bookings';

// Enums
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'razorpay',
  'cashfree',
  'upi',
  'card',
  'netbanking',
  'wallet',
  'cash'
]);

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'processing',
  'completed',
  'failed'
]);

// Payments (Customer payments)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  
  // Amount
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('INR').notNull(),
  
  // Razorpay
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  razorpaySignature: text('razorpay_signature'),
  
  // Method
  paymentMethod: paymentMethodEnum('payment_method'),
  
  // Status
  status: paymentStatusEnum('status').default('pending').notNull(),
  failureReason: text('failure_reason'),
  
  // Refund
  refundedAmount: decimal('refunded_amount', { precision: 15, scale: 2 }).default('0'),
  refundReason: text('refund_reason'),
  refundedAt: timestamp('refunded_at'),
  
  // Metadata
  metadata: text('metadata'), // JSON
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payouts (To investors, partners, associates)
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Type
  payoutType: varchar('payout_type', { length: 50 }).notNull(), // 'investor', 'partner', 'associate'
  
  // Amount
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  tdsDeducted: decimal('tds_deducted', { precision: 10, scale: 2 }).default('0'),
  netAmount: decimal('net_amount', { precision: 15, scale: 2 }).notNull(),
  
  // Bank Details
  bankAccountNumber: varchar('bank_account_number', { length: 20 }),
  bankIfsc: varchar('bank_ifsc', { length: 11 }),
  bankName: varchar('bank_name', { length: 100 }),
  
  // Transfer
  transferId: varchar('transfer_id', { length: 100 }),
  transferMode: varchar('transfer_mode', { length: 50 }),
  
  // Status
  status: payoutStatusEnum('status').default('pending').notNull(),
  processedAt: timestamp('processed_at'),
  failureReason: text('failure_reason'),
  
  // Period
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Wallet (For quick payouts / cashback)
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Wallet Transactions
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  
  // Transaction
  type: varchar('type', { length: 20 }).notNull(), // 'credit', 'debit'
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 15, scale: 2 }).notNull(),
  
  // Reference
  referenceType: varchar('reference_type', { length: 50 }), // 'booking', 'payout', 'cashback'
  referenceId: uuid('reference_id'),
  
  description: text('description'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
