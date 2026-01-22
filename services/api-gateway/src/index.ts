import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

const app = new Elysia()
  .use(cors())
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
  
  // Health Check
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
  
  // API Version
  .group('/api/v1', (app) => 
    app
      // Auth routes (proxy to auth-service)
      .get('/auth/health', () => ({ status: 'auth-service' }), {
        detail: { tags: ['Auth'] }
      })
      
      // Booking routes (proxy to booking-service)  
      .get('/bookings/health', () => ({ status: 'booking-service' }), {
        detail: { tags: ['Bookings'] }
      })
      
      // Investor routes (proxy to investor-service)
      .get('/investors/health', () => ({ status: 'investor-service' }), {
        detail: { tags: ['Investors'] }
      })
      
      // Partner routes (proxy to hotel-service)
      .get('/partners/health', () => ({ status: 'hotel-service' }), {
        detail: { tags: ['Partners'] }
      })
  )
  
  .listen(process.env.API_GATEWAY_PORT || 3000);

console.log(`
🚀 Naploo API Gateway running at http://localhost:${app.server?.port}
📚 Swagger docs at http://localhost:${app.server?.port}/swagger
`);

export type App = typeof app;
