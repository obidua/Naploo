// Sidebar gap parity for partner portal: loyalty, concierge, spa, multi-outlet aggregation.
// Mounted via registerQlo2(app) in pms-service/src/index.ts after registerQloParity.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import { sql } from 'drizzle-orm';

function _rows(r: any): any[] { return Array.isArray(r) ? r : (r?.rows ?? []); }

async function resolvePartnerId(headers: Record<string, any>): Promise<{ partnerId: string; userId: string; role: string } | null> {
  const userId = headers['x-user-id'] as string | undefined;
  if (!userId) return null;
  const r = await db.execute(sql`SELECT partner_id, role FROM staff WHERE user_id = ${userId} AND status = 'active' LIMIT 1`);
  const rs = _rows(r);
  if (rs.length) return { partnerId: rs[0].partner_id, role: rs[0].role, userId };
  const r2 = await db.execute(sql`SELECT id FROM partners WHERE user_id = ${userId} LIMIT 1`);
  const rs2 = _rows(r2);
  if (rs2.length) return { partnerId: rs2[0].id, role: 'owner', userId };
  return null;
}

export function registerQlo2(app: any) {
  return app
    // ─── LOYALTY ──────────────────────────────────────────
    .get('/loyalty/program', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`SELECT * FROM loyalty_programs WHERE partner_id = ${link.partnerId}`);
      const rs = _rows(r);
      if (!rs.length) {
        const ins = await db.execute(sql`
          INSERT INTO loyalty_programs (partner_id) VALUES (${link.partnerId}) RETURNING *
        `);
        return { success: true, program: _rows(ins)[0] };
      }
      return { success: true, program: rs[0] };
    })
    .put('/loyalty/program', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE loyalty_programs SET
          name = COALESCE(${body.name ?? null}, name),
          earn_rate = COALESCE(${body.earnRate ?? null}, earn_rate),
          redeem_value = COALESCE(${body.redeemValue ?? null}, redeem_value),
          min_redeem = COALESCE(${body.minRedeem ?? null}, min_redeem),
          status = COALESCE(${body.status ?? null}, status),
          updated_at = NOW()
        WHERE partner_id = ${link.partnerId}
      `);
      return { success: true };
    }, {
      body: t.Object({
        name: t.Optional(t.String()),
        earnRate: t.Optional(t.Number()),
        redeemValue: t.Optional(t.Number()),
        minRedeem: t.Optional(t.Number()),
        status: t.Optional(t.String()),
      }),
    })
    .get('/loyalty/members', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT m.*, u.first_name, u.last_name, u.email, u.phone
        FROM loyalty_members m JOIN users u ON u.id = m.user_id
        WHERE m.partner_id = ${link.partnerId}
        ORDER BY m.points DESC LIMIT 500
      `);
      return { success: true, members: _rows(r) };
    })

    // ─── CONCIERGE ──────────────────────────────────────────
    .get('/concierge/requests', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT c.*, u.first_name, u.last_name, u.phone, b.booking_number
        FROM concierge_requests c
        LEFT JOIN users u ON u.id = c.guest_user_id
        LEFT JOIN bookings b ON b.id = c.booking_id
        WHERE c.partner_id = ${link.partnerId}
        ORDER BY c.scheduled_at ASC NULLS LAST, c.created_at DESC LIMIT 500
      `);
      return { success: true, requests: _rows(r) };
    })
    .post('/concierge/requests', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO concierge_requests (partner_id, booking_id, guest_user_id, kind, title, details, scheduled_at, price)
        VALUES (${link.partnerId}, ${body.bookingId ?? null}, ${body.guestUserId ?? null},
                ${body.kind}, ${body.title}, ${body.details ?? null},
                ${body.scheduledAt ?? null}, ${body.price ?? 0})
        RETURNING *
      `);
      return { success: true, request: _rows(r)[0] };
    }, {
      body: t.Object({
        kind: t.String(), title: t.String(),
        details: t.Optional(t.String()),
        scheduledAt: t.Optional(t.String()),
        price: t.Optional(t.Number()),
        bookingId: t.Optional(t.String()),
        guestUserId: t.Optional(t.String()),
      }),
    })
    .put('/concierge/requests/:id', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE concierge_requests SET
          status = COALESCE(${body.status ?? null}, status),
          assigned_to = COALESCE(${body.assignedTo ?? null}, assigned_to),
          updated_at = NOW()
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      return { success: true };
    }, {
      body: t.Object({ status: t.Optional(t.String()), assignedTo: t.Optional(t.String()) }),
    })

    // ─── SPA ──────────────────────────────────────────────
    .get('/spa/services', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`SELECT * FROM spa_services WHERE partner_id = ${link.partnerId} ORDER BY name`);
      return { success: true, services: _rows(r) };
    })
    .post('/spa/services', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO spa_services (partner_id, name, description, duration_mins, price, category)
        VALUES (${link.partnerId}, ${body.name}, ${body.description ?? null},
                ${body.durationMins ?? 60}, ${body.price ?? 0}, ${body.category ?? 'massage'})
        RETURNING *
      `);
      return { success: true, service: _rows(r)[0] };
    }, {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        durationMins: t.Optional(t.Number()),
        price: t.Optional(t.Number()),
        category: t.Optional(t.String()),
      }),
    })
    .delete('/spa/services/:id', async ({ headers, params }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) return { success: false };
      await db.execute(sql`DELETE FROM spa_services WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    })
    .get('/spa/appointments', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT a.*, s.name AS service_name
        FROM spa_appointments a LEFT JOIN spa_services s ON s.id = a.service_id
        WHERE a.partner_id = ${link.partnerId}
        ORDER BY a.scheduled_at DESC LIMIT 200
      `);
      return { success: true, appointments: _rows(r) };
    })
    .post('/spa/appointments', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO spa_appointments (partner_id, service_id, booking_id, guest_name, guest_phone, scheduled_at, duration_mins, price, notes)
        VALUES (${link.partnerId}, ${body.serviceId ?? null}, ${body.bookingId ?? null},
                ${body.guestName ?? null}, ${body.guestPhone ?? null}, ${body.scheduledAt},
                ${body.durationMins ?? null}, ${body.price ?? null}, ${body.notes ?? null})
        RETURNING *
      `);
      return { success: true, appointment: _rows(r)[0] };
    }, {
      body: t.Object({
        serviceId: t.Optional(t.String()),
        bookingId: t.Optional(t.String()),
        guestName: t.Optional(t.String()),
        guestPhone: t.Optional(t.String()),
        scheduledAt: t.String(),
        durationMins: t.Optional(t.Number()),
        price: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    });
}
