# Naploo™ Ecosystem - Complete Project Documentation

> **Version:** 3.0.0  
> **Last Updated:** 22 January 2026  
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

### 1.1 What is Naploo™?

Naploo™ is India's first **hybrid hotel booking platform** that combines:
- **Smart Sleeping Pods** - Affordable hourly capsule accommodations
- **Traditional Hotel Rooms** - Standard 24-hour room bookings like OYO, Yatra, Goibibo

We partner with existing hotels to install pods in their halls/common areas, giving travelers two flexible options:
1. **Pod Booking** - Pay per hour (starting ₹150/hr) for quick rest
2. **Room Booking** - Traditional 24-hour hotel room booking

### 1.2 Business Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NAPLOO BUSINESS MODEL                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐        ┌─────────────────┐                        │
│   │   HOTEL OWNERS  │        │    CUSTOMERS    │                        │
│   │   (Partners)    │        │   (Travelers)   │                        │
│   └────────┬────────┘        └────────┬────────┘                        │
│            │                          │                                  │
│            ▼                          ▼                                  │
│   ┌─────────────────────────────────────────────────────┐               │
│   │              NAPLOO PLATFORM (naploo.com)            │               │
│   │                                                      │               │
│   │  • Hotel Onboarding & Listing                       │               │
│   │  • Pod Installation Partnerships                    │               │
│   │  • Booking Management                               │               │
│   │  • Payment Processing                               │               │
│   │  • Reviews & Ratings                                │               │
│   └─────────────────────────────────────────────────────┘               │
│            │                          │                                  │
│            ▼                          ▼                                  │
│   ┌─────────────────┐        ┌─────────────────┐                        │
│   │   LIST ON       │        │   BOOK          │                        │
│   │   NAPLOO        │        │   • Pods/hour   │                        │
│   │   • Pods        │        │   • Rooms/night │                        │
│   │   • Rooms       │        │                 │                        │
│   └─────────────────┘        └─────────────────┘                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Project Scope

Build a complete digital ecosystem enabling:
- **Customers** to search, compare, and book pods (hourly) or rooms (daily)
- **Hotel Owners** to list their properties, manage inventory, and track bookings
- **Pod Investors** to track earnings from their installed pods
- **Administrators** to manage platform operations and analytics

### 1.4 Platforms to Develop

| Platform | Technology | Priority | Deployment |
|----------|------------|----------|------------|
| Customer Website (PWA) | Next.js 14 | Phase 1 | Linux Server |
| Hotel Owner Portal | Next.js 14 | Phase 1 | Linux Server |
| Customer Mobile App | React Native + Expo | Phase 2 | App Stores |
| Investor Portal | Next.js 14 | Phase 1 | Linux Server |
| Admin Dashboard | Next.js 14 | Phase 3 | Linux Server |
| Backend API | Node.js + Fastify | Parallel | Linux Server |

### 1.5 Key Business Metrics

**Pod Booking (Hourly):**
- Single Bed Pod: ₹150/hour
- Double Bed Pod: ₹200/hour
- Discount: 10% on additional hours
- Pod Investor Revenue Share: 60% to investor, 40% to BIDUA

**Room Booking (Traditional):**
- Commission Model: 15-20% per booking (like OYO/Goibibo)
- Hotel sets their own room rates
- Standard check-in/check-out times

**Hotel Partner Benefits:**
- Zero listing fees
- Increased footfall from pod users
- Revenue from unused spaces (pods in halls)
- Access to Naploo's customer base

---

## 2. Project Vision & Goals

### 2.1 Vision Statement

*"To revolutionize travel accommodation in India by providing a unified platform where travelers can book affordable pods (hourly) or traditional hotel rooms (daily), while empowering hotel owners to maximize their revenue through flexible booking options."*

### 2.2 Business Goals

1. **Customer Acquisition:** 50,000+ app downloads in first 6 months
2. **Hotel Partners:** 500+ hotels onboarded in Year 1
3. **Booking Volume:** 2,000+ daily bookings (pods + rooms) by Year 1
4. **Pod Investors:** 100+ pod investors in first year
5. **Geographic Coverage:** 50+ cities across India by Year 2

### 2.3 Technical Goals

1. **Performance:** Page load < 2 seconds, API response < 200ms
2. **Availability:** 99.9% uptime for booking system
3. **Scalability:** Support 50,000+ concurrent users
4. **Mobile Experience:** Native-like PWA with offline capabilities

### 2.4 User Goals

#### For Customers
- Search hotels with both pod and room options
- Compare prices across accommodations
- Book pods by the hour or rooms by the night
- Seamless check-in via QR code
- Multiple payment options (UPI, Card, Wallet, Crypto)

#### For Hotel Owners
- Easy onboarding and listing management
- Real-time inventory and pricing control
- Dashboard for bookings and revenue
- Customer insights and analytics
- Option to add Naploo pods to their property

#### For Pod Investors
- Real-time earnings visibility
- Easy withdrawal process
- Transparent performance metrics
- Referral tracking and bonuses

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────┤
│  Customer Web │  Hotel Owner  │   Investor    │    Admin      │ Mobile  │
│  (Next.js)    │   Portal      │   Portal      │  Dashboard    │  App    │
│  naploo.com   │ partner.      │ investor.     │ admin.        │ iOS/    │
│               │ naploo.com    │ naploo.com    │ naploo.com    │ Android │
└───────┬───────┴───────┬───────┴───────┬───────┴───────┬───────┴────┬────┘
        │               │               │               │            │
        └───────────────┴───────────────┴───────────────┴────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NGINX REVERSE PROXY + SSL                           │
│                    (Load Balancing, Rate Limiting)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                                 │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│  Auth Service   │ Booking Service │ Payment Service │ Notification Svc  │
│  (JWT + OTP)    │  (Pods+Rooms)   │   (Razorpay)    │  (FCM + Email)    │
├─────────────────┼─────────────────┼─────────────────┼───────────────────┤
│  Hotel Service  │ Search Service  │ Analytics Svc   │  Upload Service   │
│  (Listings)     │ (Elasticsearch) │  (Reports)      │  (Images)         │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                   │
         └─────────────────┴─────────────────┴───────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│   PostgreSQL    │     Redis       │  Local Storage  │   Elasticsearch   │
│   (Primary DB)  │   (Cache/Queue) │   (Media)       │    (Search)       │
└─────────────────┴─────────────────┴─────────────────┴───────────────────┘

                        SELF-HOSTED LINUX SERVER
```

### 3.2 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAPLOO ECOSYSTEM                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   APPS       │  │   PACKAGES   │  │   BACKEND    │          │
│  │              │  │              │  │              │          │
│  │ ├── web      │  │ ├── ui       │  │ ├── routes   │          │
│  │ ├── mobile   │  │ ├── types    │  │ ├── services │          │
│  │ ├── partner  │  │ ├── utils    │  │ ├── models   │          │
│  │ ├── investor │  │ └── api-sdk  │  │ └── jobs     │          │
│  │ └── admin    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow - Booking Process (Pods vs Rooms)

```
Customer                    Frontend                   Backend                    
   │                           │                          │                       
   │  1. Search Location       │                          │                       
   │ ─────────────────────────>│                          │                       
   │                           │  2. GET /search          │                       
   │                           │     ?type=pod|room|all   │                       
   │                           │ ────────────────────────>│                       
   │                           │  3. Hotels + Availability│                       
   │                           │ <────────────────────────│                       
   │  4. Display Results       │                          │                       
   │     (Pods & Rooms)        │                          │                       
   │ <─────────────────────────│                          │                       
   │                           │                          │                       
   │  5. Select Accommodation  │                          │                       
   │     POD: Select hours     │                          │                       
   │     ROOM: Select dates    │                          │                       
   │ ─────────────────────────>│                          │                       
   │                           │  6. Calculate Price      │                       
   │                           │     POD: hourly + disc   │                       
   │                           │     ROOM: nightly rate   │                       
   │                           │ ────────────────────────>│                       
   │                           │  7. Pricing Details      │                       
   │                           │ <────────────────────────│                       
   │                           │                          │                       
   │  8. Confirm Booking       │                          │                       
   │ ─────────────────────────>│                          │                       
   │                           │  9. Create Booking       │                       
   │                           │ ────────────────────────>│                       
   │                           │  10. Process Payment     │                       
   │                           │ <────────────────────────│                       
   │  11. Confirmation + QR    │                          │                       
   │ <─────────────────────────│                          │                       
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 14.x | React framework with App Router |
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
| **Toolchain** | Expo | 50.x | Development & build |
| **Navigation** | React Navigation | 6.x | Screen navigation |
| **State** | Zustand | 4.x | Shared with web |
| **Storage** | AsyncStorage | Latest | Local data |
| **Push Notifications** | Expo Notifications | Latest | FCM integration |
| **Camera/QR** | Expo Camera | Latest | QR scanning |
| **Maps** | React Native Maps | Latest | Location display |

