-- Naploo ERP layer — initial schema + seed data.
-- Idempotent: every CREATE uses IF NOT EXISTS. Re-runnable safely.
-- Last verified live: 2026-06-08
--
-- Order matters because of foreign keys:
--   employees → salary_structures → salary_payments / attendance_logs / leave_requests
--   expense_categories → expenses
--   chart_of_accounts → ledger_entries
--   daily_statements stands alone (per partner+date)

-- ─── EMPLOYEES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  emp_code character varying(20),
  full_name character varying(160) NOT NULL,
  gender character varying(10),
  dob date,
  phone character varying(40),
  email character varying(160),
  address text,
  city character varying(80),
  state character varying(80),
  pincode character varying(20),
  designation character varying(120),
  department character varying(80),
  joined_at date,
  exited_at date,
  employment_type character varying(20) DEFAULT 'full_time',
  status character varying(20) DEFAULT 'active',
  pan character varying(20),
  aadhaar_last4 character varying(8),
  bank_account character varying(40),
  bank_ifsc character varying(20),
  upi character varying(80),
  emergency_name character varying(120),
  emergency_phone character varying(40),
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_partner_emp_code_key UNIQUE (partner_id, emp_code)
);
CREATE INDEX IF NOT EXISTS employees_partner_idx ON public.employees(partner_id, status);

-- ─── SALARY STRUCTURES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  effective_from date NOT NULL,
  basic numeric(12,2) DEFAULT 0,
  hra numeric(12,2) DEFAULT 0,
  conveyance numeric(12,2) DEFAULT 0,
  medical numeric(12,2) DEFAULT 0,
  special numeric(12,2) DEFAULT 0,
  other_allow numeric(12,2) DEFAULT 0,
  pf_percent numeric(5,2) DEFAULT 12,
  esi_percent numeric(5,2) DEFAULT 0.75,
  professional_tax numeric(8,2) DEFAULT 200,
  gross_monthly numeric(12,2) GENERATED ALWAYS AS
    (basic + hra + conveyance + medical + special + other_allow) STORED,
  status character varying(20) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT salary_structures_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS salary_structures_emp_idx ON public.salary_structures(employee_id, status, effective_from DESC);

-- ─── ATTENDANCE LOGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status character varying(20) DEFAULT 'present',
  hours_worked numeric(5,2),
  overtime_hrs numeric(5,2) DEFAULT 0,
  notes text,
  source character varying(20) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_logs_employee_date_key UNIQUE (employee_id, date)
);

-- ─── LEAVE REQUESTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  kind character varying(20) DEFAULT 'casual',
  from_date date NOT NULL,
  to_date date NOT NULL,
  days numeric(4,1) NOT NULL,
  reason text,
  status character varying(20) DEFAULT 'pending',
  approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT leave_requests_pkey PRIMARY KEY (id)
);

-- ─── SALARY PAYMENTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.salary_payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  pay_period character varying(7) NOT NULL,    -- YYYY-MM
  days_worked integer DEFAULT 0,
  days_paid integer DEFAULT 0,
  basic numeric(12,2) DEFAULT 0,
  hra numeric(12,2) DEFAULT 0,
  allowances numeric(12,2) DEFAULT 0,
  overtime_pay numeric(12,2) DEFAULT 0,
  bonus numeric(12,2) DEFAULT 0,
  gross numeric(12,2) NOT NULL DEFAULT 0,
  pf_deducted numeric(12,2) DEFAULT 0,
  esi_deducted numeric(12,2) DEFAULT 0,
  tax_deducted numeric(12,2) DEFAULT 0,
  pt_deducted numeric(12,2) DEFAULT 0,
  loan_deducted numeric(12,2) DEFAULT 0,
  other_deduct numeric(12,2) DEFAULT 0,
  net_pay numeric(12,2) NOT NULL DEFAULT 0,
  status character varying(20) DEFAULT 'draft',
  paid_at timestamptz,
  payment_mode character varying(20),
  payment_ref character varying(120),
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT salary_payments_pkey PRIMARY KEY (id),
  CONSTRAINT salary_payments_emp_period_key UNIQUE (employee_id, pay_period)
);
CREATE INDEX IF NOT EXISTS salary_payments_partner_period_idx ON public.salary_payments(partner_id, pay_period);

-- ─── EXPENSE CATEGORIES (global, seeded once) ────────────────
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  slug character varying(40) NOT NULL UNIQUE,
  name character varying(120) NOT NULL,
  group_name character varying(40),  -- cogs / opex / capex / finance
  description text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT expense_categories_pkey PRIMARY KEY (id)
);

INSERT INTO public.expense_categories (slug, name, group_name) VALUES
  -- COGS
  ('groceries', 'Groceries / kitchen supplies', 'cogs'),
  ('vegetables', 'Vegetables / fruits / dairy', 'cogs'),
  ('meat_fish', 'Meat / fish / poultry', 'cogs'),
  ('beverages', 'Beverages / bar stock', 'cogs'),
  ('housekeeping_supplies', 'Housekeeping supplies', 'cogs'),
  ('toiletries', 'Toiletries / consumables', 'cogs'),
  ('linen_uniform', 'Linen / uniform', 'cogs'),
  -- OpEx
  ('salaries', 'Salaries & wages', 'opex'),
  ('rent', 'Rent / lease', 'opex'),
  ('utilities_electricity', 'Electricity', 'opex'),
  ('utilities_water', 'Water', 'opex'),
  ('utilities_gas', 'Gas / fuel', 'opex'),
  ('utilities_internet', 'Internet / phone', 'opex'),
  ('repairs', 'Repairs & maintenance', 'opex'),
  ('cleaning', 'Cleaning / pest control', 'opex'),
  ('security', 'Security service', 'opex'),
  ('marketing', 'Marketing / ads', 'opex'),
  ('ota_commission', 'OTA commissions', 'opex'),
  ('software_subscription', 'Software subscriptions', 'opex'),
  ('legal_professional', 'Legal / accounting fees', 'opex'),
  ('insurance', 'Insurance', 'opex'),
  ('travel_fuel', 'Travel / fuel', 'opex'),
  ('printing_stationery', 'Printing / stationery', 'opex'),
  ('contractor', 'Contractor / outsourced', 'opex'),
  ('other', 'Other / misc', 'opex'),
  -- CapEx
  ('furniture_equipment', 'Furniture / equipment', 'capex'),
  ('renovation', 'Renovation', 'capex'),
  -- Finance
  ('bank_charges', 'Bank charges / interest', 'finance'),
  ('gst_input', 'GST input credit', 'finance'),
  ('tds_paid', 'TDS paid', 'finance')
