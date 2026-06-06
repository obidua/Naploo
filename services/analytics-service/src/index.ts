import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { bookings, users, partners, rooms, podSets, pods, payments } from '@naploo/db/schema';

const REVENUE_STATUSES = ['confirmed', 'checked_in', 'checked_out'];

function sum(arr: any[], pick: (x: any) => number): number {
  return Math.round(arr.reduce((s, x) => s + (pick(x) || 0), 0) * 100) / 100;
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'analytics-service', timestamp: new Date().toISOString() }))

  // ─── Headline KPIs for the admin dashboard ──────────────────
  .get('/overview', async () => {
    const [allBookings, allUsers, allPartners, allRooms, allSets, allPods, allPayments] = await Promise.all([
      db.select().from(bookings),
      db.select().from(users),
      db.select().from(partners),
      db.select().from(rooms),
      db.select().from(podSets),
      db.select().from(pods),
      db.select().from(payments),
    ]);

    const revenueBookings = allBookings.filter((b) => REVENUE_STATUSES.includes(b.status));
    const totalRevenue = sum(revenueBookings, (b) => Number(b.total));
    const naplooRevenue = sum(revenueBookings, (b) => Number(b.naplooShare));
    const partnerRevenue = sum(revenueBookings, (b) => Number(b.ownerShare));
    const collected = sum(allPayments.filter((p) => p.status === 'completed'), (p) => Number(p.amount));

    const byStatus: Record<string, number> = {};
    for (const b of allBookings) byStatus[b.status] = (byStatus[b.status] || 0) + 1;

    const podBookings = allBookings.filter((b) => b.bookingType === 'pod').length;
    const roomBookings = allBookings.filter((b) => b.bookingType === 'room').length;

    const usersByRole: Record<string, number> = {};
    for (const u of allUsers) usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;

    return {
      success: true,
      overview: {
        totalRevenue,
        naplooRevenue,
        partnerRevenue,
        amountCollected: collected,
        totalBookings: allBookings.length,
        podBookings,
        roomBookings,
        bookingsByStatus: byStatus,
        totalUsers: allUsers.length,
        usersByRole,
        totalPartners: allPartners.length,
        activePartners: allPartners.filter((p) => p.status === 'active').length,
        pendingPartners: allPartners.filter((p) => p.status === 'pending').length,
        totalRooms: allRooms.length,
        totalPodSets: allSets.length,
        totalPods: allPods.length,
        averageBookingValue: revenueBookings.length ? Math.round(totalRevenue / revenueBookings.length) : 0,
      },
    };
  })

  // ─── Revenue time-series (by day) ───────────────────────────
  .get('/revenue', async ({ query }) => {
    const days = Math.min(180, Math.max(1, Number((query as any).days) || 30));
    const since = new Date(Date.now() - days * 86400000);
    const rows = await db.select().from(bookings);
    const buckets = new Map<string, { date: string; revenue: number; bookings: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      buckets.set(d, { date: d, revenue: 0, bookings: 0 });
    }
    for (const b of rows) {
      if (!REVENUE_STATUSES.includes(b.status)) continue;
      const created = new Date(b.createdAt);
      if (created < since) continue;
      const key = created.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += Number(b.total) || 0;
        bucket.bookings += 1;
      }
    }
    const series = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date)).map((x) => ({ ...x, revenue: Math.round(x.revenue) }));
    return { success: true, days, series };
  })

  // ─── Top hotels by revenue ──────────────────────────────────
  .get('/top-hotels', async () => {
    const [allBookings, allPartners, allRooms, allSets, allPods] = await Promise.all([
      db.select().from(bookings),
      db.select().from(partners),
      db.select().from(rooms),
      db.select().from(podSets),
      db.select().from(pods),
    ]);
    // Map room/pod → partner
    const roomPartner = new Map(allRooms.map((r) => [r.id, r.partnerId]));
    const setPartner = new Map(allSets.map((s) => [s.id, s.partnerId]));
    const podSetOf = new Map(allPods.map((p) => [p.id, p.podSetId]));

    const revByPartner = new Map<string, { revenue: number; bookings: number }>();
    for (const b of allBookings) {
      if (!REVENUE_STATUSES.includes(b.status)) continue;
      let partnerId: string | undefined;
      if (b.roomId) partnerId = roomPartner.get(b.roomId);
      else if (b.podId) {
        const setId = podSetOf.get(b.podId);
        if (setId) partnerId = setPartner.get(setId);
      }
      if (!partnerId) continue;
      const cur = revByPartner.get(partnerId) || { revenue: 0, bookings: 0 };
      cur.revenue += Number(b.total) || 0;
      cur.bookings += 1;
      revByPartner.set(partnerId, cur);
    }
    const top = [...revByPartner.entries()]
      .map(([partnerId, v]) => {
        const p = allPartners.find((x) => x.id === partnerId);
        return { partnerId, name: p?.businessName || 'Unknown', city: p?.city, revenue: Math.round(v.revenue), bookings: v.bookings };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    return { success: true, topHotels: top };
  })

  .listen({
    hostname: process.env.ANALYTICS_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.ANALYTICS_SERVICE_PORT || 3009),
  });

console.log(`📊 Naploo Analytics Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
