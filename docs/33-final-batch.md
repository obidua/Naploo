# Final batch — tier gating, amenities, wizard, investor mobile app

June 8, 2026

## 1. Tier-based module gating
- New table `tier_definitions` — 9 tiers (homestay -> luxury_5_star -> service_apartment -> pod_hotel) each with `allowed_modules` JSONB
- New endpoint `GET /api/v1/pms/tiers` returns the catalog
- `/partner/portal/settings` now fetches the partner's tier on mount and on tier-change, then disables module checkboxes that aren't in the tier's allowed list (with "upgrade tier" badge)
- Save filters out blocked modules server-side and client-side

## 2. Amenities catalog (property + room level)
- New tables: `amenities_catalog` (74 curated amenities across 9 categories), `property_amenities`, `room_amenities`
- Endpoints:
  - `GET /api/v1/pms/amenities-catalog` — master list
  - `GET/PUT /api/v1/pms/property-amenities` — partner's selected
  - `GET/PUT /api/v1/pms/rooms/:id/amenities` — per-room
- New partner sidebar page `/partner/portal/amenities` — grouped by category with toggle buttons

## 3. First-login wizard
- Trigger: `partners.features_enabled.wizard_completed === false || undefined`
- 5-step modal: Welcome -> Tier picker -> Modules (pre-checked by tier) -> Amenities (pre-checked from tier defaults) -> Check-in/out times
- On finish: saves config + amenities, sets `wizard_completed: true`
- Loads automatically from `PortalShell` on every partner login until completed

## 4. Investor mobile app (`apps/investor`)
- Scaffolded as 3rd Expo app (parallel to apps/mobile + apps/partner)
- Stack:
  - `expo@~52`, `expo-router@~4`, `react-native@0.76` (copied from partner config)
  - `@expo/vector-icons` for icons (lucide-react-native not available)
- Screens:
  - `(auth)/login` - 2-step OTP login
  - `(tabs)/dashboard` - KPIs, enroll CTA, recent investments
  - `(tabs)/offers` - browse + respond to admin offers (modal with set count + delivery + GST preview)
  - `(tabs)/investments` - active investments + 3x progress bars
  - `(tabs)/earnings` - per-booking earnings feed + lifetime total
  - `(tabs)/profile` - account info, KYC status, logout
- Reuses existing investor backend endpoints
- TypeScript passes with 0 errors

## Server-side
- New migration `qlo3-migration.sql` ran successfully
- pms-service got new file `qlo3.ts` wired via `registerQlo3()`
- 9 tiers + 74 amenities seeded

## Smoke test results (HTTP 200)
- `/partner/portal/amenities`
- `/partner/portal/settings` (with tier gating UI)
- `/admin/offers`, `/admin/team`
- `/investor/portal/offers`
- Investor mobile: `tsc --noEmit` passes

## Files touched
**Backend**
- `services/pms-service/src/qlo3.ts` (new)
- `services/pms-service/src/index.ts` (wire qlo3)

**Web**
- `apps/web/src/app/partner/portal/amenities/page.tsx` (new)
- `apps/web/src/app/partner/portal/settings/page.tsx` (tier gating injected)
- `apps/web/src/app/partner/portal/_lib/OnboardingWizard.tsx` (new)
- `apps/web/src/app/partner/portal/_lib/PortalShell.tsx` (wizard mount + Amenities NAV)

**Mobile (new app)**
- `apps/investor/package.json`, `app.json`, `babel/metro/tsconfig`
- `apps/investor/app/_layout.tsx`
- `apps/investor/app/(auth)/login.tsx`
- `apps/investor/app/(tabs)/_layout.tsx`
- `apps/investor/app/(tabs)/{dashboard,offers,investments,earnings,profile}.tsx`
- `apps/investor/src/api.ts`

**Migration**
- `qlo3-migration.sql` (already executed)
