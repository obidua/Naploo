# Naploo Platform - Deployment & Operations Guide

> **Last Updated:** June 7, 2026  
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
│   └── mobile/                 # ✅ Expo customer app wired to live API + APK published
├── services/
│   ├── api-gateway/            # ✅ API Gateway (Elysia/Bun) - LIVE
│   ├── auth-service/           # ✅ Auth Service (Elysia/Bun) - LIVE (real DB, JWT, OTP)
│   ├── booking-service/        # ✅ Live (quote/create/list/get/cancel bookings)
│   ├── hotel-service/          # ✅ Live (search/detail/rooms/pod sets)
│   ├── payment-service/        # ✅ Live (Cashfree hosted checkout)
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
| Auth Service | https://api.naploo.com/api/v1/auth/* | 3001 | ✅ Live |
| Booking Service | https://api.naploo.com/api/v1/bookings/* | 3002 | ✅ Live |
| Hotel Service | https://api.naploo.com/api/v1/hotels/* | 3007 | ✅ Live |
| Payment Service | https://api.naploo.com/api/v1/payments/* | 3003 | ✅ Live |
| Swagger Docs | https://api.naploo.com/swagger | 3000 | ✅ Available |

---

## 🔧 Technology Stack (Actual)

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Bun | 1.3.6 |
| Frontend | Next.js + React 18.3.1 + Tailwind CSS | Next 14.2.35 |
| Backend | Elysia (Bun Framework) | ^1.2.0 |
| Database | PostgreSQL | 14.20 |
| ORM | Drizzle ORM | Latest |
| Cache | Redis | 6.0.16 |
| Message Queue | RabbitMQ (installed, not yet used) | — |
| Web Server | Nginx | 1.18.0 |
| SSL | Let's Encrypt (Certbot) | — |
| CDN/DNS | Cloudflare | — |
| Process Manager | PM2 for current microservices; systemd for older web/auth units | — |

> **Note:** Docker, Kafka, and Elasticsearch are NOT installed. The current deployment runs directly on the host. Current microservices are PM2-managed; older web/auth units may still be systemd-managed depending on rollout stage.
>
> **React 18.3.1 in `apps/web`:** Pinned via root `package.json` `overrides`/`resolutions` because Next.js 14 requires `react@^18.2.0` as a peer dependency. Mobile (`apps/mobile`) and partner (`apps/partner`) Expo apps continue to use React 19.

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

All three services are managed via **systemd** and will:
- Auto-start on server boot
- Auto-restart within 5 seconds if they crash
- Run as user `awsclint`

### Service Files

| Service | File | Port | Details |
|---------|------|------|--------|
| `naploo-web` | `/etc/systemd/system/naploo-web.service` | 3100 | Next.js frontend |
| `naploo-api` | `/etc/systemd/system/naploo-api.service` | 3000 | Elysia API Gateway |
| `naploo-auth` | `/etc/systemd/system/naploo-auth.service` | 3001 | Auth microservice (NODE_ENV=development) |

### Common Commands

```bash
# Check status of all services
sudo systemctl status naploo-web naploo-api naploo-auth

# Restart all services
sudo systemctl restart naploo-auth naploo-api naploo-web

# Restart a single service
sudo systemctl restart naploo-web
sudo systemctl restart naploo-api
sudo systemctl restart naploo-auth

# Stop a service
sudo systemctl stop naploo-web

# View live logs
sudo journalctl -u naploo-web -f
sudo journalctl -u naploo-api -f
sudo journalctl -u naploo-auth -f

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
sudo systemctl restart naploo-auth naploo-api naploo-web
```

### Step 3: Verify Deployment
```bash
# Check all 3 services
sudo systemctl status naploo-web naploo-api naploo-auth

# Test locally
curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health
curl -s http://localhost:3001/health

# Check nginx
sudo systemctl status nginx

# Check ports
ss -tlnp | grep -E '3100|3000|3001'
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
Host: 127.0.0.1  (use IP, not 'localhost', for TCP/password auth)
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
DATABASE_URL=postgresql://naploo:Naploo@2026Secure@127.0.0.1:5432/naploo_db
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

# Bind-host hardening (added June 2026)
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

> **⚠️ Production TODO:** Change `NODE_ENV` to `production` (note: this will stop returning devOtp in auth responses), use strong random JWT secrets, and set `APP_URL`/`API_URL` to actual domain URLs.

> **Note:** `.env` is symlinked from the project root into service folders (for example `services/payment-service/.env -> /home/awsclint/Naploo/.env`) so all services share the same environment variables.

---

## 💳 Cashfree Payment Mode & Mobile App Testing

The customer APK does **not** hard-code Cashfree sandbox or production mode. The app only opens the hosted checkout URL returned by the backend:

```text
https://api.naploo.com/api/v1/payments/checkout/:bookingId
```

Switching between Cashfree sandbox and production is therefore **server-side only**. A new APK install is not required when changing payment mode.

### Mode switch commands

Run from the repo root:

```bash
cd /home/awsclint/Naploo

# Paste sandbox AppID + Secret Key interactively, hidden input, then switch to sandbox
bash scripts/set-cashfree-mode.sh set-test

# Switch to already-saved sandbox keys
bash scripts/set-cashfree-mode.sh test

# Switch back to production keys
bash scripts/set-cashfree-mode.sh prod
```

The script updates `/home/awsclint/Naploo/.env`, restarts `naploo-payment` with `pm2 restart naploo-payment --update-env`, and prints the latest payment-service logs.

### Verify the active mode

```bash
# What does the env file say?
grep -E '^CASHFREE_(MODE|APP_ID)=' /home/awsclint/Naploo/.env

