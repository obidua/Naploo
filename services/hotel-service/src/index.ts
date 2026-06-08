import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import { partners, rooms, podSets, pods } from '@naploo/db/schema';
import { eq, and, inArray, or } from 'drizzle-orm';

// ─── Helpers ──────────────────────────────────────────────────
// Columns like amenities/images are stored as jsonb but were seeded as
// JSON strings (sometimes double-encoded). Parse defensively.
function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (Array.isArray(value) || (typeof value === 'object')) return value as T;
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

function shapeHotel(p: any) {
  return {
    id: p.id,
    userId: p.userId,
    businessName: p.businessName,
    businessType: p.businessType,
    partnershipModel: p.partnershipModel,
    description: p.description,
    address: p.address,
    city: p.city,
    state: p.state,
    pincode: p.pincode,
    latitude: num(p.latitude),
    longitude: num(p.longitude),
    contactPerson: p.contactPerson,
    contactPhone: p.contactPhone,
    contactEmail: p.contactEmail,
    amenities: parseJson<string[]>(p.amenities, []),
    images: parseJson<string[]>(p.images, []),
    rating: num(p.rating) ?? 0,
    totalReviews: p.totalReviews ?? 0,
    status: p.status,
    createdAt: p.createdAt,
  };
}

function shapeRoom(r: any) {
  return {
    id: r.id,
    partnerId: r.partnerId,
    roomNumber: r.roomNumber,
    name: r.name,
    roomType: r.roomType,
    floor: r.floor,
    maxGuests: r.maxGuests,
    bedType: r.bedType,
    numBeds: r.numBeds,
    areaSqFt: r.areaSqFt,
    dailyRate: num(r.dailyRate) ?? 0,
    weeklyRate: num(r.weeklyRate),
    extraGuestCharge: num(r.extraGuestCharge) ?? 0,
    status: r.status,
    isActive: r.isActive,
    amenities: parseJson<string[]>(r.amenities, []),
    images: parseJson<string[]>(r.images, []),
    description: r.description,
    checkInTime: r.checkInTime,
    checkOutTime: r.checkOutTime,
  };
}

function shapePodSet(ps: any, podList: any[]) {
  const setPods = podList.filter((p) => p.podSetId === ps.id);
  return {
    id: ps.id,
    partnerId: ps.partnerId,
    ownerId: ps.ownerId,
    ownership: ps.ownership,
    floor: ps.floor,
    section: ps.section,
    setNumber: ps.setNumber,
    hourlyRate: num(ps.hourlyRate) ?? 0,
    isActive: ps.isActive,
    pods: setPods.map((p) => ({
      id: p.id,
      partnerId: p.partnerId,
      podSetId: p.podSetId,
      podNumber: p.podNumber,
      displayName: p.displayName,
      position: p.position,
      podType: p.podType,
      maxOccupancy: p.maxOccupancy ?? (p.podType === 'double' ? 2 : p.podType === 'king' ? 3 : 1),
      dimensions: p.dimensions,
      hourlyRate: num(p.hourlyRate) ?? num(ps.hourlyRate) ?? 0,
      isStandalone: !!p.isStandalone,
      status: p.status,
      features: {
        hasAC: p.hasAC,
        hasTV: p.hasTV,
        hasCharger: p.hasCharger,
        hasLight: p.hasLight,
        hasVentilation: p.hasVentilation,
      },
    })),
  };
}

function shapeStandalonePod(p: any) {
  return {
    id: p.id,
    partnerId: p.partnerId,
    podSetId: p.podSetId,
    podNumber: p.podNumber,
    displayName: p.displayName,
    position: p.position,
    podType: p.podType,
    maxOccupancy: p.maxOccupancy ?? (p.podType === 'double' ? 2 : p.podType === 'king' ? 3 : 1),
    dimensions: p.dimensions,
    hourlyRate: num(p.hourlyRate) ?? 0,
    isStandalone: !!p.isStandalone,
    status: p.status,
    features: {
      hasAC: p.hasAC,
      hasTV: p.hasTV,
      hasCharger: p.hasCharger,
      hasLight: p.hasLight,
      hasVentilation: p.hasVentilation,
    },
  };
}

