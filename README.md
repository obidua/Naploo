# Naploo™ Ecosystem

> India's First Smart Pod Hotel Chain + Hotel Aggregator Platform + Pod Rental System

![Naploo Logo](https://bidua.in/assets/logo.svg)

## 🌟 Overview

Naploo™ is a revolutionary **hybrid accommodation & pod rental platform** that combines:

1. **Capsule/Sleeping Pods (Hotels)** - Hourly booking at affordable rates (₹150-200/hr)
2. **Traditional Hotel Rooms** - Standard nightly bookings (like OYO/Goibibo)
3. **Naploo Home Rental** - Pods for home use (12-month minimum contract)
4. **Naploo Office Nap Rooms** - Commercial office installations (12-month contract)
5. **Investor Pool System** - Crowdfunded pod investments with 3x return guarantee

The platform partners with existing hotels to install sleeping pods in their halls, giving customers two accommodation options in one place.

### Key Features

- **For Customers**: Book pods by hour OR rooms by night at partner hotels
- **For Hotel Owners**: List rooms + earn from pod installations
- **For Investors**: Pool-based investment with 3x guaranteed returns in 3 years
- **For Home Users**: Rent pods for personal use (12-month contract)
- **For Offices**: Install nap rooms for employee wellness
- **For Associates**: 5-level referral earnings program

This repository contains the complete digital ecosystem for Naploo™:

- **Customer Website** - Book pods (hourly) and rooms (nightly)
- **Mobile Apps** - React Native apps for iOS & Android
- **Partner Portal** - Dashboard for hotel owners to manage listings
- **Investor Pool Portal** - Dashboard for pod investors with pool enrollment
- **Associate Portal** - Referral management and earnings tracking
- **Rental Portal** - Home & Office pod rental management
- **Admin Dashboard** - Operations management
- **Backend API** - Microservices-based API powering all platforms

## 💼 Business Model

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         NAPLOO ECOSYSTEM                                   │
│                                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ CUSTOMERS  │  │HOTEL OWNERS│  │ INVESTORS  │  │ ASSOCIATES │          │
│  │            │  │            │  │   (Pool)   │  │            │          │
│  │• Book Pods │  │• List Rooms│  │• Pool      │  │• 5-Level   │          │
│  │  (Hourly)  │  │• Host Pods │  │  Enrollment│  │  Referrals │          │
│  │• Book Rooms│  │• 80-85%    │  │• 3x Return │  │• Earn on   │          │
│  │  (Nightly) │  │  Revenue   │  │  Guarantee │  │  All Levels│          │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
│                                                                            │
│  ┌────────────┐  ┌────────────┐                                           │
│  │HOME RENTAL │  │OFFICE NAP  │   Revenue Split:                          │
│  │            │  │   ROOMS    │   • Pod Bookings: 60% Investor, 40% Naploo│
│  │• 12-month  │  │• 12-month  │   • Room Bookings: 80-85% Hotel, 15-20%   │
│  │  Contract  │  │  Contract  │   • Rental: Fixed monthly + maintenance   │
│  │• Home Use  │  │• Corporate │                                           │
│  └────────────┘  └────────────┘                                           │
│                                                                            │
│  INVESTOR POOL SYSTEM:                                                     │
│  • Enroll in investor pool → Admin approval after KYC                     │
│  • New hotel announced → Investors can claim pod sets                     │
│  • ₹5 Lac/pod set (2 pods) + GST                                          │
│  • Options: Doorstep delivery OR Leaseback at hotel                       │
│  • 60% revenue share per booking, 3x return guaranteed in 3 years         │
│  • After 3x earned → Pods belong to Naploo (scrap policy)                 │
└───────────────────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture (Microservices)

```
naploo-ecosystem/
├── apps/
│   ├── web/                 # Next.js Customer Website
│   ├── mobile/              # React Native Mobile App
│   ├── partner/             # Next.js Hotel Owner Portal
│   ├── investor/            # Next.js Investor Pool Portal
│   ├── associate/           # Next.js Associate/Referral Portal
│   ├── rental/              # Next.js Rental Management Portal
│   └── admin/               # Next.js Admin Dashboard
├── packages/
│   ├── ui/                  # Shared UI Components
│   ├── types/               # Shared TypeScript Types
│   ├── utils/               # Shared Utilities
│   └── api-client/          # API Client SDK
├── services/                # Microservices (Bun + Elysia)
│   ├── api-gateway/         # API Gateway Service
│   ├── auth-service/        # Authentication Service
│   ├── booking-service/     # Booking Management
│   ├── payment-service/     # Payment Processing
│   ├── investor-service/    # Investor Pool Management
│   ├── referral-service/    # 5-Level Referral System
│   ├── rental-service/      # Home & Office Rentals
│   ├── notification-service/# Push, Email, SMS
│   └── analytics-service/   # Reporting & Analytics
└── docs/                    # Documentation
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Mobile** | React Native, Expo |
| **Backend Runtime** | Bun |
| **Backend Framework** | Elysia |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 |
| **Message Broker** | Apache Kafka |
| **Auth** | OAuth 2.0 + JWT |
| **API Docs** | Swagger/OpenAPI |
| **Payments** | Razorpay |
| **CDN/DNS** | Cloudflare |
| **Containerization** | Docker |
| **CI/CD** | GitHub Actions |
| **Hosting** | Self-hosted Linux Server |

## 🌐 Domains

| Domain | Purpose |
|--------|---------|
| `naploo.com` | Customer website |
| `partner.naploo.com` | Hotel owner portal |
| `investor.naploo.com` | Investor pool dashboard |
| `associate.naploo.com` | Referral/Associate portal |
| `rental.naploo.com` | Rental management |
| `admin.naploo.com` | Admin panel |
| `api.naploo.com` | API Gateway |

## 📦 Quick Start

### Prerequisites

- Bun 1.0+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- Kafka

### Installation

```bash
# Clone repository
git clone https://github.com/bidua-industries/naploo-ecosystem.git
cd naploo-ecosystem

# Install dependencies
bun install

# Start infrastructure with Docker
docker-compose up -d postgres redis kafka

# Setup environment
cp .env.example .env

# Setup database
bun run db:push
bun run db:seed

# Start all services
bun run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://naploo:password@localhost:5432/naploo

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key
JWT_ISSUER=naploo.com

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# Cloudflare
CLOUDFLARE_API_TOKEN=xxx
```

## 📱 Applications

### Customer Website

```bash
cd apps/web
bun dev
# Open http://localhost:3000
```

Features:
- **Unified Search** - Find hotels with pods AND rooms
- Location search with maps
- **Pod Booking** - Hourly rates (₹150/hr single, ₹200/hr double)
- **Room Booking** - Nightly rates (like OYO/Goibibo)
- **Home Pod Rental** - Browse & request pods for home use
- Multiple payment options
- QR code check-in for pods

### Mobile App

```bash
cd apps/mobile
bun start
# Scan QR with Expo Go
```

Features:
- Native iOS & Android experience
- Search pods and rooms
- Push notifications
- Biometric authentication
- Offline booking passes

### Partner Portal (Hotel Owners)

```bash
cd apps/partner
bun dev
# Open http://localhost:3002
```

Features:
- Property listing management
- Room inventory & pricing
- Pod management (if installed)
- Booking management
- Earnings & payouts dashboard
- Guest reviews

### Investor Pool Portal

```bash
cd apps/investor
bun dev
# Open http://localhost:3001
```

Features:
- **Pool enrollment** with KYC verification
- **New hotel announcements** - claim pod sets
- Pod set purchase (₹5 Lac/set + GST)
- Choose: Doorstep delivery OR Leaseback
- Real-time earnings dashboard (60% share)
- **3x return guarantee tracker**
- Withdrawal management
- Booking alerts

### Associate Portal (Referrals)

```bash
cd apps/associate
bun dev
# Open http://localhost:3004
```

Features:
- **5-Level referral tracking**
- Refer: Hotels, Investors, Customers, Space providers
- Commission earnings at each level
- Payout management
- Marketing materials

### Rental Portal (Home & Office)

```bash
cd apps/rental
bun dev
# Open http://localhost:3005
```

Features:
- Browse pods for home rental
- Corporate nap room packages
- 12-month contract management
- Installation scheduling
- Maintenance requests

### Admin Dashboard

```bash
cd apps/admin
bun dev
# Open http://localhost:3003
```

Features:
- **Investor pool management** - Approve/Reject enrollments
- **Hotel announcements** - Create new investment opportunities
- Location management
- Booking operations
- Referral system configuration
- Reports & analytics

### Backend Services (Microservices)

```bash
# Start all services
docker-compose up

# Or individual services
cd services/api-gateway
bun dev
```

**Swagger API Docs:** http://localhost:4000/swagger

## 📖 Documentation

- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) - Complete project blueprint
- [API Reference](./docs/API_REFERENCE.md) - API endpoints documentation
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions

## 🧪 Testing

```bash
# Run all tests
bun test

# Run specific app tests
bun test --filter=web

# E2E tests
bun test:e2e

# Coverage
bun test:coverage
```

## 🚢 Deployment

The platform is deployed on a self-hosted Linux server with Docker.

```bash
# Build all services
bun run build

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy individual services
bun run deploy
```

### Mobile (EAS)

```bash
# Build iOS
cd apps/mobile
eas build --platform ios

# Build Android
eas build --platform android
```

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                      # Customer website
│   ├── mobile/                   # React Native app
│   ├── partner/                  # Hotel owner portal
│   ├── investor/                 # Investor pool portal
│   ├── associate/                # Referral portal
│   ├── rental/                   # Rental management
│   └── admin/                    # Admin dashboard
│
├── packages/
│   ├── ui/                       # Shared UI library
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Shared utilities
│   └── api-client/               # API client SDK
│
├── services/                     # Microservices (Bun + Elysia)
│   ├── api-gateway/              # API Gateway + Routing
│   │   └── src/
│   │       ├── routes/           # Route definitions
│   │       ├── middleware/       # Auth, Rate limiting
│   │       └── swagger/          # OpenAPI docs
│   ├── auth-service/             # OAuth + JWT
│   ├── booking-service/          # Booking logic
│   ├── payment-service/          # Razorpay integration
│   ├── investor-service/         # Pool management
│   ├── referral-service/         # 5-level MLM
│   ├── rental-service/           # Home/Office rentals
│   ├── notification-service/     # Push, Email, SMS
│   └── analytics-service/        # Reports
│
├── docker/                       # Docker configurations
├── docs/                         # Documentation
└── turbo.json                    # Turborepo config
```

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start all apps in development |
| `bun build` | Build all apps |
| `bun test` | Run tests |
| `bun lint` | Lint all code |
| `bun format` | Format code |
| `bun db:push` | Push schema to database |
| `bun db:seed` | Seed database |
| `bun db:studio` | Open Drizzle Studio |
| `docker-compose up` | Start all services |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Proprietary - © 2026 BIDUA Industries Pvt Ltd. All rights reserved.

## 📞 Contact

- **Website:** [bidua.in](https://bidua.in)
- **Email:** biduaindustries@gmail.com

---

Built with ❤️ by BIDUA Industries Pvt Ltd
