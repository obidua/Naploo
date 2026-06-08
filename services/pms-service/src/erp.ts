// ERP layer: HR/Payroll/Expenses/Accounting/Daily statement.
// Mounted via registerErp(app) after registerQlo3 in pms-service.
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import { sql } from 'drizzle-orm';

function _rows(r: any): any[] { return Array.isArray(r) ? r : (r?.rows ?? []); }

// ─── Account lookup cache (chart_of_accounts) ────────────────
// Resolves a code (e.g. '5010') against a partner's chart, falling back to
// the global rows where partner_id IS NULL. Cached per partner+code.
const _acctCache = new Map<string, string>(); // key: partnerId|code → accountId
async function getAccountIdByCode(partnerId: string | null, code: string): Promise<string | null> {
  const key = `${partnerId ?? 'GLOBAL'}|${code}`;
  const hit = _acctCache.get(key);
  if (hit) return hit;
  const r = await db.execute(sql`
    SELECT id FROM chart_of_accounts
    WHERE code = ${code} AND (partner_id = ${partnerId} OR partner_id IS NULL)
    ORDER BY (partner_id IS NULL) ASC LIMIT 1
  `);
  const id = _rows(r)[0]?.id ?? null;
  if (id) _acctCache.set(key, id);
  return id;
}

// Map expense category group → expense account code
function expenseAccountCodeForGroup(group: string | null | undefined, slug?: string | null): string {
  if (slug === 'salaries') return '5010';
  if (slug === 'rent') return '5020';
  if (slug && slug.startsWith('utilities_')) return '5030';
  if (slug === 'marketing') return '5040';
  if (slug === 'repairs') return '5050';
  if (slug === 'ota_commission') return '5060';
  if (group === 'cogs') return '5000';
  return '5099';
}

// Map payment_mode → asset/liability account
function paymentAccountCode(mode: string | null | undefined): string {
  const m = (mode || 'cash').toLowerCase();
  if (m === 'bank' || m === 'card' || m === 'upi' || m === 'neft' || m === 'rtgs' || m === 'cheque') return '1010';
  if (m === 'credit' || m === 'pending') return '2000'; // accounts payable
  return '1000'; // cash
}

/**
 * Insert a balanced double-entry pair into ledger_entries.
 * No-op if either account cannot be resolved.
 */
async function postLedger(opts: {
  partnerId: string;
  date?: string;
  refType: string;
  refId?: string | null;
  description: string;
  debitCode: string;
  creditCode: string;
  amount: number;
  createdBy?: string | null;
}): Promise<void> {
  if (!opts.amount || opts.amount <= 0) return;
  const debitId = await getAccountIdByCode(opts.partnerId, opts.debitCode);
  const creditId = await getAccountIdByCode(opts.partnerId, opts.creditCode);
  if (!debitId || !creditId) return;
  const date = opts.date ?? new Date().toISOString().slice(0, 10);
  const desc = opts.description;
  await db.execute(sql`
    INSERT INTO ledger_entries (partner_id, entry_date, ref_type, ref_id, description, account_id, debit, credit, created_by)
    VALUES
      (${opts.partnerId}, ${date}, ${opts.refType}, ${opts.refId ?? null}, ${desc}, ${debitId}, ${opts.amount}, 0, ${opts.createdBy ?? null}),
      (${opts.partnerId}, ${date}, ${opts.refType}, ${opts.refId ?? null}, ${desc}, ${creditId}, 0, ${opts.amount}, ${opts.createdBy ?? null})
  `);
}

async function reverseLedger(refType: string, refId: string): Promise<void> {
  await db.execute(sql`DELETE FROM ledger_entries WHERE ref_type = ${refType} AND ref_id = ${refId}`);
}

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