### 4.3 Backend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 20.x LTS | JavaScript runtime |
| **Framework** | Fastify | 4.x | High-performance API |
| **Language** | TypeScript | 5.x | Type safety |
| **ORM** | Prisma | 5.x | Database access |
| **Validation** | Zod | 3.x | Request validation |
| **Auth** | JWT + Passport | Latest | Authentication |
| **Queue** | BullMQ | 5.x | Background jobs |
| **WebSocket** | Socket.io | 4.x | Real-time features |
| **Email** | Nodemailer + Resend | Latest | Email delivery |
| **SMS** | MSG91 / Twilio | Latest | OTP delivery |

### 4.4 Database & Storage

| Category | Technology | Purpose |
|----------|------------|---------|
| **Primary Database** | PostgreSQL 16 | Relational data |
| **Cache** | Redis 7 | Sessions, caching, queues |
| **Search** | Elasticsearch / Meilisearch | Location search |
| **File Storage** | AWS S3 / Cloudinary | Images, documents |
| **CDN** | CloudFront / Cloudflare | Static asset delivery |

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
| **Logging** | Axiom / Datadog | Log aggregation |

### 4.6 DevOps & Infrastructure (Self-Hosted Linux)

| Category | Technology | Purpose |
|----------|------------|---------|
| **Web Server** | Nginx | Reverse proxy, SSL, load balancing |
| **Process Manager** | PM2 | Node.js process management |
| **Container** | Docker + Docker Compose | Containerization |
| **SSL Certificates** | Let's Encrypt (Certbot) | Free SSL |
| **CI/CD** | GitHub Actions | Automated deployments |
| **Monitoring** | Grafana + Prometheus | Infrastructure monitoring |
| **Log Management** | Loki / ELK Stack | Log aggregation |
| **Backup** | Cron + rclone / rsync | Automated backups |
| **Firewall** | UFW / iptables | Server security |
| **Domain** | naploo.com | Primary domain |

---

## 5. Project Structure

### 5.1 Monorepo Structure

```
naploo-ecosystem/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Continuous integration
│   │   ├── deploy.yml             # Self-hosted deployment
│   │   └── backup.yml             # Automated backups
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   │
│   ├── web/                        # Customer Website (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify-otp/
│   │   │   ├── (main)/
│   │   │   │   ├── page.tsx           # Home
│   │   │   │   ├── about/
│   │   │   │   ├── pods/
│   │   │   │   ├── hotels/            # Hotel listings
│   │   │   │   ├── locations/
│   │   │   │   ├── gallery/
│   │   │   │   └── contact/
│   │   │   ├── (booking)/
│   │   │   │   ├── search/
│   │   │   │   ├── hotel/[hotelId]/   # Hotel detail page
│   │   │   │   ├── book-pod/[hotelId]/
│   │   │   │   ├── book-room/[roomId]/
│   │   │   │   ├── checkout/
│   │   │   │   └── confirmation/[bookingId]/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── my-bookings/
│   │   │   │   ├── profile/
│   │   │   │   └── wallet/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── home/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── SearchBar.tsx       # Unified search
│   │   │   │   ├── HotelShowcase.tsx
│   │   │   │   ├── PodShowcase.tsx
│   │   │   │   ├── LocationsPreview.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   └── Testimonials.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchFilters.tsx
│   │   │   │   ├── HotelCard.tsx
│   │   │   │   ├── RoomCard.tsx
│   │   │   │   ├── PodCard.tsx
│   │   │   │   └── MapView.tsx
│   │   │   ├── booking/
│   │   │   │   ├── HotelDetail.tsx
│   │   │   │   ├── RoomSelector.tsx
│   │   │   │   ├── PodSelector.tsx
│   │   │   │   ├── DatePicker.tsx      # For room booking
│   │   │   │   ├── TimeSlotPicker.tsx  # For pod booking
│   │   │   │   ├── GuestSelector.tsx
│   │   │   │   ├── PriceSummary.tsx
│   │   │   │   └── PaymentForm.tsx
│   │   │   └── shared/
│   │   │       ├── Logo.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useBooking.ts
│   │   │   ├── useHotels.ts
│   │   │   └── useSearch.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── searchStore.ts
│   │   │   └── bookingStore.ts
│   │   ├── public/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── manifest.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── mobile/                     # React Native App
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   │   └── OTPScreen.tsx
│   │   │   │   ├── main/
│   │   │   │   │   ├── HomeScreen.tsx
│   │   │   │   │   ├── SearchScreen.tsx
│   │   │   │   │   ├── HotelDetailScreen.tsx
│   │   │   │   │   └── MapScreen.tsx
│   │   │   │   ├── booking/
│   │   │   │   │   ├── RoomBookingScreen.tsx
│   │   │   │   │   ├── PodBookingScreen.tsx
│   │   │   │   │   ├── CheckoutScreen.tsx
│   │   │   │   │   ├── PaymentScreen.tsx
│   │   │   │   │   └── ConfirmationScreen.tsx
│   │   │   │   └── profile/
│   │   │   │       ├── ProfileScreen.tsx
│   │   │   │       ├── MyBookingsScreen.tsx
│   │   │   │       └── WalletScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── search/
│   │   │   │   ├── booking/
│   │   │   │   └── profile/
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx
│   │   │   │   ├── AuthNavigator.tsx
│   │   │   │   └── TabNavigator.tsx
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── storage.ts
│   │   │   │   └── notifications.ts
│   │   │   ├── store/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── animations/
│   │   ├── app.json
│   │   ├── App.tsx
│   │   ├── babel.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── partner/                    # Hotel Owner Portal (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── onboarding/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/          # Overview & analytics
│   │   │   │   ├── property/
│   │   │   │   │   ├── details/        # Hotel info management
│   │   │   │   │   ├── rooms/          # Room inventory
│   │   │   │   │   ├── pods/           # Pod inventory
│   │   │   │   │   ├── photos/         # Media management
│   │   │   │   │   └── amenities/
│   │   │   │   ├── pricing/
│   │   │   │   │   ├── room-rates/     # Dynamic room pricing
│   │   │   │   │   ├── pod-rates/      # Hourly pod pricing
│   │   │   │   │   └── offers/         # Discounts & deals
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── upcoming/
│   │   │   │   │   ├── ongoing/
│   │   │   │   │   ├── completed/
│   │   │   │   │   └── cancelled/
│   │   │   │   ├── guests/             # Guest management
│   │   │   │   ├── earnings/           # Revenue & payouts
│   │   │   │   ├── reviews/            # Guest reviews
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── property/
│   │   │   ├── bookings/
│   │   │   └── earnings/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── investor/                   # Investor Portal (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── my-pods/
│   │   │   │   ├── earnings/
│   │   │   │   ├── withdrawals/
│   │   │   │   ├── referrals/
│   │   │   │   └── documents/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── admin/                      # Admin Dashboard (Next.js)
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   │   ├── dashboard/
│       │   │   ├── hotels/             # Hotel management
│       │   │   ├── hotel-owners/       # Partner management
│       │   │   ├── rooms/              # Room inventory
│       │   │   ├── pods/               # Pod inventory
│       │   │   ├── locations/
│       │   │   ├── bookings/
│       │   │   ├── users/
│       │   │   ├── investors/
│       │   │   ├── payments/
│       │   │   ├── commission/         # Commission management
│       │   │   └── reports/
│       │   └── layout.tsx
│       ├── components/
│       ├── lib/
│       └── package.json
│
├── packages/
│   │
│   ├── ui/                         # Shared UI Components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── index.ts
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── types/                      # Shared TypeScript Types
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── hotel.ts             # Hotel types
│   │   │   ├── room.ts              # Room types
│   │   │   ├── location.ts
│   │   │   ├── pod.ts
│   │   │   ├── booking.ts
│   │   │   ├── payment.ts
│   │   │   ├── investor.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── utils/                      # Shared Utilities
│   │   ├── src/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── helpers.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api-client/                 # Shared API Client
│       ├── src/
│       │   ├── client.ts
│       │   ├── endpoints/
│       │   │   ├── auth.ts
│       │   │   ├── bookings.ts
│       │   │   ├── locations.ts
│       │   │   └── payments.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── backend/
│   │
│   ├── src/
│   │   ├── app.ts                  # Application entry
│   │   ├── server.ts               # Server bootstrap
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── location.routes.ts
│   │   │   ├── pod.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── investor.routes.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── location.controller.ts
│   │   │   ├── pod.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   └── investor.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── location.service.ts
│   │   │   ├── pod.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── otp.service.ts
│   │   │   └── investor.service.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   ├── booking.validator.ts
│   │   │   └── payment.validator.ts
│   │   │
│   │   ├── jobs/
│   │   │   ├── queue.ts
│   │   │   ├── booking-reminder.job.ts
│   │   │   ├── payout-processor.job.ts
│   │   │   └── cleanup.job.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── errors.ts
│   │   │   ├── helpers.ts
│   │   │   └── encryption.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/
│   │   └── seed.ts                 # Seed data
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── PROJECT_DOCUMENTATION.md    # This file
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── assets/
│
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── seed-data.ts
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── turbo.json                      # Turborepo config
├── package.json                    # Root package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 6. Feature Specifications

### 6.1 Customer Website Features

#### 6.1.1 Home Page

| Section | Description | Components |
|---------|-------------|------------|
| **Hero** | Full-width banner with tagline, CTA buttons | Video/Image background, Search bar |
| **Pod Showcase** | Display pod types with features | Card carousel, Image gallery |
| **Locations Preview** | Map + list of available locations | Interactive map, Location cards |
| **Features** | Key amenities and benefits | Icon grid, Feature cards |
| **How It Works** | Step-by-step booking guide | Timeline component |
| **Testimonials** | Customer reviews | Review carousel |
| **CTA Section** | Download app, Book now prompts | Button group |
| **Footer** | Links, contact, social media | Multi-column footer |

#### 6.1.2 Search & Discovery

```typescript
// Unified Search - Supports both Pods and Rooms
interface SearchParams {
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  radius?: number;                    // km
  checkIn: string;                    // Date or DateTime
  checkOut?: string;                  // For room bookings
  duration?: number;                  // Hours for pod bookings
  accommodationType?: 'pod' | 'room' | 'all';
  podType?: 'single' | 'double' | 'any';
  roomType?: 'single' | 'double' | 'suite' | 'any';
  guests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
}

