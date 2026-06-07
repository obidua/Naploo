// Naploo PMS schema — staff, folios, rate plans, services, F&B POS, taxes, invoices.
import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, pgEnum, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { partners } from './partners';
import { rooms } from './rooms';
import { pods, podSets } from './pods';
import { bookings } from './bookings';

// ─── Enums ────────────────────────────────────────────────────
export const staffRoleEnum = pgEnum('staff_role', ['owner', 'manager', 'front_desk']);
export const staffStatusEnum = pgEnum('staff_status', ['invited', 'active', 'suspended', 'removed']);

export const ratePlanKindEnum = pgEnum('rate_plan_kind', ['standard', 'corporate', 'weekend', 'ota', 'long_stay', 'group']);

export const roomStatusKindEnum = pgEnum('room_status_kind', [
  'vacant_clean', 'vacant_dirty', 'occupied', 'inspected', 'out_of_order', 'maintenance',
]);

export const folioStatusEnum = pgEnum('folio_status', ['open', 'closed', 'void']);
export const folioChargeKindEnum = pgEnum('folio_charge_kind', [
  'room', 'pod', 'service', 'fnb', 'extra_guest', 'tax', 'discount', 'adjustment',
]);
export const folioPaymentMethodEnum = pgEnum('folio_payment_method', [
  'cash', 'card', 'upi', 'razorpay', 'cashfree', 'wallet', 'bank_transfer',
]);

export const serviceKindEnum = pgEnum('service_kind', [
  'extra_bed', 'breakfast', 'laundry', 'spa', 'taxi', 'tour', 'minibar', 'other',
]);

export const outletKindEnum = pgEnum('outlet_kind', ['restaurant', 'bar', 'spa', 'laundry', 'other']);

export const tableOrderStatusEnum = pgEnum('table_order_status', [
  'open', 'sent_to_kitchen', 'closed', 'void',
]);
export const tableOrderItemStatusEnum = pgEnum('table_order_item_status', [
  'pending', 'preparing', 'ready', 'served', 'void',
]);

export const taxKindEnum = pgEnum('tax_kind', ['gst', 'service', 'cess', 'tcs']);
export const taxAppliesEnum = pgEnum('tax_applies', ['room', 'fnb', 'service', 'all']);

export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'issued', 'cancelled', 'refunded']);

export const idProofKindEnum = pgEnum('id_proof_kind', ['aadhar', 'passport', 'driving_licence', 'voter_id', 'pan']);

// ─── Staff ────────────────────────────────────────────────────
export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: staffRoleEnum('role').notNull(),
  status: staffStatusEnum('status').default('active').notNull(),
  invitedBy: uuid('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at'),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Rate plans ───────────────────────────────────────────────
