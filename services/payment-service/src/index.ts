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

type PaymentProvider = 'razorpay' | 'cashfree';

// ─── Provider config ─────────────────────────────────────────
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const RAZORPAY_MOCK = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || process.env.APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || process.env.APP_SECRET || '';
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';
const CASHFREE_MODE = (process.env.CASHFREE_MODE || 'sandbox').toLowerCase();
const CASHFREE_BASE_URL = CASHFREE_MODE === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
const CASHFREE_ENABLED = !!CASHFREE_APP_ID && !!CASHFREE_SECRET_KEY;

const DEFAULT_PROVIDER: PaymentProvider = process.env.PAYMENT_PROVIDER === 'cashfree' && CASHFREE_ENABLED ? 'cashfree' : 'razorpay';

if (RAZORPAY_MOCK) {
  console.warn('⚠️  Razorpay running in MOCK mode (no RAZORPAY_KEY_ID/SECRET).');
}
if (!CASHFREE_ENABLED) {
  console.warn('⚠️  Cashfree disabled (no CASHFREE_APP_ID/SECRET_KEY).');
}

// Create an order via Razorpay REST API (no SDK)
async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  if (RAZORPAY_MOCK) {
    return { id: `order_MOCK${Date.now().toString(36)}`, amount: amountPaise, currency: 'INR', receipt, status: 'created', mock: true };
  }
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
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