// Hotel/Property Display
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
  
  // Pod availability (if hotel has pods)
  hasPods: boolean;
  availablePods?: number;
  podPricePerHour?: number;
  
  // Room availability
  hasRooms: boolean;
  availableRooms?: number;
  roomPricePerNight?: number;
  
  // Badges
  badges: ('Popular' | 'New' | 'Top Rated' | 'Naploo Partner')[];
}
```

#### 6.1.3 Booking Flows

**Pod Booking Flow (Hourly):**
```
Step 1: Search Location/Hotel
    ↓
Step 2: Select Hotel with Pods
    ↓
Step 3: Choose Pod Type (Single ₹150/hr | Double ₹200/hr)
    ↓
Step 4: Select Start Time & Duration
    ↓
Step 5: Review Pricing (hourly rate + discounts)
    ↓
Step 6: Enter Guest Details
    ↓
Step 7: Complete Payment
    ↓
Step 8: Receive QR Code for Check-in
```

**Room Booking Flow (Traditional - like OYO/Goibibo):**
```
Step 1: Search Location
    ↓
Step 2: Select Check-in & Check-out Dates
    ↓
Step 3: Select Hotel
    ↓
Step 4: Choose Room Type & View Photos
    ↓
Step 5: Review Room Details & Policies
    ↓
Step 6: Enter Guest Details (ID required)
    ↓
Step 7: Apply Coupon (if any)
    ↓
Step 8: Complete Payment
    ↓
Step 9: Receive Booking Confirmation
```

#### 6.1.4 User Dashboard

| Feature | Description |
|---------|-------------|
| **Active Bookings** | Current pod sessions and room stays with QR/voucher |
| **Booking History** | Past stays (both pods & rooms) with invoice download |
| **Profile Settings** | Personal info, password, preferences, ID verification |
| **Saved Payments** | Manage saved cards/UPI IDs |
| **Wallet** | Prepaid balance, transactions, refunds |
| **Reviews** | Write reviews for past stays |
| **Support** | Help center, chat support, FAQs |

---

### 6.2 Mobile App Features

#### 6.2.1 App Screens

```
├── Splash Screen
├── Onboarding (3 slides)
├── Auth Flow
│   ├── Login (Phone/Email)
│   ├── OTP Verification
│   └── Registration
├── Tab Navigation
│   ├── Home Tab
│   │   ├── Unified Search Bar
│   │   │   ├── "Pods" Tab - Hourly booking
│   │   │   └── "Rooms" Tab - Nightly booking
│   │   ├── Nearby Hotels
│   │   ├── Featured Offers
│   │   └── Recent Searches
│   ├── Search Tab
│   │   ├── Map View (Hotels & Pods)
│   │   ├── List View
│   │   ├── Filters (Type, Price, Amenities)
│   │   └── Sort Options
│   ├── Bookings Tab
│   │   ├── Active Pod Sessions (with QR)
│   │   ├── Active Room Bookings
│   │   ├── Upcoming
│   │   └── Past Bookings
│   └── Profile Tab
│       ├── Account Settings
│       ├── ID Verification
│       ├── Wallet
│       ├── Reviews
│       ├── Support
│       └── Logout
├── Hotel Detail Screen
│   ├── Photo Gallery
│   ├── Amenities List
│   ├── Room Options (if available)
│   ├── Pod Options (if available)
│   ├── Reviews
│   └── Location Map
├── Booking Flow
│   ├── Pod: Time Selection → Payment → QR
│   └── Room: Date Selection → Guest Details → Payment → Voucher
└── QR Scanner (Pod Check-in)
```

#### 6.2.2 Mobile-Specific Features

| Feature | Implementation |
|---------|----------------|
| **Location Services** | Get user location for nearby search |
| **Push Notifications** | Booking reminders, check-out alerts, offers |
| **QR Code Display** | Digital pass for pod entry |
| **QR Scanner** | Self check-in/out for pods |
| **Biometric Auth** | Face ID / Fingerprint login |
| **Offline Mode** | View active bookings offline |
| **Deep Linking** | Open specific hotels/pods from links |
| **Share Hotels** | Share hotel listings with friends |

---

### 6.3 Hotel Owner (Partner) Portal Features

#### 6.3.1 Onboarding Flow

```
Step 1: Registration
    ↓
    - Business name, GST number
    - Owner details, contact info
    - Property count
    ↓
Step 2: Property Listing
    ↓
    - Property name, address
    - Property type (Hotel/Resort/Guest House)
    - Upload photos (min 5)
    ↓
Step 3: Room Inventory
    ↓
    - Add room types
    - Room photos, amenities
    - Set base prices
    ↓
Step 4: Pod Setup (Optional)
    ↓
    - Select pod types to add
    - Assign hall/area for pods
    - Set operating hours
    ↓
Step 5: Bank Details
    ↓
    - Account for payouts
    - PAN/GST documents
    ↓
Step 6: Agreement & Verification
    ↓
    - Digital contract signing
    - Naploo team verification visit
    - Go Live!
```

#### 6.3.2 Partner Dashboard

```typescript
interface PartnerDashboard {
  overview: {
    todayRevenue: number;
    todayBookings: number;
    occupancyRate: number;          // rooms
    podUtilization: number;         // pods
    avgRating: number;
    pendingPayout: number;
  };
  
  property: {
    name: string;
    status: 'active' | 'inactive' | 'pending';
    totalRooms: number;
    totalPods: number;
    listings: {
      rooms: RoomListing[];
      pods: PodListing[];
    };
  };
  
  todaySchedule: {
    checkIns: Booking[];
    checkOuts: Booking[];
    podSessions: PodBooking[];
  };
  
  recentBookings: Booking[];
  
  alerts: Alert[];      // Low inventory, reviews to respond, etc.
}
```

#### 6.3.3 Partner Features

| Module | Features |
|--------|----------|
| **Property Management** | Edit details, photos, amenities, policies |
| **Room Inventory** | Add/edit rooms, set availability, block dates |
| **Pod Management** | Monitor pod status, maintenance requests |
| **Dynamic Pricing** | Set room rates by season, weekday/weekend |
| **Booking Management** | View, confirm, modify, cancel bookings |
| **Guest Management** | Guest list, ID verification, special requests |
| **Earnings & Payouts** | Revenue reports, commission breakdown, withdrawal |
| **Reviews** | View and respond to guest reviews |
| **Offers & Promotions** | Create discount codes, flash sales |
| **Reports** | Occupancy, revenue, booking trends |
| **Support** | Contact Naploo support, raise issues |

#### 6.3.4 Commission Structure

| Booking Type | Naploo Commission | Partner Receives |
|-------------|-------------------|------------------|
| Pod Booking | 40% (BIDUA managed pods) | 60% |
| Room Booking | 15-20% | 80-85% |
| Premium Listing | Extra 5% | Featured placement |

---

### 6.4 Investor Portal Features

#### 6.4.1 Investor Dashboard

```typescript
interface InvestorDashboard {
  overview: {
    totalInvestment: number;
    totalEarnings: number;
    currentMonthEarnings: number;
    pendingWithdrawal: number;
    roi: number;              // percentage
    daysUntilBreakeven: number;
  };
  
  pods: InvestorPod[];
  
  recentActivity: Activity[];
  
  charts: {
    earningsOverTime: ChartData;
    occupancyRate: ChartData;
    revenueByPod: ChartData;
  };
}

