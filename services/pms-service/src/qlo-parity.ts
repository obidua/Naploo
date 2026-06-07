// QloApps-parity endpoints — partner (promotions, reviews, gallery, customers)
// + admin (coupons, refunds, tickets, reviews moderation, cms, notifications log).
// Appended via registerQloParity(app) in src/index.ts after registerExtensions.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
function _rows(r: any): any[] {
  return Array.isArray(r) ? r : (r?.rows ?? []);
}
import { sql } from 'drizzle-orm';

async function resolvePartnerId(headers: Record<string, any>): Promise<{ partnerId: string; userId: string; role: string } | null> {
  const userId = headers['x-user-id'] as string | undefined;
  if (!userId) return null;
  const r = await db.execute(sql`
    SELECT partner_id, role FROM staff WHERE user_id = ${userId} AND status = 'active' LIMIT 1
  `);
  if (_rows(r).length) return { partnerId: (_rows(r)[0] as any).partner_id, role: (_rows(r)[0] as any).role, userId };
  const r2 = await db.execute(sql`SELECT id FROM partners WHERE user_id = ${userId} LIMIT 1`);
  if (r2.rows.length) return { partnerId: (r2.rows[0] as any).id, role: 'owner', userId };
  return null;
}

function isAdmin(headers: Record<string, any>): boolean {
  const role = headers['x-user-role'] as string | undefined;
  return role === 'admin' || role === 'super_admin';
}

