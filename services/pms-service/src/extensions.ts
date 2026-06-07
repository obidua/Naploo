// Extension endpoints for pms-service: rate plans, F&B POS, outlets, menu, reports, invoice PDF.
// Appended to the main app chain in src/index.ts.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import {
  partners, rooms, podSets, bookings, folios, folioCharges, folioPayments,
  ratePlans, rateOverrides, services as servicesTable,
  outlets, menuCategories, menuItems, tableOrders, tableOrderItems,
  invoices, staff, taxesConfig, users,
} from '@naploo/db/schema';
import { eq, and, desc, sql, inArray, gte, lte } from 'drizzle-orm';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function resolvePartner(headers: Record<string, any>) {
  const userId = headers['x-user-id'] as string | undefined;
  if (!userId) return null;
  const [s] = await db.select({ partnerId: staff.partnerId, role: staff.role })
    .from(staff).where(and(eq(staff.userId, userId), eq(staff.status, 'active'))).limit(1);
  if (s) return { partnerId: s.partnerId, role: s.role, userId };
  const [p] = await db.select({ partnerId: partners.id })
    .from(partners).where(eq(partners.userId, userId)).limit(1);
  if (p) return { partnerId: p.partnerId, role: 'owner' as const, userId };
  return null;
}

export function registerExtensions(app: any) {
  return app
    // ═══ RATE PLANS ═══════════════════════════════════════════
    .get('/rates', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const plans = await db.select().from(ratePlans).where(eq(ratePlans.partnerId, link.partnerId)).orderBy(desc(ratePlans.createdAt));
      return { success: true, count: plans.length, plans };
    })

    .post('/rates', async ({ headers, body, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const [created] = await db.insert(ratePlans).values({
        partnerId: link.partnerId,
        name: body.name,
        kind: body.kind as any,
        baseMultiplier: String(body.baseMultiplier ?? 1.0),
        minNights: body.minNights ?? 1,
        maxNights: body.maxNights ?? null,
        validFrom: body.validFrom ?? null,
        validTo: body.validTo ?? null,
        appliesToRoomTypes: body.appliesToRoomTypes ?? null,
        blockCheckInDays: body.blockCheckInDays ?? null,
      } as any).returning();
      return { success: true, plan: created };
    }, {
      body: t.Object({
        name: t.String(),
        kind: t.Union([t.Literal('standard'), t.Literal('corporate'), t.Literal('weekend'), t.Literal('ota'), t.Literal('long_stay'), t.Literal('group')]),
        baseMultiplier: t.Optional(t.Number()),
        minNights: t.Optional(t.Number()),
        maxNights: t.Optional(t.Number()),
        validFrom: t.Optional(t.String()),
        validTo: t.Optional(t.String()),
        appliesToRoomTypes: t.Optional(t.Any()),
        blockCheckInDays: t.Optional(t.Any()),
      }),
    })

    .patch('/rates/:id', async ({ params, body, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const update: Record<string, unknown> = { updatedAt: new Date() };
      for (const k of ['name', 'kind', 'minNights', 'maxNights', 'validFrom', 'validTo', 'appliesToRoomTypes', 'blockCheckInDays', 'isActive'] as const) {
        if (body[k] !== undefined) update[k] = body[k];
      }
      if (body.baseMultiplier !== undefined) update.baseMultiplier = String(body.baseMultiplier);
      const [updated] = await db.update(ratePlans).set(update as any).where(eq(ratePlans.id, params.id)).returning();
      if (!updated) { set.status = 404; return { success: false, message: 'Not found' }; }
      return { success: true, plan: updated };
    }, {
      body: t.Object({
        name: t.Optional(t.String()),
        kind: t.Optional(t.String()),
        baseMultiplier: t.Optional(t.Number()),
        minNights: t.Optional(t.Number()),
        maxNights: t.Optional(t.Number()),
        validFrom: t.Optional(t.String()),
        validTo: t.Optional(t.String()),
        appliesToRoomTypes: t.Optional(t.Any()),
        blockCheckInDays: t.Optional(t.Any()),
        isActive: t.Optional(t.Boolean()),
      }),
    })

    // Rate overrides (per-day price)
    .get('/rates/:id/overrides', async ({ params }: any) => {
      const rows = await db.select().from(rateOverrides).where(eq(rateOverrides.ratePlanId, params.id)).orderBy(rateOverrides.day);
      return { success: true, count: rows.length, overrides: rows };
    })

    .post('/rates/:id/overrides', async ({ params, body, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const [created] = await db.insert(rateOverrides).values({
        ratePlanId: params.id,
        roomId: body.roomId || null,
        podSetId: body.podSetId || null,
        day: body.day,
        price: String(body.price),
      } as any).returning();
      return { success: true, override: created };
    }, {
      body: t.Object({
        roomId: t.Optional(t.String()),
        podSetId: t.Optional(t.String()),
        day: t.String(),
        price: t.Number(),
      }),
    })

    // ═══ F&B POS: outlets + menu + table orders ═══════════════
    .get('/outlets', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const rows = await db.select().from(outlets).where(eq(outlets.partnerId, link.partnerId));
      return { success: true, count: rows.length, outlets: rows };
    })

    .post('/outlets', async ({ headers, body, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const [created] = await db.insert(outlets).values({
        partnerId: link.partnerId,
        name: body.name,
        kind: body.kind as any,
      } as any).returning();
      return { success: true, outlet: created };
    }, {
      body: t.Object({
        name: t.String(),
        kind: t.Union([t.Literal('restaurant'), t.Literal('bar'), t.Literal('spa'), t.Literal('laundry'), t.Literal('other')]),
      }),
    })

    .get('/outlets/:id/menu', async ({ params }: any) => {
      const categories = await db.select().from(menuCategories).where(eq(menuCategories.outletId, params.id)).orderBy(menuCategories.sortOrder);
      const items = await db.select().from(menuItems).where(eq(menuItems.outletId, params.id));
      return { success: true, categories, items };
    })

    .post('/outlets/:id/categories', async ({ params, body }: any) => {
      const [created] = await db.insert(menuCategories).values({
        outletId: params.id,
        name: body.name,
        sortOrder: body.sortOrder ?? 0,
      } as any).returning();
      return { success: true, category: created };
    }, { body: t.Object({ name: t.String(), sortOrder: t.Optional(t.Number()) }) })

    .post('/outlets/:id/items', async ({ params, body }: any) => {
      const [created] = await db.insert(menuItems).values({
        outletId: params.id,
        categoryId: body.categoryId || null,
        name: body.name,
        description: body.description || null,
        price: String(body.price),
        taxable: body.taxable ?? true,
        isAvailable: body.isAvailable ?? true,
      } as any).returning();
      return { success: true, item: created };
    }, {
      body: t.Object({
        categoryId: t.Optional(t.String()),
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.Number(),
        taxable: t.Optional(t.Boolean()),
        isAvailable: t.Optional(t.Boolean()),
      }),
    })

    .patch('/menu-items/:id', async ({ params, body, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name !== undefined) update.name = body.name;
      if (body.description !== undefined) update.description = body.description;
      if (body.price !== undefined) update.price = String(body.price);
      if (body.taxable !== undefined) update.taxable = body.taxable;
      if (body.isAvailable !== undefined) update.isAvailable = body.isAvailable;
      const [updated] = await db.update(menuItems).set(update as any).where(eq(menuItems.id, params.id)).returning();
      return { success: true, item: updated };
    }, {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        price: t.Optional(t.Number()),
        taxable: t.Optional(t.Boolean()),
        isAvailable: t.Optional(t.Boolean()),
      }),
    })

    // Table orders
    .get('/outlets/:id/orders', async ({ params, query }: any) => {
      const conditions = [eq(tableOrders.outletId, params.id)];
      if (query.status) conditions.push(eq(tableOrders.status, query.status as any));
      const rows = await db.select().from(tableOrders).where(and(...conditions)).orderBy(desc(tableOrders.openedAt));
      return { success: true, count: rows.length, orders: rows };
    })

    .post('/outlets/:id/orders', async ({ params, body, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const [created] = await db.insert(tableOrders).values({
        outletId: params.id,
        partnerId: link.partnerId,
        tableNo: body.tableNo || null,
        folioId: body.folioId || null,
        openedBy: link.userId,
      } as any).returning();
      return { success: true, order: created };
    }, { body: t.Object({ tableNo: t.Optional(t.String()), folioId: t.Optional(t.String()) }) })

    .get('/orders/:id', async ({ params }: any) => {
      const [order] = await db.select().from(tableOrders).where(eq(tableOrders.id, params.id));
      if (!order) return { success: false, message: 'Not found' };
      const items = await db.select({
        id: tableOrderItems.id,
        qty: tableOrderItems.qty,
        unitPrice: tableOrderItems.unitPrice,
        amount: tableOrderItems.amount,
        note: tableOrderItems.note,
        status: tableOrderItems.status,
        menuItemId: tableOrderItems.menuItemId,
        menuName: menuItems.name,
      }).from(tableOrderItems)
        .innerJoin(menuItems, eq(menuItems.id, tableOrderItems.menuItemId))
        .where(eq(tableOrderItems.tableOrderId, params.id));
      return { success: true, order, items };
    })

    .post('/orders/:id/items', async ({ params, body }: any) => {
      const [item] = await db.select().from(menuItems).where(eq(menuItems.id, body.menuItemId));
      if (!item) return { success: false, message: 'Menu item not found' };
      const amount = round2(body.qty * Number(item.price));
      const [created] = await db.insert(tableOrderItems).values({
        tableOrderId: params.id,
        menuItemId: item.id,
        qty: body.qty,
        unitPrice: item.price,
        amount: String(amount),
        note: body.note || null,
      } as any).returning();
      // Recompute total
      const allItems = await db.select().from(tableOrderItems).where(eq(tableOrderItems.tableOrderId, params.id));
      const total = allItems.reduce((s, i) => s + Number(i.amount), 0);
      await db.update(tableOrders).set({ totalCharges: String(round2(total)) }).where(eq(tableOrders.id, params.id));
      return { success: true, item: created, orderTotal: round2(total) };
    }, { body: t.Object({ menuItemId: t.String(), qty: t.Number(), note: t.Optional(t.String()) }) })

    // Close order — optionally charge to a folio
    .post('/orders/:id/close', async ({ params, body, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const [order] = await db.select().from(tableOrders).where(eq(tableOrders.id, params.id));
      if (!order) { set.status = 404; return { success: false, message: 'Order not found' }; }
      if (order.status === 'closed') { set.status = 400; return { success: false, message: 'Already closed' }; }

      if (body.folioId) {
        // Add F&B charge to folio
        const items = await db.select({
          name: menuItems.name, qty: tableOrderItems.qty, amount: tableOrderItems.amount,
        }).from(tableOrderItems).innerJoin(menuItems, eq(menuItems.id, tableOrderItems.menuItemId))
          .where(eq(tableOrderItems.tableOrderId, params.id));
        const desc = items.map((i) => `${i.qty}× ${i.name}`).join(', ').slice(0, 200);
        await db.insert(folioCharges).values({
          folioId: body.folioId,
          kind: 'fnb',
          description: desc || 'Restaurant order',
          qty: 1,
          unitPrice: order.totalCharges,
          amount: order.totalCharges,
          taxable: true,
          sourceKind: 'table_order',
          sourceId: order.id,
          addedBy: link.userId,
        } as any);
        // Update folio totals
        const [folio] = await db.select().from(folios).where(eq(folios.id, body.folioId));
        if (folio) {
          const newCharges = round2(Number(folio.totalCharges) + Number(order.totalCharges));
          const newBalance = round2(newCharges - Number(folio.totalPayments));
          await db.update(folios).set({
            totalCharges: String(newCharges),
            balance: String(newBalance),
            updatedAt: new Date(),
          }).where(eq(folios.id, body.folioId));
        }
      }

      await db.update(tableOrders).set({
        status: 'closed',
        closedAt: new Date(),
        folioId: body.folioId || order.folioId,
      }).where(eq(tableOrders.id, params.id));

      return { success: true };
    }, { body: t.Object({ folioId: t.Optional(t.String()) }) })

    // ═══ REPORTS ═════════════════════════════════════════════
    .get('/reports/occupancy', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const partnerRooms = await db.select().from(rooms).where(eq(rooms.partnerId, link.partnerId));
      const partnerSets = await db.select().from(podSets).where(eq(podSets.partnerId, link.partnerId));
      const totalUnits = partnerRooms.length;
      const partnerBookings = totalUnits === 0 ? [] : await db.select().from(bookings)
        .where(and(
          inArray(bookings.roomId, partnerRooms.map((r) => r.id) as any),
          inArray(bookings.status, ['confirmed', 'checked_in', 'checked_out'])
        ));
      const today = new Date();
      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today); d.setDate(today.getDate() - (29 - i));
        return d.toISOString().slice(0, 10);
      });
      const occupancyByDay = last30.map((day) => {
        const dDate = new Date(day);
        const occupied = partnerBookings.filter((b) => {
          const inDate = new Date(b.checkIn);
          const outDate = new Date(b.checkOut);
          return inDate <= dDate && dDate < outDate;
        }).length;
        return {
          day,
          occupied,
          total: totalUnits,
          rate: totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0,
        };
      });
      const avgOccupancy = totalUnits > 0
        ? Math.round(occupancyByDay.reduce((s, d) => s + d.rate, 0) / occupancyByDay.length)
        : 0;
      return {
        success: true,
        totalRooms: partnerRooms.length,
        totalPodSets: partnerSets.length,
        avgOccupancy30d: avgOccupancy,
        series: occupancyByDay,
      };
    })

    .get('/reports/revenue', async ({ headers, set, query }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const days = Math.min(180, Math.max(7, Number(query?.days) || 30));
      const since = new Date(Date.now() - days * 86400000);
      const partnerRooms = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.partnerId, link.partnerId));
      const partnerSets = await db.select({ id: podSets.id }).from(podSets).where(eq(podSets.partnerId, link.partnerId));
      const setIds = partnerSets.map((s) => s.id);
      const partnerPods = setIds.length
        ? await db.select({ id: rooms.id }).from(rooms).limit(0).union(db.select({ id: sql<string>`pods.id`.as('id') }).from(sql`pods`).where(sql`pod_set_id IN ${setIds}`))
        : [];
      const roomIds = partnerRooms.map((r) => r.id);
      const allBookings = roomIds.length === 0 ? [] : await db.select().from(bookings)
        .where(and(
          inArray(bookings.roomId, roomIds),
          inArray(bookings.status, ['confirmed', 'checked_in', 'checked_out']),
          gte(bookings.createdAt, since)
        ));

      const series: Record<string, { revenue: number; bookings: number; share: number }> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        series[d] = { revenue: 0, bookings: 0, share: 0 };
      }
      for (const b of allBookings) {
        const key = new Date(b.createdAt).toISOString().slice(0, 10);
        if (!series[key]) continue;
        series[key].revenue += Number(b.total) || 0;
        series[key].share += Number(b.ownerShare) || 0;
        series[key].bookings += 1;
      }
      const arr = Object.entries(series).sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, ...v }));
      const totalRevenue = round2(arr.reduce((s, d) => s + d.revenue, 0));
      const totalShare = round2(arr.reduce((s, d) => s + d.share, 0));
      const totalBookings = arr.reduce((s, d) => s + d.bookings, 0);
      const avgBookingValue = totalBookings > 0 ? round2(totalRevenue / totalBookings) : 0;
      return {
        success: true,
        days,
        totalRevenue,
        totalShare,
        totalBookings,
        avgBookingValue,
        series: arr,
      };
    })

    .get('/reports/tax', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const allInvoices = await db.select().from(invoices).where(eq(invoices.partnerId, link.partnerId));
      const byMonth: Record<string, { gross: number; tax: number; count: number }> = {};
      for (const inv of allInvoices) {
        const month = new Date(inv.issuedAt).toISOString().slice(0, 7);
        if (!byMonth[month]) byMonth[month] = { gross: 0, tax: 0, count: 0 };
        byMonth[month].gross += Number(inv.grossAmount) || 0;
        byMonth[month].tax += Number(inv.taxAmount) || 0;
        byMonth[month].count += 1;
      }
      const months = Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, v]) => ({ month, ...v }));
      const totalGross = round2(months.reduce((s, m) => s + m.gross, 0));
      const totalTax = round2(months.reduce((s, m) => s + m.tax, 0));
      return { success: true, totalInvoices: allInvoices.length, totalGross, totalTax, months };
    })

    // ═══ INVOICE PDF (HTML — printable via browser save-as-PDF) ═══
    .get('/invoices/:id/pdf', async ({ params, set, headers }: any) => {
      const [inv] = await db.select().from(invoices).where(eq(invoices.id, params.id));
      if (!inv) { set.status = 404; return 'Invoice not found'; }
      const [folio] = await db.select().from(folios).where(eq(folios.id, inv.folioId));
      const [partner] = await db.select().from(partners).where(eq(partners.id, inv.partnerId));
      const charges = await db.select().from(folioCharges).where(eq(folioCharges.folioId, inv.folioId));
      const payments = await db.select().from(folioPayments).where(eq(folioPayments.folioId, inv.folioId));
      let customer: any = null;
      if (folio?.customerId) {
        [customer] = await db.select().from(users).where(eq(users.id, folio.customerId));
      }

      const rows = charges.map((c) => `
        <tr>
          <td>${c.description}</td>
          <td style="text-align:right">${c.qty}</td>
          <td style="text-align:right">₹${c.unitPrice}</td>
          <td style="text-align:right">₹${c.amount}</td>
        </tr>
      `).join('');

      const paymentRows = payments.map((p) => `
        <tr>
          <td>${p.method.toUpperCase()}</td>
          <td>${p.reference || '-'}</td>
          <td style="text-align:right">${new Date(p.createdAt).toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${p.amount}</td>
        </tr>
      `).join('');

      const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${inv.invoiceNumber}</title>
<style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:760px;margin:30px auto;color:#222;padding:0 20px}
.head{display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #7c3aed;padding-bottom:18px;margin-bottom:18px}
.head .name{font-size:24px;font-weight:700;color:#4c1d95}
.head .meta{text-align:right;font-size:13px;color:#555}
h2{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#666;margin:18px 0 8px}
table{width:100%;border-collapse:collapse;font-size:13px}
table th{text-align:left;background:#f5f3ff;padding:8px;font-weight:600}
table td{padding:8px;border-bottom:1px solid #eee}
.totals{margin-top:14px;width:280px;margin-left:auto}
.totals td{padding:4px 8px;font-size:13px}
.totals tr.total{font-weight:bold;font-size:15px;border-top:2px solid #333}
.foot{margin-top:30px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:12px}
.btn{background:#7c3aed;color:#fff;padding:8px 16px;border:0;border-radius:6px;cursor:pointer;font-size:13px}
@media print{.btn{display:none}}
</style>
</head><body>
<div style="text-align:right;margin-bottom:10px">
  <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>
<div class="head">
  <div>
    <div class="name">${partner?.businessName ?? 'Naploo Stay'}</div>
    <div style="font-size:13px;color:#555;margin-top:4px">${partner?.address ?? ''}</div>
    <div style="font-size:13px;color:#555">${partner?.city ?? ''}${partner?.state ? ', ' + partner.state : ''} ${partner?.pincode ?? ''}</div>
    ${partner?.gstNumber ? `<div style="font-size:12px;color:#666;margin-top:4px"><b>GSTIN:</b> ${partner.gstNumber}</div>` : ''}
  </div>
  <div class="meta">
    <div style="font-size:11px;text-transform:uppercase;color:#888">Tax Invoice</div>
    <div style="font-size:18px;font-weight:bold;color:#4c1d95">${inv.invoiceNumber}</div>
    <div>Issued: ${new Date(inv.issuedAt).toLocaleString('en-IN')}</div>
  </div>
</div>

<div style="display:flex;justify-content:space-between;gap:20px">
  <div>
    <h2>Bill to</h2>
    <div style="font-size:13px">
      ${customer ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || customer.phone : 'Walk-in guest'}<br>
      ${customer?.phone ?? ''}<br>
      ${customer?.email ?? ''}
      ${inv.customerGstNumber ? `<br><b>GSTIN:</b> ${inv.customerGstNumber}` : ''}
    </div>
  </div>
  <div>
    <h2>Folio</h2>
    <div style="font-size:13px">
      Opened: ${folio?.openedAt ? new Date(folio.openedAt).toLocaleString('en-IN') : '-'}<br>
      Closed: ${folio?.closedAt ? new Date(folio.closedAt).toLocaleString('en-IN') : '-'}
    </div>
  </div>
</div>

<h2>Charges</h2>
<table>
  <thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<table class="totals">
  <tr><td>Subtotal</td><td style="text-align:right">₹${inv.grossAmount}</td></tr>
  <tr><td>Tax</td><td style="text-align:right">₹${inv.taxAmount}</td></tr>
  <tr class="total"><td>Total</td><td style="text-align:right">₹${inv.netAmount}</td></tr>
</table>

${paymentRows ? `<h2>Payments received</h2>
<table>
  <thead><tr><th>Method</th><th>Reference</th><th style="text-align:right">At</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${paymentRows}</tbody>
</table>` : ''}

<div class="foot">
  Thank you for staying with ${partner?.businessName ?? 'us'}. <br>
  This is a computer-generated invoice — no signature required.
</div>
</body></html>`;
      set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return html;
    })

    .get('/invoices', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const rows = await db.select().from(invoices)
        .where(eq(invoices.partnerId, link.partnerId))
        .orderBy(desc(invoices.issuedAt))
        .limit(200);
      return { success: true, count: rows.length, invoices: rows };
    })

    // ═══ CALENDAR DATA (room × date timeline) ═════════════════
    .get('/calendar', async ({ headers, query, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      const startDate = query?.start ? new Date(query.start) : new Date();
      const days = Math.min(60, Math.max(7, Number(query?.days) || 14));
      const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days);

      const partnerRooms = await db.select().from(rooms).where(eq(rooms.partnerId, link.partnerId));
      const partnerSets = await db.select().from(podSets).where(eq(podSets.partnerId, link.partnerId));
      const roomIds = partnerRooms.map((r) => r.id);
      const setIds = partnerSets.map((s) => s.id);

      // Fetch bookings that overlap [startDate, endDate)
      const roomBookings = roomIds.length === 0 ? [] : await db.select().from(bookings).where(and(
        inArray(bookings.roomId, roomIds),
        inArray(bookings.status, ['confirmed', 'checked_in', 'checked_out']),
        lte(bookings.checkIn, endDate),
        gte(bookings.checkOut, startDate)
      ));
      // For pods, look up pod IDs that belong to this partner's pod sets
      let podBookings: any[] = [];
      if (setIds.length > 0) {
        const podIdsResp = await db.execute(sql`SELECT id FROM pods WHERE pod_set_id IN ${sql.raw('(' + setIds.map((id) => `'${id}'`).join(',') + ')')}`);
        const podIds = (podIdsResp as any).rows ? (podIdsResp as any).rows.map((r: any) => r.id) : (podIdsResp as any).map((r: any) => r.id);
        if (podIds.length > 0) {
          podBookings = await db.select().from(bookings).where(and(
            inArray(bookings.podId, podIds),
            inArray(bookings.status, ['confirmed', 'checked_in', 'checked_out']),
            lte(bookings.checkIn, endDate),
            gte(bookings.checkOut, startDate)
          ));
        }
      }
      const relevantBookings = [...roomBookings, ...podBookings];

      const dayKeys: string[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate); d.setDate(d.getDate() + i);
        dayKeys.push(d.toISOString().slice(0, 10));
      }

      return {
        success: true,
        startDate: startDate.toISOString().slice(0, 10),
        days,
        dayKeys,
        rooms: partnerRooms.map((r) => ({
          id: r.id, number: r.roomNumber, type: r.roomType,
          name: r.name, dailyRate: r.dailyRate,
        })),
        podSets: partnerSets.map((s) => ({
          id: s.id, setNumber: s.setNumber, floor: s.floor, hourlyRate: s.hourlyRate,
        })),
        bookings: relevantBookings.map((b) => ({
          id: b.id,
          number: b.bookingNumber,
          roomId: b.roomId,
          podId: b.podId,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          total: b.total,
          source: (b as any).source,
        })),
      };
    });
}

// ─── Public OTA API key issuance (separate small handler) ─────
import { randomBytes, createHash } from 'crypto';

function _hashApiKey(k: string): string {
  return createHash('sha256').update(k).digest('hex');
}
function _genApiKey(): { full: string; prefix: string } {
  const raw = randomBytes(24).toString('base64url');
  return { full: `npl_${raw}`, prefix: `npl_${raw.slice(0, 6)}` };
}

export function registerApiKeys(app: any) {
  return app
    .get('/api-keys', async ({ headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link) { set.status = 403; return { success: false, message: 'Partner required' }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      const rows = await db.execute(sql`
        SELECT id, name, key_prefix, scopes, status, last_used_at, created_at
        FROM api_keys WHERE partner_id = ${link.partnerId}
        ORDER BY created_at DESC
      `);
      const keys = (rows as any).rows || rows;
      return { success: true, count: keys.length, keys };
    })

    .post('/api-keys', async ({ headers, body, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role === 'front_desk') {
        set.status = 403; return { success: false, message: 'Manager+ required' };
      }
      const { full, prefix } = _genApiKey();
      const hash = _hashApiKey(full);
      const scopes = body.scopes ?? ['read'];
      await db.execute(sql`
        INSERT INTO api_keys (partner_id, name, key_prefix, key_hash, scopes, created_by)
        VALUES (${link.partnerId}, ${body.name}, ${prefix}, ${hash},
                ${JSON.stringify(scopes)}::jsonb, ${link.userId})
      `);
      return {
        success: true,
        message: 'Save this key now — it will not be shown again',
        api_key: full,
        key_prefix: prefix,
      };
    }, {
      body: t.Object({
        name: t.String(),
        scopes: t.Optional(t.Array(t.String())),
      }),
    })

    .delete('/api-keys/:id', async ({ params, headers, set }: any) => {
      const link = await resolvePartner(headers);
      if (!link || link.role !== 'owner') { set.status = 403; return { success: false, message: 'Owner only' }; }
      await db.execute(sql`UPDATE api_keys SET status = 'revoked', updated_at = NOW() WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    });
}