ON CONFLICT (slug) DO NOTHING;

-- ─── EXPENSES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  expense_date date DEFAULT CURRENT_DATE NOT NULL,
  description character varying(300) NOT NULL,
  amount numeric(12,2) NOT NULL,
  gst_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) GENERATED ALWAYS AS (amount + COALESCE(gst_amount, 0)) STORED,
  payment_mode character varying(20) DEFAULT 'cash',
  vendor_name character varying(160),
  invoice_no character varying(80),
  receipt_url text,
  paid_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  status character varying(20) DEFAULT 'recorded',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS expenses_partner_date_idx ON public.expenses(partner_id, expense_date DESC);

-- ─── CHART OF ACCOUNTS (global seed + per-partner overrides) ─
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  code character varying(20) NOT NULL,
  name character varying(160) NOT NULL,
  type character varying(20) NOT NULL, -- asset / liability / equity / income / expense
  parent_id uuid REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT chart_of_accounts_partner_code_key UNIQUE (partner_id, code)
);

INSERT INTO public.chart_of_accounts (code, name, type, partner_id) VALUES
  -- Assets
  ('1000', 'Cash in hand', 'asset', NULL),
  ('1010', 'Bank account', 'asset', NULL),
  ('1020', 'Accounts receivable', 'asset', NULL),
  ('1100', 'Inventory', 'asset', NULL),
  ('1200', 'Furniture & equipment', 'asset', NULL),
  -- Liabilities
  ('2000', 'Accounts payable', 'liability', NULL),
  ('2010', 'GST payable', 'liability', NULL),
  ('2020', 'TDS payable', 'liability', NULL),
  ('2100', 'Salaries payable', 'liability', NULL),
  -- Equity
  ('3000', 'Owner equity', 'equity', NULL),
  -- Income
  ('4000', 'Room revenue', 'income', NULL),
  ('4010', 'Pod revenue', 'income', NULL),
  ('4020', 'F&B revenue', 'income', NULL),
  ('4030', 'Services revenue', 'income', NULL),
  -- Expense
  ('5000', 'Cost of goods sold', 'expense', NULL),
  ('5010', 'Salaries & wages', 'expense', NULL),
  ('5020', 'Rent', 'expense', NULL),
  ('5030', 'Utilities', 'expense', NULL),
  ('5040', 'Marketing', 'expense', NULL),
  ('5050', 'Repairs & maintenance', 'expense', NULL),
  ('5060', 'OTA commissions', 'expense', NULL),
  ('5099', 'Other expenses', 'expense', NULL)
ON CONFLICT (partner_id, code) DO NOTHING;

-- ─── LEDGER ENTRIES (double-entry; ref to source row) ────────
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  entry_date date DEFAULT CURRENT_DATE NOT NULL,
  ref_type character varying(40),    -- expense / salary_payment / booking / manual / day_close
  ref_id uuid,
  description text,
  account_id uuid REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  debit numeric(12,2) DEFAULT 0,
  credit numeric(12,2) DEFAULT 0,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT ledger_entries_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS ledger_entries_partner_date_idx ON public.ledger_entries(partner_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS ledger_entries_ref_idx ON public.ledger_entries(ref_type, ref_id);

-- ─── DAILY STATEMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_statements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  room_revenue numeric(12,2) DEFAULT 0,
  pod_revenue numeric(12,2) DEFAULT 0,
  fnb_revenue numeric(12,2) DEFAULT 0,
  services_revenue numeric(12,2) DEFAULT 0,
  other_revenue numeric(12,2) DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0,
  rooms_total integer DEFAULT 0,
  rooms_occupied integer DEFAULT 0,
  occupancy_pct numeric(5,2) DEFAULT 0,
  pods_total integer DEFAULT 0,
  pods_occupied integer DEFAULT 0,
  bookings_total integer DEFAULT 0,
  arrivals integer DEFAULT 0,
  departures integer DEFAULT 0,
  walk_ins integer DEFAULT 0,
  cancellations integer DEFAULT 0,
  cash_collected numeric(12,2) DEFAULT 0,
  card_collected numeric(12,2) DEFAULT 0,
  upi_collected numeric(12,2) DEFAULT 0,
  bank_collected numeric(12,2) DEFAULT 0,
  total_collected numeric(12,2) DEFAULT 0,
  total_expenses numeric(12,2) DEFAULT 0,
  cash_paid numeric(12,2) DEFAULT 0,
  cash_in_hand numeric(12,2) DEFAULT 0,
  net_profit numeric(12,2) DEFAULT 0,
  closed_at timestamptz,
  closed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT daily_statements_pkey PRIMARY KEY (id),
  CONSTRAINT daily_statements_partner_date_key UNIQUE (partner_id, statement_date)
);
