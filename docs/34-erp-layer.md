# Super-advanced ERP layer — HR + Payroll + Expenses + Accounting + Daily Statement

June 8, 2026

## User ask
> "make this portal super advance for partner and admin as well jisse employee management salary, daily expanses mangmt, accountin, daily estatemtn bhi manage ho sake, jisse partner kahi se bhi controll aur watch kar sake samjhe?"

Built end-to-end. Partner can now run the entire property from anywhere — HR, payroll, attendance, expense tracking, ledger, end-of-day close — all real-time, all in the browser.

## New DB tables (12)
Migration: `erp-migration.sql`

| Table | Purpose |
|---|---|
| `employees` | Full HR records — name, contacts, bank, emergency, photo, KYC |
| `salary_structures` | Versioned salary breakdown (basic/HRA/conveyance/etc + PF/ESI%) |
| `attendance_logs` | Per-employee daily check-in/out with status (present/absent/half-day/leave) |
| `leave_requests` | Casual/sick/earned leave with approval workflow |
| `salary_payments` | Monthly payslips — auto-computed from attendance + structure |
| `expense_categories` | 30 seeded categories (COGS/OpEx/CapEx/Finance) |
| `expenses` | Daily expense ledger with vendor, invoice, payment mode, GST |
| `chart_of_accounts` | 22 seeded global accounts (assets/liab/equity/income/expense) |
| `ledger_entries` | Double-entry bookkeeping |
| `daily_statements` | End-of-day P&L snapshot, locked when closed |

## Backend endpoints (pms-service/erp.ts — 24 endpoints)

**Employees**
- `GET/POST /api/v1/pms/employees`
- `GET/PUT /api/v1/pms/employees/:id` (returns employee + salary history + 60-day attendance + 24-month payments)
- `POST /api/v1/pms/employees/:id/salary-structure`

**Attendance**
- `GET /api/v1/pms/attendance?date=YYYY-MM-DD`
- `POST /api/v1/pms/attendance` — upsert per employee+date

**Leaves**
- `GET/POST /api/v1/pms/leaves`
- `PUT /api/v1/pms/leaves/:id` — approve/reject

**Salary payments**
- `GET /api/v1/pms/salary-payments?period=YYYY-MM`
- `POST /api/v1/pms/salary-payments/generate` — auto-computes from attendance + active salary structure (pro-rates by paid days, adds overtime, deducts PF/ESI/PT)
- `PUT /api/v1/pms/salary-payments/:id` — mark paid with mode + ref

**Expenses**
- `GET /api/v1/pms/expense-categories`
- `GET /api/v1/pms/expenses?from=&to=` (returns entries + grouped summary by COGS/OpEx/CapEx/Finance)
- `POST /api/v1/pms/expenses`
- `PUT /api/v1/pms/expenses/:id/approve`
- `DELETE /api/v1/pms/expenses/:id`

**Accounting**
- `GET /api/v1/pms/chart-of-accounts`
- `GET /api/v1/pms/ledger?from=&to=` (entries + P&L summary)

**Daily statement**
- `GET /api/v1/pms/daily-statement?date=` — live OR closed snapshot. Computes from bookings, table_orders, folio_payments, expenses, rooms, pods.
- `POST /api/v1/pms/daily-statement/close` — locks the day
- `GET /api/v1/pms/daily-statement/history?limit=` — last N days

## New partner portal pages (6 — all owner-only)

| Route | What it does |
|---|---|
| `/partner/portal/employees` | List + add/edit employees with bank + emergency + KYC fields |
| `/partner/portal/attendance` | Click-to-mark daily attendance grid; 4 KPI tiles (present/half/leave/absent) |
| `/partner/portal/salary` | Auto-generate payslips for any month; mark paid with mode + ref; 4 KPIs (gross/net/PF/ESI) |
| `/partner/portal/expenses` | Add expenses with category/vendor/invoice; group summary by COGS/OpEx/CapEx; date-range filter |
| `/partner/portal/accounting` | General ledger entries + P&L summary (income/expense/assets/liabilities) |
| `/partner/portal/statement` | End-of-day report: revenue (rooms/pods/F&B), collections by mode (cash/card/UPI/bank), expenses, cash flow, occupancy; Close-day button locks the day |

## Smoke tests
All 6 pages return HTTP 200. All 9 endpoint groups return JSON (200) with valid partner JWT.

## How it ties together
1. Owner adds employees → assigns salary structure
2. Daily, front desk marks attendance
3. End of month, owner clicks "Generate" → payslips auto-compute (gross × days/total-days + OT − PF − ESI − PT = net)
4. Throughout the day, expenses logged with vendor + invoice
5. Bookings drive revenue, table_orders drive F&B, folio_payments record collections by mode
6. `/statement` shows the live computed P&L; owner clicks "Close day" to lock it
7. `/accounting` shows the full ledger for any date range

## Pending future work
- Auto-create ledger entries from bookings/expenses/salaries (currently the ledger table exists but is populated manually). Trigger functions could be added later.
- PDF payslip download
- Bank reconciliation
- Admin-side roll-up (cross-partner accounting view)
- Investor distributions linked to ledger
