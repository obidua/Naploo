# Naploo Platform - Deployment & Operations Guide

> **Last Updated:** February 2026  
> **Server:** AWS EC2 (ip-172-31-14-247)  
> **User:** awsclint

---

## 📁 Project Structure

```
/home/awsclint/Naploo/
├── apps/
│   ├── web/                    # ✅ Customer Website (Next.js 14) - LIVE
│   ├── admin/                  # ❌ Not Started
│   ├── partner/                # ❌ Not Started
│   ├── investor/               # ❌ Not Started
│   ├── associate/              # ❌ Not Started
│   ├── rental/                 # ❌ Not Started
│   └── mobile/                 # ❌ Not Started
├── services/
│   ├── api-gateway/            # ✅ API Gateway (Elysia/Bun) - LIVE
│   ├── auth-service/           # ⚠️  Stub Only (endpoints exist, no DB integration)
│   ├── booking-service/        # ❌ Empty directory
│   ├── hotel-service/          # ❌ Empty directory
│   ├── payment-service/        # ❌ Empty directory
│   ├── investor-service/       # ❌ Empty directory
│   ├── referral-service/       # ❌ Empty directory
│   ├── notification-service/   # ❌ Empty directory
│   ├── rental-service/         # ❌ Empty directory
│   ├── search-service/         # ❌ Empty directory
│   └── analytics-service/      # ❌ Empty directory
├── packages/
│   ├── db/                     # ✅ Database Schemas (Drizzle ORM) - 19 tables
│   ├── ui/                     # ❌ Empty directory
│   ├── types/                  # ❌ Empty directory
│   └── config/                 # ❌ Empty directory
└── docs/                       # Documentation
```

---

## 🌐 Live URLs & Domains

| Service | URL | Port | Status |
|---------|-----|------|--------|
| Customer Website | https://naploo.com | 3100 | ✅ Live |
| API Gateway | https://api.naploo.com | 3000 | ✅ Live |
| Swagger Docs | https://api.naploo.com/swagger | 3000 | ✅ Available |

---

## 🔧 Technology Stack (Actual)

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Bun | 1.3.6 |
| Frontend | Next.js + React 19 + Tailwind CSS | 14.2.35 |
| Backend | Elysia (Bun Framework) | ^1.2.0 |
| Database | PostgreSQL | 14.20 |
| ORM | Drizzle ORM | Latest |
| Cache | Redis | 6.0.16 |
| Message Queue | RabbitMQ (installed, not yet used) | — |
| Web Server | Nginx | 1.18.0 |
| SSL | Let's Encrypt (Certbot) | — |
| CDN/DNS | Cloudflare | — |
| Process Manager | systemd | — |

> **Note:** Docker, Kafka, and Elasticsearch are NOT installed. The current deployment runs directly on the host using systemd services.

---

## 📦 Installation & Setup

### 1. Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 2. Navigate to Project
```bash
cd /home/awsclint/Naploo
```

### 3. Install Dependencies
```bash
# Install all workspace dependencies
bun install
```

---

## 🚀 Production Services (systemd)

Both services are managed via **systemd** and will:
- Auto-start on server boot
- Auto-restart within 5 seconds if they crash
- Run as user `awsclint`

### Service Files

| Service | File | Port |
|---------|------|------|
| `naploo-web` | `/etc/systemd/system/naploo-web.service` | 3100 |
| `naploo-api` | `/etc/systemd/system/naploo-api.service` | 3000 |

### Common Commands

```bash
# Check status
sudo systemctl status naploo-web naploo-api

# Restart a service
sudo systemctl restart naploo-web
sudo systemctl restart naploo-api

# Stop a service
sudo systemctl stop naploo-web

# View live logs
sudo journalctl -u naploo-web -f
sudo journalctl -u naploo-api -f

# View last 50 log lines
sudo journalctl -u naploo-web -n 50 --no-pager

# Reload after editing service files
sudo systemctl daemon-reload
```

---

## 🏭 Deployment Steps

### Step 1: Build the Web App
```bash
cd /home/awsclint/Naploo/apps/web
bun run build
```

### Step 2: Restart Services
```bash
sudo systemctl restart naploo-web naploo-api
```

### Step 3: Verify Deployment
```bash
# Check services
sudo systemctl status naploo-web naploo-api

# Test locally
curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health

# Check nginx
sudo systemctl status nginx

# Check ports
ss -tlnp | grep -E '3100|3000'
```

---

## ⚙️ Nginx Configuration

### Config File
```
/etc/nginx/sites-enabled/naploo
```

### Current Configuration

| Domain | Backend | SSL |
|--------|---------|-----|
| naploo.com / www.naploo.com | http://127.0.0.1:3100 | Let's Encrypt |
| api.naploo.com | http://127.0.0.1:3000 | Let's Encrypt |

Features: HTTP→HTTPS redirect, HTTP/2, WebSocket support, 100M upload limit, 60s read timeout.

