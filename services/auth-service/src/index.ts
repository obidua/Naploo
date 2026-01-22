import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';

const app = new Elysia()
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'naploo-secret-key',
    exp: process.env.JWT_EXPIRES_IN || '15m',
  }))
  
  // Health Check
  .get('/health', () => ({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }))
  
  // Send OTP
  .post('/send-otp', async ({ body }) => {
    const { phone } = body;
    
    // TODO: Integrate MSG91 for OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database (expires in 5 minutes)
    // TODO: Save to database
    
    console.log(`OTP for ${phone}: ${otp}`); // For testing
    
    return {
      success: true,
      message: 'OTP sent successfully',
      // Remove in production:
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }, {
    body: t.Object({
      phone: t.String({ minLength: 10, maxLength: 13 }),
    }),
  })
  
  // Verify OTP & Login
  .post('/verify-otp', async ({ body, jwt }) => {
    const { phone, otp } = body;
    
    // TODO: Verify OTP from database
    // TODO: Create or get user
    // TODO: Generate tokens
    
    const user = {
      id: 'user-uuid',
      phone,
      role: 'customer',
    };
    
    const accessToken = await jwt.sign({
      userId: user.id,
      role: user.role,
    });
    
    return {
      success: true,
      message: 'Login successful',
      user,
      accessToken,
      // TODO: Add refresh token
    };
  }, {
    body: t.Object({
      phone: t.String({ minLength: 10, maxLength: 13 }),
      otp: t.String({ minLength: 6, maxLength: 6 }),
    }),
  })
  
  // Refresh Token
  .post('/refresh', async ({ body, jwt }) => {
    const { refreshToken } = body;
    
    // TODO: Verify refresh token
    // TODO: Generate new access token
    
    return {
      success: true,
      accessToken: 'new-access-token',
    };
  }, {
    body: t.Object({
      refreshToken: t.String(),
    }),
  })
  
  // Logout
  .post('/logout', async ({ headers }) => {
    // TODO: Invalidate refresh token
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  })
  
  .listen(process.env.AUTH_SERVICE_PORT || 3001);

console.log(`
🔐 Auth Service running at http://localhost:${app.server?.port}
`);

export type AuthApp = typeof app;
