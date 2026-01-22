import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Enums
export const partnerTypeEnum = pgEnum('partner_type', [
  'hotel',
  'homestay'
]);

export const partnershipModelEnum = pgEnum('partnership_model', [
  'without_investment',  // Option A: Naploo provides pods
  'with_investment'      // Option B: Partner buys pods
]);

export const partnerStatusEnum = pgEnum('partner_status', [
  'pending',
  'approved',
  'active',
  'suspended',
  'terminated'
]);

// Partners (Hotels & Homestays)
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Business Details
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessType: partnerTypeEnum('business_type').notNull(),
  partnershipModel: partnershipModelEnum('partnership_model').notNull(),
  
  // Registration
  gstNumber: varchar('gst_number', { length: 15 }),
  panNumber: varchar('pan_number', { length: 10 }),
  
  // Location
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Contact
  contactPerson: varchar('contact_person', { length: 100 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  
  // Commission (% from Naploo's 40%)
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).default('10'),
  
  // Agreement
  agreementStartDate: timestamp('agreement_start_date'),
  agreementEndDate: timestamp('agreement_end_date'),
  agreementDocument: text('agreement_document'),
  
  // Status
  status: partnerStatusEnum('status').default('pending').notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  
  // Metadata
  description: text('description'),
  amenities: text('amenities'), // JSON array
  images: text('images'), // JSON array
  rating: decimal('rating', { precision: 2, scale: 1 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Partner relations
export const partnersRelations = relations(partners, ({ one }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
}));

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
