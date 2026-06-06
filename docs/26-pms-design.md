
---

# Naploo PMS — Full Design Doc (June 2026)

> **Goal:** Match every QloApps PMS feature in our Bun/Elysia/Drizzle/Next stack, **plus** hourly pod booking (our differentiator). Single codebase, single partner login. Lives under `/partner/portal/*`.
>
> **Decisions locked (2026-06-07):** Option A (build native). OTA integration deferred to Phase 2. 3 roles: Owner / Manager / Front-desk. Full PMS scope including F&B POS.

## 1. Feature parity map (QloApps → Naploo PMS)

| QloApps feature | Naploo PMS equivalent | Phase |
|-----------------|------------------------|-------|
| Hotel website + booking engine | ✅ Already done — naploo.com customer site + Razorpay | — |
| Room type / inventory mgmt | ✅ Already done in `/partner/portal/inventory` | — |
| Multi-room booking | Walk-in form supports multiple rooms in one folio | 1 |
| Walk-in booking | NEW `/partner/portal/walk-in` | 1 |
| Front-desk operations | NEW `/partner/portal/front-desk` | 2 |
| Folio / billing | NEW `/partner/portal/folio/[bookingId]` | 3 |
| Multi-payment methods | cash · UPI · card · Razorpay · wallet · bank transfer | 3 |
| Invoice + tax-compliant receipt | NEW PDF generator | 3 |
| Multi-staff with roles | NEW `/partner/portal/staff` | 4 |
| Housekeeping module | NEW `/partner/portal/housekeeping` (room status board) | 5 |
| Reservation calendar grid | NEW `/partner/portal/calendar` (room × date timeline) | 6 |
| Rate plans (corporate, weekend, OTA) | NEW `/partner/portal/rates` (multipliers + restrictions) | 7 |
| Advanced pricing rules (per-day, per-month, per-room-type, occupancy-based) | NEW `rate_plans` + `rate_overrides` | 7 |
| Minimum / maximum length of stay | Restriction on rate plan | 7 |
| Bed type configuration (single, double, twin, king) | Extend `rooms.bed_type` (already enum) | 7 |
| F&B POS / restaurant menu | NEW `/partner/portal/pos/*` | 8 |
| Extra services & facilities (laundry, spa, taxi) | NEW `services` + `service_charges` | 8 |
| Tour & package add-ons | NEW `packages` (room + services bundle) | 8 |
| Custom guest fields | NEW `guest_profiles` (KYC: ID type, passport, GST for corporate) | 8 |
| Tax configuration (GST 12/18%, service charge, cess) | NEW `taxes_config` | 9 |
| Operations Today dashboard | NEW `/partner/portal/today` (arrivals, departures, in-house, dues) | 2 |
| Reports (occupancy, ARR, revenue, tax) | NEW `/partner/portal/reports/*` | 10 |
| Reallocation / room change | "Move" button on folio | 5 |
| Booking restrictions (check-in only on certain days) | Per rate plan | 7 |
| Multi-property switching | Already in schema (partner.userId is owner; staff can be linked to multiple partners) | 4 |
| Multi-language storefront | Already done — Next.js i18n can be added later | — |
| Multi-currency | Single INR for now; schema ready (`currency` col on payments) | — |
| Loyalty program | Naploo's referral system already covers this | — |
| Channel Manager (OTA sync) | **Phase 2** — Channex.io or direct OTA APIs | Phase 2 |
| Auto-upgrade addon | NPM/git workflow handles this | — |
| Add-ons marketplace | Out of scope — Naploo is end-to-end product | — |
| **Hourly pod booking** | ✅ **Already done** (NOT in QloApps — our USP) | — |

## 2. Role permission matrix

| Action | Owner | Manager | Front-desk |
|--------|-------|---------|------------|
| Login + dashboard | ✅ | ✅ | ✅ |
| View bookings list | ✅ | ✅ | ✅ |
| Create walk-in booking | ✅ | ✅ | ✅ |
| Check-in / check-out | ✅ | ✅ | ✅ |
| Add folio charge (room service / F&B / extras) | ✅ | ✅ | ✅ |
| Take payment + receipt | ✅ | ✅ | ✅ |
| Generate invoice PDF | ✅ | ✅ | ✅ |
| Move guest to another room | ✅ | ✅ | ✅ |
| Update housekeeping status | ✅ | ✅ | ✅ |
| Edit room/pod inventory + pricing | ✅ | ✅ | ❌ |
| Manage rate plans | ✅ | ✅ | ❌ |
| Manage menu items + outlets | ✅ | ✅ | ❌ |
| Manage extra services + packages | ✅ | ✅ | ❌ |
| Invite/remove staff | ✅ | ❌ | ❌ |
| Configure taxes | ✅ | ❌ | ❌ |
| View revenue / earnings / payouts | ✅ | ❌ | ❌ |
| Refund / void invoice | ✅ | ❌ | ❌ |
| Cancel checked-in booking | ✅ | ✅ | ❌ |

