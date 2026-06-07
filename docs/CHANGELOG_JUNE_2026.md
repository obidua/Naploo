# Naploo — June 2026 Engineering Update

> **Date:** June 6, 2026  
> **Scope:** Customer-facing website (`apps/web`) + platform-wide port hardening  
> **Out of scope (handled by user via Claude / other tools):** mobile apps (`apps/mobile`), partner app (`apps/partner`), admin panel, backend microservice implementation beyond what was already live  
> **Status:** ✅ Code complete · ✅ Production build clean (32/32 routes) · ✅ Smoke-tested on `127.0.0.1:3110`

---

## 1. High-level summary

This update did three things:

1. **Locked every Naploo port to loopback (`127.0.0.1`)** so nothing on the platform is reachable from the public internet except through Nginx + Cloudflare.
2. **Built an OYO-style customer booking journey** on the website: search → property detail → checkout → confirmation → "My Bookings".
3. **Resolved a pre-existing Next.js 14 + React 19 build break** that was preventing clean production deploys, by pinning the web app to React 18.3.1 across the workspace.

The platform is now in a state where the customer can complete an end-to-end booking flow on the web (with a local mock booking store), and the production server can be built and run without errors on a hardened, loopback-only network surface.

---

## 2. Phase 1 — Port hardening (security)

### Goal
Make sure no Naploo app or service is listening on a public IP. Public traffic must enter only through Nginx (which Cloudflare fronts).

### Changes

**`/home/awsclint/Naploo/.env`** — added bind-host variables for every service:

```env
BIND_HOST=127.0.0.1
HOSTNAME=127.0.0.1
API_GATEWAY_HOST=127.0.0.1
AUTH_SERVICE_HOST=127.0.0.1
BOOKING_SERVICE_HOST=127.0.0.1
PAYMENT_SERVICE_HOST=127.0.0.1
INVESTOR_SERVICE_HOST=127.0.0.1
REFERRAL_SERVICE_HOST=127.0.0.1
RENTAL_SERVICE_HOST=127.0.0.1
HOTEL_SERVICE_HOST=127.0.0.1
NOTIFICATION_SERVICE_HOST=127.0.0.1
ANALYTICS_SERVICE_HOST=127.0.0.1
SEARCH_SERVICE_HOST=127.0.0.1
```

**`/home/awsclint/Naploo/packages/db/package.json`** — Drizzle Studio script:

```diff
- "studio": "drizzle-kit studio"
+ "studio": "drizzle-kit studio --host 127.0.0.1 --port 4983"
```

(Default Drizzle Studio binds to `0.0.0.0`. The flag forces loopback.)

### Verification

```bash
ss -tlnp 2>/dev/null | grep -E ':(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|3100|3101|3102|3103|3104|3105|4983)\b'
```

Every listed socket shows `127.0.0.1:<port>`. Confirmed live:

| Port | Service | Bind |
|------|---------|------|
| 3000 | api-gateway | `127.0.0.1` |
| 3001 | auth-service | `127.0.0.1` |
| 3008 | notification-service (mock dev) | `127.0.0.1` |
| 3100 | naploo-web (systemd) | `127.0.0.1` |
| 3110 | naploo-web (manual prod test) | `127.0.0.1` |

Public exposure remains only via Nginx (80/443) → Cloudflare.

---

## 3. Phase 2 — Customer-facing website rebuild (apps/web)

### Goal
Bring the website up to OYO/Booking.com level for the **customer** journey: discover, filter, view, book, and review past bookings. Keep partner/admin/mobile out of scope (user is handling those separately).

### 3.1 New data layer

**`apps/web/src/data/rooms.ts`** (NEW)

- Exports `Room` interface, a flat `rooms[]` array, and helpers `getRoomsByPropertyId`, `getRoomById`.
- Internal `makeRooms(propertyId, type, basePrice)` synthesizes 2 rooms for homestays (`standard`, `premium`) and 3 for hotels (`standard`, `deluxe`, `premium`) with multipliers `1.0 / 1.4 / 2.0`.
- Each room carries: bed config, square footage, amenity list, free-cancellation + breakfast flags, gallery, and base/total pricing.

**`apps/web/src/data/search.ts`** (NEW)

- `SearchParams` type with `mode: 'pods' | 'rooms'`, `location`, dates, guest counts, type filter, price range, amenity filter, and `sortBy`.
- `searchProperties(params)` and `searchPods(params)` — pure filter + sort, no I/O.
- "Recommended" sort score = `rating * log10(reviews + 10)` so high-rated, well-reviewed properties bubble up.
- `getSuggestions(query)` returns city + property name suggestions for autocomplete.
- `POPULAR_CITIES` constant powers the trending-cities chips when the search input is empty.

### 3.2 New booking store

**`apps/web/src/store/bookings.ts`** (NEW)

- Zustand store persisted to `localStorage` under key `naploo-bookings`.
- `Booking` interface: discriminated union by `kind: 'pod' | 'room'`, with status (`pending | confirmed | cancelled | completed`), full pricing breakdown (subtotal, discount, taxes, total), guest details, and a human-readable `bookingCode`.
- `generateBookingCode()` → format `NP######` (uppercase, omits confusable `I`, `O`, `0`, `1`).
- `computeTaxes(subtotal)` → flat 12% GST.
- Actions: `addBooking`, `cancelBooking`, `getBookingById`, `clear`.
- Acts as a mock backend until `services/booking-service` is implemented.

### 3.3 New search experience

**`apps/web/src/components/search/SearchBar.tsx`** (NEW)

- Client component with two visual variants:
  - `variant="hero"` — large rounded-3xl, shadow-2xl, used on home page below the hero
  - `variant="compact"` — rounded-2xl, used as sticky header on `/search`
- Mode toggle (Hourly Pods / Nightly Rooms) re-skins the controls:
  - Pods → date + start time + duration (1, 2, 3, 4, 6, 8, 12 hrs) with `POD_MULTIPLIERS = {1:1, 2:1.8, 3:2.5, 4:3.2, 6:4.5, 8:5.5, 12:7}`
  - Rooms → check-in + check-out date pickers
- Location input with autocomplete dropdown (powered by `getSuggestions`).
- Internal `Stepper` subcomponent for guests / rooms / children.
- Uses `useRouter` + `useSearchParams` for shareable URLs.
- ⚠️ When placed on a statically rendered page (`/`), the consumer must wrap it in `<Suspense>` because of `useSearchParams` requirements in Next 14 App Router.

**`apps/web/src/app/search/page.tsx`** + **`SearchPageClient.tsx`** (NEW)

