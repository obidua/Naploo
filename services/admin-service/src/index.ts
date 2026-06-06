import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { users, partners, bookings, payments, payouts, rooms, pods, podSets, investors } from '@naploo/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

// Gateway mounts this at /api/v1/admin/* (admin role enforced there) and
// strips the /admin prefix, so handlers see /users, /partners, etc.
const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'admin-service', timestamp: new Date().toISOString() }))

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

  .listen({
    hostname: process.env.ADMIN_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.ADMIN_SERVICE_PORT || 3011),
  });

console.log(`🛡️  Naploo Admin Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