interface InvestorPod {
  id: string;
  type: 'single' | 'double';
  location: string;
  hotelName: string;
  investmentAmount: number;
  totalEarnings: number;
  monthlyEarnings: number;
  occupancyRate: number;
  status: 'active' | 'maintenance' | 'offline';
}
```

#### 6.4.2 Investor Features

| Feature | Description |
|---------|-------------|
| **Real-time Dashboard** | Live earnings, occupancy metrics |
| **Pod Management** | View all owned pods across hotels, performance stats |
| **Earnings Breakdown** | Daily, weekly, monthly, yearly reports |
| **Withdrawal Request** | Request payout to bank/UPI |
| **Transaction History** | All incoming earnings & withdrawals |
| **Referral Program** | Generate links, track 2% bonuses |
| **Documents** | Lease agreements, tax statements |
| **Notifications** | New bookings, payments, alerts |

---

### 6.5 Admin Dashboard Features

#### 6.5.1 Admin Modules

```
├── Dashboard
│   ├── Key Metrics (Bookings, Revenue, Users, Hotels)
│   ├── Today's Activity
│   ├── Platform Health
│   ├── Alerts & Issues
│   └── Quick Actions
│
├── Hotel Management
│   ├── All Hotels (List/Grid view)
│   ├── Pending Approvals
│   ├── Hotel Details & Edit
│   ├── Room Inventory
│   ├── Pod Inventory
│   └── Verification Status
│
├── Partner Management
│   ├── All Hotel Owners
│   ├── Pending Applications
│   ├── Commission Settings
│   ├── Payout Processing
│   └── Performance Reports
│
├── Location Management
│   ├── Manage Cities
│   ├── Featured Areas
│   └── Geofencing
│
├── Pod Management (BIDUA Owned)
│   ├── Pod Status (Available/Occupied/Maintenance)
│   ├── Assign Investor
│   ├── Maintenance Logs
│   └── QR Code Generation
│
├── Booking Management
│   ├── All Bookings (Filterable)
│   ├── Manual Check-in/out
│   ├── Modify Bookings
│   ├── Cancel & Refund
│   └── Issue Resolution
│
├── User Management
│   ├── Customer Accounts
│   ├── Investor Accounts
│   ├── Staff Accounts
│   └── Role Permissions
│
├── Financial Management
│   ├── Revenue Reports
│   ├── Payment Reconciliation
│   ├── Investor Payouts
│   ├── Refund Processing
│   └── Tax Reports
│
├── Reports & Analytics
│   ├── Occupancy Reports
│   ├── Revenue Analytics
│   ├── User Analytics
│   ├── Location Performance
│   └── Export Data
│
└── Settings
    ├── Pricing Configuration
    ├── Discount Rules
    ├── Notification Templates
    ├── Payment Gateway Settings
    ├── Commission Settings
    └── System Configuration
```

---

## 7. Database Design

### 7.1 Entity Relationship Diagram (Updated for Hotel Aggregator Model)

```
                                    ┌──────────────────┐
                                    │   hotel_owners   │
                                    ├──────────────────┤
                                    │ id (PK)          │
                                    │ user_id (FK)     │
                                    │ business_name    │
                                    │ gst_number       │
                                    │ pan_number       │
                                    │ commission_rate  │
                                    │ status           │
                                    │ verified_at      │
                                    │ created_at       │
                                    └────────┬─────────┘
                                             │
                                             │ owns
                                             ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │      hotels      │       │      rooms       │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ email            │       │ owner_id (FK)    │       │ hotel_id (FK)    │
│ phone            │       │ name             │       │ name             │
│ password_hash    │       │ slug             │       │ type             │
│ name             │       │ description      │       │ description      │
│ avatar_url       │       │ address          │       │ base_price       │
│ role             │       │ city             │       │ max_guests       │
│ status           │       │ state            │       │ amenities        │
│ id_type          │       │ pincode          │       │ images           │
│ id_number        │       │ latitude         │       │ total_count      │
│ id_verified      │       │ longitude        │       │ available_count  │
│ created_at       │       │ category         │       │ status           │
│ updated_at       │       │ property_type    │       │ created_at       │
└────────┬─────────┘       │ star_rating      │       └────────┬─────────┘
         │                 │ amenities        │                │
         │                 │ images           │                │
         │                 │ check_in_time    │                │
         │                 │ check_out_time   │                │
         │                 │ policies         │                │
         │                 │ has_pods         │                │
         │                 │ has_rooms        │                │
         │                 │ rating           │                │
         │                 │ review_count     │                │
         │                 │ status           │                │
         │                 │ verified         │                │
         │                 │ featured         │                │
         │                 │ created_at       │                │
         │                 │ updated_at       │                │
         │                 └────────┬─────────┘                │
         │                          │                          │
         │              ┌───────────┴───────────┐              │
         │              │                       │              │
         │              ▼                       ▼              │
         │     ┌──────────────────┐    ┌──────────────────┐   │
         │     │       pods       │    │   room_pricing   │   │
         │     ├──────────────────┤    ├──────────────────┤   │
         │     │ id (PK)          │    │ id (PK)          │   │
         │     │ hotel_id (FK)    │    │ room_id (FK)     │   │
         │     │ investor_id (FK) │    │ date             │   │
         │     │ pod_number       │    │ price            │   │
         │     │ type             │    │ available        │   │
         │     │ hourly_rate      │    │ created_at       │   │
         │     │ status           │    └──────────────────┘   │
         │     │ features         │                           │
         │     │ qr_code          │                           │
         │     │ created_at       │                           │
         │     │ updated_at       │                           │
         │     └────────┬─────────┘                           │
         │              │                                     │
         │              │                                     │
         ▼              ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                             bookings                                  │
├──────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                              │
│ user_id (FK)           - Customer who booked                         │
│ hotel_id (FK)          - Hotel/Property                              │
│ booking_type           - 'POD' or 'ROOM'                             │
│ booking_number         - Unique booking reference                    │
│                                                                      │
│ -- For POD bookings --                                               │
│ pod_id (FK)            - Which pod                                   │
│ pod_type               - SINGLE or DOUBLE                            │
│ start_time             - Check-in datetime                           │
│ end_time               - Check-out datetime                          │
│ duration_hours         - Total hours                                 │
│ hourly_rate            - Rate per hour                               │
│                                                                      │
│ -- For ROOM bookings --                                              │
│ room_id (FK)           - Which room type                             │
│ check_in_date          - Check-in date                               │
│ check_out_date         - Check-out date                              │
│ nights                 - Number of nights                            │
│ room_count             - Number of rooms                             │
│ guests                 - Number of guests                            │
│ nightly_rate           - Rate per night                              │
│ guest_name             - Primary guest name                          │
│ guest_phone            - Guest contact                               │
│ guest_id_type          - Aadhar/Passport/etc                         │
│ guest_id_number        - ID number                                   │
│                                                                      │
│ -- Common fields --                                                  │
│ base_amount            - Before discounts                            │
│ discount_amount        - Discount applied                            │
│ tax_amount             - GST/taxes                                   │
│ commission_amount      - Platform commission                         │
│ total_amount           - Final amount                                │
│ status                 - Booking status                              │
│ payment_status         - Payment status                              │
│ special_requests       - Guest requests                              │
│ qr_code                - For pod check-in                            │
│ voucher_code           - For room booking                            │
│ check_in_time          - Actual check-in                             │
│ check_out_time         - Actual check-out                            │
│ created_at                                                           │
│ updated_at                                                           │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    payments      │       │   withdrawals    │       │   investors      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ booking_id (FK)  │       │ investor_id (FK) │       │ user_id (FK)     │
│ user_id (FK)     │       │ amount           │       │ total_invested   │
│ amount           │       │ status           │       │ total_earnings   │
│ currency         │       │ payment_method   │       │ pending_payout   │
│ payment_method   │       │ transaction_id   │       │ revenue_share    │
│ payment_gateway  │       │ processed_at     │       │ bank_details     │
│ gateway_order_id │       │ created_at       │       │ kyc_status       │
│ gateway_pay_id   │       └──────────────────┘       │ created_at       │
│ status           │                                  └──────────────────┘
│ metadata         │       ┌──────────────────┐
│ created_at       │       │     reviews      │       ┌──────────────────┐
└──────────────────┘       ├──────────────────┤       │ partner_payouts  │
                           │ id (PK)          │       ├──────────────────┤
