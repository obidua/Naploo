// Tier gating + amenities catalog endpoints.
// Mounted via registerQlo3(app) after registerQlo2 in pms-service/src/index.ts.
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

export function registerQlo3(app: any) {
  return app
    // ── TIER DEFINITIONS ─────────────────────────────────────
    .get('/tiers', async () => {
      const r = await db.execute(sql`SELECT * FROM tier_definitions ORDER BY rank`);
      return { success: true, tiers: _rows(r) };
    })

    // ── AMENITIES CATALOG (master list) ──────────────────────
    .get('/amenities-catalog', async () => {
      const r = await db.execute(sql`SELECT * FROM amenities_catalog ORDER BY category, sort_order, name`);
      return { success: true, amenities: _rows(r) };
    })

    // ── PROPERTY AMENITIES ────────────────────────────────────
    .get('/property-amenities', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT a.* FROM amenities_catalog a
        JOIN property_amenities pa ON pa.amenity_id = a.id
        WHERE pa.partner_id = ${link.partnerId}
        ORDER BY a.category, a.sort_order
      `);
      return { success: true, amenities: _rows(r) };
    })
    .put('/property-amenities', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      // Replace whole set: delete existing, insert new
      await db.execute(sql`DELETE FROM property_amenities WHERE partner_id = ${link.partnerId}`);
      const slugs = (body.slugs ?? []) as string[];
      if (slugs.length) {
        await db.execute(sql`
          INSERT INTO property_amenities (partner_id, amenity_id)
          SELECT ${link.partnerId}, id FROM amenities_catalog
          WHERE slug = ANY(${sql.raw("ARRAY[" + slugs.map(s => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})
        `);
      }
      return { success: true, count: slugs.length };
    }, { body: t.Object({ slugs: t.Array(t.String()) }) })

    // ── ROOM AMENITIES ────────────────────────────────────────
    .get('/rooms/:id/amenities', async ({ headers, params, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT a.* FROM amenities_catalog a
        JOIN room_amenities ra ON ra.amenity_id = a.id
        WHERE ra.room_id = ${params.id}
        ORDER BY a.category, a.sort_order
      `);
      return { success: true, amenities: _rows(r) };
    })
    .put('/rooms/:id/amenities', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`DELETE FROM room_amenities WHERE room_id = ${params.id}`);
      const slugs = (body.slugs ?? []) as string[];
      if (slugs.length) {
        await db.execute(sql`
          INSERT INTO room_amenities (room_id, amenity_id)
          SELECT ${params.id}, id FROM amenities_catalog
          WHERE slug = ANY(${sql.raw("ARRAY[" + slugs.map(s => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})
        `);
      }
      return { success: true, count: slugs.length };
    }, { body: t.Object({ slugs: t.Array(t.String()) }) })

    // ── PARTNER CONFIG: enforce tier gating on PUT /config ──────
    // Override or sibling — partners call existing /config endpoint to update modules.
    // We expose a validate helper here so the UI can pre-check.
    .post('/validate-modules', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const p = await db.execute(sql`SELECT tier FROM partners WHERE id = ${link.partnerId}`);
      const tier = _rows(p)[0]?.tier;
      if (!tier) return { success: true, allowed: body.modules ?? {}, blocked: [] };
      const td = await db.execute(sql`SELECT allowed_modules FROM tier_definitions WHERE slug = ${tier}`);
      const allowedList: string[] = (_rows(td)[0]?.allowed_modules ?? []) as any;
      const requested: Record<string, boolean> = body.modules ?? {};
      const allowed: Record<string, boolean> = {};
      const blocked: string[] = [];
      for (const k of Object.keys(requested)) {
        if (!requested[k]) { allowed[k] = false; continue; }
        if (allowedList.includes(k)) allowed[k] = true;
        else { allowed[k] = false; blocked.push(k); }
      }
      return { success: true, tier, allowedModules: allowedList, requestedAllowed: allowed, blocked };
    }, { body: t.Object({ modules: t.Record(t.String(), t.Boolean()) }) });
}
