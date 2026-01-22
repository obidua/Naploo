# Naploo Ecosystem - Complete Project Documentation

> **Version:** 4.0.0  
> **Last Updated:** January 2026  
> **Company:** BIDUA Industries Pvt Ltd  
> **Project Lead:** Development Team  
> **Domain:** naploo.com

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

| Platform | Technology | Priority | Deployment |
|----------|------------|----------|------------|
| Customer Website (PWA) | Next.js 14 | Phase 1 | Linux Server |
| Partner Portal (Hotels/Homestays) | Next.js 14 | Phase 1 | Linux Server |
| Customer Mobile App | React Native + Expo | Phase 2 | App Stores |
| Investor Pool Portal | Next.js 14 | Phase 1 | Linux Server |
| Associate Portal | Next.js 14 | Phase 1 | Linux Server |
| Rental Portal | Next.js 14 | Phase 2 | Linux Server |
| Admin Dashboard | Next.js 14 | Phase 1 | Linux Server |
| Backend Services | Bun + Elysia (Microservices) | Parallel | Linux Server |

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

### 3.1 High-Level Architecture (Microservices)

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER                                   |
+---------------+---------------+---------------+---------------+----------+
|  Customer Web |  Hotel Owner  |   Investor    |   Associate   |  Mobile  |
|  (Next.js)    |   Portal      |   Portal      |    Portal     |   App    |
|  naploo.com   | partner.      | investor.     | associate.    | iOS/     |
|               | naploo.com    | naploo.com    | naploo.com    | Android  |
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
|                    CLOUDFLARE CDN + WAF + DDoS Protection                |
+-------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                      NGINX REVERSE PROXY + SSL                           |
|                    (Load Balancing, Rate Limiting)                       |
+-------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                         API GATEWAY (Elysia)                             |
|          (Authentication, Rate Limiting, Request Routing)                |
+-------------------------------------------------------------------------+
                                        |
        +---------------+---------------+---------------+---------------+
        |               |               |               |               |
        v               v               v               v               v
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
|    AUTH     | |   BOOKING   | |   PAYMENT   | |  INVESTOR   | |  REFERRAL   |
|   SERVICE   | |   SERVICE   | |   SERVICE   | |   SERVICE   | |   SERVICE   |
| (OAuth+JWT) | | (Pods+Rooms)| | (Razorpay)  | | (Pool+3x)   | | (5-Level)   |
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
        |               |               |               |               |
        v               v               v               v               v
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
|   RENTAL    | |   HOTEL     | |NOTIFICATION | |  ANALYTICS  | |   SEARCH    |
|   SERVICE   | |   SERVICE   | |   SERVICE   | |   SERVICE   | |   SERVICE   |
| (Home/Office)| | (Listings) | | (FCM+Email) | | (Reports)   | |(Elasticsearch)
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
        |               |               |               |               |
        +---------------+---------------+---------------+---------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                      APACHE KAFKA (Message Broker)                       |
|              (Event Streaming, Real-time Notifications)                  |
+-------------------------------------------------------------------------+
                                        |
        +---------------+---------------+---------------+---------------+
        |               |               |               |               |
        v               v               v               v               v
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
| PostgreSQL  |    Redis      |Elasticsearch  |Local Storage  |   Swagger    |
| (Drizzle    |  (Cache/      |  (Search)     | (Media Files) | (API Docs)   |
|    ORM)     |   Queue)      |               |               |              |
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+

                        SELF-HOSTED LINUX SERVER (Docker)
