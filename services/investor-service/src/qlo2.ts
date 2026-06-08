// Investor side of offer workflow: list visible offers, respond, view my responses.
// Mounted via registerInvestorOffers(app) before .listen in investor-service/src/index.ts.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import { sql } from 'drizzle-orm';

function _rows(r: any): any[] { return Array.isArray(r) ? r : (r?.rows ?? []); }

async function resolveInvestor(headers: Record<string, any>): Promise<{ investorId: string; status: string } | null> {
  const userId = headers['x-user-id'] as string | undefined;
  if (!userId) return null;
  const r = await db.execute(sql`SELECT id, status FROM investors WHERE user_id = ${userId} LIMIT 1`);
  const rs = _rows(r);
  if (!rs.length) return null;
  return { investorId: rs[0].id, status: rs[0].status };
}

export function registerInvestorOffers(app: any) {
  return app
    // List open offers visible to this investor
    .get('/offers', async ({ headers, set }: any) => {
      const inv = await resolveInvestor(headers);
      const visibility = !inv ? 'all' : (['approved', 'active'].includes(inv.status) ? 'approved_only' : 'all');
      const r = await db.execute(sql`
        SELECT o.*, p.business_name AS partner_business,
               (o.total_sets_available - COALESCE(o.sets_reserved, 0)) AS sets_remaining,
               (SELECT status FROM investor_offer_responses
                WHERE offer_id = o.id AND investor_id = ${inv?.investorId ?? null} LIMIT 1) AS my_response_status
        FROM investor_offers o
        LEFT JOIN partners p ON p.id = o.partner_id
        WHERE o.status = 'open'
          AND (o.expires_at IS NULL OR o.expires_at > NOW())
          AND (o.visible_to = 'all' OR ${visibility} = 'approved_only')
        ORDER BY o.created_at DESC
      `);
      return { success: true, offers: _rows(r) };
    })

    // Get single offer detail
    .get('/offers/:id', async ({ headers, params, set }: any) => {
      const inv = await resolveInvestor(headers);
      const r = await db.execute(sql`
        SELECT o.*, p.business_name AS partner_business,
               (o.total_sets_available - COALESCE(o.sets_reserved, 0)) AS sets_remaining
        FROM investor_offers o
        LEFT JOIN partners p ON p.id = o.partner_id
        WHERE o.id = ${params.id}
        LIMIT 1
      `);
      const rs = _rows(r);
      if (!rs.length) { set.status = 404; return { success: false, message: 'Offer not found' }; }
      let myResponse = null;
      if (inv) {
        const mr = await db.execute(sql`
          SELECT * FROM investor_offer_responses WHERE offer_id = ${params.id} AND investor_id = ${inv.investorId} LIMIT 1
        `);
        myResponse = _rows(mr)[0] || null;
      }
      return { success: true, offer: rs[0], myResponse };
    })

    // Investor responds (request a set count + delivery)
    .post('/offers/:id/respond', async ({ headers, params, body, set }: any) => {
      const inv = await resolveInvestor(headers);
      if (!inv) { set.status = 401; return { success: false, message: 'Enroll as investor first' }; }
      if (!['approved', 'active'].includes(inv.status)) {
        set.status = 403; return { success: false, message: 'KYC pending — admin approval required' };
      }
      // Fetch the offer to compute total
      const orq = await db.execute(sql`SELECT * FROM investor_offers WHERE id = ${params.id} AND status = 'open' LIMIT 1`);
      const offers = _rows(orq);
      if (!offers.length) { set.status = 404; return { success: false, message: 'Offer not available' }; }
      const offer = offers[0] as any;
      const remaining = Number(offer.total_sets_available) - Number(offer.sets_reserved ?? 0);
      if (body.podSetsRequested > remaining) {
        set.status = 400; return { success: false, message: `Only ${remaining} sets remaining` };
      }
      const total = Math.round(Number(offer.price_per_set) * body.podSetsRequested * 1.18);
      try {
        const r = await db.execute(sql`
          INSERT INTO investor_offer_responses (
            offer_id, investor_id, pod_sets_requested, total_amount, delivery_option, status, notes
          ) VALUES (
            ${params.id}, ${inv.investorId}, ${body.podSetsRequested}, ${total},
            ${body.deliveryOption ?? offer.delivery_default}, 'pending', ${body.notes ?? null}
          ) RETURNING *
        `);
        return { success: true, response: _rows(r)[0], totalAmount: total };
      } catch (e: any) {
        // Likely duplicate — already responded
        set.status = 409;
        return { success: false, message: 'You have already responded to this offer' };
      }
    }, {
      body: t.Object({
        podSetsRequested: t.Number(),
        deliveryOption: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    })

    // List my responses
    .get('/my-offers', async ({ headers, set }: any) => {
      const inv = await resolveInvestor(headers);
      if (!inv) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT r.*, o.property_name, o.location, o.price_per_set, o.delivery_default,
               p.business_name AS partner_business
        FROM investor_offer_responses r
        JOIN investor_offers o ON o.id = r.offer_id
        LEFT JOIN partners p ON p.id = o.partner_id
        WHERE r.investor_id = ${inv.investorId}
        ORDER BY r.created_at DESC
      `);
      return { success: true, responses: _rows(r) };
    });
}
