// QloApps-parity admin endpoints: coupons, refunds, reviews moderation, tickets, cms, notifications log.
// Mounted via registerAdminQlo(app) in admin-service/src/index.ts.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
function _rows(r: any): any[] {
  return Array.isArray(r) ? r : (r?.rows ?? []);
}
import { sql } from 'drizzle-orm';

export function registerAdminQlo(app: any) {
  return app
    // ── COUPONS ─────────────────────────────────────────────────
    .get('/coupons', async () => {
      const r = await db.execute(sql`SELECT * FROM coupons ORDER BY created_at DESC`);
      return { success: true, count: _rows(r).length, coupons: _rows(r) };
    })
    .post('/coupons', async ({ body, set }: any) => {
      try {
        const r = await db.execute(sql`
          INSERT INTO coupons (code, name, kind, value, min_amount, max_discount, scope, starts_at, ends_at, max_uses, status)
          VALUES (${body.code}, ${body.name}, ${body.kind ?? 'percent'}, ${body.value},
                  ${body.minAmount ?? null}, ${body.maxDiscount ?? null}, ${body.scope ?? 'global'},
                  ${body.startsAt ?? null}, ${body.endsAt ?? null}, ${body.maxUses ?? null}, ${body.status ?? 'active'})
          RETURNING *
        `);
        return { success: true, coupon: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        code: t.String(), name: t.String(),
        kind: t.Optional(t.String()), value: t.Number(),
        minAmount: t.Optional(t.Number()), maxDiscount: t.Optional(t.Number()),
        scope: t.Optional(t.String()),
        startsAt: t.Optional(t.String()), endsAt: t.Optional(t.String()),
        maxUses: t.Optional(t.Number()), status: t.Optional(t.String()),
      }),
    })
    .put('/coupons/:id', async ({ params, body }: any) => {
      await db.execute(sql`
        UPDATE coupons SET
          status = COALESCE(${body.status ?? null}, status),
          value = COALESCE(${body.value ?? null}, value),
          name = COALESCE(${body.name ?? null}, name)
        WHERE id = ${params.id}
      `);
      return { success: true };
    })
    .delete('/coupons/:id', async ({ params }: any) => {
      await db.execute(sql`DELETE FROM coupons WHERE id = ${params.id}`);
      return { success: true };
    })

    // ── REFUNDS ─────────────────────────────────────────────────
    .get('/refunds', async () => {
      const r = await db.execute(sql`
        SELECT r.*, b.booking_number, u.first_name AS guest_first, u.last_name AS guest_last, u.email AS guest_email, u.phone AS guest_phone
        FROM refunds r LEFT JOIN bookings b ON b.id = r.booking_id LEFT JOIN users u ON u.id = b.user_id
        ORDER BY r.created_at DESC LIMIT 200
      `);
      return { success: true, count: _rows(r).length, refunds: _rows(r) };
    })
    .post('/refunds', async ({ body, headers, set }: any) => {
      const userId = headers['x-user-id'];
      try {
        const r = await db.execute(sql`
          INSERT INTO refunds (booking_id, amount, reason, status, requested_by, notes)
          VALUES (${body.bookingId}, ${body.amount}, ${body.reason ?? null},
                  ${body.status ?? 'requested'}, ${userId}, ${body.notes ?? null})
          RETURNING *
        `);
        return { success: true, refund: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        bookingId: t.String(), amount: t.Number(),
        reason: t.Optional(t.String()),
        status: t.Optional(t.String()), notes: t.Optional(t.String()),
      }),
    })
    .put('/refunds/:id', async ({ params, body, headers }: any) => {
      const userId = headers['x-user-id'];
      await db.execute(sql`
        UPDATE refunds SET status = ${body.status}, notes = ${body.notes ?? null},
          processed_by = ${userId}, updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    }, { body: t.Object({ status: t.String(), notes: t.Optional(t.String()) }) })

    // ── REVIEWS moderation ──────────────────────────────────────
    .get('/reviews', async () => {
      const r = await db.execute(sql`
        SELECT r.*, p.business_name AS partner_name, u.first_name, u.last_name
        FROM reviews r
        LEFT JOIN partners p ON p.id = r.partner_id
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC LIMIT 200
      `);
      return { success: true, count: _rows(r).length, reviews: _rows(r) };
    })
    .put('/reviews/:id', async ({ params, body }: any) => {
      await db.execute(sql`UPDATE reviews SET status = ${body.status} WHERE id = ${params.id}`);
      return { success: true };
    }, { body: t.Object({ status: t.String() }) })

    // ── TICKETS ─────────────────────────────────────────────────
    .get('/tickets', async () => {
      const r = await db.execute(sql`
        SELECT t.*, u.first_name, u.last_name, u.email, u.phone, p.business_name AS partner_name
        FROM support_tickets t
        LEFT JOIN users u ON u.id = t.user_id
        LEFT JOIN partners p ON p.id = t.partner_id
        ORDER BY t.created_at DESC LIMIT 200
      `);
      return { success: true, count: _rows(r).length, tickets: _rows(r) };
    })
    .post('/tickets', async ({ body, headers }: any) => {
      const userId = headers['x-user-id'];
      const r = await db.execute(sql`
        INSERT INTO support_tickets (user_id, partner_id, booking_id, subject, body, priority)
        VALUES (${userId}, ${body.partnerId ?? null}, ${body.bookingId ?? null},
                ${body.subject}, ${body.body ?? null}, ${body.priority ?? 'normal'})
        RETURNING *
      `);
      return { success: true, ticket: _rows(r)[0] };
    }, {
      body: t.Object({
        subject: t.String(),
        body: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        partnerId: t.Optional(t.String()),
        bookingId: t.Optional(t.String()),
      }),
    })
    .put('/tickets/:id', async ({ params, body }: any) => {
      await db.execute(sql`
        UPDATE support_tickets SET
          status = COALESCE(${body.status ?? null}, status),
          priority = COALESCE(${body.priority ?? null}, priority),
          assigned_to = COALESCE(${body.assignedTo ?? null}, assigned_to),
          updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    }, {
      body: t.Object({
        status: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        assignedTo: t.Optional(t.String()),
      }),
    })

    // ── CMS pages ───────────────────────────────────────────────
    .get('/cms', async () => {
      const r = await db.execute(sql`SELECT * FROM cms_pages ORDER BY updated_at DESC`);
      return { success: true, count: _rows(r).length, pages: _rows(r) };
    })
    .post('/cms', async ({ body, set }: any) => {
      try {
        const r = await db.execute(sql`
          INSERT INTO cms_pages (slug, title, body_md, meta_title, meta_desc, published)
          VALUES (${body.slug}, ${body.title}, ${body.bodyMd ?? ''}, ${body.metaTitle ?? null},
                  ${body.metaDesc ?? null}, ${body.published ?? true})
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title, body_md = EXCLUDED.body_md,
            meta_title = EXCLUDED.meta_title, meta_desc = EXCLUDED.meta_desc,
            published = EXCLUDED.published, updated_at = NOW()
          RETURNING *
        `);
        return { success: true, page: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        slug: t.String(), title: t.String(),
        bodyMd: t.Optional(t.String()),
        metaTitle: t.Optional(t.String()), metaDesc: t.Optional(t.String()),
        published: t.Optional(t.Boolean()),
      }),
    })
    .delete('/cms/:id', async ({ params }: any) => {
      await db.execute(sql`DELETE FROM cms_pages WHERE id = ${params.id}`);
      return { success: true };
    })

    // ── NOTIFICATIONS log ───────────────────────────────────────
    .get('/notifications-log', async ({ query }: any) => {
      const limit = Math.min(500, Number(query?.limit ?? 100));
      const r = await db.execute(sql`
        SELECT * FROM notifications_log ORDER BY created_at DESC LIMIT ${limit}
      `);
      return { success: true, count: _rows(r).length, log: _rows(r) };
    });
}
