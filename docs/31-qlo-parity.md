# QloApps Feature Parity — June 2026

## New tables (migration: `qlo-parity-migration.sql`)
- `promotions` — partner-scoped discount codes
- `coupons` — global admin coupons
- `reviews` — guest reviews (1-5 + sub-scores), partner reply
- `refunds` — refund requests + lifecycle
- `support_tickets` — customer/partner tickets, priority, assignment
- `hotel_images` — gallery (cover, category, sort order)
- `cms_pages` — admin-managed content pages
- `notifications_log` — sent SMS/email/push audit trail

## Backend extensions

### Partner (mounted at `/api/v1/pms/*`)
File: `services/pms-service/src/qlo-parity.ts`
- `GET/POST/PUT/DELETE /promotions`
- `GET /reviews`, `POST /reviews/:id/reply`
- `GET/POST/DELETE /gallery`, `POST /gallery/:id/cover`
- `GET /customers` (derived from bookings + users + pods → pod_sets)

### Admin (mounted at `/api/v1/admin/*`)
File: `services/admin-service/src/qlo-parity.ts`
- `GET/POST/PUT/DELETE /coupons`
- `GET/POST/PUT /refunds`
- `GET/PUT /reviews` (moderation)
- `GET/POST/PUT /tickets`
- `GET/POST/DELETE /cms`
- `GET /notifications-log`

## New partner portal pages (`apps/web/src/app/partner/portal/`)
- `customers/` — sortable guest list, lifetime spend, repeat-count badge
- `promotions/` — discount codes with create/pause/delete modal
- `reviews/` — guest review feed with reply box, rating summary card
- `gallery/` — image grid by category, cover toggle, upload modal

## Admin sidebar wiring (`apps/web/src/app/admin/data.ts`)
Previously stubbed → now live:
- Coupons (`mockCoupons` from `/api/v1/admin/coupons`)
- Tickets (`mockTickets` from `/api/v1/admin/tickets`)
- Reviews (`mockReviews` from `/api/v1/admin/reviews`)
- Refunds (data fetched, UI binding pending)

## Sidebar additions
`apps/web/src/app/partner/portal/_lib/PortalShell.tsx` — 4 new items inserted after Rate plans:
Customers · Promotions · Reviews · Gallery

## Smoke tested ✓
All 11 endpoints return 200 via gateway with valid JWT.
All 4 new partner pages render at HTTP 200.

## Still pending (P2)
- Email templates editor
- Multi-currency localization
- File-upload pipe for gallery (currently URL-paste only)
- Investor mobile app (Task #3)
- First-login wizard (Task #2)
