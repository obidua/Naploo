import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Helper to proxy requests to a service
async function proxyToService(serviceUrl: string, path: string, options: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
} = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${serviceUrl}${path}`, fetchOptions);
  const data = await response.json();
  return { data, status: response.status };
}

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Naploo API',
        version: '1.0.0',
        description: 'Naploo Ecosystem API Gateway',
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Bookings', description: 'Pod booking endpoints' },
        { name: 'Investors', description: 'Investor pool endpoints' },
        { name: 'Partners', description: 'Hotel/Homestay partner endpoints' },
      ],
    },
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'naploo-jwt-secret-key-change-in-production-2026',
  }))
  
  // ─── Health Check ───────────────────────────────────────────
  .get('/health', () => ({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }), {
    detail: {
      tags: ['Health'],
      summary: 'Health check endpoint',
    },
  })
  
  // Root endpoint
  .get('/', () => ({
    message: 'Welcome to Naploo API',
    version: '1.0.0',
    docs: '/swagger',
  }))
  
  // ─── API v1 Routes ──────────────────────────────────────────
  .group('/api/v1', (app) => 
    app
      // ─── Auth Routes (proxy to auth-service) ────────────────
      .get('/auth/health', async () => {
        try {
          const { data } = await proxyToService(AUTH_SERVICE_URL, '/health');
          return data;
        } catch {
          return { status: 'auth-service unreachable' };
        }
      }, {
        detail: { tags: ['Auth'], summary: 'Auth service health check' }
      })

      .post('/auth/send-otp', async ({ body, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/send-otp', {
            method: 'POST',
            body,
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        body: t.Object({
          phone: t.String({ minLength: 10, maxLength: 15 }),
        }),
        detail: { tags: ['Auth'], summary: 'Send OTP to phone number' }
      })

      .post('/auth/verify-otp', async ({ body, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/verify-otp', {
            method: 'POST',
            body,
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        body: t.Object({
          phone: t.String({ minLength: 10, maxLength: 15 }),
          otp: t.String({ minLength: 6, maxLength: 6 }),
          name: t.Optional(t.String()),
          email: t.Optional(t.String()),
        }),
        detail: { tags: ['Auth'], summary: 'Verify OTP and login/register' }
      })

      .post('/auth/refresh', async ({ body, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/refresh', {
            method: 'POST',
            body,
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        body: t.Object({
          refreshToken: t.String(),
        }),
        detail: { tags: ['Auth'], summary: 'Refresh access token' }
      })

      .get('/auth/me', async ({ headers, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/me', {
            headers: {
              ...(headers.authorization && { Authorization: headers.authorization }),
            },
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        detail: { tags: ['Auth'], summary: 'Get current user profile' }
      })

      .patch('/auth/profile', async ({ body, headers, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/profile', {
            method: 'PATCH',
            body,
            headers: {
              ...(headers.authorization && { Authorization: headers.authorization }),
            },
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        body: t.Object({
          firstName: t.Optional(t.String()),
          lastName: t.Optional(t.String()),
          email: t.Optional(t.String()),
          avatar: t.Optional(t.String()),
          city: t.Optional(t.String()),
          state: t.Optional(t.String()),
          address: t.Optional(t.String()),
          pincode: t.Optional(t.String()),
        }),
        detail: { tags: ['Auth'], summary: 'Update user profile' }
      })

      .post('/auth/logout', async ({ body, set }) => {
        try {
          const { data, status } = await proxyToService(AUTH_SERVICE_URL, '/logout', {
            method: 'POST',
            body,
          });
          set.status = status;
          return data;
        } catch (e) {
          set.status = 502;
          return { success: false, message: 'Auth service unavailable' };
        }
      }, {
        body: t.Object({
          refreshToken: t.Optional(t.String()),
        }),
        detail: { tags: ['Auth'], summary: 'Logout and revoke refresh token' }
      })
      
      // ─── Booking routes (placeholder) ───────────────────────
      .get('/bookings/health', () => ({ status: 'booking-service', message: 'Not yet implemented' }), {
        detail: { tags: ['Bookings'] }
      })
      
      // ─── Investor routes (placeholder) ──────────────────────
      .get('/investors/health', () => ({ status: 'investor-service', message: 'Not yet implemented' }), {
        detail: { tags: ['Investors'] }
      })
      
      // ─── Partner routes (placeholder) ───────────────────────
      .get('/partners/health', () => ({ status: 'hotel-service', message: 'Not yet implemented' }), {
        detail: { tags: ['Partners'] }
      })
  )
  
  .listen({
    hostname: process.env.API_GATEWAY_HOST || '127.0.0.1',
    port: Number(process.env.API_GATEWAY_PORT || 3000),
  });

console.log(`
🚀 Naploo API Gateway running at http://localhost:${app.server?.port}
📚 Swagger docs at http://localhost:${app.server?.port}/swagger
🔗 Auth service at ${AUTH_SERVICE_URL}
`);

export type App = typeof app;