┌──────────────────┐       │ user_id (FK)     │       │ id (PK)          │
│    referrals     │       │ hotel_id (FK)    │       │ owner_id (FK)    │
├──────────────────┤       │ booking_id (FK)  │       │ amount           │
│ id (PK)          │       │ rating           │       │ period_start     │
│ referrer_id (FK) │       │ title            │       │ period_end       │
│ referred_id (FK) │       │ comment          │       │ commission_amt   │
│ investment_amt   │       │ response         │       │ status           │
│ bonus_amount     │       │ created_at       │       │ processed_at     │
│ bonus_percent    │       └──────────────────┘       │ created_at       │
│ status           │                                  └──────────────────┘
│ created_at       │
└──────────────────┘
```

### 7.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============== ENUMS ==============

enum UserRole {
  CUSTOMER
  HOTEL_OWNER
  INVESTOR
  STAFF
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum PodType {
  SINGLE
  DOUBLE
}

enum PodStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  OFFLINE
}

enum RoomType {
  SINGLE
  DOUBLE
  TWIN
  SUITE
  DELUXE
  FAMILY
}

enum RoomStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  BLOCKED
}

enum BookingType {
  POD
  ROOM
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  UPI
  CARD
  NET_BANKING
  WALLET
  CRYPTO
  CASH
  PAY_AT_HOTEL
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum HotelCategory {
  AIRPORT
  RAILWAY_STATION
  BUS_STATION
  HIGHWAY
  HOSPITAL
  TOURIST
  BUSINESS
  RESIDENTIAL
  MALL
  OTHER
}

enum PropertyType {
  HOTEL
  RESORT
  GUEST_HOUSE
  HOSTEL
  HOMESTAY
  APARTMENT
  POD_ONLY
}

enum PartnerStatus {
  PENDING
  APPROVED
  SUSPENDED
  REJECTED
}

enum KYCStatus {
  PENDING
  SUBMITTED
  VERIFIED
  REJECTED
}

// ============== MODELS ==============

model User {
  id              String       @id @default(cuid())
  email           String?      @unique
  phone           String       @unique
  passwordHash    String?      @map("password_hash")
  name            String
  avatarUrl       String?      @map("avatar_url")
  role            UserRole     @default(CUSTOMER)
  status          UserStatus   @default(ACTIVE)
  emailVerified   Boolean      @default(false) @map("email_verified")
  phoneVerified   Boolean      @default(false) @map("phone_verified")
  
  // ID Verification for room bookings
  idType          String?      @map("id_type")      // Aadhar, Passport, etc.
  idNumber        String?      @map("id_number")
  idVerified      Boolean      @default(false) @map("id_verified")
  
  // Relations
  bookings        Booking[]
  payments        Payment[]
  investor        Investor?
  hotelOwner      HotelOwner?
  reviews         Review[]
  referralsMade   Referral[]   @relation("Referrer")
  referredBy      Referral?    @relation("Referred")
  walletBalance   Decimal      @default(0) @db.Decimal(10, 2) @map("wallet_balance")
  
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@map("users")
}

// ============== HOTEL OWNER / PARTNER ==============

model HotelOwner {
  id              String          @id @default(cuid())
  userId          String          @unique @map("user_id")
  
  businessName    String          @map("business_name")
  gstNumber       String?         @map("gst_number")
  panNumber       String?         @map("pan_number")
  
  commissionRate  Decimal         @default(18) @db.Decimal(5, 2) @map("commission_rate") // 15-20% for rooms
  status          PartnerStatus   @default(PENDING)
  
  bankName        String?         @map("bank_name")
  bankAccountNo   String?         @map("bank_account_no")
  bankIfsc        String?         @map("bank_ifsc")
  upiId           String?         @map("upi_id")
  
  kycStatus       KYCStatus       @default(PENDING) @map("kyc_status")
  kycDocuments    Json?           @map("kyc_documents")
  
  verifiedAt      DateTime?       @map("verified_at")
  verifiedBy      String?         @map("verified_by")
  
  // Relations
  user            User            @relation(fields: [userId], references: [id])
  hotels          Hotel[]
  payouts         PartnerPayout[]
  
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@map("hotel_owners")
}

// ============== HOTEL / PROPERTY ==============

model Hotel {
  id              String          @id @default(cuid())
  ownerId         String          @map("owner_id")
  
  name            String
  slug            String          @unique
  description     String?         @db.Text
  
  address         String
  city            String
  state           String
  pincode         String
  landmark        String?
  latitude        Decimal         @db.Decimal(10, 8)
  longitude       Decimal         @db.Decimal(11, 8)
  
  category        HotelCategory
  propertyType    PropertyType    @map("property_type")
  starRating      Int?            @map("star_rating")       // 1-5 stars
  
  amenities       String[]
  images          String[]
  policies        Json?                                      // Cancellation, check-in rules
  
  checkInTime     String          @default("14:00") @map("check_in_time")
  checkOutTime    String          @default("11:00") @map("check_out_time")
  
  // Capabilities
  hasPods         Boolean         @default(false) @map("has_pods")
  hasRooms        Boolean         @default(true) @map("has_rooms")
  
  // Stats
  rating          Decimal         @default(0) @db.Decimal(2, 1)
  reviewCount     Int             @default(0) @map("review_count")
  
  // Status
  status          String          @default("pending")        // pending, active, inactive
  verified        Boolean         @default(false)
  featured        Boolean         @default(false)
  
  contactPhone    String?         @map("contact_phone")
  contactEmail    String?         @map("contact_email")
  
  // Relations
  owner           HotelOwner      @relation(fields: [ownerId], references: [id])
  rooms           Room[]
  pods            Pod[]
  bookings        Booking[]
  reviews         Review[]
  
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([city])
  @@index([category])
  @@index([latitude, longitude])
  @@index([status])
  @@map("hotels")
}

// ============== ROOMS (Traditional Hotel Rooms) ==============

model Room {
  id              String       @id @default(cuid())
  hotelId         String       @map("hotel_id")
  
  name            String                               // "Deluxe Room", "Suite"
  type            RoomType
  description     String?      @db.Text
  
  basePrice       Decimal      @db.Decimal(10, 2) @map("base_price")  // Per night
  maxGuests       Int          @default(2) @map("max_guests")
  bedType         String?      @map("bed_type")       // King, Queen, Twin
  roomSize        Int?         @map("room_size")      // sq ft
  
  amenities       String[]
  images          String[]
  
  totalCount      Int          @default(1) @map("total_count")
  status          RoomStatus   @default(AVAILABLE)
  
  // Relations
  hotel           Hotel        @relation(fields: [hotelId], references: [id])
  bookings        Booking[]
  pricing         RoomPricing[]
  
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@map("rooms")
}

model RoomPricing {
  id              String       @id @default(cuid())
  roomId          String       @map("room_id")
  
  date            DateTime     @db.Date
  price           Decimal      @db.Decimal(10, 2)
  available       Int          @default(1)
  
  // Relations
  room            Room         @relation(fields: [roomId], references: [id])
  
  createdAt       DateTime     @default(now()) @map("created_at")

  @@unique([roomId, date])
  @@index([roomId, date])
  @@map("room_pricing")
}

// ============== PODS (Hourly Booking) ==============

model Pod {
  id              String       @id @default(cuid())
  hotelId         String       @map("hotel_id")
  investorId      String?      @map("investor_id")
  podNumber       String       @map("pod_number")
  type            PodType
  hourlyRate      Decimal      @db.Decimal(10, 2) @map("hourly_rate")
  status          PodStatus    @default(AVAILABLE)
  features        String[]
  qrCode          String       @unique @map("qr_code")
  floor           Int?
  notes           String?
  
  // Relations
  hotel           Hotel        @relation(fields: [hotelId], references: [id])
  investor        Investor?    @relation(fields: [investorId], references: [id])
  bookings        Booking[]
  maintenanceLogs MaintenanceLog[]
  
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@unique([hotelId, podNumber])
  @@map("pods")
}

// ============== BOOKING (Unified - Pods & Rooms) ==============

model Booking {
  id              String          @id @default(cuid())
  bookingNumber   String          @unique @map("booking_number")
  bookingType     BookingType     @map("booking_type")      // POD or ROOM
  
  userId          String          @map("user_id")
  hotelId         String          @map("hotel_id")
  
  // For POD bookings
  podId           String?         @map("pod_id")
  podType         PodType?        @map("pod_type")
  startTime       DateTime?       @map("start_time")
  endTime         DateTime?       @map("end_time")
  durationHours   Decimal?        @db.Decimal(4, 2) @map("duration_hours")
  hourlyRate      Decimal?        @db.Decimal(10, 2) @map("hourly_rate")
  
  // For ROOM bookings
  roomId          String?         @map("room_id")
  checkInDate     DateTime?       @db.Date @map("check_in_date")
  checkOutDate    DateTime?       @db.Date @map("check_out_date")
  nights          Int?
  roomCount       Int?            @default(1) @map("room_count")
  guests          Int?            @default(1)
  nightlyRate     Decimal?        @db.Decimal(10, 2) @map("nightly_rate")
  
  // Guest details
  guestName       String          @map("guest_name")
  guestPhone      String          @map("guest_phone")
  guestEmail      String?         @map("guest_email")
  guestIdType     String?         @map("guest_id_type")
  guestIdNumber   String?         @map("guest_id_number")
  specialRequests String?         @map("special_requests")
  
  // Pricing
  baseAmount      Decimal         @db.Decimal(10, 2) @map("base_amount")
  discountAmount  Decimal         @default(0) @db.Decimal(10, 2) @map("discount_amount")
  taxAmount       Decimal         @default(0) @db.Decimal(10, 2) @map("tax_amount")
  commissionAmt   Decimal         @default(0) @db.Decimal(10, 2) @map("commission_amount")
  totalAmount     Decimal         @db.Decimal(10, 2) @map("total_amount")
  
  // Status
  status          BookingStatus   @default(PENDING)
  paymentStatus   PaymentStatus   @default(PENDING) @map("payment_status")
  
  // Check-in/out
  checkInTime     DateTime?       @map("check_in_time")
  checkOutTime    DateTime?       @map("check_out_time")
  
  // Codes
  qrCode          String?         @unique @map("qr_code")       // For pod check-in
  voucherCode     String?         @unique @map("voucher_code")  // For room booking
  
  // Relations
  user            User            @relation(fields: [userId], references: [id])
  hotel           Hotel           @relation(fields: [hotelId], references: [id])
  pod             Pod?            @relation(fields: [podId], references: [id])
  room            Room?           @relation(fields: [roomId], references: [id])
  payments        Payment[]
  review          Review?
  
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([userId])
  @@index([hotelId])
  @@index([bookingType])
  @@index([status])
  @@map("bookings")
}

// ============== REVIEWS ==============

model Review {
  id              String       @id @default(cuid())
  userId          String       @map("user_id")
  hotelId         String       @map("hotel_id")
  bookingId       String       @unique @map("booking_id")
  
  rating          Int                                     // 1-5
  title           String?
  comment         String?      @db.Text
  
  // Hotel response
  response        String?      @db.Text
  respondedAt     DateTime?    @map("responded_at")
  
  // Relations
  user            User         @relation(fields: [userId], references: [id])
  hotel           Hotel        @relation(fields: [hotelId], references: [id])
  booking         Booking      @relation(fields: [bookingId], references: [id])
  
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([hotelId])
  @@map("reviews")
}

// ============== PAYMENTS ==============

model Payment {
  id              String          @id @default(cuid())
  bookingId       String          @map("booking_id")
  userId          String          @map("user_id")
  
  amount          Decimal         @db.Decimal(10, 2)
  currency        String          @default("INR")
  paymentMethod   PaymentMethod   @map("payment_method")
  paymentGateway  String          @map("payment_gateway")
  
  gatewayOrderId  String?         @map("gateway_order_id")
  gatewayPaymentId String?        @map("gateway_payment_id")
  gatewaySignature String?        @map("gateway_signature")
  
  status          PaymentStatus   @default(PENDING)
  metadata        Json?
  failureReason   String?         @map("failure_reason")
  
  refundAmount    Decimal?        @db.Decimal(10, 2) @map("refund_amount")
  refundId        String?         @map("refund_id")
  refundedAt      DateTime?       @map("refunded_at")
  
  // Relations
  booking         Booking         @relation(fields: [bookingId], references: [id])
  user            User            @relation(fields: [userId], references: [id])
  
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([bookingId])
  @@index([userId])
  @@index([status])
  @@map("payments")
}

// ============== PARTNER PAYOUTS ==============

model PartnerPayout {
  id              String          @id @default(cuid())
  ownerId         String          @map("owner_id")
  
  amount          Decimal         @db.Decimal(12, 2)
  commissionAmt   Decimal         @db.Decimal(10, 2) @map("commission_amount")
  
  periodStart     DateTime        @db.Date @map("period_start")
  periodEnd       DateTime        @db.Date @map("period_end")
  
  status          WithdrawalStatus @default(PENDING)
  transactionId   String?         @map("transaction_id")
  processedAt     DateTime?       @map("processed_at")
  
  // Relations
  owner           HotelOwner      @relation(fields: [ownerId], references: [id])
  
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([ownerId])
  @@map("partner_payouts")
}

// ============== INVESTOR ==============

model Investor {
  id              String            @id @default(cuid())
  userId          String            @unique @map("user_id")
  
  totalInvested   Decimal           @default(0) @db.Decimal(12, 2) @map("total_invested")
  totalEarnings   Decimal           @default(0) @db.Decimal(12, 2) @map("total_earnings")
  pendingPayout   Decimal           @default(0) @db.Decimal(12, 2) @map("pending_payout")
  revenueShare    Decimal           @default(60) @db.Decimal(5, 2) @map("revenue_share")
  
  bankName        String?           @map("bank_name")
  bankAccountNo   String?           @map("bank_account_no")
  bankIfsc        String?           @map("bank_ifsc")
  upiId           String?           @map("upi_id")
  
  kycStatus       KYCStatus         @default(PENDING) @map("kyc_status")
  kycDocuments    Json?             @map("kyc_documents")
  
  referralCode    String            @unique @map("referral_code")
  
  // Relations
  user            User              @relation(fields: [userId], references: [id])
  pods            Pod[]
  withdrawals     Withdrawal[]
  earnings        InvestorEarning[]
  
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@map("investors")
}

model InvestorEarning {
  id              String       @id @default(cuid())
  investorId      String       @map("investor_id")
  bookingId       String?      @map("booking_id")
  
  grossAmount     Decimal      @db.Decimal(10, 2) @map("gross_amount")
  sharePercent    Decimal      @db.Decimal(5, 2) @map("share_percent")
  netAmount       Decimal      @db.Decimal(10, 2) @map("net_amount")
  
  description     String?
  
  // Relations
  investor        Investor     @relation(fields: [investorId], references: [id])
  
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([investorId])
  @@map("investor_earnings")
}

model Withdrawal {
  id              String            @id @default(cuid())
  investorId      String            @map("investor_id")
  
  amount          Decimal           @db.Decimal(10, 2)
  status          WithdrawalStatus  @default(PENDING)
  paymentMethod   PaymentMethod     @map("payment_method")
  
  transactionId   String?           @map("transaction_id")
  processedAt     DateTime?         @map("processed_at")
  processedBy     String?           @map("processed_by")
  
  remarks         String?
  
  // Relations
  investor        Investor          @relation(fields: [investorId], references: [id])
  
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@index([investorId])
  @@index([status])
  @@map("withdrawals")
}

model Referral {
  id              String       @id @default(cuid())
  referrerId      String       @map("referrer_id")
  referredId      String       @unique @map("referred_id")
  
  investmentAmount Decimal?    @db.Decimal(12, 2) @map("investment_amount")
  bonusPercent    Decimal      @default(2) @db.Decimal(5, 2) @map("bonus_percent")
  bonusAmount     Decimal?     @db.Decimal(10, 2) @map("bonus_amount")
  
  status          String       @default("PENDING")
  paidAt          DateTime?    @map("paid_at")
  
  // Relations
  referrer        User         @relation("Referrer", fields: [referrerId], references: [id])
  referred        User         @relation("Referred", fields: [referredId], references: [id])
  
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([referrerId])
  @@map("referrals")
}

model MaintenanceLog {
  id              String       @id @default(cuid())
  podId           String       @map("pod_id")
  
  type            String
  description     String
  status          String       @default("PENDING")
  resolvedAt      DateTime?    @map("resolved_at")
  resolvedBy      String?      @map("resolved_by")
  cost            Decimal?     @db.Decimal(10, 2)
  
  // Relations
  pod             Pod          @relation(fields: [podId], references: [id])
  
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@index([podId])
  @@map("maintenance_logs")
}

model OTP {
  id              String       @id @default(cuid())
  phone           String
  code            String
  purpose         String       // LOGIN, REGISTER, RESET_PASSWORD
  expiresAt       DateTime     @map("expires_at")
  verified        Boolean      @default(false)
  attempts        Int          @default(0)
  
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([phone, purpose])
  @@map("otps")
}

model SystemConfig {
  id              String       @id @default(cuid())
  key             String       @unique
  value           Json
  description     String?
  
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  @@map("system_config")
}
```

