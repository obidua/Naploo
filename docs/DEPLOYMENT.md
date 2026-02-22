# Naploo(TM) Self-Hosted Deployment Guide

> Complete deployment instructions for self-hosted Linux server at naploo.com  
> **Version 3.1.0** - Microservices Architecture  
> **Last Updated:** February 23, 2026

---

## ⚠️ Current Deployment Status

> **NOTE:** The current production deployment does **NOT** use Docker, Kafka, Elasticsearch, or container orchestration. Services run directly on the host via systemd. The architecture described below is the **planned target state**.

### What's Actually Running (February 2026)

| Component | Status | Details |
|-----------|--------|---------|
| **naploo.com** (Customer Website) | ✅ Live | Next.js 14 on port 3100, managed by systemd |
| **api.naploo.com** (API Gateway) | ✅ Live | Elysia/Bun on port 3000, managed by systemd |
| **Auth Service** | ✅ Live | Full auth with PostgreSQL, Drizzle ORM, dual JWT (access 15min + refresh 7d), OTP stored in DB |
| **PostgreSQL 14** | ✅ Running | Database with 19 tables via Drizzle ORM |
| **Redis 6** | ✅ Running | Installed, not yet actively used by app |
| **RabbitMQ** | ✅ Installed | Not yet used by any service |
| **Nginx** | ✅ Running | Reverse proxy with Let's Encrypt SSL |
| **Cloudflare** | ✅ Active | DNS + CDN + WAF |
| **Docker** | ❌ Not installed | |
| **Kafka** | ❌ Not installed | |
| **Elasticsearch** | ❌ Not installed | |
| **9 backend services** | ❌ Empty dirs | booking, payment, investor, referral, rental, hotel, notification, analytics, search |
| **6 frontend apps** | ❌ Empty dirs | admin, partner, investor, associate, rental, mobile |

### Process Management

Services are managed via **systemd** (not PM2 or Docker):
```bash
sudo systemctl status naploo-web naploo-api naploo-auth   # Check all 3 services
sudo systemctl restart naploo-auth naploo-api naploo-web   # Restart all
sudo journalctl -u naploo-auth -f                          # View auth logs
```

For detailed current operations, see **DEPLOYMENT_GUIDE.md**.

---