export function registerQloParity(app: any) {
  return app
    // ── PARTNER: PROMOTIONS ─────────────────────────────────────────
    .get('/promotions', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false, message: 'Unauthorized' }; }
      const r = await db.execute(sql`
        SELECT * FROM promotions WHERE partner_id = ${link.partnerId} ORDER BY created_at DESC
      `);
      return { success: true, promotions: _rows(r) };
    })
    .post('/promotions', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      try {
        const r = await db.execute(sql`
          INSERT INTO promotions (partner_id, code, name, description, kind, value, min_amount, max_discount, starts_at, ends_at, max_uses, status)
          VALUES (${link.partnerId}, ${body.code}, ${body.name}, ${body.description ?? null},
                  ${body.kind ?? 'percent'}, ${body.value}, ${body.minAmount ?? 0},
                  ${body.maxDiscount ?? null}, ${body.startsAt ?? null}, ${body.endsAt ?? null},
                  ${body.maxUses ?? null}, ${body.status ?? 'active'})
          RETURNING *
        `);
        return { success: true, promotion: _rows(r)[0] };
      } catch (e: any) {
        set.status = 400;
        return { success: false, message: e.message };
      }
    }, {
      body: t.Object({
        code: t.String(),
        name: t.String(),
        description: t.Optional(t.String()),
        kind: t.Optional(t.String()),
        value: t.Number(),
        minAmount: t.Optional(t.Number()),
        maxDiscount: t.Optional(t.Number()),
        startsAt: t.Optional(t.String()),
        endsAt: t.Optional(t.String()),
        maxUses: t.Optional(t.Number()),
        status: t.Optional(t.String()),
      }),
    })
    .put('/promotions/:id', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE promotions
        SET status = COALESCE(${body.status ?? null}, status),
            value = COALESCE(${body.value ?? null}, value),
            name = COALESCE(${body.name ?? null}, name),
            updated_at = NOW()
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      return { success: true };
    })
    .delete('/promotions/:id', async ({ headers, params, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`DELETE FROM promotions WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    })

    // ── PARTNER: REVIEWS (read-only + reply) ───────────────────────
    .get('/reviews', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT r.*, u.first_name, u.last_name, u.email
        FROM reviews r LEFT JOIN users u ON u.id = r.user_id
        WHERE r.partner_id = ${link.partnerId}
        ORDER BY r.created_at DESC
      `);
      const summary = await db.execute(sql`
        SELECT COUNT(*) AS total, COALESCE(AVG(rating),0) AS avg_rating
        FROM reviews WHERE partner_id = ${link.partnerId} AND status = 'published'
      `);
      return { success: true, reviews: _rows(r), summary: _rows(summary)[0] };
    })
    .post('/reviews/:id/reply', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE reviews SET partner_reply = ${body.reply}, replied_at = NOW()
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      return { success: true };
    }, { body: t.Object({ reply: t.String() }) })

    // ── PARTNER: GALLERY (hotel_images) ────────────────────────────
    .get('/gallery', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT * FROM hotel_images WHERE partner_id = ${link.partnerId}
        ORDER BY is_cover DESC, sort_order ASC, created_at DESC
      `);
      return { success: true, images: _rows(r) };
    })
    .post('/gallery', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO hotel_images (partner_id, url, caption, alt_text, category, sort_order, is_cover)
        VALUES (${link.partnerId}, ${body.url}, ${body.caption ?? null}, ${body.altText ?? null},
                ${body.category ?? 'other'}, ${body.sortOrder ?? 0}, ${body.isCover ?? false})
        RETURNING *
      `);
      return { success: true, image: _rows(r)[0] };
    }, {
      body: t.Object({
        url: t.String(),
        caption: t.Optional(t.String()),
        altText: t.Optional(t.String()),
        category: t.Optional(t.String()),
        sortOrder: t.Optional(t.Number()),
        isCover: t.Optional(t.Boolean()),
      }),
    })
    .delete('/gallery/:id', async ({ headers, params }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) return { success: false };
      await db.execute(sql`DELETE FROM hotel_images WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    })
    .post('/gallery/:id/cover', async ({ headers, params }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) return { success: false };
      await db.execute(sql`UPDATE hotel_images SET is_cover = FALSE WHERE partner_id = ${link.partnerId}`);
      await db.execute(sql`UPDATE hotel_images SET is_cover = TRUE WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    })

    // ── PARTNER: CUSTOMERS (bookings + users + pods → pod_sets → partner)
    .get('/customers', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT u.id AS user_id, u.email, u.phone,
               TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')) AS name,
               COUNT(b.id) AS booking_count,
               COALESCE(SUM(b.total),0)::numeric AS lifetime_spend,
               MAX(b.created_at) AS last_visit,
               MIN(b.created_at) AS first_visit
        FROM bookings b
        JOIN users u ON u.id = b.user_id
        JOIN pods p ON p.id = b.pod_id
        JOIN pod_sets ps ON ps.id = p.pod_set_id
        WHERE ps.partner_id = ${link.partnerId}
        GROUP BY u.id, u.email, u.phone, u.first_name, u.last_name
        ORDER BY booking_count DESC
        LIMIT 500
      `);
      const customers = _rows(r);
      return { success: true, count: customers.length, customers };
    });
}

// ── ADMIN: registerQloAdminParity ───────────────────────────────────
export function registerQloAdminParity(app: any) {
  return app
    // Coupons
    .get('/coupons', async ({ headers, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const r = await db.execute(sql`SELECT * FROM coupons ORDER BY created_at DESC`);
      return { success: true, coupons: _rows(r) };
    })
    .post('/coupons', async ({ headers, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      try {
        const r = await db.execute(sql`
          INSERT INTO coupons (code, name, kind, value, min_amount, max_discount, scope, starts_at, ends_at, max_uses, status)
          VALUES (${body.code}, ${body.name}, ${body.kind ?? 'percent'}, ${body.value},
                  ${body.minAmount ?? null}, ${body.maxDiscount ?? null}, ${body.scope ?? 'global'},
                  ${body.startsAt ?? null}, ${body.endsAt ?? null}, ${body.maxUses ?? null}, ${body.status ?? 'active'})
          RETURNING *
        `);
        return { success: true, coupon: _rows(r)[0] };
      } catch (e: any) {
        set.status = 400; return { success: false, message: e.message };
      }
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
    .put('/coupons/:id', async ({ headers, params, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      await db.execute(sql`
        UPDATE coupons SET status = COALESCE(${body.status ?? null}, status),
                           value = COALESCE(${body.value ?? null}, value)
        WHERE id = ${params.id}
      `);
      return { success: true };
    })

    // Refunds
    .get('/refunds', async ({ headers, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const r = await db.execute(sql`
        SELECT r.*, b.code AS booking_code, b.guest_name, b.guest_email
        FROM refunds r LEFT JOIN bookings b ON b.id = r.booking_id
        ORDER BY r.created_at DESC LIMIT 200
      `);
      return { success: true, refunds: _rows(r) };
    })
    .put('/refunds/:id', async ({ headers, params, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const userId = headers['x-user-id'];
      await db.execute(sql`
        UPDATE refunds SET status = ${body.status}, notes = ${body.notes ?? null},
          processed_by = ${userId}, updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    }, { body: t.Object({ status: t.String(), notes: t.Optional(t.String()) }) })

    // Reviews moderation
    .get('/reviews', async ({ headers, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const r = await db.execute(sql`
        SELECT r.*, p.business_name AS partner_name, u.first_name, u.last_name
        FROM reviews r LEFT JOIN partners p ON p.id = r.partner_id
                       LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC LIMIT 200
      `);
      return { success: true, reviews: _rows(r) };
    })
    .put('/reviews/:id', async ({ headers, params, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      await db.execute(sql`UPDATE reviews SET status = ${body.status} WHERE id = ${params.id}`);
      return { success: true };
    }, { body: t.Object({ status: t.String() }) })

    // Tickets
    .get('/tickets', async ({ headers, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const r = await db.execute(sql`
        SELECT t.*, u.first_name, u.last_name, u.email, u.phone
        FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id
        ORDER BY t.created_at DESC LIMIT 200
      `);
      return { success: true, tickets: _rows(r) };
    })
    .put('/tickets/:id', async ({ headers, params, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      await db.execute(sql`
        UPDATE support_tickets SET status = COALESCE(${body.status ?? null}, status),
                                   priority = COALESCE(${body.priority ?? null}, priority),
                                   updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    }, { body: t.Object({ status: t.Optional(t.String()), priority: t.Optional(t.String()) }) })

    // CMS pages
    .get('/cms', async ({ headers, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const r = await db.execute(sql`SELECT * FROM cms_pages ORDER BY updated_at DESC`);
      return { success: true, pages: _rows(r) };
    })
    .post('/cms', async ({ headers, body, set }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
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
    }, {
      body: t.Object({
        slug: t.String(), title: t.String(),
        bodyMd: t.Optional(t.String()),
        metaTitle: t.Optional(t.String()), metaDesc: t.Optional(t.String()),
        published: t.Optional(t.Boolean()),
      }),
    })

    // Notifications log
    .get('/notifications-log', async ({ headers, set, query }: any) => {
      if (!isAdmin(headers)) { set.status = 403; return { success: false }; }
      const limit = Math.min(500, Number(query?.limit ?? 100));
      const r = await db.execute(sql`
        SELECT * FROM notifications_log ORDER BY created_at DESC LIMIT ${limit}
      `);
      return { success: true, count: _rows(r).length, log: _rows(r) };
    });
}
