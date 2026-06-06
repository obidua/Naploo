import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt';

// ─── Service registry ─────────────────────────────────────────
const AUTH = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const HOTEL = process.env.HOTEL_SERVICE_URL || 'http://localhost:3007';
const SEARCH = process.env.SEARCH_SERVICE_URL || 'http://localhost:3010';
const BOOKING = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
const NOTIFY = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const INVESTOR = process.env.INVESTOR_SERVICE_URL || 'http://localhost:3004';
const REFERRAL = process.env.REFERRAL_SERVICE_URL || 'http://localhost:3005';
const RENTAL = process.env.RENTAL_SERVICE_URL || 'http://localhost:3006';
const ANALYTICS = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3009';
const ADMIN = process.env.ADMIN_SERVICE_URL || 'http://localhost:3011';

const JWT_SECRET = process.env.JWT_SECRET || 'naploo-jwt-secret-key-change-in-production-2026';

// first path segment under /api/v1 → upstream service + optional prefix strip
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
  investors: { base: INVESTOR, strip: '/investors' },
  associates: { base: REFERRAL, strip: '/associates' },
  referrals: { base: REFERRAL, strip: '/referrals' },
  rentals: { base: RENTAL, strip: '/rentals' },
  analytics: { base: ANALYTICS, strip: '/analytics' },
  admin: { base: ADMIN, strip: '/admin' },
};

type Access = 'public' | 'authed' | 'partner' | 'admin';

// Decide the access level required for a request
function accessFor(method: string, seg: string): Access {
  if (seg === 'admin' || seg === 'analytics') return 'admin';
  if (seg === 'notify') return 'admin';
  // Partner inventory writes (listings + pricing)
  if (['hotels', 'rooms', 'pod-sets'].includes(seg) && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return 'partner';
  if (seg === 'partner') return 'partner';
  // Authenticated customer areas
  if (['bookings', 'payments', 'investors', 'associates', 'referrals'].includes(seg)) return 'authed';
  // public: auth, search, nearby, cities, quote, availability, GET hotels/rooms/pod-sets, rentals (lead capture)
  return 'public';
}

const isPartner = (r?: string) => r === 'partner' || r === 'admin' || r === 'super_admin';
const isAdmin = (r?: string) => r === 'admin' || r === 'super_admin';

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: { title: 'Naploo API', version: '1.1.0', description: 'Naploo Ecosystem API Gateway (JWT-gated)' },
        tags: [
          { name: 'Auth', description: 'Authentication' },
          { name: 'Hotels', description: 'Hotels, rooms & pods' },
          { name: 'Search', description: 'Search & nearby' },
          { name: 'Bookings', description: 'Pod & room bookings' },
          { name: 'Payments', description: 'Razorpay payments' },
          { name: 'Admin', description: 'Admin operations' },
        ],
      },
    })
  )

  .get('/health', async () => {
    const targets = { auth: AUTH, hotel: HOTEL, search: SEARCH, booking: BOOKING, payment: PAYMENT, notification: NOTIFY, investor: INVESTOR, referral: REFERRAL, rental: RENTAL, analytics: ANALYTICS, admin: ADMIN };
    const checks = await Promise.allSettled(
      Object.entries(targets).map(async ([name, base]) => {
        try {
          const r = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) });
          return [name, r.ok ? 'up' : 'down'];
        } catch {
          return [name, 'down'];
        }
      })
    );
    const services: Record<string, string> = {};
    for (const c of checks) if (c.status === 'fulfilled') services[c.value[0] as string] = c.value[1] as string;
    return { status: 'healthy', service: 'api-gateway', services, timestamp: new Date().toISOString() };
  })

  .get('/', () => ({ message: 'Welcome to Naploo API', version: '1.1.0', docs: '/swagger' }))

  // Generic gated proxy for everything under /api/v1
  .all('/api/v1/*', async ({ request, set, jwt }) => {
    const url = new URL(request.url);
    const subPath = url.pathname.replace(/^\/api\/v1/, ''); // e.g. /hotels/123
    const seg = subPath.split('/')[1] || '';
    const route = ROUTES[seg];
    if (!route) {
      set.status = 404;
      return { success: false, message: `Unknown route: ${seg}` };
    }

    // Verify bearer token (if present) → identity
    let userId: string | undefined;
    let role: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await jwt.verify(authHeader.slice(7));
        if (payload) {
          userId = (payload as any).userId;
          role = (payload as any).role;
        }
      } catch {
        /* invalid token → treated as anonymous */
      }
    }

    // Enforce access policy
    const need = accessFor(request.method, seg);
    if (need !== 'public') {
      if (!userId) {
        set.status = 401;
        return { success: false, message: 'Authentication required' };
      }
      if (need === 'admin' && !isAdmin(role)) {
        set.status = 403;
        return { success: false, message: 'Admin access required' };
      }
      if (need === 'partner' && !isPartner(role)) {
        set.status = 403;
        return { success: false, message: 'Partner access required' };
      }
    }

    // Forward
    const fwdPath = route.strip ? subPath.replace(route.strip, '') : subPath;
    const targetUrl = route.base + (fwdPath || '/') + url.search;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = userId;
    if (role) headers['x-user-role'] = role;
    if (authHeader) headers.Authorization = authHeader;
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
  })

  .listen({
    hostname: process.env.API_GATEWAY_HOST || '127.0.0.1',
    port: Number(process.env.API_GATEWAY_PORT || 3000),
  });

console.log(`🚀 Naploo API Gateway running at http://localhost:${app.server?.port}`);
console.log(`📚 Swagger docs at http://localhost:${app.server?.port}/swagger`);

export type App = typeof app;
