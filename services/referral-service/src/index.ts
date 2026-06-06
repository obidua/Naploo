import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { associates, referrals, referralEarnings, users } from '@naploo/db/schema';
import { eq, desc } from 'drizzle-orm';

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'referral-service', timestamp: new Date().toISOString() }))

  // ─── Enroll as associate (builds 5-level upline chain) ──────
  // path under gateway: /api/v1/associates/enroll → /enroll
  .post('/enroll', async ({ headers, body, set }) => {
    const userId = (headers['x-user-id'] as string) || (body as any)?.userId;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [existing] = await db.select().from(associates).where(eq(associates.userId, userId));
    if (existing) return { success: true, associate: existing, alreadyEnrolled: true };

    // Resolve upline from referralCode (= referrer user's referralCode) if provided
    let parent: typeof associates.$inferSelect | undefined;
    if (body.referralCode) {
      const [refUser] = await db.select().from(users).where(eq(users.referralCode, body.referralCode));
      if (refUser) {
        [parent] = await db.select().from(associates).where(eq(associates.userId, refUser.id));
      }
    }

    const [created] = await db
      .insert(associates)
      .values({
        userId,
        parentId: parent?.id ?? null,
        level1Id: parent?.id ?? null,
        level2Id: parent?.level1Id ?? null,
        level3Id: parent?.level2Id ?? null,
        level4Id: parent?.level3Id ?? null,
        level5Id: parent?.level4Id ?? null,
      })
      .returning();

    // credit the direct upline's referral count
    if (parent) {
      await db
        .update(associates)
        .set({ totalReferrals: (parent.totalReferrals ?? 0) + 1, updatedAt: new Date() })
        .where(eq(associates.id, parent.id));
    }
    set.status = 201;
    return { success: true, associate: created };
  }, { body: t.Object({ referralCode: t.Optional(t.String()), userId: t.Optional(t.String()) }) })

  // ─── My associate dashboard ─────────────────────────────────
  .get('/me', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [associate] = await db.select().from(associates).where(eq(associates.userId, userId));
    if (!associate) return { success: true, enrolled: false, associate: null, referrals: [], earnings: [] };
    const myReferrals = await db.select().from(referrals).where(eq(referrals.associateId, associate.id)).orderBy(desc(referrals.createdAt));
    const myEarnings = await db.select().from(referralEarnings).where(eq(referralEarnings.associateId, associate.id)).orderBy(desc(referralEarnings.createdAt));
    return { success: true, enrolled: true, associate, referrals: myReferrals, earnings: myEarnings };
  })

  .listen({
    hostname: process.env.REFERRAL_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.REFERRAL_SERVICE_PORT || 3005),
  });

console.log(`🔗 Naploo Referral Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
