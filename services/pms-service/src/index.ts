import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import {
  users, partners, rooms, podSets, pods, bookings,
  folios, folioCharges, folioPayments,
  invoices, taxesConfig, staff, housekeepingStatus,
  services, serviceOrders,
} from '@naploo/db/schema';
import { eq, and, desc, sql, inArray, or, lt, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { registerExtensions, registerApiKeys } from "./extensions";
import { registerQloParity } from "./qlo-parity";

// ─── Helpers ──────────────────────────────────────────────────
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function genBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `NPL${ts}${rand}`;
}

function genInvoiceNumber(partnerCode: string): string {
  const fy = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `${partnerCode}-${fy}-${seq}`;
}

// Normalize phone to +91 format
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (phone.startsWith('+91')) return phone;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

// Find or create a customer user by phone (for walk-ins)
async function upsertWalkInCustomer(input: {
  phone: string;
  name?: string;
  email?: string;
}): Promise<string> {
  const normalizedPhone = normalizePhone(input.phone);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, normalizedPhone));
  if (existing) return existing.id;

  const parts = (input.name || '').trim().split(/\s+/);
  const firstName = parts[0] || null;
  const lastName = parts.slice(1).join(' ') || null;
  const [created] = await db
    .insert(users)
    .values({
      phone: normalizedPhone,
      email: input.email || null,
      firstName,
      lastName,
      role: 'customer',
      status: 'active',
      phoneVerified: false,
    })
    .returning({ id: users.id });
  return created.id;
}

// Resolve partner from x-user-id (must be owner or staff)
async function resolvePartnerForUser(userId: string) {
  const [s] = await db
    .select({ partnerId: staff.partnerId, role: staff.role })
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.status, 'active')))
    .limit(1);
  if (s) return s;
  const [p] = await db
    .select({ partnerId: partners.id })
    .from(partners)
    .where(eq(partners.userId, userId))
    .limit(1);
  if (p) return { partnerId: p.partnerId, role: 'owner' as const };
  return null;
}

// Compute total tax for taxable subtotal using partner's tax config
async function computeTax(partnerId: string, subtotal: number, applies: 'room' | 'fnb' | 'service'): Promise<number> {
  const rows = await db
    .select()
    .from(taxesConfig)
    .where(and(eq(taxesConfig.partnerId, partnerId), eq(taxesConfig.isActive, true)));
  let tax = 0;
  for (const r of rows) {
    if (r.appliesTo === 'all' || r.appliesTo === applies) {
      tax += subtotal * (Number(r.percent) / 100);
    }
  }
  return round2(tax);
}

// Overlap check for room or pod bookings
const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'] as const;
async function findFreePod(podSetId: string, checkIn: Date, checkOut: Date): Promise<string | null> {
  const setPods = await db.select().from(pods).where(and(eq(pods.podSetId, podSetId), eq(pods.status, 'available')));
  for (const pod of setPods) {
    const overlaps = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.podId, pod.id),
          inArray(bookings.status, ACTIVE_STATUSES as unknown as string[]),
          lt(bookings.checkIn, checkOut),
          gt(bookings.checkOut, checkIn)
        )
      );
    if (overlaps.length === 0) return pod.id;
  }
  return null;
}

