import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { db } from '@naploo/db';
import { users, otps, refreshTokens } from '@naploo/db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'naploo-jwt-secret-key-change-in-production-2026',
  }))
  .use(jwt({
    name: 'refreshJwt',
    secret: process.env.REFRESH_TOKEN_SECRET || 'naploo-refresh-token-secret-change-in-production',
  }))

  // ─── Health Check ───────────────────────────────────────────
  .get('/health', () => ({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }))

  // ─── Send OTP ───────────────────────────────────────────────
  .post('/send-otp', async ({ body, set }) => {
    const { phone } = body;

    // Normalize phone: ensure +91 prefix
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^0+/, '')}`;

    // Rate limit: max 5 OTPs per phone in last 10 minutes
    const recentOtps = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.phone, normalizedPhone),
          gt(otps.createdAt, new Date(Date.now() - 10 * 60 * 1000))
        )
      );

    if (recentOtps.length >= 5) {
      set.status = 429;
      return {
        success: false,
        message: 'Too many OTP requests. Please wait 10 minutes.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await db.insert(otps).values({
      phone: normalizedPhone,
      otp,
      expiresAt,
      verified: false,
    });

    // Send OTP via notification-service (MSG91 in prod, mock in dev)
    console.log(`📱 OTP for ${normalizedPhone}: ${otp}`);
    const notifyUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
    fetch(`${notifyUrl}/notify/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizedPhone, otp }),
    }).catch((e) => console.error('notification-service unreachable:', e?.message));

    return {
      success: true,
      message: 'OTP sent successfully',
      // Include OTP in response for dev mode
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    };
  }, {
    body: t.Object({
      phone: t.String({ minLength: 10, maxLength: 15 }),
    }),
  })

  // ─── Verify OTP & Login/Register ───────────────────────────
  .post('/verify-otp', async ({ body, jwt, refreshJwt, set }) => {
    const { phone, otp, name, email } = body;

    // Normalize phone
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^0+/, '')}`;

    // Find valid OTP (not expired, not already verified)
    const validOtp = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.phone, normalizedPhone),
          eq(otps.otp, otp),
          eq(otps.verified, false),
          gt(otps.expiresAt, new Date())
        )
      )
      .orderBy(desc(otps.createdAt))
      .limit(1);

    if (validOtp.length === 0) {
      set.status = 401;
      return {
        success: false,
        message: 'Invalid or expired OTP',
      };
    }

    // Mark OTP as verified
    await db
      .update(otps)
      .set({ verified: true })
      .where(eq(otps.id, validOtp[0].id));

    // Find existing user or create new one
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);

    let isNewUser = false;

    if (user.length === 0) {
      // Create new user
      isNewUser = true;
      const referralCode = `NAP${Date.now().toString(36).toUpperCase()}`;

      const [newUser] = await db
        .insert(users)
        .values({
          phone: normalizedPhone,
          firstName: name || null,
          email: email || null,
          role: 'customer',
          status: 'active',
          phoneVerified: true,
          referralCode,
        })
        .returning();

      user = [newUser];
    } else {
      // Update existing user: mark phone verified, update last login
      await db
        .update(users)
        .set({
          phoneVerified: true,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          // Update name/email if provided and not already set
          ...(name && !user[0].firstName && { firstName: name }),
          ...(email && !user[0].email && { email }),
        })
        .where(eq(users.id, user[0].id));
    }

    const userData = user[0];

    // Generate access token (15 minutes)
    const accessToken = await jwt.sign({
      userId: userData.id,
      role: userData.role,
      phone: normalizedPhone,
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    });

    // Generate refresh token (7 days)
    const refreshTokenValue = await refreshJwt.sign({
      userId: userData.id,
      tokenId: randomUUID(),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });

    // Store refresh token in DB
    await db.insert(refreshTokens).values({
      userId: userData.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      isNewUser,
      user: {
        id: userData.id,
        phone: userData.phone,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        role: userData.role,
        status: userData.status,
      },
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }, {
    body: t.Object({
      phone: t.String({ minLength: 10, maxLength: 15 }),
      otp: t.String({ minLength: 6, maxLength: 6 }),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
  })

  // ─── Refresh Token ─────────────────────────────────────────
  .post('/refresh', async ({ body, jwt, refreshJwt, set }) => {
    const { refreshToken } = body;

    // Verify refresh token signature
    const payload = await refreshJwt.verify(refreshToken);
    if (!payload || !payload.userId) {
      set.status = 401;
      return { success: false, message: 'Invalid refresh token' };
    }

    // Check if token exists in DB and is not expired
    const storedToken = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshToken),
          eq(refreshTokens.userId, payload.userId as string),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (storedToken.length === 0) {
      set.status = 401;
      return { success: false, message: 'Refresh token expired or revoked' };
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId as string))
      .limit(1);

    if (user.length === 0 || user[0].status !== 'active') {
      set.status = 401;
      return { success: false, message: 'User not found or inactive' };
    }

    // Generate new access token
    const accessToken = await jwt.sign({
      userId: user[0].id,
      role: user[0].role,
      phone: user[0].phone,
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    });

    return {
      success: true,
      accessToken,
      user: {
        id: user[0].id,
        phone: user[0].phone,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        avatar: user[0].avatar,
        role: user[0].role,
        status: user[0].status,
      },
    };
  }, {
    body: t.Object({
      refreshToken: t.String(),
    }),
  })

  // ─── Get Current User (Protected) ──────────────────────────
  .get('/me', async ({ headers, jwt, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return { success: false, message: 'No token provided' };
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { success: false, message: 'Invalid or expired token' };
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId as string))
      .limit(1);

    if (user.length === 0) {
      set.status = 404;
      return { success: false, message: 'User not found' };
    }

    const u = user[0];
    return {
      success: true,
      user: {
        id: u.id,
        phone: u.phone,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        avatar: u.avatar,
        role: u.role,
        status: u.status,
        city: u.city,
        state: u.state,
        phoneVerified: u.phoneVerified,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
      },
    };
  })

  // ─── Update Profile ─────────────────────────────────────────
  .patch('/profile', async ({ body, headers, jwt, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return { success: false, message: 'No token provided' };
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      set.status = 401;
      return { success: false, message: 'Invalid or expired token' };
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.pincode !== undefined) updateData.pincode = body.pincode;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, payload.userId as string))
      .returning();

    return {
      success: true,
      message: 'Profile updated',
      user: {
        id: updated.id,
        phone: updated.phone,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        avatar: updated.avatar,
        role: updated.role,
        status: updated.status,
        city: updated.city,
        state: updated.state,
      },
    };
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
  })

  // ─── Logout ─────────────────────────────────────────────────
  .post('/logout', async ({ body, set }) => {
    const { refreshToken } = body;

    if (refreshToken) {
      // Delete refresh token from DB
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }, {
    body: t.Object({
      refreshToken: t.Optional(t.String()),
    }),
  })

  .listen({
    hostname: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
    port: Number(process.env.AUTH_SERVICE_PORT || 3001),
  });

console.log(`
🔐 Auth Service running at http://localhost:${app.server?.port}
📡 Endpoints:
   POST /send-otp     - Send OTP to phone
   POST /verify-otp   - Verify OTP & login/register
   POST /refresh      - Refresh access token
   GET  /me           - Get current user profile
   PATCH /profile     - Update user profile
   POST /logout       - Logout & revoke refresh token
`);

export type AuthApp = typeof app;
