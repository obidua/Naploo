// Admin extensions: investor offers + departments/employees hierarchy
// Mounted in admin-service/src/index.ts after registerAdminQlo.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import { sql } from 'drizzle-orm';

function _rows(r: any): any[] { return Array.isArray(r) ? r : (r?.rows ?? []); }

export function registerAdminQlo2(app: any) {
  return app
    // ─── INVESTOR OFFERS (admin creates) ───────────────────────
    .get('/investor-offers', async () => {
      const r = await db.execute(sql`
        SELECT o.*,
               p.business_name AS partner_business,
               (SELECT COUNT(*) FROM investor_offer_responses WHERE offer_id = o.id) AS response_count
        FROM investor_offers o
        LEFT JOIN partners p ON p.id = o.partner_id
        ORDER BY o.created_at DESC LIMIT 200
      `);
      return { success: true, count: _rows(r).length, offers: _rows(r) };
    })
    .post('/investor-offers', async ({ headers, body, set }: any) => {
      const userId = headers['x-user-id'];
      try {
        const r = await db.execute(sql`
          INSERT INTO investor_offers (
            partner_id, property_name, location, total_sets_available, price_per_set,
            expected_monthly_yield, delivery_default, description, highlights, images,
            agreement_template, visible_to, expires_at, status, created_by
          ) VALUES (
            ${body.partnerId ?? null}, ${body.propertyName}, ${body.location ?? null},
            ${body.totalSetsAvailable}, ${body.pricePerSet},
            ${body.expectedMonthlyYield ?? null}, ${body.deliveryDefault ?? 'leaseback'},
            ${body.description ?? null}, ${JSON.stringify(body.highlights ?? [])}::jsonb,
            ${JSON.stringify(body.images ?? [])}::jsonb, ${body.agreementTemplate ?? null},
            ${body.visibleTo ?? 'all'}, ${body.expiresAt ?? null},
            ${body.status ?? 'open'}, ${userId}
          ) RETURNING *
        `);
        return { success: true, offer: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        propertyName: t.String(),
        location: t.Optional(t.String()),
        totalSetsAvailable: t.Number(),
        pricePerSet: t.Number(),
        expectedMonthlyYield: t.Optional(t.Number()),
        deliveryDefault: t.Optional(t.String()),
        description: t.Optional(t.String()),
        highlights: t.Optional(t.Array(t.String())),
        images: t.Optional(t.Array(t.String())),
        agreementTemplate: t.Optional(t.String()),
        partnerId: t.Optional(t.String()),
        visibleTo: t.Optional(t.String()),
        expiresAt: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    })
    .put('/investor-offers/:id', async ({ params, body }: any) => {
      await db.execute(sql`
        UPDATE investor_offers SET
          status = COALESCE(${body.status ?? null}, status),
          total_sets_available = COALESCE(${body.totalSetsAvailable ?? null}, total_sets_available),
          price_per_set = COALESCE(${body.pricePerSet ?? null}, price_per_set),
          updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    })
    .get('/investor-offers/:id/responses', async ({ params }: any) => {
      const r = await db.execute(sql`
        SELECT r.*, i.user_id,
               u.first_name, u.last_name, u.email, u.phone
        FROM investor_offer_responses r
        JOIN investors i ON i.id = r.investor_id
        JOIN users u ON u.id = i.user_id
        WHERE r.offer_id = ${params.id}
        ORDER BY r.created_at DESC
      `);
      return { success: true, responses: _rows(r) };
    })
    .post('/investor-offer-responses/:id/accept', async ({ params, body }: any) => {
      // Admin marks a response as accepted (after verifying payment / signing agreement)
      await db.execute(sql`
        UPDATE investor_offer_responses SET
          status = 'accepted',
          contract_start_date = ${body?.contractStartDate ?? null},
          contract_end_date = ${body?.contractEndDate ?? null},
          agreement_signed_at = NOW(),
          updated_at = NOW()
        WHERE id = ${params.id}
      `);
      // Increment reserved count on offer
      await db.execute(sql`
        UPDATE investor_offers SET
          sets_reserved = sets_reserved + (SELECT pod_sets_requested FROM investor_offer_responses WHERE id = ${params.id})
        WHERE id = (SELECT offer_id FROM investor_offer_responses WHERE id = ${params.id})
      `);
      return { success: true };
    })
    .post('/investor-offer-responses/:id/decline', async ({ params, body }: any) => {
      await db.execute(sql`
        UPDATE investor_offer_responses SET status = 'declined', notes = ${body?.notes ?? null}, updated_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    })

    // ─── DEPARTMENTS + ADMIN EMPLOYEES ─────────────────────────
    .get('/departments', async () => {
      const r = await db.execute(sql`
        SELECT d.*,
               u.first_name AS head_first, u.last_name AS head_last,
               (SELECT COUNT(*) FROM admin_employees WHERE department_id = d.id AND status = 'active') AS member_count
        FROM admin_departments d
        LEFT JOIN users u ON u.id = d.head_user_id
        ORDER BY d.name
      `);
      return { success: true, departments: _rows(r) };
    })
    .post('/departments', async ({ body, set }: any) => {
      try {
        const r = await db.execute(sql`
          INSERT INTO admin_departments (name, head_user_id, description)
          VALUES (${body.name}, ${body.headUserId ?? null}, ${body.description ?? null})
          RETURNING *
        `);
        return { success: true, department: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, { body: t.Object({ name: t.String(), headUserId: t.Optional(t.String()), description: t.Optional(t.String()) }) })

    .get('/employees', async () => {
      const r = await db.execute(sql`
        SELECT e.*, u.first_name, u.last_name, u.email, u.phone, u.role AS user_role,
               d.name AS department_name
        FROM admin_employees e
        JOIN users u ON u.id = e.user_id
        LEFT JOIN admin_departments d ON d.id = e.department_id
        ORDER BY e.created_at DESC
      `);
      return { success: true, employees: _rows(r) };
    })
    .post('/employees', async ({ body, set }: any) => {
      try {
        const r = await db.execute(sql`
          INSERT INTO admin_employees (user_id, department_id, job_title, role_in_dept, joined_at, permissions)
          VALUES (${body.userId}, ${body.departmentId ?? null}, ${body.jobTitle ?? null},
                  ${body.roleInDept ?? 'member'}, ${body.joinedAt ?? null},
                  ${JSON.stringify(body.permissions ?? [])}::jsonb)
          RETURNING *
        `);
        return { success: true, employee: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        userId: t.String(),
        departmentId: t.Optional(t.String()),
        jobTitle: t.Optional(t.String()),
        roleInDept: t.Optional(t.String()),
        joinedAt: t.Optional(t.String()),
        permissions: t.Optional(t.Array(t.String())),
      }),
    })
    .put('/employees/:id', async ({ params, body }: any) => {
      await db.execute(sql`
        UPDATE admin_employees SET
          department_id = COALESCE(${body.departmentId ?? null}, department_id),
          job_title = COALESCE(${body.jobTitle ?? null}, job_title),
          role_in_dept = COALESCE(${body.roleInDept ?? null}, role_in_dept),
          status = COALESCE(${body.status ?? null}, status)
        WHERE id = ${params.id}
      `);
      return { success: true };
    });
}