---

## 8. API Documentation

> **Note:** For the complete API reference with all endpoints, request/response schemas, and examples, see [API_REFERENCE.md](./API_REFERENCE.md).

### 8.1 API Overview

| Base URL | Environment |
|----------|-------------|
| `http://localhost:4000/api/v1` | Development |
| `https://api.naploo.com/v1` | Production |

### 8.2 API Categories

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Auth** | `/auth/*` | OTP-based authentication, JWT tokens |
| **Users** | `/users/*` | Profile management, wallet |
| **Search** | `/search/*` | Unified search for hotels, pods, rooms |
| **Hotels** | `/hotels/*` | Hotel listings, details, availability |
| **Rooms** | `/hotels/:id/rooms/*` | Room types, pricing, availability |
| **Pods** | `/pods/*` | Pod details, availability |
| **Bookings** | `/bookings/*` | Create/manage bookings (POD + ROOM) |
| **Payments** | `/payments/*` | Razorpay integration |
| **Reviews** | `/reviews/*` | Customer reviews |
| **Partner** | `/partner/*` | Hotel owner portal APIs |
| **Investor** | `/investor/*` | Pod investor APIs |
| **Admin** | `/admin/*` | Administrative APIs |

### 8.3 Key API Flows

#### Unified Search Flow
```http
GET /search?city=Delhi&type=ALL&checkIn=2024-12-25&checkOut=2024-12-26
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "htl_xxxx",
        "type": "HOTEL",
        "name": "Grand Palace Hotel",
        "hasPods": true,
        "hasRooms": true,
        "lowestPrice": {
          "pod": { "hourly": 150 },
          "room": { "nightly": 2500 }
        }
      }
    ]
  }
}
```

