import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'customer',
  'investor',
  'partner',
  'associate',
  'admin',
  'super_admin'
]);

export const userStatusEnum = pgEnum('user_status', [
  'pending',
  'active',
  'suspended',
  'blocked'
]);

export const kycStatusEnum = pgEnum('kyc_status', [
  'not_submitted',
  'pending',
  'verified',
  'rejected'
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  passwordHash: text('password_hash'),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  avatar: text('avatar'),
  role: userRoleEnum('role').default('customer').notNull(),
  status: userStatusEnum('status').default('pending').notNull(),
  kycStatus: kycStatusEnum('kyc_status').default('not_submitted').notNull(),
  
  // KYC Details
  panNumber: varchar('pan_number', { length: 10 }),
  aadharNumber: varchar('aadhar_number', { length: 12 }),
  bankAccountNumber: varchar('bank_account_number', { length: 20 }),
  bankIfsc: varchar('bank_ifsc', { length: 11 }),
  bankName: varchar('bank_name', { length: 100 }),
  
  // Address
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  
  // Referral
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  referredBy: uuid('referred_by'),
  
  // OAuth
  googleId: varchar('google_id', { length: 255 }),
  
  // Metadata
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

// OTP table for phone verification
export const otps = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull(),
  otp: varchar('otp', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Refresh tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