> **The sections below describe the planned full-scale deployment architecture with Docker and microservices. These should be implemented as the services are built.**

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Server Requirements](#2-server-requirements)
3. [Initial Server Setup](#3-initial-server-setup)
4. [Install Dependencies](#4-install-dependencies)
5. [Docker Setup](#5-docker-setup)
6. [Database Setup](#6-database-setup)
7. [Apache Kafka Setup](#7-apache-kafka-setup)
8. [Application Deployment](#8-application-deployment)
9. [Nginx Configuration](#9-nginx-configuration)
10. [Cloudflare Configuration](#10-cloudflare-configuration)
11. [SSL Certificates](#11-ssl-certificates)
12. [Process Management](#12-process-management)
13. [Mobile App Deployment](#13-mobile-app-deployment)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Monitoring & Logging](#15-monitoring--logging)
16. [Backup Strategy](#16-backup-strategy)
17. [Security Hardening](#17-security-hardening)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Infrastructure Overview

### Microservices Production Architecture

```
                                   +------------------+
                                   |   Cloudflare     |
                                   |   DNS + CDN      |
                                   |   WAF + DDoS     |
                                   +--------+---------+
                                            |
                                            v
+-----------------------------------------------------------------------------+
|                        LINUX SERVER (naploo.com)                             |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  |                         NGINX (Reverse Proxy)                          |  |
|  |                    SSL Termination + Load Balancing                    |  |
|  +-----------------------------------------------------------------------+  |
|                                     |                                        |
|         +---------------------------+---------------------------+           |
|         |                           |                           |           |
|         v                           v                           v           |
|  +-------------+            +-------------+            +-------------+      |
|  |  Next.js    |            |  Next.js    |            |  Next.js    |      |
|  | naploo.com  |            | partner.    |            | admin.      |      |
|  | (Customer)  |            | naploo.com  |            | naploo.com  |      |
|  |  Port 3100  |            |  Port 3102  |            |  Port 3103  |      |
|  +-------------+            +-------------+            +-------------+      |
|         |                           |                           |           |
|         v                           v                           v           |
|  +-------------+            +-------------+            +-------------+      |
|  |  Next.js    |            |  Next.js    |            |  Next.js    |      |
|  | investor.   |            | associate.  |            | rental.     |      |
|  | naploo.com  |            | naploo.com  |            | naploo.com  |      |
|  |  Port 3101  |            |  Port 3104  |            |  Port 3105  |      |
|  +-------------+            +-------------+            +-------------+      |
|                                     |                                        |
|  +-----------------------------------------------------------------------+  |
|  |                    API GATEWAY (Elysia + Bun)                          |  |
|  |                         Port 3000                                       |  |
|  +-----------------------------------------------------------------------+  |
|                                     |                                        |
|         +----------+----------+----------+----------+----------+           |
|         |          |          |          |          |          |           |
|         v          v          v          v          v          v           |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+     |
|  |   Auth    | | Booking   | | Payment   | | Investor  | | Referral  |     |
|  |  Service  | | Service   | | Service   | | Service   | | Service   |     |
|  |  :3001    | |  :3002    | |  :3003    | |  :3004    | |  :3005    |     |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+     |
|         |          |          |          |          |          |           |
|         v          v          v          v          v          v           |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+     |
|  |  Rental   | |  Hotel    | | Notific.  | | Analytics | | Search    |     |
|  |  Service  | | Service   | | Service   | | Service   | | Service   |     |
|  |  :3006    | |  :3007    | |  :3008    | |  :3009    | |  :3010    |     |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+     |
|                                     |                                        |
|  +-----------------------------------------------------------------------+  |
|  |                         MESSAGE BROKER                                  |  |
|  |  +---------------+  +---------------+  +---------------+               |  |
|  |  | Apache Kafka  |  |   Zookeeper   |  |    Redis      |               |  |
|  |  |    :9092      |  |    :2181      |  |    :6379      |               |  |
|  |  +---------------+  +---------------+  +---------------+               |  |
|  +-----------------------------------------------------------------------+  |
|                                     |                                        |
|                             +---------------+                                |
|                             |  PostgreSQL   |                                |
|                             |   Database    |                                |
|                             |    :5432      |                                |
|                             +---------------+                                |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  |                    DOCKER + DOCKER COMPOSE                             |  |
|  |              Containerized Microservices Orchestration                  |  |
|  +-----------------------------------------------------------------------+  |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### Domain Structure

| Domain | Service | Port | Purpose |
|--------|---------|------|---------|
| `naploo.com` | Next.js | 3100 | Customer website |
| `partner.naploo.com` | Next.js | 3102 | Hotel Owner portal |
| `investor.naploo.com` | Next.js | 3101 | Investor Pool portal |
| `admin.naploo.com` | Next.js | 3103 | Admin dashboard |
| `associate.naploo.com` | Next.js | 3104 | Associate/Referral portal |
| `rental.naploo.com` | Next.js | 3105 | Home/Office rental portal |
| `api.naploo.com` | API Gateway | 3000 | Backend API Gateway |

### Microservices Architecture

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| api-gateway | 3000 | Elysia + Bun | Request routing, auth validation |
| auth-service | 3001 | Elysia + Bun | Authentication, OAuth, JWT |
| booking-service | 3002 | Elysia + Bun | Pod/room bookings |
| payment-service | 3003 | Elysia + Bun | Razorpay integration |
| investor-service | 3004 | Elysia + Bun | Investor pool, 3x tracking |
| referral-service | 3005 | Elysia + Bun | 5-level referral system |
| rental-service | 3006 | Elysia + Bun | Home/office rentals |
| hotel-service | 3007 | Elysia + Bun | Hotel/space management |
| notification-service | 3008 | Elysia + Bun | SMS, email, push |
| analytics-service | 3009 | Elysia + Bun | Reports, dashboards |
| search-service | 3010 | Elysia + Bun | Elasticsearch integration |

---

## 2. Server Requirements

### Minimum Specifications (Microservices)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 8 vCPU | 16 vCPU |
| **RAM** | 16 GB | 32 GB |
| **Storage** | 200 GB SSD | 500 GB NVMe SSD |
| **Bandwidth** | 2 TB/month | Unlimited |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Required Software

- **Runtime**: Bun 1.1+
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Broker**: Apache Kafka 3.7+
- **Container**: Docker 24+ & Docker Compose 2.20+
- **Web Server**: Nginx 1.24+
- **SSL**: Certbot (Let's Encrypt)
- **Firewall**: UFW
- **CDN/DNS**: Cloudflare

---

## 3. Initial Server Setup

### 3.1 Update System

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common
```

### 3.2 Create Application User

```bash
# Create naploo user
sudo adduser naploo --disabled-password --gecos ""

# Add to sudo group (optional, for maintenance)
sudo usermod -aG sudo naploo

# Create application directory
sudo mkdir -p /var/www/naploo
sudo chown naploo:naploo /var/www/naploo
```

### 3.3 Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 4. Install Dependencies

### 4.1 Install Bun Runtime

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Reload shell
source ~/.bashrc

# Verify installation
bun --version  # Should show v1.1.x or higher

# Install global packages
bun install -g pm2
```

### 4.2 Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker naploo

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### 4.3 Install PostgreSQL 16

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### 4.4 Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 512mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

### 4.5 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
nginx -v
```

---

## 5. Docker Setup

### 5.1 Docker Compose Configuration

Create `/var/www/naploo/docker-compose.yml`:

```yaml
version: '3.9'

services:
  # ===========================================
  # MESSAGE BROKER - KAFKA
  # ===========================================
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: naploo-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log
    networks:
      - naploo-network
    restart: unless-stopped

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: naploo-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    volumes:
      - kafka-data:/var/lib/kafka/data
    networks:
      - naploo-network
    restart: unless-stopped

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: naploo-kafka-ui
    depends_on:
      - kafka
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: naploo
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    networks:
      - naploo-network
    restart: unless-stopped

  # ===========================================
  # API GATEWAY
  # ===========================================
  api-gateway:
    build:
      context: ./services/api-gateway
      dockerfile: Dockerfile
    container_name: naploo-api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - KAFKA_BROKERS=kafka:29092
      - REDIS_URL=redis://redis:6379
      - AUTH_SERVICE_URL=http://auth-service:3001
      - BOOKING_SERVICE_URL=http://booking-service:3002
      - PAYMENT_SERVICE_URL=http://payment-service:3003
      - INVESTOR_SERVICE_URL=http://investor-service:3004
      - REFERRAL_SERVICE_URL=http://referral-service:3005
      - RENTAL_SERVICE_URL=http://rental-service:3006
      - HOTEL_SERVICE_URL=http://hotel-service:3007
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  # ===========================================
  # MICROSERVICES
  # ===========================================
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: naploo-auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=15m
      - REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  booking-service:
    build:
      context: ./services/booking-service
      dockerfile: Dockerfile
    container_name: naploo-booking-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  payment-service:
    build:
      context: ./services/payment-service
      dockerfile: Dockerfile
    container_name: naploo-payment-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - PORT=3003
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  investor-service:
    build:
      context: ./services/investor-service
      dockerfile: Dockerfile
    container_name: naploo-investor-service
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=production
      - PORT=3004
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  referral-service:
    build:
      context: ./services/referral-service
      dockerfile: Dockerfile
    container_name: naploo-referral-service
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
      - PORT=3005
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  rental-service:
    build:
      context: ./services/rental-service
      dockerfile: Dockerfile
    container_name: naploo-rental-service
    ports:
      - "3006:3006"
    environment:
      - NODE_ENV=production
      - PORT=3006
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  hotel-service:
    build:
      context: ./services/hotel-service
      dockerfile: Dockerfile
    container_name: naploo-hotel-service
    ports:
      - "3007:3007"
    environment:
      - NODE_ENV=production
      - PORT=3007
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  notification-service:
    build:
      context: ./services/notification-service
      dockerfile: Dockerfile
    container_name: naploo-notification-service
    ports:
      - "3008:3008"
    environment:
      - NODE_ENV=production
      - PORT=3008
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
      - MSG91_AUTH_KEY=${MSG91_AUTH_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  analytics-service:
    build:
      context: ./services/analytics-service
      dockerfile: Dockerfile
    container_name: naploo-analytics-service
    ports:
      - "3009:3009"
    environment:
      - NODE_ENV=production
      - PORT=3009
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  search-service:
    build:
      context: ./services/search-service
      dockerfile: Dockerfile
    container_name: naploo-search-service
    ports:
      - "3010:3010"
    environment:
      - NODE_ENV=production
      - PORT=3010
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:29092
    depends_on:
      - kafka
      - redis
    networks:
      - naploo-network
    restart: unless-stopped

  # ===========================================
  # INFRASTRUCTURE
  # ===========================================
  redis:
    image: redis:7-alpine
    container_name: naploo-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    networks:
      - naploo-network
    restart: unless-stopped

networks:
  naploo-network:
    driver: bridge

volumes:
  zookeeper-data:
  zookeeper-logs:
  kafka-data:
  redis-data:
```

### 5.2 Microservice Dockerfile Template

Create `services/api-gateway/Dockerfile`:

```dockerfile
FROM oven/bun:1.1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

### 5.3 Docker Commands

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f api-gateway

# Stop all services
docker compose down

# Restart a specific service
docker compose restart api-gateway

# Scale a service
docker compose up -d --scale booking-service=3

# View running containers
docker compose ps

# Remove all containers and volumes
docker compose down -v
```
psql --version
```

### 4.3 Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

### 4.4 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
nginx -v
```

### 4.5 Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs

# Verify
pm2 --version
```

---

## 6. Database Setup

### 6.1 Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql shell:
CREATE USER naploo WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE naploo_prod OWNER naploo;
GRANT ALL PRIVILEGES ON DATABASE naploo_prod TO naploo;

# Enable UUID extension
\c naploo_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit
\q
```

### 6.2 Configure PostgreSQL for Remote Access (if needed)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf
# Set: listen_addresses = 'localhost'  (or '*' for remote)

# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Add: local all naploo md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 6.3 Run Drizzle Migrations

```bash
# Navigate to project directory
cd /var/www/naploo

# Run migrations
bun run db:migrate

# Generate types
bun run db:generate

# Seed initial data (if needed)
bun run db:seed
```

### 6.4 Connection String

```bash
# Local connection
DATABASE_URL="postgresql://naploo:your_secure_password_here@localhost:5432/naploo_prod"
```

---

## 7. Apache Kafka Setup

### 7.1 Kafka Topics

Create required Kafka topics:

```bash
# Access Kafka container
docker exec -it naploo-kafka bash

# Create topics
kafka-topics --create --topic bookings --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic payments --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic investor-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic referral-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic rental-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic notifications --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic analytics --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# List topics
kafka-topics --list --bootstrap-server localhost:9092

# Exit container
exit
```

### 7.2 Kafka UI Access

Access Kafka UI at `http://localhost:8080` to monitor:
- Topics and partitions
- Consumer groups
- Messages
- Broker health

---

## 8. Application Deployment

### 8.1 Clone Repository

```bash
# Switch to naploo user
su - naploo

# Navigate to web directory
cd /var/www/naploo

# Clone repository
git clone https://github.com/biduaindustries/naploo-ecosystem.git .

# Or pull latest changes
git pull origin main
```

### 8.2 Environment Configuration

Create `.env` file in the root:

```bash
nano /var/www/naploo/.env
```

```env
# ===============================================================
# APPLICATION
# ===============================================================
NODE_ENV=production
APP_NAME=Naploo
APP_URL=https://naploo.com
API_URL=https://api.naploo.com
PARTNER_URL=https://partner.naploo.com
INVESTOR_URL=https://investor.naploo.com
ADMIN_URL=https://admin.naploo.com
ASSOCIATE_URL=https://associate.naploo.com
RENTAL_URL=https://rental.naploo.com

# ===============================================================
# DATABASE
# ===============================================================
DATABASE_URL="postgresql://naploo:your_password@localhost:5432/naploo_prod"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# ===============================================================
# REDIS
# ===============================================================
REDIS_URL="redis://localhost:6379"

# ===============================================================
# KAFKA
# ===============================================================
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="naploo-producer"
KAFKA_CONSUMER_GROUP="naploo-consumers"

# ===============================================================
# AUTHENTICATION
# ===============================================================
JWT_SECRET=your-256-bit-secret-key-here-make-it-long-and-random
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-256-bit-secret-for-refresh-tokens
REFRESH_TOKEN_EXPIRES_IN=7d

# ═══════════════════════════════════════════════════════════════
# RAZORPAY (Payments)
# ═══════════════════════════════════════════════════════════════
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here

# ═══════════════════════════════════════════════════════════════
# MSG91 (SMS/OTP)
# ═══════════════════════════════════════════════════════════════
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=NAPLOO
MSG91_TEMPLATE_ID=your_template_id

# ═══════════════════════════════════════════════════════════════
# EMAIL (Resend/SMTP)
# ═══════════════════════════════════════════════════════════════
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Naploo <noreply@naploo.com>
EMAIL_REPLY_TO=support@naploo.com

# ═══════════════════════════════════════════════════════════════
# FILE STORAGE (Local or S3)
# ═══════════════════════════════════════════════════════════════
UPLOAD_DIR=/var/www/naploo/uploads
# Or use S3:
# AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXXX
# AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# AWS_REGION=ap-south-1
# AWS_S3_BUCKET=naploo-assets

# ═══════════════════════════════════════════════════════════════
# FIREBASE (Push Notifications)
# ═══════════════════════════════════════════════════════════════
FIREBASE_PROJECT_ID=naploo-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@naploo-prod.iam.gserviceaccount.com

# ═══════════════════════════════════════════════════════════════
# MONITORING (Optional)
# ═══════════════════════════════════════════════════════════════
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 6.3 Install Dependencies & Build

```bash
cd /var/www/naploo

# Install all dependencies
pnpm install

# Generate Prisma client
cd backend
pnpm prisma generate

# Run database migrations
pnpm prisma migrate deploy

# Seed database (if needed)
pnpm prisma db seed

# Build all applications
cd ..
pnpm build
```

### 6.4 Create Upload Directory

```bash
# Create uploads directory
sudo mkdir -p /var/www/naploo/uploads
sudo chown -R naploo:naploo /var/www/naploo/uploads
```

---

## 9. Nginx Configuration

### 9.1 Create Nginx Config Files

**Main Customer Website (naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/naploo.com
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name naploo.com www.naploo.com;
    return 301 https://naploo.com$request_uri;
}

# Redirect www to non-www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.naploo.com;
    
    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;
    
    return 301 https://naploo.com$request_uri;
}

# Main site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name naploo.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Cloudflare Real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml;

    # Static files
    location /_next/static {
        alias /var/www/naploo/apps/web/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads {
        alias /var/www/naploo/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

**API Gateway (api.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/api.naploo.com
```

```nginx
server {
    listen 80;
    server_name api.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    # Cloudflare Real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    real_ip_header CF-Connecting-IP;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS Headers (adjust origins as needed)
    add_header Access-Control-Allow-Origin "https://naploo.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://naploo.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
        add_header Access-Control-Max-Age 86400;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=50r/s;
    limit_req zone=api_limit burst=100 nodelay;

    # File upload size
    client_max_body_size 50M;

    # Swagger Documentation
    location /swagger {
        proxy_pass http://127.0.0.1:3000/swagger;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
}
```

**Partner Portal (partner.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/partner.naploo.com
```

```nginx
server {
    listen 80;
    server_name partner.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name partner.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location /_next/static {
        alias /var/www/naploo/apps/partner/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3102;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Investor Pool Portal (investor.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/investor.naploo.com
```

```nginx
server {
    listen 80;
    server_name investor.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name investor.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location /_next/static {
        alias /var/www/naploo/apps/investor/.next/static;
        expires 365d;
    }

    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Admin Dashboard (admin.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/admin.naploo.com
```

```nginx
server {
    listen 80;
    server_name admin.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    # Extra security for admin
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # IP Whitelist (optional - uncomment and add your IPs)
    # allow 203.0.113.0/24;  # Your office IP
    # deny all;

    location /_next/static {
        alias /var/www/naploo/apps/admin/.next/static;
        expires 365d;
    }

    location / {
        proxy_pass http://127.0.0.1:3103;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Associate Portal (associate.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/associate.naploo.com
```

```nginx
server {
    listen 80;
    server_name associate.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name associate.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location /_next/static {
        alias /var/www/naploo/apps/associate/.next/static;
        expires 365d;
    }

    location / {
        proxy_pass http://127.0.0.1:3104;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Rental Portal (rental.naploo.com)**

```bash
sudo nano /etc/nginx/sites-available/rental.naploo.com
```

```nginx
server {
    listen 80;
    server_name rental.naploo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rental.naploo.com;

    ssl_certificate /etc/letsencrypt/live/naploo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naploo.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location /_next/static {
        alias /var/www/naploo/apps/rental/.next/static;
        expires 365d;
    }

    location / {
        proxy_pass http://127.0.0.1:3105;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9.2 Enable Sites

```bash
# Enable all sites
sudo ln -s /etc/nginx/sites-available/naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/partner.naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/investor.naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/associate.naploo.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/rental.naploo.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 10. Cloudflare Configuration

### 10.1 DNS Setup

Configure the following DNS records in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | naploo.com | YOUR_SERVER_IP | Proxied (Orange Cloud) |
| A | www | YOUR_SERVER_IP | Proxied |
| A | api | YOUR_SERVER_IP | Proxied |
| A | partner | YOUR_SERVER_IP | Proxied |
| A | investor | YOUR_SERVER_IP | Proxied |
| A | admin | YOUR_SERVER_IP | Proxied |
| A | associate | YOUR_SERVER_IP | Proxied |
| A | rental | YOUR_SERVER_IP | Proxied |

### 10.2 SSL/TLS Settings

```
SSL/TLS Mode: Full (strict)
Always Use HTTPS: ON
Automatic HTTPS Rewrites: ON
Minimum TLS Version: 1.2
```

### 10.3 Page Rules

Create the following page rules:

1. **API Caching (Disable)**
   - URL: `api.naploo.com/*`
   - Settings: Cache Level: Bypass

2. **Static Assets Caching**
   - URL: `*naploo.com/_next/static/*`
   - Settings: Cache Level: Cache Everything, Edge Cache TTL: 1 month

3. **Admin Security**
   - URL: `admin.naploo.com/*`
   - Settings: Security Level: High, Browser Integrity Check: ON

### 10.4 Firewall Rules

```
# Block known bad bots
(http.user_agent contains "BadBot") or (http.user_agent contains "Scrapy")
Action: Block

# Challenge suspicious requests to API
(http.request.uri.path contains "/api/v1/auth" and cf.threat_score > 10)
Action: Managed Challenge

# Rate limit login attempts
(http.request.uri.path eq "/api/v1/auth/login")
Action: Rate Limit (10 requests/minute)
```

### 10.5 WAF Rules

Enable the following Cloudflare managed rulesets:
- Cloudflare Managed Ruleset
- OWASP ModSecurity Core Rule Set
- Cloudflare SQL Injection Attack Score
- Cloudflare XSS Attack Score

### 10.6 Performance Settings

```
Auto Minify: JavaScript, CSS, HTML
Brotli: ON
Early Hints: ON
Rocket Loader: ON (test thoroughly)
Polish: Lossy (for images)
```

---

## 11. SSL Certificates

### 8.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificates

```bash
# Get certificate for all domains
sudo certbot certonly --nginx \
  -d naploo.com \
  -d www.naploo.com \
  -d api.naploo.com \
  -d partner.naploo.com \
  -d investor.naploo.com \
  -d admin.naploo.com

# Enter your email when prompted
# Agree to terms
```

### 8.3 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-creates a cron job, verify:
sudo systemctl status certbot.timer
```

---

## 12. Process Management

### 12.1 Create PM2 Ecosystem File for Frontend Apps

```bash
nano /var/www/naploo/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    // Customer Website
    {
      name: 'naploo-web',
      cwd: '/var/www/naploo/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3100
      },
      max_memory_restart: '500M',
      error_file: '/var/log/naploo/web-error.log',
      out_file: '/var/log/naploo/web-out.log'
    },
    
    // Investor Pool Portal
    {
      name: 'naploo-investor',
      cwd: '/var/www/naploo/apps/investor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3101',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      },
      max_memory_restart: '300M',
      error_file: '/var/log/naploo/investor-error.log',
      out_file: '/var/log/naploo/investor-out.log'
    },
    
    // Partner Portal
    {
      name: 'naploo-partner',
      cwd: '/var/www/naploo/apps/partner',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3102',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3102
      },
      max_memory_restart: '300M',
      error_file: '/var/log/naploo/partner-error.log',
      out_file: '/var/log/naploo/partner-out.log'
    },
    
    // Admin Dashboard
    {
      name: 'naploo-admin',
      cwd: '/var/www/naploo/apps/admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3103',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3103
      },
      max_memory_restart: '300M',
      error_file: '/var/log/naploo/admin-error.log',
      out_file: '/var/log/naploo/admin-out.log'
    },
    
    // Associate/Referral Portal
    {
      name: 'naploo-associate',
      cwd: '/var/www/naploo/apps/associate',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3104',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3104
      },
      max_memory_restart: '300M',
      error_file: '/var/log/naploo/associate-error.log',
      out_file: '/var/log/naploo/associate-out.log'
    },
    
    // Rental Portal
    {
      name: 'naploo-rental',
      cwd: '/var/www/naploo/apps/rental',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3105',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3105
      },
      max_memory_restart: '300M',
      error_file: '/var/log/naploo/rental-error.log',
      out_file: '/var/log/naploo/rental-out.log'
    }
  ]
};
```

### 12.2 Microservices via Docker Compose

Backend microservices are managed via Docker Compose:

```bash
# Start all microservices
cd /var/www/naploo
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### 12.3 Create Log Directory

```bash
sudo mkdir -p /var/log/naploo
sudo chown -R naploo:naploo /var/log/naploo
```

### 12.4 Start Applications

```bash
cd /var/www/naploo

# Build all frontend apps
bun run build:all

# Start frontend apps with PM2
pm2 start ecosystem.config.js

# Start backend microservices
docker compose up -d

# Save PM2 process list
pm2 save

# View status
pm2 status
docker compose ps

# View logs
pm2 logs
docker compose logs -f
```

### 12.5 Commands Reference

```bash
# PM2 Commands (Frontend)
pm2 restart all
pm2 restart naploo-web
pm2 reload all  # zero-downtime
pm2 logs naploo-web --lines 100
pm2 monit

# Docker Compose Commands (Backend Microservices)
docker compose restart
docker compose restart api-gateway
docker compose logs -f investor-service
docker compose ps
docker compose down
docker compose up -d --build  # rebuild images
```

---

## 13. Mobile App Deployment

### 13.1 Setup Expo/EAS

```bash
cd /var/www/naploo/apps/mobile

# Login to Expo
npx eas login

# Configure EAS
npx eas build:configure
```

### 10.2 Update app.json

```json
{
  "expo": {
    "name": "Naploo",
    "slug": "naploo",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3b82f6"
    },
    "ios": {
      "bundleIdentifier": "com.naploo.app",
      "buildNumber": "1",
      "supportsTablet": false
    },
    "android": {
      "package": "com.naploo.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3b82f6"
      }
    },
    "extra": {
      "apiUrl": "https://api.naploo.com",
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 10.3 Build Apps

```bash
# Build Android APK
npx eas build --platform android --profile production

# Build iOS
npx eas build --platform ios --profile production
```

### 10.4 Submit to Stores

```bash
# Submit to Google Play
npx eas submit --platform android

# Submit to App Store
npx eas submit --platform ios
```

---

## 14. CI/CD Pipeline

### 11.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/naploo
            git pull origin main
            pnpm install
            pnpm build
            pm2 reload all
            echo "Deployed at $(date)"
```

### 11.2 GitHub Secrets

Add these secrets in GitHub repository settings:

- `SERVER_HOST`: Your server IP or domain
- `SERVER_USER`: naploo
- `SSH_PRIVATE_KEY`: SSH private key for deployment

---

## 15. Monitoring & Logging

### 12.1 Install Monitoring Tools

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install ncdu for disk usage
sudo apt install -y ncdu
```

### 12.2 PM2 Plus (Optional)

```bash
# Link to PM2 Plus for web dashboard
pm2 link <secret_key> <public_key>
```

### 12.3 Log Rotation

```bash
sudo nano /etc/logrotate.d/naploo
```

```
/var/log/naploo/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 naploo naploo
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 12.4 System Health Check Script

```bash
nano /var/www/naploo/scripts/health-check.sh
```

```bash
#!/bin/bash

echo "=== Naploo Health Check ==="
echo "Date: $(date)"
echo ""

# Check all services
services=("postgresql" "redis-server" "nginx")

for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✓ $service is running"
    else
        echo "✗ $service is NOT running"
        systemctl start $service
    fi
done

echo ""
echo "=== PM2 Status ==="
pm2 status

echo ""
echo "=== Disk Usage ==="
df -h | grep -E '^/dev/'

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== CPU Load ==="
uptime
```

```bash
chmod +x /var/www/naploo/scripts/health-check.sh
```

---

## 16. Backup Strategy

### 13.1 Database Backup Script

```bash
nano /var/www/naploo/scripts/backup-db.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/naploo/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="naploo_prod_$DATE.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
PGPASSWORD="your_password" pg_dump -U naploo -h localhost naploo_prod | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

```bash
chmod +x /var/www/naploo/scripts/backup-db.sh
```

### 13.2 Schedule Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/naploo/scripts/backup-db.sh >> /var/log/naploo/backup.log 2>&1
```

### 13.3 Backup Uploads

```bash
nano /var/www/naploo/scripts/backup-uploads.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/naploo/uploads"
DATE=$(date +%Y%m%d)
SOURCE_DIR="/var/www/naploo/uploads"

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" $SOURCE_DIR

# Keep last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Uploads backup completed"
```

```bash
chmod +x /var/www/naploo/scripts/backup-uploads.sh
```

---

## 17. Security Hardening

### 14.1 SSH Configuration

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
```

```bash
sudo systemctl restart sshd
```

### 14.2 Fail2Ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local config
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 14.3 Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 18. Troubleshooting

### Common Issues

**1. Nginx 502 Bad Gateway**
```bash
# Check if apps are running
pm2 status

# Check logs
pm2 logs naploo-api --lines 50

# Restart apps
pm2 restart all
```

**2. Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U naploo -d naploo_prod -h localhost
```

**3. High Memory Usage**
```bash
# Check memory
free -h

# Restart heavy apps
pm2 restart naploo-web

# Clear Redis cache
redis-cli FLUSHALL
```

**4. SSL Certificate Renewal Failed**
```bash
# Renew manually
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates
```

**5. Deployment Failed**
```bash
# Check build logs
cd /var/www/naploo
pnpm build 2>&1 | tee build.log

# Check for disk space
df -h
```

### Useful Commands

```bash
# View real-time logs
tail -f /var/log/nginx/error.log

# Check all PM2 logs
pm2 logs

# Monitor system resources
htop

# Check disk usage
ncdu /var/www/naploo

# Test Nginx config
sudo nginx -t

# Restart everything
sudo systemctl restart nginx
pm2 restart all
```

---

## Quick Deploy Checklist

- [ ] Server provisioned with Ubuntu 22.04
- [ ] Domain DNS configured (naploo.com → server IP)
- [ ] Firewall configured (UFW)
- [ ] Node.js 20 installed
- [ ] PostgreSQL 16 installed and configured
- [ ] Redis installed
- [ ] Nginx installed
- [ ] Code deployed to `/var/www/naploo`
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificates obtained
- [ ] Nginx sites configured
- [ ] PM2 processes started
- [ ] Backups scheduled
- [ ] Monitoring set up

---

## Deployment Commands Summary

```bash
# Full deployment from scratch
cd /var/www/naploo
git pull origin main
pnpm install
cd backend && pnpm prisma migrate deploy && cd ..
pnpm build
pm2 reload all

# Quick update (no DB changes)
cd /var/www/naploo
git pull origin main
pnpm build
pm2 reload all

# Check status
pm2 status
sudo nginx -t
sudo systemctl status postgresql redis-server nginx
```

---

**Last Updated:** December 2024  
**Maintained by:** BIDUA Industries