- `export const dynamic = 'force-dynamic'` (always SSR).
- Sticky compact `SearchBar` header.
- Filter sidebar on desktop; bottom sheet on mobile.
- Results render as property cards: image, type badge (hotel = blue gradient / homestay = pink gradient), rating pill, top-3 amenity chips, mode-aware "from ₹X / hr" or "₹Y / night" pricing.
- `FilterPanel` (inline component) — property type, price range slider (₹0–1000 for pods, ₹0–10000 for rooms), amenity chips.
- Each card links to `/property/[id]?mode=...&checkIn=...&checkOut=...&guests=...` preserving query.

### 3.4 Property detail page

**`apps/web/src/app/property/[id]/page.tsx`** + **`PropertyPageClient.tsx`** (NEW)

- Breadcrumb (Home / Search / Property name).
- Image gallery: 1 large hero + 4 thumbnails.
- About section + amenity grid.
- Tabs: **Rooms** and **Sleeping Pods**.
- Sticky right-rail booking sidebar with a `Field` helper component for date/time/guest entry.
- **Room cards** — bed config, sq ft, amenities, free-cancellation + breakfast badges, "Reserve" button.
- **Pod cards** — series name, computed `total = basePrice × duration multiplier`, "Book Pod" button.
- Click handlers `bookRoom(room)` and `bookPod(pod)` push to `/booking/checkout?kind=...&propertyId=...&itemId=...&...` carrying all booking parameters.

### 3.5 Checkout

**`apps/web/src/app/booking/checkout/page.tsx`** + **`CheckoutClient.tsx`** (NEW)

- Reads booking parameters from URL.
- Guest details form (name, phone, email).
- Payment method radio: Razorpay / UPI / Cash on Delivery.
- Coupon input with two built-in codes:
  - `WELCOME10` → 10% off
  - `NAPLOO50` → flat ₹50 off
- Live pricing breakdown: subtotal → discount → 12% GST → total.
- `handlePay()`:
  1. Validates name + phone.
  2. If `!isAuthenticated`, redirects to `/login?next=<current url>` so the user returns to checkout after OTP login.
  3. Simulates payment with a 900 ms delay.
  4. Calls `useBookingsStore.addBooking()` with a generated booking ID `BK-${Date.now().toString(36).toUpperCase()}`.
  5. Navigates to `/booking/confirmation/${bookingId}`.

### 3.6 Confirmation

**`apps/web/src/app/booking/confirmation/[id]/page.tsx`** (NEW)

- Branded success banner.
- Large booking code display with copy-to-clipboard button.
- Item image + property name + dates + guests.
- Full pricing summary.
- Conditional tip block:
  - Pods → "Use the OTP at the pod door to unlock your capsule".
  - Rooms → "Show your booking code at reception during check-in".
- Actions: "View my bookings" (→ `/profile/bookings`) and "Save receipt" (window.print).

### 3.7 My Bookings

**`apps/web/src/app/profile/bookings/page.tsx`** (NEW)

- Auth-gated via `useAuthStore`. If logged out, redirects to login with `next` param.
- Two sections:
  - **Upcoming** — bookings with status `confirmed` or `pending`.
  - **Past & cancelled** — `completed` or `cancelled`.
- Each card has a status badge, image, dates, total, and a "Cancel booking" action with confirm dialog (only shown for upcoming bookings).
- Empty state with "Find a stay" CTA → `/search`.

### 3.8 Navbar refactor

**`apps/web/src/components/layout/Navbar.tsx`** (MODIFIED)

- Removed local `User` interface and `localStorage.getItem('naploo_user')` reading — now sources user state from `useAuthStore`.
- Display name = `[user.firstName, user.lastName].filter(Boolean).join(' ')`.
- "Explore Stays" nav link: `/pods` → **`/search`**.
- Both desktop dropdown and mobile menu "My Bookings" link → **`/profile/bookings`**.
- `handleLogout()` calls `logout()` from the auth store.

### 3.9 Home page integration

**`apps/web/src/app/page.tsx`** (MODIFIED)

- Imported `Suspense` and `SearchBar`.
- Added a new section after the hero (with `-mt-10 sm:-mt-16` to overlap the hero edge):
  ```tsx
  <Suspense fallback={...}>
    <SearchBar variant="hero" />
  </Suspense>
  ```
- Trending-cities chips below the SearchBar link directly to `/search?location=<city>`.
- "Find Pods Near You" CTA → `/search`.
- "View All Properties" CTA → `/search`.
- Partner property cards now link to `/property/${id}` (was `/pods/${id}`).

### 3.10 Legacy redirect

**`apps/web/src/app/pods/[id]/page.tsx`** (REWRITTEN)

Was 508 lines of bespoke pod detail UI. Now 5 lines:

```tsx
import { redirect } from 'next/navigation';

export default function LegacyPodPage({ params }: { params: { id: string } }) {
  redirect(`/property/${params.id}`);
}
```

This guarantees old shared links keep working and `/property/[id]` is the single canonical detail page.

### 3.11 App Router system pages

- **`apps/web/src/app/not-found.tsx`** (NEW) — branded 404 with links to home and `/search`.
- **`apps/web/src/app/error.tsx`** (NEW) — App Router global error boundary with "Try again" + "Go home".

---

## 4. Phase 3 — Build break fix (Next 14 + React 19 incompatibility)

### Symptom

`next build` failed during static generation of the legacy `/_error` page (which Next still emits even when an App Router `not-found.tsx` exists):

```
TypeError: Cannot read properties of null (reading 'useRef')
    at exports.useRef (.../next/node_modules/react/cjs/react.production.min.js)
    at .../next-server/pages.runtime.prod.js
Error occurred prerendering page "/404"
Error occurred prerendering page "/500"
```

### Root cause

- `next@14.2.35` declares `react@^18.2.0` / `react-dom@^18.2.0` as **peer** dependencies.
- `apps/web/package.json` had `react@^19.2.1` / `react-dom@^19.2.1`.
- Bun's hoisting placed React 19 at the workspace root, but Next 14's bundled legacy renderer in `next-server/pages.runtime.prod.js` is built against React 18's hook dispatcher and breaks under React 19.
- Adding `not-found.tsx` and `error.tsx` did **not** suppress the legacy `_error` prerender — the only stable fix is to align React versions.

### Fix

Pin the web app and the workspace root to React 18.3.1 (latest security-patched 18.x), let mobile/partner Expo apps keep React 19 in their own contexts.

**`apps/web/package.json`** (MODIFIED):