### Commands
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# View config
cat /etc/nginx/sites-enabled/naploo
```

---

## 🗄️ Database

### PostgreSQL Connection
```
Host: localhost
Port: 5432
Database: naploo_db
User: naploo
Password: Naploo@2026Secure
```

### Database Commands
```bash
# Connect to PostgreSQL
psql -U naploo -d naploo_db

# Run Drizzle commands
cd /home/awsclint/Naploo/packages/db
bun run push      # Push schema to database
bun run generate   # Generate migrations
bun run migrate    # Run migrations
bun run studio     # Open Drizzle Studio GUI
```

### Schema Overview (19 Tables)
- **users** - User accounts with roles, KYC, bank details
- **otps** - OTP verification codes
- **refresh_tokens** - JWT refresh tokens
- **partners** - Hotel/homestay business profiles
- **pod_sets** - Pod set units (2 pods per set)
- **pods** - Individual pod capsules with amenities
- **rooms** - Hotel rooms
- **bookings** - Pod & room bookings
- **investors** - Investor profiles
- **investments** - Pod set purchases with 3x tracking
- **investment_earnings** - Per-booking investor earnings
- **payments** - Razorpay payment records
- **payouts** - Investor/partner/associate payouts
- **wallets** - User wallet balances
- **wallet_transactions** - Wallet credit/debit history
- **associates** - 5-level referral associates
- **referrals** - Referral records
- **referral_earnings** - Commission earnings per level
- **commission_config** - Configurable commission rates

---

## 📝 Environment Variables

### Main .env file: `/home/awsclint/Naploo/.env`

```env
NODE_ENV=development          # ⚠️ Should be changed to "production"
APP_URL=http://localhost:3100
API_URL=http://localhost:3000
DATABASE_URL=postgresql://naploo:Naploo@2026Secure@localhost:5432/naploo_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=naploo-jwt-secret-key-change-in-production-2026
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=naploo-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Service Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
BOOKING_SERVICE_PORT=3002
PAYMENT_SERVICE_PORT=3003
INVESTOR_SERVICE_PORT=3004
REFERRAL_SERVICE_PORT=3005
RENTAL_SERVICE_PORT=3006
HOTEL_SERVICE_PORT=3007
NOTIFICATION_SERVICE_PORT=3008
ANALYTICS_SERVICE_PORT=3009
SEARCH_SERVICE_PORT=3010

# Frontend Ports
WEB_PORT=3100
INVESTOR_PORT=3101
PARTNER_PORT=3102
ADMIN_PORT=3103
ASSOCIATE_PORT=3104
RENTAL_PORT=3105
```

> **⚠️ Production TODO:** Change `NODE_ENV` to `production`, use strong random JWT secrets, and set `APP_URL`/`API_URL` to actual domain URLs.

---

## 🔍 Troubleshooting

### Website Not Loading (502 Bad Gateway)
```bash
# Check if services are running
sudo systemctl status naploo-web naploo-api

# If stopped, restart them
sudo systemctl restart naploo-web naploo-api

# Check if ports are listening
ss -tlnp | grep -E '3100|3000'

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

### Service Keeps Crashing
```bash
# View recent logs
sudo journalctl -u naploo-web -n 100 --no-pager

# Check for port conflicts
sudo lsof -i :3100
sudo lsof -i :3000
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

### Build Failures
```bash
# Clear cache and rebuild
cd /home/awsclint/Naploo/apps/web
rm -rf .next node_modules/.cache
bun run build
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql@14-main

# Check Redis status
sudo systemctl status redis-server

# Test database connection
psql -U naploo -d naploo_db -c "SELECT 1;"
```

---

## 📊 Monitoring

### Check All Services
```bash
# Quick health check
curl -s http://localhost:3100/ -o /dev/null -w "Web: %{http_code}\n"
curl -s http://localhost:3000/health | head -1

# System resources
free -h
df -h
top -bn1 | head -5

# Process memory
sudo systemctl status naploo-web | grep Memory
sudo systemctl status naploo-api | grep Memory
```

### View Logs
```bash
# App logs (systemd journal)
sudo journalctl -u naploo-web -f
sudo journalctl -u naploo-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Quick Deploy Script

```bash
#!/bin/bash
set -e

echo "=== Naploo Deployment ==="

cd /home/awsclint/Naploo/apps/web
echo "Building web app..."
bun run build

echo "Restarting services..."
sudo systemctl restart naploo-web naploo-api

sleep 5

echo "Verifying..."
curl -s -o /dev/null -w "Web: %{http_code}\n" http://localhost:3100/
curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost:3000/health

echo "=== Done ==="
```

---

## 🔒 Security Notes

1. **⚠️ NODE_ENV** is still set to `development` — change to `production`
2. **⚠️ JWT secrets** are placeholder values — use strong random strings
3. SSL certificates auto-renew via certbot timer
4. Cloudflare provides WAF + DDoS protection
5. Keep Bun and dependencies regularly updated
6. Set up automated database backups

---

## 📞 Project Info

- **Project:** Naploo by BIDUA Industries
- **Domain:** naploo.com
- **Server:** AWS EC2 (ip-172-31-14-247)
- **Documentation Updated:** February 22, 2026

---

*This document is for internal use only. Keep credentials secure.*
