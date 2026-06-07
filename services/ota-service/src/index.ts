// OTA Sync API — public REST endpoints for OTAs (Yatra/MMT/Goibibo/etc.) to read
// inventory/availability/rates and post bookings. Authed via X-Naploo-Api-Key header.
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from '@naploo/db';
import { partners, rooms, podSets, pods, bookings, users } from '@naploo/db/schema';
import { eq, and, sql, inArray, lt, gt } from 'drizzle-orm';
import { randomBytes, createHash, randomUUID } from 'crypto';

const ACTIVE = ['pending', 'confirmed', 'checked_in'];

function hashKey(k: string): string {
  return createHash('sha256').update(k).digest('hex');
}

function genApiKey(): { full: string; prefix: string } {
  const raw = randomBytes(24).toString('base64url');
  return { full: `npl_${raw}`, prefix: `npl_${raw.slice(0, 6)}` };
}

async function authPartner(headers: Record<string, any>): Promise<{ partnerId: string; scopes: string[]; keyId: string } | null> {
  const apiKey = headers['x-naploo-api-key'] as string | undefined;
  if (!apiKey || !apiKey.startsWith('npl_')) return null;
  const keyHash = hashKey(apiKey);
  const rows = await db.execute(sql`SELECT id, partner_id, scopes, status FROM api_keys WHERE key_hash = ${keyHash}`);
  const row = (rows as any).rows ? (rows as any).rows[0] : (rows as any)[0];
  if (!row) return null;
  if (row.status !== 'active') return null;
  await db.execute(sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${row.id}`);
  return {
    partnerId: row.partner_id,
    scopes: Array.isArray(row.scopes) ? row.scopes : JSON.parse(row.scopes || '[]'),
    keyId: row.id,
  };
}

function parseJsonArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') {
    try {
      let p = JSON.parse(v);
      if (typeof p === 'string') p = JSON.parse(p);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  }
  return [];
}

const app = new Elysia()
  .use(cors({ origin: true }))

  .get('/health', () => ({ status: 'healthy', service: 'ota-service', timestamp: new Date().toISOString() }))
  .get('/ota/v1/health', () => ({ status: 'healthy', service: 'ota-service', timestamp: new Date().toISOString() }))

  // ═══ Property info ═══════════════════════════════════════════
  .get('/ota/v1/property', async ({ headers, set }) => {
    const auth = await authPartner(headers);
    if (!auth) { set.status = 401; return { error: 'Invalid or missing API key' }; }
    const [p] = await db.select().from(partners).where(eq(partners.id, auth.partnerId));
    if (!p) { set.status = 404; return { error: 'Partner not found' }; }
    return {
      property: {
        id: p.id,
        name: p.businessName,
        type: p.businessType,
        tier: (p as any).tier,
        address: p.address,
        city: p.city,
        state: p.state,
        country: 'IN',
        pincode: p.pincode,
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
        rating: p.rating ? Number(p.rating) : 0,
        check_in_time: (p as any).checkInTime || '14:00',
        check_out_time: (p as any).checkOutTime || '11:00',
        amenities: parseJsonArr(p.amenities),
        images: parseJsonArr(p.images),
        currency: (p as any).currency || 'INR',
        gst_number: p.gstNumber,
        contact: {
          person: p.contactPerson, phone: p.contactPhone, email: p.contactEmail,
        },
      },
    };
  })

  // ═══ Inventory: rooms + pod sets ═════════════════════════════
  .get('/ota/v1/inventory', async ({ headers, set }) => {
    const auth = await authPartner(headers);
    if (!auth) { set.status = 401; return { error: 'Invalid or missing API key' }; }
    const partnerRooms = await db.select().from(rooms).where(eq(rooms.partnerId, auth.partnerId));
    const partnerSets = await db.select().from(podSets).where(eq(podSets.partnerId, auth.partnerId));
    return {
      rooms: partnerRooms.map((r) => ({
        id: r.id,
        room_number: r.roomNumber,
        name: r.name,
        type: r.roomType,
        max_guests: r.maxGuests,
        bed_type: r.bedType,
        num_beds: r.numBeds,
        area_sq_ft: r.areaSqFt,
        daily_rate: Number(r.dailyRate),
        extra_guest_charge: Number(r.extraGuestCharge ?? 0),
        amenities: parseJsonArr(r.amenities),
        images: parseJsonArr(r.images),
        is_active: r.isActive,
      })),
      pod_sets: partnerSets.map((s) => ({
        id: s.id,
        set_number: s.setNumber,
        floor: s.floor,
        section: s.section,
        hourly_rate: Number(s.hourlyRate),
        is_active: s.isActive,
      })),
    };
  })

  // ═══ Availability for a date range ═══════════════════════════
  // GET /ota/v1/availability?from=2026-06-08&to=2026-06-15
  .get('/ota/v1/availability', async ({ headers, query, set }) => {
    const auth = await authPartner(headers);
    if (!auth) { set.status = 401; return { error: 'Invalid or missing API key' }; }
    if (!query.from || !query.to) { set.status = 400; return { error: 'from and to dates required (YYYY-MM-DD)' }; }
    const from = new Date(query.from); const to = new Date(query.to);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) { set.status = 400; return { error: 'Invalid date' }; }

    const partnerRooms = await db.select({ id: rooms.id, number: rooms.roomNumber, type: rooms.roomType, dailyRate: rooms.dailyRate })
      .from(rooms).where(and(eq(rooms.partnerId, auth.partnerId), eq(rooms.isActive, true)));
    const roomIds = partnerRooms.map((r) => r.id);

    const overlapping = roomIds.length === 0 ? [] : await db.select({ roomId: bookings.roomId })
      .from(bookings)
      .where(and(
        inArray(bookings.roomId, roomIds),
        inArray(bookings.status, ACTIVE),
        lt(bookings.checkIn, to),
        gt(bookings.checkOut, from)
      ));
    const blockedRoomIds = new Set(overlapping.map((b) => b.roomId));
    const availableRooms = partnerRooms.filter((r) => !blockedRoomIds.has(r.id));

    return {
      from: query.from,
      to: query.to,
      available_rooms: availableRooms.length,
      total_rooms: partnerRooms.length,
      rooms: availableRooms.map((r) => ({
        id: r.id, room_number: r.number, type: r.type, daily_rate: Number(r.dailyRate),
      })),
    };
  }, { query: t.Object({ from: t.String(), to: t.String() }) })

  // ═══ Rates ═══════════════════════════════════════════════════
  // GET /ota/v1/rates?room_id=...
  .get('/ota/v1/rates', async ({ headers, query, set }) => {
    const auth = await authPartner(headers);
    if (!auth) { set.status = 401; return { error: 'Invalid or missing API key' }; }
    const conditions = [eq(rooms.partnerId, auth.partnerId)];
    if (query.room_id) conditions.push(eq(rooms.id, query.room_id));
    const list = await db.select().from(rooms).where(and(...conditions));
    return {
      currency: 'INR',
      rates: list.map((r) => ({
        room_id: r.id,
        room_number: r.roomNumber,
        daily_rate: Number(r.dailyRate),
        weekly_rate: r.weeklyRate ? Number(r.weeklyRate) : null,
        extra_guest_charge: Number(r.extraGuestCharge ?? 0),
      })),
    };
  }, { query: t.Object({ room_id: t.Optional(t.String()) }) })

  // ═══ Create a booking from OTA ════════════════════════════════
  .post('/ota/v1/bookings', async ({ headers, body, set }) => {
    const auth = await authPartner(headers);
    if (!auth) { set.status = 401; return { error: 'Invalid or missing API key' }; }
    if (!auth.scopes.includes('write')) { set.status = 403; return { error: 'API key lacks write scope' }; }

    // Validate room belongs to this partner
    const [room] = await db.select().from(rooms).where(eq(rooms.id, body.room_id));
    if (!room || room.partnerId !== auth.partnerId) { set.status = 404; return { error: 'Room not found' }; }

    const checkIn = new Date(body.check_in);
    const checkOut = new Date(body.check_out);
    if (!(checkIn < checkOut)) { set.status = 400; return { error: 'check_out must be after check_in' }; }

    // Check availability
    const overlap = await db.select({ id: bookings.id }).from(bookings).where(and(
      eq(bookings.roomId, room.id),
      inArray(bookings.status, ACTIVE),
      lt(bookings.checkIn, checkOut),
      gt(bookings.checkOut, checkIn)
    ));
    if (overlap.length > 0) { set.status = 409; return { error: 'Room not available for these dates' }; }

    // Upsert guest user by phone
    const phoneNorm = body.guest_phone.startsWith('+91') ? body.guest_phone : `+91${body.guest_phone.replace(/^0+/, '')}`;
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phoneNorm));
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const parts = body.guest_name.trim().split(/\s+/);
      const [created] = await db.insert(users).values({
        phone: phoneNorm,
        email: body.guest_email || null,
        firstName: parts[0] || null,
        lastName: parts.slice(1).join(' ') || null,
        role: 'customer',
        status: 'active',
      }).returning({ id: users.id });
      userId = created.id;
    }

    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
    const baseRate = Number(room.dailyRate);
    const subtotal = Math.round(baseRate * nights * 100) / 100;
    const gst = Math.round(subtotal * 0.12 * 100) / 100;
    const total = subtotal + gst;
    const ownerShare = Math.round(subtotal * 0.82 * 100) / 100;
    const naplooShare = Math.round(subtotal - ownerShare);
    const bookingNumber = `OTA${randomUUID().slice(0, 8).toUpperCase()}`;

    const [booking] = await db.insert(bookings).values({
      bookingNumber,
      userId,
      bookingType: 'room',
      roomId: room.id,
      guestCount: body.guests || 1,
      checkIn,
      checkOut,
      nights,
      baseRate: String(baseRate),
      subtotal: String(subtotal),
      gst: String(gst),
      total: String(total),
      ownerShare: String(ownerShare),
      naplooShare: String(naplooShare),
      status: 'confirmed',
      source: 'ota' as any,
      specialRequests: body.notes,
    } as any).returning();

    return {
      booking: {
        id: booking.id,
        booking_number: bookingNumber,
        status: 'confirmed',
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        total,
        currency: 'INR',
      },
    };
  }, {
    body: t.Object({
      room_id: t.String(),
      check_in: t.String(),
      check_out: t.String(),
      guests: t.Optional(t.Number()),
      guest_name: t.String(),
      guest_phone: t.String(),
      guest_email: t.Optional(t.String()),
      ota_reference: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  })

  .listen({
    hostname: process.env.OTA_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.OTA_SERVICE_PORT || 3013),
  });

console.log(`🔗 Naploo OTA Sync Service running at http://localhost:${app.server?.port}`);
export type App = typeof app;
