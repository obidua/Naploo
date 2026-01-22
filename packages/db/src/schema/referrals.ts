import { pgTable, uuid, varchar, text, timestamp, decimal, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Enums
export const referralTypeEnum = pgEnum('referral_type', [
  'hotel',      // Hotel partner referral
  'homestay',   // Homestay partner referral
  'space',      // Space finder referral
  'investor',   // Investor referral
  'customer',   // Customer referral
  'associate'   // Associate referral
]);

// Associates (5-Level Referral Program)
export const associates = pgTable('associates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  
  // Hierarchy
  parentId: uuid('parent_id'), // Direct upline
  level1Id: uuid('level1_id'), // Level 1 upline
  level2Id: uuid('level2_id'), // Level 2 upline
  level3Id: uuid('level3_id'), // Level 3 upline
  level4Id: uuid('level4_id'), // Level 4 upline
  level5Id: uuid('level5_id'), // Level 5 upline
  
  // Stats
  totalReferrals: integer('total_referrals').default(0),
  totalEarnings: decimal('total_earnings', { precision: 15, scale: 2 }).default('0'),
  pendingPayout: decimal('pending_payout', { precision: 15, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Referrals
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  associateId: uuid('associate_id').references(() => associates.id).notNull(),
  
  // Referral Details
  referralType: referralTypeEnum('referral_type').notNull(),
  referredUserId: uuid('referred_user_id').references(() => users.id),
  referredPartnerId: uuid('referred_partner_id'), // For hotel/homestay referrals
  
  // Level (1-5)
  level: integer('level').notNull(),
  
  // Earnings
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).notNull(),
  totalEarned: decimal('total_earned', { precision: 15, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Referral Earnings (per transaction)
export const referralEarnings = pgTable('referral_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  referralId: uuid('referral_id').references(() => referrals.id).notNull(),
  associateId: uuid('associate_id').references(() => associates.id).notNull(),
  
  // Source
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'booking', 'investment', etc.
  sourceId: uuid('source_id').notNull(),
  sourceAmount: decimal('source_amount', { precision: 15, scale: 2 }).notNull(),
  
  // Earning
  level: integer('level').notNull(),
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).notNull(),
  earnedAmount: decimal('earned_amount', { precision: 10, scale: 2 }).notNull(),
  
  // Payout
  isPaidOut: boolean('is_paid_out').default(false),
  paidOutAt: timestamp('paid_out_at'),
  payoutId: uuid('payout_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Commission Configuration (Admin controlled)
export const commissionConfig = pgTable('commission_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  referralType: referralTypeEnum('referral_type').notNull(),
  
  // 5 Level Commission Rates
  level1Percent: decimal('level1_percent', { precision: 5, scale: 2 }).notNull(),
  level2Percent: decimal('level2_percent', { precision: 5, scale: 2 }).notNull(),
  level3Percent: decimal('level3_percent', { precision: 5, scale: 2 }).notNull(),
  level4Percent: decimal('level4_percent', { precision: 5, scale: 2 }).notNull(),
  level5Percent: decimal('level5_percent', { precision: 5, scale: 2 }).notNull(),
  
  // One-time bonus (for hotel/homestay/investor referrals)
  oneTimeBonus: decimal('one_time_bonus', { precision: 10, scale: 2 }).default('0'),
  
  isActive: boolean('is_active').default(true),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const associatesRelations = relations(associates, ({ one, many }) => ({
  user: one(users, {
    fields: [associates.userId],
    references: [users.id],
  }),
  referrals: many(referrals),
}));

import { boolean } from 'drizzle-orm/pg-core';

export type Associate = typeof associates.$inferSelect;
export type NewAssociate = typeof associates.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