#### Booking Flow (Pod vs Room)
```http
# Pod Booking
POST /bookings
{
  "type": "POD",
  "hotelId": "htl_xxxx",
  "podId": "pod_xxxx",
  "startTime": "2024-12-25T14:00:00",
  "endTime": "2024-12-25T17:00:00"
}

# Room Booking  
POST /bookings
{
  "type": "ROOM",
  "hotelId": "htl_xxxx",
  "roomTypeId": "rtyp_xxxx",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "guests": { "adults": 2 }
}
```

#### Partner (Hotel Owner) Flow
```http
# Register as Partner
POST /partner/register
{ "businessName": "...", "gstin": "...", ... }

# Add Property
POST /partner/properties
{ "name": "...", "hasPods": true, "hasRooms": true, ... }

# Manage Inventory
POST /partner/properties/:id/rooms
POST /partner/properties/:id/pods

# View Earnings
GET /partner/earnings
```

### 8.4 Authentication

All authenticated endpoints require a Bearer token:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token types:
- **Access Token:** 15 minutes validity
- **Refresh Token:** 7 days validity

### 8.5 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "phone", "message": "Phone is required" }
    ]
  }
}
```

For complete API documentation including all endpoints, request/response schemas, and examples, refer to [API_REFERENCE.md](./API_REFERENCE.md).

---

## 9. UI/UX Design System

### 9.1 Brand Colors

```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;   /* Main Primary */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

/* Secondary Colors (Accent) */
--color-secondary-500: #8b5cf6;  /* Purple accent */

/* Semantic Colors */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### 9.2 Typography

```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 9.3 Spacing System

```css
/* Spacing Scale (Tailwind-based) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 9.4 Component Specifications

#### Buttons

```typescript
// Button Variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Primary Button
// bg-primary-500 hover:bg-primary-600 text-white
// Rounded: rounded-lg (8px)
// Padding: px-4 py-2 (md), px-6 py-3 (lg)

// Secondary Button
// bg-gray-100 hover:bg-gray-200 text-gray-900

// Outline Button
// border border-gray-300 hover:bg-gray-50 text-gray-700
```

#### Cards

```typescript
// Card Component
// Background: bg-white
// Border: border border-gray-200
// Border Radius: rounded-xl (12px)
// Shadow: shadow-sm
// Padding: p-6

// Card with Hover
// hover:shadow-md transition-shadow duration-200
```

#### Form Inputs

```typescript
// Input Field
// Background: bg-white
// Border: border border-gray-300
// Border Radius: rounded-lg (8px)
// Focus: ring-2 ring-primary-500 border-transparent
// Height: h-10 (md), h-12 (lg)
// Padding: px-4

// Error State
// border-error ring-error/20
```

### 9.5 Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
--screen-sm: 640px;    /* Small devices */
--screen-md: 768px;    /* Medium devices */
--screen-lg: 1024px;   /* Large devices */
--screen-xl: 1280px;   /* Extra large */
--screen-2xl: 1536px;  /* 2X Extra large */
```

### 9.6 Animation Guidelines

```css
/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

