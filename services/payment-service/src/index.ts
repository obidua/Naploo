import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import { payments, bookings } from '@naploo/db/schema';
import { eq } from 'drizzle-orm';
import { createHmac } from 'crypto';

// ─── Razorpay config ──────────────────────────────────────────
const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const MOCK = !KEY_ID || !KEY_SECRET; // mock mode until real test keys are provided

if (MOCK) {
  console.warn('⚠️  payment-service running in MOCK mode (no RAZORPAY_KEY_ID/SECRET). Set them in .env for real test-mode payments.');
}

// Create an order via Razorpay REST API (no SDK)
async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  if (MOCK) {
    return { id: `order_MOCK${Date.now().toString(36)}`, amount: amountPaise, currency: 'INR', receipt, status: 'created', mock: true };
  }
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Verify checkout signature: HMAC_SHA256(order_id|payment_id, key_secret)
function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (MOCK) return true; // accept in mock mode
  const expected = createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return MOCK; // if no secret configured, only trust in mock
  const expected = createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  return expected === signature;
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: { info: { title: 'Naploo Payment Service', version: '1.0.0', description: 'Razorpay payments (test mode)' } },
    })
  )

  .get('/health', () => ({ status: 'healthy', service: 'payment-service', mode: MOCK ? 'mock' : 'live', timestamp: new Date().toISOString() }))

  // ─── Create payment order for a booking ─────────────────────
  .post(
    '/payments/create-order',
    async ({ body, set }) => {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, body.bookingId));
      if (!booking) {
        set.status = 404;
        return { success: false, message: 'Booking not found' };
      }
      if (booking.status !== 'pending') {
        set.status = 400;
        return { success: false, message: `Booking is already ${booking.status}` };
      }
      const amountPaise = Math.round(Number(booking.total) * 100);

      let order;
      try {
        order = await createRazorpayOrder(amountPaise, booking.bookingNumber, { bookingId: booking.id });
      } catch (e: any) {
        set.status = 502;
        return { success: false, message: e.message };
      }

      // Upsert a payment record for this booking
      const [existing] = await db.select().from(payments).where(eq(payments.bookingId, booking.id));
      let payment;
      if (existing) {
        [payment] = await db
          .update(payments)
          .set({ razorpayOrderId: order.id, amount: String(booking.total), status: 'pending', paymentMethod: 'razorpay', updatedAt: new Date() })
          .where(eq(payments.id, existing.id))
          .returning();
      } else {
        [payment] = await db
          .insert(payments)
          .values({
            userId: booking.userId,
            bookingId: booking.id,
            amount: String(booking.total),
            currency: 'INR',
            razorpayOrderId: order.id,
            paymentMethod: 'razorpay',
            status: 'pending',
          })
          .returning();
      }

      return {
        success: true,
        mock: MOCK,
        order: { id: order.id, amount: amountPaise, currency: 'INR' },
        keyId: KEY_ID || 'rzp_test_MOCK',
        paymentId: payment.id,
        booking: { id: booking.id, number: booking.bookingNumber, total: booking.total },
        // In mock mode, the client can call /payments/verify with these to simulate success.
        ...(MOCK && { mockHint: 'POST /payments/verify with razorpay_order_id and any payment_id/signature to confirm.' }),
      };
    },
    { body: t.Object({ bookingId: t.String() }) }
  )

  // ─── Verify payment (checkout callback) ─────────────────────
  .post(
    '/payments/verify',
    async ({ body, set }) => {
      const ok = verifySignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
      const [payment] = await db.select().from(payments).where(eq(payments.razorpayOrderId, body.razorpay_order_id));
      if (!payment) {
        set.status = 404;
        return { success: false, message: 'Payment record not found for order' };
      }
      if (!ok) {
        await db
          .update(payments)
          .set({ status: 'failed', failureReason: 'Signature verification failed', updatedAt: new Date() })
          .where(eq(payments.id, payment.id));
        set.status = 400;
        return { success: false, message: 'Invalid payment signature' };
      }

      const [updated] = await db
        .update(payments)
        .set({
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      // Confirm the booking now that payment succeeded
      if (payment.bookingId) {
        await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, payment.bookingId));
      }

      return { success: true, payment: updated, bookingConfirmed: !!payment.bookingId };
    },
    {
      body: t.Object({
        razorpay_order_id: t.String(),
        razorpay_payment_id: t.String(),
        razorpay_signature: t.String(),
      }),
    }
  )

  // ─── Razorpay webhook ───────────────────────────────────────
  .post('/payments/webhook', async ({ body, headers, set }) => {
    const raw = JSON.stringify(body);
    const sig = headers['x-razorpay-signature'] || '';
    if (!verifyWebhookSignature(raw, sig)) {
      set.status = 400;
      return { success: false, message: 'Invalid webhook signature' };
    }
    const event = (body as any)?.event;
    const entity = (body as any)?.payload?.payment?.entity;
    if (event === 'payment.captured' && entity?.order_id) {
      const [payment] = await db.select().from(payments).where(eq(payments.razorpayOrderId, entity.order_id));
      if (payment && payment.status !== 'completed') {
        await db.update(payments).set({ status: 'completed', razorpayPaymentId: entity.id, updatedAt: new Date() }).where(eq(payments.id, payment.id));
        if (payment.bookingId) await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, payment.bookingId));
      }
    }
    return { success: true, received: true };
  })

  // ─── Refund (mark refunded; real refund call when live) ─────
  .post(
    '/payments/:id/refund',
    async ({ params, body, set }) => {
      const [payment] = await db.select().from(payments).where(eq(payments.id, params.id));
      if (!payment) {
        set.status = 404;
        return { success: false, message: 'Payment not found' };
      }
      if (payment.status !== 'completed') {
        set.status = 400;
        return { success: false, message: 'Only completed payments can be refunded' };
      }
      const refundAmount = body?.amount ?? Number(payment.amount);
      const [updated] = await db
        .update(payments)
        .set({
          status: refundAmount >= Number(payment.amount) ? 'refunded' : 'partially_refunded',
          refundedAmount: String(refundAmount),
          refundReason: body?.reason ?? null,
          refundedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();
      return { success: true, payment: updated };
    },
    { body: t.Optional(t.Object({ amount: t.Optional(t.Number()), reason: t.Optional(t.String()) })) }
  )

  .get('/payments/:id', async ({ params, set }) => {
    const [p] = await db.select().from(payments).where(eq(payments.id, params.id));
    if (!p) {
      set.status = 404;
      return { success: false, message: 'Payment not found' };
    }
    return { success: true, payment: p };
  })

  .get('/payments', async ({ query }) => {
    const col = query.bookingId ? eq(payments.bookingId, query.bookingId) : eq(payments.userId, query.userId!);
    const rows = await db.select().from(payments).where(col);
    return { success: true, count: rows.length, payments: rows };
  }, { query: t.Object({ bookingId: t.Optional(t.String()), userId: t.Optional(t.String()) }) })

  .listen({
    hostname: process.env.PAYMENT_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.PAYMENT_SERVICE_PORT || 3003),
  });

console.log(`💳 Naploo Payment Service running at http://localhost:${app.server?.port} (${MOCK ? 'MOCK' : 'LIVE'} mode)`);

export type App = typeof app;