```diff
- "react": "^19.2.1",
- "react-dom": "^19.2.1",
+ "react": "^18.3.1",
+ "react-dom": "^18.3.1",
...
- "@types/react": "^19.0.0",
- "@types/react-dom": "^19.0.0",
+ "@types/react": "^18.3.12",
+ "@types/react-dom": "^18.3.1",
```

**`/home/awsclint/Naploo/package.json`** (MODIFIED) — added root overrides so Bun, npm, and Yarn all dedupe to a single React 18 copy:

```json
"overrides": {
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@types/react": "18.3.12",
  "@types/react-dom": "18.3.1"
},
"resolutions": {
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@types/react": "18.3.12",
  "@types/react-dom": "18.3.1"
}
```

Then full reinstall:

```bash
cd /home/awsclint/Naploo
rm -rf node_modules apps/*/node_modules packages/*/node_modules services/*/node_modules bun.lock
bun install
```

### Verification

```bash
find /home/awsclint/Naploo -path '*/node_modules/react/package.json' -not -path '*/canary-full/*' -exec grep version {} \;
# all → 18.3.1
```

`next build`:

```
✓ Compiled successfully
✓ Generating static pages (32/32)
Route (app)                              Size     First Load JS
┌ ○ /                                    9.48 kB         125 kB
├ ƒ /search                              3.42 kB         119 kB
├ ƒ /property/[id]                       5.19 kB         117 kB
├ ƒ /booking/checkout                    6.07 kB         111 kB
├ ƒ /booking/confirmation/[id]           4 kB            106 kB
├ ○ /profile/bookings                    4.21 kB         113 kB
└ … (32 routes total, exit 0)
```

### Smoke test (production server on 127.0.0.1:3110)

```bash
cd apps/web && HOSTNAME=127.0.0.1 npx next start -H 127.0.0.1 -p 3110
```

| Route | HTTP |
|---|---|
| `/` | 200 (SearchBar hero present) |
| `/search` | 200 (filter sidebar + listings) |
| `/search?mode=rooms&location=Manali` | 200 |
| `/property/1` | 200 (gallery + tabs) |
| `/property/1?mode=pods` | 200 |
| `/pods/1` | 307 → `/property/1` |
| `/booking/checkout` | 200 |
| `/profile/bookings` | 200 |
| `/not-a-real-page` | 404 (custom not-found.tsx) |

---

## 5. Files touched

### New files (apps/web)

| Path | Purpose |
|------|---------|
| `src/data/rooms.ts` | Room inventory layer |
| `src/data/search.ts` | Search filter/sort + suggestions |
| `src/store/bookings.ts` | Persisted Zustand booking store |
| `src/components/search/SearchBar.tsx` | Hero + compact search bar |
| `src/app/search/page.tsx` | Server entry for /search |
| `src/app/search/SearchPageClient.tsx` | Client UI for /search |
| `src/app/property/[id]/page.tsx` | Server entry for property detail |
| `src/app/property/[id]/PropertyPageClient.tsx` | Tabbed property UI |
| `src/app/booking/checkout/page.tsx` | Server entry for checkout |
| `src/app/booking/checkout/CheckoutClient.tsx` | Checkout form + payment flow |
| `src/app/booking/confirmation/[id]/page.tsx` | Confirmation screen |
| `src/app/profile/bookings/page.tsx` | My Bookings list + cancel |
| `src/app/not-found.tsx` | App Router 404 |
| `src/app/error.tsx` | App Router error boundary |

### Modified files

| Path | Change |
|------|--------|
| `apps/web/src/app/page.tsx` | Added Suspense + SearchBar hero, retargeted CTAs to `/search` and `/property/[id]` |
| `apps/web/src/app/pods/[id]/page.tsx` | Replaced 508-line legacy detail page with redirect to `/property/[id]` |
| `apps/web/src/components/layout/Navbar.tsx` | Switched user state from localStorage to `useAuthStore`, retargeted nav links |
| `apps/web/package.json` | React + react-dom + @types pinned to 18.3.x |
| `package.json` (root) | Added `overrides` + `resolutions` for React 18.3.1 |
| `packages/db/package.json` | Drizzle Studio bound to `127.0.0.1:4983` |
| `.env` | Added `BIND_HOST`, `HOSTNAME`, and 11 `*_HOST=127.0.0.1` entries |

### Updated docs

| Path | Change |
|------|--------|
| `docs/PROJECT_DOCUMENTATION.md` | v4.2.0; status now lists 32 routes; new "Customer Booking Flow" rows; React 18.3.1 rationale; expanded route + tree |
| `docs/DEPLOYMENT_GUIDE.md` | React 18 in stack; new "Port Binding & Network Hardening" section; `.env` example shows bind-host vars |
| `docs/DESIGN_SYSTEM.md` | Implemented Components table extended with SearchBar, FilterPanel, property tabs, CheckoutClient, Confirmation, My Bookings |

---

## 6. Architecture diagrams

### 6.1 Customer booking flow

```
+-------------+      +----------+      +----------------+      +----------------+      +-----------------------+      +--------------------+
|   Home /    | ───▶ |  /search | ───▶ | /property/[id] | ───▶ | /booking/      | ───▶ | /booking/             | ───▶ | /profile/bookings  |
|  hero CTA   |      |          |      |                |      | checkout       |      | confirmation/[id]     |      |                    |
+-------------+      +----------+      +----------------+      +----------------+      +-----------------------+      +--------------------+
       |                  ▲                    ▲                       │                                                       ▲
       └─ SearchBar ──────┘     URL params preserve mode +              │                                                       │
                                date + guests across the flow          ▼                                                       │
                                                              redirect to /login?next=…                                         │
                                                              if not authenticated  ──── after OTP success returns ─────────────┘
```

### 6.2 Network surface

```
              Cloudflare (DNS, WAF, CDN)
                       │
                       ▼
                ┌────────────┐
                │   Nginx    │  ← only public listener (ports 80/443)
                │  + Let's   │
                │  Encrypt   │
                └────┬───────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   127.0.0.1     127.0.0.1     127.0.0.1
     :3100         :3000         :3001
   naploo-web    api-gateway   auth-service
   (Next 14 +     (Elysia)      (Elysia)
    React 18)
```

All other ports (3002–3010, 3101–3105, 4983, PostgreSQL, Redis) bind to `127.0.0.1` only and are only reached internally over the loopback interface.

---

## 7. Things deliberately NOT changed

