import { registerInvestorOffers } from "./qlo2";
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { investors, investments, investmentEarnings, users } from '@naploo/db/schema';
import { eq, desc } from 'drizzle-orm';

const PRICE_PER_SET = 500000; // ₹5 Lac per pod set
const GST_RATE = 0.18;

function genInvoice(): string {
  return `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

const appBase = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'investor-service', timestamp: new Date().toISOString() }))

  // ─── Enroll as investor (idempotent) ────────────────────────
  .post('/enroll', async ({ headers, body, set }) => {
    const userId = (headers['x-user-id'] as string) || (body as any)?.userId;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [existing] = await db.select().from(investors).where(eq(investors.userId, userId));
    if (existing) return { success: true, investor: existing, alreadyEnrolled: true };
    const [created] = await db.insert(investors).values({ userId, status: 'pending' }).returning();
    set.status = 201;
    return { success: true, investor: created };
  }, { body: t.Optional(t.Object({ userId: t.Optional(t.String()) })) })

  // ─── My investor profile + investments + earnings ───────────
  .get('/me', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [investor] = await db.select().from(investors).where(eq(investors.userId, userId));
    if (!investor) return { success: true, enrolled: false, investor: null, investments: [] };
    const myInvestments = await db.select().from(investments).where(eq(investments.investorId, investor.id)).orderBy(desc(investments.createdAt));
    return { success: true, enrolled: true, investor, investments: myInvestments };
  })

  // ─── Create an investment (claim pod sets) ──────────────────
  .post('/invest', async ({ headers, body, set }) => {
    const userId = headers['x-user-id'] as string;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [investor] = await db.select().from(investors).where(eq(investors.userId, userId));
    if (!investor) {
      set.status = 400;
      return { success: false, message: 'Enroll as an investor first' };
    }
    if (!['approved', 'active'].includes(investor.status)) {
      set.status = 403;
      return { success: false, message: 'Your investor account is pending admin approval' };
    }
    const count = body.podSetCount ?? 1;
    const base = count * PRICE_PER_SET;
    const gst = Math.round(base * GST_RATE);
    const total = base + gst;
    const guarantee = total * 3;
    const [inv] = await db
      .insert(investments)
      .values({
        investorId: investor.id,
        podSetId: body.podSetId,
        invoiceNumber: genInvoice(),
        podSetCount: count,
        pricePerSet: String(PRICE_PER_SET),
        gstAmount: String(gst),
        totalAmount: String(total),
        deliveryOption: (body.deliveryOption as any) ?? 'leaseback',
        guaranteeAmount: String(guarantee),
        status: 'pending',
      })
      .returning();
    // bump investor totals
    await db
      .update(investors)
      .set({
        totalInvested: String(Number(investor.totalInvested) + total),
        totalPodSets: (investor.totalPodSets ?? 0) + count,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(investors.id, investor.id));
    set.status = 201;
    return { success: true, investment: inv };
  }, {
    body: t.Object({
      podSetCount: t.Optional(t.Number()),
      podSetId: t.Optional(t.String()),
      deliveryOption: t.Optional(t.String()),
    }),
  })

  // ─── Earnings for an investment ─────────────────────────────
  .get('/investments/:id/earnings', async ({ params }) => {
    const rows = await db.select().from(investmentEarnings).where(eq(investmentEarnings.investmentId, params.id)).orderBy(desc(investmentEarnings.createdAt));
    return { success: true, count: rows.length, earnings: rows };
  })

  ;
const app = registerInvestorOffers(appBase).listen({
    hostname: process.env.INVESTOR_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.INVESTOR_SERVICE_PORT || 3004),
  });

console.log(`💰 Naploo Investor Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
