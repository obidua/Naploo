
---

# Naploo PMS — Session checkpoint (2026-06-07)

## ✅ Done this session (PMS backend layer)

### Tier-aware design
- New `partners.tier` column: `homestay / hostel / budget_1_star / mid_2_star / standard_3_star / premium_4_star / luxury_5_star / pod_hotel / service_apartment`
- New `partners.features_enabled` JSONB — per-partner module flags
- Auto-applied tier defaults to existing 8 partners:
  - Hotel Grand Imperial → **premium_4_star** (F&B POS + spa + corporate rates + reports ON)
  - Budget Stay Express → **budget_1_star** (only essentials ON)
  - Comfy Home Stay / Sea View / Hill Station → **homestay** (minimal)
  - Travel Hub / Airport Inn / Urban Rest → **standard_3_star**

### 18 new DB tables
staff · rate_plans · rate_overrides · housekeeping_status · folios · folio_charges · folio_payments · services · packages · service_orders · outlets · menu_categories · menu_items · table_orders · table_order_items · taxes_config · invoices · guest_profiles

Plus `bookings.source` enum (`online / walk_in / phone / ota / admin`).

Default seeded: GST 12% (rooms) + GST 5% (F&B) tax rows for every existing partner; owner staff rows for the 8 partner owners.

### New microservice: `pms-service` (:3012)
Routed via gateway as `/api/v1/pms/*` (partner role).

| Endpoint | Purpose |
|----------|---------|
| `GET /me/config` | Returns tier + featuresEnabled + check-in/out times + role |
| `PATCH /me/config` | Owner edits tier / modules / times |
| `POST /walk-in` | **THE core PMS action.** Upserts guest, books room/pod, opens folio, charges, optional payment + auto check-in |
| `GET /folios/:id` | Folio with all charges + payments |
| `POST /folios/:id/charges` | Add F&B / service / extra / discount |
| `POST /folios/:id/payments` | Multi-method payment (cash/card/UPI/Razorpay/wallet/bank) |
| `POST /folios/:id/checkout` | Close folio + auto-generate invoice + mark booking checked-out |
| `GET /today` | Operations dashboard: arrivals · departures · in-house · open folios · dues |
| `POST /bookings/:id/check-in / check-out` | Status transitions |
| `GET /housekeeping/board`, `POST /housekeeping/status` | Room/pod status board |
| `GET /staff`, `POST /staff/invite`, `PATCH /staff/:id` | Staff mgmt (owner-only invite) |
| `GET /taxes`, `POST /taxes` | Tax config (owner-only) |
| `GET /services`, `POST /services` | Extras (manager+) |

**End-to-end verified:** walk-in booking ₹8,023 → cash partial ₹7,000 → F&B charge → laundry → UPI ₹850 → checkout → invoice HOT-2026-7706 (gross ₹8,014, tax ₹859, net ₹8,874). Booking auto-transitioned to checked_out, folio closed.

## ⏭ Next: PMS UI phases

| # | Feature | Status |
|---|---------|--------|
| **1a** | Walk-in booking — **backend ✅** | DONE this session |
| 1b | Walk-in booking — **partner web UI** at `/partner/portal/walk-in` | Next session |
| 2 | `/partner/portal/today` (arrivals/departures/in-house/dues board) | Next |
| 3 | `/partner/portal/folio/[bookingId]` UI (charges + payments + checkout) | Next |
| 4 | Tier-aware sidebar — show only modules that `featuresEnabled` allows | Next |
| 5 | First-login wizard (tier picker + feature toggles) | Next |
| 6 | `/partner/portal/housekeeping` board UI | + |
| 7 | `/partner/portal/calendar` (room × date timeline) | + |
| 8 | `/partner/portal/rates` (rate plans editor + calendar overrides) | + |
| 9 | `/partner/portal/menu` (outlets + menu items CRUD) | + |
| 10 | `/partner/portal/pos/*` (F&B POS — table layout, orders, charge-to-room) | + |
| 11 | `/partner/portal/services` + `/packages` CRUD | + |
| 12 | `/partner/portal/taxes` | + |
| 13 | `/partner/portal/staff` (owner-only invite UI) | + |
| 14 | `/partner/portal/reports/*` (occupancy + revenue + tax + forecast) | + |
| 15 | Invoice PDF generator (HTML→PDF via Puppeteer or Bun's HTMLRewriter) | + |
| 16 | Partner mobile app — front-desk + POS surfaces | + |
| 17 | **Phase 2:** Public Sync API for OTAs | Later |
| 18 | Investor notifications on confirmed bookings | Pending |

## Test credentials
- **Partner web portal:** `https://naploo.com/partner/portal/login` → `rajesh@hotelgrand.com` / `Partner@Naploo2026` (Hotel Grand Imperial, premium_4_star tier)
- **Admin:** `admin@naploo.com` / `Naploo@Admin2026`

## How tier affects the UI
After login, partner app calls `GET /api/v1/pms/me/config`. The returned `featuresEnabled.modules.*` flags drive:
- Sidebar items rendered (e.g., F&B POS link hidden for homestays)
- Available payment methods (e.g., Razorpay always on, card only if `card_pos` true)
- Tax options (homestays default to GST-exempt preset, mid+ get GST rates)
- Dashboard widgets (5-star sees occupancy/ARR charts, 1-star sees only "today's bookings")

This single source of truth means **one codebase, infinite hotel types** — no fork, no separate apps.