- **`apps/mobile`, `apps/partner`** — the user is iterating on these via Claude. Their `react@19.0.0` and `react-dom@19.0.0` deps are untouched; the workspace root override only affects what the web app's bundler resolves. Expo manages its own React copy via Metro.
- **Backend microservices beyond `api-gateway` + `auth-service`** — booking, payment, investor, referral, rental, hotel, notification, analytics, search remain empty directories. The new web flow uses the Zustand bookings store as a stand-in.
- **Real payment integration** — `CheckoutClient` simulates Razorpay/UPI/COD with a `setTimeout`. Wiring real Razorpay requires the booking + payment services to exist.
- **Property images** — both pod and room cards reuse images under `Pods_Images/`. Real hotel photography can be swapped in later by extending the `properties[]` and `rooms[]` data sources.
- **Reviews, wishlist, map view** — explicit non-goals for this round. Easy to add against the existing data layer later.

---

## 8. Operational notes

### Running the production build locally

```bash
cd /home/awsclint/Naploo/apps/web
rm -rf .next
npx next build
HOSTNAME=127.0.0.1 npx next start -H 127.0.0.1 -p 3110
```

(Use `3110` to avoid conflicting with the systemd-managed `naploo-web` on `3100`.)

### Restarting the systemd-managed instance after a build

```bash
cd /home/awsclint/Naploo/apps/web && bun run build
sudo systemctl restart naploo-web
sudo systemctl status naploo-web
ss -tlnp | grep :3100   # must show 127.0.0.1:3100
```

### If the React 19 nested copy ever returns

Bun occasionally hoists a transitive `react@19.x` under `node_modules/next/node_modules/react/`. Symptom is the same `Cannot read properties of null (reading 'useRef')` build error.

Cure:

```bash
cd /home/awsclint/Naploo
rm -rf node_modules apps/*/node_modules packages/*/node_modules services/*/node_modules bun.lock
bun install
find . -path '*/node_modules/react/package.json' -not -path '*/canary-full/*' -exec grep version {} \;
# every line must report 18.3.1 — the root overrides+resolutions enforce this
```

---

## 9. Suggested next steps (for whoever picks this up)

1. **Wire the real booking-service** (`services/booking-service`) and replace `useBookingsStore.addBooking()` calls in `CheckoutClient` with a `bookingsApi.create(...)` call.
2. **Razorpay integration** in the same checkout handler.
3. **Reviews + wishlist** on `/property/[id]` — both are pure additions on top of the existing data layer.
4. **Map view** on `/search` using Google Maps (already listed as planned in `PROJECT_DOCUMENTATION.md` §4.1).
5. **Migrate web to Next.js 15** when partner/mobile are ready to share React 19; at that point the root overrides can be dropped.
6. **Production env hygiene** — `NODE_ENV=production`, rotate JWT secrets, switch `APP_URL` / `API_URL` to `https://naploo.com` / `https://api.naploo.com`.

---

*End of June 2026 engineering update.*


---

# Naploo — June 7, 2026 Engineering Update (Backend Engine + Web Wiring)

> **Date:** June 7, 2026
> **Author:** Claude (full-stack wiring session over SSH)
> **Scope:** Built the entire customer-facing backend (5 microservices + gateway rewrite) and wired the customer **website** to it end-to-end.
> **Status:** ✅ Backend live under PM2 · ✅ Web build clean (34 routes) · ✅ Full booking journey verified through public `api.naploo.com`
> **Relationship to the June 6 update:** That update built the OYO-style web *UI* on a local mock store and explicitly listed "wire the real booking-service" + "Razorpay integration" as next steps. This update delivers exactly that — the mock store is gone; the UI now runs on real APIs.

---

## 1. Backend microservices — from 2 to 7

Before today only `api-gateway` and `auth-service` had code; the other 9 service folders were empty. Built **5 new Elysia services** (the customer-critical ones) and rewrote the gateway. All run under PM2 via `ecosystem.config.cjs` (absolute Bun path `/home/awsclint/.bun/bin/bun`, 7 processes).

> **Runtime note:** Pinned Bun to **1.2.16** (`~/.bun/bin/bun`). Bun 1.3.14 breaks Elysia 1.4 / `@sinclair/typebox` 0.34 with `export 'TypeSystemPolicy' not found`. A clean `bun install` was run; React 18.3.1 web pin (root `overrides`/`resolutions`) was preserved and verified (single react copy @ 18.3.1).

### 1.1 hotel-service (`:3007`)
Hotels (partners), rooms, and pod inventory + partner management.
- `GET /hotels?city=&type=` — active hotels with summary (room/pod counts, min rates).
- `GET /hotels/:id` — full detail incl. `rooms[]` and `podSets[]` (each pod set with its pods + features).
- `GET /hotels/:id/rooms`, `GET /hotels/:id/pods`, `GET /rooms/:id`, `GET /pod-sets/:id`.
- **Partner management:** `POST /hotels/:id/rooms`, `PATCH /rooms/:id`, `POST /hotels/:id/pod-sets` (auto-creates the 2 stacked pods), `PATCH /pod-sets/:id` — supports adding listings and updating pricing.
- Defensive JSON parsing for `amenities`/`images` columns (seeded as JSON strings inside jsonb).

### 1.2 search-service (`:3010`)
- `GET /search?q=&city=&type=&hasPods=&hasRooms=&minPrice=&maxPrice=&sort=` — query/filter with `rating × log10(reviews)` recommended sort.
- `GET /nearby?lat=&lng=&radius=` — geolocation discovery via **haversine** distance, sorted nearest-first.
- `GET /cities` — distinct active cities with hotel counts.

### 1.3 booking-service (`:3002`) — the core
- **Availability (no double-booking):** `GET /availability/room` and `GET /availability/pod-set` (finds a free pod within a set) using time-overlap detection against active bookings.
- **Pricing:** `POST /quote` — authoritative price (used by the web checkout). Pods = `hourlyRate × hours`; rooms = `dailyRate × nights` (+ extra-guest charge). GST 12% (pods, rooms ≤ ₹7500) / 18% (rooms > ₹7500). Revenue split stored on every booking: **pods 60% owner / 40% Naploo**, **rooms ~82% hotel / 18% Naploo**.
- **Bookings:** `POST /bookings` (locks a specific free pod or confirms the room, generates `NPL…` booking number, status `pending`), `GET /bookings?userId=`, `GET /bookings/:id`, `GET /partner/:partnerId/bookings`.
- **Lifecycle:** `POST /bookings/:id/cancel | confirm | check-in | check-out`.
- All list/detail responses are **enriched** with the unit (room/pod) and hotel context.
- Verified: a 2-pod set accepts 2 concurrent bookings for the same slot and rejects the 3rd (409).

