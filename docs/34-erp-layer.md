# Super-advanced ERP layer — HR + Payroll + Expenses + Accounting + Daily Statement

Updated: June 9, 2026 (v2 — production-ready accounting)

## User asks (chronological)
1. *"make this portal super advance for partner and admin as well jisse employee management salary, daily expanses mangmt, accountin, daily estatemtn bhi manage ho sake, jisse partner kahi se bhi controll aur watch kar sake samjhe?"*
2. *"poora kam complete karo a2zand make it live and push"*
3. *"iski itna advance banana hai ki oartner aur admin pora management manage kar saken chote se chtoe expanse, employee attandem csalary, evrything jo jo hotel busienss k liye zaroori hota hai,, admin is liye kyoki yaha bhi emplyees honge poor namanagment deprt mhoga"*
4. *"acccounting softwre poora bn gya ?nd management syastem nd doc update"* — covered in this revision.

The result is a real, double-entry accounting system glued to the daily ops of a hotel/pod/F&B business.

## DB schema (10 tables + 22 chart-of-accounts + 30 expense categories)

Migration: [packages/db/migrations/erp-001-init.sql](../packages/db/migrations/erp-001-init.sql) — fully idempotent (`CREATE TABLE IF NOT EXISTS`, `INSERT … ON CONFLICT DO NOTHING`).

| Table | Purpose |
|---|---|
| `employees` | Full HR records — name, contacts, bank/UPI, PAN, KYC, emergency, photo |
| `salary_structures` | Versioned salary breakdown (basic/HRA/conveyance/medical/special + PF/ESI%) |
| `attendance_logs` | Per-employee daily check-in/out with status (present/absent/half_day/paid_leave/leave/holiday) |
| `leave_requests` | Casual/sick/earned with approval workflow |
| `salary_payments` | Monthly payslips — auto-computed from attendance + structure; locked once paid |
| `expense_categories` | 30 seeded categories grouped into cogs/opex/capex/finance |
| `expenses` | Daily expense ledger with vendor, invoice, payment mode, GST amount |
| `chart_of_accounts` | 22 seeded global accounts (assets/liab/equity/income/expense) — partners can override per-partner |
| `ledger_entries` | Double-entry bookkeeping — every row balances against another row sharing `ref_id` |
| `daily_statements` | End-of-day P&L snapshot, locked when closed |

### Chart of accounts (seeded)
| Code | Name | Type |
|------|------|------|
| 1000 | Cash on hand | asset |
| 1010 | Bank / UPI / Card MDR settlement | asset |
| 1020 | Accounts receivable | asset |
| 1100 | Inventory | asset |
| 1200 | Furniture & fixtures | asset |
| 2000 | Accounts payable | liability |
| 2010 | GST payable | liability |
| 2020 | TDS payable | liability |
| 2100 | Salaries payable | liability |
| 3000 | Owners' equity | equity |
| 4000 | Room revenue | income |
| 4010 | Pod / hourly revenue | income |
| 4020 | F&B revenue | income |
| 4030 | Services revenue | income |
| 5000 | COGS | expense |
| 5010 | Wages & salaries | expense |
| 5020 | Rent | expense |
| 5030 | Utilities | expense |
| 5040 | Marketing | expense |
| 5050 | Repairs & maintenance | expense |
| 5060 | OTA commission | expense |
| 5099 | Other operating expense | expense |

## Backend endpoints

### Partner side — `services/pms-service/src/erp.ts` (~30 endpoints)
**Employees**
- `GET / POST /api/v1/pms/employees`
- `GET / PUT /api/v1/pms/employees/:id` (returns employee + salary history + 60-day attendance + 24-month payments)
- `POST /api/v1/pms/employees/:id/salary-structure`
- `GET /api/v1/pms/employees/:id/payslip/:period` — HTML payslip with inline CSS + print button

**Attendance**
- `GET /api/v1/pms/attendance?date=YYYY-MM-DD`
- `POST /api/v1/pms/attendance` — upsert per employee+date

**Leaves**
- `GET / POST /api/v1/pms/leaves`
- `PUT /api/v1/pms/leaves/:id` — approve/reject

**Salary**
- `GET /api/v1/pms/salary-payments?period=YYYY-MM`
- `POST /api/v1/pms/salary-payments/generate` — auto-computes from attendance + active salary structure. **Auto-posts ledger: D 5010 / C 2100 for each net pay.**
- `PUT /api/v1/pms/salary-payments/:id` — mark paid with mode + ref. **Auto-posts ledger: D 2100 / C 1000-or-1010.**

**Expenses**
- `GET /api/v1/pms/expense-categories`
- `GET /api/v1/pms/expenses?from=&to=`
- `POST /api/v1/pms/expenses` — **auto-posts ledger: D 5xxx category-mapped / C cash-or-bank.**
- `PUT /api/v1/pms/expenses/:id/approve`
- `DELETE /api/v1/pms/expenses/:id` — **reverses ledger.**

**Accounting**
- `GET /api/v1/pms/chart-of-accounts`
- `GET /api/v1/pms/ledger?from=&to=&accountId=` — entries + P&L summary (income / expense / asset / liability nets)
- `GET /api/v1/pms/trial-balance?from=&to=` — debit / credit / balance per account + grand totals (with balanced check)
- `GET /api/v1/pms/gst-summary?from=&to=` — output GST (folio_payments.meta), input GST (expenses.gst_amount), net payable, carry-forward
- `POST /api/v1/pms/journal` — manual journal voucher (any N lines, balanced)
- `DELETE /api/v1/pms/journal/:refId` — reverse a manual JV
- `POST /api/v1/pms/ledger/booking-revenue` — internal hook used by folio-payments and external services

