
---

# PMS — Session 2 progress (2026-06-07 evening)

## ✅ Now live on naploo.com

### Partner web portal PMS pages (8 new)
- `/partner/portal/walk-in` — 4-step front-desk booking form (pick unit → stay details → guest → payment), 7 payment methods, live bill preview, success screen with open-folio jump
- `/partner/portal/today` — KPI dashboard (arrivals/departures/in-house/open folios/dues), quick check-in/out actions, open-folio list
- `/partner/portal/folio/[id]` — charges + payments tables, add-charge modal, take-payment modal (6 methods), checkout-&-invoice modal with auto-generated invoice number
- `/partner/portal/settings` — property tier picker (9 types: homestay → 5-star → pod hotel → service apartment), 13 toggleable modules, default check-in/out times. Owner only.
- `/partner/portal/staff` — list staff with roles + status, invite modal (3 roles), suspend/reactivate. Owner only.
- `/partner/portal/taxes` — GST/service/cess/TCS config, HSN code, inclusive/exclusive flag. Owner only.
- `/partner/portal/services` — extras CRUD card grid (laundry/breakfast/spa/taxi/tour/minibar), per-night/per-person flags. Manager+.
- `/partner/portal/housekeeping` — visual board with 6 status colors, click cell to change status, summary counts.

### Tier-aware sidebar
The `PortalShell` now calls `GET /api/v1/pms/me/config` on mount and hides:
- **Module items** (housekeeping, F&B POS, services, rate plans, reports, channel manager) based on `featuresEnabled.modules.*`
- **Owner-only items** (earnings, reports, staff, taxes, settings) for managers/front-desk
- Header shows `Tier label • Role` (e.g., "4-star Premium • owner")

So Hotel Grand Imperial (premium_4_star) sees the full sidebar including F&B POS + spa + corporate rates + reports; Comfy Home Stay (homestay tier) sees a minimal sidebar with only walk-in, bookings, inventory, today.

### API client
`/partner/portal/_lib/pms-api.ts` is a typed client for all PMS endpoints with `isModuleEnabled()` helper and `formatMoney()` (handles ₹/Cr/L formatting).

## Verified
- All 8 new routes return 200
- Backend end-to-end (walk-in → charge → payment → invoice) tested earlier this session
- Tier-aware sidebar tested — manager-role staff cannot see Settings/Staff/Taxes/Earnings/Reports

## Pushed to GitHub
- Branch: `feature/backend-and-web-wiring`
- URL: https://github.com/obidua/Naploo/tree/feature/backend-and-web-wiring
- Latest commits visible there

## ⏭ Still to build (PMS phases 7-11)
- `/partner/portal/calendar` — room × date timeline grid (drag to book/extend)
- `/partner/portal/rates` — rate plans editor (multipliers + calendar overrides)
- `/partner/portal/pos/*` — F&B POS (outlet picker, table layout, menu, order editor, charge-to-room)
- `/partner/portal/menu` — menu items CRUD
- `/partner/portal/reports/*` — occupancy, revenue, tax, forecast charts
- Invoice PDF generator (HTML→PDF via Puppeteer in pms-service)
- First-login wizard (tier picker shown automatically when `wizard_completed=false`)
- Partner mobile app — front-desk + POS surfaces

## Pending other (from earlier tasklist)
- Investor notifications on confirmed bookings (item #32)
- Public Sync API for OTAs / Channel Manager (Phase 2 — item #31)
- Investor mobile app (item #22)

## Test credentials
- **Partner web portal:** https://naploo.com/partner/portal/login → `rajesh@hotelgrand.com` / `Partner@Naploo2026`
- **Admin:** https://naploo.com/admin → `admin@naploo.com` / `Naploo@Admin2026`

## GitHub token usage
Token `<TOKEN>` was used to push this session. **Revoke or rotate it** at https://github.com/settings/tokens after this session.