### 1.4 payment-service (`:3003`) — Razorpay (test)
- `POST /payments/create-order` (Razorpay REST, amount in paise, records a `payments` row), `POST /payments/verify` (HMAC-SHA256 signature check → marks payment completed → **auto-confirms the booking** `pending→confirmed`), `POST /payments/webhook` (signature-verified `payment.captured`), `POST /payments/:id/refund`, `GET /payments/:id`, `GET /payments`.
- **MOCK mode** when `RAZORPAY_KEY_ID/SECRET` are absent: returns a mock order and accepts verification so the full flow works pre-keys. Drop real keys in `.env` to go live — no code change.

### 1.5 notification-service (`:3008`) — MSG91 + email
- `POST /notify/otp` (MSG91 OTP API), `POST /notify/sms` (MSG91 flow), `POST /notify/email` (Resend), `POST /notify/booking-confirmation` (SMS + branded email).
- **MOCK mode** logs messages when `MSG91_AUTH_KEY` / `RESEND_API_KEY` are absent.
- `auth-service` `/send-otp` now calls this service to actually deliver OTP (still logs + returns OTP in dev).

### 1.6 api-gateway (`:3000`) — rewritten
Single public entry. Generic proxy: everything under `/api/v1/*` is routed by first path segment to the right upstream (`auth, hotels, rooms, pod-sets, search, nearby, cities, bookings, availability, quote, partner, payments, notify`). Forwards method/body/query, preserves `Authorization` + `x-razorpay-signature`. `GET /health` aggregates all upstream health. Swagger at `/swagger`.

---

## 2. Website wired to the live backend (`apps/web`)

The June 6 UI used a local Zustand mock store (`src/store/bookings.ts`) and static `src/data/properties.ts`/`rooms.ts`/`search.ts`. Today that was replaced with real API calls.