**ERP dashboard**
- `GET /api/v1/pms/erp/dashboard` — KPIs (active employees, payroll paid, revenue closed, net profit, pending leaves, unapproved expenses, expenses by group)

**Daily statement**
- `GET /api/v1/pms/daily-statement?date=` — live OR closed snapshot from bookings, folio_payments, expenses, rooms, pods.
- `POST /api/v1/pms/daily-statement/close` — locks the day
- `GET /api/v1/pms/daily-statement/history?limit=`

### Admin side — `services/admin-service/src/erp-rollup.ts`
- `GET /api/v1/admin/erp/rollup?from=&to=` — per-partner P&L joining daily_statements + expenses + salary_payments + employee counts
- `GET / POST /api/v1/admin/erp/hq-employees`, `PUT /:id`, salary-structure, attendance endpoints (partner_id IS NULL bucket — HQ payroll)
- `GET / POST /api/v1/admin/erp/hq-expenses`, `PUT /:id/approve`, `DELETE /:id`
- `GET /api/v1/admin/erp/expense-categories` — proxy

### Auto-ledger hooks now wired
- Expense create / delete (`/expenses`) → posts/reverses debit-expense, credit-cash/bank
- Salary generate (`/salary-payments/generate`) → posts accrual debit 5010, credit 2100
- Salary mark-paid (`PUT /salary-payments/:id`, status='paid') → reverses accrual line, posts debit 2100, credit cash/bank
- **Folio payment (`POST /folios/:id/payments`) → posts debit cash/bank/upi, credit 4000 (room) or 4010 (pod/hourly)** — live booking-revenue auto-ledger.
- Manual JV (`POST /journal`) → posts arbitrary lines after balance check (debit total = credit total, > 0)

### Role gating
Gateway at `services/api-gateway` enforces:
- segment `pms` → role `partner` (owner) or staff with appropriate scope. Front-desk role cannot post manual JVs.
- segment `admin` → roles `admin` or `super_admin`. Partner tokens → 403.

## Frontend pages

### Partner portal (`apps/web/src/app/partner/portal/*`)
| Route | What it does |
|---|---|
| `/employees` | List + add/edit employees with bank/UPI/PAN/KYC/emergency |
| `/attendance` | Click-to-mark daily attendance grid; 4 KPI tiles |
| `/salary` | Auto-generate payslips for any month; mark paid; print payslip HTML in new tab |
| `/expenses` | Add expenses with category/vendor/invoice/GST; group summary; date-range filter |
| `/accounting` | **Tabs:** Ledger (with per-account drill-down) · Trial balance (debit/credit/balance + balanced check) · GST summary cards. Manual journal-voucher modal with live balance counter. |
| `/statement` | End-of-day report; Close-day button locks the day. |

### Admin portal (`apps/web/src/app/admin/erp/*`)
| Route | What it does |
|---|---|
| `/admin/erp` | Cross-partner ERP roll-up dashboard: date-range KPIs, per-partner P&L table, expenses-by-group bar chart |
| `/admin/erp/hq-employees` | HQ headcount with full employee fields |
| `/admin/erp/hq-expenses` | HQ expense log with summary cards |

## How it ties together end-to-end
1. Owner adds employees → assigns salary structure
2. Daily, front desk marks attendance
3. End of month, owner clicks "Generate" → payslips auto-compute (`gross × paid_days/days_in_month + OT − PF − ESI − PT = net`) and the accrual is **automatically posted** to the ledger (D 5010 / C 2100).
4. When paid, the accrual is reversed and a payment entry posted (D 2100 / C cash/bank). The general ledger always stays balanced.
5. Throughout the day, expenses logged with vendor + invoice + GST → **auto-posts** D 5xxx / C cash/bank.
6. Front desk records folio payments → **auto-posts** D cash/bank / C 4000-or-4010, so room/pod revenue flows straight into the ledger.
7. F&B / service charges that bypass the folio flow can be ledgerised via the **manual journal voucher** screen or by calling `/ledger/booking-revenue`.
8. `/accounting` → Ledger tab to inspect every entry, Trial balance tab to verify books are balanced, GST tab to see net payable.
9. `/statement` → live computed P&L; "Close day" locks it.
10. Admin sees the consolidated picture across all partners under `/admin/erp` and runs HQ payroll/expenses under `/admin/erp/hq-*`.

## Smoke verifications (most recent run)
- Expense ₹1416 with category `utilities_electricity` + paymentMode `upi` → ledger entries posted `5030 Dr=1416 / 1010 Cr=1416`. Delete → ledger entries removed. ✓
- Salary `generate` for a period → `5010 / 2100` rows present, equal totals. ✓
- Salary mark-paid → 2100 debited, 1000/1010 credited; trial balance still balanced. ✓
- Manual JV with 3 lines (e.g. 1010=1000 Dr, 5099=400 Dr, 1000=1400 Cr) → posted with single `ref_id`. Reverse via DELETE clears all 3. ✓
- Partner JWT on `/admin/erp/rollup` → 403 *"Admin access required"*. ✓
- Web build green; pm2 ids: `naploo-pms` (id 32), `naploo-admin-service` (id 30), `naploo-api-gateway` (id 19).

## Pending / next steps
- **PDF payslip download** (HTML print works today).
- **Bank reconciliation** screen (statement upload + matching).
- **Investor distributions** linked to ledger (debit 3000 sub-account, credit 1010).
- **Multi-currency** for cross-border bookings.
- **TDS auto-calculation** on contractor/vendor expenses.
- **Bookings without folios** (rare hourly walk-ins paid outside folio flow) — currently require manual JV; could add a direct payment-to-ledger button on the booking page.
