import { Elysia, t } from 'elysia';
import { registerAdminQlo } from "./qlo-parity";
import { registerAdminQlo2 } from "./qlo2";
import { registerAdminErp } from "./erp-rollup";
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { users, partners, bookings, payments, payouts, rooms, pods, podSets, investors } from '@naploo/db/schema';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';

const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3003';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function monthBounds() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function shapePodCatalogue(row: any) {
  return {
    id: row.id,
    key: row.catalogue_key,
    series: row.series,
    name: row.name,
    code: row.code,
    podType: row.pod_type,
    layout: row.layout,
    occupancy: Number(row.occupancy),
    dimensions: row.dimensions,
    material: row.material,
    basePrice: Number(row.base_price),
    setPrice: Number(row.set_price),
    isActive: row.is_active,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

// Gateway mounts this at /api/v1/admin/* (admin role enforced there) and
// strips the /admin prefix, so handlers see /users, /partners, etc.
const appBase = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'admin-service', timestamp: new Date().toISOString() }))

  .get('/pod-catalogue', async () => {
    const rows = await db.execute(sql`
      SELECT * FROM pod_catalogue
      ORDER BY is_active DESC, sort_order ASC, series ASC, name ASC
    `);
    return { success: true, models: (rows as any[]).map(shapePodCatalogue) };
  })

  .post('/pod-catalogue', async ({ body }) => {
    const b = body as any;
    const rows = await db.execute(sql`
      INSERT INTO pod_catalogue (catalogue_key, series, name, code, pod_type, layout, occupancy, dimensions, material, base_price, set_price, is_active, sort_order)
      VALUES (
        ${b.key || `${String(b.code || 'pod').toLowerCase()}-${Date.now()}`}, ${b.series}, ${b.name}, ${b.code}, ${b.podType}, ${b.layout},
        ${Number(b.occupancy || 1)}, ${b.dimensions}, ${b.material}, ${Number(b.basePrice || 0)}, ${Number(b.setPrice || 0)},
        ${b.isActive !== false}, ${Number(b.sortOrder || 999)}
      )
      ON CONFLICT (catalogue_key) DO UPDATE SET
        series = EXCLUDED.series,
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        pod_type = EXCLUDED.pod_type,
        layout = EXCLUDED.layout,
        occupancy = EXCLUDED.occupancy,
        dimensions = EXCLUDED.dimensions,
        material = EXCLUDED.material,
        base_price = EXCLUDED.base_price,
        set_price = EXCLUDED.set_price,
        is_active = EXCLUDED.is_active,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
      RETURNING *
    `);
    return { success: true, model: shapePodCatalogue((rows as any[])[0]) };
  })

  .patch('/pod-catalogue/:id', async ({ params, body, set }) => {
    const b = body as any;
    const rows = await db.execute(sql`
      UPDATE pod_catalogue SET
        series = COALESCE(${b.series ?? null}, series),
        name = COALESCE(${b.name ?? null}, name),
        code = COALESCE(${b.code ?? null}, code),
        pod_type = COALESCE(${b.podType ?? null}, pod_type),
        layout = COALESCE(${b.layout ?? null}, layout),
        occupancy = COALESCE(${b.occupancy == null ? null : Number(b.occupancy)}, occupancy),
        dimensions = COALESCE(${b.dimensions ?? null}, dimensions),
        material = COALESCE(${b.material ?? null}, material),
        base_price = COALESCE(${b.basePrice == null ? null : Number(b.basePrice)}, base_price),
        set_price = COALESCE(${b.setPrice == null ? null : Number(b.setPrice)}, set_price),
        is_active = COALESCE(${b.isActive ?? null}, is_active),
        sort_order = COALESCE(${b.sortOrder == null ? null : Number(b.sortOrder)}, sort_order),
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `);
    const row = (rows as any[])[0];
    if (!row) { set.status = 404; return { success: false, message: 'Pod catalogue model not found' }; }
    return { success: true, model: shapePodCatalogue(row) };
  })

  .delete('/pod-catalogue/:id', async ({ params }) => {
    await db.execute(sql`UPDATE pod_catalogue SET is_active = FALSE, updated_at = NOW() WHERE id = ${params.id}`);
    return { success: true };
  })

  // ─── Users ──────────────────────────────────────────────────
  .get('/users', async ({ query }) => {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    const filtered = (query as any).role ? rows.filter((u) => u.role === (query as any).role) : rows;
    const safe = filtered.map((u) => ({
      id: u.id,
      phone: u.phone,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: u.status,
      kycStatus: u.kycStatus,
      city: u.city,
      createdAt: u.createdAt,
    }));
    return { success: true, count: safe.length, users: safe };
  })

  .patch('/users/:id/status', async ({ params, body, set }) => {
    const [updated] = await db.update(users).set({ status: body.status as any, updatedAt: new Date() }).where(eq(users.id, params.id)).returning();
    if (!updated) {
      set.status = 404;
      return { success: false, message: 'User not found' };
    }
    return { success: true, user: { id: updated.id, status: updated.status } };
  }, { body: t.Object({ status: t.Union([t.Literal('pending'), t.Literal('active'), t.Literal('suspended'), t.Literal('blocked')]) }) })

  // ─── Partners (approve / suspend) ───────────────────────────
  .get('/partners', async () => {
    const rows = await db.select().from(partners).orderBy(desc(partners.createdAt));
    return { success: true, count: rows.length, partners: rows };
  })

  .post('/partners/:id/approve', async ({ params, headers, set }) => {
    const verifiedBy = (headers['x-user-id'] as string) || null;
    const [updated] = await db
      .update(partners)
      .set({ status: 'active', verifiedAt: new Date(), verifiedBy, updatedAt: new Date() })
      .where(eq(partners.id, params.id))
      .returning();
    if (!updated) {
      set.status = 404;
      return { success: false, message: 'Partner not found' };
    }
    return { success: true, partner: { id: updated.id, status: updated.status } };
  })

  .post('/partners/:id/suspend', async ({ params, set }) => {
    const [updated] = await db.update(partners).set({ status: 'suspended', updatedAt: new Date() }).where(eq(partners.id, params.id)).returning();
    if (!updated) {
      set.status = 404;
      return { success: false, message: 'Partner not found' };
    }
    return { success: true, partner: { id: updated.id, status: updated.status } };
  })

  // ─── Bookings (all, enriched) ───────────────────────────────
  .get('/bookings', async ({ query }) => {
    const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(Number((query as any).limit) || 200);
    // enrich with hotel name
    const roomIds = [...new Set(rows.map((b) => b.roomId).filter(Boolean))] as string[];
    const podIds = [...new Set(rows.map((b) => b.podId).filter(Boolean))] as string[];
    const roomRows = roomIds.length ? await db.select().from(rooms).where(inArray(rooms.id, roomIds)) : [];
    const podRows = podIds.length ? await db.select().from(pods).where(inArray(pods.id, podIds)) : [];
    const setRows = await db.select().from(podSets);
    const partnerRows = await db.select().from(partners);
    const pName = (pid?: string) => partnerRows.find((p) => p.id === pid)?.businessName;
    const enriched = rows.map((b) => {
      let hotel: string | undefined;
      if (b.roomId) hotel = pName(roomRows.find((r) => r.id === b.roomId)?.partnerId);
      else if (b.podId) {
        const setId = podRows.find((p) => p.id === b.podId)?.podSetId;
        hotel = pName(setRows.find((s) => s.id === setId)?.partnerId);
      }
      return { ...b, hotelName: hotel || '-' };
    });
    return { success: true, count: enriched.length, bookings: enriched };
  })

  // ─── Payments & payouts ─────────────────────────────────────
  .get('/payments', async () => {
    const rows = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200);
    return { success: true, count: rows.length, payments: rows };
  })

  .get('/payouts', async () => {
    const rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt)).limit(200);
    return { success: true, count: rows.length, payouts: rows };
  })

  .post('/payments/:id/refund', async ({ params, body, headers, set }) => {
    const res = await fetch(`${PAYMENT}/payments/${params.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: body.amount,
        reason: body.reason || 'Admin initiated refund',
        source: body.source || 'admin_manual',
        initiatedBy: headers['x-user-id'] || null,
        initiatedByRole: headers['x-user-role'] || 'admin',
      }),
    });
    const data = await res.json().catch(async () => ({ message: await res.text() }));
    set.status = res.status;
    return data;
  }, {
    body: t.Object({
      amount: t.Optional(t.Number()),
      reason: t.Optional(t.String()),
      source: t.Optional(t.String()),
    }),
  })

  .post('/payouts/generate-partner-settlements', async ({ body }) => {
    const input = body || {};
    const defaults = monthBounds();
    const periodStart = input.periodStart ? new Date(input.periodStart) : defaults.start;
    const periodEnd = input.periodEnd ? new Date(input.periodEnd) : defaults.end;
    const tdsPercent = input.tdsPercent ?? 0;

    const bookingRows = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.status, 'checked_out'), gte(bookings.checkOut, periodStart), lte(bookings.checkOut, periodEnd)));
    if (!bookingRows.length) return { success: true, created: 0, skipped: 0, payouts: [] };

    const bookingIds = bookingRows.map((b) => b.id);
    const paidRows = await db.select().from(payments).where(and(inArray(payments.bookingId, bookingIds), eq(payments.status, 'completed')));
    const paidBookingIds = new Set(paidRows.map((p) => p.bookingId).filter(Boolean));
    const payableBookings = bookingRows.filter((b) => paidBookingIds.has(b.id));

    const roomIds = [...new Set(payableBookings.map((b) => b.roomId).filter(Boolean))] as string[];
    const podIds = [...new Set(payableBookings.map((b) => b.podId).filter(Boolean))] as string[];
    const roomRows = roomIds.length ? await db.select().from(rooms).where(inArray(rooms.id, roomIds)) : [];
    const podRows = podIds.length ? await db.select().from(pods).where(inArray(pods.id, podIds)) : [];
    const setRows = await db.select().from(podSets);
    const partnerRows = await db.select().from(partners);
    const existing = await db.select().from(payouts).where(and(eq(payouts.payoutType, 'partner'), gte(payouts.periodStart, periodStart), lte(payouts.periodEnd, periodEnd)));
    const existingUsers = new Set(existing.map((p) => p.userId));

    const totals = new Map<string, number>();
    for (const booking of payableBookings) {
      let payoutUserId: string | null = null;
      let amount = 0;
      if (booking.roomId) {
        const room = roomRows.find((r) => r.id === booking.roomId);
        const partner = partnerRows.find((p) => p.id === room?.partnerId);
        payoutUserId = partner?.userId || null;
        amount = Number(booking.ownerShare);
      } else if (booking.podId) {
        const pod = podRows.find((p) => p.id === booking.podId);
        const set = setRows.find((s) => s.id === pod?.podSetId);
        const partner = partnerRows.find((p) => p.id === set?.partnerId);
        if (set?.ownership === 'partner') {
          payoutUserId = set.ownerId || partner?.userId || null;
          amount = Number(booking.ownerShare);
        } else if (Number(booking.partnerCommission || 0) > 0) {
          payoutUserId = partner?.userId || null;
          amount = Number(booking.partnerCommission);
        }
      }
      if (!payoutUserId || amount <= 0) continue;
      totals.set(payoutUserId, round2((totals.get(payoutUserId) || 0) + amount));
    }

    const created = [];
    let skipped = 0;
    for (const [userId, amount] of totals) {
      if (existingUsers.has(userId)) { skipped += 1; continue; }
      const tdsDeducted = round2(amount * (tdsPercent / 100));
      const [payout] = await db.insert(payouts).values({
        userId,
        payoutType: 'partner',
        amount: String(amount),
        tdsDeducted: String(tdsDeducted),
        netAmount: String(round2(amount - tdsDeducted)),
        status: 'pending',
        periodStart,
        periodEnd,
      }).returning();
      created.push(payout);
    }

    return { success: true, created: created.length, skipped, payouts: created };
  }, {
    body: t.Optional(t.Object({
      periodStart: t.Optional(t.String()),
      periodEnd: t.Optional(t.String()),
      tdsPercent: t.Optional(t.Number()),
    })),
  })

  .post('/payouts/:id/process', async ({ params, body, set }) => {
    const status = body.status || 'processing';
    const [updated] = await db.update(payouts).set({
      status: status as any,
      transferId: body.transferId ?? null,
      transferMode: body.transferMode ?? 'manual_bank_transfer',
      failureReason: body.failureReason ?? null,
      processedAt: ['completed', 'failed'].includes(status) ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(payouts.id, params.id)).returning();
    if (!updated) {
      set.status = 404;
      return { success: false, message: 'Payout not found' };
    }
    return { success: true, payout: updated };
  }, {
    body: t.Object({
      status: t.Optional(t.Union([t.Literal('processing'), t.Literal('completed'), t.Literal('failed')])) ,
      transferId: t.Optional(t.String()),
      transferMode: t.Optional(t.String()),
      failureReason: t.Optional(t.String()),
    }),
  })

  // ─── Investors (approve) ────────────────────────────────────
  .get('/investors', async () => {
    const rows = await db.select().from(investors).orderBy(desc(investors.createdAt));
    return { success: true, count: rows.length, investors: rows };
  })

  .post('/investors/:id/approve', async ({ params, headers, set }) => {
    const approvedBy = (headers['x-user-id'] as string) || null;
    const [updated] = await db
      .update(investors)
      .set({ status: 'approved', approvedAt: new Date(), approvedBy, updatedAt: new Date() })
      .where(eq(investors.id, params.id))
      .returning();
    if (!updated) {
      set.status = 404;
      return { success: false, message: 'Investor not found' };
    }
    return { success: true, investor: { id: updated.id, status: updated.status } };
  })

  ;
const app = registerAdminErp(registerAdminQlo2(registerAdminQlo(appBase))).listen({
    hostname: process.env.ADMIN_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.ADMIN_SERVICE_PORT || 3011),
  });

console.log(`🛡️  Naploo Admin Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
