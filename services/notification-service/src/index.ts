import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// ─── Provider config ──────────────────────────────────────────
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'NAPLOO';
const MSG91_OTP_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID || '';
const MSG91_SMS_TEMPLATE_ID = process.env.MSG91_SMS_TEMPLATE_ID || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'Naploo <noreply@naploo.com>';

const SMS_MOCK = !MSG91_AUTH_KEY;
const EMAIL_MOCK = !RESEND_API_KEY;

if (SMS_MOCK) console.warn('⚠️  notification-service: SMS in MOCK mode (no MSG91_AUTH_KEY).');
if (EMAIL_MOCK) console.warn('⚠️  notification-service: EMAIL in MOCK mode (no RESEND_API_KEY).');

function normalizePhone(phone: string): string {
  // MSG91 wants country code without '+', e.g. 919876543210
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits.replace(/^0+/, '');
}

// ─── SMS via MSG91 ────────────────────────────────────────────
async function sendSms(phone: string, message: string): Promise<{ sent: boolean; mock: boolean; detail?: string }> {
  const mobile = normalizePhone(phone);
  if (SMS_MOCK) {
    console.log(`📱 [MOCK SMS] → ${mobile}: ${message}`);
    return { sent: true, mock: true };
  }
  // MSG91 flow API for transactional SMS
  const res = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: MSG91_SMS_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      short_url: '0',
      recipients: [{ mobiles: mobile, message }],
    }),
  });
  const detail = await res.text();
  return { sent: res.ok, mock: false, detail };
}

// ─── OTP via MSG91 OTP API ────────────────────────────────────
async function sendOtp(phone: string, otp: string): Promise<{ sent: boolean; mock: boolean; detail?: string }> {
  const mobile = normalizePhone(phone);
  if (SMS_MOCK) {
    console.log(`🔐 [MOCK OTP] → ${mobile}: ${otp}`);
    return { sent: true, mock: true };
  }
  const url = new URL('https://control.msg91.com/api/v5/otp');
  url.searchParams.set('template_id', MSG91_OTP_TEMPLATE_ID);
  url.searchParams.set('mobile', mobile);
  url.searchParams.set('otp', otp);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
  });
  const detail = await res.text();
  return { sent: res.ok, mock: false, detail };
}

// ─── Email via Resend ─────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; mock: boolean; detail?: string }> {
  if (EMAIL_MOCK) {
    console.log(`📧 [MOCK EMAIL] → ${to} | ${subject}`);
    return { sent: true, mock: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });
  const detail = await res.text();
  return { sent: res.ok, mock: false, detail };
}

// ─── Templates ────────────────────────────────────────────────
function bookingConfirmationHtml(b: any): string {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#4f46e5">Booking Confirmed 🎉</h2>
    <p>Hi ${b.guestName || 'there'}, your Naploo booking is confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:6px 0;color:#666">Booking No.</td><td style="text-align:right"><b>${b.bookingNumber}</b></td></tr>
      <tr><td style="padding:6px 0;color:#666">Hotel</td><td style="text-align:right">${b.hotelName || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Type</td><td style="text-align:right">${b.bookingType === 'pod' ? 'Sleeping Pod (hourly)' : 'Room (nightly)'}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Check-in</td><td style="text-align:right">${b.checkIn}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total Paid</td><td style="text-align:right"><b>₹${b.total}</b></td></tr>
    </table>
    <p style="color:#888;font-size:13px">Show your booking number at the front desk. Safe travels! — Team Naploo</p>
  </div>`;
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: { info: { title: 'Naploo Notification Service', version: '1.0.0', description: 'SMS (MSG91), OTP & Email (Resend)' } },
    })
  )

  .get('/health', () => ({
    status: 'healthy',
    service: 'notification-service',
    sms: SMS_MOCK ? 'mock' : 'live',
    email: EMAIL_MOCK ? 'mock' : 'live',
    timestamp: new Date().toISOString(),
  }))

  .post('/notify/otp', async ({ body }) => {
    const r = await sendOtp(body.phone, body.otp);
    return { success: r.sent, ...r };
  }, { body: t.Object({ phone: t.String(), otp: t.String() }) })

  .post('/notify/sms', async ({ body }) => {
    const r = await sendSms(body.phone, body.message);
    return { success: r.sent, ...r };
  }, { body: t.Object({ phone: t.String(), message: t.String() }) })

  .post('/notify/email', async ({ body }) => {
    const r = await sendEmail(body.to, body.subject, body.html);
    return { success: r.sent, ...r };
  }, { body: t.Object({ to: t.String(), subject: t.String(), html: t.String() }) })

  // Composite: send booking confirmation via SMS + email
  .post('/notify/booking-confirmation', async ({ body }) => {
    const results: Record<string, unknown> = {};
    if (body.phone) {
      results.sms = await sendSms(
        body.phone,
        `Naploo: Booking ${body.bookingNumber} confirmed at ${body.hotelName || 'your hotel'}. Total Rs.${body.total}. Check-in ${body.checkIn}.`
      );
    }
    if (body.email) {
      results.email = await sendEmail(body.email, `Naploo Booking ${body.bookingNumber} Confirmed`, bookingConfirmationHtml(body));
    }
    return { success: true, results };
  }, {
    body: t.Object({
      bookingNumber: t.String(),
      bookingType: t.Optional(t.String()),
      hotelName: t.Optional(t.String()),
      checkIn: t.Optional(t.String()),
      total: t.Optional(t.Union([t.String(), t.Number()])),
      guestName: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
  })

  .listen({
    hostname: process.env.NOTIFICATION_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.NOTIFICATION_SERVICE_PORT || 3008),
  });

console.log(`🔔 Naploo Notification Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
