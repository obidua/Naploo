import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

// Naploo Home & Office pod rentals are long-term contract leads (12-month).
// There is no rentals table in the schema yet, so this service captures
// enquiries and forwards them to the team via notification-service.
const NOTIFY = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const TEAM_EMAIL = process.env.RENTAL_LEAD_EMAIL || 'support@naploo.com';

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))

  .get('/health', () => ({ status: 'healthy', service: 'rental-service', timestamp: new Date().toISOString() }))

  // ─── Submit a home/office rental enquiry (lead) ─────────────
  // path under gateway: /api/v1/rentals/enquiry → /enquiry
  .post('/enquiry', async ({ body }) => {
    const subject = `New ${body.type} pod rental enquiry — ${body.name}`;
    const html = `
      <h2>New Pod Rental Enquiry</h2>
      <p><b>Type:</b> ${body.type}</p>
      <p><b>Name:</b> ${body.name}</p>
      <p><b>Phone:</b> ${body.phone}</p>
      <p><b>Email:</b> ${body.email || '-'}</p>
      <p><b>City:</b> ${body.city || '-'}</p>
      <p><b>Units:</b> ${body.units ?? 1}</p>
      <p><b>Message:</b> ${body.message || '-'}</p>`;
    try {
      await fetch(`${NOTIFY}/notify/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: TEAM_EMAIL, subject, html }),
      });
      if (body.phone) {
        await fetch(`${NOTIFY}/notify/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: body.phone, message: `Naploo: thanks ${body.name}! We received your ${body.type} pod rental enquiry and will call you shortly.` }),
        });
      }
    } catch (e) {
      console.error('rental enquiry notify failed:', e);
    }
    return { success: true, message: 'Enquiry received. Our team will contact you shortly.' };
  }, {
    body: t.Object({
      type: t.Union([t.Literal('home'), t.Literal('office')]),
      name: t.String(),
      phone: t.String(),
      email: t.Optional(t.String()),
      city: t.Optional(t.String()),
      units: t.Optional(t.Number()),
      message: t.Optional(t.String()),
    }),
  })

  .listen({
    hostname: process.env.RENTAL_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.RENTAL_SERVICE_PORT || 3006),
  });

console.log(`🏠 Naploo Rental Service running at http://localhost:${app.server?.port}`);

export type App = typeof app;
