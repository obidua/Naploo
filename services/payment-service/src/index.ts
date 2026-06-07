import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from '@naploo/db';
import { payments, bookings, users, pods, podSets, investors, investmentEarnings, investments } from '@naploo/db/schema';
import { eq, and } from 'drizzle-orm';
// Imports for investor notification hook

const NOTIFY = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';

async function notifyInvestorIfPodOwner(bookingId: string) {
  try {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking || !booking.podId) return;
    const [pod] = await db.select().from(pods).where(eq(pods.id, booking.podId));
    if (!pod) return;
    const [set] = await db.select().from(podSets).where(eq(podSets.id, pod.podSetId));
    if (!set || set.ownership !== 'investor' || !set.ownerId) return;

    // Find investor + their owner user
    const [investorRow] = await db.select().from(investors).where(eq(investors.userId, set.ownerId));
    if (!investorRow) return;
    const [investorUser] = await db.select().from(users).where(eq(users.id, set.ownerId));
    if (!investorUser) return;

    // Try to find their active investment for this pod set (for cumulative tracking)
    const [investment] = await db.select().from(investments)
      .where(and(eq(investments.investorId, investorRow.id), eq(investments.podSetId, set.id)))
      .limit(1);

    const investorShare = Number(booking.ownerShare); // pod ownerShare = investor's 60%
    const bookingAmt = Number(booking.total);

    if (investment) {
      const cumulative = Number(investment.earnedSoFar) + investorShare;
      await db.insert(investmentEarnings).values({
        investmentId: investment.id,
        bookingId: booking.id,
        bookingAmount: String(bookingAmt),
        investorShare: String(investorShare),
        cumulativeEarnings: String(cumulative),
      });
      await db.update(investments).set({
        earnedSoFar: String(cumulative),
        guaranteeReached: cumulative >= Number(investment.guaranteeAmount),
        updatedAt: new Date(),
      }).where(eq(investments.id, investment.id));
      await db.update(investors).set({
        totalEarned: String(Number(investorRow.totalEarned) + investorShare),
        updatedAt: new Date(),
      }).where(eq(investors.id, investorRow.id));
    }

    // Send SMS + email
    const name = [investorUser.firstName, investorUser.lastName].filter(Boolean).join(' ') || 'Investor';
    const html = `<p>Hi ${name},</p><p>Your pod set <b>${set.setNumber}</b> just earned <b>Rs.${investorShare.toFixed(2)}</b> from a confirmed booking (${booking.bookingNumber}).</p><p>Total booking amount: Rs.${bookingAmt.toFixed(2)}<br>Your 60% share: Rs.${investorShare.toFixed(2)}</p><p>Login to your investor portal to see cumulative earnings.</p>`;
    fetch(`${NOTIFY}/notify/email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: investorUser.email || 'biduaindustries@gmail.com', subject: `New pod earning: Rs.${investorShare.toFixed(2)}`, html }),
    }).catch(() => {});
    if (investorUser.phone) {
      fetch(`${NOTIFY}/notify/sms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: investorUser.phone, message: `Naploo: New booking ${booking.bookingNumber} on your pod set ${set.setNumber}. Your share: Rs.${investorShare.toFixed(2)}. Login to see details.` }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('notifyInvestor failed:', e);
  }
}

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

  // ─── Hosted checkout page (for mobile WebView) ──────────────
  // Mobile opens this URL in a WebView. The page loads Razorpay checkout.js,
  // handles success/failure, then sends `naploo://payment-success` or
  // `naploo://payment-failed` so React Native can detect it via deep link / nav state.
  .get('/payments/checkout/:bookingId', async ({ params, set }) => {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId));
    if (!booking) {
      set.status = 404;
      return 'Booking not found';
    }
    const amountPaise = Math.round(Number(booking.total) * 100);
    let order;
    try {
      order = await createRazorpayOrder(amountPaise, booking.bookingNumber, { bookingId: booking.id });
    } catch (e: any) {
      set.status = 502;
      return `Could not create order: ${e.message}`;
    }
    // Upsert payment row
    const [existing] = await db.select().from(payments).where(eq(payments.bookingId, booking.id));
    if (existing) {
      await db.update(payments).set({ razorpayOrderId: order.id, status: 'pending', updatedAt: new Date() }).where(eq(payments.id, existing.id));
    } else {
      await db.insert(payments).values({
        userId: booking.userId,
        bookingId: booking.id,
        amount: String(booking.total),
        currency: 'INR',
        razorpayOrderId: order.id,
        paymentMethod: 'razorpay',
        status: 'pending',
      });
    }

    set.headers['Content-Type'] = 'text/html; charset=utf-8';
    return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pay ${booking.bookingNumber}</title>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#0f0a1e;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
.card{max-width:340px;background:#1e1b4b;border:1px solid #312e81;border-radius:24px;padding:32px}
h1{margin:0 0 8px;font-size:20px}.amount{font-size:32px;font-weight:bold;color:#a78bfa;margin:8px 0 24px}
button{width:100%;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:0;padding:16px;border-radius:12px;font-size:16px;font-weight:600}
.status{margin-top:16px;font-size:13px;color:#a8a0c8}
</style></head><body>
<div class="card">
<h1>Booking ${booking.bookingNumber}</h1>
<div class="amount">₹${booking.total}</div>
<button id="pay">Pay with Razorpay</button>
<div class="status" id="status">Tap to open the secure checkout</div>
</div>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
const opts = {
  key: ${JSON.stringify(KEY_ID || 'rzp_test_MOCK')},
  amount: ${amountPaise},
  currency: 'INR',
  order_id: ${JSON.stringify(order.id)},
  name: 'Naploo',
  description: 'Stay booking ${booking.bookingNumber}',
  theme: { color: '#7c3aed' },
  handler: async function(resp){
    document.getElementById('status').textContent = 'Verifying payment…';
    try {
      const r = await fetch('/payments/verify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({razorpay_order_id:resp.razorpay_order_id,razorpay_payment_id:resp.razorpay_payment_id,razorpay_signature:resp.razorpay_signature})
      });
      const j = await r.json();
      if (j.success) {
        document.getElementById('status').textContent = 'Payment successful!';
        // Redirect to deep-link so the mobile WebView can detect success
        window.location.href = 'naploo://payment-success?bookingId=' + ${JSON.stringify(booking.id)};
      } else {
        document.getElementById('status').textContent = 'Verification failed: ' + (j.message||'unknown');
      }
    } catch(e){ document.getElementById('status').textContent = 'Network error'; }
  },
  modal: { ondismiss: function(){ window.location.href = 'naploo://payment-cancelled?bookingId=' + ${JSON.stringify(booking.id)}; } }
};
document.getElementById('pay').onclick = function(){ new Razorpay(opts).open(); };
// Auto-open on load
setTimeout(()=>document.getElementById('pay').click(), 300);
</script>
</body></html>`;
  })

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
        // Fire-and-forget investor notification
        notifyInvestorIfPodOwner(payment.bookingId).catch(() => {});
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
        if (payment.bookingId) { await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, payment.bookingId)); notifyInvestorIfPodOwner(payment.bookingId).catch(() => {}); }
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
