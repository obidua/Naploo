import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { partners } from './partners';
import { users } from './users';

// Enums
export const podTypeEnum = pgEnum('pod_type', [
  'single',    // Single occupancy
  'double'     // Double occupancy
]);

export const podStatusEnum = pgEnum('pod_status', [
  'available',
  'occupied',
  'maintenance',
  'inactive'
]);

export const podOwnershipEnum = pgEnum('pod_ownership', [
  'naploo',     // Pods owned by Naploo (partnership model A)
  'investor',   // Pods owned by investor (investor pool)
  'partner'     // Pods owned by partner (partnership model B)
]);

// Pod Sets (2 pods stacked - upper + lower)
export const podSets = pgTable('pod_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  ownerId: uuid('owner_id').references(() => users.id), // Investor or Partner
  ownership: podOwnershipEnum('ownership').default('naploo').notNull(),
  
  // Location within premises
  floor: integer('floor').default(1),
  section: varchar('section', { length: 50 }),
  setNumber: varchar('set_number', { length: 20 }).notNull(),
  
  // Pricing
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).default('150').notNull(),
  
  // Status
  isActive: boolean('is_active').default(true),
  installedAt: timestamp('installed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Individual Pods
export const pods = pgTable('pods', {
  id: uuid('id').primaryKey().defaultRandom(),
  podSetId: uuid('pod_set_id').references(() => podSets.id).notNull(),
  
  // Pod Details
  podNumber: varchar('pod_number', { length: 20 }).notNull(),
  position: varchar('position', { length: 10 }).notNull(), // 'upper' or 'lower'
  podType: podTypeEnum('pod_type').default('single').notNull(),
  
  // Status
  status: podStatusEnum('status').default('available').notNull(),
  
  // Features
  hasAC: boolean('has_ac').default(true),
  hasTV: boolean('has_tv').default(true),
  hasCharger: boolean('has_charger').default(true),
  hasLight: boolean('has_light').default(true),
  hasVentilation: boolean('has_ventilation').default(true),
  
  // Maintenance
  lastMaintenanceAt: timestamp('last_maintenance_at'),
  nextMaintenanceAt: timestamp('next_maintenance_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pod Set relations
export const podSetsRelations = relations(podSets, ({ one, many }) => ({
  partner: one(partners, {
    fields: [podSets.partnerId],
    references: [partners.id],
  }),
  owner: one(users, {
    fields: [podSets.ownerId],
    references: [users.id],
  }),
  pods: many(pods),
}));

// Pod relations
export const podsRelations = relations(pods, ({ one }) => ({
  podSet: one(podSets, {
    fields: [pods.podSetId],
    references: [podSets.id],
  }),
}));

export type PodSet = typeof podSets.$inferSelect;
export type NewPodSet = typeof podSets.$inferInsert;
export type Pod = typeof pods.$inferSelect;
export type NewPod = typeof pods.$inferInsert;
