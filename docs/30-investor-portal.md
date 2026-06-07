# Investor Web Portal — `/investor/portal/*`

Built: June 2026

## Routes
- `/investor/portal/login` — OTP login (auto-skips if already authenticated)
- `/investor/portal` — Dashboard (enrollment CTA OR KPIs + active investments)
- `/investor/portal/investments` — All investments + new investment modal
- `/investor/portal/earnings` — Booking-level earnings feed (gross / investor share)
- `/investor/portal/payouts` — Monthly settlement info
- `/investor/portal/agreements` — Signed contracts (enrollment, 3× guarantee, leaseback, scrap)
- `/investor/portal/profile` — Account + KYC status

## API surface used (via gateway)
- `GET  /api/v1/investors/me` — { enrolled, investor, investments[] }
- `POST /api/v1/investors/enroll` — { investor }
- `POST /api/v1/investors/invest` — { investment }
- `GET  /api/v1/investors/investments/:id/earnings` — { earnings[] }

## Theme
Emerald + teal gradient (distinct from partner portal which is primary/violet).

## Navbar wiring
`/components/layout/Navbar.tsx` — dropdown "Investor Dashboard" + mobile menu now point to `/investor/portal` (was `/investor`, which is the marketing/Buy Pods calculator page).

## Files
- `apps/web/src/app/investor/portal/layout.tsx` — force-dynamic
- `apps/web/src/app/investor/portal/_lib/InvestorShell.tsx` — sidebar shell
- `apps/web/src/app/investor/portal/_lib/api.ts` — typed investorApi client
- `apps/web/src/app/investor/portal/{login,investments,earnings,payouts,agreements,profile}/page.tsx`
- `apps/web/src/app/investor/portal/page.tsx` — Dashboard

## Pending
- Real KYC document upload UI (currently directs to email)
- Real PDF agreement files (currently shows placeholders)
- Investor mobile app (apps/investor — Expo) — Task #3