async function createCashfreeOrder(input: {
  booking: typeof bookings.$inferSelect;
  user: typeof users.$inferSelect | undefined;
  amount: number;
}) {
  if (!CASHFREE_ENABLED) throw new Error('Cashfree credentials are not configured');

  const customerName = [input.user?.firstName, input.user?.lastName].filter(Boolean).join(' ') || 'Naploo Customer';
  const customerPhone = input.user?.phone?.replace(/\D/g, '').slice(-10) || '9999999999';
  const orderId = `NP_${input.booking.bookingNumber}_${Date.now()}`.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 45);
  const publicApi = process.env.PUBLIC_API_URL || 'https://api.naploo.com';
  const publicWeb = process.env.PUBLIC_WEB_URL || 'https://naploo.com';

  const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: input.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: input.booking.userId,
        customer_name: customerName,
        customer_email: input.user?.email || 'support@naploo.com',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${publicWeb}/booking/confirmation/${input.booking.id}?order_id={order_id}`,
        notify_url: `${publicApi}/api/v1/payments/cashfree/webhook`,
      },
      order_note: `Naploo booking ${input.booking.bookingNumber}`,
    }),
  });

  const data = await res.json().catch(async () => ({ message: await res.text() }));
  if (!res.ok) throw new Error(`Cashfree order failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function getCashfreeOrder(orderId: string) {
  if (!CASHFREE_ENABLED) throw new Error('Cashfree credentials are not configured');
  const res = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
    },
  });
  const data = await res.json().catch(async () => ({ message: await res.text() }));
  if (!res.ok) throw new Error(`Cashfree order lookup failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function createCashfreeRefund(payment: typeof payments.$inferSelect, amount: number, reason?: string) {
  if (!CASHFREE_ENABLED) throw new Error('Cashfree credentials are not configured');
  if (!payment.razorpayOrderId) throw new Error('Cashfree order id is missing');
  const refundId = `NPL_REF_${payment.id.replace(/-/g, '').slice(0, 18)}_${Date.now()}`.slice(0, 40);
  const res = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(payment.razorpayOrderId)}/refunds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
    },
    body: JSON.stringify({
      refund_id: refundId,
      refund_amount: amount,
      refund_note: reason || 'Naploo booking refund',
    }),
  });
  const data = await res.json().catch(async () => ({ message: await res.text() }));
  if (!res.ok) throw new Error(`Cashfree refund failed: ${res.status} ${JSON.stringify(data)}`);
  return { provider: 'cashfree', refundId, gateway: data };
}

async function createRazorpayRefund(payment: typeof payments.$inferSelect, amount: number, reason?: string) {
  if (RAZORPAY_MOCK) return { provider: 'razorpay', refundId: `rfnd_MOCK${Date.now().toString(36)}`, gateway: { mock: true } };
  if (!payment.razorpayPaymentId) throw new Error('Razorpay payment id is missing');
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(payment.razorpayPaymentId)}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      speed: 'normal',
      notes: { reason: reason || 'Naploo booking refund', source: 'naploo' },
    }),
  });
  const data = await res.json().catch(async () => ({ message: await res.text() }));
  if (!res.ok) throw new Error(`Razorpay refund failed: ${res.status} ${JSON.stringify(data)}`);
  return { provider: 'razorpay', refundId: data.id, gateway: data };
}

// Verify checkout signature: HMAC_SHA256(order_id|payment_id, key_secret)
function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (RAZORPAY_MOCK) return true; // accept in mock mode
  const expected = createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) return RAZORPAY_MOCK; // if no secret configured, only trust in mock
  const expected = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return expected === signature;
}

function paymentMetadata(payment: { metadata?: string | null }) {
  if (!payment.metadata) return {};
  try {
    return JSON.parse(payment.metadata);
  } catch {
    return {};
  }
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: { info: { title: 'Naploo Payment Service', version: '1.1.0', description: 'Razorpay + Cashfree payments' } },
    })
  )

  .get('/health', () => ({
    status: 'healthy',
    service: 'payment-service',
    provider: DEFAULT_PROVIDER,
    mode: DEFAULT_PROVIDER === 'cashfree' ? (CASHFREE_ENABLED ? CASHFREE_MODE : 'mock') : (RAZORPAY_MOCK ? 'mock' : 'live'),
    providers: {
      razorpay: RAZORPAY_MOCK ? 'mock' : 'live',
      cashfree: CASHFREE_ENABLED ? CASHFREE_MODE : 'disabled',
    },
    timestamp: new Date().toISOString(),
  }))

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
      const amountRupees = Number(booking.total);
      const provider = (body.provider || DEFAULT_PROVIDER) as PaymentProvider;

      let order;
      let paymentMethod: 'razorpay' | 'cashfree' = provider;
      let metadata: Record<string, any> = { provider };
      try {
        if (provider === 'cashfree') {
          const [user] = await db.select().from(users).where(eq(users.id, booking.userId));
          order = await createCashfreeOrder({ booking, user, amount: amountRupees });
          metadata = {
            provider: 'cashfree',
            cfOrderId: order.cf_order_id,
            paymentSessionId: order.payment_session_id,
            orderStatus: order.order_status,
            cashfreeMode: CASHFREE_MODE,
          };
        } else {
          order = await createRazorpayOrder(amountPaise, booking.bookingNumber, { bookingId: booking.id });
          metadata = { provider: 'razorpay' };
        }
      } catch (e: any) {
        set.status = 502;
        return { success: false, message: e.message };
      }

      const externalOrderId = provider === 'cashfree' ? order.order_id : order.id;

      // Upsert a payment record for this booking
      const [existing] = await db.select().from(payments).where(eq(payments.bookingId, booking.id));
      let payment;
      if (existing) {
        [payment] = await db
          .update(payments)
          .set({
            razorpayOrderId: externalOrderId,
            amount: String(booking.total),
            status: 'pending',
            paymentMethod,
            metadata: JSON.stringify(metadata),
            updatedAt: new Date(),
          })
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
            razorpayOrderId: externalOrderId,
            paymentMethod,
            status: 'pending',
            metadata: JSON.stringify(metadata),
          })
          .returning();
      }

      return {
        success: true,
        provider,
        mock: provider === 'razorpay' ? RAZORPAY_MOCK : false,
        order: { id: externalOrderId, amount: amountPaise, currency: 'INR' },
        keyId: provider === 'razorpay' ? (RAZORPAY_KEY_ID || 'rzp_test_MOCK') : undefined,
        cashfree: provider === 'cashfree' ? {
          mode: CASHFREE_MODE,
          paymentSessionId: order.payment_session_id,
          cfOrderId: order.cf_order_id,
          orderStatus: order.order_status,
        } : undefined,
        paymentId: payment.id,
        booking: { id: booking.id, number: booking.bookingNumber, total: booking.total },
        // In mock mode, the client can call /payments/verify with these to simulate success.
        ...(provider === 'razorpay' && RAZORPAY_MOCK && { mockHint: 'POST /payments/verify with razorpay_order_id and any payment_id/signature to confirm.' }),
      };
    },
    { body: t.Object({ bookingId: t.String(), provider: t.Optional(t.Union([t.Literal('razorpay'), t.Literal('cashfree')])) }) }
  )

  // ─── Hosted checkout page (for mobile WebView / SMS links) ──
  // Default provider follows PAYMENT_PROVIDER. Append ?provider=razorpay to force Razorpay.
  .get('/payments/checkout/:bookingId', async ({ params, query, set }) => {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId));
    if (!booking) {
      set.status = 404;
      return 'Booking not found';
    }
    const amountPaise = Math.round(Number(booking.total) * 100);
    const provider = (query?.provider === 'razorpay' ? 'razorpay' : DEFAULT_PROVIDER) as PaymentProvider;
    let order;
    let paymentSessionId = '';
    try {
      if (provider === 'cashfree') {
        const [user] = await db.select().from(users).where(eq(users.id, booking.userId));
        order = await createCashfreeOrder({ booking, user, amount: Number(booking.total) });
        paymentSessionId = order.payment_session_id;
      } else {
        order = await createRazorpayOrder(amountPaise, booking.bookingNumber, { bookingId: booking.id });
      }
    } catch (e: any) {
      set.status = 502;
      return `Could not create order: ${e.message}`;
    }
    const externalOrderId = provider === 'cashfree' ? order.order_id : order.id;
    const metadata = provider === 'cashfree'
      ? { provider, cfOrderId: order.cf_order_id, paymentSessionId, orderStatus: order.order_status, cashfreeMode: CASHFREE_MODE }
      : { provider };
    // Upsert payment row
    const [existing] = await db.select().from(payments).where(eq(payments.bookingId, booking.id));
    if (existing) {
      await db.update(payments).set({
        razorpayOrderId: externalOrderId,
        status: 'pending',
        paymentMethod: provider,
        metadata: JSON.stringify(metadata),
        updatedAt: new Date(),
      }).where(eq(payments.id, existing.id));
    } else {
      await db.insert(payments).values({
        userId: booking.userId,
        bookingId: booking.id,
        amount: String(booking.total),
        currency: 'INR',
        razorpayOrderId: externalOrderId,
        paymentMethod: provider,
        status: 'pending',
        metadata: JSON.stringify(metadata),
      });
    }

    set.headers['Content-Type'] = 'text/html; charset=utf-8';
    if (provider === 'cashfree') {
      return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pay ${booking.bookingNumber}</title>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#0f0a1e;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}.card{max-width:340px;background:#1e1b4b;border:1px solid #312e81;border-radius:24px;padding:32px}h1{margin:0 0 8px;font-size:20px}.amount{font-size:32px;font-weight:bold;color:#a78bfa;margin:8px 0 24px}button{width:100%;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:0;padding:16px;border-radius:12px;font-size:16px;font-weight:600}.status{margin-top:16px;font-size:13px;color:#a8a0c8}</style></head><body>
<div class="card"><h1>Booking ${booking.bookingNumber}</h1><div class="amount">₹${booking.total}</div><button id="pay">Pay with Cashfree</button><div class="status" id="status">Tap to open secure checkout</div></div>
<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
<script>
const cashfree = Cashfree({ mode: ${JSON.stringify(CASHFREE_MODE === 'production' ? 'production' : 'sandbox')} });
async function verify(){
  document.getElementById('status').textContent='Verifying payment...';
  try{
    const r=await fetch('/payments/cashfree/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:${JSON.stringify(externalOrderId)}})});
    const j=await r.json();
    if(j.success||j.paid){ window.location.href='naploo://payment-success?bookingId=' + ${JSON.stringify(booking.id)}; }
    else { document.getElementById('status').textContent='Payment not completed: '+(j.orderStatus||j.message||'pending'); }
  }catch(e){ document.getElementById('status').textContent='Network error while verifying'; }
}
document.getElementById('pay').onclick=async function(){
  const result=await cashfree.checkout({ paymentSessionId:${JSON.stringify(paymentSessionId)}, redirectTarget:'_modal' });
  if(result && result.error){ document.getElementById('status').textContent=result.error.message || 'Payment cancelled'; window.location.href='naploo://payment-cancelled?bookingId=' + ${JSON.stringify(booking.id)}; return; }
  verify();
};
setTimeout(()=>document.getElementById('pay').click(),300);
</script></body></html>`;
    }

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
  key: ${JSON.stringify(RAZORPAY_KEY_ID || 'rzp_test_MOCK')},
  amount: ${amountPaise},
  currency: 'INR',
  order_id: ${JSON.stringify(externalOrderId)},
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

  // ─── Cashfree verify (client callback / polling after checkout) ───
  .post(
    '/payments/cashfree/verify',
    async ({ body, set }) => {
      let order;
      try {
        order = await getCashfreeOrder(body.order_id);
      } catch (e: any) {
        set.status = 502;
        return { success: false, message: e.message };
      }

      const [payment] = await db.select().from(payments).where(eq(payments.razorpayOrderId, body.order_id));
      if (!payment) {
        set.status = 404;
        return { success: false, message: 'Payment record not found for Cashfree order' };
      }

      const paid = order.order_status === 'PAID';
      if (!paid) {
        await db
          .update(payments)
          .set({
            status: order.order_status === 'EXPIRED' ? 'failed' : 'pending',
            failureReason: order.order_status === 'EXPIRED' ? 'Cashfree order expired' : null,
            metadata: JSON.stringify({ ...paymentMetadata(payment), orderStatus: order.order_status, lastVerifiedAt: new Date().toISOString() }),
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));
        return { success: false, paid: false, orderStatus: order.order_status };
      }

      const [updated] = await db
        .update(payments)
        .set({
          status: 'completed',
          metadata: JSON.stringify({ ...paymentMetadata(payment), orderStatus: order.order_status, cfOrderId: order.cf_order_id, paidAt: new Date().toISOString() }),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      if (payment.bookingId) {
        await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, payment.bookingId));
        notifyInvestorIfPodOwner(payment.bookingId).catch(() => {});
      }

      return { success: true, paid: true, orderStatus: order.order_status, payment: updated, bookingConfirmed: !!payment.bookingId };
    },
    { body: t.Object({ order_id: t.String() }) }
  )

  // ─── Cashfree webhook ──────────────────────────────────────
  .post('/payments/cashfree/webhook', async ({ body }) => {
    const data = body as any;
    const orderId = data?.data?.order?.order_id || data?.order_id;
    const orderStatus = data?.data?.order?.order_status || data?.order_status;
    if (!orderId) return { success: true, ignored: true };

    const [payment] = await db.select().from(payments).where(eq(payments.razorpayOrderId, orderId));
    if (payment && orderStatus === 'PAID' && payment.status !== 'completed') {
      await db.update(payments).set({
        status: 'completed',
        metadata: JSON.stringify({ ...paymentMetadata(payment), orderStatus, webhookReceivedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      }).where(eq(payments.id, payment.id));
      if (payment.bookingId) {
        await db.update(bookings).set({ status: 'confirmed', updatedAt: new Date() }).where(eq(bookings.id, payment.bookingId));
        notifyInvestorIfPodOwner(payment.bookingId).catch(() => {});
      }
    }
    return { success: true, received: true };
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

  // ─── Refund ─────────────────────────────────────────────────
  .post(
    '/payments/:id/refund',
    async ({ params, body, set }) => {
      const [payment] = await db.select().from(payments).where(eq(payments.id, params.id));
      if (!payment) {
        set.status = 404;
        return { success: false, message: 'Payment not found' };
      }
      if (!['completed', 'partially_refunded'].includes(payment.status)) {
        set.status = 400;
        return { success: false, message: 'Only completed payments can be refunded' };
      }
      const totalAmount = Number(payment.amount);
      const alreadyRefunded = Number(payment.refundedAmount || 0);
      const refundAmount = body?.amount ?? (totalAmount - alreadyRefunded);
      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        set.status = 400;
        return { success: false, message: 'Refund amount must be greater than zero' };
      }
      if (refundAmount > totalAmount - alreadyRefunded + 0.01) {
        set.status = 400;
        return { success: false, message: 'Refund amount exceeds refundable balance' };
      }

      const metadata = paymentMetadata(payment);
      const provider = (metadata.provider || payment.paymentMethod || 'razorpay') as PaymentProvider;
      let gatewayRefund;
      try {
        gatewayRefund = provider === 'cashfree'
          ? await createCashfreeRefund(payment, refundAmount, body?.reason)
          : await createRazorpayRefund(payment, refundAmount, body?.reason);
      } catch (e: any) {
        set.status = 502;
        return { success: false, message: e.message };
      }

      const nextRefundedAmount = alreadyRefunded + refundAmount;
      const refundHistory = Array.isArray(metadata.refunds) ? metadata.refunds : [];
      const [updated] = await db
        .update(payments)
        .set({
          status: nextRefundedAmount >= totalAmount - 0.01 ? 'refunded' : 'partially_refunded',
          refundedAmount: String(nextRefundedAmount),
          refundReason: body?.reason ?? null,
          refundedAt: new Date(),
          metadata: JSON.stringify({
            ...metadata,
            refunds: [
              ...refundHistory,
              {
                amount: refundAmount,
                reason: body?.reason ?? null,
                source: body?.source ?? 'manual',
                initiatedBy: body?.initiatedBy ?? null,
                initiatedByRole: body?.initiatedByRole ?? null,
                createdAt: new Date().toISOString(),
                gatewayRefund,
              },
            ],
          }),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();
      return { success: true, payment: updated, refund: gatewayRefund };
    },
    {
      body: t.Optional(t.Object({
        amount: t.Optional(t.Number()),
        reason: t.Optional(t.String()),
        source: t.Optional(t.String()),
        initiatedBy: t.Optional(t.String()),
        initiatedByRole: t.Optional(t.String()),
      })),
    }
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

console.log(`💳 Naploo Payment Service running at http://localhost:${app.server?.port} (${DEFAULT_PROVIDER.toUpperCase()} ${DEFAULT_PROVIDER === 'cashfree' ? CASHFREE_MODE.toUpperCase() : (RAZORPAY_MOCK ? 'MOCK' : 'LIVE')} mode)`);

export type App = typeof app;