```

### 3.2 Microservices Overview

| Service | Port | Responsibility |
|---------|------|----------------|
| **api-gateway** | 3000 | Request routing, authentication, rate limiting |
| **auth-service** | 3001 | OAuth 2.0, JWT tokens, OTP verification |
| **booking-service** | 3002 | Pod & room bookings, availability |
| **payment-service** | 3003 | Razorpay integration, refunds |
| **investor-service** | 3004 | Pool management, pod sets, 3x tracking |
| **referral-service** | 3005 | 5-level referral, commissions |
| **rental-service** | 3006 | Home/office rentals, contracts |
| **hotel-service** | 3007 | Hotel listings, rooms, pods |
| **notification-service** | 3008 | Email, SMS, push notifications |
| **analytics-service** | 3009 | Reports, dashboards, metrics |
| **search-service** | 3010 | Elasticsearch indexing, search |

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
> - React: 19.0.1, 19.1.2, or 19.2.1+
> - Next.js: 14.2.35 (for 14.x), 15.1.11 (for 15.1.x), 15.2.8 (for 15.2.x)
> - React Native: Update react-server-dom-* packages if using monorepo

### 4.1 Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 14.2.35+ | React framework (SECURITY PATCHED) |
| **React** | React | 19.2.1+ | UI library (SECURITY PATCHED) |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible components |
| **State Management** | Zustand | 4.x | Lightweight state |
| **Forms** | React Hook Form | 7.x | Form handling |
| **Validation** | Zod | 3.x | Schema validation |
| **HTTP Client** | Axios / TanStack Query | 5.x | API calls + caching |
| **Maps** | Mapbox GL / Google Maps | Latest | Location features |
| **Charts** | Recharts | 2.x | Analytics visualization |
| **Animation** | Framer Motion | 10.x | UI animations |
| **Icons** | Lucide React | Latest | Icon library |

### 4.2 Mobile Technologies

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

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Bun | 1.x | Fast JavaScript runtime |
| **Framework** | Elysia | 1.x | High-performance API framework |
| **Language** | TypeScript | 5.x | Type safety |
| **ORM** | Drizzle ORM | Latest | Type-safe database access |
| **Validation** | Zod / TypeBox | Latest | Request validation |
| **Auth** | OAuth 2.0 + JWT | Latest | Authentication |
| **Message Broker** | Apache Kafka | 3.x | Event streaming |
| **WebSocket** | Elysia WebSocket | Latest | Real-time features |
| **API Documentation** | Swagger/OpenAPI | 3.x | Auto-generated docs |
| **Email** | Nodemailer + Resend | Latest | Email delivery |
| **SMS** | MSG91 / Twilio | Latest | OTP delivery |

### 4.4 Database & Storage

| Category | Technology | Purpose |
|----------|------------|---------|
| **Primary Database** | PostgreSQL 16 | Relational data (via Drizzle ORM) |
| **Cache** | Redis 7 | Sessions, caching, queues |
| **Search** | Elasticsearch / Meilisearch | Location search |
| **File Storage** | Local / Cloudflare R2 | Images, documents |
| **CDN** | Cloudflare | Static asset delivery, WAF |

### 4.5 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Payments** | Razorpay | UPI, Cards, Wallets |
| **Crypto Payments** | CoinGate / NOWPayments | Cryptocurrency |
| **SMS OTP** | MSG91 | Phone verification |
| **Email** | Resend / SendGrid | Transactional emails |
| **Push Notifications** | Firebase Cloud Messaging | Mobile notifications |
| **Maps** | Google Maps Platform | Geocoding, directions |
| **Analytics** | Mixpanel / PostHog | Product analytics |
| **Error Tracking** | Sentry | Error monitoring |
| **Logging** | Axiom / Pino | Log aggregation |

### 4.6 DevOps & Infrastructure (Self-Hosted Linux + Docker)

| Category | Technology | Purpose |
|----------|------------|---------|
| **Web Server** | Nginx | Reverse proxy, SSL, load balancing |
| **Containerization** | Docker + Docker Compose | Service containerization |
| **Container Orchestration** | Docker Swarm (optional K8s) | Multi-node deployment |
| **SSL Certificates** | Let's Encrypt (Certbot) | Free SSL |
| **CI/CD** | GitHub Actions | Automated deployments |
| **CDN/DNS** | Cloudflare | DNS, CDN, WAF, DDoS protection |
| **Monitoring** | Grafana + Prometheus | Infrastructure monitoring |
| **Log Management** | Loki / ELK Stack | Log aggregation |
| **Backup** | Cron + rclone / rsync | Automated backups |
| **Firewall** | UFW / iptables | Server security |
| **Domain** | naploo.com | Primary domain |

---

## 5. Project Structure

### 5.1 Monorepo Structure (Microservices)

```
naploo-ecosystem/
|
+-- .github/
|   +-- workflows/
|   |   +-- ci.yml                 # Continuous integration
|   |   +-- deploy.yml             # Self-hosted deployment
|   |   +-- backup.yml             # Automated backups
|   +-- PULL_REQUEST_TEMPLATE.md
|
+-- apps/
|   |
|   +-- web/                        # Customer Website (Next.js)
|   |   +-- app/
|   |   |   +-- (auth)/
|   |   |   |   +-- login/
|   |   |   |   +-- register/
|   |   |   |   +-- verify-otp/
|   |   |   +-- (main)/
|   |   |   |   +-- page.tsx           # Home
|   |   |   |   +-- about/
|   |   |   |   +-- pods/
|   |   |   |   +-- hotels/
|   |   |   |   +-- locations/
|   |   |   |   +-- gallery/
|   |   |   |   +-- contact/
|   |   |   +-- (booking)/
|   |   |   |   +-- search/
|   |   |   |   +-- hotel/[hotelId]/
|   |   |   |   +-- book-pod/[hotelId]/
|   |   |   |   +-- book-room/[roomId]/
|   |   |   |   +-- checkout/
|   |   |   |   +-- confirmation/[bookingId]/
|   |   |   +-- (dashboard)/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- my-bookings/
|   |   |   |   +-- profile/
|   |   |   |   +-- wallet/
|   |   |   +-- layout.tsx
|   |   |   +-- globals.css
|   |   +-- components/
|   |   +-- lib/
|   |   +-- hooks/
|   |   +-- store/
|   |   +-- public/
|   |   +-- next.config.js
|   |   +-- package.json
|   |
|   +-- mobile/                     # React Native App
|   |   +-- src/
|   |   |   +-- screens/
|   |   |   +-- components/
|   |   |   +-- navigation/
|   |   |   +-- services/
|   |   |   +-- store/
|   |   +-- app.json
|   |   +-- package.json
|   |
|   +-- partner/                    # Hotel Owner Portal (Next.js)
|   |   +-- app/
|   |   |   +-- (auth)/
|   |   |   +-- (dashboard)/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- property/
|   |   |   |   +-- rooms/
|   |   |   |   +-- pods/
|   |   |   |   +-- bookings/
|   |   |   |   +-- earnings/
|   |   +-- components/
|   |   +-- package.json
|   |
|   +-- investor/                   # Investor Pool Portal (Next.js)
|   |   +-- app/
|   |   |   +-- (auth)/
|   |   |   +-- (onboarding)/
|   |   |   |   +-- kyc/
|   |   |   |   +-- verification/
|   |   |   +-- (dashboard)/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- pool/                # Investor pool status
|   |   |   |   +-- announcements/       # New hotel announcements
|   |   |   |   +-- my-pod-sets/         # Purchased pod sets
|   |   |   |   +-- earnings/            # 60% share earnings
|   |   |   |   +-- 3x-tracker/          # Progress to 3x return
|   |   |   |   +-- withdrawals/
|   |   |   |   +-- documents/           # Invoices, contracts
|   |   +-- components/
|   |   +-- package.json
|   |
|   +-- associate/                  # Associate/Referral Portal (Next.js)
|   |   +-- app/
|   |   |   +-- (auth)/
|   |   |   +-- (dashboard)/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- referral-links/      # Generate unique links
|   |   |   |   +-- my-network/          # 5-level tree view
|   |   |   |   +-- earnings/            # Commission by level
|   |   |   |   +-- payouts/
|   |   |   |   +-- marketing/           # Materials, banners
|   |   +-- components/
|   |   +-- package.json
|   |
|   +-- rental/                     # Rental Portal (Next.js)
|   |   +-- app/
|   |   |   +-- (auth)/
|   |   |   +-- (main)/
|   |   |   |   +-- home-pods/           # Home rental options
|   |   |   |   +-- office-nap-rooms/    # Corporate solutions
|   |   |   |   +-- request-survey/      # Site survey request
|   |   |   +-- (dashboard)/
|   |   |   |   +-- my-contracts/        # 12-month contracts
|   |   |   |   +-- maintenance/         # Request maintenance
|   |   |   |   +-- payments/
|   |   +-- components/
|   |   +-- package.json
|   |
|   +-- admin/                      # Admin Dashboard (Next.js)
|       +-- app/
|       |   +-- (auth)/
|       |   +-- (dashboard)/
|       |   |   +-- dashboard/
|       |   |   +-- hotels/
|       |   |   +-- hotel-owners/
|       |   |   +-- investors/
|       |   |   |   +-- pool/            # Manage investor pool
|       |   |   |   +-- approvals/       # KYC approvals
|       |   |   |   +-- pod-sets/        # Track pod set purchases
|       |   |   |   +-- 3x-tracking/     # Monitor 3x returns
|       |   |   +-- associates/
|       |   |   |   +-- list/
|       |   |   |   +-- commissions/     # Configure rates
|       |   |   |   +-- payouts/
|       |   |   +-- rentals/
|       |   |   |   +-- contracts/
|       |   |   |   +-- maintenance/
|       |   |   +-- announcements/       # Create hotel announcements
|       |   |   +-- bookings/
|       |   |   +-- users/
|       |   |   +-- payments/
|       |   |   +-- reports/
|       +-- components/
|       +-- package.json
|
+-- services/                       # Backend Microservices (Bun + Elysia)
|   |
|   +-- api-gateway/
|   |   +-- src/
|   |   |   +-- index.ts            # Gateway entry point
|   |   |   +-- routes/
|   |   |   +-- middleware/
|   |   |   |   +-- auth.ts         # JWT verification
|   |   |   |   +-- rateLimit.ts
|   |   |   |   +-- cors.ts
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- auth-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   |   +-- oauth.routes.ts
|   |   |   |   +-- jwt.routes.ts
|   |   |   |   +-- otp.routes.ts
|   |   |   +-- services/
|   |   |   +-- middleware/
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- booking-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   |   +-- pod-booking.routes.ts
|   |   |   |   +-- room-booking.routes.ts
|   |   |   +-- services/
|   |   |   +-- kafka/
|   |   |   |   +-- producers.ts
|   |   |   |   +-- consumers.ts
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- payment-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   +-- services/
|   |   |   |   +-- razorpay.service.ts
|   |   |   |   +-- crypto.service.ts
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- investor-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   |   +-- pool.routes.ts       # Pool enrollment
|   |   |   |   +-- announcements.routes.ts
|   |   |   |   +-- pod-sets.routes.ts   # Pod set purchases
|   |   |   |   +-- earnings.routes.ts   # 60% share
|   |   |   |   +-- 3x-tracker.routes.ts # 3x return tracking
|   |   |   +-- services/
|   |   |   |   +-- pool.service.ts
|   |   |   |   +-- scrap-policy.service.ts
|   |   |   +-- kafka/
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- referral-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   |   +-- links.routes.ts      # Generate referral links
|   |   |   |   +-- network.routes.ts    # 5-level tree
|   |   |   |   +-- commissions.routes.ts
|   |   |   +-- services/
|   |   |   |   +-- commission-calculator.ts
|   |   |   |   +-- tree-builder.ts
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- rental-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   |   +-- home-rental.routes.ts
|   |   |   |   +-- office-rental.routes.ts
|   |   |   |   +-- contracts.routes.ts
|   |   |   |   +-- maintenance.routes.ts
|   |   |   +-- services/
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- hotel-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   +-- services/
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- notification-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   +-- services/
|   |   |   |   +-- email.service.ts
|   |   |   |   +-- sms.service.ts
|   |   |   |   +-- push.service.ts
|   |   |   +-- kafka/
|   |   |   |   +-- consumers.ts     # Listen for events
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- analytics-service/
|   |   +-- src/
|   |   |   +-- index.ts
|   |   |   +-- routes/
|   |   |   +-- services/
|   |   +-- Dockerfile
|   |   +-- package.json
|   |
|   +-- search-service/
|       +-- src/
|       |   +-- index.ts
|       |   +-- routes/
|       |   +-- services/
|       |   |   +-- elasticsearch.service.ts
|       +-- Dockerfile
|       +-- package.json
|
+-- packages/
|   |
|   +-- database/                   # Shared Drizzle ORM Schema
|   |   +-- src/
|   |   |   +-- schema/
|   |   |   |   +-- users.ts
|   |   |   |   +-- hotels.ts
|   |   |   |   +-- rooms.ts
|   |   |   |   +-- pods.ts
|   |   |   |   +-- bookings.ts
|   |   |   |   +-- investors.ts     # Pool, pod sets, 3x tracking
|   |   |   |   +-- referrals.ts     # 5-level referral
|   |   |   |   +-- rentals.ts       # Home/office contracts
|   |   |   |   +-- payments.ts
|   |   |   |   +-- index.ts
|   |   |   +-- migrations/
|   |   |   +-- seed.ts
|   |   +-- drizzle.config.ts
|   |   +-- package.json
|   |
|   +-- ui/                         # Shared UI Components
|   |   +-- src/
|   |   +-- package.json
|   |
|   +-- types/                      # Shared TypeScript Types
|   |   +-- src/
|   |   |   +-- user.ts
|   |   |   +-- hotel.ts
|   |   |   +-- room.ts
|   |   |   +-- pod.ts
|   |   |   +-- booking.ts
|   |   |   +-- investor.ts          # Pool, pod set, 3x types
|   |   |   +-- referral.ts          # 5-level types
|   |   |   +-- rental.ts            # Contract types
|   |   |   +-- payment.ts
|   |   |   +-- index.ts
|   |   +-- package.json
|   |
|   +-- utils/                      # Shared Utilities
|   |   +-- src/
|   |   +-- package.json
|   |
|   +-- kafka/                      # Shared Kafka Utilities
|   |   +-- src/
|   |   |   +-- client.ts
|   |   |   +-- topics.ts
|   |   |   +-- producers.ts
|   |   |   +-- consumers.ts
|   |   +-- package.json
|   |
|   +-- api-client/                 # Shared API Client
|       +-- src/
|       +-- package.json
|
+-- docker/
|   +-- docker-compose.yml          # All services
|   +-- docker-compose.dev.yml      # Development
|   +-- docker-compose.prod.yml     # Production
|   +-- nginx/
|   |   +-- nginx.conf
|   |   +-- ssl/
|   +-- kafka/
|       +-- docker-compose.kafka.yml
|
+-- docs/
|   +-- PROJECT_DOCUMENTATION.md    # This file
|   +-- API_REFERENCE.md
|   +-- DEPLOYMENT.md
|   +-- DESIGN_SYSTEM.md
|   +-- CONTRIBUTING.md
|
+-- scripts/
|   +-- setup.sh
|   +-- deploy.sh
|   +-- backup.sh
|   +-- seed-data.ts
|
+-- .env.example
+-- .gitignore
+-- .prettierrc
+-- .eslintrc.js
+-- turbo.json                      # Turborepo config
+-- package.json                    # Root package.json
+-- bun.lockb                       # Bun lockfile
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

