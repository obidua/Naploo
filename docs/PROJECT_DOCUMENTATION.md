# Naploo Ecosystem - Complete Project Documentation

> **Version:** 4.3.0  
> **Last Updated:** June 7, 2026  
> **Company:** BIDUA Industries Pvt Ltd  
> **Project Lead:** Development Team  
> **Domain:** naploo.com

---

## ⚠️ Development Status Summary (June 2026)

### Overall Progress

| Category | Implemented | Total Planned | Progress |
|----------|-------------|---------------|----------|
| Frontend Apps | 4 (web, customer mobile, partner web, partner mobile) | 7 | ~57% |
| Backend Services | 7 (gateway, auth, booking, hotel, payment, analytics/admin support, db) | 11 | ~64% |
| Shared Packages | 1 (db) | 4 | 25% |
| Database Tables | 19 | 19 | ✅ 100% |
| Web Pages | 32 routes (App Router) | 32+ | ✅ Complete |
| Customer Booking Flow | Search → Property → Checkout → Cashfree WebView → Confirmation → My Bookings | — | ✅ Complete on mobile with live API + hosted checkout |
| Auth System | Fully dynamic | — | ✅ Complete |

### What's Live in Production

| Component | Status | Details |
|-----------|--------|---------|
| **naploo.com** | ✅ Live | Next.js 14.2.35 + React 18.3.1 + Tailwind CSS, 32 App Router pages, systemd managed, bound to `127.0.0.1:3100` |
| **api.naploo.com** | ✅ Live | Elysia/Bun API Gateway with Swagger docs, bound to `127.0.0.1:3000`, systemd managed |
| **auth-service** | ✅ Live | Bun/Elysia OTP + JWT auth, bound to `127.0.0.1:3001` |
| **booking-service** | ✅ Live | Quote/create/list/get/cancel booking endpoints, cancellation/refund path, pod inventory release |
| **hotel-service** | ✅ Live | Search/detail, rooms, pod sets, partner hotel inventory endpoints |
| **payment-service** | ✅ Live | Cashfree hosted checkout, sandbox/production mode support, Razorpay legacy paths |
| **Customer mobile APK** | ✅ Live artifact | Release APK published to `https://naploo.com/downloads/naploo-customer.apk`; installed on test device |
| **Database Schema** | ✅ Complete | 19 tables via Drizzle ORM (PostgreSQL 14) covering all business entities |
| **Nginx + SSL** | ✅ Running | Reverse proxy with Let's Encrypt, Cloudflare CDN/WAF — only entry point exposed publicly |
| **Port hardening** | ✅ Hardened | All Naploo app/service ports bind to loopback (`127.0.0.1`) only — no direct public exposure (verified via `ss -tlnp`) |

### What's Partially Done

| Component | Status | Details |
|-----------|--------|---------|
| **SMS Integration** | ⚠️ Pending | OTP generated and stored in DB but not sent via SMS (no MSG91/Twilio yet). In dev mode, OTP is returned in API response. |
| **Profile Editing** | ⚠️ Basic | Profile page reads from API but edit/save flow not fully wired to UI form |
| **Cashfree production payments** | ⚠️ Merchant/risk dependent | Sandbox is supported; production low-value ₹10/₹11 tests may be rejected by Cashfree/bank risk rules on a fresh merchant. Use `scripts/set-cashfree-mode.sh` to switch modes. |
| **Per-pod-type pricing** | ⚠️ Planned | Current DB stores price on `pod_sets`; planned migration adds per-pod price for single/double/king-style partner pricing. |

### What's Not Started

| Category | Items |
|----------|-------|
| Frontend Apps | investor, associate, rental; broader QA still needed across admin/partner/customer surfaces |
| Backend Services | investor, referral, rental, notification, deeper analytics/search hardening |
| Shared Packages | ui, types, config |
| Infrastructure | Docker, Kafka, Elasticsearch, CI/CD pipelines, monitoring |
| Integrations | MSG91, FCM, Google Maps, Sentry; Cashfree production support requires merchant activation/risk review |

### Web App Pages (32 routes implemented)

Marketing & informational pages:

| Route | Description |
|-------|-------------|
| `/` | Home with hero, **hero SearchBar** (mode toggle: hourly pods / nightly rooms), trending cities |
| `/about` | About Naploo |
| `/blog`, `/blog/[id]` | Blog listing and detail |
| `/careers` | Careers page |
| `/contact` | Contact form |
| `/cookies` | Cookie policy |
| `/faqs` | Frequently asked questions |
| `/help` | Help center |
| `/how-it-works` | How Naploo works |
| `/investor` | Investor information |
| `/locations` | Location listings |
| `/partner` | Partner information |
| `/press` | Press/media page |
| `/pricing` | Pricing information |
| `/privacy` | Privacy policy |
| `/refund` | Refund policy |
| `/safety` | Safety information |
| `/terms` | Terms of service |

Auth, profile & admin:

| Route | Description |
|-------|-------------|
| `/login`, `/signup` | Authentication pages (phone OTP) |
| `/profile` | User profile |
| `/profile/bookings` | **NEW** — Upcoming + past bookings, cancel flow, status badges |
| `/admin` | Admin dashboard (page exists; full backend pending) |
| `/apply` | Application form |
| `/download`, `/tickets` | Misc links |

Customer booking flow (NEW — OYO-style):

| Route | Description |
|-------|-------------|
| `/search` | **NEW** — Property search results with sticky compact SearchBar, filter sidebar (property type, price range, amenity chips), mode-aware listings |
| `/property/[id]` | **NEW** — Property detail: gallery, amenities, **Rooms** + **Sleeping Pods** tabs, sticky booking sidebar |
| `/booking/checkout` | **NEW** — Guest details, payment method, coupon codes (`WELCOME10`, `NAPLOO50`), 12% GST breakdown |
| `/booking/confirmation/[id]` | **NEW** — Success page with booking code (`NP######`), copy/print actions, OTP-unlock tip for pods |
| `/pods`, `/pods/[id]` | Legacy pod browsing (`/pods/[id]` redirects to `/property/[id]`) |

System pages:

| Route | Description |
|-------|-------------|
| `/_not-found` | App Router 404 page (custom branded) |
| `error.tsx` boundary | App Router global error UI |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Goals](#2-project-vision--goals)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Feature Specifications](#6-feature-specifications)
7. [Database Design](#7-database-design)
8. [API Documentation](#8-api-documentation)
9. [UI/UX Design System](#9-uiux-design-system)
10. [Development Roadmap](#10-development-roadmap)
11. [Deployment Strategy](#11-deployment-strategy)
12. [Security Guidelines](#12-security-guidelines)
13. [Testing Strategy](#13-testing-strategy)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 What is Naploo?

Naploo is India's first **hybrid accommodation platform** offering a broad range of options:

| Accommodation Type | Description | Booking Model |
|-------------------|-------------|---------------|
| 🏠 **Homestay Pods** | Pods in residential homes | Hourly (1-12 hrs) |
| 🏨 **Hotel Pods** | Pod halls in partner hotels | Hourly (1-12 hrs) |
| 🛏️ **Traditional Rooms** | Standard hotel rooms | 24-hour checkout |
| 🏡 **Home Rentals** | Pods for personal home use | 12-month contract |
| 🏢 **Office Nap Rooms** | Corporate wellness pods | 12-month contract |

**Additional Features:**
- **Investor Pool System** - Crowdfunded pod investments with guaranteed 3x returns
- **5-Level Referral Program** - Associate earnings on hotel, investor, and customer referrals

We partner with **hotels AND homestay owners** to install pods, giving travelers flexible options:
1. **Homestay Pods** - Unique locations (beach house, hill station, farmstay)
2. **Hotel Pods** - Pay per hour (starting Rs.150/hr) for quick rest
3. **Room Booking** - Traditional 24-hour hotel room booking

### 1.2 Business Model

```
+------------------------------------------------------------------------------+
|                          NAPLOO BUSINESS MODEL v4.0                           |
+------------------------------------------------------------------------------+
|                                                                               |
|  ACCOMMODATION PROVIDERS                    CUSTOMERS                         |
|  +----------------------+                   +----------------------+          |
|  | 🏨 Hotel Partners    |                   | 👤 Travelers         |          |
|  | 🏠 Homestay Owners   |                   | 💼 Business Users    |          |
|  +----------------------+                   | 🏠 Home Renters      |          |
|           |                                 | 🏢 Corporate Clients |          |
|           v                                 +----------------------+          |
|  +------------------+                                |                        |
|  | PROVIDER OPTIONS |                                v                        |
|  |------------------|                       +------------------+              |
|  | A) Without       |                       |  BOOKING OPTIONS |              |
|  |    Investment    |                       |------------------|              |
|  |    (5yr contract)|                       | • Homestay Pods  |              |
|  |                  |                       | • Hotel Pods     |              |
|  | B) With          |                       | • Daily Rooms    |              |
|  |    Investment    |                       | • Monthly Rental |              |
|  |    (Buy pods)    |                       +------------------+              |
|  +------------------+                                                         |
|           |                                                                   |
|           v                                                                   |
|  +-----------------------------------------------------------------------+   |
|  |                        NAPLOO PLATFORM                                 |   |
|  |-----------------------------------------------------------------------|   |
|  |  📱 Customer App  |  🏨 Partner Portal  |  💼 Admin Dashboard          |   |
|  |  🌐 Website       |  💰 Investor Portal |  👥 Associate Portal         |   |
|  +-----------------------------------------------------------------------+   |
|                                                                               |
|  INVESTMENT & GROWTH                                                          |
|  +----------------------+                   +----------------------+          |
|  | 💰 Investor Pool     |                   | 👥 Associates        |          |
|  | • Buy Pod Sets       |                   | • 5-Level Referrals  |          |
|  | • 3x Return Guarantee|                   | • Earn Commissions   |          |
|  | • 5-Year Scrap Policy|                   +----------------------+          |
|  +----------------------+                                                     |
|                                                                               |
+------------------------------------------------------------------------------+
```

### 1.3 Provider Partnership Options (Hotels & Homestays)

Hotels and Homestay owners have **TWO options** to partner with Naploo:

```
+-----------------------------------------------------------------------------+
|                    PROVIDER PARTNERSHIP OPTIONS                              |
+-----------------------------------------------------------------------------+
|                                                                              |
|  OPTION A: WITHOUT INVESTMENT                OPTION B: WITH INVESTMENT       |
|  (Partnership/Franchise Model)               (Owner Purchases Pods)          |
|  +--------------------------------+          +--------------------------------+
|  |                                |          |                                |
|  | • Naploo provides pods FREE    |          | • Owner buys pods from Naploo |
|  | • 5-year agreement (or more)   |          | • Permanent ownership          |
|  | • Owner provides space only    |          |                                |
|  | • Naploo handles operations    |          | TWO SUB-OPTIONS:               |
|  |                                |          |                                |
|  | REVENUE SHARE:                 |          | B1) WITHOUT GUARANTEE          |
|  | • 60% → Pod Owner (Investor)   |          |     • Higher revenue share     |
|  | • 40% → Naploo                 |          |     • No return guarantee      |
|  |         ↓                      |          |     • Market-based earnings    |
|  |    From this 40%:              |          |                                |
|  |    • X% to Hotel/Homestay      |          | B2) WITH GUARANTEE             |
|  |      (varies by city/space)    |          |     • Same as Investor Pool    |
|  |    • Rest: Operations + Profit |          |     • 3x return guarantee      |
|  |                                |          |     • 5-year scrap policy      |
|  +--------------------------------+          +--------------------------------+
|                                                                              |
+-----------------------------------------------------------------------------+
```

#### Option A: Without Investment (Partnership Model)

| Aspect | Details |
|--------|---------|
| **Investment Required** | ₹0 (Zero) |
| **Agreement Term** | Minimum 5 years |
| **Pods Provided By** | Naploo (free of cost) |
| **Installation** | Naploo handles everything |
| **Maintenance** | Naploo responsibility |
| **Revenue Share** | % from Naploo's 40% share (varies by city/space) |
| **Best For** | Homeowners/hotels wanting passive income |

#### Option B: With Investment (Owner Buys Pods)

**Sub-Option B1: Without Guarantee**

| Aspect | Details |
|--------|---------|
| **Investment** | Owner purchases pods at market price |
| **Ownership** | Permanent (owner's asset) |
| **Revenue Share** | 60% (owner is pod owner) |
| **Guarantee** | None - market-based earnings |
| **Risk** | Owner bears market risk |

**Sub-Option B2: With Guarantee (Investor Pool Terms)**

| Aspect | Details |
|--------|---------|
| **Investment** | Same as Investor Pool pricing |
| **Guarantee** | 3x return over pod lifecycle |
| **Minimum Earning** | ₹500/month/pod set |
| **Scrap Policy** | 5-year replacement guarantee |

### 1.4 Revenue Model (Universal for All Pod Types)

```
+-----------------------------------------------------------------------------+
|                    UNIVERSAL REVENUE MODEL                                   |
+-----------------------------------------------------------------------------+
|                                                                              |
|                         BOOKING REVENUE (100%)                               |
|                                |                                             |
|                                v                                             |
|          +---------------------+---------------------+                       |
|          |                                           |                       |
|          v                                           v                       |
|    +-----------+                              +-----------+                  |
|    |    60%    |                              |    40%    |                  |
|    | POD OWNER |                              |  NAPLOO   |                  |
|    +-----------+                              +-----------+                  |
|          |                                           |                       |
|          v                                           v                       |
|    Who is Pod Owner?                          From this 40%:                 |
|    • External Investor                        • Hotel/Homestay Commission    |
|    • Hotel Owner (if purchased)               • Platform Operations          |
|    • Homestay Owner (if purchased)            • Maintenance & Marketing      |
|                                               • Naploo Profit                |
|                                                                              |
+-----------------------------------------------------------------------------+
```

**Revenue Distribution by City Tier (Partner's Share from Naploo's 40%):**

| City Tier | Hotel/Homestay Gets | Naploo Keeps |
|-----------|---------------------|--------------|
| Metro Cities | 8-12% | 28-32% |
| Tier-1 Cities | 10-15% | 25-30% |
| Tier-2 Cities | 12-18% | 22-28% |
| Tier-3/Rural | 15-20% | 20-25% |

### 1.5 Investor Pool System

```
+-----------------------------------------------------------------------------+
|                       INVESTOR POOL SYSTEM                                   |
+-----------------------------------------------------------------------------+
|                                                                              |
|  1. ENROLLMENT                                                               |
|     - Investor registers on investor.naploo.com                              |
|     - Completes KYC verification                                             |
|     - Admin/Verification Dept approves enrollment                            |
|     - Investor joins the "Investor Pool" (e.g., 1000+ investors)             |
|                                                                              |
|  2. LOCATION ANNOUNCEMENT (Hotels OR Homestays)                              |
|     - Naploo announces new hotel OR homestay location                        |
|     - Post details: Location, pods available, Rs.5 Lac per pod set           |
|     - All pool investors can view and claim pod sets                         |
|                                                                              |
|  3. POD SET PURCHASE                                                         |
|     - Pod Set = 2 pods (Stacked: 1 Upper + 1 Lower)                          |
|     - Price: Rs.5,00,000 per set + 18% GST = Rs.5,90,000                     |
|     - Example: Investor buys 2 sets (4 pods) = Rs.11,80,000                  |
|     - Invoice generated immediately upon payment                             |
|                                                                              |
|  4. DELIVERY OPTIONS                                                         |
|     +-----------------------------+-----------------------------+            |
|     |    DOORSTEP DELIVERY        |     LEASEBACK AGREEMENT     |            |
|     |                             |                             |            |
|     | - Pods delivered to home    | - Pods installed at hotel   |            |
|     | - Personal/commercial use   | - Investor earns 60% share  |            |
|     | - No revenue share          | - Naploo earns 40% share    |            |
|     | - Full ownership            | - All maintenance by Naploo |            |
|     +-----------------------------+-----------------------------+            |
|                                                                              |
|  5. LEASEBACK EARNINGS (If chosen)                                           |
|     - Per booking: 60% to Investor, 40% to Naploo                            |
|     - Real-time alerts when pod is booked                                    |
|     - Dashboard shows all earnings, occupancy, performance                   |
|     - Unlimited earning potential                                            |
|                                                                              |
|  6. 3X RETURN GUARANTEE                                                      |
|     - Minimum guaranteed: 3x investment in 3 years                           |
|     - Example: Rs.5 Lac investment = Minimum Rs.15 Lac return                |
|     - If not achieved in 3 years = Contract extends until 3x reached         |
|     - Once 3x earned = Pods permanently belong to Naploo (Scrap Policy)      |
|                                                                              |
+-----------------------------------------------------------------------------+
```

#### Revenue Calculation (@ ₹150/hour, 18 hrs/day average occupancy)

**Pod Set Configuration:**
- **Price:** ₹5,00,000 per Pod Set (+ 18% GST = ₹5,90,000)
- **Includes:** 2 Pods (Stacked - 1 Upper + 1 Lower)

**PER POD (Single Capsule) - Investor Earnings (60%):**

| Period | Total Revenue | Pod Owner (60%) | Naploo (40%) |
|--------|---------------|-----------------|--------------|
| Per Hour | ₹150 | ₹90 | ₹60 |
| Per Day | ₹2,700 | ₹1,620 | ₹1,080 |
| Per Month | ₹81,000 | ₹48,600 | ₹32,400 |
| Per Year | ₹9,85,500 | ₹5,91,300 | ₹3,94,200 |
| **3 Years** | ₹29,56,500 | **₹17,73,900** | ₹11,82,600 |

**PER POD SET (2 Pods) - Investor Earnings (60%):**

| Period | Total Revenue | Pod Owner (60%) | Naploo (40%) |
|--------|---------------|-----------------|--------------|
| Per Hour | ₹300 | ₹180 | ₹120 |
| Per Day | ₹5,400 | ₹3,240 | ₹2,160 |
| Per Month | ₹1,62,000 | ₹97,200 | ₹64,800 |
| Per Year | ₹19,71,000 | ₹11,82,600 | ₹7,88,400 |
| **3 Years** | ₹59,13,000 | **₹35,47,800** | ₹23,65,200 |

**Investment ROI Summary (Pod Set @ ₹5,00,000):**

| Metric | Value |
|--------|-------|
| Investment | ₹5,00,000 |
| Daily Earnings (60%) | ₹3,240 |
| **Break-even** | **~154 days (~5 months)** |
| 1 Year Earnings | ₹11,82,600 |
| 1 Year Net Profit | ₹6,82,600 |
| 3 Year Earnings | ₹35,47,800 |
| 3 Year Net Profit | ₹30,47,800 |
| **ROI (3 Years)** | **~7x return** |

> **Note:** Calculations based on 365 days/year. Actual earnings may vary based on location, occupancy rates, and seasonal demand.

### 1.6 5-Level Referral System

```
+-----------------------------------------------------------------------------+
|                       5-LEVEL REFERRAL SYSTEM                                |
+-----------------------------------------------------------------------------+
|                                                                              |
|  REFERRAL TYPES:                                                             |
|  +-- Hotel Tie-ups (bring hotels to list on Naploo)                          |
|  +-- Homestay Tie-ups (bring homestay owners to list on Naploo)              |
|  +-- Space Referrals (find spaces for pod installation)                      |
|  +-- Investor Referrals (bring new investors to pool)                        |
|  +-- Customer Referrals (bring booking customers)                            |
|  +-- Associate Referrals (bring other associates)                            |
|                                                                              |
|  EARNING STRUCTURE (5 Levels):                                               |
|                                                                              |
|      YOU (Associate)                                                         |
|        |                                                                     |
|        +-- Level 1: Direct Referral      = X% commission                     |
|        |     |                                                               |
|        |     +-- Level 2: Their Referral = Y% commission                     |
|        |     |     |                                                         |
|        |     |     +-- Level 3           = Z% commission                     |
|        |     |     |     |                                                   |
|        |     |     |     +-- Level 4     = A% commission                     |
|        |     |     |     |     |                                             |
|        |     |     |     |     +-- Level 5 = B% commission                   |
|                                                                              |
|  COMMISSION RATES (To be configured by Admin):                               |
|  - Hotel Tie-up: One-time bonus + % of hotel's lifetime earnings             |
|  - Homestay Tie-up: One-time bonus + % of homestay's lifetime earnings       |
|  - Space Referral: One-time finder's fee                                     |
|  - Investor Referral: % of investor's investment                             |
|  - Customer Referral: % of booking value                                     |
|  - Associate Referral: % of associate's earnings (5 levels deep)             |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### 1.7 Project Scope

Build a complete digital ecosystem enabling:
- **Customers** to search, compare, and book pods (hourly) or rooms (daily)
- **Hotel Owners** to list their properties, manage inventory, and track bookings
- **Homestay Owners** to list their homes with pods and earn passive income
- **Pod Investors** to enroll in pool, purchase pod sets, and track earnings
- **Associates** to refer hotels, homestays, investors, customers and earn 5-level commissions
- **Home/Office Users** to rent pods on 12-month contracts
- **Administrators** to manage platform operations, investor approvals, and analytics

### 1.8 Platforms to Develop

| Platform | Technology | Priority | Deployment | Status |
|----------|------------|----------|------------|--------|
| Customer Website (PWA) | Next.js 14 | Phase 1 | Linux Server | ✅ Live (32+ pages) |
| API Gateway | Elysia (Bun) | Phase 1 | Linux Server | ✅ Live (proxies to auth, booking, hotel, payment, admin/analytics) |
| Auth Service | Elysia (Bun) | Phase 1 | Linux Server | ✅ Live (real DB, JWT, OTP) |
| Database Schema | PostgreSQL + Drizzle | Phase 1 | Linux Server | ✅ 19 tables defined |
| Partner Portal (Hotels/Homestays) | Next.js 14 | Phase 1 | Linux Server | ✅ Functional portal + live inventory/bookings wiring |
| Customer Mobile App | React Native + Expo | Phase 2 | App Stores | ✅ Release APK published; live API + Cashfree checkout wired |
| Investor Pool Portal | Next.js 14 | Phase 1 | Linux Server | ❌ Not started |
| Associate Portal | Next.js 14 | Phase 1 | Linux Server | ❌ Not started |
| Rental Portal | Next.js 14 | Phase 2 | Linux Server | ❌ Not started |
| Admin Dashboard | Next.js 14 | Phase 1 | Linux Server | ⚠️ Data tabs wired; broader QA pending |
| Backend Services | Bun + Elysia | Parallel | Linux Server | ⚠️ Core auth/booking/hotel/payment live; remaining services pending |

### 1.9 Key Business Metrics

**Pod Booking (Hourly) - Hotels & Homestays:**
- Single Bed Pod: Rs.150/hour
- Double Bed Pod: Rs.200/hour
- Discount: 10% on additional hours
- Revenue Split: 60% to Pod Owner, 40% to Naploo
- Partner Commission: From Naploo's 40% (varies by city/space)

**Room Booking (Traditional):**
- Commission Model: 15-20% per booking (like OYO/Goibibo)
- Hotel sets their own room rates
- Standard check-in/check-out times

**Pod Investment (Pool System):**
- Pod Set Price: Rs.5,00,000 + GST per set (2 pods)
- Revenue Share: 60% investor, 40% Naploo
- Guarantee: 3x return in 3 years (minimum)
- Scrap Policy: Pods belong to Naploo after 3x achieved

**Home/Office Rental:**
- Minimum Contract: 12 months
- Includes: Installation, maintenance, support
- Monthly rental + one-time setup fee

**Referral Earnings:**
- 5-level deep commission structure
- Configurable percentages per referral type
- Monthly payouts to associates

---

## 2. Project Vision & Goals

### 2.1 Vision Statement

*"To revolutionize travel accommodation and rest spaces in India by providing a unified platform where travelers can book affordable pods (hourly) at hotels OR homestays, or traditional hotel rooms (daily), while creating wealth opportunities for investors through our pool system and associates through our 5-level referral program."*

### 2.2 Business Goals

1. **Customer Acquisition:** 50,000+ app downloads in first 6 months
2. **Hotel Partners:** 500+ hotels onboarded in Year 1
3. **Homestay Partners:** 1,000+ homestays onboarded in Year 1
4. **Booking Volume:** 2,000+ daily bookings (pods + rooms) by Year 1
5. **Investor Pool:** 1,000+ verified investors in pool by Year 1
6. **Pod Installations:** 5,000+ pods deployed across India by Year 2
7. **Associates:** 500+ active referral associates
8. **Rental Contracts:** 200+ home/office rental contracts
9. **Geographic Coverage:** 50+ cities across India by Year 2

### 2.3 Technical Goals

1. **Performance:** Page load < 2 seconds, API response < 200ms
2. **Availability:** 99.9% uptime for booking system
3. **Scalability:** Support 100,000+ concurrent users
4. **Mobile Experience:** Native-like PWA with offline capabilities
5. **Real-time:** Instant booking alerts to investors via Kafka

### 2.4 User Goals

#### For Customers
- Search hotels with both pod and room options
- Compare prices across accommodations
- Book pods by the hour or rooms by the night
- Seamless check-in via QR code
- Multiple payment options (UPI, Card, Wallet, Crypto)
- Rent pods for home use

#### For Hotel Owners
- Easy onboarding and listing management
- Real-time inventory and pricing control
- Dashboard for bookings and revenue
- Customer insights and analytics
- Option to add Naploo pods to their property

#### For Pod Investors (Pool System)
- Enroll in verified investor pool
- View and claim pod sets from announcements
- Choose doorstep delivery or leaseback
- Real-time earnings and booking alerts
- Track progress toward 3x return guarantee
- Easy withdrawal process

#### For Associates (Referral Program)
- Refer hotels, spaces, investors, customers
- Earn on 5 levels of referrals
- Track all referral activity
- Monthly commission payouts
- Marketing materials and links

#### For Home/Office Renters
- Browse rental pod options
- Request site survey for installation
- 12-month contract management
- Maintenance request system

---

## 3. System Architecture

> **⚠️ IMPLEMENTATION NOTE:** The architecture below shows the planned target state.
> Currently only the shaded components are operational. See Section 3.2 for status.

### 3.1 High-Level Architecture (Planned)

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER                                   |
+---------------+---------------+---------------+---------------+----------+
|  Customer Web |  Hotel Owner  |   Investor    |   Associate   |  Mobile  |
|  (Next.js)    |   Portal      |   Portal      |    Portal     |   App    |
|  naploo.com   | partner.      | investor.     | associate.    | iOS/     |
|   ✅ LIVE     | naploo.com    | naploo.com    | naploo.com    | Android  |
+---------------+---------------+---------------+---------------+----------+
|  Rental       |     Admin     |               |               |          |
|  Portal       |   Dashboard   |               |               |          |
| rental.       | admin.        |               |               |          |
| naploo.com    | naploo.com    |               |               |          |
+-------+-------+-------+-------+-------+-------+-------+-------+----+-----+
        |               |               |               |            |
        +---------------+---------------+---------------+------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                ✅ CLOUDFLARE CDN + WAF + DDoS Protection                 |
+-------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                  ✅ NGINX REVERSE PROXY + Let's Encrypt SSL              |
+-------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                     ✅ API GATEWAY (Elysia on port 3000)                 |
|              (Proxies to auth-service, Swagger, health checks)           |
+-------------------------------------------------------------------------+
                                        |
        +---------------+---------------+--------- ... --------+
        |               |                                       |
        v               v                                       v
+-------------+ +-------------+                         +-------------+
| ✅ AUTH     | | ❌ BOOKING  |  ... 9 more services     | ❌ SEARCH   |
|   SERVICE   | |   SERVICE   |      all ❌ empty        |   SERVICE   |
| (port 3001) | |             |                         |             |
+-------------+ +-------------+                         +-------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                      ❌ KAFKA (Not installed)                            |
+-------------------------------------------------------------------------+
                                        |
        +---------------+---------------+---------------+
        |               |               |               |
        v               v               v               v
+-------------+ +-------------+ +-------------+ +-------------+
| ✅ Postgres |  ✅ Redis     | ❌ Elastic-  | ✅ Swagger    |
| 14.20       |  6.0.16       |    search    |  (via Elysia) |
| (Drizzle)   |  (installed)  |              |               |
+-------------+ +-------------+ +-------------+ +-------------+

              SELF-HOSTED AWS EC2 (systemd, no Docker)
```

### 3.2 Microservices Overview

| Service | Port | Responsibility | Status |
|---------|------|----------------|--------|
| **api-gateway** | 3000 | Request routing, proxies to auth-service, Swagger | ✅ Live |
| **auth-service** | 3001 | OTP send/verify, JWT (access+refresh), profile | ✅ Live (PostgreSQL, Drizzle ORM) |
| **booking-service** | 3002 | Pod & room bookings, quotes, cancellation/refund handoff | ✅ Live |
| **payment-service** | 3003 | Cashfree hosted checkout, sandbox/production mode, Razorpay legacy paths | ✅ Live |
| **investor-service** | 3004 | Pool management, pod sets, 3x tracking | ❌ Empty directory |
| **referral-service** | 3005 | 5-level referral, commissions | ❌ Empty directory |
| **rental-service** | 3006 | Home/office rentals, contracts | ❌ Empty directory |
| **hotel-service** | 3007 | Hotel listings, rooms, pod sets, partner hotel inventory | ✅ Live |
| **notification-service** | 3008 | Email, SMS, push notifications | ❌ Empty directory |
| **analytics-service** | 3009 | Reports, dashboards, metrics | ❌ Empty directory |
| **search-service** | 3010 | Elasticsearch indexing, search | ❌ Empty directory |

### 3.3 Data Flow - Investor Pool System

```
Investor                    Frontend                   Backend (Kafka)
   |                           |                          |
   |  1. Enroll in Pool        |                          |
   | ------------------------->|                          |
   |                           |  2. POST /investors/enroll
   |                           | ------------------------->|
   |                           |  3. KYC Verification      |
   |                           | <-------------------------|
   |  4. Await Admin Approval  |                          |
   | <-------------------------|                          |
   |                           |                          |
   |  5. View Announcements    |                          |
   | ------------------------->|                          |
   |                           |  6. GET /announcements   |
   |                           | ------------------------->|
   |                           |  7. Available Pod Sets   |
   |                           | <-------------------------|
   |  8. Claim Pod Set         |                          |
   | ------------------------->|                          |
   |                           |  9. POST /pod-sets/claim |
   |                           | ------------------------->|
   |                           |  10. Process Payment     |
   |                           | <-------------------------|
   |                           |                          |
   |  11. Choose Delivery      |                          |
   |      Option               |                          |
   | ------------------------->|                          |
   |                           | 12. Doorstep OR Leaseback|
   |                           | ------------------------->|
   |                           |                          |
   |  [If Leaseback]           |                          |
   |  13. Real-time Alerts     |        KAFKA EVENT       |
   | <-------------------------|<-------------------------|
   |      (Pod Booked!)        |  booking.completed       |
   |                           |                          |
   |  14. Track 3x Progress    |                          |
   | ------------------------->|                          |
   |                           | 15. GET /earnings/3x     |
   |                           | ------------------------->|
```

### 3.4 Data Flow - 5-Level Referral

```
Associate                   Frontend                   Backend
   |                           |                          |
   |  1. Generate Referral Link|                          |
   | ------------------------->|                          |
   |                           |  2. POST /referrals/link |
   |                           | ------------------------->|
   |                           |  3. Unique Link          |
   |                           | <-------------------------|
   |  4. Share Link            |                          |
   | ------------------------->|                          |
   |                           |                          |
   |  [New User Signs Up]      |                          |
   |                           |  5. Track Referral       |
   |                           | ------------------------->|
   |                           |  6. Record Level 1       |
   |                           | <-------------------------|
   |                           |                          |
   |  [Referral Makes Booking] |                          |
   |                           |  7. Calculate Commission |
   |                           | ------------------------->|
   |                           |  8. Credit L1-L5         |
   |                           | <-------------------------|
   |                           |                          |
   |  9. View Earnings         |                          |
   | ------------------------->|                          |
   |                           | 10. GET /referrals/tree  |
   |                           | ------------------------->|
   |                           | 11. Full Referral Tree   |
   |                           | <-------------------------|
```

---

## 4. Technology Stack

### 4.0 Security Notice

> **CRITICAL: React Server Components Vulnerability (CVE-2025-55182)**
>
> All React/Next.js versions must be updated to patched versions to prevent
> unauthenticated remote code execution. See react.dev/blog/2025/12/03 for details.
>
> **Required Minimum Versions:**
> - Next.js 14.2.35 with React 18.3.1 (current `apps/web` choice)
> - Or Next.js 15.1.11+ / 15.2.8+ with React 19.0.1 / 19.1.2 / 19.2.1+
> - React Native: Update react-server-dom-* packages if using monorepo
>
> **Why React 18.3.1 in `apps/web`:** Next.js 14 declares `react@^18.2.0` as a peer
> dependency. Mixing React 19 with Next 14 causes `next build` to fail when prerendering
> the legacy `_error` page (`Cannot read properties of null (reading 'useRef')`).
> The web app pins React 18.3.1 (security-patched) via root `overrides`/`resolutions`
> in `package.json` to keep all hoisted copies aligned. When the platform migrates to
> Next.js 15, both web and mobile can move to React 19 together.

### 4.1 Frontend Technologies

| Category | Technology | Version | Purpose | Status |
|----------|------------|---------|---------|--------|
| **Framework** | Next.js | 14.2.35 | React framework (SECURITY PATCHED) | ✅ In use |
| **React** | React | 18.3.1 (web) / 19.x (mobile, partner) | UI library — web pinned to 18.3.1 for Next 14 peer compatibility | ✅ In use |
| **Language** | TypeScript | 5.x | Type safety | ✅ In use |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS | ✅ In use |
| **UI Components** | Custom (GlassCard, Button, Input, **SearchBar**, **FilterPanel**, etc.) | — | In `apps/web/src/components/` | ✅ Built |
| **State Management** | Zustand | 5.0.0 | Auth store + **bookings store** (persisted) | ✅ In use |
| **Icons** | Lucide React | 0.468.0 | Icon library | ✅ In use |
| **Date Utils** | date-fns | 4.1.0 | Date formatting | ✅ In use |
| **Class Utils** | clsx + tailwind-merge | Latest | Conditional classes | ✅ In use |
| **Forms** | React Hook Form | — | Form handling | ❌ Not yet added |
| **Validation** | Zod | — | Schema validation | ❌ Not yet added |
| **HTTP Client** | Axios / TanStack Query | — | API calls + caching | ❌ Not yet added |
| **Maps** | Google Maps | — | Location features | ❌ Not yet added |
| **Charts** | Recharts | — | Analytics visualization | ❌ Not yet added |
| **Animation** | Framer Motion | — | UI animations | ❌ Not yet added (CSS animations via Tailwind used instead) |

### 4.2 Mobile Technologies

> **❌ Status: Not started.** The `apps/mobile/` directory is empty.
> The following is the planned mobile technology stack.

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React Native | 0.73+ | Cross-platform mobile |
| **React** | React | 19.2.1+ | Core library (SECURITY PATCHED) |
| **Toolchain** | Expo | 50.x | Development & build |
| **Navigation** | React Navigation | 6.x | Screen navigation |
| **State** | Zustand | 4.x | Shared with web |
| **Storage** | AsyncStorage | Latest | Local data |
| **Push Notifications** | Expo Notifications | Latest | FCM integration |
| **Camera/QR** | Expo Camera | Latest | QR scanning |
| **Maps** | React Native Maps | Latest | Location display |

### 4.3 Backend Technologies (NEW STACK)

| Category | Technology | Version | Purpose | Status |
|----------|------------|---------|---------|--------|
| **Runtime** | Bun | 1.3.6 | Fast JavaScript runtime | ✅ In use |
| **Framework** | Elysia | ^1.2.0 | High-performance API framework | ✅ In use |
| **Language** | TypeScript | 5.x | Type safety | ✅ In use |
| **ORM** | Drizzle ORM | Latest | Type-safe database access | ✅ In use |
| **Validation** | TypeBox (via Elysia) | Latest | Request validation | ✅ In use (auth-service) |
| **Auth** | JWT via @elysiajs/jwt | Latest | Authentication (dual JWT: access 15min + refresh 7d) | ✅ In use |
| **API Documentation** | @elysiajs/swagger | Latest | Auto-generated docs | ✅ Live at /swagger |
| **CORS** | @elysiajs/cors | Latest | Cross-origin support | ✅ In use |
| **Message Broker** | RabbitMQ (installed) / Kafka (planned) | — | Event streaming | ❌ Not integrated |
| **WebSocket** | Elysia WebSocket | — | Real-time features | ❌ Not yet added |
| **Email** | Nodemailer + Resend | — | Email delivery | ❌ Not yet added |
| **SMS** | MSG91 / Twilio | — | OTP delivery | ❌ Not yet added |

### 4.4 Database & Storage

| Category | Technology | Purpose | Status |
|----------|------------|---------|--------|
| **Primary Database** | PostgreSQL 14.20 | Relational data (via Drizzle ORM) | ✅ Running |
| **Cache** | Redis 6.0.16 | Sessions, caching, queues | ✅ Installed (not yet used by app) |
| **Search** | Elasticsearch / Meilisearch | Location search | ❌ Not installed |
| **File Storage** | Local / Cloudflare R2 | Images, documents | ❌ Not configured |
| **CDN** | Cloudflare | Static asset delivery, WAF | ✅ Active |

### 4.5 External Services

| Service | Provider | Purpose | Status |
|---------|----------|---------|--------|
| **Payments** | Razorpay | UPI, Cards, Wallets | ❌ Not integrated |
| **SMS OTP** | MSG91 | Phone verification | ❌ Not integrated |
| **Email** | Resend / SendGrid | Transactional emails | ❌ Not integrated |
| **Push Notifications** | Firebase Cloud Messaging | Mobile notifications | ❌ Not integrated |
| **Maps** | Google Maps Platform | Geocoding, directions | ❌ Not integrated |
| **Analytics** | Mixpanel / PostHog | Product analytics | ❌ Not integrated |
| **Error Tracking** | Sentry | Error monitoring | ❌ Not integrated |

### 4.6 DevOps & Infrastructure (Self-Hosted Linux)

| Category | Technology | Purpose | Status |
|----------|------------|---------|--------|
| **Web Server** | Nginx 1.18.0 | Reverse proxy, SSL | ✅ Running |
| **Process Manager** | systemd | Service management, auto-restart | ✅ Running |
| **SSL Certificates** | Let's Encrypt (Certbot) | Free SSL | ✅ Active |
| **CDN/DNS** | Cloudflare | DNS, CDN, WAF, DDoS protection | ✅ Active |
| **Domain** | naploo.com | Primary domain | ✅ Active |
| **Containerization** | Docker + Docker Compose | Service containerization | ❌ Not installed |
| **CI/CD** | GitHub Actions | Automated deployments | ❌ Not configured |
| **Monitoring** | Grafana + Prometheus | Infrastructure monitoring | ❌ Not installed |
| **Backup** | Cron + rclone / rsync | Automated backups | ❌ Not configured |

---

## 5. Project Structure

### 5.1 Monorepo Structure (Actual vs Planned)

> **Legend:** ✅ = Implemented | ⚠️ = Partial/Stub | ❌ = Empty/Not started

```
naploo-ecosystem/
|
+-- apps/
|   |
|   +-- web/                        # ✅ Customer Website (Next.js 14 + React 18.3.1)
|   |   +-- src/
|   |   |   +-- app/                # ✅ 32 routes (App Router)
|   |   |   |   +-- page.tsx        # Home (with hero SearchBar)
|   |   |   |   +-- about/
|   |   |   |   +-- admin/
|   |   |   |   +-- apply/
|   |   |   |   +-- blog/ + [id]/
|   |   |   |   +-- booking/        # NEW: customer booking flow
|   |   |   |   |   +-- checkout/
|   |   |   |   |   +-- confirmation/[id]/
|   |   |   |   +-- careers/
|   |   |   |   +-- contact/
|   |   |   |   +-- cookies/
|   |   |   |   +-- download/
|   |   |   |   +-- faqs/
|   |   |   |   +-- help/
|   |   |   |   +-- how-it-works/
|   |   |   |   +-- investor/
|   |   |   |   +-- locations/
|   |   |   |   +-- login/
|   |   |   |   +-- partner/
|   |   |   |   +-- pods/ + [id]/   # [id] redirects → /property/[id]
|   |   |   |   +-- press/
|   |   |   |   +-- pricing/
|   |   |   |   +-- privacy/
|   |   |   |   +-- profile/
|   |   |   |   |   +-- bookings/   # NEW: My Bookings
|   |   |   |   +-- property/[id]/  # NEW: property detail (rooms + pods tabs)
|   |   |   |   +-- refund/
|   |   |   |   +-- safety/
|   |   |   |   +-- search/         # NEW: search results + filters
|   |   |   |   +-- signup/
|   |   |   |   +-- terms/
|   |   |   |   +-- tickets/
|   |   |   |   +-- not-found.tsx   # NEW: App Router 404
|   |   |   |   +-- error.tsx       # NEW: App Router error boundary
|   |   |   |   +-- layout.tsx
|   |   |   |   +-- globals.css
|   |   |   +-- components/
|   |   |   |   +-- ui/             # Button, GlassCard, HeroPodSlider, ImageSlider, Input
|   |   |   |   +-- layout/         # Navbar, Footer, LayoutWrapper, MobileBottomNav
|   |   |   |   +-- pods/           # FilterSection, PodCard, PropertyCard
|   |   |   |   +-- search/         # NEW: SearchBar (hero + compact variants)
|   |   |   |   +-- PWAInstallPrompt.tsx
|   |   |   +-- lib/                # api.ts, seo.ts, utils.ts
|   |   |   +-- store/              # auth.ts + bookings.ts (Zustand persisted)
|   |   |   +-- data/               # properties.ts, rooms.ts (NEW), search.ts (NEW)
|   |   +-- .next/                  # ✅ Production build exists
|   |   +-- next.config.js
|   |   +-- tailwind.config.js
|   |   +-- package.json            # react/react-dom pinned to 18.3.1
|   |
|   +-- admin/                      # ❌ Empty
|   +-- partner/                    # ❌ Empty
|   +-- investor/                   # ❌ Empty
|   +-- associate/                  # ❌ Empty
|   +-- rental/                     # ❌ Empty
|   +-- mobile/                     # ❌ Empty
|
+-- services/
|   |
|   +-- api-gateway/                # ✅ Live
|   |   +-- src/
|   |   |   +-- index.ts            # ~244 lines - Gateway proxying to auth-service + Swagger
|   |   +-- dist/                   # ✅ Built
|   |   +-- package.json            # Elysia + cors + swagger + jwt + @naploo/db
|   |
|   +-- auth-service/               # ✅ Live (fully functional)
|   |   +-- src/
|   |   |   +-- index.ts            # ~425 lines - send-otp, verify-otp, refresh, me, profile, logout (all real DB)
|   |   +-- dist/                   # ✅ Built
|   |   +-- package.json            # Elysia + cors + jwt + @naploo/db + drizzle-orm
|   |
|   +-- booking-service/            # ✅ Live bookings + cancellation flow
|   +-- payment-service/            # ✅ Live Cashfree hosted checkout
|   +-- investor-service/           # ❌ Empty directory
|   +-- referral-service/           # ❌ Empty directory
|   +-- rental-service/             # ❌ Empty directory
|   +-- hotel-service/              # ✅ Live hotels/rooms/pod sets
|   +-- notification-service/       # ❌ Empty directory
|   +-- analytics-service/          # ❌ Empty directory
|   +-- search-service/             # ❌ Empty directory
|
+-- packages/
|   |
|   +-- db/                         # ✅ Implemented (Drizzle ORM)
|   |   +-- src/
|   |   |   +-- schema/
|   |   |   |   +-- users.ts        # users, otps, refresh_tokens tables
|   |   |   |   +-- partners.ts     # partners table
|   |   |   |   +-- pods.ts         # pod_sets, pods tables
|   |   |   |   +-- rooms.ts        # rooms table
|   |   |   |   +-- bookings.ts     # bookings table
|   |   |   |   +-- investors.ts    # investors, investments, investment_earnings tables
|   |   |   |   +-- payments.ts     # payments, payouts, wallets, wallet_transactions tables
|   |   |   |   +-- referrals.ts    # associates, referrals, referral_earnings, commission_config tables
|   |   |   |   +-- index.ts
|   |   |   +-- client.ts
|   |   |   +-- index.ts
|   |   +-- drizzle/
|   |   |   +-- 0000_tranquil_skrulls.sql  # Initial migration (360 lines)
|   |   +-- drizzle.config.ts
|   |   +-- package.json
|   |
|   +-- ui/                         # ❌ Empty
|   +-- types/                      # ❌ Empty
|   +-- config/                     # ❌ Empty
|
+-- docs/                           # ✅ Documentation
|   +-- PROJECT_DOCUMENTATION.md
|   +-- API_REFERENCE.md
|   +-- DEPLOYMENT.md
|   +-- DEPLOYMENT_GUIDE.md
|   +-- DESIGN_SYSTEM.md
|
+-- Pods_Images/                    # ✅ Pod product images (multiple series)
+-- .env                            # Environment configuration
+-- package.json                    # Root monorepo config (Bun workspaces)
+-- bun.lock                        # Bun lockfile
+-- README.md
```

---

## 6. Feature Specifications

### 6.1 Investor Pool Portal Features

#### 6.1.1 Pool Enrollment Flow

```
Step 1: Registration
    |
    v
Step 2: KYC Verification
    - Aadhaar/PAN verification
    - Bank account verification
    - Address proof
    |
    v
Step 3: Submit for Approval
    |
    v
Step 4: Admin Review
    - Verification department checks documents
    - Background verification
    |
    v
Step 5: Approval/Rejection
    - If approved: Join investor pool
    - If rejected: Reason provided
    |
    v
Step 6: Pool Member Dashboard
    - View announcements
    - Claim pod sets
    - Track earnings
```

#### 6.1.2 Investor Dashboard

```typescript
interface InvestorPoolDashboard {
  poolStatus: {
    isApproved: boolean;
    enrollmentDate: Date;
    kycStatus: 'pending' | 'verified' | 'rejected';
    totalPoolMembers: number;
  };
  
  podSets: InvestorPodSet[];
  
  earnings: {
    totalInvested: number;           // Total Rs. invested
    totalEarned: number;             // Total 60% share earned
    currentMonthEarnings: number;
    pendingWithdrawal: number;
    progressTo3x: number;            // Percentage to 3x
  };
  
  announcements: HotelAnnouncement[];
  
  charts: {
    earningsOverTime: ChartData;
    occupancyByPodSet: ChartData;
    progressTo3x: ChartData;
  };
}

interface InvestorPodSet {
  id: string;
  purchaseDate: Date;
  hotel: {
    id: string;
    name: string;
    city: string;
  };
  pods: Pod[];                      // 2 pods per set
  investmentAmount: number;          // Rs. 5,00,000
  gstAmount: number;                 // Rs. 90,000
  totalPaid: number;                 // Rs. 5,90,000
  deliveryOption: 'doorstep' | 'leaseback';
  
  // Only for leaseback
  leasebackDetails?: {
    totalEarned: number;
    targetAmount: number;            // 3x = Rs. 15,00,000
    progressPercentage: number;
    estimatedCompletionDate: Date;
    status: 'active' | '3x_achieved' | 'transferred_to_naploo';
  };
}

interface HotelAnnouncement {
  id: string;
  hotelName: string;
  city: string;
  state: string;
  address: string;
  totalPodSets: number;
  availablePodSets: number;
  pricePerSet: number;               // Rs. 5,00,000
  gstPerSet: number;                 // Rs. 90,000
  images: string[];
  expectedROI: string;
  announcementDate: Date;
  claimDeadline: Date;
  status: 'open' | 'fully_claimed' | 'closed';
}
```

#### 6.1.3 3x Return Tracker

```typescript
interface ThreeXTracker {
  investment: {
    podSetId: string;
    baseAmount: number;              // Rs. 5,00,000
    targetReturn: number;            // Rs. 15,00,000 (3x)
  };
  
  earnings: {
    totalEarned: number;
    remainingToTarget: number;
    percentageComplete: number;
  };
  
  timeline: {
    startDate: Date;
    expectedEndDate: Date;           // 3 years from start
    projectedCompletionDate: Date;   // Based on current rate
    daysRemaining: number;
  };
  
  monthlyBreakdown: {
    month: string;
    bookings: number;
    revenue: number;
    investorShare: number;           // 60%
  }[];
  
  status: {
    isOnTrack: boolean;
    message: string;
    // "On track to achieve 3x by Dec 2028"
    // "Behind schedule - contract will extend"
    // "3x achieved! Pods transferred to Naploo"
  };
}
```

### 6.2 Associate/Referral Portal Features

#### 6.2.1 Referral Dashboard

```typescript
interface AssociateDashboard {
  profile: {
    associateId: string;
    name: string;
    joinDate: Date;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  
  referralLinks: {
    hotel: string;                   // For hotel tie-ups
    investor: string;                // For investor referrals
    customer: string;                // For booking referrals
    associate: string;               // For new associates
    space: string;                   // For space referrals
  };
  
  network: {
    level1Count: number;
    level2Count: number;
    level3Count: number;
    level4Count: number;
    level5Count: number;
    totalNetwork: number;
  };
  
  earnings: {
    thisMonth: number;
    lastMonth: number;
    allTime: number;
    pendingPayout: number;
    nextPayoutDate: Date;
  };
  
  recentActivity: ReferralActivity[];
}

interface ReferralActivity {
  id: string;
  type: 'hotel' | 'investor' | 'customer' | 'associate' | 'space';
  referredName: string;
  level: 1 | 2 | 3 | 4 | 5;
  amount: number;
  commissionEarned: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'paid';
}
```

#### 6.2.2 5-Level Network View

```typescript
interface ReferralTree {
  associate: {
    id: string;
    name: string;
  };
  
  levels: {
    level: 1 | 2 | 3 | 4 | 5;
    referrals: {
      id: string;
      name: string;
      type: 'hotel' | 'investor' | 'customer' | 'associate' | 'space';
      joinDate: Date;
      totalValue: number;           // Total business generated
      yourCommission: number;       // Your share at this level
      children?: ReferralTree[];    // Their referrals (next level)
    }[];
    totalCommission: number;
    commissionRate: number;         // e.g., 5% for level 1, 3% for level 2
  }[];
  
  summary: {
    totalNetworkSize: number;
    totalCommissionEarned: number;
    activeReferrals: number;
  };
}
```

#### 6.2.3 Commission Configuration (Admin)

```typescript
interface CommissionConfig {
  hotelTieUp: {
    oneTimeBonus: number;           // e.g., Rs. 10,000
    level1: number;                 // 5% of hotel earnings
    level2: number;                 // 3%
    level3: number;                 // 2%
    level4: number;                 // 1%
    level5: number;                 // 0.5%
  };
  
  investorReferral: {
    level1: number;                 // 2% of investment
    level2: number;                 // 1%
    level3: number;                 // 0.5%
    level4: number;                 // 0.25%
    level5: number;                 // 0.1%
  };
  
  customerReferral: {
    level1: number;                 // 10% of booking value
    level2: number;                 // 5%
    level3: number;                 // 3%
    level4: number;                 // 2%
    level5: number;                 // 1%
  };
  
  spaceReferral: {
    oneTimeFee: number;             // e.g., Rs. 5,000
    level1: number;                 // 50% of fee
    level2: number;                 // 25%
    level3: number;                 // 15%
    level4: number;                 // 7%
    level5: number;                 // 3%
  };
  
  associateReferral: {
    // Percentage of associate's total earnings
    level1: number;                 // 10%
    level2: number;                 // 5%
    level3: number;                 // 3%
    level4: number;                 // 2%
    level5: number;                 // 1%
  };
}
```

### 6.3 Rental Portal Features

#### 6.3.1 Home Pod Rental

```typescript
interface HomePodRental {
  options: {
    singlePod: {
      monthlyRent: number;          // e.g., Rs. 5,000/month
      setupFee: number;             // e.g., Rs. 10,000
      securityDeposit: number;      // e.g., Rs. 15,000
    };
    doublePod: {
      monthlyRent: number;
      setupFee: number;
      securityDeposit: number;
    };
  };
  
  contract: {
    minimumTerm: 12;                // months
    noticePeriod: 2;                // months
    renewalTerms: string;
  };
  
  includes: string[];               // Installation, maintenance, etc.
}

interface RentalContract {
  id: string;
  customerId: string;
  type: 'home' | 'office';
  podType: 'single' | 'double';
  podCount: number;
  
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  
  pricing: {
    monthlyRent: number;
    setupFee: number;
    securityDeposit: number;
    gst: number;
  };
  
  dates: {
    surveyDate: Date;
    installationDate: Date;
    startDate: Date;
    endDate: Date;                  // 12 months from start
  };
  
  status: 'survey_requested' | 'survey_scheduled' | 'survey_completed' |
          'contract_pending' | 'active' | 'renewed' | 'terminated';
  
  payments: RentalPayment[];
  maintenanceRequests: MaintenanceRequest[];
}
```

#### 6.3.2 Office Nap Room

```typescript
interface OfficeNapRoom {
  packages: {
    starter: {
      podCount: 2;
      monthlyRent: number;
      setupFee: number;
      maxEmployees: 50;
    };
    professional: {
      podCount: 5;
      monthlyRent: number;
      setupFee: number;
      maxEmployees: 150;
    };
    enterprise: {
      podCount: 10;
      monthlyRent: number;
      setupFee: number;
      maxEmployees: 500;
    };
    custom: {
      podCount: 'configurable';
      monthlyRent: 'quote';
      setupFee: 'quote';
      maxEmployees: 'unlimited';
    };
  };
  
  features: string[];
  // - Dedicated pod booking system for employees
  // - Usage analytics dashboard
  // - Priority maintenance
  // - Branded pod customization
  // - Employee wellness reports
  
  contract: {
    minimumTerm: 12;
    noticePeriod: 3;
    corporateDiscounts: boolean;
  };
}
```

### 6.4 Pod Alignment & Visual Selection (Like Movie Seat Booking)

When a hotel is onboarded, the admin configures the pod alignment/layout for the hall.
Customers can visually select pods similar to how movie seats are selected.

#### 6.4.1 Pod Layout Structure

```
+-----------------------------------------------------------------------------+
|                     HOTEL HALL - POD ALIGNMENT VIEW                          |
|                     (Similar to Movie Theater Seat Map)                      |
+-----------------------------------------------------------------------------+
|                                                                              |
|    ENTRANCE                                                                  |
|       |                                                                      |
|       v                                                                      |
|                                                                              |
|   ROW A (Pod Set 1)          ROW B (Pod Set 2)          ROW C (Pod Set 3)   |
|   +-------+-------+          +-------+-------+          +-------+-------+   |
|   |  A1   |  A2   |          |  B1   |  B2   |          |  C1   |  C2   |   |
|   | UPPER | LOWER |          | UPPER | LOWER |          | UPPER | LOWER |   |
|   |Single |Single |          |Double |Double |          |Single |Single |   |
|   +-------+-------+          +-------+-------+          +-------+-------+   |
|                                                                              |
|   ROW D (Pod Set 4)          ROW E (Pod Set 5)          ROW F (Pod Set 6)   |
|   +-------+-------+          +-------+-------+          +-------+-------+   |
|   |  D1   |  D2   |          |  E1   |  E2   |          |  F1   |  F2   |   |
|   | UPPER | LOWER |          | UPPER | LOWER |          | UPPER | LOWER |   |
|   |Double |Double |          |Single |Single |          |Double |Double |   |
|   +-------+-------+          +-------+-------+          +-------+-------+   |
|                                                                              |
|   LEGEND:                                                                    |
|   +-------+  AVAILABLE (Green)    - Can book                                |
|   +-------+  OCCUPIED (Red)       - Currently booked                        |
|   +-------+  SELECTED (Blue)      - Your selection                          |
|   +-------+  MAINTENANCE (Gray)   - Under maintenance                       |
|                                                                              |
|   NOTE: Each Pod Set = 2 Pods (Upper + Lower, stacked vertically)           |
|         Like bunk beds in capsule hotels                                     |
+-----------------------------------------------------------------------------+
```

#### 6.4.2 Pod Alignment Data Structure

```typescript
interface HotelPodAlignment {
  hotelId: string;
  hallId: string;
  hallName: string;                   // "Main Hall", "Floor 2 Hall"
  
  layout: {
    rows: number;                      // Number of rows
    columns: number;                   // Pod sets per row
    totalPodSets: number;
    totalPods: number;                 // totalPodSets * 2
  };
  
  podSets: PodSetLayout[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface PodSetLayout {
  setId: string;
  row: string;                         // "A", "B", "C", etc.
  column: number;                      // 1, 2, 3, etc.
  position: string;                    // "A1", "B2", etc.
  
  upperPod: PodDetails;                // Pod on top (like upper bunk)
  lowerPod: PodDetails;                // Pod below (like lower bunk)
  
  // Pod set belongs to an investor
  investorId?: string;
  investorPurchaseId?: string;
}

interface PodDetails {
  podId: string;
  podNumber: string;                   // "A1-U", "A1-L" (Upper/Lower)
  type: 'single' | 'double';
  position: 'upper' | 'lower';
  
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  
  pricing: {
    hourlyRate: number;                // Rs. 150 for single, Rs. 200 for double
    minimumHours: number;              // 1 hour
    maximumHours: number;              // 12 hours
  };
  
  amenities: string[];                 // WiFi, USB, AC, Reading Light
  
  // If occupied
  currentBooking?: {
    bookingId: string;
    checkIn: Date;
    checkOut: Date;
    guestName: string;
  };
}

interface PodSelectionState {
  hotelId: string;
  hallId: string;
  selectedPods: string[];              // Array of podIds
  checkInTime: Date;
  duration: number;                    // Hours
  
  pricing: {
    subtotal: number;
    taxes: number;
    discount: number;
    total: number;
  };
}
```

#### 6.4.3 Admin Pod Alignment Configuration

When onboarding a hotel, admin configures the pod layout:

```typescript
interface AdminPodLayoutConfig {
  // Step 1: Define Hall
  hall: {
    name: string;
    floorNumber: number;
    dimensions?: { length: number; width: number };
  };
  
  // Step 2: Configure Grid
  grid: {
    rows: number;                      // e.g., 5 rows (A-E)
    columnsPerRow: number;             // e.g., 10 pod sets per row
    // Total = 5 rows x 10 sets x 2 pods = 100 pods
  };
  
  // Step 3: Assign Pod Types per Set
  podAssignments: {
    position: string;                  // "A1"
    upperPodType: 'single' | 'double';
    lowerPodType: 'single' | 'double';
    upperPodPrice: number;
    lowerPodPrice: number;
  }[];
  
  // Step 4: Mark any positions as unavailable (pillars, walkways)
  unavailablePositions: string[];      // ["B5", "D5"] - walkway
}
```

#### 6.4.4 Customer Pod Selection UI Flow

```
1. Customer arrives at hotel page
   |
   v
2. Clicks "Book Pod" button
   |
   v
3. Selects date and time slot
   |
   v
4. POD ALIGNMENT MAP LOADS
   - Visual grid showing all pod sets
   - Each pod set shows 2 pods (upper/lower)
   - Color coded: Available (green), Occupied (red)
   |
   v
5. Customer taps on available pod
   - Pod highlights in blue (selected)
   - Bottom sheet shows pod details and price
   |
   v
6. Customer can select multiple pods
   - Total updates in real-time
   |
   v
7. Clicks "Proceed to Book"
   - Moves to checkout with selected pods
```

### 6.5 Customer Website Features

#### 6.5.1 Unified Search

```typescript
interface SearchParams {
  city?: string;
  coordinates?: { lat: number; lng: number };
  radius?: number;                    // km
  checkIn: string;
  checkOut?: string;                  // For room bookings
  duration?: number;                  // Hours for pod bookings
  accommodationType?: 'pod' | 'room' | 'all';
  podType?: 'single' | 'double' | 'any';
  roomType?: 'single' | 'double' | 'suite' | 'any';
  guests?: number;
  priceRange?: { min: number; max: number };
  amenities?: string[];
  rating?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
}

interface HotelCard {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  
  hasPods: boolean;
  availablePods?: number;
  podPricePerHour?: number;
  
  hasRooms: boolean;
  availableRooms?: number;
  roomPricePerNight?: number;
  
  badges: ('Popular' | 'New' | 'Top Rated' | 'Naploo Partner')[];
}
```

#### 6.4.2 Booking Flows

**Pod Booking Flow (Hourly):**
```
Step 1: Search Location/Hotel
    |
    v
Step 2: Select Hotel with Pods
    |
    v
Step 3: View Pod Alignment Map (like movie seat selection)
    |
    v
Step 4: Choose Specific Pod from Layout
    |
    v
Step 5: Select Start Time & Duration
    |
    v
Step 6: Review Pricing (hourly rate + discounts)
    |
    v
Step 7: Enter Guest Details
    |
    v
Step 8: Complete Payment
    |
    v
Step 9: Receive QR Code for Check-in
```

**Room Booking Flow (Traditional):**
```
Step 1: Search Location
    |
    v
Step 2: Select Check-in & Check-out Dates
    |
    v
Step 3: Select Hotel
    |
    v
Step 4: Choose Room Type & View Photos
    |
    v
Step 5: Review Room Details & Policies
    |
    v
Step 6: Enter Guest Details (ID required)
    |
    v
Step 7: Apply Coupon (if any)
    |
    v
Step 8: Complete Payment
    |
    v
Step 9: Receive Booking Confirmation
```

### 6.5 Partner Portal Features (Hotels & Homestays)

Both hotel owners and homestay owners use the same Partner Portal with features tailored to their property type.

#### 6.5.1 Partner Dashboard

```typescript
interface PartnerDashboard {
  overview: {
    todayRevenue: number;
    todayBookings: number;
    occupancyRate: number;
    podUtilization: number;
    avgRating: number;
    pendingPayout: number;
  };
  
  property: {
    name: string;
    type: 'hotel' | 'homestay';
    status: 'active' | 'inactive' | 'pending';
    partnershipType: 'with_investment' | 'without_investment';
    revenueSharePercent: number;      // % from Naploo's 40%
    totalRooms?: number;              // Hotels only
    totalPods: number;
    listings: {
      rooms?: RoomListing[];          // Hotels only
      pods: PodListing[];
    };
  };
  
  todaySchedule: {
    checkIns: Booking[];
    checkOuts: Booking[];
    podSessions: PodBooking[];
  };
  
  recentBookings: Booking[];
  alerts: Alert[];
}
```

#### 6.5.2 Partnership Types Display

```typescript
interface PartnershipInfo {
  type: 'with_investment' | 'without_investment';
  
  // If WITHOUT investment
  withoutInvestment?: {
    agreementYears: number;           // 5+
    revenueSharePercent: number;      // From Naploo's 40%
    podsProvided: number;             // Free from Naploo
    startDate: Date;
    endDate: Date;
  };
  
  // If WITH investment
  withInvestment?: {
    podsOwned: number;
    totalInvestment: number;
    hasGuarantee: boolean;
    guaranteeDetails?: {
      targetReturn: number;           // 3x
      currentEarnings: number;
      remainingToTarget: number;
    };
  };
}
```

#### 6.5.3 Revenue Share Configuration

| Partner Type | City Tier | Share from Naploo's 40% | Notes |
|--------------|-----------|-------------------------|-------|
| Hotel | Metro | 8-12% | High traffic, professional setup |
| Hotel | Tier-1 | 10-15% | Good traffic |
| Hotel | Tier-2/3 | 12-18% | Lower traffic, higher incentive |
| Homestay | Metro | 10-15% | Unique locations |
| Homestay | Tier-1 | 12-18% | Tourist areas |
| Homestay | Tier-2/3/Rural | 15-20% | Remote/unique locations |

#### 6.5.4 Homestay-Specific Features

```typescript
interface HomestayListing {
  homestayId: string;
  
  basicInfo: {
    name: string;
    description: string;
    address: Address;
    coordinates: { lat: number; lng: number };
  };
  
  host: {
    name: string;
    photo: string;
    about: string;
    languages: string[];
    responseRate: number;
    responseTime: string;             // "Within an hour"
  };
  
  pods: {
    totalSets: number;
    layout: PodSetLayout[];
  };
  
  highlights: string[];               // "Beach Access", "Mountain View", "Farm Stay"
  
  amenities: {
    pod: string[];                    // "AC", "WiFi", "USB Charging"
    common: string[];                 // "Kitchen Access", "Parking", "Garden"
  };
  
  houseRules: string[];
  
  pricing: {
    singlePodHourly: number;
    doublePodHourly: number;
    minimumHours: number;
    maximumHours: number;
  };
  
  images: {
    cover: string;
    pods: string[];
    commonAreas: string[];
    surroundings: string[];
  };
}
```

#### 6.5.5 Commission Structure

| Booking Type | Naploo Gets | Pod Owner Gets | Partner Gets |
|-------------|-------------|----------------|--------------|
| Pod Booking (Investor-owned) | 40% | 60% (Investor) | From Naploo's 40% |
| Pod Booking (Owner-purchased) | 40% | 60% (Owner) | - |
| Room Booking | 15-20% | - | 80-85% |
| Premium Listing | Extra 5% | - | Featured placement |

#### 6.5.6 Pod Layout Configuration

When a partner hotel is onboarded, they configure their pod layout:

```typescript
interface PartnerPodLayoutSetup {
  // Hotel hall where pods are installed
  halls: {
    hallId: string;
    name: string;                      // "Main Hall", "Basement Hall"
    floorNumber: number;
    
    // Configure the grid layout
    layout: {
      rows: number;                    // A, B, C...
      setsPerRow: number;              // Pod sets in each row
    };
    
    // Configure each pod set
    podSets: {
      position: string;                // "A1", "A2", "B1"...
      upperPod: {
        type: 'single' | 'double';
        hourlyRate: number;
      };
      lowerPod: {
        type: 'single' | 'double';
        hourlyRate: number;
      };
    }[];
    
    // Mark walkways, pillars, emergency exits
    blockedPositions: string[];
  }[];
}
```

**Partner Pod Layout Setup Flow:**
```
1. Login to Partner Portal
   |
   v
2. Go to "Pod Management" → "Configure Layout"
   |
   v
3. Select/Create Hall
   - Enter hall name and floor
   |
   v
4. Define Grid Size
   - Set number of rows (e.g., 5 rows: A-E)
   - Set pod sets per row (e.g., 8 sets)
   |
   v
5. Visual Grid Editor Opens
   - Click each pod set position
   - Configure upper/lower pod types
   - Set hourly rates
   |
   v
6. Mark Blocked Areas
   - Click positions for walkways/pillars
   |
   v
7. Save & Preview
   - See customer view of pod map
   |
   v
8. Submit for Admin Approval
```

### 6.6 Admin Dashboard Features

#### 6.6.1 Admin Modules

```
+-- Dashboard
|   +-- Key Metrics (Bookings, Revenue, Users, Partners)
|   +-- Today's Activity
|   +-- Platform Health
|   +-- Alerts & Issues
|
+-- Partner Management
|   +-- Hotels
|   |   +-- All Hotels
|   |   +-- Pending Approvals
|   |   +-- Room & Pod Inventory
|   |
|   +-- Homestays
|   |   +-- All Homestays
|   |   +-- Pending Approvals
|   |   +-- Pod Inventory
|   |
|   +-- Partnership Agreements
|   |   +-- With Investment
|   |   +-- Without Investment (5-year contracts)
|   |
|   +-- Revenue Share Configuration
|       +-- City-wise Rates
|       +-- Partner-specific Rates
|
+-- Investor Management
|   +-- Investor Pool
|   +-- KYC Approvals
|   +-- Pod Set Purchases
|   +-- 3x Return Tracking
|   +-- Scrap Policy Management
|
+-- Announcements
|   +-- Create Hotel Announcement
|   +-- Create Homestay Announcement
|   +-- Manage Active Announcements
|   +-- Pod Set Allocation
|
+-- Associate Management
|   +-- All Associates
|   +-- Commission Configuration
|   +-- Payout Processing
|   +-- Network Analytics
|
+-- Rental Management
|   +-- Home Rental Contracts
|   +-- Office Nap Room Contracts
|   +-- Maintenance Requests
|   +-- Survey Scheduling
|
+-- Booking Management
|   +-- All Bookings (Pods + Rooms)
|   +-- Homestay Bookings
|   +-- Hotel Bookings
|   +-- Refunds & Cancellations
|
+-- Financial Management
|   +-- Revenue Reports
|   +-- Partner Payouts
|   +-- Investor Payouts
|   +-- Associate Payouts
|   +-- Tax Reports
|
+-- Reports & Analytics
    +-- Occupancy Reports (Hotels vs Homestays)
    +-- Revenue Analytics
    +-- Partner Performance
    +-- Investor ROI Reports
    +-- Referral Performance
```

---

## 7. Database Design

### 7.1 Core Tables (Drizzle ORM Schema)

```typescript
// packages/database/src/schema/users.ts
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'customer', 'hotel_owner', 'investor', 'associate', 'admin'
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('customer'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 7.2 Investor Pool Tables

```typescript
// packages/database/src/schema/investors.ts

export const investorPoolStatusEnum = pgEnum('investor_pool_status', [
  'pending', 'kyc_submitted', 'kyc_verified', 'approved', 'rejected'
]);

export const investorPool = pgTable('investor_pool', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  status: investorPoolStatusEnum('status').default('pending'),
  kycData: jsonb('kyc_data'),        // Aadhaar, PAN, etc.
  kycVerifiedAt: timestamp('kyc_verified_at'),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hotelAnnouncements = pgTable('hotel_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  hotelId: uuid('hotel_id').references(() => hotels.id),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  totalPodSets: integer('total_pod_sets'),
  availablePodSets: integer('available_pod_sets'),
  pricePerSet: decimal('price_per_set', { precision: 12, scale: 2 }),
  gstPerSet: decimal('gst_per_set', { precision: 12, scale: 2 }),
  images: jsonb('images'),
  claimDeadline: timestamp('claim_deadline'),
  status: varchar('status', { length: 50 }).default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
});

export const deliveryOptionEnum = pgEnum('delivery_option', [
  'doorstep', 'leaseback'
]);

export const podSetPurchases = pgTable('pod_set_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  investorId: uuid('investor_id').references(() => investorPool.id),
  announcementId: uuid('announcement_id').references(() => hotelAnnouncements.id),
  hotelId: uuid('hotel_id').references(() => hotels.id),
  podSetCount: integer('pod_set_count'),
  baseAmount: decimal('base_amount', { precision: 12, scale: 2 }),
  gstAmount: decimal('gst_amount', { precision: 12, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  deliveryOption: deliveryOptionEnum('delivery_option'),
  paymentId: uuid('payment_id').references(() => payments.id),
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  purchaseDate: timestamp('purchase_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const threeXTrackerStatusEnum = pgEnum('three_x_status', [
  'active', 'achieved', 'transferred_to_naploo'
]);

export const threeXTracker = pgTable('three_x_tracker', {
  id: uuid('id').primaryKey().defaultRandom(),
  podSetPurchaseId: uuid('pod_set_purchase_id').references(() => podSetPurchases.id),
  investorId: uuid('investor_id').references(() => investorPool.id),
  investmentAmount: decimal('investment_amount', { precision: 12, scale: 2 }),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }), // 3x
  totalEarned: decimal('total_earned', { precision: 12, scale: 2 }).default('0'),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  startDate: timestamp('start_date'),
  expectedEndDate: timestamp('expected_end_date'),  // 3 years from start
  actualEndDate: timestamp('actual_end_date'),      // When 3x achieved
  status: threeXTrackerStatusEnum('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const investorEarnings = pgTable('investor_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  investorId: uuid('investor_id').references(() => investorPool.id),
  podSetPurchaseId: uuid('pod_set_purchase_id').references(() => podSetPurchases.id),
  bookingId: uuid('booking_id').references(() => bookings.id),
  bookingAmount: decimal('booking_amount', { precision: 12, scale: 2 }),
  investorShare: decimal('investor_share', { precision: 12, scale: 2 }), // 60%
  naplooShare: decimal('naploo_share', { precision: 12, scale: 2 }),     // 40%
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 7.3 Referral System Tables

```typescript
// packages/database/src/schema/referrals.ts

export const referralTypeEnum = pgEnum('referral_type', [
  'hotel', 'investor', 'customer', 'associate', 'space'
]);

export const associates = pgTable('associates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  referredBy: uuid('referred_by').references(() => associates.id),
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  tier: varchar('tier', { length: 20 }).default('bronze'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const referralLinks = pgTable('referral_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  associateId: uuid('associate_id').references(() => associates.id),
  type: referralTypeEnum('type'),
  code: varchar('code', { length: 50 }).unique(),
  url: varchar('url', { length: 500 }),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').references(() => associates.id),      // Who referred
  referredUserId: uuid('referred_user_id').references(() => users.id),  // Who was referred
  type: referralTypeEnum('type'),
  level: integer('level'),           // 1-5
  sourceAssociateId: uuid('source_associate_id').references(() => associates.id), // Original L1 referrer
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const referralCommissions = pgTable('referral_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  referralId: uuid('referral_id').references(() => referrals.id),
  associateId: uuid('associate_id').references(() => associates.id),
  level: integer('level'),
  transactionType: varchar('transaction_type', { length: 50 }), // booking, investment, signup
  transactionId: uuid('transaction_id'),
  transactionAmount: decimal('transaction_amount', { precision: 12, scale: 2 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 50 }).default('pending'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const commissionConfig = pgTable('commission_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  referralType: referralTypeEnum('referral_type'),
  level: integer('level'),           // 1-5
  rate: decimal('rate', { precision: 5, scale: 2 }),
  oneTimeBonus: decimal('one_time_bonus', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
});
```

### 7.4 Rental System Tables

```typescript
// packages/database/src/schema/rentals.ts

export const rentalTypeEnum = pgEnum('rental_type', ['home', 'office']);
export const rentalStatusEnum = pgEnum('rental_status', [
  'survey_requested', 'survey_scheduled', 'survey_completed',
  'quote_sent', 'contract_pending', 'active', 'renewed', 'terminated'
]);

export const rentalContracts = pgTable('rental_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id),
  type: rentalTypeEnum('type'),
  
  // Address
  street: varchar('street', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  
  // Pod details
  podType: varchar('pod_type', { length: 20 }),
  podCount: integer('pod_count'),
  
  // Pricing
  monthlyRent: decimal('monthly_rent', { precision: 12, scale: 2 }),
  setupFee: decimal('setup_fee', { precision: 12, scale: 2 }),
  securityDeposit: decimal('security_deposit', { precision: 12, scale: 2 }),
  gst: decimal('gst', { precision: 12, scale: 2 }),
  
  // Dates
  surveyDate: timestamp('survey_date'),
  installationDate: timestamp('installation_date'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  
  status: rentalStatusEnum('status').default('survey_requested'),
  contractDocUrl: varchar('contract_doc_url', { length: 500 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => rentalContracts.id),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  status: varchar('status', { length: 50 }).default('pending'),
  scheduledDate: timestamp('scheduled_date'),
  completedDate: timestamp('completed_date'),
  technicianNotes: text('technician_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rentalPayments = pgTable('rental_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => rentalContracts.id),
  type: varchar('type', { length: 50 }), // rent, setup, deposit
  amount: decimal('amount', { precision: 12, scale: 2 }),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  paymentId: uuid('payment_id').references(() => payments.id),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 8. API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

### 8.1 Currently Live Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/health` | GET | ✅ Live |
| `/` | GET | ✅ Live (gateway info) |
| `/swagger` | GET | ✅ Live (Swagger UI) |
| `/api/v1/auth/health` | GET | ✅ Live (stub) |
| `/api/v1/bookings/health` | GET | ✅ Live (stub) |
| `/api/v1/investors/health` | GET | ✅ Live (stub) |
| `/api/v1/partners/health` | GET | ✅ Live (stub) |

> **Note:** Auth routes are fully proxied to auth-service. Other `/api/v1/*` health checks still return static JSON.

### 8.2 Auth Service Endpoints (Live)

| Endpoint | Method | Status | Details |
|----------|--------|--------|----------|
| `POST /api/v1/auth/send-otp` | POST | ✅ Live | Generates OTP, stores in DB (5min expiry), rate limited 5/10min |
| `POST /api/v1/auth/verify-otp` | POST | ✅ Live | Verifies OTP from DB, creates/finds user, returns JWT access+refresh tokens |
| `POST /api/v1/auth/refresh` | POST | ✅ Live | Validates refresh token, issues new access+refresh pair |
| `GET /api/v1/auth/me` | GET | ✅ Live | Returns authenticated user profile (requires Bearer token) |
| `PATCH /api/v1/auth/profile` | PATCH | ✅ Live | Updates user profile fields (firstName, lastName, email, city, state) |
| `POST /api/v1/auth/logout` | POST | ✅ Live | Invalidates refresh token in DB |

### 8.3 Planned API Endpoints (Not Implemented)

The following endpoints are designed but have no backend implementation:

#### Investor Pool APIs
- `POST /api/v1/investors/enroll` - Enroll in investor pool
- `POST /api/v1/investors/kyc` - Submit KYC documents
- `GET /api/v1/investors/pool/status` - Get pool status
- `GET /api/v1/announcements` - List hotel announcements
- `POST /api/v1/pod-sets/claim` - Claim pod set from announcement
- `GET /api/v1/pod-sets/my-sets` - Get purchased pod sets
- `GET /api/v1/earnings` - Get earnings (60% share)
- `GET /api/v1/3x-tracker` - Track progress to 3x return

#### Referral APIs
- `POST /api/v1/associates/register` - Register as associate
- `GET /api/v1/referrals/links` - Get referral links
- `GET /api/v1/referrals/network` - Get 5-level network tree
- `GET /api/v1/referrals/commissions` - Get commission earnings
- `POST /api/v1/referrals/track` - Track referral conversion

#### Rental APIs
- `GET /api/v1/rentals/options` - Get rental options (home/office)
- `POST /api/v1/rentals/request-survey` - Request site survey
- `GET /api/v1/rentals/contracts` - Get rental contracts
- `POST /api/v1/rentals/maintenance` - Request maintenance

---

## 9. UI/UX Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design guidelines.

### 9.1 Color Palette

```css
:root {
  /* Primary Colors */
  --primary-500: #6366F1;        /* Indigo - Main brand */
  --primary-600: #4F46E5;        /* Darker shade */
  
  /* Secondary Colors */
  --secondary-500: #8B5CF6;      /* Purple - Accents */
  
  /* Success/Warning/Error */
  --success-500: #22C55E;        /* Green */
  --warning-500: #F59E0B;        /* Amber */
  --error-500: #EF4444;          /* Red */
  
  /* Neutrals */
  --gray-50: #F9FAFB;
  --gray-900: #111827;
}
```

---

## 10. Development Roadmap

### Phase 1: Foundation ← **CURRENT PHASE (Partially Complete)**
- [x] Set up Bun monorepo with workspaces
- [ ] ~~Set up Turborepo~~ (not used — using Bun workspaces)
- [ ] ~~Configure Docker~~ (not used — using systemd)
- [x] Set up PostgreSQL + Drizzle ORM (19 tables, 1 migration)
- [ ] Set up Kafka for event streaming (❌ not installed)
- [x] Customer website — 32+ routes live at naploo.com
- [x] API Gateway — live, proxies auth/booking/hotel/payment routes to services
- [x] Auth service — fully dynamic (PostgreSQL, Drizzle ORM, JWT, OTP in DB)
- [x] Build partner portal — functional inventory/bookings/earnings portal; QA pending
- [ ] Build admin dashboard — data tabs wired; broader QA pending
- [x] Domain + SSL + Cloudflare + Nginx configured
- [x] systemd services for auto-restart

### Phase 2: Backend Services (Next Priority)
- [x] Implement real auth service (OTP in DB, dual JWT access+refresh, profile CRUD) ✅
- [ ] Integrate SMS provider (MSG91/Twilio) for OTP delivery
- [x] Implement booking service (quote, create, list, detail, cancel/refund handoff)
- [x] Implement hotel service (search/detail, rooms, pod sets, partner hotel inventory)
- [x] Implement payment service (Cashfree hosted checkout, sandbox/production helper)
- [ ] Implement payment service (Razorpay integration)
- [ ] Implement hotel/partner service (listings, management)
- [x] API Gateway → proxies to auth-service ✅
- [x] Connect frontend auth pages to real APIs (login, signup, profile) ✅
- [ ] Connect frontend to remaining real APIs (replace mock data)

### Phase 3: Investor Pool
- [ ] Investor pool enrollment + KYC
- [ ] Hotel announcement system
- [ ] Pod set purchase flow
- [ ] 3x return tracking
- [ ] Investor earnings dashboard
- [ ] Investor portal app

### Phase 4: Referral System
- [ ] Associate registration
- [ ] Referral link generation + 5-level tracking
- [ ] Commission calculation + payout processing
- [ ] Associate portal app

### Phase 5: Rental Program
- [ ] Home rental flow
- [ ] Office nap room packages
- [ ] Contract management + maintenance
- [ ] Rental portal app

### Phase 6: Mobile & Additional Apps
- [ ] React Native / Expo setup
- [ ] Customer mobile app
- [ ] Admin dashboard

### Phase 7: Production Hardening
- [ ] Switch .env to NODE_ENV=production
- [ ] Redis integration for caching/sessions
- [ ] Notification service (email, SMS, push)
- [ ] Analytics service + reporting
- [ ] Search service (Elasticsearch)
- [ ] CI/CD pipeline
- [ ] Monitoring + alerting
- [ ] Security audit
- [ ] Load testing

---

## 11. Deployment Strategy

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment guides.

### 11.1 Current Deployment (Production)

**Server:** AWS EC2 (Ubuntu), hostname `ip-172-31-14-247`
**Process Manager:** systemd (NOT Docker)
**Runtime:** Bun 1.3.6

```bash
# Active systemd services
naploo-web.service    → bun run start in apps/web/         → port 3100
naploo-api.service    → bun run start in services/api-gateway/ → port 3000

# Nginx reverse proxy
naploo.com        → 127.0.0.1:3100  (Next.js web app)
api.naploo.com    → 127.0.0.1:3000  (API gateway)

# SSL: Let's Encrypt (auto-renewed via certbot)
# CDN/WAF: Cloudflare
```

### 11.2 Infrastructure Services

```bash
# Installed and running
PostgreSQL 14.20    → port 5432  (naploo_db database)
Redis 6.0.16        → port 6379  (installed, not actively used by app)
Nginx 1.18.0        → port 80/443
RabbitMQ            → installed via apt (not used by app)

# NOT installed
Docker              → ❌
Kafka               → ❌
Elasticsearch       → ❌
```

### 11.3 Planned: Docker Compose (Future)

Docker containerization is planned for future phases but is not currently in use.

---

## 12. Security Guidelines

### 12.1 Authentication (Current State)
- ⚠️ JWT tokens — implemented as stubs only (hardcoded secrets in .env)
- ⚠️ OTP — generates random 6-digit code, logs to console (no SMS delivery)
- ❌ OAuth 2.0 — not implemented
- ❌ Refresh token rotation — not implemented
- ❌ Rate limiting — not implemented at application level

### 12.2 Data Protection (Current State)
- ✅ HTTPS via Let's Encrypt SSL + Cloudflare
- ⚠️ Database credentials in `.env` file (placeholder JWT secrets need rotation)
- ⚠️ `.env` has `NODE_ENV=development` — should be `production`
- ❌ PII data encryption — not implemented
- ❌ GDPR compliance — not implemented

### 12.3 Infrastructure (Current State)
- ✅ Cloudflare WAF + DDoS protection
- ✅ Nginx reverse proxy with SSL
- ✅ systemd auto-restart on crash
- ❌ Regular security audits — not scheduled
- ❌ Penetration testing — not performed

### 12.4 Security TODOs (Priority)
1. Rotate JWT secrets (currently placeholder values)
2. Set `NODE_ENV=production` in `.env`
3. Implement real OTP delivery (MSG91)
4. Add rate limiting to auth endpoints
5. Implement refresh token rotation with DB storage
6. Enable PostgreSQL connection SSL

---

## 13. Testing Strategy

> **⚠️ Current State:** No tests exist in the codebase. No test framework is configured.
> The following is the planned testing strategy.

### 13.1 Test Types (Planned)
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Load testing (k6)

### 13.2 Coverage Targets (Planned)
- Unit: 80%+
- Integration: 70%+
- E2E: Critical paths

### 13.3 Testing TODOs
1. Install Vitest and configure for Bun runtime
2. Add unit tests for database schema/queries
3. Add API integration tests for auth-service
4. Set up Playwright for web app E2E testing
5. Configure CI to run tests on push

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| Pod Set | 2 pods (Single + Double or 2 Singles) |
| 3x Return | Guaranteed 3 times investment return |
| Scrap Policy | Pods transfer to Naploo after 3x achieved |
| Leaseback | Investor pods installed at hotel for revenue share |
| 5-Level Referral | Commission earned on 5 levels of referrals |
| Investor Pool | Verified investors eligible for announcements |

### 14.2 Reference Links
- [Naploo Website](https://naploo.com)
- [API Documentation](./API_REFERENCE.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Document Version History:**
- v3.1.0 (Feb 2026): Updated all sections to reflect actual implementation status vs planned features
- v3.0.0 (Jan 2026): Added Investor Pool, 5-Level Referral, Rental Program, Microservices architecture
- v2.0.0 (Jan 2026): Added hybrid hotel booking model
- v1.0.0 (Dec 2025): Initial documentation