## 3. New DB tables (Drizzle migration coming next)

```ts
// Staff & roles
staff (id, partner_id, user_id, role: 'owner'|'manager'|'front_desk',
       status, invited_by, invited_at, accepted_at, created_at, updated_at)

// Pricing
rate_plans (id, partner_id, name, kind: 'standard'|'corporate'|'weekend'|'ota'|'long_stay',
            base_multiplier numeric(5,3), min_nights, max_nights,
            valid_from, valid_to, applies_to_room_types jsonb,
            block_check_in_days int[],     // [0=Sun, 6=Sat]
            is_active, created_at, updated_at)

rate_overrides (id, rate_plan_id, room_id?, pod_set_id?, day date, price numeric(10,2))

// Housekeeping
room_status (id, partner_id, target_kind: 'room'|'pod', target_id,
             status: 'vacant_clean'|'vacant_dirty'|'occupied'|'inspected'|'out_of_order'|'maintenance',
             note, updated_by, updated_at)

// Folio / billing
folios (id, booking_id, partner_id, customer_id,
        status: 'open'|'closed'|'void', opened_at, closed_at,
        total_charges, total_payments, balance,
        invoice_id?, created_at, updated_at)

folio_charges (id, folio_id, kind: 'room'|'pod'|'service'|'fnb'|'extra_guest'|'tax'|'discount'|'adjustment',
               description, qty int, unit_price numeric(10,2), amount numeric(10,2),
               source_kind?: 'table_order'|'service_order'|'manual', source_id?,
               taxable bool, added_by, created_at)

folio_payments (id, folio_id, method: 'cash'|'card'|'upi'|'razorpay'|'wallet'|'bank_transfer',
                amount, reference, taken_by, created_at)

// Services & extras
services (id, partner_id, name, kind: 'extra_bed'|'breakfast'|'laundry'|'spa'|'taxi'|'tour'|'other',
          price, taxable, is_per_night, is_per_person, is_active)

packages (id, partner_id, name, description,
          included_services jsonb,   // [{service_id, qty}]
          included_room_count int, price, valid_from, valid_to, is_active)

service_orders (id, folio_id, service_id, qty, unit_price, amount, taken_by, created_at)

// F&B POS
outlets (id, partner_id, name, kind: 'restaurant'|'bar'|'spa'|'laundry', is_active)
menu_categories (id, outlet_id, name, sort_order)
menu_items (id, outlet_id, category_id, name, description, price, taxable, is_available, image)
table_orders (id, outlet_id, partner_id, table_no, folio_id?,   // null for walk-in dining
              status: 'open'|'sent_to_kitchen'|'closed'|'void',
              total_charges, paid_amount, opened_by, opened_at, closed_at)
table_order_items (id, table_order_id, menu_item_id, qty, unit_price, amount, note,
                   status: 'pending'|'preparing'|'ready'|'served'|'void')

// Taxes
taxes_config (id, partner_id, name, kind: 'gst'|'service'|'cess'|'tcs',
              percent, applies_to: 'room'|'fnb'|'service'|'all',
              hsn_code?, is_inclusive, is_active)

// Invoices
invoices (id, folio_id, invoice_number unique, issued_at,
          gross_amount, tax_amount, net_amount,
          customer_id?, customer_gst_number?, partner_id,
          pdf_url, status: 'draft'|'issued'|'cancelled'|'refunded',
          created_at)

// Guest profiles (KYC)
guest_profiles (id, user_id unique, full_name, dob,
                id_proof_kind?: 'aadhar'|'passport'|'driving_licence'|'voter_id',
                id_proof_number?, id_proof_image?,
                company_name?, company_gst?, company_address?,
                created_at, updated_at)
```

## 4. Backend service layout

Extend existing services (no new microservices needed for PMS):

