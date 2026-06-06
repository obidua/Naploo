import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import { partners, rooms, podSets } from '@naploo/db/schema';
import { eq, and } from 'drizzle-orm';

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      let parsed = JSON.parse(value);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return parsed as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

const num = (v: unknown): number | null => (v == null || v === '' ? null : Number(v));

// Haversine distance in km between two lat/lng points
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Build hotel cards (summary) for a set of active partners
async function buildCards(rows: any[]) {
  const ids = rows.map((r) => r.id);
  if (!ids.length) return [];
  const allRooms = await db.select().from(rooms);
  const allSets = await db.select().from(podSets);
  return rows.map((p) => {
    const pRooms = allRooms.filter((r) => r.partnerId === p.id && r.isActive);
    const pSets = allSets.filter((s) => s.partnerId === p.id && s.isActive);
    const roomRates = pRooms.map((r) => Number(r.dailyRate)).filter((n) => !isNaN(n));
    const podRates = pSets.map((s) => Number(s.hourlyRate)).filter((n) => !isNaN(n));
    return {
      id: p.id,
      businessName: p.businessName,
      businessType: p.businessType,
      description: p.description,
      address: p.address,
      city: p.city,
      state: p.state,
      latitude: num(p.latitude),
      longitude: num(p.longitude),
      images: parseJson<string[]>(p.images, []),
      amenities: parseJson<string[]>(p.amenities, []),
      rating: num(p.rating) ?? 0,
      totalReviews: p.totalReviews ?? 0,
      minRoomRate: roomRates.length ? Math.min(...roomRates) : null,
      minPodHourlyRate: podRates.length ? Math.min(...podRates) : null,
      roomCount: pRooms.length,
      podSetCount: pSets.length,
      hasPods: pSets.length > 0,
      hasRooms: pRooms.length > 0,
    };
  });
}

function applyFilters(cards: any[], q: any) {
  let out = cards;
  if (q.q) {
    const term = String(q.q).toLowerCase();
    out = out.filter(
      (c) =>
        c.businessName?.toLowerCase().includes(term) ||
        c.city?.toLowerCase().includes(term) ||
        c.address?.toLowerCase().includes(term)
    );
  }
  if (q.type) out = out.filter((c) => c.businessType === q.type);
  if (q.hasPods === 'true') out = out.filter((c) => c.hasPods);
  if (q.hasRooms === 'true') out = out.filter((c) => c.hasRooms);
  if (q.minPrice) out = out.filter((c) => (c.minRoomRate ?? c.minPodHourlyRate ?? 0) >= Number(q.minPrice));
  if (q.maxPrice) {
    out = out.filter((c) => {
      const price = c.minRoomRate ?? c.minPodHourlyRate;
      return price == null ? true : price <= Number(q.maxPrice);
    });
  }
  return out;
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: { info: { title: 'Naploo Search Service', version: '1.0.0', description: 'Hotel/pod search & nearby discovery' } },
    })
  )

  .get('/health', () => ({ status: 'healthy', service: 'search-service', timestamp: new Date().toISOString() }))

  // ─── Search by query / city / filters ───────────────────────
  .get(
    '/search',
    async ({ query }) => {
      const conds = [eq(partners.status, 'active')];
      if (query.city) conds.push(eq(partners.city, query.city));
      const rows = await db.select().from(partners).where(and(...conds));
      let cards = await buildCards(rows);
      cards = applyFilters(cards, query);

      // Sort
      if (query.sort === 'price_asc') cards.sort((a, b) => (a.minRoomRate ?? a.minPodHourlyRate ?? 1e9) - (b.minRoomRate ?? b.minPodHourlyRate ?? 1e9));
      else if (query.sort === 'price_desc') cards.sort((a, b) => (b.minRoomRate ?? b.minPodHourlyRate ?? 0) - (a.minRoomRate ?? a.minPodHourlyRate ?? 0));
      else cards.sort((a, b) => b.rating - a.rating);

      return { success: true, count: cards.length, results: cards };
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        city: t.Optional(t.String()),
        type: t.Optional(t.String()),
        hasPods: t.Optional(t.String()),
        hasRooms: t.Optional(t.String()),
        minPrice: t.Optional(t.String()),
        maxPrice: t.Optional(t.String()),
        sort: t.Optional(t.String()),
      }),
    }
  )

  // ─── Nearby (geolocation) ───────────────────────────────────
  .get(
    '/nearby',
    async ({ query, set }) => {
      const lat = Number(query.lat);
      const lng = Number(query.lng);
      if (isNaN(lat) || isNaN(lng)) {
        set.status = 400;
        return { success: false, message: 'lat and lng are required numbers' };
      }
      const radius = query.radius ? Number(query.radius) : 25; // km
      const rows = await db.select().from(partners).where(eq(partners.status, 'active'));
      let cards = await buildCards(rows);
      cards = applyFilters(cards, query);

      const withDistance = cards
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => ({ ...c, distanceKm: Math.round(distanceKm(lat, lng, c.latitude!, c.longitude!) * 10) / 10 }))
        .filter((c) => c.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return { success: true, count: withDistance.length, origin: { lat, lng }, radius, results: withDistance };
    },
    {
      query: t.Object({
        lat: t.String(),
        lng: t.String(),
        radius: t.Optional(t.String()),
        type: t.Optional(t.String()),
        hasPods: t.Optional(t.String()),
        hasRooms: t.Optional(t.String()),
        minPrice: t.Optional(t.String()),
        maxPrice: t.Optional(t.String()),
      }),
    }
  )

  // ─── Cities with hotel counts (for explore screens) ─────────
  .get('/cities', async () => {
    const rows = await db.select().from(partners).where(eq(partners.status, 'active'));
    const map = new Map<string, { city: string; state: string; count: number }>();
    for (const p of rows) {
      const key = `${p.city}|${p.state}`;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { city: p.city, state: p.state, count: 1 });
    }
    const cities = [...map.values()].sort((a, b) => b.count - a.count);
    return { success: true, count: cities.length, cities };
  })

  .listen({
    hostname: process.env.SEARCH_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.SEARCH_SERVICE_PORT || 3010),
  });

console.log(`🔎 Naploo Search Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