# What mode did the running payment-service boot in?
pm2 logs naploo-payment --lines 30 --nostream | grep -E 'MOCK|SANDBOX|PRODUCTION' | tail -3
```

Expected banner examples:

```text
💳 Naploo Payment Service running at http://localhost:3003 (CASHFREE SANDBOX mode)
💳 Naploo Payment Service running at http://localhost:3003 (CASHFREE PRODUCTION mode)
```

If `.env` says `sandbox` but the PM2 log still says `PRODUCTION`, restart explicitly:

```bash
pm2 restart naploo-payment --update-env
```

### Test from the installed Android app

No APK rebuild or reinstall is needed after server mode changes.

1. Confirm PM2 shows `CASHFREE SANDBOX mode`.
2. Open the existing installed Naploo customer app.
3. Book **Naploo Demo Pod (₹10 Test)**.
4. Tap **Pay Now**.
5. On the Cashfree screen, use one of these sandbox instruments:

| Channel | Success test value | Failure test value |
|---|---|---|
| UPI | `success@upi` | `failure@upi` |
| Card | `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1221` | Cashfree failure card from dashboard |

Expected behaviour:

| Test | Expected app behaviour |
|---|---|
| `success@upi` | Redirects to Naploo booking success screen and booking is confirmed. |
| `failure@upi` | Cashfree shows payment failed; user can retry or press **Cancel Payment**. |
| **Cancel Payment** button / header X / Android back | App calls `POST /api/v1/bookings/:id/cancel`; booking becomes `cancelled` and pod inventory is released. |

### Why a real ₹11 production payment can fail

Fresh Cashfree production merchants often reject very low-value transactions (such as ₹10/₹11) via Cashfree or bank risk rules. This is not an APK issue, and Play Store distribution does not change it because the same backend endpoint and Cashfree merchant are used.

For production validation:

1. Use sandbox first to prove app + backend flow.
2. Switch to production with `bash scripts/set-cashfree-mode.sh prod`.
3. Try a real amount such as ₹100+ from a normal UPI app.
4. If still rejected, contact Cashfree support to whitelist or activate the merchant and test phone/account.

---

## 🔒 Port Binding & Network Hardening

**All Naploo app/service ports bind to loopback only (`127.0.0.1`).** Public traffic enters exclusively through Nginx on 80/443 (which Cloudflare fronts). Direct connections to the application ports from outside the host are not possible.

### Verify

```bash
ss -tlnp 2>/dev/null | grep -E ':(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|3100|3101|3102|3103|3104|3105|4983)\b'
```

Every listed socket should show a local address of `127.0.0.1:<port>` (never `0.0.0.0:<port>` or `[::]:<port>`).

### How services bind to loopback

| Service | Binding mechanism |
|---------|-------------------|
| `naploo-web` (Next.js) | systemd unit runs `next start -H 127.0.0.1 -p 3100` (also `HOSTNAME=127.0.0.1` env) |
| `naploo-api` (Elysia) | reads `API_GATEWAY_HOST` / `BIND_HOST=127.0.0.1` from `.env` |
| `naploo-auth` (Elysia) | reads `AUTH_SERVICE_HOST` / `BIND_HOST=127.0.0.1` from `.env` |
| Drizzle Studio | `drizzle-kit studio --host 127.0.0.1 --port 4983` (set in `packages/db/package.json`) |
| PostgreSQL / Redis | local-only by default in `/etc/postgresql/**/postgresql.conf` and `/etc/redis/redis.conf` |

### If you ever need to expose a service externally

Add an Nginx `server { ... proxy_pass http://127.0.0.1:<port>; }` block instead of changing the bind address. This keeps Cloudflare WAF, SSL, and rate limiting in front of every public surface.

---

## 🔍 Troubleshooting

### Website Not Loading (502 Bad Gateway)
```bash
# Check if all services are running
sudo systemctl status naploo-web naploo-api naploo-auth

# If stopped, restart them
sudo systemctl restart naploo-auth naploo-api naploo-web

# Check if ports are listening
ss -tlnp | grep -E '3100|3000|3001'

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
curl -s http://localhost:3001/health | head -1

# System resources
free -h
df -h
top -bn1 | head -5

# Process memory
sudo systemctl status naploo-web | grep Memory
sudo systemctl status naploo-api | grep Memory
sudo systemctl status naploo-auth | grep Memory
```

### View Logs
```bash
# App logs (systemd journal)
sudo journalctl -u naploo-web -f
sudo journalctl -u naploo-api -f
sudo journalctl -u naploo-auth -f

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
sudo systemctl restart naploo-auth naploo-api naploo-web

sleep 5

echo "Verifying..."
curl -s -o /dev/null -w "Web: %{http_code}\n" http://localhost:3100/
curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost:3000/health
curl -s -o /dev/null -w "Auth: %{http_code}\n" http://localhost:3001/health

echo "=== Done ==="
```

---

## 🔒 Security Notes

1. **⚠️ NODE_ENV** is still set to `development` for auth-service — OTP is returned in API response for testing. Change to `production` and integrate MSG91/Twilio before going live.
2. **⚠️ JWT secrets** are placeholder values — use strong random strings
3. **⚠️ DATABASE_URL** uses `127.0.0.1` (not `localhost`) to ensure TCP connection with password auth
3. SSL certificates auto-renew via certbot timer
4. Cloudflare provides WAF + DDoS protection
5. Keep Bun and dependencies regularly updated
6. Set up automated database backups

---

## 📞 Project Info

- **Project:** Naploo by BIDUA Industries
- **Domain:** naploo.com
- **Server:** AWS EC2 (ip-172-31-14-247)
- **Documentation Updated:** June 6, 2026

---

*This document is for internal use only. Keep credentials secure.*