export const ratePlans = pgTable('rate_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  kind: ratePlanKindEnum('kind').default('standard').notNull(),
  baseMultiplier: decimal('base_multiplier', { precision: 5, scale: 3 }).default('1.000').notNull(),
  minNights: integer('min_nights').default(1),
  maxNights: integer('max_nights'),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  // jsonb: list of room_type strings the plan applies to; null = all
  appliesToRoomTypes: jsonb('applies_to_room_types'),
  // jsonb: [0=Sun ... 6=Sat] days check-in is blocked
  blockCheckInDays: jsonb('block_check_in_days'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rateOverrides = pgTable('rate_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  ratePlanId: uuid('rate_plan_id').references(() => ratePlans.id).notNull(),
  roomId: uuid('room_id').references(() => rooms.id),
  podSetId: uuid('pod_set_id').references(() => podSets.id),
  day: date('day').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Room/pod status (housekeeping) ───────────────────────────
export const housekeepingStatus = pgTable('housekeeping_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  roomId: uuid('room_id').references(() => rooms.id),
  podId: uuid('pod_id').references(() => pods.id),
  status: roomStatusKindEnum('status').notNull(),
  note: text('note'),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Folios ───────────────────────────────────────────────────
export const folios = pgTable('folios', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id),
  status: folioStatusEnum('status').default('open').notNull(),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
  totalCharges: decimal('total_charges', { precision: 12, scale: 2 }).default('0').notNull(),
  totalPayments: decimal('total_payments', { precision: 12, scale: 2 }).default('0').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  invoiceId: uuid('invoice_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const folioCharges = pgTable('folio_charges', {
  id: uuid('id').primaryKey().defaultRandom(),
  folioId: uuid('folio_id').references(() => folios.id).notNull(),
  kind: folioChargeKindEnum('kind').notNull(),
  description: text('description').notNull(),
  qty: integer('qty').default(1).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  sourceKind: varchar('source_kind', { length: 32 }),
  sourceId: uuid('source_id'),
  taxable: boolean('taxable').default(true).notNull(),
  addedBy: uuid('added_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const folioPayments = pgTable('folio_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  folioId: uuid('folio_id').references(() => folios.id).notNull(),
  method: folioPaymentMethodEnum('method').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  reference: varchar('reference', { length: 120 }),
  takenBy: uuid('taken_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Services & packages ──────────────────────────────────────
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  kind: serviceKindEnum('kind').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  taxable: boolean('taxable').default(true).notNull(),
  isPerNight: boolean('is_per_night').default(false).notNull(),
  isPerPerson: boolean('is_per_person').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  includedServices: jsonb('included_services'),    // [{serviceId, qty}]
  includedRoomCount: integer('included_room_count').default(1).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serviceOrders = pgTable('service_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  folioId: uuid('folio_id').references(() => folios.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  qty: integer('qty').default(1).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  takenBy: uuid('taken_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── F&B POS ──────────────────────────────────────────────────
export const outlets = pgTable('outlets', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  kind: outletKindEnum('kind').default('restaurant').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  outletId: uuid('outlet_id').references(() => outlets.id).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  outletId: uuid('outlet_id').references(() => outlets.id).notNull(),
  categoryId: uuid('category_id').references(() => menuCategories.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  taxable: boolean('taxable').default(true).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tableOrders = pgTable('table_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  outletId: uuid('outlet_id').references(() => outlets.id).notNull(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  tableNo: varchar('table_no', { length: 32 }),
  folioId: uuid('folio_id').references(() => folios.id),
  status: tableOrderStatusEnum('status').default('open').notNull(),
  totalCharges: decimal('total_charges', { precision: 12, scale: 2 }).default('0').notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  openedBy: uuid('opened_by').references(() => users.id),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const tableOrderItems = pgTable('table_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableOrderId: uuid('table_order_id').references(() => tableOrders.id).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  qty: integer('qty').default(1).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  status: tableOrderItemStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Taxes ────────────────────────────────────────────────────
export const taxesConfig = pgTable('taxes_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  kind: taxKindEnum('kind').notNull(),
  percent: decimal('percent', { precision: 5, scale: 2 }).notNull(),
  appliesTo: taxAppliesEnum('applies_to').default('all').notNull(),
  hsnCode: varchar('hsn_code', { length: 16 }),
  isInclusive: boolean('is_inclusive').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Invoices ─────────────────────────────────────────────────
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  folioId: uuid('folio_id').references(() => folios.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 32 }).unique().notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  grossAmount: decimal('gross_amount', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }).notNull(),
  customerId: uuid('customer_id').references(() => users.id),
  customerGstNumber: varchar('customer_gst_number', { length: 15 }),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  pdfUrl: text('pdf_url'),
  status: invoiceStatusEnum('status').default('issued').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Guest profiles (KYC) ─────────────────────────────────────
export const guestProfiles = pgTable('guest_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  fullName: varchar('full_name', { length: 200 }),
  dob: date('dob'),
  idProofKind: idProofKindEnum('id_proof_kind'),
  idProofNumber: varchar('id_proof_number', { length: 64 }),
  idProofImage: text('id_proof_image'),
  companyName: varchar('company_name', { length: 200 }),
  companyGst: varchar('company_gst', { length: 15 }),
  companyAddress: text('company_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Relations (minimal — extend as we wire features) ─────────
export const staffRelations = relations(staff, ({ one }) => ({
  partner: one(partners, { fields: [staff.partnerId], references: [partners.id] }),
  user: one(users, { fields: [staff.userId], references: [users.id] }),
}));

export const foliosRelations = relations(folios, ({ one, many }) => ({
  booking: one(bookings, { fields: [folios.bookingId], references: [bookings.id] }),
  partner: one(partners, { fields: [folios.partnerId], references: [partners.id] }),
  customer: one(users, { fields: [folios.customerId], references: [users.id] }),
  charges: many(folioCharges),
  payments: many(folioPayments),
}));

export const folioChargesRelations = relations(folioCharges, ({ one }) => ({
  folio: one(folios, { fields: [folioCharges.folioId], references: [folios.id] }),
}));

export const folioPaymentsRelations = relations(folioPayments, ({ one }) => ({
  folio: one(folios, { fields: [folioPayments.folioId], references: [folios.id] }),
}));

// ─── Inferred types ───────────────────────────────────────────
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type Folio = typeof folios.$inferSelect;
export type NewFolio = typeof folios.$inferInsert;
export type FolioCharge = typeof folioCharges.$inferSelect;
export type NewFolioCharge = typeof folioCharges.$inferInsert;
export type FolioPayment = typeof folioPayments.$inferSelect;
export type NewFolioPayment = typeof folioPayments.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
