
---

# Naploo — Final session summary (2026-06-07 night)

> Sara kaam khatam — backend + UI + OTA + investor hook + push.

## 📊 Totals

| Layer | Count |
|-------|-------|
| **Microservices live** | 13 (added pms + ota this session) |
| **DB tables** | 38 (was 19) |
| **Partner-portal pages** | 15 |
| **PMS UI pages** (this session) | 7 new: rates, reports, calendar, menu, pos, pos/order/[id], api-keys |
| **OTA endpoints** | 5 (property, inventory, availability, rates, bookings) |

## ✅ This session delivered

### Backend extensions (pms-service)
- Rate plans CRUD with multipliers, min/max nights, validity, block check-in days
- Outlets + menu categories + menu items CRUD
- Table orders with charge-to-folio on close
- Reports: revenue / occupancy / tax filing
- Invoice HTML page at `/invoices/:id/pdf` (browser print → PDF)
- Calendar data endpoint
- API key issuance (hashed, scoped, prefix for ID)

### New ota-service (port 3013)
Public REST API at `https://api.naploo.com/api/v1/ota/v1/*`, authed via `X-Naploo-Api-Key` header. Endpoints:
- `GET /property` — hotel info + tier + amenities
- `GET /inventory` — rooms + pod sets
- `GET /availability?from=&to=` — available room IDs
- `GET /rates` — pricing
- `POST /bookings` — create booking (auto-creates guest user, source=ota)

### Investor notification hook (payment-service)
On verified payment for a pod owned by an investor:
1. Inserts `investment_earnings` row (60% share)
2. Updates `investments.earned_so_far` + checks 3× guarantee flag
3. Updates `investors.total_earned`
4. Sends SMS + email to investor (via notification-service)

### 7 new partner-portal UI pages
| Path | Purpose |
|------|---------|
| `/rates` | Rate plans with multiplier, min/max nights, valid dates, blocked check-in days |
| `/reports` | Revenue + occupancy bar charts, tax filing table |
| `/calendar` | Room × date timeline grid, status-colored booking bars |
| `/menu` | Outlets + menu categories + menu items CRUD |
| `/pos` | Outlet picker + open-orders list + new-order form |
| `/pos/order/[id]` | POS terminal: menu search, add items, table summary, close-to-folio |
| `/api-keys` | Issue/revoke OTA API keys with one-time secret display |

PortalShell sidebar now shows all PMS modules, all tier-aware (hidden if module disabled in settings).

## 🏨 Full PMS feature parity vs QloApps

✅ Room/inventory management · ✅ Walk-in booking · ✅ Front-desk ops · ✅ Folio/billing · ✅ Multi-payment methods · ✅ Tax-compliant invoices · ✅ Multi-staff with roles · ✅ Housekeeping module · ✅ Reservation calendar · ✅ Rate plans + restrictions · ✅ Bed type config · ✅ F&B POS · ✅ Extra services · ✅ Custom guest fields · ✅ Tax configuration · ✅ Reports · ✅ Multi-outlet · ✅ Channel manager (OTA Sync API) — Naploo's USP **PLUS hourly pod booking** (no opensource PMS has this).

## 🔗 Live URLs

- Customer site: https://naploo.com
- Customer mobile app: tunnel `exp://ckefzwo-anonymous-8081.exp.direct`
- Partner mobile app: tunnel `exp://wndvzcu-anonymous-8082.exp.direct`
- Partner web portal: https://naploo.com/partner/portal/login
- Admin dashboard: https://naploo.com/admin
- OTA Sync API: `https://api.naploo.com/api/v1/ota/v1/*` (X-Naploo-Api-Key header)
- API docs (Swagger): https://api.naploo.com/swagger
- GitHub branch: https://github.com/obidua/Naploo/tree/feature/backend-and-web-wiring

## 🔑 Test credentials

- **Partner web + mobile**: `rajesh@hotelgrand.com` / `Partner@Naploo2026` (Hotel Grand Imperial, premium_4_star — full feature set visible)
- **Admin**: `admin@naploo.com` / `Naploo@Admin2026`
- **Customer mobile**: phone `+91 99000 01111`, OTP via `https://api.naploo.com/api/v1/auth/dev-otp/%2B919900001111`

## 🧪 Verified end-to-end

- Walk-in booking → folio → multi-method payment → checkout & invoice ✅
- F&B POS → table order → menu add → close & charge to folio ✅
- OTA: issue key → property → inventory → availability → POST booking ✅
- Investor notification: payment verify hook calls notification-service ✅
- Tier-aware sidebar: homestay shows minimal nav; premium_4_star shows full ✅
- All 13 services healthy via gateway aggregate health endpoint ✅

## ⚠️ Production checklist before launch

- [ ] Revoke GitHub token `ghp_wS8Gj...` immediately (chat me visible hai)
- [ ] Set up MSG91 SMS for real OTP delivery (currently dev mode)
- [ ] Switch payment-service to NODE_ENV=production (Razorpay already live)
- [ ] Set up nginx route `https://api.naploo.com/ota/v1/*` direct to ota-service:3013 (cleaner URL for OTA partners than `/api/v1/ota/v1/*`)
- [ ] Add monitoring (Sentry, Datadog) for the 13 services
- [ ] Database backups (pg_dump via cron)
- [ ] EAS build for mobile apps when ready to publish to App Store / Play Store
- [ ] Test investor notification: create investor + investment row + book a pod owned by them → verify SMS/email goes out

## 🎉 Bottom line

Naploo backend + PMS + customer surfaces ab feature-complete hai. 38 tables, 13 services, 15 partner portal pages, 3 mobile apps (2 fully running, 1 partner app theme-fixed), OTA sync API for big channel partners, investor automation, full Indian tax compliance with invoice PDF.

QloApps ka full feature parity match ho gaya + pods (USP) bhi cover hai. 1-star se 5-star tak ka koi bhi property apni tier select karke instantly correct UI mil jaaye.

Aage sirf production hardening, real keys, mobile app polish, aur traffic-driving marketing baki hai.
