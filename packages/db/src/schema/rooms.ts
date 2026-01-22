import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { partners } from './partners';

// Enums
export const roomTypeEnum = pgEnum('room_type', [
  'standard',
  'deluxe',
  'suite',
  'family',
  'dormitory'
]);

export const roomStatusEnum = pgEnum('room_status', [
  'available',
  'occupied',
  'maintenance',
  'inactive'
]);

export const bedTypeEnum = pgEnum('bed_type', [
  'single',
  'double',
  'queen',
  'king',
  'bunk'
]);

// Rooms (for partner hotels/homestays)
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  
  // Room Details
  roomNumber: varchar('room_number', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }), // e.g., "Ocean View Suite"
  roomType: roomTypeEnum('room_type').default('standard').notNull(),
  
  // Floor & Section
  floor: integer('floor').default(1),
  section: varchar('section', { length: 50 }),
  
  // Capacity
  maxGuests: integer('max_guests').default(2).notNull(),
  bedType: bedTypeEnum('bed_type').default('double').notNull(),
  numBeds: integer('num_beds').default(1).notNull(),
  
  // Size
  areaSqFt: integer('area_sq_ft'),
  
  // Pricing
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }).notNull(), // Per night
  weeklyRate: decimal('weekly_rate', { precision: 10, scale: 2 }), // Optional weekly discount
  extraGuestCharge: decimal('extra_guest_charge', { precision: 10, scale: 2 }).default('500'),
  
  // Status
  status: roomStatusEnum('status').default('available').notNull(),
  isActive: boolean('is_active').default(true),
  
  // Amenities (JSON array)
  amenities: jsonb('amenities').default([]).notNull(), // ["AC", "TV", "WiFi", "Minibar", "Balcony"]
  
  // Images (JSON array of URLs)
  images: jsonb('images').default([]).notNull(),
  
  // Description
  description: text('description'),
  
  // Policies
  checkInTime: varchar('check_in_time', { length: 10 }).default('14:00'),
  checkOutTime: varchar('check_out_time', { length: 10 }).default('11:00'),
  
  // Maintenance
  lastMaintenanceAt: timestamp('last_maintenance_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Room relations
export const roomsRelations = relations(rooms, ({ one }) => ({
  partner: one(partners, {
    fields: [rooms.partnerId],
    references: [partners.id],
  }),
}));

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
