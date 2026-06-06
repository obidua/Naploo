import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// ─── Service registry ─────────────────────────────────────────
const AUTH = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const HOTEL = process.env.HOTEL_SERVICE_URL || 'http://localhost:3007';
const SEARCH = process.env.SEARCH_SERVICE_URL || 'http://localhost:3010';
const BOOKING = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
const NOTIFY = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';

// Map first path segment under /api/v1 → upstream service.
// `strip` removes that prefix before forwarding (auth-service has no /auth prefix).
const ROUTES: Record<string, { base: string; strip?: string }> = {
  auth: { base: AUTH, strip: '/auth' },
  hotels: { base: HOTEL },
  rooms: { base: HOTEL },
  'pod-sets': { base: HOTEL },
  search: { base: SEARCH },
  nearby: { base: SEARCH },
  cities: { base: SEARCH },
  bookings: { base: BOOKING },
  availability: { base: BOOKING },
  quote: { base: BOOKING },
  partner: { base: BOOKING },
  payments: { base: PAYMENT },
  notify: { base: NOTIFY },
};

async function forward(request: Request, set: any) {
  const url = new URL(request.url);
  const subPath = url.pathname.replace(/^\/api\/v1/, ''); // e.g. /hotels/123
  const seg = subPath.split('/')[1] || '';
  const route = ROUTES[seg];
  if (!route) {
    set.status = 404;
    return { success: false, message: `Unknown route: ${seg}` };
  }
  const fwdPath = route.strip ? subPath.replace(route.strip, '') : subPath;
  const targetUrl = route.base + (fwdPath || '/') + url.search;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = request.headers.get('authorization');
  if (auth) headers.Authorization = auth;
  const rzpSig = request.headers.get('x-razorpay-signature');
  if (rzpSig) headers['x-razorpay-signature'] = rzpSig;

  const init: RequestInit = { method: request.method, headers };
  if (!['GET', 'HEAD'].includes(request.method)) {
    const body = await request.text();
    if (body) init.body = body;
  }

  try {
    const res = await fetch(targetUrl, init);
    set.status = res.status;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (e: any) {
    set.status = 502;
    return { success: false, message: `Upstream service '${seg}' unavailable`, detail: e?.message };
  }
}

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: { title: 'Naploo API', version: '1.0.0', description: 'Naploo Ecosystem API Gateway' },
        tags: [
          { name: 'Auth', description: 'Authentication' },
          { name: 'Hotels', description: 'Hotels, rooms & pods' },
          { name: 'Search', description: 'Search & nearby discovery' },
          { name: 'Bookings', description: 'Pod & room bookings' },
          { name: 'Payments', description: 'Razorpay payments' },
        ],
      },
    })
  )

  .get('/health', async () => {
    // Aggregate health of all upstreams
    const checks = await Promise.allSettled(
      Object.entries({ auth: AUTH, hotel: HOTEL, search: SEARCH, booking: BOOKING, payment: PAYMENT, notification: NOTIFY }).map(
        async ([name, base]) => {
          try {
            const r = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) });
            return [name, r.ok ? 'up' : 'down'];
          } catch {
            return [name, 'down'];
          }
        }
      )
    );
    const services: Record<string, string> = {};
    for (const c of checks) if (c.status === 'fulfilled') services[c.value[0] as string] = c.value[1] as string;
    return { status: 'healthy', service: 'api-gateway', services, timestamp: new Date().toISOString() };
  })

  .get('/', () => ({ message: 'Welcome to Naploo API', version: '1.0.0', docs: '/swagger' }))

  // Generic proxy for everything under /api/v1
  .all('/api/v1/*', ({ request, set }) => forward(request, set))

  .listen({
    hostname: process.env.API_GATEWAY_HOST || '127.0.0.1',
    port: Number(process.env.API_GATEWAY_PORT || 3000),
  });

console.log(`🚀 Naploo API Gateway running at http://localhost:${app.server?.port}`);
console.log(`📚 Swagger docs at http://localhost:${app.server?.port}/swagger`);

export type App = typeof app;