- **hotel-service** gains: rooms/pods status + rate plans + services + packages + outlets/menu CRUD
- **booking-service** gains: walk-in booking endpoint, room change/reallocation, folio operations
- **payment-service** gains: multi-method payment recording (cash/UPI/etc., not just Razorpay)
- **NEW pms-service** (port 3012): folio + POS + invoice PDF generation + reports

## 5. Screens (`/partner/portal/*`)

```
/partner/portal/
├── login                          (existing)
├── /                              Dashboard — already exists, add today's KPIs
├── /today                         NEW — operations: arrivals, departures, in-house, dues
├── /inventory                     (existing) Rooms + pod sets
├── /calendar                      NEW — room × date timeline grid
├── /walk-in                       NEW — front-desk booking form
├── /bookings                      (existing) Bookings list
├── /bookings/[id]                 NEW — booking detail (links to folio)
├── /folio/[bookingId]             NEW — folio: charges, payments, balance, actions
├── /housekeeping                  NEW — room/pod status board
├── /pos                           NEW — outlet picker
│   ├── /[outletId]                NEW — table layout
│   └── /[outletId]/order/[id]     NEW — order editor (add menu items, charge to room)
├── /services                      NEW — extra services + packages CRUD
├── /menu                          NEW — outlets + menu items CRUD
├── /rates                         NEW — rate plans editor (calendar view + multipliers)
├── /taxes                         NEW — tax configuration
├── /staff                         NEW — invite/manage staff (Owner only)
├── /reports                       NEW — landing
│   ├── /occupancy                 NEW
│   ├── /revenue                   NEW (daily/weekly/monthly P&L)
│   ├── /tax                       NEW (GST filing helper)
│   └── /forecast                  NEW (next 30 days expected occupancy)
└── /earnings                      (existing) Naploo's share / payouts
```

## 6. Build order (this & next sessions)

| # | Feature | Why this order | Est. session size |
|---|---------|----------------|-------------------|
| **1** | **Walk-in booking** (this session continues here) | Highest daily use, smallest scope | ½ day |
| 2 | Folio: charges, multi-payment, invoice PDF | Closes the financial loop | 1 day |
| 3 | Today's operations + front-desk view | Daily ops hub | ½ day |
| 4 | Staff + role enforcement (gateway-side) | Before letting real staff in | ½ day |
| 5 | Housekeeping board | Daily ops | ½ day |
| 6 | Reservation calendar grid | Visual planning | 1 day |
| 7 | Rate plans + restrictions | Dynamic pricing | 1 day |
| 8 | Services & packages | Extras layer | ½ day |
| 9 | F&B POS (outlets + menu + table orders + charge-to-room) | Restaurant ops | 2 days |
| 10 | Taxes + GST-compliant invoice | India compliance | 1 day |
| 11 | Reports (occupancy, revenue, tax, forecast) | BI | 1 day |
| 12 | **Phase 2** — Channel Manager (Channex.io or direct OTA APIs) | Multi-channel distribution | 3-5 days |

**Total core PMS: ~10-11 days.** Channel Manager Phase 2 separately.

## 7. Acceptance criteria — feature 1 (walk-in booking, this session)

When a logged-in partner staff opens `/partner/portal/walk-in` and:
1. Picks date(s) + time + an available room or pod
2. Enters guest name + phone (email + ID optional)
3. Selects payment method (cash/UPI/card/Razorpay link/pay later)
4. Clicks "Confirm walk-in"

The system MUST:
- Create/upsert a `users` row keyed by phone (`role=customer`, `status=active`, no password) — guest can claim later via OTP
- Create a `bookings` row with `status=confirmed`, source flagged as `walk_in`
- Create a `folios` row (open) with one `folio_charges` row for the room/pod base rate + a `folio_charges` row for tax
- If payment is cash/UPI/card → create `folio_payments` row, set balance=0
- If "Razorpay link" → SMS the guest the URL `/api/v1/payments/checkout/:bookingId`
- If "pay later" → leave folio open with positive balance
- Show booking-confirmed screen with booking number, folio link, and PDF receipt

## 8. Out of scope (deliberately deferred)

- Inventory/stock for F&B (assume kitchen runs its own stock spreadsheet)
- Spa appointment scheduling (just charge on folio)
- HR/payroll
- Accounting GL export (CSV export later, no Tally/Zoho integration in v1)
- Multi-currency (single INR for v1)
- Multi-language storefront (already feasible via Next.js i18n, not in PMS scope)

---

*This doc is the source of truth. Will be updated after each PMS phase ships.*