const occupancyForType = (type?: string, override?: number) => {
  if (override && override > 0) return override;
  if (type === 'king') return 3;
  if (type === 'double') return 2;
  return 1;
};

const autoPodNumber = (prefix: string, suffix: string) => `${prefix}-${suffix}`;

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: { title: 'Naploo Hotel Service', version: '1.0.0', description: 'Hotels, rooms & pods inventory + partner management' },
      },
    })
  )

  .get('/health', () => ({ status: 'healthy', service: 'hotel-service', timestamp: new Date().toISOString() }))

  // ─── List hotels (customer-facing) ──────────────────────────
  .get(
    '/hotels',
    async ({ query }) => {
      const conds = [eq(partners.status, 'active')];
      if (query.city) conds.push(eq(partners.city, query.city));
      if (query.type) conds.push(eq(partners.businessType, query.type as 'hotel' | 'homestay'));

      const rows = await db.select().from(partners).where(and(...conds));
      const ids = rows.map((r) => r.id);

      const allRooms = ids.length ? await db.select().from(rooms).where(inArray(rooms.partnerId, ids)) : [];
      const allSets = ids.length ? await db.select().from(podSets).where(inArray(podSets.partnerId, ids)) : [];
      const allPods = ids.length ? await db.select().from(pods).where(inArray(pods.partnerId, ids)) : [];

      const data = rows.map((p) => {
        const pRooms = allRooms.filter((r) => r.partnerId === p.id && r.isActive);
        const pSets = allSets.filter((s) => s.partnerId === p.id && s.isActive);
        const pStandalonePods = allPods.filter((pod) => pod.partnerId === p.id && (!pod.podSetId || pod.isStandalone) && pod.status !== 'inactive');
        const roomRates = pRooms.map((r) => Number(r.dailyRate)).filter((n) => !isNaN(n));
        const podRates = [
          ...pSets.map((s) => Number(s.hourlyRate)),
          ...pStandalonePods.map((pod) => Number(pod.hourlyRate)),
        ].filter((n) => !isNaN(n));
        return {
          ...shapeHotel(p),
          summary: {
            roomCount: pRooms.length,
            podSetCount: pSets.length,
            standalonePodCount: pStandalonePods.length,
            podCount: pSets.length * 2 + pStandalonePods.length,
            minRoomRate: roomRates.length ? Math.min(...roomRates) : null,
            minPodHourlyRate: podRates.length ? Math.min(...podRates) : null,
            hasPods: pSets.length > 0 || pStandalonePods.length > 0,
            hasRooms: pRooms.length > 0,
          },
        };
      });

      return { success: true, count: data.length, hotels: data };
    },
    { query: t.Object({ city: t.Optional(t.String()), type: t.Optional(t.String()) }) }
  )

  // ─── My hotel (partner portal) — resolves via gateway-injected x-user-id
  .get('/hotels/me', async ({ headers, set }) => {
    const userId = headers['x-user-id'] as string | undefined;
    if (!userId) {
      set.status = 401;
      return { success: false, message: 'Authentication required' };
    }
    const [p] = await db.select().from(partners).where(eq(partners.userId, userId));
    if (!p) {
      set.status = 404;
      return { success: false, message: 'No partner profile for this user' };
    }
    const pRooms = await db.select().from(rooms).where(eq(rooms.partnerId, p.id));
    const pSets = await db.select().from(podSets).where(eq(podSets.partnerId, p.id));
    const setIds = pSets.map((s) => s.id);
    const pPods = await db.select().from(pods).where(or(eq(pods.partnerId, p.id), setIds.length ? inArray(pods.podSetId, setIds) : eq(pods.partnerId, p.id)));
    return {
      success: true,
      hotel: {
        ...shapeHotel(p),
        rooms: pRooms.map(shapeRoom),
        podSets: pSets.map((s) => shapePodSet(s, pPods)),
        standalonePods: pPods.filter((pod) => !pod.podSetId || pod.isStandalone).map(shapeStandalonePod),
      },
    };
  })

  // ─── Hotel detail with full inventory ───────────────────────
  .get('/hotels/:id', async ({ params, set }) => {
    const [p] = await db.select().from(partners).where(eq(partners.id, params.id));
    if (!p) {
      set.status = 404;
      return { success: false, message: 'Hotel not found' };
    }
    const pRooms = await db.select().from(rooms).where(eq(rooms.partnerId, p.id));
    const pSets = await db.select().from(podSets).where(eq(podSets.partnerId, p.id));
    const setIds = pSets.map((s) => s.id);
    const pPods = await db.select().from(pods).where(or(eq(pods.partnerId, p.id), setIds.length ? inArray(pods.podSetId, setIds) : eq(pods.partnerId, p.id)));

    return {
      success: true,
      hotel: {
        ...shapeHotel(p),
        rooms: pRooms.map(shapeRoom),
        podSets: pSets.map((s) => shapePodSet(s, pPods)),
        standalonePods: pPods.filter((pod) => !pod.podSetId || pod.isStandalone).map(shapeStandalonePod),
      },
    };
  })

  // ─── Rooms for a hotel ──────────────────────────────────────
  .get('/hotels/:id/rooms', async ({ params }) => {
    const pRooms = await db.select().from(rooms).where(eq(rooms.partnerId, params.id));
    return { success: true, count: pRooms.length, rooms: pRooms.map(shapeRoom) };
  })

  // ─── Pod sets for a hotel ───────────────────────────────────
  .get('/hotels/:id/pods', async ({ params }) => {
    const pSets = await db.select().from(podSets).where(eq(podSets.partnerId, params.id));
    const setIds = pSets.map((s) => s.id);
    const pPods = await db.select().from(pods).where(or(eq(pods.partnerId, params.id), setIds.length ? inArray(pods.podSetId, setIds) : eq(pods.partnerId, params.id)));
    return {
      success: true,
      count: pSets.length,
      podSets: pSets.map((s) => shapePodSet(s, pPods)),
      standalonePods: pPods.filter((pod) => !pod.podSetId || pod.isStandalone).map(shapeStandalonePod),
    };
  })

  .get('/rooms/:id', async ({ params, set }) => {
    const [r] = await db.select().from(rooms).where(eq(rooms.id, params.id));
    if (!r) {
      set.status = 404;
      return { success: false, message: 'Room not found' };
    }
    return { success: true, room: shapeRoom(r) };
  })

  .get('/pod-sets/:id', async ({ params, set }) => {
    const [s] = await db.select().from(podSets).where(eq(podSets.id, params.id));
    if (!s) {
      set.status = 404;
      return { success: false, message: 'Pod set not found' };
    }
    const pPods = await db.select().from(pods).where(eq(pods.podSetId, s.id));
    return { success: true, podSet: shapePodSet(s, pPods) };
  })

  // ═══ PARTNER MANAGEMENT (used by partner portal/app) ═══════
  // NOTE: ownership (partnerId belongs to caller) is enforced at the
  // gateway/auth layer; these accept partnerId directly for now.

  // Create / add a room to a hotel
  .post(
    '/hotels/:id/rooms',
    async ({ params, body, set }) => {
      const [partner] = await db.select().from(partners).where(eq(partners.id, params.id));
      if (!partner) {
        set.status = 404;
        return { success: false, message: 'Hotel not found' };
      }
      const [created] = await db
        .insert(rooms)
        .values({
          partnerId: params.id,
          roomNumber: body.roomNumber,
          name: body.name,
          roomType: (body.roomType as any) ?? 'standard',
          floor: body.floor ?? 1,
          maxGuests: body.maxGuests ?? 2,
          bedType: (body.bedType as any) ?? 'double',
          numBeds: body.numBeds ?? 1,
          areaSqFt: body.areaSqFt,
          dailyRate: String(body.dailyRate),
          weeklyRate: body.weeklyRate != null ? String(body.weeklyRate) : null,
          extraGuestCharge: body.extraGuestCharge != null ? String(body.extraGuestCharge) : '500',
          amenities: (body.amenities ?? []) as any,
          images: (body.images ?? []) as any,
          description: body.description,
        })
        .returning();
      set.status = 201;
      return { success: true, room: shapeRoom(created) };
    },
    {
      body: t.Object({
        roomNumber: t.String(),
        name: t.Optional(t.String()),
        roomType: t.Optional(t.String()),
        floor: t.Optional(t.Number()),
        maxGuests: t.Optional(t.Number()),
        bedType: t.Optional(t.String()),
        numBeds: t.Optional(t.Number()),
        areaSqFt: t.Optional(t.Number()),
        dailyRate: t.Number(),
        weeklyRate: t.Optional(t.Number()),
        extraGuestCharge: t.Optional(t.Number()),
        amenities: t.Optional(t.Array(t.String())),
        images: t.Optional(t.Array(t.String())),
        description: t.Optional(t.String()),
      }),
    }
  )

  // Update a room (incl. pricing + status)
  .patch(
    '/rooms/:id',
    async ({ params, body, set }) => {
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name !== undefined) update.name = body.name;
      if (body.roomType !== undefined) update.roomType = body.roomType;
      if (body.maxGuests !== undefined) update.maxGuests = body.maxGuests;
      if (body.bedType !== undefined) update.bedType = body.bedType;
      if (body.numBeds !== undefined) update.numBeds = body.numBeds;
      if (body.dailyRate !== undefined) update.dailyRate = String(body.dailyRate);
      if (body.weeklyRate !== undefined) update.weeklyRate = body.weeklyRate != null ? String(body.weeklyRate) : null;
      if (body.extraGuestCharge !== undefined) update.extraGuestCharge = String(body.extraGuestCharge);
      if (body.amenities !== undefined) update.amenities = body.amenities as any;
      if (body.images !== undefined) update.images = body.images as any;
      if (body.description !== undefined) update.description = body.description;
      if (body.status !== undefined) update.status = body.status;
      if (body.isActive !== undefined) update.isActive = body.isActive;

      const [updated] = await db.update(rooms).set(update).where(eq(rooms.id, params.id)).returning();
      if (!updated) {
        set.status = 404;
        return { success: false, message: 'Room not found' };
      }
      return { success: true, room: shapeRoom(updated) };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        roomType: t.Optional(t.String()),
        maxGuests: t.Optional(t.Number()),
        bedType: t.Optional(t.String()),
        numBeds: t.Optional(t.Number()),
        dailyRate: t.Optional(t.Number()),
        weeklyRate: t.Optional(t.Number()),
        extraGuestCharge: t.Optional(t.Number()),
        amenities: t.Optional(t.Array(t.String())),
        images: t.Optional(t.Array(t.String())),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  // Add a pod set (2 stacked pods) or a standalone single pod to a hotel
  .post(
    '/hotels/:id/pod-sets',
    async ({ params, body, set }) => {
      const [partner] = await db.select().from(partners).where(eq(partners.id, params.id));
      if (!partner) {
        set.status = 404;
        return { success: false, message: 'Hotel not found' };
      }
      const podType = (body.podType as any) ?? 'single';
      const maxOccupancy = occupancyForType(body.podType, body.maxOccupancy);
      if (body.mode === 'single') {
        const podNumber = body.podNumber || autoPodNumber(body.setNumber || 'POD', 'S');
        const [createdPod] = await db
          .insert(pods)
          .values({
            partnerId: params.id,
            podSetId: null,
            podNumber,
            displayName: body.podName,
            position: 'single',
            podType,
            maxOccupancy,
            dimensions: body.dimensions,
            hourlyRate: String(body.hourlyRate ?? 150),
            isStandalone: true,
          })
          .returning();
        set.status = 201;
        return { success: true, pod: shapeStandalonePod(createdPod) };
      }
      const [createdSet] = await db
        .insert(podSets)
        .values({
          partnerId: params.id,
          ownerId: body.ownerId,
          ownership: (body.ownership as any) ?? 'naploo',
          floor: body.floor ?? 1,
          section: body.section,
          setNumber: body.setNumber,
          hourlyRate: String(body.hourlyRate ?? 150),
        })
        .returning();

      // Auto-create the two stacked pods (upper + lower), with optional manual numbers/names.
      const created = await db
        .insert(pods)
        .values([
          {
            partnerId: params.id,
            podSetId: createdSet.id,
            podNumber: body.upperPodNumber || autoPodNumber(body.setNumber, 'U'),
            displayName: body.upperPodName,
            position: 'upper',
            podType,
            maxOccupancy,
            dimensions: body.dimensions,
            hourlyRate: body.upperHourlyRate != null ? String(body.upperHourlyRate) : null,
            isStandalone: false,
          },
          {
            partnerId: params.id,
            podSetId: createdSet.id,
            podNumber: body.lowerPodNumber || autoPodNumber(body.setNumber, 'L'),
            displayName: body.lowerPodName,
            position: 'lower',
            podType,
            maxOccupancy,
            dimensions: body.dimensions,
            hourlyRate: body.lowerHourlyRate != null ? String(body.lowerHourlyRate) : null,
            isStandalone: false,
          },
        ])
        .returning();

      set.status = 201;
      return { success: true, podSet: shapePodSet(createdSet, created) };
    },
    {
      body: t.Object({
        mode: t.Optional(t.Union([t.Literal('set'), t.Literal('single')])),
        setNumber: t.String(),
        podNumber: t.Optional(t.String()),
        podName: t.Optional(t.String()),
        upperPodNumber: t.Optional(t.String()),
        upperPodName: t.Optional(t.String()),
        lowerPodNumber: t.Optional(t.String()),
        lowerPodName: t.Optional(t.String()),
        podType: t.Optional(t.Union([t.Literal('single'), t.Literal('double'), t.Literal('king')])),
        maxOccupancy: t.Optional(t.Number()),
        dimensions: t.Optional(t.String()),
        hourlyRate: t.Optional(t.Number()),
        upperHourlyRate: t.Optional(t.Number()),
        lowerHourlyRate: t.Optional(t.Number()),
        ownership: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        floor: t.Optional(t.Number()),
        section: t.Optional(t.String()),
      }),
    }
  )

  // Update a pod set (pricing / active)
  .patch(
    '/pod-sets/:id',
    async ({ params, body, set }) => {
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (body.hourlyRate !== undefined) update.hourlyRate = String(body.hourlyRate);
      if (body.section !== undefined) update.section = body.section;
      if (body.floor !== undefined) update.floor = body.floor;
      if (body.isActive !== undefined) update.isActive = body.isActive;

      const [updated] = await db.update(podSets).set(update).where(eq(podSets.id, params.id)).returning();
      if (!updated) {
        set.status = 404;
        return { success: false, message: 'Pod set not found' };
      }
      const pPods = await db.select().from(pods).where(eq(pods.podSetId, updated.id));
      return { success: true, podSet: shapePodSet(updated, pPods) };
    },
    {
      body: t.Object({
        hourlyRate: t.Optional(t.Number()),
        section: t.Optional(t.String()),
        floor: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  .listen({
    hostname: process.env.HOTEL_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.HOTEL_SERVICE_PORT || 3007),
  });

console.log(`🏨 Naploo Hotel Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
