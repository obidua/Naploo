import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { podSets } from './pods';

// Enums
export const investorStatusEnum = pgEnum('investor_status', [
  'pending',      // Just registered
  'kyc_pending',  // KYC submitted
  'approved',     // KYC verified, can invest
  'active',       // Has investments
  'suspended',
  'blocked'
]);

export const investmentStatusEnum = pgEnum('investment_status', [
  'pending',        // Payment pending
  'active',         // Pods deployed, earning
  'completed',      // 3x achieved
  'refunded'
]);

export const deliveryOptionEnum = pgEnum('delivery_option', [
  'doorstep',    // Delivered to investor
  'leaseback'    // Installed at partner location
]);

// Investor Profiles
export const investors = pgTable('investors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  
  // Status
  status: investorStatusEnum('status').default('pending').notNull(),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by').references(() => users.id),
  
  // Stats
  totalInvested: decimal('total_invested', { precision: 15, scale: 2 }).default('0'),
  totalEarned: decimal('total_earned', { precision: 15, scale: 2 }).default('0'),
  totalPodSets: integer('total_pod_sets').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Investments (Pod Set Purchases)
export const investments = pgTable('investments', {
  id: uuid('id').primaryKey().defaultRandom(),
  investorId: uuid('investor_id').references(() => investors.id).notNull(),
  podSetId: uuid('pod_set_id').references(() => podSets.id),
  
  // Purchase Details
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  podSetCount: integer('pod_set_count').default(1).notNull(),
  pricePerSet: decimal('price_per_set', { precision: 10, scale: 2 }).default('500000').notNull(),
  gstAmount: decimal('gst_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  
  // Delivery Option
  deliveryOption: deliveryOptionEnum('delivery_option').default('leaseback').notNull(),
  
  // 3x Guarantee Tracking
  guaranteeAmount: decimal('guarantee_amount', { precision: 15, scale: 2 }).notNull(), // 3x of totalAmount
  earnedSoFar: decimal('earned_so_far', { precision: 15, scale: 2 }).default('0'),
  guaranteeReached: boolean('guarantee_reached').default(false),
  guaranteeReachedAt: timestamp('guarantee_reached_at'),
  
  // Status
  status: investmentStatusEnum('status').default('pending').notNull(),
  
  // Contract
  contractStartDate: timestamp('contract_start_date'),
  contractEndDate: timestamp('contract_end_date'), // 3 years or until 3x
  scrapPolicyApplied: boolean('scrap_policy_applied').default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Investment Earnings (per booking)
export const investmentEarnings = pgTable('investment_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  investmentId: uuid('investment_id').references(() => investments.id).notNull(),
  bookingId: uuid('booking_id').notNull(), // Reference to bookings table
  
  // Amounts
  bookingAmount: decimal('booking_amount', { precision: 10, scale: 2 }).notNull(),
  investorShare: decimal('investor_share', { precision: 10, scale: 2 }).notNull(), // 60%
  
  // Running total
  cumulativeEarnings: decimal('cumulative_earnings', { precision: 15, scale: 2 }).notNull(),
  
  // Payout
  isPaidOut: boolean('is_paid_out').default(false),
  paidOutAt: timestamp('paid_out_at'),
  payoutId: uuid('payout_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const investorsRelations = relations(investors, ({ one, many }) => ({
  user: one(users, {
    fields: [investors.userId],
    references: [users.id],
  }),
  investments: many(investments),
}));

export const investmentsRelations = relations(investments, ({ one, many }) => ({
  investor: one(investors, {
    fields: [investments.investorId],
    references: [investors.id],
  }),
  podSet: one(podSets, {
    fields: [investments.podSetId],
    references: [podSets.id],
  }),
  earnings: many(investmentEarnings),
}));

export type Investor = typeof investors.$inferSelect;
export type NewInvestor = typeof investors.$inferInsert;
export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
