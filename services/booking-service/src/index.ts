import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import { bookings, rooms, pods, podSets, partners, payments } from '@naploo/db/schema';
import { eq, and, inArray, or, lt, gt, desc } from 'drizzle-orm';

// ─── Revenue / tax config ─────────────────────────────────────
const POD_OWNER_SHARE = 0.6; // 60% to pod owner (investor/partner/naploo)
const ROOM_HOTEL_SHARE = 0.82; // ~82% to hotel, rest to Naploo
const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'] as const;
const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3003';

// India accommodation GST: <= ₹7500/night => 12%, above => 18%
function gstRateFor(nightlyOrHourly: number, type: 'pod' | 'room'): number {
  if (type === 'pod') return 0.12;
  return nightlyOrHourly > 7500 ? 0.18 : 0.12;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function genBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `NPL${ts}${rand}`;
}

function cancellationRefundAmount(booking: typeof bookings.$inferSelect, now = new Date()) {
  if (booking.status === 'checked_in') return { amount: 0, policy: 'no_refund_after_check_in' };
  const checkIn = new Date(booking.checkIn);
  const hoursBeforeCheckIn = (checkIn.getTime() - now.getTime()) / 36e5;
  const total = Number(booking.total);
  if (hoursBeforeCheckIn >= 2) return { amount: round2(total), policy: 'full_refund_2h_before_check_in' };
  if (hoursBeforeCheckIn > 0) return { amount: round2(total * 0.5), policy: 'half_refund_before_check_in' };
  return { amount: 0, policy: 'no_refund_after_check_in_time' };
}

