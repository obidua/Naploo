// Admin ERP module: cross-partner rollup + HQ employees/expenses.
// Mounted in admin-service/src/index.ts after registerAdminQlo2.
// Routes are exposed under /api/v1/admin/* through the gateway (admin role enforced).
import { Elysia, t } from 'elysia';
import { db } from '@naploo/db';
import { sql } from 'drizzle-orm';

function _rows(r: any): any[] { return Array.isArray(r) ? r : (r?.rows ?? []); }

export function registerAdminErp(app: any) {
  return app
    // ─── ROLLUP: company-wide ERP KPIs across all partners ────────
    .get('/erp/rollup', async ({ query }: any) => {
      const from = query?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const to = query?.to || new Date().toISOString().slice(0, 10);

      // Per-partner P&L from daily_statements + live ERP tables
      const perPartner = await db.execute(sql`
        SELECT
          p.id AS partner_id,
          p.business_name,
          p.city,
          p.status AS partner_status,
          COALESCE(ds.revenue, 0)        AS revenue,
          COALESCE(ds.collected, 0)      AS collected,
          COALESCE(exp.total, 0)         AS expenses,
          COALESCE(pay.total, 0)         AS payroll,
          COALESCE(emp.cnt, 0)           AS employees,
          COALESCE(ds.revenue, 0) - COALESCE(exp.total, 0) - COALESCE(pay.total, 0) AS net
        FROM partners p
        LEFT JOIN (
          SELECT partner_id,
                 SUM(total_revenue) AS revenue,
                 SUM(total_collected) AS collected
          FROM daily_statements
          WHERE statement_date BETWEEN ${from} AND ${to}
          GROUP BY partner_id
        ) ds ON ds.partner_id = p.id
        LEFT JOIN (
          SELECT partner_id, SUM(total_amount) AS total
          FROM expenses
          WHERE expense_date BETWEEN ${from} AND ${to}
          GROUP BY partner_id
        ) exp ON exp.partner_id = p.id
        LEFT JOIN (
          SELECT partner_id, SUM(net_pay) AS total
          FROM salary_payments
          WHERE status = 'paid'
            AND paid_at BETWEEN ${from}::date AND (${to}::date + INTERVAL '1 day')
          GROUP BY partner_id
        ) pay ON pay.partner_id = p.id
        LEFT JOIN (
          SELECT partner_id, COUNT(*) AS cnt FROM employees WHERE status = 'active' GROUP BY partner_id
        ) emp ON emp.partner_id = p.id
        ORDER BY revenue DESC NULLS LAST, p.business_name
      `);

      // Company totals
      const totals = await db.execute(sql`
        SELECT
          (SELECT COALESCE(SUM(total_revenue),0) FROM daily_statements WHERE statement_date BETWEEN ${from} AND ${to}) AS revenue,
          (SELECT COALESCE(SUM(total_collected),0) FROM daily_statements WHERE statement_date BETWEEN ${from} AND ${to}) AS collected,
          (SELECT COALESCE(SUM(total_amount),0) FROM expenses WHERE expense_date BETWEEN ${from} AND ${to}) AS expenses,
          (SELECT COALESCE(SUM(net_pay),0) FROM salary_payments WHERE status = 'paid' AND paid_at BETWEEN ${from}::date AND (${to}::date + INTERVAL '1 day')) AS payroll,
          (SELECT COUNT(*) FROM employees WHERE status = 'active') AS active_employees,
          (SELECT COUNT(*) FROM employees WHERE status = 'active' AND partner_id IS NULL) AS hq_employees,
          (SELECT COUNT(*) FROM partners WHERE status = 'active') AS active_partners
      `);

      // Expenses by group (chart)
      const byGroup = await db.execute(sql`
        SELECT COALESCE(c.group_name,'other') AS group_name,
               COALESCE(SUM(e.total_amount),0) AS total
        FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
        WHERE e.expense_date BETWEEN ${from} AND ${to}
        GROUP BY c.group_name ORDER BY total DESC
      `);

      return {
        success: true, from, to,
        totals: _rows(totals)[0] || {},
        partners: _rows(perPartner),
        expensesByGroup: _rows(byGroup),
      };
    })

    // ─── HQ EMPLOYEES (admin-side staff: partner_id IS NULL) ──────
    .get('/erp/hq-employees', async () => {
      const r = await db.execute(sql`
        SELECT e.*,
               d.name AS department_name,
               (SELECT gross_monthly FROM salary_structures
                WHERE employee_id = e.id AND status = 'active'
                ORDER BY effective_from DESC LIMIT 1) AS current_gross
        FROM employees e
        LEFT JOIN admin_departments d ON d.name = e.department
        WHERE e.partner_id IS NULL
        ORDER BY e.status, e.full_name
      `);
      return { success: true, employees: _rows(r) };
    })
    .post('/erp/hq-employees', async ({ headers, body, set }: any) => {
      const userId = headers['x-user-id'];
      try {
        const r = await db.execute(sql`
          INSERT INTO employees (
            partner_id, user_id, emp_code, full_name, gender, dob, phone, email,
            designation, department, joined_at, employment_type, pan, aadhaar_last4,
            bank_account, bank_ifsc, upi
          ) VALUES (
            NULL, ${body.userId ?? null}, ${body.empCode ?? null}, ${body.fullName},
            ${body.gender ?? null}, ${body.dob ?? null}, ${body.phone ?? null}, ${body.email ?? null},
            ${body.designation ?? null}, ${body.department ?? null}, ${body.joinedAt ?? null},
            ${body.employmentType ?? 'full_time'}, ${body.pan ?? null}, ${body.aadhaarLast4 ?? null},
            ${body.bankAccount ?? null}, ${body.bankIfsc ?? null}, ${body.upi ?? null}
          ) RETURNING *
        `);
        return { success: true, employee: _rows(r)[0], createdBy: userId };
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
        designation: t.Optional(t.String()),
        department: t.Optional(t.String()),
        joinedAt: t.Optional(t.String()),
        employmentType: t.Optional(t.String()),
        pan: t.Optional(t.String()),
        aadhaarLast4: t.Optional(t.String()),
        bankAccount: t.Optional(t.String()),
        bankIfsc: t.Optional(t.String()),
        upi: t.Optional(t.String()),
      }),
    })
    .put('/erp/hq-employees/:id', async ({ params, body }: any) => {
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
        WHERE id = ${params.id} AND partner_id IS NULL
      `);
      return { success: true };
    })
    .post('/erp/hq-employees/:id/salary-structure', async ({ params, body }: any) => {
      await db.execute(sql`UPDATE salary_structures SET status = 'inactive' WHERE employee_id = ${params.id}`);
      const r = await db.execute(sql`
        INSERT INTO salary_structures (employee_id, effective_from, basic, hra, conveyance, medical, special, other_allow, pf_percent, esi_percent, professional_tax, status)
        VALUES (${params.id}, ${body.effectiveFrom}, ${body.basic ?? 0}, ${body.hra ?? 0}, ${body.conveyance ?? 0}, ${body.medical ?? 0}, ${body.special ?? 0}, ${body.otherAllow ?? 0}, ${body.pfPercent ?? 12}, ${body.esiPercent ?? 0.75}, ${body.professionalTax ?? 200}, 'active')
        RETURNING *
      `);
      return { success: true, structure: _rows(r)[0] };
    }, {
      body: t.Object({
        effectiveFrom: t.String(),
        basic: t.Optional(t.Number()), hra: t.Optional(t.Number()),
        conveyance: t.Optional(t.Number()), medical: t.Optional(t.Number()),
        special: t.Optional(t.Number()), otherAllow: t.Optional(t.Number()),
        pfPercent: t.Optional(t.Number()), esiPercent: t.Optional(t.Number()),
        professionalTax: t.Optional(t.Number()),
      }),
    })

    // ─── HQ ATTENDANCE / LEAVES ────────────────────────────────────
    .get('/erp/hq-attendance', async ({ query }: any) => {
      const date = query?.date || new Date().toISOString().slice(0, 10);
      const r = await db.execute(sql`
        SELECT a.*, e.full_name, e.emp_code, e.designation
        FROM attendance_logs a
        JOIN employees e ON e.id = a.employee_id
        WHERE e.partner_id IS NULL AND a.date = ${date}
        ORDER BY e.full_name
      `);
      return { success: true, date, attendance: _rows(r) };
    })
    .post('/erp/hq-attendance', async ({ body }: any) => {
      const r = await db.execute(sql`
        INSERT INTO attendance_logs (employee_id, date, check_in_at, check_out_at, status, hours_worked, overtime_hrs, notes, source)
        VALUES (${body.employeeId}, ${body.date}, ${body.checkInAt ?? null}, ${body.checkOutAt ?? null},
                ${body.status ?? 'present'}, ${body.hoursWorked ?? null}, ${body.overtimeHrs ?? 0},
                ${body.notes ?? null}, ${body.source ?? 'manual'})
        ON CONFLICT (employee_id, date) DO UPDATE SET
          status = EXCLUDED.status, hours_worked = COALESCE(EXCLUDED.hours_worked, attendance_logs.hours_worked),
          overtime_hrs = EXCLUDED.overtime_hrs, notes = COALESCE(EXCLUDED.notes, attendance_logs.notes)
        RETURNING *
      `);
      return { success: true, log: _rows(r)[0] };
    }, {
      body: t.Object({
        employeeId: t.String(), date: t.String(),
        checkInAt: t.Optional(t.String()), checkOutAt: t.Optional(t.String()),
        status: t.Optional(t.String()), hoursWorked: t.Optional(t.Number()),
        overtimeHrs: t.Optional(t.Number()), notes: t.Optional(t.String()),
        source: t.Optional(t.String()),
      }),
    })

    // ─── HQ EXPENSES (head-office spending) ────────────────────────
    .get('/erp/hq-expenses', async ({ query }: any) => {
      const from = query?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const to = query?.to || new Date().toISOString().slice(0, 10);
      const r = await db.execute(sql`
        SELECT e.*, c.name AS category_name, c.group_name
        FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
        WHERE e.partner_id IS NULL AND e.expense_date BETWEEN ${from} AND ${to}
        ORDER BY e.expense_date DESC, e.created_at DESC LIMIT 1000
      `);
      const summary = await db.execute(sql`
        SELECT c.group_name, COALESCE(SUM(e.total_amount),0) AS total
        FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
        WHERE e.partner_id IS NULL AND e.expense_date BETWEEN ${from} AND ${to}
        GROUP BY c.group_name
      `);
      return { success: true, expenses: _rows(r), summary: _rows(summary), from, to };
    })
    .post('/erp/hq-expenses', async ({ headers, body }: any) => {
      const userId = headers['x-user-id'] || null;
      const r = await db.execute(sql`
        INSERT INTO expenses (
          partner_id, category_id, expense_date, description, amount, gst_amount,
          payment_mode, vendor_name, invoice_no, receipt_url, paid_by, notes
        ) VALUES (
          NULL, ${body.categoryId ?? null}, ${body.expenseDate ?? sql`CURRENT_DATE`},
          ${body.description}, ${body.amount}, ${body.gstAmount ?? 0},
          ${body.paymentMode ?? 'bank'}, ${body.vendorName ?? null}, ${body.invoiceNo ?? null},
          ${body.receiptUrl ?? null}, ${userId}, ${body.notes ?? null}
        ) RETURNING *
      `);
      return { success: true, expense: _rows(r)[0] };
    }, {
      body: t.Object({
        description: t.String(), amount: t.Number(),
        categoryId: t.Optional(t.String()), expenseDate: t.Optional(t.String()),
        gstAmount: t.Optional(t.Number()), paymentMode: t.Optional(t.String()),
        vendorName: t.Optional(t.String()), invoiceNo: t.Optional(t.String()),
        receiptUrl: t.Optional(t.String()), notes: t.Optional(t.String()),
      }),
    })

    // ─── EXPENSE CATEGORIES (proxy for admin UIs) ──────────────────
    .get('/erp/expense-categories', async () => {
      const r = await db.execute(sql`SELECT * FROM expense_categories ORDER BY group_name, name`);
      return { success: true, categories: _rows(r) };
    });
}