### 8.1 Key API Endpoints Overview

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

### Phase 1: Foundation (Months 1-3)
- [ ] Set up monorepo with Turborepo
- [ ] Configure Docker + microservices
- [ ] Set up PostgreSQL + Drizzle ORM
- [ ] Set up Kafka for event streaming
- [ ] Implement auth service (OAuth + JWT)
- [ ] Build customer website (search, booking)
- [ ] Build partner portal (basic)
- [ ] Build admin dashboard (basic)

### Phase 2: Investor Pool (Months 3-4)
- [ ] Investor pool enrollment
- [ ] KYC verification system
- [ ] Hotel announcement system
- [ ] Pod set purchase flow
- [ ] 3x return tracking
- [ ] Investor earnings dashboard

### Phase 3: Referral System (Months 4-5)
- [ ] Associate registration
- [ ] Referral link generation
- [ ] 5-level tracking
- [ ] Commission calculation
- [ ] Payout processing

### Phase 4: Rental Program (Months 5-6)
- [ ] Home rental flow
- [ ] Office nap room packages
- [ ] Contract management
- [ ] Maintenance system

### Phase 5: Mobile App (Months 6-8)
- [ ] React Native setup
- [ ] Customer app
- [ ] Investor app
- [ ] Associate app

### Phase 6: Polish & Launch (Months 8-9)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing
- [ ] Production launch