async function roomOverlaps(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.roomId, roomId),
        inArray(bookings.status, ACTIVE_STATUSES as unknown as string[]),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn)
      )
    );
  return rows.length > 0;
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Naploo PMS Service',
          version: '1.0.0',
          description: 'Property Management System — walk-in bookings, folios, F&B POS, invoices.',
        },
      },
    })
  )

  .get('/health', () => ({ status: 'healthy', service: 'pms-service', timestamp: new Date().toISOString() }))

  // ═══ Partner config (tier + feature flags) ═══════════════════
  .get('/me/config', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const link = await resolvePartnerForUser(userId);
    if (!link) {
      set.status = 404;
      return { success: false, message: 'No partner profile for this user' };
    }
    const [p] = await db.select().from(partners).where(eq(partners.id, link.partnerId));
    return {
      success: true,
      partnerId: p.id,
      staffRole: link.role,
      tier: (p as any).tier,
      roomCountBand: (p as any).roomCountBand,
      featuresEnabled: (p as any).featuresEnabled,
      currency: (p as any).currency,
      timezone: (p as any).timezone,
      checkInTime: (p as any).checkInTime,
      checkOutTime: (p as any).checkOutTime,
    };
  })

  .patch('/me/config', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const link = await resolvePartnerForUser(userId);
    if (!link || link.role !== 'owner') {
      set.status = 403;
      return { success: false, message: 'Only the owner can edit configuration' };
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.tier !== undefined) update.tier = body.tier;
    if (body.roomCountBand !== undefined) update.roomCountBand = body.roomCountBand;
    if (body.featuresEnabled !== undefined) update.featuresEnabled = body.featuresEnabled;
    if (body.checkInTime !== undefined) update.checkInTime = body.checkInTime;
    if (body.checkOutTime !== undefined) update.checkOutTime = body.checkOutTime;
    const [updated] = await db.update(partners).set(update as any).where(eq(partners.id, link.partnerId)).returning();
    return { success: true, partner: updated };
  }, {
    body: t.Object({
      tier: t.Optional(t.String()),
      roomCountBand: t.Optional(t.String()),
      featuresEnabled: t.Optional(t.Any()),
      checkInTime: t.Optional(t.String()),
      checkOutTime: t.Optional(t.String()),
    }),
  })

  // ═══ Walk-in booking (the core PMS action) ══════════════════
  .post('/walk-in', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const link = await resolvePartnerForUser(userId);
    if (!link) {
      set.status = 403;
      return { success: false, message: 'Partner access required' };
    }
    const partnerId = link.partnerId;

    // 1. Upsert guest user
    const customerId = await upsertWalkInCustomer({
      phone: body.guestPhone,
      name: body.guestName,
      email: body.guestEmail,
    });

    // 2. Resolve unit + compute pricing
    const checkIn = new Date(body.checkIn);
    let checkOut: Date;
    let baseRate = 0;
    let units = 0;
    let bookingType: 'pod' | 'room' = 'room';
    let unitDescription = '';
    let lockedPodId: string | null = null;
    let lockedRoomId: string | null = null;

    if (body.kind === 'pod') {
      const [podSet] = await db.select().from(podSets).where(eq(podSets.id, body.unitId));
      if (!podSet || podSet.partnerId !== partnerId) {
        set.status = 404;
        return { success: false, message: 'Pod set not found in your hotel' };
      }
      units = body.hours || 1;
      checkOut = new Date(checkIn.getTime() + units * 60 * 60 * 1000);
      baseRate = Number(podSet.hourlyRate);
      bookingType = 'pod';
      unitDescription = `Pod set ${podSet.setNumber} × ${units} hr`;
      const podId = await findFreePod(podSet.id, checkIn, checkOut);
      if (!podId) {
        set.status = 409;
        return { success: false, message: 'No pods available for this time window' };
      }
      lockedPodId = podId;
    } else {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, body.unitId));
      if (!room || room.partnerId !== partnerId) {
        set.status = 404;
        return { success: false, message: 'Room not found in your hotel' };
      }
      units = body.nights || 1;
      checkOut = new Date(checkIn.getTime() + units * 24 * 60 * 60 * 1000);
      baseRate = Number(room.dailyRate);
      bookingType = 'room';
      unitDescription = `Room ${room.roomNumber}${room.name ? ` — ${room.name}` : ''} × ${units} night${units > 1 ? 's' : ''}`;
      const conflict = await roomOverlaps(room.id, checkIn, checkOut);
      if (conflict) {
        set.status = 409;
        return { success: false, message: 'Room is already booked for these dates' };
      }
      lockedRoomId = room.id;
    }

    const stayCharge = round2(baseRate * units);
    const discount = round2(body.discount || 0);
    const taxableBase = Math.max(0, stayCharge - discount);
    const tax = await computeTax(partnerId, taxableBase, 'room');
    const total = round2(taxableBase + tax);

    // 3. Create booking (source = walk_in)
    const [booking] = await db
      .insert(bookings)
      .values({
        bookingNumber: genBookingNumber(),
        userId: customerId,
        bookingType,
        roomId: lockedRoomId,
        podId: lockedPodId,
        guestCount: body.guestCount || 1,
        checkIn,
        checkOut,
        hours: bookingType === 'pod' ? units : null,
        nights: bookingType === 'room' ? units : null,
        baseRate: String(baseRate),
        subtotal: String(stayCharge),
        discount: String(discount),
        gst: String(tax),
        total: String(total),
        ownerShare: String(round2(taxableBase * (bookingType === 'pod' ? 0.6 : 0.82))),
        naplooShare: String(round2(taxableBase * (bookingType === 'pod' ? 0.4 : 0.18))),
        status: 'confirmed',
        source: 'walk_in' as any,
        specialRequests: body.notes,
      })
      .returning();

    // 4. Open folio + post stay charge + tax
    const [folio] = await db
      .insert(folios)
      .values({
        bookingId: booking.id,
        partnerId,
        customerId,
        status: 'open',
        totalCharges: String(total),
        totalPayments: '0',
        balance: String(total),
      })
      .returning();

    await db.insert(folioCharges).values([
      {
        folioId: folio.id,
        kind: bookingType === 'pod' ? 'pod' : 'room',
        description: unitDescription,
        qty: units,
        unitPrice: String(baseRate),
        amount: String(stayCharge),
        taxable: true,
        addedBy: userId,
      },
      ...(discount > 0 ? [{
        folioId: folio.id,
        kind: 'discount' as const,
        description: 'Walk-in discount',
        qty: 1,
        unitPrice: String(-discount),
        amount: String(-discount),
        taxable: false,
        addedBy: userId,
      }] : []),
      {
        folioId: folio.id,
        kind: 'tax' as const,
        description: 'GST + applicable taxes',
        qty: 1,
        unitPrice: String(tax),
        amount: String(tax),
        taxable: false,
        addedBy: userId,
      },
    ]);

    // 5. If payment is provided at booking time → record it
    let paid = false;
    if (body.payment && body.payment.method !== 'pay_later') {
      const payAmt = body.payment.amount ?? total;
      await db.insert(folioPayments).values({
        folioId: folio.id,
        method: body.payment.method as any,
        amount: String(payAmt),
        reference: body.payment.reference || null,
        takenBy: userId,
      });
      const newBalance = round2(total - payAmt);
      await db.update(folios).set({
        totalPayments: String(payAmt),
        balance: String(newBalance),
        updatedAt: new Date(),
      }).where(eq(folios.id, folio.id));
      paid = newBalance === 0;
    }

    // 6. Auto check-in if requested
    if (body.checkInNow) {
      await db.update(bookings).set({ status: 'checked_in', actualCheckIn: new Date(), updatedAt: new Date() }).where(eq(bookings.id, booking.id));
    }

    set.status = 201;
    return {
      success: true,
      booking,
      folio,
      summary: {
        guestId: customerId,
        bookingNumber: booking.bookingNumber,
        folioId: folio.id,
        unit: unitDescription,
        stayCharge,
        discount,
        tax,
        total,
        paid,
        balance: round2(total - (body.payment?.amount ?? 0)),
      },
    };
  }, {
    body: t.Object({
      kind: t.Union([t.Literal('room'), t.Literal('pod')]),
      unitId: t.String(),
      checkIn: t.String(),
      hours: t.Optional(t.Number()),
      nights: t.Optional(t.Number()),
      guestCount: t.Optional(t.Number()),
      guestName: t.String(),
      guestPhone: t.String(),
      guestEmail: t.Optional(t.String()),
      discount: t.Optional(t.Number()),
      notes: t.Optional(t.String()),
      checkInNow: t.Optional(t.Boolean()),
      payment: t.Optional(t.Object({
        method: t.Union([
          t.Literal('cash'), t.Literal('card'), t.Literal('upi'),
          t.Literal('razorpay'), t.Literal('cashfree'), t.Literal('wallet'), t.Literal('bank_transfer'),
          t.Literal('pay_later'),
        ]),
        amount: t.Optional(t.Number()),
        reference: t.Optional(t.String()),
      })),
    }),
  })

  // ═══ Folio operations ════════════════════════════════════════
  .get('/folios/:id', async ({ params, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [folio] = await db.select().from(folios).where(eq(folios.id, params.id));
    if (!folio) { set.status = 404; return { success: false, message: 'Folio not found' }; }
    const charges = await db.select().from(folioCharges).where(eq(folioCharges.folioId, folio.id)).orderBy(folioCharges.createdAt);
    const payments = await db.select().from(folioPayments).where(eq(folioPayments.folioId, folio.id)).orderBy(folioPayments.createdAt);
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, folio.bookingId));
    return { success: true, folio, booking, charges, payments };
  })

  .post('/folios/:id/charges', async ({ params, body, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [folio] = await db.select().from(folios).where(eq(folios.id, params.id));
    if (!folio) { set.status = 404; return { success: false, message: 'Folio not found' }; }
    if (folio.status !== 'open') { set.status = 400; return { success: false, message: 'Cannot add charges to a closed folio' }; }

    const amount = round2(body.qty * body.unitPrice);
    const [charge] = await db.insert(folioCharges).values({
      folioId: folio.id,
      kind: body.kind as any,
      description: body.description,
      qty: body.qty,
      unitPrice: String(body.unitPrice),
      amount: String(amount),
      taxable: body.taxable ?? true,
      addedBy: userId,
    }).returning();

    // Recompute totals
    const newCharges = round2(Number(folio.totalCharges) + amount);
    const newBalance = round2(newCharges - Number(folio.totalPayments));
    await db.update(folios).set({
      totalCharges: String(newCharges),
      balance: String(newBalance),
      updatedAt: new Date(),
    }).where(eq(folios.id, folio.id));

    return { success: true, charge, folioBalance: newBalance };
  }, {
    body: t.Object({
      kind: t.Union([
        t.Literal('room'), t.Literal('pod'), t.Literal('service'), t.Literal('fnb'),
        t.Literal('extra_guest'), t.Literal('tax'), t.Literal('discount'), t.Literal('adjustment'),
      ]),
      description: t.String(),
      qty: t.Number(),
      unitPrice: t.Number(),
      taxable: t.Optional(t.Boolean()),
    }),
  })

  .post('/folios/:id/payments', async ({ params, body, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [folio] = await db.select().from(folios).where(eq(folios.id, params.id));
    if (!folio) { set.status = 404; return { success: false, message: 'Folio not found' }; }

    const [payment] = await db.insert(folioPayments).values({
      folioId: folio.id,
      method: body.method as any,
      amount: String(body.amount),
      reference: body.reference || null,
      takenBy: userId,
    }).returning();

    const newPaid = round2(Number(folio.totalPayments) + body.amount);
    const newBalance = round2(Number(folio.totalCharges) - newPaid);
    await db.update(folios).set({
      totalPayments: String(newPaid),
      balance: String(newBalance),
      updatedAt: new Date(),
    }).where(eq(folios.id, folio.id));

    return { success: true, payment, folioBalance: newBalance };
  }, {
    body: t.Object({
      method: t.Union([
        t.Literal('cash'), t.Literal('card'), t.Literal('upi'),
        t.Literal('razorpay'), t.Literal('cashfree'), t.Literal('wallet'), t.Literal('bank_transfer'),
      ]),
      amount: t.Number(),
      reference: t.Optional(t.String()),
    }),
  })

  // Close folio + generate invoice
  .post('/folios/:id/checkout', async ({ params, body, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [folio] = await db.select().from(folios).where(eq(folios.id, params.id));
    if (!folio) { set.status = 404; return { success: false, message: 'Folio not found' }; }
    if (folio.status === 'closed') { set.status = 400; return { success: false, message: 'Folio is already closed' }; }
    if (Number(folio.balance) > 0 && !body?.allowDues) {
      set.status = 400;
      return { success: false, message: `Outstanding balance ₹${folio.balance}. Take payment or set allowDues=true.` };
    }

    const charges = await db.select().from(folioCharges).where(eq(folioCharges.folioId, folio.id));
    const taxableSum = charges.filter((c) => c.taxable).reduce((s, c) => s + Number(c.amount), 0);
    const taxSum = charges.filter((c) => c.kind === 'tax').reduce((s, c) => s + Number(c.amount), 0);
    const grossAmount = round2(Number(folio.totalCharges) - taxSum);

    // Resolve partner code from name (first 3 alpha chars uppercase)
    const [p] = await db.select().from(partners).where(eq(partners.id, folio.partnerId));
    const code = (p?.businessName || 'NPL').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'NPL';
    const invoiceNumber = genInvoiceNumber(code);

    const [invoice] = await db.insert(invoices).values({
      folioId: folio.id,
      invoiceNumber,
      grossAmount: String(grossAmount),
      taxAmount: String(round2(taxSum)),
      netAmount: String(folio.totalCharges),
      customerId: folio.customerId,
      customerGstNumber: body?.customerGstNumber || null,
      partnerId: folio.partnerId,
      status: 'issued',
    }).returning();

    await db.update(folios).set({
      status: 'closed',
      closedAt: new Date(),
      invoiceId: invoice.id,
      updatedAt: new Date(),
    }).where(eq(folios.id, folio.id));

    // Mark booking as checked-out if it was a stay
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, folio.bookingId));
    if (booking && ['confirmed', 'checked_in'].includes(booking.status)) {
      await db.update(bookings).set({
        status: 'checked_out',
        actualCheckOut: new Date(),
        updatedAt: new Date(),
      }).where(eq(bookings.id, booking.id));
    }

    return { success: true, invoice, folioClosed: true };
  }, {
    body: t.Optional(t.Object({
      allowDues: t.Optional(t.Boolean()),
      customerGstNumber: t.Optional(t.String()),
    })),
  })

  // ═══ Today's operations (front-desk view) ═══════════════════
  .get('/today', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }

    const partnerId = link.partnerId;
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

    // Collect partner-owned room/pod IDs
    const partnerRooms = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.partnerId, partnerId));
    const partnerSets = await db.select({ id: podSets.id }).from(podSets).where(eq(podSets.partnerId, partnerId));
    const setIds = partnerSets.map((s) => s.id);
    const partnerPods = setIds.length ? await db.select({ id: pods.id }).from(pods).where(inArray(pods.podSetId, setIds)) : [];
    const roomIds = partnerRooms.map((r) => r.id);
    const podIds = partnerPods.map((p) => p.id);

    const myBookings = !roomIds.length && !podIds.length
      ? []
      : await db
          .select()
          .from(bookings)
          .where(or(
            roomIds.length ? inArray(bookings.roomId, roomIds) : sql`false`,
            podIds.length ? inArray(bookings.podId, podIds) : sql`false`
          ))
          .orderBy(desc(bookings.createdAt))
          .limit(200);

    const arrivalsToday = myBookings.filter((b) =>
      new Date(b.checkIn) >= startOfDay && new Date(b.checkIn) <= endOfDay
    );
    const departuresToday = myBookings.filter((b) =>
      new Date(b.checkOut) >= startOfDay && new Date(b.checkOut) <= endOfDay
    );
    const inHouse = myBookings.filter((b) => b.status === 'checked_in');

    // Pending dues = open folios with positive balance
    const openFolios = await db
      .select()
      .from(folios)
      .where(and(eq(folios.partnerId, partnerId), eq(folios.status, 'open')))
      .orderBy(desc(folios.openedAt));
    const totalDues = openFolios.reduce((s, f) => s + Number(f.balance), 0);

    return {
      success: true,
      summary: {
        arrivalsToday: arrivalsToday.length,
        departuresToday: departuresToday.length,
        inHouse: inHouse.length,
        openFolios: openFolios.length,
        totalDues: round2(totalDues),
      },
      arrivalsToday,
      departuresToday,
      inHouse,
      openFolios: openFolios.slice(0, 20),
    };
  })

  // ═══ Booking lifecycle ═══════════════════════════════════════
  .post('/bookings/:id/check-in', async ({ params, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [b] = await db.select().from(bookings).where(eq(bookings.id, params.id));
    if (!b) { set.status = 404; return { success: false, message: 'Booking not found' }; }
    const [updated] = await db.update(bookings).set({
      status: 'checked_in',
      actualCheckIn: new Date(),
      updatedAt: new Date(),
    }).where(eq(bookings.id, params.id)).returning();
    return { success: true, booking: updated };
  })

  .post('/bookings/:id/check-out', async ({ params, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const [b] = await db.select().from(bookings).where(eq(bookings.id, params.id));
    if (!b) { set.status = 404; return { success: false, message: 'Booking not found' }; }
    const [updated] = await db.update(bookings).set({
      status: 'checked_out',
      actualCheckOut: new Date(),
      updatedAt: new Date(),
    }).where(eq(bookings.id, params.id)).returning();
    return { success: true, booking: updated };
  })

  // ═══ Housekeeping ════════════════════════════════════════════
  .post('/housekeeping/status', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }
    const [row] = await db.insert(housekeepingStatus).values({
      partnerId: link.partnerId,
      roomId: body.roomId || null,
      podId: body.podId || null,
      status: body.status as any,
      note: body.note,
      updatedBy: userId,
    }).returning();
    return { success: true, status: row };
  }, {
    body: t.Object({
      roomId: t.Optional(t.String()),
      podId: t.Optional(t.String()),
      status: t.Union([
        t.Literal('vacant_clean'), t.Literal('vacant_dirty'), t.Literal('occupied'),
        t.Literal('inspected'), t.Literal('out_of_order'), t.Literal('maintenance'),
      ]),
      note: t.Optional(t.String()),
    }),
  })

  .get('/housekeeping/board', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }

    // For each room: latest status (or "vacant_clean" default)
    const partnerRooms = await db.select().from(rooms).where(eq(rooms.partnerId, link.partnerId));
    const partnerSets = await db.select().from(podSets).where(eq(podSets.partnerId, link.partnerId));

    const latestStatus = await db
      .select()
      .from(housekeepingStatus)
      .where(eq(housekeepingStatus.partnerId, link.partnerId))
      .orderBy(desc(housekeepingStatus.updatedAt));

    const roomStatusMap = new Map<string, string>();
    const podStatusMap = new Map<string, string>();
    for (const s of latestStatus) {
      if (s.roomId && !roomStatusMap.has(s.roomId)) roomStatusMap.set(s.roomId, s.status);
      if (s.podId && !podStatusMap.has(s.podId)) podStatusMap.set(s.podId, s.status);
    }

    return {
      success: true,
      rooms: partnerRooms.map((r) => ({
        id: r.id, number: r.roomNumber, type: r.roomType,
        floor: r.floor, status: roomStatusMap.get(r.id) || 'vacant_clean',
      })),
      podSets: partnerSets.map((s) => ({
        id: s.id, setNumber: s.setNumber, floor: s.floor,
        status: 'vacant_clean', // pod-level status pending
      })),
    };
  })

  // ═══ Staff management (Owner only) ═══════════════════════════
  .get('/staff', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }
    const rows = await db
      .select({
        id: staff.id, role: staff.role, status: staff.status,
        userId: staff.userId, phone: users.phone, email: users.email,
        firstName: users.firstName, lastName: users.lastName,
        createdAt: staff.createdAt,
      })
      .from(staff)
      .innerJoin(users, eq(users.id, staff.userId))
      .where(eq(staff.partnerId, link.partnerId));
    return { success: true, count: rows.length, staff: rows };
  })

  .post('/staff/invite', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link || link.role !== 'owner') {
      set.status = 403;
      return { success: false, message: 'Only the owner can invite staff' };
    }
    // Upsert user by phone (without password — they OTP login)
    const newUserId = await upsertWalkInCustomer({ phone: body.phone, name: body.name, email: body.email });
    // Promote role
    await db.update(users).set({ role: 'partner' as any, updatedAt: new Date() }).where(eq(users.id, newUserId));
    // Add to staff
    const [existing] = await db.select().from(staff).where(and(eq(staff.partnerId, link.partnerId), eq(staff.userId, newUserId)));
    if (existing) {
      const [updated] = await db.update(staff).set({
        role: body.role as any,
        status: 'active',
        updatedAt: new Date(),
      }).where(eq(staff.id, existing.id)).returning();
      return { success: true, staff: updated, existed: true };
    }
    const [created] = await db.insert(staff).values({
      partnerId: link.partnerId,
      userId: newUserId,
      role: body.role as any,
      status: 'active',
      invitedBy: userId,
      invitedAt: new Date(),
      acceptedAt: new Date(),
    }).returning();
    return { success: true, staff: created };
  }, {
    body: t.Object({
      phone: t.String(),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      role: t.Union([t.Literal('owner'), t.Literal('manager'), t.Literal('front_desk')]),
    }),
  })

  .patch('/staff/:id', async ({ params, body, headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link || link.role !== 'owner') {
      set.status = 403;
      return { success: false, message: 'Only the owner can modify staff' };
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.role !== undefined) update.role = body.role;
    if (body.status !== undefined) update.status = body.status;
    const [updated] = await db.update(staff).set(update as any).where(eq(staff.id, params.id)).returning();
    if (!updated) { set.status = 404; return { success: false, message: 'Staff not found' }; }
    return { success: true, staff: updated };
  }, {
    body: t.Object({
      role: t.Optional(t.Union([t.Literal('owner'), t.Literal('manager'), t.Literal('front_desk')])),
      status: t.Optional(t.Union([t.Literal('active'), t.Literal('suspended'), t.Literal('removed')])),
    }),
  })

  // ═══ Tax configuration ═══════════════════════════════════════
  .get('/taxes', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }
    const rows = await db.select().from(taxesConfig).where(eq(taxesConfig.partnerId, link.partnerId));
    return { success: true, count: rows.length, taxes: rows };
  })

  .post('/taxes', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link || link.role !== 'owner') {
      set.status = 403;
      return { success: false, message: 'Only the owner can configure taxes' };
    }
    const [created] = await db.insert(taxesConfig).values({
      partnerId: link.partnerId,
      name: body.name,
      kind: body.kind as any,
      percent: String(body.percent),
      appliesTo: body.appliesTo as any,
      hsnCode: body.hsnCode || null,
      isInclusive: body.isInclusive ?? false,
    }).returning();
    return { success: true, tax: created };
  }, {
    body: t.Object({
      name: t.String(),
      kind: t.Union([t.Literal('gst'), t.Literal('service'), t.Literal('cess'), t.Literal('tcs')]),
      percent: t.Number(),
      appliesTo: t.Union([t.Literal('room'), t.Literal('fnb'), t.Literal('service'), t.Literal('all')]),
      hsnCode: t.Optional(t.String()),
      isInclusive: t.Optional(t.Boolean()),
    }),
  })

  // ═══ Services (extras) ═══════════════════════════════════════
  .get('/services', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link) { set.status = 403; return { success: false, message: 'Partner access required' }; }
    const rows = await db.select().from(services).where(eq(services.partnerId, link.partnerId));
    return { success: true, count: rows.length, services: rows };
  })

  .post('/services', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) { set.status = 401; return { success: false, message: 'Authentication required' }; }
    const link = await resolvePartnerForUser(userId);
    if (!link || link.role === 'front_desk') {
      set.status = 403;
      return { success: false, message: 'Manager or owner required' };
    }
    const [created] = await db.insert(services).values({
      partnerId: link.partnerId,
      name: body.name,
      kind: body.kind as any,
      price: String(body.price),
      taxable: body.taxable ?? true,
      isPerNight: body.isPerNight ?? false,
      isPerPerson: body.isPerPerson ?? false,
    }).returning();
    return { success: true, service: created };
  }, {
    body: t.Object({
      name: t.String(),
      kind: t.Union([
        t.Literal('extra_bed'), t.Literal('breakfast'), t.Literal('laundry'),
        t.Literal('spa'), t.Literal('taxi'), t.Literal('tour'),
        t.Literal('minibar'), t.Literal('other'),
      ]),
      price: t.Number(),
      taxable: t.Optional(t.Boolean()),
      isPerNight: t.Optional(t.Boolean()),
      isPerPerson: t.Optional(t.Boolean()),
    }),
  });

const extendedApp = registerQloParity(registerApiKeys(registerExtensions(app)));
extendedApp.listen({
  hostname: process.env.PMS_SERVICE_HOST || '127.0.0.1',
  port: Number(process.env.PMS_SERVICE_PORT || 3012),
});

console.log(`🏨 Naploo PMS Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