/* Common Animations */
.fade-in { animation: fadeIn 200ms ease; }
.slide-up { animation: slideUp 300ms ease; }
.scale-in { animation: scaleIn 200ms ease; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 10. Development Roadmap

### 10.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT TIMELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: Foundation & Website (Weeks 1-6)                              │
│  ═══════════════════════════════════════════                            │
│  ████████████████████████████████████████████                           │
│                                                                          │
│  PHASE 2: Mobile App Development (Weeks 7-10)                           │
│  ═══════════════════════════════════════════                            │
│                              ████████████████████████                   │
│                                                                          │
│  PHASE 3: Admin & Investor Portal (Weeks 9-12)                          │
│  ═══════════════════════════════════════════                            │
│                                      ████████████████████               │
│                                                                          │
│  PHASE 4: Testing & Launch (Weeks 11-14)                                │
│  ═══════════════════════════════════════════                            │
│                                              ████████████████           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Detailed Sprint Plan

#### PHASE 1: Foundation & Website (Weeks 1-6)

**Sprint 1 (Week 1-2): Project Setup & Foundation**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Monorepo Setup | Initialize Turborepo, configure workspaces | High | 8 |
| Backend Scaffolding | Fastify setup, folder structure, configs | High | 16 |
| Database Setup | Prisma schema, migrations, seed data | High | 12 |
| Authentication | JWT, OTP service, middleware | High | 16 |
| Frontend Scaffolding | Next.js setup, Tailwind, shadcn/ui | High | 8 |
| Shared Packages | Types, utils, UI components | Medium | 12 |
| CI/CD Pipeline | GitHub Actions for testing | Medium | 8 |

**Sprint 2 (Week 3-4): Core Website Pages**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Home Page | Hero, features, pod showcase | High | 20 |
| Location APIs | CRUD, search, nearby | High | 16 |
| Locations Page | Map view, list, filters | High | 16 |
| Pod Details Page | Features, gallery, pricing | High | 12 |
| About Page | Company info, mission | Medium | 8 |
| Contact Page | Form, map, details | Medium | 6 |
| Gallery Page | Image grid, lightbox | Medium | 8 |

**Sprint 3 (Week 5-6): Booking System**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Booking APIs | Availability, create, manage | High | 24 |
| Search & Filter | Location search, date/time picker | High | 16 |
| Pod Selection | Type selection, features display | High | 12 |
| Checkout Flow | Price summary, guest details | High | 16 |
| Payment Integration | Razorpay integration | High | 20 |
| Confirmation Page | QR code, booking details | High | 8 |
| User Dashboard | Bookings list, profile | High | 16 |
| Email Notifications | Booking confirmations | Medium | 8 |

---

#### PHASE 2: Mobile App Development (Weeks 7-10)

**Sprint 4 (Week 7-8): Mobile App Core**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Expo Setup | React Native + Expo initialization | High | 8 |
| Navigation | Tab navigator, stack navigators | High | 12 |
| Auth Screens | Login, OTP, registration | High | 16 |
| Home Screen | Nearby locations, quick book | High | 16 |
| Search Screen | Map view, filters, list | High | 20 |
| Location Detail | Full location info, pods | High | 12 |
| API Integration | Connect to backend APIs | High | 16 |

**Sprint 5 (Week 9-10): Mobile App Features**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Booking Flow | Complete mobile booking | High | 24 |
| Payment Screen | Razorpay mobile SDK | High | 16 |
| My Bookings | Active, upcoming, past | High | 12 |
| QR Code Display | Booking pass | High | 8 |
| Push Notifications | FCM integration | High | 12 |
| Profile & Settings | User preferences | Medium | 8 |
| Offline Support | Cached data, offline pass | Medium | 12 |
| App Store Prep | Icons, screenshots, metadata | Medium | 8 |

---

#### PHASE 3: Admin & Investor Portal (Weeks 9-12)

**Sprint 6 (Week 9-10): Investor Portal**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Investor Auth | Separate login, verification | High | 12 |
| Dashboard | Earnings overview, charts | High | 20 |
| Pod Management | View owned pods, performance | High | 16 |
| Withdrawal System | Request, track payouts | High | 16 |
| Earnings History | Detailed transaction log | High | 12 |
| Referral System | Generate links, track bonuses | Medium | 12 |
| Documents | Agreements, tax statements | Medium | 8 |

**Sprint 7 (Week 11-12): Admin Dashboard**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| Admin Auth | Role-based access | High | 8 |
| Main Dashboard | Key metrics, alerts | High | 16 |
| Location Management | Add, edit, configure | High | 20 |
| Pod Management | Inventory, status, assign investor | High | 16 |
| Booking Management | View, modify, cancel | High | 16 |
| User Management | Customers, investors, staff | High | 12 |
| Reports | Revenue, occupancy, analytics | Medium | 16 |
| Settings | System configuration | Medium | 8 |

---

#### PHASE 4: Testing & Launch (Weeks 11-14)

**Sprint 8 (Week 13-14): Polish & Launch**
| Task | Description | Priority | Est. Hours |
|------|-------------|----------|------------|
| E2E Testing | Cypress/Playwright tests | High | 24 |
| Performance Optimization | Lighthouse, load testing | High | 16 |
| Security Audit | OWASP checks, pen testing | High | 16 |
| Bug Fixes | Address QA findings | High | 20 |
| Documentation | API docs, user guides | Medium | 12 |
| Production Setup | Vercel, Railway deployment | High | 12 |
| Mobile App Submission | App Store, Play Store | High | 12 |
| Launch Monitoring | Analytics, error tracking | High | 8 |

### 10.3 Milestone Summary

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **M1: Foundation** | Week 2 | Project setup, auth, DB schema |
| **M2: Website MVP** | Week 4 | Public pages, location browsing |
| **M3: Booking Live** | Week 6 | Full booking flow with payments |
| **M4: Mobile Beta** | Week 8 | iOS/Android app with core features |
| **M5: Investor Portal** | Week 10 | Full investor dashboard |
| **M6: Admin Dashboard** | Week 12 | Complete admin functionality |
| **M7: Launch Ready** | Week 14 | Production deployment |

---

## 11. Deployment Strategy

> **Note:** For the complete deployment guide including server setup, configurations, and commands, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### 11.1 Infrastructure Overview (Self-Hosted Linux)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SELF-HOSTED LINUX SERVER                              │
│                         (naploo.com)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│         ┌───────────────────────────────────────────────┐               │
│         │              CLOUDFLARE DNS                    │               │
│         │        (DNS, DDoS Protection, CDN)            │               │
│         └─────────────────────┬─────────────────────────┘               │
│                               │                                          │
│                               ▼                                          │
│         ┌───────────────────────────────────────────────┐               │
│         │         NGINX REVERSE PROXY + SSL             │               │
│         │    (Let's Encrypt via Certbot)                │               │
│         └──────┬──────────┬──────────┬──────────┬──────┘               │
│                │          │          │          │                        │
│                ▼          ▼          ▼          ▼                        │
│         ┌──────────┐┌──────────┐┌──────────┐┌──────────┐               │
│         │naploo.com││partner.  ││investor. ││admin.    │               │
│         │  (Web)   ││naploo.com││naploo.com││naploo.com│               │
│         │ PM2:3000 ││ PM2:3001 ││ PM2:3002 ││ PM2:3003 │               │
│         └──────────┘└──────────┘└──────────┘└──────────┘               │
│                               │                                          │
│                               ▼                                          │
│         ┌───────────────────────────────────────────────┐               │
│         │            BACKEND API (PM2:4000)              │               │
│         │              api.naploo.com                    │               │
│         └──────────────────────┬────────────────────────┘               │
│                                │                                         │
│                ┌───────────────┼───────────────┐                        │
│                ▼               ▼               ▼                         │
│         ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│         │PostgreSQL│    │  Redis   │    │  Local   │                   │
│         │    16    │    │    7     │    │ Storage  │                   │
│         └──────────┘    └──────────┘    │ (Uploads)│                   │
│                                         └──────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Domain Configuration

| Domain | Application | Port |
|--------|-------------|------|
| `naploo.com` | Customer Website | 3000 |
| `partner.naploo.com` | Hotel Owner Portal | 3001 |
| `investor.naploo.com` | Investor Portal | 3002 |
| `admin.naploo.com` | Admin Dashboard | 3003 |
| `api.naploo.com` | Backend API | 4000 |

### 11.3 Environment Configuration

```bash
# .env.production

# App
NODE_ENV=production
APP_URL=https://naploo.com
API_URL=https://api.naploo.com

# Database (Local PostgreSQL)
DATABASE_URL=postgresql://naploo:password@localhost:5432/naploo_prod

# Redis (Local)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# SMS (MSG91)
MSG91_AUTH_KEY=xxx
MSG91_SENDER_ID=NAPLOO
MSG91_TEMPLATE_ID=xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@naploo.com

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=naploo-app
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# Storage (Local)
UPLOAD_DIR=/var/www/naploo/uploads
PUBLIC_URL=https://naploo.com/uploads

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 11.4 PM2 Process Management

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'naploo-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/naploo/apps/web',
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'naploo-partner',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/naploo/apps/partner',
    },
    {
      name: 'naploo-investor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/naploo/apps/investor',
    },
    {
      name: 'naploo-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      cwd: '/var/www/naploo/apps/admin',
    },
    {
      name: 'naploo-api',
      script: 'dist/server.js',
      cwd: '/var/www/naploo/apps/backend',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 11.5 CI/CD Pipeline (GitHub Actions → SSH Deployment)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/naploo
            git pull origin main
            pnpm install
            pnpm build
            pm2 reload ecosystem.config.js
```

For the complete deployment guide with server setup, Nginx configurations, SSL setup, backup strategies, and monitoring, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 12. Security Guidelines

### 12.1 Authentication Security

```typescript
// Password Requirements
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
};

// JWT Configuration
const jwtConfig = {
  algorithm: 'RS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'naploo.in',
};

// OTP Configuration
const otpConfig = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  cooldownMinutes: 1,
};

// Rate Limiting
const rateLimits = {
  login: '5 requests per minute',
  otp: '3 requests per 5 minutes',
  api: '100 requests per minute',
  booking: '10 requests per minute',
};
```

### 12.2 Data Protection

```typescript
// Sensitive Data Handling
- Passwords: bcrypt with salt rounds = 12
- PII Data: AES-256 encryption at rest
- Payment Info: Never stored, tokenized via Razorpay
- Logs: Sanitize sensitive fields before logging

// Database Security
- SSL/TLS connections required
- IP whitelist for production DB
- Regular automated backups
- Point-in-time recovery enabled
```

### 12.3 API Security Checklist

- [ ] All endpoints require authentication (except public routes)
- [ ] Role-based access control (RBAC) implemented
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection (tokens for state-changing requests)
- [ ] Rate limiting on all endpoints
- [ ] Request size limits configured
- [ ] CORS properly configured
- [ ] Security headers (Helmet.js)
- [ ] HTTPS enforced everywhere
- [ ] API versioning for backward compatibility

### 12.4 Compliance

| Requirement | Implementation |
|-------------|----------------|
| **GDPR** | Data export, deletion requests, consent management |
| **PCI DSS** | No card data storage, Razorpay handles compliance |
| **Data Localization** | Indian data stored in ap-south-1 (Mumbai) |

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │  10%
                    │  Tests  │
                    ├─────────┤
               ┌────┴─────────┴────┐
               │   Integration     │  30%
               │      Tests        │
               ├───────────────────┤
          ┌────┴───────────────────┴────┐
          │        Unit Tests           │  60%
          │                             │
          └─────────────────────────────┘
```

### 13.2 Testing Tools

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Vitest | Fast unit testing |
| Integration | Vitest + Supertest | API testing |
| E2E (Web) | Playwright | Browser automation |
| E2E (Mobile) | Detox | React Native testing |
| Load Testing | k6 | Performance testing |
| Visual Regression | Chromatic | UI testing |

### 13.3 Test Coverage Targets

| Category | Target |
|----------|--------|
| Unit Tests | 80% |
| Integration Tests | 70% |
| E2E Critical Paths | 100% |

### 13.4 Critical Test Scenarios

```typescript
// Booking Flow Tests
describe('Booking Flow', () => {
  test('User can search for available pods');
  test('User can select date and time slot');
  test('Pricing calculation is correct');
  test('Discount applies for additional hours');
  test('Payment gateway integration works');
  test('Booking confirmation generates QR code');
  test('QR code check-in works');
});

// Payment Tests
describe('Payment Processing', () => {
  test('Razorpay order creation');
  test('Payment verification');
  test('Failed payment handling');
  test('Refund processing');
});

// Investor Tests
describe('Investor Portal', () => {
  test('Dashboard shows correct earnings');
  test('Withdrawal request creation');
  test('Referral bonus calculation');
});
```

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| **Pod** | Individual sleeping capsule unit |
| **Location** | Naploo hotel property with multiple pods |
| **Booking** | Reservation for a specific pod and time slot |
| **Investor** | Person who owns pods through the lease-back program |
| **Revenue Share** | Split of booking income (60% investor, 40% BIDUA) |
| **Check-in** | Guest arrival and pod access activation |
| **QR Pass** | Digital entry pass for pod access |

### 14.2 Reference Links

| Resource | URL |
|----------|-----|
| Naploo Website | https://bidua.in/naploo |
| Investor Info | https://bidua.in/investor |
| BIDUA Pods | https://biduapods.com |
| Razorpay Docs | https://razorpay.com/docs |
| Next.js Docs | https://nextjs.org/docs |
| React Native | https://reactnative.dev |
| Prisma Docs | https://prisma.io/docs |

### 14.3 Contact Information

| Role | Contact |
|------|---------|
| **Company** | BIDUA Industries Pvt Ltd |
| **Address** | H-77 Ground floor, Sec 62, Noida, UP, India 201305 |
| **Email** | biduaindustries@gmail.com |
| **Support** | support@biduapods.com |
| **Phone** | +91 9512921903 |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 22 Jan 2026 | Development Team | Initial documentation |

---

*This document is confidential and proprietary to BIDUA Industries Pvt Ltd. Unauthorized distribution is prohibited.*