### 2.1 New: `src/lib/naploo.ts`
A clean data layer that calls the gateway (reusing `src/lib/api.ts`'s auth+refresh `request`) and **adapts backend DTOs to the existing UI interfaces** (`Property`, `Room`, `Pod`, `Booking`) — so the design/components are untouched. Functions: `searchHotels`, `nearbyHotels`, `getHotel`, `getQuote`, `createBooking`, `createOrder`, `verifyPayment`, `payForBooking` (loads Razorpay checkout.js; auto-confirms in mock mode), `getBooking`, `listMyBookings`, `cancelBooking`.

### 2.2 Rewired page clients (mock → live, with loading states)
| File | Now powered by |
|------|----------------|
| `src/app/search/SearchPageClient.tsx` | `searchHotels()` → `/api/v1/search`; price/amenity filters + sort client-side |
| `src/app/property/[id]/PropertyPageClient.tsx` | `getHotel()` → `/api/v1/hotels/:id` (real room & pod UUIDs flow into checkout) |
| `src/app/booking/checkout/CheckoutClient.tsx` | `getQuote()` (authoritative price) → `createBooking()` → `payForBooking()`; real coupon→discount passed to backend; "pay at property" leaves booking pending |
| `src/app/booking/confirmation/[id]/page.tsx` | `getBooking()` → `/api/v1/bookings/:id` |
| `src/app/profile/bookings/page.tsx` | `listMyBookings(user.id)` + real `cancelBooking()` |

### 2.3 Design decisions
- **Displayed price === charged price**: checkout shows the backend `/quote`, never a client estimate.
- **One unit per booking** (1 room or 1 pod) for correctness — no phantom multi-room charges.
- Browser API base = `https://api.${hostname}` → `api.naploo.com` → gateway. CORS reflects the `naploo.com` origin.

### 2.4 Verification
- `next build` clean — 34 routes. systemd `naploo-web` (`:3100`) redeployed onto the new build.
- Full journey proven through **public `api.naploo.com`**: CORS preflight `204` with `access-control-allow-origin: https://naploo.com`; room booking (₹6,592.32) → mock pay → `completed` → booking `confirmed` → appears in my-bookings. Pod double-booking correctly rejected.

---

## 3. What is RUNNING now (PM2)

`naploo-gateway:3000`, `naploo-auth:3001`, `naploo-booking:3002`, `naploo-payment:3003`, `naploo-hotel:3007`, `naploo-notification:3008`, `naploo-search:3010` (all `127.0.0.1`), plus systemd `naploo-web:3100`. PostgreSQL `naploo_db` seeded (8 partners, 54 rooms, 68 pods).

---

## 4. Mock vs. live (drop-in keys, no code change)

| Capability | State | To go live |
|------------|-------|------------|
| Payments | MOCK (auto-confirm) | add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` (+ `RAZORPAY_WEBHOOK_SECRET`) to `.env`, restart payment-service |
| OTP / SMS | MOCK (logged) | add `MSG91_AUTH_KEY` + `MSG91_OTP_TEMPLATE_ID`, restart auth + notification |
| Email | MOCK (logged) | add `RESEND_API_KEY` + `RESEND_FROM`, restart notification |

---

## 5. NOT committed to git yet

All of today's work (5 services, gateway, ecosystem.config.cjs, 6 web files) is on disk and running but **not yet committed**. Recommend a feature branch.

---

---

# Naploo — June 7, 2026 (Part 2): Full Backend + Security + Admin Auth

> Continuation of the June 7 update. After wiring the customer website, the user took full control and requested completing all remaining backend + security work.

## 6. Backend completed — all 11 services live

Added the final 5 services (same Elysia/PM2 pattern), bringing the platform from 7 → **12 PM2 processes** (11 API services + gateway; web is systemd).

| Service | Port | Endpoints (under `/api/v1`) |
|---------|------|------------------------------|
| **analytics-service** | 3009 | `/analytics/overview` (revenue, bookings, users-by-role, inventory counts, avg booking value), `/analytics/revenue?days=`, `/analytics/top-hotels` |
| **investor-service** | 3004 | `/investors/enroll`, `/investors/me`, `/investors/invest` (₹5L/set, 18% GST, 3× guarantee), `/investors/investments/:id/earnings` |
| **referral-service** | 3005 | `/associates/enroll` (builds 5-level upline from referral code), `/associates/me`, `/referrals/me` |
| **rental-service** | 3006 | `/rentals/enquiry` (home/office pod lead capture → notification-service; public) |
| **admin-service** | 3011 | `/admin/users` (+`/:id/status`), `/admin/partners` (+`/:id/approve`,`/suspend`), `/admin/bookings` (enriched), `/admin/payments`, `/admin/payouts`, `/admin/investors` (+`/:id/approve`) |

Verified through the gateway with real data: analytics overview returns 19 users (8 partner / 10 customer / 1 admin), 8 partners, 54 rooms, 68 pods; admin partner list returns all 8; investor enroll, associate enroll, and rental enquiry all succeed.

## 7. Security — JWT auth + role gating at the gateway

The gateway now **verifies the JWT** on every `/api/v1/*` request, injects `x-user-id` / `x-user-role` headers downstream, and enforces an access policy:

- **public:** auth, search, nearby, cities, quote, availability, `GET` hotels/rooms/pods, rental enquiry
- **authed (any logged-in user):** bookings, payments, investors, associates, referrals
- **partner (partner/admin):** hotel/room/pod **writes** (add listing, set pricing), `/partner/:id/bookings`
- **admin (admin/super_admin):** `/admin/*`, `/analytics/*`, `/notify/*`

Verified: public search `200` without token; `POST /bookings` without token → `401`; admin route with a customer token → `403`. **booking-service now uses the token identity** (`x-user-id`), not a client-supplied `userId` — a user can no longer book as someone else.

## 8. Real admin authentication (replaces hardcoded password)

Previously the admin dashboard accepted a hardcoded `admin123`/client-side password. Now:
- **auth-service** gained `POST /auth/login` (email + password) using **Bun's built-in `Bun.password`** (argon2id — note: the npm `argon2` native module does **not** load under Bun, so we use the runtime built-in).
- The admin user's password hash was set in the DB; admin login now issues a real JWT and is **role-gated** (`admin`/`super_admin` only).
- `apps/web/src/app/admin/page.tsx` login rewired: `authApi.login()` → role check → stores JWT in the shared auth store → all admin API calls now carry the token. Logout clears the store. Build verified (`/admin` compiles, 32/32 routes).

> **Admin credentials:** `admin@naploo.com` / `Naploo@Admin2026` (change after first login).

## 9. State after Part 2

- **PM2:** gateway + auth, booking, hotel, payment, search, notification, investor, referral, rental, analytics, admin — all online. `pm2 save` persisted.
- **Git:** committed in stages on branch `feature/backend-and-web-wiring` (not pushed to GitHub).

## 10. Remaining work (frontend wiring — backend is ready for all of it)

| Item | Status | Note |
|------|--------|------|
| Admin dashboard **data tabs** | mock (`admin/data.ts`) | Login is real; 16 entity tabs still render mock arrays. Wire to `/admin/*` + `/analytics/*`. |
| **Partner web portal** | not built | Backend ready: hotel-service write endpoints + `/partner/:id/bookings`. Needs onboarding + inventory/pricing UI. |
| **Customer mobile app** (Expo) | auth-only | Wire explore/property/booking/payment/my-bookings to the gateway (same as web). |
| **Partner mobile app** (Expo) | UI scaffold | Wire inventory/pricing/bookings/earnings to the gateway. |
| Real keys | mock | Razorpay / MSG91 / Resend — drop into `.env`. |
| Reviews, wishlist, map | not built | Nice-to-haves on the existing data layer. |

These are visual UIs best completed with browser-based QA rather than blind generation.

---

# Naploo — June 7, 2026 (Status Update)

> Consolidated status checkpoint after backend + security + admin auth + contact info work.

## ✅ COMPLETED

### Backend (live, JWT-gated)
- **api-gateway** (:3000) — verifies JWT, injects `x-user-id` / `x-user-role`, gates routes by role (public/authed/partner/admin).
- **auth-service** (:3001) — OTP login + email/password login (`POST /auth/login`, Bun.password argon2id). OTPs delivered via notification-service.
- **hotel-service** (:3007) — list/detail hotels + rooms + pod sets; partner add/edit room & pod-set + pricing.
- **search-service** (:3010) — text search, geo-`/nearby` (haversine), `/cities`.
- **booking-service** (:3002) — availability, `/quote`, create/cancel/check-in/out; uses **token identity** (no spoofing).
- **payment-service** (:3003) — Razorpay create-order/verify/webhook/refund; MOCK mode until keys added.
- **notification-service** (:3008) — MSG91 SMS/OTP + Resend email; MOCK mode until keys added.
- **analytics-service** (:3009) — `/overview`, `/revenue?days=`, `/top-hotels`.
- **investor-service** (:3004) — `/enroll`, `/me`, `/invest` (₹5L/set + 18% GST + 3× guarantee), earnings.
- **referral-service** (:3005) — `/associates/enroll` (5-level upline), `/me`.
- **rental-service** (:3006) — `/rentals/enquiry` (home/office lead → notify; **public**).
- **admin-service** (:3011) — users (+`/:id/status`), partners (+approve/suspend), bookings (enriched), payments, payouts, investors (+approve).

### Customer Website (`apps/web`, live at naploo.com)
- Search → property → checkout → confirmation → my-bookings all wired to live gateway.
- Authoritative pricing via backend `/quote`.
- Razorpay checkout integrated (auto-confirms in MOCK; opens real checkout when keys present).
- All journey steps verified through public `api.naploo.com`.

### Admin (web `/admin`)
- **Login is real** (`authApi.login` → JWT → role-gated to admin/super_admin → stored in shared auth store). Hardcoded `admin123` removed.
- Credentials: `admin@naploo.com` / `Naploo@Admin2026`.
- 16 entity tabs **still render from `admin/data.ts` mock arrays** (not yet wired — see Remaining).

### Brand / Contact info
- Single source of truth: `apps/web/src/data/company.ts` (COMPANY/EMAILS/PHONES/ADDRESS).
- Wired into Footer (contact rail + GSTIN), Contact page (real Noida HQ), Safety (helpline), Careers (mailto).
- Live values: BIDUA Industries Pvt Ltd · GSTIN 09AANCB0882D1ZM · Suite 209, C-104, Sector 65, Noida 201301 · +91 95129 21903 · support@biduapods.com · biduaindustries@gmail.com.

### Ops
- All 12 PM2 processes online (`pm2 save` persisted).
- systemd `naploo-web` redeployed onto fresh build (34 routes).
- All changes committed on branch `feature/backend-and-web-wiring` (not pushed to GitHub yet).

---

## ❌ REMAINING (in the order being executed now)

### 1. Admin dashboard data tabs → real APIs
Replace 16 mock arrays in `apps/web/src/app/admin/data.ts` (users, partners, bookings, podSets, rooms, investors, associates, payments, payouts, coupons, tickets, applications, reviews, locations, commissions, staff) with live data from `/admin/*` + `/analytics/*`. Admin login JWT is already in the auth store, so calls are auto-authorized.

### 2. Partner web portal (full + advanced)
New section under `apps/web` for hotel/merchant partners (not built yet). Backend endpoints **are ready**:
- Add room / add pod set: `POST /hotels/:id/rooms`, `POST /hotels/:id/pod-sets`.
- Edit pricing & inventory: `PATCH /rooms/:id`, `PATCH /pod-sets/:id`.
- Bookings: `GET /partner/:partnerId/bookings`.
- Earnings: aggregate from booking `ownerShare` field.
Needs: partner login (email/pass via `/auth/login` is ready, role-gated to `partner`), dashboard, inventory CRUD, pricing screens, bookings inbox, earnings.

### 3. Customer mobile app (`apps/mobile`, Expo, ~15 screens)
Today: UI scaffold, auth-only wired. Needs: explore/search, property detail, booking flow, payment, my-bookings → all wired to gateway (same shape as web). User will QA via Expo Go.

### 4. Partner mobile app (`apps/partner`, Expo, 13 src files)
Today: UI scaffold (dashboard, inventory, bookings, earnings, profile, pods/rooms management, payout request). **Does exist** — needs API wiring. User will QA via Expo Go.

### Then (after the 4 above): build + start Expo for QA
Run `expo start` so the user can scan the QR code with Expo Go.

### Deferred / nice-to-haves (not in this wave)
- **Investor mobile app** — third app per the long-term plan (apps/investor — currently empty). Will be built after the 4 above are verified.
- **Real keys**: Razorpay live keys, MSG91 + template IDs, Resend.
- Reviews, wishlist, map view.
- Push to GitHub.

---

# Naploo — June 7, 2026 (FINAL session checkpoint)

## ✅ DELIVERED IN THIS WAVE

### Brand / contact (web)
- Single source of truth in `apps/web/src/data/company.ts`.
- Live across Footer (+ GSTIN + legal name), Contact, Safety, Careers.
- Real values: **BIDUA Industries Pvt Ltd · GSTIN 09AANCB0882D1ZM · Suite 209, C-104, Sector 65, Noida 201301 · +91 95129 21903 · support@biduapods.com · biduaindustries@gmail.com.**

### Admin dashboard — data tabs wired
- `apps/web/src/app/admin/data.ts` is now a **Zustand store** that fetches from `/admin/*` + `/analytics/*` and exposes the original `mockX` arrays (now live data).
- Auto-loads on auth, every View calls `useAdminData()` → reactive.
- `getDashboardStats()` derives KPIs from the real `overview` payload + bookings/tickets/applications.

### Partner web portal — full + advanced
Routes under `/partner/portal/*`:
- `/login` — email + password sign-in, role-gated (partner/admin only).
- `/` — dashboard (KPIs, recent bookings, quick action cards).
- `/inventory` — list rooms + pod sets, **inline pricing edit**, modal-based add (room and pod set; pod set auto-creates 2 stacked pods).
- `/bookings` — filterable list (upcoming/past/all) with revenue split.
- `/earnings` — totals, 30-day window, revenue-split explainer.

Wired to:
- New `GET /hotels/me` on hotel-service (uses x-user-id → finds partner's hotel).
- `POST /hotels/:id/rooms`, `PATCH /rooms/:id`, `POST /hotels/:id/pod-sets`, `PATCH /pod-sets/:id` (partner role gated at gateway).
- `GET /partner/:partnerId/bookings` (gateway now routes `partner` segment to booking-service).

### Customer mobile (Expo) — api wired
`apps/mobile/src/services/api.ts` rewritten with **real endpoints + adapters**:
- `authApi`: sendOtp, verifyOtp, **login (email/pass)**, getMe, updateProfile, logout.
- `propertiesApi.search/.nearby/.getById/.getRooms/.getPods/.getCities` → mapped to `/api/v1/search`, `/nearby`, `/hotels/:id` (returns the app's existing `Property`/`Room`/`Pod` shape).
- `bookingsApi.quote/.create/.list/.getById/.cancel` → `/api/v1/quote`, `/bookings`, etc.
- `paymentsApi.createOrder/.verify` → Razorpay mock + real (when keys added).
- Token storage in SecureStore + refresh on 401 (already there) preserved.
- `tsc --noEmit` clean.

### Partner mobile (Expo) — api wired
`apps/partner/src/services/api.ts` rewritten:
- `authApi.login/.sendOtp/.verifyOtp/.getMe`.
- `partnerApi.getMyHotel/.createRoom/.updateRoom/.createPodSet/.updatePodSet/.getBookings` → real gateway endpoints with shape adapters.
- `tsc --noEmit` clean.

### Expo dev servers running (tunnel mode)
Both Expo dev servers are live; **open in Expo Go**:

| App | Tunnel URL (for Expo Go) |
|-----|---------------------------|
| **Customer** | `exp://ckefzwo-anonymous-8081.exp.direct` |
| **Partner** | `exp://wndvzcu-anonymous-8082.exp.direct` |

> In Expo Go on your phone, hit "Enter URL manually" and paste the `exp://…` URL — or open `https://ckefzwo-anonymous-8081.exp.direct` in mobile Chrome to scan with Expo Go.

### Test credentials (set this session)
- Admin: `admin@naploo.com` / `Naploo@Admin2026`
- Partner (Hotel Grand Imperial): `rajesh@hotelgrand.com` / `Partner@Naploo2026` *(password set for all partner users this session — change after testing)*

### Misc
- Killed stale duplicate `bun` processes that were sometimes serving an old gateway code (`Unknown route` errors disappeared after).
- All work committed in stages on branch `feature/backend-and-web-wiring` (5 commits this wave); **not pushed to GitHub**.

## ❌ STILL TO DO (visual QA needed; backend ready for all of it)

1. **Customer mobile screens** still read from `apps/mobile/src/data/properties.ts` (static). The api.ts now has real `propertiesApi.search()` etc., so swapping `getPropertyById` for a real fetch is the next iteration — best done with phone-in-hand QA.
2. **Partner mobile screens** ditto: dashboard/inventory/bookings still render the old store; they need to call `partnerApi.getMyHotel()` etc.
3. **Investor mobile app** (third app, `apps/investor` is currently empty). Not built yet.
4. **Real keys**: Razorpay live keys, MSG91 + template IDs, Resend.
5. Push the branch to GitHub when ready.

---

# Naploo — June 7, 2026 (afternoon — payment polish & demo seed)

## ✅ DELIVERED

### 1. ₹10 demo pod hotel for end-to-end real-payment testing
Commit: `7f4f23b`

- New idempotent seed `scripts/seed-demo-10rs-hotel.ts` creates **Naploo Demo Pod (₹10 Test)** in Bangalore under the existing demo partner (`39425675-2d9b-46df-ace3-04822a7df82d`).
- 1 podSet @ `hourlyRate = ₹10` with 2 inner pods (upper + lower, both `podType=single`, status `available`).
- Booking success screen (`apps/mobile/app/booking/success.tsx`) made fully responsive: wrapped in `ScrollView`, compact mode when screen height < 720 px, reduced booking-number font so the success card never clips on small devices.

### 2. API-gateway: forward upstream Content-Type for non-JSON
Commit: `443d66b`

- `services/api-gateway/src/index.ts` was always setting `Content-Type: application/json`. The Cashfree hosted-checkout HTML page returned by `/api/v1/payments/checkout/:bookingId` was therefore rendered as raw HTML text inside the mobile WebView.
- Gateway now forwards the upstream `Content-Type` when it is not JSON, so `text/html` checkout pages render correctly.

### 3. Pod pricing mismatch — single source of truth from backend
Commit: `8c6249c`

**Bug:** ₹10 demo hotel showed "from ₹10" on the listing card but ₹60/hr inside the seat-map. Every hotel with "double" pods was affected — the seat-map was synthesizing a `baseRate + 50` markup client-side.

**Fix (mobile):**
- `apps/mobile/src/services/api.ts` — `adaptPodSet()` now exposes inner pods (`position`, `podType`, `status`); `propertiesApi.getById()` returns the raw `podSets` array alongside the adapted ones.
- `apps/mobile/src/data/properties.ts` — new `getPodLayoutFromSets(propertyId, livePodSets)` builds the seat-map grid from real backend data. Each slot's `hourlyRate`, `type`, and `status` come from the partner-configured podSet. The slot `id` IS the real podSet UUID, so the booking call no longer needs the fragile `slotIndex → livePods[index]` lookup.
- The legacy synthesizing `getPodLayout()` is kept as a fallback for when detail data hasn't loaded yet, but the `+ 50` "double pod" markup has been removed so the fallback never inflates prices either.
- `apps/mobile/app/property/[id].tsx` — passes `livePodSets` into the layout selector and uses the real podSet UUID directly when present.

**Effect:** list, seat-map, booking confirm, and Cashfree checkout all show the same partner-configured price end-to-end.

### 4. Cancel Payment UX
Commit: `8c6249c`

**Problem:** When a user closed the WebView (X button, hardware back, or Cashfree's own "back" action), the booking stayed `pending` server-side and the pod was held — partner inventory was effectively locked until the row was cleaned up manually.

**Fix:** `apps/mobile/app/booking/checkout.tsx`
- Always-visible **Cancel Payment** button below the WebView (red outline, danger color). Same control reached via the header X and the hardware-back button.
- Single confirmation prompt; while the cancel is in flight the button shows a spinner and is disabled to avoid double-fires.
- Every dismiss path (X, back, Cashfree `naploo://payment-cancelled` redirect) now calls `bookingsApi.cancel(bookingId, "User cancelled at payment screen")` server-side via `POST /api/v1/bookings/:id/cancel`, which sets the booking to `cancelled`, releases the pod, and triggers the existing cancellation-refund flow.
- If the cancel call itself fails (offline, etc.) the screen still closes so the user is never stuck — the booking can be reconciled later.

### 5. Cashfree mode-switch helper (sandbox ↔ production)
Commit: `8c6249c` (env + helper)

**Why:** Real ₹11 LIVE Cashfree payment was rejected by their risk engine on the freshly-onboarded production merchant (this is a Cashfree-side rule, not a code bug — the booking and order were created correctly). Publishing the APK to Play Store does not change this behaviour because the app hits the same `api.cashfree.com` endpoint.

**Delivered:**
- `.env` now stores both key sets side-by-side (`CASHFREE_PROD_*` and `CASHFREE_TEST_*`) and a single `CASHFREE_APP_ID`/`CASHFREE_SECRET_KEY` pair that the payment-service reads.
- New `scripts/set-cashfree-mode.sh` with three subcommands:
  - `bash scripts/set-cashfree-mode.sh test` — flip to sandbox using stored test keys
  - `bash scripts/set-cashfree-mode.sh prod` — flip back to production
  - `bash scripts/set-cashfree-mode.sh set-test` — paste new sandbox keys (hidden input, never echoed or logged) and switch
- Each command rewrites only the four affected lines in `.env`, restarts the `naploo-payment` pm2 process with `--update-env`, and tails the last lines so the new mode banner (`CASHFREE PRODUCTION mode` vs `CASHFREE SANDBOX mode`) is visible.

**Sandbox test instruments:**

| Channel | Always-success value | Always-fail value |
|---|---|---|
| UPI | `success@upi` | `failure@upi` |
| Card | `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1221` | (Cashfree's `4242 4242 4242 4242` failure card) |

## 📦 RELEASE ARTIFACTS

- **APK rebuilt 3× this session**, final size 37.9 MB, signed release variant (`arm64-v8a` only).
- Published to `apps/web/public/downloads/naploo-customer.apk` → available at `https://naploo.com/downloads/naploo-customer.apk`.
- Installed on test device `192.168.1.16:35613` via `adb -H 127.0.0.1 -P 5038`.
- All three commits pushed to `origin/feature/backend-and-web-wiring`. Branch HEAD: `8c6249c`.

## ❌ STILL TO DO

1. **Per-bed-size pricing for partners** — schema change to add `hourly_rate` column to the `pods` table (currently rate lives only on `pod_sets`) so partners can price single / double / king pods independently. Includes drizzle migration, hotel-service adapter update, partner-portal UI in `apps/partner/app/property/edit.tsx`, and a seed-script update that creates one pod of each type at differentiated prices.
2. **Sandbox cred paste** — `scripts/set-cashfree-mode.sh set-test` must be run interactively from the host shell to save the actual test AppID + secret (the model is intentionally not allowed to receive secrets).
3. **Payment timeout cron** — backend job to auto-cancel any payment row that stays `pending` longer than N minutes (defence in depth, in case the client never gets back to fire the cancel call).
4. **Live merchant risk-engine work** — once sandbox flows are green, raise the test amount to ₹100+ on production and / or coordinate with Cashfree support to whitelist the test phone numbers; risk rejection at ₹11 on a brand-new merchant is expected.

## 🧰 OPERATIONAL NOTES (kept for future sessions)

- `pm2 logs naploo-payment --lines 80 --nostream | tail` is the fastest way to confirm which mode the payment-service booted in.
- `.env` is symlinked into every `services/*/.env` — edits in `/home/awsclint/Naploo/.env` cover the whole platform.
- Cloudflare actively blocks Python urllib user-agents on `api.naploo.com`; always test public endpoints with `curl` from the host.
- `grep_search` cannot escape literal brackets in glob patterns; for files like `app/property/[id].tsx` use the pattern `**/[[]id[]].tsx`.