async function initiateCancellationRefund(booking: typeof bookings.$inferSelect, reason: string | null, headers: Record<string, unknown>) {
  const policy = cancellationRefundAmount(booking);
  if (policy.amount <= 0) return { attempted: false, amount: 0, policy: policy.policy };
  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.bookingId, booking.id), inArray(payments.status, ['completed', 'partially_refunded'] as any)))
    .limit(1);
  if (!payment) return { attempted: false, amount: policy.amount, policy: policy.policy, message: 'No refundable completed payment found' };

  try {
    const res = await fetch(`${PAYMENT}/payments/${payment.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: policy.amount,
        reason: reason || `Booking cancelled: ${policy.policy}`,
        source: 'booking_cancel',
        initiatedBy: headers['x-user-id'] || null,
        initiatedByRole: headers['x-user-role'] || 'customer',
      }),
    });
    const data = await res.json().catch(async () => ({ message: await res.text() }));
    return { attempted: true, amount: policy.amount, policy: policy.policy, ok: res.ok, response: data };
  } catch (e: any) {
    return { attempted: true, amount: policy.amount, policy: policy.policy, ok: false, message: e?.message || 'Refund call failed' };
  }
}

// Find bookings for a given inventory id that overlap [checkIn, checkOut)
async function overlappingBookings(column: 'roomId' | 'podId', id: string, checkIn: Date, checkOut: Date) {
  const col = column === 'roomId' ? bookings.roomId : bookings.podId;
  return db
    .select({ id: bookings.id, podId: bookings.podId, roomId: bookings.roomId })
    .from(bookings)
    .where(
      and(
        eq(col, id),
        inArray(bookings.status, ACTIVE_STATUSES as unknown as string[]),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn)
      )
    );
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: { info: { title: 'Naploo Booking Service', version: '1.0.0', description: 'Pod (hourly) & room (nightly) bookings' } },
    })
  )

  .get('/health', () => ({ status: 'healthy', service: 'booking-service', timestamp: new Date().toISOString() }))

  // ─── Availability check ─────────────────────────────────────
  // Room: GET /availability/room?roomId=&checkIn=&checkOut=
  .get(
    '/availability/room',
    async ({ query, set }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, query.roomId));
      if (!room) {
        set.status = 404;
        return { success: false, message: 'Room not found' };
      }
      const checkIn = new Date(query.checkIn);
      const checkOut = new Date(query.checkOut);
      if (!(checkIn < checkOut)) {
        set.status = 400;
        return { success: false, message: 'checkOut must be after checkIn' };
      }
      const overlaps = await overlappingBookings('roomId', room.id, checkIn, checkOut);
      const available = room.isActive && room.status !== 'maintenance' && overlaps.length === 0;
      return { success: true, available, roomId: room.id };
    },
    { query: t.Object({ roomId: t.String(), checkIn: t.String(), checkOut: t.String() }) }
  )

  // Pod (single): returns whether THIS pod is free for the window
  .get(
    '/availability/pod',
    async ({ query, set }) => {
      const [pod] = await db.select().from(pods).where(eq(pods.id, query.podId));
      if (!pod) {
        set.status = 404;
        return { success: false, message: 'Pod not found' };
      }
      const checkIn = new Date(query.checkIn);
      const checkOut = new Date(query.checkOut);
      if (!(checkIn < checkOut)) {
        set.status = 400;
        return { success: false, message: 'checkOut must be after checkIn' };
      }
      if (pod.status !== 'available') {
        return { success: true, available: false, podId: pod.id, reason: `pod status: ${pod.status}` };
      }
      const overlaps = await overlappingBookings('podId', pod.id, checkIn, checkOut);
      return { success: true, available: overlaps.length === 0, podId: pod.id };
    },
    { query: t.Object({ podId: t.String(), checkIn: t.String(), checkOut: t.String() }) }
  )

  // Pod set: returns whether any pod in the set is free for the window
  .get(
    '/availability/pod-set',
    async ({ query, set }) => {
      const [podSet] = await db.select().from(podSets).where(eq(podSets.id, query.podSetId));
      if (!podSet) {
        set.status = 404;
        return { success: false, message: 'Pod set not found' };
      }
      const checkIn = new Date(query.checkIn);
      const checkOut = new Date(query.checkOut);
      if (!(checkIn < checkOut)) {
        set.status = 400;
        return { success: false, message: 'checkOut must be after checkIn' };
      }
      const setPods = await db
        .select()
        .from(pods)
        .where(and(eq(pods.podSetId, podSet.id), eq(pods.status, 'available')));

      let freePod: string | null = null;
      for (const pod of setPods) {
        const overlaps = await overlappingBookings('podId', pod.id, checkIn, checkOut);
        if (overlaps.length === 0) {
          freePod = pod.id;
          break;
        }
      }
      return { success: true, available: freePod !== null, podSetId: podSet.id, freePodId: freePod, totalPods: setPods.length };
    },
    { query: t.Object({ podSetId: t.String(), checkIn: t.String(), checkOut: t.String() }) }
  )

  // ─── Quote (price preview, no booking) ──────────────────────
  .post(
    '/quote',
    async ({ body, set }) => {
      const quote = await computeQuote(body, set);
      return quote;
    },
    {
      body: t.Object({
        bookingType: t.Union([t.Literal('pod'), t.Literal('room')]),
        roomId: t.Optional(t.String()),
        podId: t.Optional(t.String()),
        podSetId: t.Optional(t.String()),
        checkIn: t.String(),
        hours: t.Optional(t.Number()),
        nights: t.Optional(t.Number()),
        guestCount: t.Optional(t.Number()),
        couponDiscount: t.Optional(t.Number()),
      }),
    }
  )

  // ─── Create booking ─────────────────────────────────────────
  .post(
    '/bookings',
    async ({ body, set, headers }) => {
      // Prefer the gateway-verified identity over any client-supplied userId
      const userId = (headers['x-user-id'] as string) || body.userId;
      const quote = await computeQuote(body, set);
      if (!quote.success) return quote;

      // Re-check availability and lock a specific pod / confirm the room
      let podId: string | null = null;
      let roomId: string | null = null;
      const checkIn = new Date(body.checkIn);
      const checkOut = quote.checkOut;

      if (body.bookingType === 'pod') {
        // Preferred path: caller specified a single pod (single bunk)
        if (body.podId) {
          const [pod] = await db.select().from(pods).where(eq(pods.id, body.podId));
          if (!pod) {
            set.status = 404;
            return { success: false, message: 'Pod not found' };
          }
          if (pod.status !== 'available') {
            set.status = 409;
            return { success: false, message: `Pod is ${pod.status}` };
          }
          const overlaps = await overlappingBookings('podId', pod.id, checkIn, checkOut);
          if (overlaps.length > 0) {
            set.status = 409;
            return { success: false, message: 'This pod is already booked for the selected time' };
          }
          podId = pod.id;
        } else {
          // Legacy fallback: pick first free pod in the set
          const setPods = await db
            .select()
            .from(pods)
            .where(and(eq(pods.podSetId, body.podSetId!), eq(pods.status, 'available')));
          for (const pod of setPods) {
            const overlaps = await overlappingBookings('podId', pod.id, checkIn, checkOut);
            if (overlaps.length === 0) {
              podId = pod.id;
              break;
            }
          }
          if (!podId) {
            set.status = 409;
            return { success: false, message: 'No pods available for the selected time' };
          }
        }
      } else {
        const overlaps = await overlappingBookings('roomId', body.roomId!, checkIn, checkOut);
        if (overlaps.length > 0) {
          set.status = 409;
          return { success: false, message: 'Room is not available for the selected dates' };
        }
        roomId = body.roomId!;
      }

      const [created] = await db
        .insert(bookings)
        .values({
          bookingNumber: genBookingNumber(),
          userId,
          bookingType: body.bookingType,
          podId,
          roomId,
          guestCount: body.guestCount ?? 1,
          guestNames: body.guestNames ? JSON.stringify(body.guestNames) : null,
          checkIn,
          checkOut,
          hours: body.bookingType === 'pod' ? quote.units : null,
          nights: body.bookingType === 'room' ? quote.units : null,
          baseRate: String(quote.baseRate),
          subtotal: String(quote.subtotal),
          discount: String(quote.discount),
          gst: String(quote.gst),
          total: String(quote.total),
          ownerShare: String(quote.ownerShare),
          naplooShare: String(quote.naplooShare),
          couponCode: body.couponCode,
          couponDiscount: String(body.couponDiscount ?? 0),
          status: 'pending',
          specialRequests: body.specialRequests,
        })
        .returning();

      set.status = 201;
      return { success: true, booking: created };
    },
    {
      body: t.Object({
        userId: t.Optional(t.String()),
        bookingType: t.Union([t.Literal('pod'), t.Literal('room')]),
        roomId: t.Optional(t.String()),
        podId: t.Optional(t.String()),
        podSetId: t.Optional(t.String()),
        checkIn: t.String(),
        hours: t.Optional(t.Number()),
        nights: t.Optional(t.Number()),
        guestCount: t.Optional(t.Number()),
        guestNames: t.Optional(t.Array(t.String())),
        couponCode: t.Optional(t.String()),
        couponDiscount: t.Optional(t.Number()),
        specialRequests: t.Optional(t.String()),
      }),
    }
  )

  // ─── List bookings for a user ───────────────────────────────
  .get(
    '/bookings',
    async ({ query, headers }) => {
      const userId = (headers['x-user-id'] as string) || query.userId;
      const rows = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.createdAt));
      const enriched = await enrich(rows);
      return { success: true, count: enriched.length, bookings: enriched };
    },
    { query: t.Object({ userId: t.Optional(t.String()) }) }
  )

  // ─── Bookings for a partner (portal) ────────────────────────
  .get('/partner/:partnerId/bookings', async ({ params }) => {
    const pRooms = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.partnerId, params.partnerId));
    const pSets = await db.select({ id: podSets.id }).from(podSets).where(eq(podSets.partnerId, params.partnerId));
    const setIds = pSets.map((s) => s.id);
    const pPods = setIds.length ? await db.select({ id: pods.id }).from(pods).where(inArray(pods.podSetId, setIds)) : [];
    const roomIds = pRooms.map((r) => r.id);
    const podIds = pPods.map((p) => p.id);
    if (!roomIds.length && !podIds.length) return { success: true, count: 0, bookings: [] };

    const filters = [];
    if (roomIds.length) filters.push(inArray(bookings.roomId, roomIds));
    if (podIds.length) filters.push(inArray(bookings.podId, podIds));
    const rows = await db.select().from(bookings).where(or(...filters)).orderBy(desc(bookings.createdAt));
    const enriched = await enrich(rows);
    return { success: true, count: enriched.length, bookings: enriched };
  })

  // ─── Get one booking ────────────────────────────────────────
  .get('/bookings/:id', async ({ params, set }) => {
    const [b] = await db.select().from(bookings).where(eq(bookings.id, params.id));
    if (!b) {
      set.status = 404;
      return { success: false, message: 'Booking not found' };
    }
    const [enriched] = await enrich([b]);
    return { success: true, booking: enriched };
  })

  // ─── Cancel ─────────────────────────────────────────────────
  .post('/bookings/:id/cancel', async ({ params, body, headers, set }) => {
    const [b] = await db.select().from(bookings).where(eq(bookings.id, params.id));
    if (!b) {
      set.status = 404;
      return { success: false, message: 'Booking not found' };
    }
    if (['cancelled', 'checked_out', 'no_show'].includes(b.status)) {
      set.status = 400;
      return { success: false, message: `Cannot cancel a ${b.status} booking` };
    }
    const [updated] = await db
      .update(bookings)
      .set({ status: 'cancelled', cancelledAt: new Date(), cancelReason: body?.reason ?? null, updatedAt: new Date() })
      .where(eq(bookings.id, params.id))
      .returning();
    const refund = await initiateCancellationRefund(b, body?.reason ?? null, headers as Record<string, unknown>);
    return { success: true, booking: updated, refund };
  }, { body: t.Optional(t.Object({ reason: t.Optional(t.String()) })) })

  // ─── Status transitions (confirm / check-in / check-out) ────
  .post('/bookings/:id/confirm', async ({ params, set }) => updateStatus(params.id, 'confirmed', set))
  .post('/bookings/:id/check-in', async ({ params, set }) => updateStatus(params.id, 'checked_in', set, { actualCheckIn: new Date() }))
  .post('/bookings/:id/check-out', async ({ params, set }) => updateStatus(params.id, 'checked_out', set, { actualCheckOut: new Date() }))

  .listen({
    hostname: process.env.BOOKING_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.BOOKING_SERVICE_PORT || 3002),
  });

// ─── Shared helpers ───────────────────────────────────────────
async function updateStatus(id: string, status: string, set: any, extra: Record<string, unknown> = {}) {
  const [updated] = await db
    .update(bookings)
    .set({ status: status as any, ...extra, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  if (!updated) {
    set.status = 404;
    return { success: false, message: 'Booking not found' };
  }
  return { success: true, booking: updated };
}

async function computeQuote(body: any, set: any) {
  const checkIn = new Date(body.checkIn);
  if (isNaN(checkIn.getTime())) {
    set.status = 400;
    return { success: false, message: 'Invalid checkIn' } as any;
  }

  if (body.bookingType === 'pod') {
    if (!body.hours) {
      set.status = 400;
      return { success: false, message: 'hours is required for pod bookings' } as any;
    }
    // Caller may supply either podId (preferred) or podSetId (legacy).
    let podSetIdToPrice: string | null = body.podSetId || null;
    if (!podSetIdToPrice && body.podId) {
      const [pod] = await db.select().from(pods).where(eq(pods.id, body.podId));
      if (!pod) {
        set.status = 404;
        return { success: false, message: 'Pod not found' } as any;
      }
      podSetIdToPrice = pod.podSetId;
    }
    if (!podSetIdToPrice) {
      set.status = 400;
      return { success: false, message: 'podId or podSetId is required for pod bookings' } as any;
    }
    const [podSet] = await db.select().from(podSets).where(eq(podSets.id, podSetIdToPrice));
    if (!podSet) {
      set.status = 404;
      return { success: false, message: 'Pod set not found' } as any;
    }
    const units = body.hours;
    const baseRate = Number(podSet.hourlyRate);
    const subtotal = round2(baseRate * units);
    const discount = round2(body.couponDiscount ?? 0);
    const taxable = Math.max(0, subtotal - discount);
    const gst = round2(taxable * gstRateFor(baseRate, 'pod'));
    const total = round2(taxable + gst);
    const ownerShare = round2(taxable * POD_OWNER_SHARE);
    const naplooShare = round2(taxable - ownerShare);
    const checkOut = new Date(checkIn.getTime() + units * 60 * 60 * 1000);
    return { success: true, bookingType: 'pod', units, baseRate, subtotal, discount, gst, total, ownerShare, naplooShare, checkOut, podSetId: podSetIdToPrice } as any;
  }

  // room
  if (!body.roomId || !body.nights) {
    set.status = 400;
    return { success: false, message: 'roomId and nights are required for room bookings' } as any;
  }
  const [room] = await db.select().from(rooms).where(eq(rooms.id, body.roomId));
  if (!room) {
    set.status = 404;
    return { success: false, message: 'Room not found' } as any;
  }
  const units = body.nights;
  const baseRate = Number(room.dailyRate);
  let subtotal = round2(baseRate * units);
  // extra guest charge beyond room capacity
  let extra = 0;
  if (body.guestCount && body.guestCount > room.maxGuests) {
    extra = round2((body.guestCount - room.maxGuests) * Number(room.extraGuestCharge ?? 0) * units);
    subtotal = round2(subtotal + extra);
  }
  const discount = round2(body.couponDiscount ?? 0);
  const taxable = Math.max(0, subtotal - discount);
  const gst = round2(taxable * gstRateFor(baseRate, 'room'));
  const total = round2(taxable + gst);
  const ownerShare = round2(taxable * ROOM_HOTEL_SHARE);
  const naplooShare = round2(taxable - ownerShare);
  const checkOut = new Date(checkIn.getTime() + units * 24 * 60 * 60 * 1000);
  return { success: true, bookingType: 'room', units, baseRate, extraGuestCharge: extra, subtotal, discount, gst, total, ownerShare, naplooShare, checkOut } as any;
}

// Attach room/pod + hotel context to bookings
async function enrich(rows: any[]) {
  if (!rows.length) return [];
  const roomIds = [...new Set(rows.map((b) => b.roomId).filter(Boolean))];
  const podIds = [...new Set(rows.map((b) => b.podId).filter(Boolean))];
  const roomRows = roomIds.length ? await db.select().from(rooms).where(inArray(rooms.id, roomIds)) : [];
  const podRows = podIds.length ? await db.select().from(pods).where(inArray(pods.id, podIds)) : [];
  const setIds = [...new Set(podRows.map((p) => p.podSetId))];
  const setRows = setIds.length ? await db.select().from(podSets).where(inArray(podSets.id, setIds)) : [];
  const partnerIds = [
    ...new Set([...roomRows.map((r) => r.partnerId), ...setRows.map((s) => s.partnerId)].filter(Boolean)),
  ];
  const partnerRows = partnerIds.length ? await db.select().from(partners).where(inArray(partners.id, partnerIds)) : [];

  const partnerOf = (id: string | undefined) => partnerRows.find((p) => p.id === id);

  return rows.map((b) => {
    let hotel: any = null;
    let unit: any = null;
    if (b.roomId) {
      const r = roomRows.find((x) => x.id === b.roomId);
      const p = partnerOf(r?.partnerId);
      unit = r ? { type: 'room', roomNumber: r.roomNumber, roomType: r.roomType, name: r.name } : null;
      hotel = p ? { id: p.id, name: p.businessName, city: p.city, address: p.address } : null;
    } else if (b.podId) {
      const pod = podRows.find((x) => x.id === b.podId);
      const s = setRows.find((x) => x.id === pod?.podSetId);
      const p = partnerOf(s?.partnerId);
      unit = pod ? { type: 'pod', podNumber: pod.podNumber, position: pod.position, setNumber: s?.setNumber } : null;
      hotel = p ? { id: p.id, name: p.businessName, city: p.city, address: p.address } : null;
    }
    return { ...b, unit, hotel };
  });
}

console.log(`🛏️  Naploo Booking Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