---

## 11. Deployment Strategy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### 11.1 Docker Compose Overview

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  # Infrastructure
  postgres:
    image: postgres:16
    
  redis:
    image: redis:7
    
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    
  elasticsearch:
    image: elasticsearch:8.11.0
    
  # Services
  api-gateway:
    build: ./services/api-gateway
    
  auth-service:
    build: ./services/auth-service
    
  booking-service:
    build: ./services/booking-service
    
  investor-service:
    build: ./services/investor-service
    
  referral-service:
    build: ./services/referral-service
    
  rental-service:
    build: ./services/rental-service
    
  # ... other services
```

---

## 12. Security Guidelines

### 12.1 Authentication
- OAuth 2.0 + JWT tokens
- Refresh token rotation
- OTP verification for phone
- Rate limiting on auth endpoints

### 12.2 Data Protection
- All data encrypted at rest (PostgreSQL)
- TLS 1.3 for data in transit
- PII data encryption
- GDPR compliance

### 12.3 Infrastructure
- Cloudflare WAF
- DDoS protection
- Regular security audits
- Penetration testing

---

## 13. Testing Strategy

### 13.1 Test Types
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Load testing (k6)

### 13.2 Coverage Targets
- Unit: 80%+
- Integration: 70%+
- E2E: Critical paths

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
- v3.0.0 (Jan 2026): Added Investor Pool, 5-Level Referral, Rental Program, Microservices architecture
- v2.0.0 (Jan 2026): Added hybrid hotel booking model
- v1.0.0 (Dec 2025): Initial documentation