export function registerErp(app: any) {
  return app
    // ═══════ EMPLOYEES ═══════════════════════════════════════════
    .get('/employees', async ({ headers, set, query }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT e.*,
               (SELECT gross_monthly FROM salary_structures
                WHERE employee_id = e.id AND status = 'active'
                ORDER BY effective_from DESC LIMIT 1) AS current_gross,
               (SELECT COUNT(*) FROM attendance_logs
                WHERE employee_id = e.id
                  AND date >= date_trunc('month', CURRENT_DATE)
                  AND status IN ('present','half_day')) AS days_present_this_month
        FROM employees e
        WHERE e.partner_id = ${link.partnerId}
          ${query?.status ? sql`AND e.status = ${query.status}` : sql``}
        ORDER BY e.status, e.full_name
      `);
      return { success: true, employees: _rows(r) };
    })
    .post('/employees', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false, message: 'Manager+ required' }; }
      try {
        const r = await db.execute(sql`
          INSERT INTO employees (
            partner_id, user_id, emp_code, full_name, gender, dob, phone, email, address, city, state, pincode,
            designation, department, joined_at, employment_type, pan, aadhaar_last4, bank_account, bank_ifsc, upi,
            emergency_name, emergency_phone, photo_url, notes
          ) VALUES (
            ${link.partnerId}, ${body.userId ?? null}, ${body.empCode ?? null}, ${body.fullName},
            ${body.gender ?? null}, ${body.dob ?? null}, ${body.phone ?? null}, ${body.email ?? null},
            ${body.address ?? null}, ${body.city ?? null}, ${body.state ?? null}, ${body.pincode ?? null},
            ${body.designation ?? null}, ${body.department ?? null}, ${body.joinedAt ?? null},
            ${body.employmentType ?? 'full_time'}, ${body.pan ?? null}, ${body.aadhaarLast4 ?? null},
            ${body.bankAccount ?? null}, ${body.bankIfsc ?? null}, ${body.upi ?? null},
            ${body.emergencyName ?? null}, ${body.emergencyPhone ?? null},
            ${body.photoUrl ?? null}, ${body.notes ?? null}
          ) RETURNING *
        `);
        return { success: true, employee: _rows(r)[0] };
      } catch (e: any) { set.status = 400; return { success: false, message: e.message }; }
    }, {
      body: t.Object({
        fullName: t.String(),
        userId: t.Optional(t.String()),
        empCode: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        dob: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        email: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        pincode: t.Optional(t.String()),
        designation: t.Optional(t.String()),
        department: t.Optional(t.String()),
        joinedAt: t.Optional(t.String()),
        employmentType: t.Optional(t.String()),
        pan: t.Optional(t.String()),
        aadhaarLast4: t.Optional(t.String()),
        bankAccount: t.Optional(t.String()),
        bankIfsc: t.Optional(t.String()),
        upi: t.Optional(t.String()),
        emergencyName: t.Optional(t.String()),
        emergencyPhone: t.Optional(t.String()),
        photoUrl: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    })
    .put('/employees/:id', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      // Only allow updates for own partner
      await db.execute(sql`
        UPDATE employees SET
          full_name = COALESCE(${body.fullName ?? null}, full_name),
          designation = COALESCE(${body.designation ?? null}, designation),
          department = COALESCE(${body.department ?? null}, department),
          phone = COALESCE(${body.phone ?? null}, phone),
          email = COALESCE(${body.email ?? null}, email),
          status = COALESCE(${body.status ?? null}, status),
          exited_at = COALESCE(${body.exitedAt ?? null}, exited_at),
          updated_at = NOW()
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      return { success: true };
    })
    .get('/employees/:id', async ({ headers, params, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`SELECT * FROM employees WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      const emp = _rows(r)[0];
      if (!emp) { set.status = 404; return { success: false, message: 'Not found' }; }
      const struct = await db.execute(sql`
        SELECT * FROM salary_structures WHERE employee_id = ${params.id} ORDER BY effective_from DESC
      `);
      const att = await db.execute(sql`
        SELECT * FROM attendance_logs WHERE employee_id = ${params.id} ORDER BY date DESC LIMIT 60
      `);
      const pay = await db.execute(sql`
        SELECT * FROM salary_payments WHERE employee_id = ${params.id} ORDER BY pay_period DESC LIMIT 24
      `);
      return { success: true, employee: emp, salaryStructures: _rows(struct), attendance: _rows(att), payments: _rows(pay) };
    })

    // ═══════ SALARY STRUCTURE ════════════════════════════════════
    .post('/employees/:id/salary-structure', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      // Mark previous active as inactive
      await db.execute(sql`UPDATE salary_structures SET status = 'inactive' WHERE employee_id = ${params.id}`);
      const r = await db.execute(sql`
        INSERT INTO salary_structures (
          employee_id, effective_from, basic, hra, conveyance, medical, special, other_allow,
          pf_percent, esi_percent, professional_tax, status
        ) VALUES (
          ${params.id}, ${body.effectiveFrom}, ${body.basic ?? 0}, ${body.hra ?? 0},
          ${body.conveyance ?? 0}, ${body.medical ?? 0}, ${body.special ?? 0}, ${body.otherAllow ?? 0},
          ${body.pfPercent ?? 12}, ${body.esiPercent ?? 0.75}, ${body.professionalTax ?? 200}, 'active'
        ) RETURNING *
      `);
      return { success: true, structure: _rows(r)[0] };
    }, {
      body: t.Object({
        effectiveFrom: t.String(),
        basic: t.Optional(t.Number()),
        hra: t.Optional(t.Number()),
        conveyance: t.Optional(t.Number()),
        medical: t.Optional(t.Number()),
        special: t.Optional(t.Number()),
        otherAllow: t.Optional(t.Number()),
        pfPercent: t.Optional(t.Number()),
        esiPercent: t.Optional(t.Number()),
        professionalTax: t.Optional(t.Number()),
      }),
    })

    // ═══════ ATTENDANCE ══════════════════════════════════════════
    .get('/attendance', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const date = query?.date || new Date().toISOString().slice(0, 10);
      const r = await db.execute(sql`
        SELECT a.*, e.full_name, e.emp_code, e.designation
        FROM attendance_logs a
        JOIN employees e ON e.id = a.employee_id
        WHERE e.partner_id = ${link.partnerId} AND a.date = ${date}
        ORDER BY e.full_name
      `);
      return { success: true, date, attendance: _rows(r) };
    })
    .post('/attendance', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO attendance_logs (employee_id, date, check_in_at, check_out_at, status, hours_worked, overtime_hrs, notes, source)
        VALUES (${body.employeeId}, ${body.date}, ${body.checkInAt ?? null}, ${body.checkOutAt ?? null},
                ${body.status ?? 'present'}, ${body.hoursWorked ?? null}, ${body.overtimeHrs ?? 0},
                ${body.notes ?? null}, ${body.source ?? 'manual'})
        ON CONFLICT (employee_id, date) DO UPDATE SET
          check_in_at = COALESCE(EXCLUDED.check_in_at, attendance_logs.check_in_at),
          check_out_at = COALESCE(EXCLUDED.check_out_at, attendance_logs.check_out_at),
          status = EXCLUDED.status,
          hours_worked = COALESCE(EXCLUDED.hours_worked, attendance_logs.hours_worked),
          overtime_hrs = EXCLUDED.overtime_hrs,
          notes = COALESCE(EXCLUDED.notes, attendance_logs.notes)
        RETURNING *
      `);
      return { success: true, log: _rows(r)[0] };
    }, {
      body: t.Object({
        employeeId: t.String(),
        date: t.String(),
        checkInAt: t.Optional(t.String()),
        checkOutAt: t.Optional(t.String()),
        status: t.Optional(t.String()),
        hoursWorked: t.Optional(t.Number()),
        overtimeHrs: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
        source: t.Optional(t.String()),
      }),
    })

    // ═══════ LEAVES ══════════════════════════════════════════════
    .get('/leaves', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT l.*, e.full_name, e.designation
        FROM leave_requests l
        JOIN employees e ON e.id = l.employee_id
        WHERE e.partner_id = ${link.partnerId}
        ORDER BY l.created_at DESC LIMIT 200
      `);
      return { success: true, leaves: _rows(r) };
    })
    .post('/leaves', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const days = Math.max(1, Math.ceil((new Date(body.toDate).getTime() - new Date(body.fromDate).getTime()) / 86400000) + 1);
      const r = await db.execute(sql`
        INSERT INTO leave_requests (employee_id, kind, from_date, to_date, days, reason)
        VALUES (${body.employeeId}, ${body.kind ?? 'casual'}, ${body.fromDate}, ${body.toDate}, ${days}, ${body.reason ?? null})
        RETURNING *
      `);
      return { success: true, leave: _rows(r)[0] };
    }, {
      body: t.Object({
        employeeId: t.String(),
        kind: t.Optional(t.String()),
        fromDate: t.String(),
        toDate: t.String(),
        reason: t.Optional(t.String()),
      }),
    })
    .put('/leaves/:id', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE leave_requests SET
          status = ${body.status},
          approved_by = ${link.userId},
          approved_at = NOW()
        WHERE id = ${params.id}
      `);
      return { success: true };
    }, { body: t.Object({ status: t.String() }) })

    // ═══════ SALARY PAYMENTS ═════════════════════════════════════
    .get('/salary-payments', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT sp.*, e.full_name, e.emp_code, e.designation
        FROM salary_payments sp
        JOIN employees e ON e.id = sp.employee_id
        WHERE sp.partner_id = ${link.partnerId}
          ${query?.period ? sql`AND sp.pay_period = ${query.period}` : sql``}
        ORDER BY sp.pay_period DESC, e.full_name
        LIMIT 500
      `);
      return { success: true, payments: _rows(r) };
    })
    .post('/salary-payments/generate', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const period = body.period; // YYYY-MM
      const monthStart = period + '-01';
      // Generate draft payment for each active employee
      const emps = await db.execute(sql`
        SELECT e.id, e.full_name,
               (SELECT row_to_json(s) FROM salary_structures s
                WHERE s.employee_id = e.id AND s.status = 'active'
                ORDER BY effective_from DESC LIMIT 1) AS struct
        FROM employees e
        WHERE e.partner_id = ${link.partnerId} AND e.status = 'active'
      `);
      let generated = 0;
      for (const emp of _rows(emps)) {
        if (!emp.struct) continue;
        const s = emp.struct as any;
        const att = await db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE status IN ('present','half_day','paid_leave')) AS paid_days,
            COUNT(*) FILTER (WHERE status = 'present') AS full_days,
            COUNT(*) FILTER (WHERE status = 'half_day') AS half_days,
            COALESCE(SUM(overtime_hrs),0) AS ot_hrs
          FROM attendance_logs WHERE employee_id = ${emp.id}
            AND date_trunc('month', date) = ${monthStart}::date
        `);
        const a = _rows(att)[0] || { paid_days: 0, full_days: 0, half_days: 0, ot_hrs: 0 };
        const daysInMonth = new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]), 0).getDate();
        const paidDays = Number(a.full_days) + (Number(a.half_days) * 0.5);
        const ratio = daysInMonth ? paidDays / daysInMonth : 0;
        const gross = Math.round(Number(s.gross_monthly || 0) * ratio);
        const otRate = Number(s.basic || 0) / (daysInMonth * 8) * 2; // 2x OT
        const overtimePay = Math.round(otRate * Number(a.ot_hrs));
        const totalGross = gross + overtimePay;
        const pf = Math.round(Number(s.basic || 0) * ratio * (Number(s.pf_percent || 12) / 100));
        const esi = totalGross <= 21000 ? Math.round(totalGross * (Number(s.esi_percent || 0.75) / 100)) : 0;
        const pt = Number(s.professional_tax || 200);
        const net = totalGross - pf - esi - pt;

        const ins = await db.execute(sql`
          INSERT INTO salary_payments (
            employee_id, partner_id, pay_period, days_worked, days_paid,
            basic, hra, allowances, overtime_pay, gross,
            pf_deducted, esi_deducted, pt_deducted, net_pay, status
          ) VALUES (
            ${emp.id}, ${link.partnerId}, ${period}, ${Number(a.full_days)}, ${paidDays},
            ${Math.round(Number(s.basic || 0) * ratio)},
            ${Math.round(Number(s.hra || 0) * ratio)},
            ${Math.round((Number(s.conveyance || 0) + Number(s.medical || 0) + Number(s.special || 0) + Number(s.other_allow || 0)) * ratio)},
            ${overtimePay}, ${totalGross},
            ${pf}, ${esi}, ${pt}, ${net}, 'draft'
          )
          ON CONFLICT (employee_id, pay_period) DO UPDATE SET
            days_worked = EXCLUDED.days_worked, days_paid = EXCLUDED.days_paid,
            basic = EXCLUDED.basic, hra = EXCLUDED.hra, allowances = EXCLUDED.allowances,
            overtime_pay = EXCLUDED.overtime_pay, gross = EXCLUDED.gross,
            pf_deducted = EXCLUDED.pf_deducted, esi_deducted = EXCLUDED.esi_deducted,
            pt_deducted = EXCLUDED.pt_deducted, net_pay = EXCLUDED.net_pay
          RETURNING id
        `);
        const payId = _rows(ins)[0]?.id;
        // Accrual: debit Salaries & wages (5010), credit Salaries payable (2100) for net_pay
        if (payId) {
          try {
            await reverseLedger('salary_accrual', payId);
            await postLedger({
              partnerId: link.partnerId,
              date: monthStart,
              refType: 'salary_accrual',
              refId: payId,
              description: `Salary accrual ${period} — ${emp.full_name}`,
              debitCode: '5010',
              creditCode: '2100',
              amount: net,
              createdBy: link.userId,
            });
          } catch { /* ignore */ }
        }
        generated++;
      }
      return { success: true, generated, period };
    }, { body: t.Object({ period: t.String() }) })
    .put('/salary-payments/:id', async ({ headers, params, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      await db.execute(sql`
        UPDATE salary_payments SET
          status = COALESCE(${body.status ?? null}, status),
          paid_at = CASE WHEN ${body.status ?? null} = 'paid' THEN NOW() ELSE paid_at END,
          payment_mode = COALESCE(${body.paymentMode ?? null}, payment_mode),
          payment_ref = COALESCE(${body.paymentRef ?? null}, payment_ref),
          notes = COALESCE(${body.notes ?? null}, notes)
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      // Auto-ledger: when marking paid, debit Salaries payable (2100), credit cash/bank
      if (body.status === 'paid') {
        try {
          const r = await db.execute(sql`SELECT id, net_pay, payment_mode, paid_at FROM salary_payments WHERE id = ${params.id}`);
          const sp = _rows(r)[0];
          if (sp) {
            await reverseLedger('salary_payment', sp.id);
            await postLedger({
              partnerId: link.partnerId,
              date: (sp.paid_at ? new Date(sp.paid_at).toISOString().slice(0, 10) : undefined),
              refType: 'salary_payment',
              refId: sp.id,
              description: `Salary paid (${body.paymentRef || sp.payment_mode || 'cash'})`,
              debitCode: '2100',
              creditCode: paymentAccountCode(sp.payment_mode || body.paymentMode),
              amount: Number(sp.net_pay || 0),
              createdBy: link.userId,
            });
          }
        } catch { /* ignore */ }
      }
      return { success: true };
    }, {
      body: t.Object({
        status: t.Optional(t.String()),
        paymentMode: t.Optional(t.String()),
        paymentRef: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    })

    // ═══════ EXPENSES ════════════════════════════════════════════
    .get('/expense-categories', async () => {
      const r = await db.execute(sql`SELECT * FROM expense_categories ORDER BY group_name, name`);
      return { success: true, categories: _rows(r) };
    })
    .get('/expenses', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const from = query?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const to = query?.to || new Date().toISOString().slice(0, 10);
      const r = await db.execute(sql`
        SELECT e.*, c.name AS category_name, c.group_name,
               u.first_name AS paid_by_first, u.last_name AS paid_by_last
        FROM expenses e
        LEFT JOIN expense_categories c ON c.id = e.category_id
        LEFT JOIN users u ON u.id = e.paid_by
        WHERE e.partner_id = ${link.partnerId}
          AND e.expense_date BETWEEN ${from} AND ${to}
        ORDER BY e.expense_date DESC, e.created_at DESC
        LIMIT 1000
      `);
      const summary = await db.execute(sql`
        SELECT c.group_name, COALESCE(SUM(e.total_amount), 0) AS total
        FROM expenses e
        LEFT JOIN expense_categories c ON c.id = e.category_id
        WHERE e.partner_id = ${link.partnerId}
          AND e.expense_date BETWEEN ${from} AND ${to}
        GROUP BY c.group_name
      `);
      return { success: true, expenses: _rows(r), summary: _rows(summary), from, to };
    })
    .post('/expenses', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        INSERT INTO expenses (
          partner_id, category_id, expense_date, description, amount, gst_amount,
          payment_mode, vendor_name, invoice_no, receipt_url, paid_by, notes
        ) VALUES (
          ${link.partnerId}, ${body.categoryId ?? null}, ${body.expenseDate ?? sql`CURRENT_DATE`},
          ${body.description}, ${body.amount}, ${body.gstAmount ?? 0},
          ${body.paymentMode ?? 'cash'}, ${body.vendorName ?? null}, ${body.invoiceNo ?? null},
          ${body.receiptUrl ?? null}, ${link.userId}, ${body.notes ?? null}
        ) RETURNING *
      `);
      const exp = _rows(r)[0];
      // Auto double-entry: debit expense category account, credit cash/bank/AP
      try {
        let group: string | null = null, slug: string | null = null;
        if (exp?.category_id) {
          const cr = await db.execute(sql`SELECT group_name, slug FROM expense_categories WHERE id = ${exp.category_id}`);
          group = _rows(cr)[0]?.group_name ?? null;
          slug = _rows(cr)[0]?.slug ?? null;
        }
        await postLedger({
          partnerId: link.partnerId,
          date: exp.expense_date,
          refType: 'expense',
          refId: exp.id,
          description: `Expense: ${exp.description}`,
          debitCode: expenseAccountCodeForGroup(group, slug),
          creditCode: paymentAccountCode(exp.payment_mode),
          amount: Number(exp.total_amount || exp.amount || 0),
          createdBy: link.userId,
        });
      } catch { /* ledger errors must not block expense creation */ }
      return { success: true, expense: exp };
    }, {
      body: t.Object({
        description: t.String(),
        amount: t.Number(),
        categoryId: t.Optional(t.String()),
        expenseDate: t.Optional(t.String()),
        gstAmount: t.Optional(t.Number()),
        paymentMode: t.Optional(t.String()),
        vendorName: t.Optional(t.String()),
        invoiceNo: t.Optional(t.String()),
        receiptUrl: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    })
    .put('/expenses/:id/approve', async ({ headers, params, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false }; }
      await db.execute(sql`
        UPDATE expenses SET status = 'approved', approved_by = ${link.userId}, approved_at = NOW()
        WHERE id = ${params.id} AND partner_id = ${link.partnerId}
      `);
      return { success: true };
    })
    .delete('/expenses/:id', async ({ headers, params }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) return { success: false };
      await reverseLedger('expense', params.id).catch(() => {});
      await db.execute(sql`DELETE FROM expenses WHERE id = ${params.id} AND partner_id = ${link.partnerId}`);
      return { success: true };
    })

    // ═══════ ACCOUNTING ══════════════════════════════════════════
    .get('/chart-of-accounts', async ({ headers, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const r = await db.execute(sql`
        SELECT * FROM chart_of_accounts
        WHERE partner_id = ${link.partnerId} OR partner_id IS NULL
        ORDER BY code
      `);
      return { success: true, accounts: _rows(r) };
    })
    .get('/ledger', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const from = query?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const to = query?.to || new Date().toISOString().slice(0, 10);
      const r = await db.execute(sql`
        SELECT l.*, a.code, a.name AS account_name, a.type AS account_type
        FROM ledger_entries l
        LEFT JOIN chart_of_accounts a ON a.id = l.account_id
        WHERE l.partner_id = ${link.partnerId}
          AND l.entry_date BETWEEN ${from} AND ${to}
        ORDER BY l.entry_date DESC, l.created_at DESC
        LIMIT 500
      `);
      // P&L summary
      const pnl = await db.execute(sql`
        SELECT a.type,
               COALESCE(SUM(l.credit - l.debit), 0) AS net
        FROM ledger_entries l
        JOIN chart_of_accounts a ON a.id = l.account_id
        WHERE l.partner_id = ${link.partnerId}
          AND l.entry_date BETWEEN ${from} AND ${to}
        GROUP BY a.type
      `);
      return { success: true, entries: _rows(r), pnl: _rows(pnl), from, to };
    })

    // ═══════ DAILY STATEMENT ═════════════════════════════════════
    .get('/daily-statement', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const date = query?.date || new Date().toISOString().slice(0, 10);
      const dayStart = date + ' 00:00:00';
      const dayEnd = date + ' 23:59:59';
      // Existing snapshot
      const exr = await db.execute(sql`
        SELECT * FROM daily_statements
        WHERE partner_id = ${link.partnerId} AND statement_date = ${date}
      `);
      const existing = _rows(exr)[0];
      if (existing && existing.closed_at) {
        return { success: true, statement: existing, closed: true };
      }

      // Live compute (when not closed) — bookings on the day
      const revenue = await db.execute(sql`
        SELECT
          COALESCE(SUM(CASE WHEN b.booking_type = 'daily' THEN b.total ELSE 0 END), 0) AS room_revenue,
          COALESCE(SUM(CASE WHEN b.booking_type = 'hourly' THEN b.total ELSE 0 END), 0) AS pod_revenue,
          COUNT(*) AS bookings_total,
          COUNT(*) FILTER (WHERE b.actual_check_in IS NOT NULL AND DATE(b.actual_check_in) = ${date}::date) AS arrivals,
          COUNT(*) FILTER (WHERE b.actual_check_out IS NOT NULL AND DATE(b.actual_check_out) = ${date}::date) AS departures,
          COUNT(*) FILTER (WHERE b.status = 'cancelled' AND DATE(b.cancelled_at) = ${date}::date) AS cancellations
        FROM bookings b
        LEFT JOIN pods p ON p.id = b.pod_id
        LEFT JOIN pod_sets ps ON ps.id = p.pod_set_id
        WHERE (ps.partner_id = ${link.partnerId}
            OR b.room_id IN (SELECT id FROM rooms WHERE partner_id = ${link.partnerId}))
          AND DATE(b.check_in) = ${date}::date
      `);
      const rev = _rows(revenue)[0] || {};

      // F&B revenue (closed orders)
      const fnb = await db.execute(sql`
        SELECT COALESCE(SUM(total_charges),0) AS fnb_revenue
        FROM table_orders WHERE outlet_id IN (SELECT id FROM outlets WHERE partner_id = ${link.partnerId})
          AND status = 'closed' AND DATE(closed_at) = ${date}::date
      `);
      const fnbRev = Number(_rows(fnb)[0]?.fnb_revenue || 0);

      // Folio payment collections (by mode)
      const coll = await db.execute(sql`
        SELECT method, COALESCE(SUM(amount),0) AS total
        FROM folio_payments
        WHERE folio_id IN (
          SELECT id FROM folios WHERE partner_id = ${link.partnerId}
        )
        AND DATE(created_at) = ${date}::date
        GROUP BY method
      `).catch(() => ({ rows: [] })); // tolerate missing tables
      const collByMode: Record<string, number> = {};
      for (const c of _rows(coll)) collByMode[(c as any).method || 'cash'] = Number((c as any).total || 0);

      // Expenses
      const exp = await db.execute(sql`
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_expenses,
          COALESCE(SUM(CASE WHEN payment_mode = 'cash' THEN total_amount ELSE 0 END), 0) AS cash_paid
        FROM expenses WHERE partner_id = ${link.partnerId} AND expense_date = ${date}::date
      `);
      const e = _rows(exp)[0] || {};

      // Occupancy
      const occ = await db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM rooms WHERE partner_id = ${link.partnerId} AND status <> 'inactive') AS rooms_total,
          (SELECT COUNT(*) FROM pods WHERE pod_set_id IN (SELECT id FROM pod_sets WHERE partner_id = ${link.partnerId})) AS pods_total
      `);
      const o = _rows(occ)[0] || {};

      const stmt = {
        partner_id: link.partnerId,
        statement_date: date,
        room_revenue: Number(rev.room_revenue || 0),
        pod_revenue: Number(rev.pod_revenue || 0),
        fnb_revenue: fnbRev,
        services_revenue: 0,
        other_revenue: 0,
        total_revenue: Number(rev.room_revenue || 0) + Number(rev.pod_revenue || 0) + fnbRev,
        rooms_total: Number(o.rooms_total || 0),
        pods_total: Number(o.pods_total || 0),
        bookings_total: Number(rev.bookings_total || 0),
        arrivals: Number(rev.arrivals || 0),
        departures: Number(rev.departures || 0),
        cancellations: Number(rev.cancellations || 0),
        cash_collected: collByMode.cash || 0,
        card_collected: collByMode.card || 0,
        upi_collected: collByMode.upi || 0,
        bank_collected: collByMode.bank || 0,
        total_collected: Object.values(collByMode).reduce((s, v) => s + v, 0),
        total_expenses: Number(e.total_expenses || 0),
        cash_paid: Number(e.cash_paid || 0),
        net_profit: (Number(rev.room_revenue || 0) + Number(rev.pod_revenue || 0) + fnbRev) - Number(e.total_expenses || 0),
        closed_at: null,
      };
      return { success: true, statement: stmt, closed: false };
    })
    .post('/daily-statement/close', async ({ headers, body, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      if (link.role === 'front_desk') { set.status = 403; return { success: false }; }
      const date = body.date || new Date().toISOString().slice(0, 10);
      // Upsert the live-computed values into daily_statements
      const live = body.statement;
      await db.execute(sql`
        INSERT INTO daily_statements (
          partner_id, statement_date, room_revenue, pod_revenue, fnb_revenue, total_revenue,
          rooms_total, pods_total, bookings_total, arrivals, departures, cancellations,
          cash_collected, card_collected, upi_collected, bank_collected, total_collected,
          total_expenses, cash_paid, net_profit, notes,
          closed_at, closed_by
        ) VALUES (
          ${link.partnerId}, ${date},
          ${live.room_revenue}, ${live.pod_revenue}, ${live.fnb_revenue}, ${live.total_revenue},
          ${live.rooms_total}, ${live.pods_total}, ${live.bookings_total},
          ${live.arrivals}, ${live.departures}, ${live.cancellations},
          ${live.cash_collected}, ${live.card_collected}, ${live.upi_collected}, ${live.bank_collected},
          ${live.total_collected}, ${live.total_expenses}, ${live.cash_paid}, ${live.net_profit},
          ${body.notes ?? null}, NOW(), ${link.userId}
        )
        ON CONFLICT (partner_id, statement_date) DO UPDATE SET
          room_revenue = EXCLUDED.room_revenue, pod_revenue = EXCLUDED.pod_revenue,
          fnb_revenue = EXCLUDED.fnb_revenue, total_revenue = EXCLUDED.total_revenue,
          rooms_total = EXCLUDED.rooms_total, pods_total = EXCLUDED.pods_total,
          bookings_total = EXCLUDED.bookings_total, arrivals = EXCLUDED.arrivals,
          departures = EXCLUDED.departures, cancellations = EXCLUDED.cancellations,
          cash_collected = EXCLUDED.cash_collected, card_collected = EXCLUDED.card_collected,
          upi_collected = EXCLUDED.upi_collected, bank_collected = EXCLUDED.bank_collected,
          total_collected = EXCLUDED.total_collected,
          total_expenses = EXCLUDED.total_expenses, cash_paid = EXCLUDED.cash_paid,
          net_profit = EXCLUDED.net_profit, closed_at = NOW(), closed_by = EXCLUDED.closed_by,
          notes = EXCLUDED.notes
      `);
      return { success: true };
    }, {
      body: t.Object({
        date: t.Optional(t.String()),
        statement: t.Record(t.String(), t.Any()),
        notes: t.Optional(t.String()),
      }),
    })
    .get('/daily-statement/history', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const limit = Math.min(90, Number(query?.limit ?? 30));
      const r = await db.execute(sql`
        SELECT * FROM daily_statements
        WHERE partner_id = ${link.partnerId}
        ORDER BY statement_date DESC LIMIT ${limit}
      `);
      return { success: true, history: _rows(r) };
    })

    // ═══════ PAYSLIP (HTML, browser print → PDF) ═════════════════
    .get('/employees/:id/payslip/:period', async ({ headers, params, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const empR = await db.execute(sql`
        SELECT e.*, p.business_name AS partner_name
        FROM employees e LEFT JOIN partners p ON p.id = e.partner_id
        WHERE e.id = ${params.id} AND e.partner_id = ${link.partnerId}
      `);
      const emp = _rows(empR)[0];
      if (!emp) { set.status = 404; return { success: false, message: 'Employee not found' }; }
      const payR = await db.execute(sql`
        SELECT * FROM salary_payments WHERE employee_id = ${params.id} AND pay_period = ${params.period}
      `);
      const pay = _rows(payR)[0];
      if (!pay) { set.status = 404; return { success: false, message: 'Payment not found' }; }
      const inr = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Payslip ${emp.full_name} ${pay.pay_period}</title>
<style>
  body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:32px;margin:0}
  .sheet{max-width:780px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.04)}
  h1{margin:0 0 4px;font-size:22px}
  .muted{color:#64748b;font-size:13px}
  .row{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:16px}
  .col{flex:1;min-width:240px}
  .col h3{margin:0 0 6px;font-size:13px;color:#334155;text-transform:uppercase;letter-spacing:.04em}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
  th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0}
  th{background:#f1f5f9;font-weight:600}
  tr.total td{font-weight:700;background:#f8fafc;border-top:2px solid #0f172a}
  .net{margin-top:24px;background:#0f172a;color:#fff;padding:16px 20px;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
  .net b{font-size:24px}
  .footer{margin-top:32px;font-size:11px;color:#64748b;text-align:center}
  @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border:none}.print{display:none}}
  .print{margin:16px auto;max-width:780px;text-align:right}
  .print button{padding:8px 14px;background:#0f172a;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:14px}
</style></head><body>
<div class="print"><button onclick="window.print()">Save / Print PDF</button></div>
<div class="sheet">
  <div class="row" style="border-bottom:2px solid #0f172a;padding-bottom:12px">
    <div class="col">
      <h1>${emp.partner_name || 'Naploo'}</h1>
      <div class="muted">Payslip · ${pay.pay_period}</div>
    </div>
    <div class="col" style="text-align:right">
      <div class="muted">Pay period</div>
      <div><b>${pay.pay_period}</b></div>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <h3>Employee</h3>
      <div><b>${emp.full_name}</b></div>
      <div class="muted">${emp.designation || ''} · ${emp.department || ''}</div>
      <div class="muted">${emp.emp_code || ''} · ${emp.phone || ''}</div>
    </div>
    <div class="col">
      <h3>Attendance</h3>
      <div>Days worked: <b>${pay.days_worked}</b></div>
      <div>Days paid: <b>${pay.days_paid}</b></div>
      <div>Status: <b>${pay.status}</b></div>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <h3>Earnings</h3>
      <table>
        <tr><th>Component</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Basic</td><td style="text-align:right">${inr(pay.basic)}</td></tr>
        <tr><td>HRA</td><td style="text-align:right">${inr(pay.hra)}</td></tr>
        <tr><td>Allowances</td><td style="text-align:right">${inr(pay.allowances)}</td></tr>
        <tr><td>Overtime</td><td style="text-align:right">${inr(pay.overtime_pay)}</td></tr>
        <tr><td>Bonus</td><td style="text-align:right">${inr(pay.bonus)}</td></tr>
        <tr class="total"><td>Gross</td><td style="text-align:right">${inr(pay.gross)}</td></tr>
      </table>
    </div>
    <div class="col">
      <h3>Deductions</h3>
      <table>
        <tr><th>Component</th><th style="text-align:right">Amount</th></tr>
        <tr><td>PF (employee)</td><td style="text-align:right">${inr(pay.pf_deducted)}</td></tr>
        <tr><td>ESI</td><td style="text-align:right">${inr(pay.esi_deducted)}</td></tr>
        <tr><td>Professional tax</td><td style="text-align:right">${inr(pay.pt_deducted)}</td></tr>
        <tr><td>Income tax</td><td style="text-align:right">${inr(pay.tax_deducted)}</td></tr>
        <tr><td>Loan</td><td style="text-align:right">${inr(pay.loan_deducted)}</td></tr>
        <tr><td>Other</td><td style="text-align:right">${inr(pay.other_deduct)}</td></tr>
        <tr class="total"><td>Total deductions</td><td style="text-align:right">${inr(Number(pay.pf_deducted)+Number(pay.esi_deducted)+Number(pay.pt_deducted)+Number(pay.tax_deducted)+Number(pay.loan_deducted)+Number(pay.other_deduct))}</td></tr>
      </table>
    </div>
  </div>
  <div class="net"><span>Net pay</span><b>${inr(pay.net_pay)}</b></div>
  <div class="footer">${pay.status === 'paid' ? `Paid on ${pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('en-IN') : '—'} via ${pay.payment_mode || '—'} ${pay.payment_ref ? '· ref ' + pay.payment_ref : ''}` : 'Draft — payment pending'}<br/>This is a computer-generated payslip.</div>
</div>
</body></html>`;
      set.headers['content-type'] = 'text/html; charset=utf-8';
      return html;
    })

    // ═══════ DASHBOARD KPIs (for ERP home) ═══════════════════════
    .get('/erp/dashboard', async ({ headers, query, set }: any) => {
      const link = await resolvePartnerId(headers);
      if (!link) { set.status = 401; return { success: false }; }
      const from = query?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const to = query?.to || new Date().toISOString().slice(0, 10);
      const k = await db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM employees WHERE partner_id = ${link.partnerId} AND status = 'active') AS active_employees,
          (SELECT COUNT(*) FROM employees WHERE partner_id = ${link.partnerId} AND status = 'inactive') AS inactive_employees,
          (SELECT COALESCE(SUM(total_amount),0) FROM expenses WHERE partner_id = ${link.partnerId} AND expense_date BETWEEN ${from} AND ${to}) AS total_expenses,
          (SELECT COALESCE(SUM(net_pay),0) FROM salary_payments WHERE partner_id = ${link.partnerId} AND status = 'paid' AND paid_at BETWEEN ${from}::date AND (${to}::date + INTERVAL '1 day')) AS payroll_paid,
          (SELECT COALESCE(SUM(net_pay),0) FROM salary_payments WHERE partner_id = ${link.partnerId} AND status = 'draft') AS payroll_pending,
          (SELECT COALESCE(SUM(total_revenue),0) FROM daily_statements WHERE partner_id = ${link.partnerId} AND statement_date BETWEEN ${from} AND ${to}) AS revenue_closed,
          (SELECT COALESCE(SUM(net_profit),0) FROM daily_statements WHERE partner_id = ${link.partnerId} AND statement_date BETWEEN ${from} AND ${to}) AS net_profit_closed,
          (SELECT COUNT(*) FROM leave_requests l JOIN employees e ON e.id = l.employee_id WHERE e.partner_id = ${link.partnerId} AND l.status = 'pending') AS pending_leaves,
          (SELECT COUNT(*) FROM expenses WHERE partner_id = ${link.partnerId} AND status = 'recorded') AS unapproved_expenses
      `);
      // Expenses by group (chart)
      const grp = await db.execute(sql`
        SELECT COALESCE(c.group_name,'other') AS group_name,
               COALESCE(SUM(e.total_amount),0) AS total
        FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
        WHERE e.partner_id = ${link.partnerId} AND e.expense_date BETWEEN ${from} AND ${to}
        GROUP BY c.group_name ORDER BY total DESC
      `);
      return { success: true, from, to, kpis: _rows(k)[0] || {}, expensesByGroup: _rows(grp) };
    });
}

