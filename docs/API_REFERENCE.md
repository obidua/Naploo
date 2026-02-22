# Naploo API Reference

> **Version:** 3.1.0  
> **Base URL:** `https://api.naploo.com`  
> **Last Updated:** February 23, 2026

---

## ⚠️ Implementation Status

> **IMPORTANT:** This document describes the **planned API specification**. Most endpoints below are **not yet implemented**. See the status summary below.

### Currently Implemented (Live)

| Service | Port | Status | Endpoints |
|---------|------|--------|-----------|
| **API Gateway** | 3000 | ✅ Running | `GET /health`, `GET /`, `GET /swagger`, `GET /api/v1/auth/health`, `GET /api/v1/bookings/health`, `GET /api/v1/investors/health`, `GET /api/v1/partners/health` |
| **Auth Service** | 3001 | ⚠️ Stub only | `POST /send-otp` (logs to console, no MSG91), `POST /verify-otp` (returns hardcoded user), `POST /refresh` (stub), `POST /logout` (stub) |

### Not Yet Implemented (Planned)

| Service | Port | Status |
|---------|------|--------|
| Booking Service | 3002 | ❌ Empty directory |
| Payment Service | 3003 | ❌ Empty directory |
| Investor Service | 3004 | ❌ Empty directory |
| Referral Service | 3005 | ❌ Empty directory |
| Rental Service | 3006 | ❌ Empty directory |
| Hotel Service | 3007 | ❌ Empty directory |
| Notification Service | 3008 | ❌ Empty directory |
| Analytics Service | 3009 | ❌ Empty directory |
| Search Service | 3010 | ❌ Empty directory |

### Live API Endpoints (Swagger)

Interactive API documentation is available at: **https://api.naploo.com/swagger**

---

> **The sections below describe the full planned API design for all services. Auth endpoints (5.1) reflect the live implementation. Other endpoints describe future specifications.**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Endpoints](#5-endpoints)
   - [Auth](#51-auth)
   - [Users](#52-users)
   - [Search](#53-search)
   - [Hotels](#54-hotels)
   - [Rooms](#55-rooms)
   - [Pods](#56-pods)
   - [Bookings](#57-bookings)
   - [Payments](#58-payments)
   - [Reviews](#59-reviews)
   - [Partner (Hotel Owner)](#510-partner-hotel-owner)
   - [Investor Pool](#511-investor-pool)
   - [Associates/Referrals](#512-associatesreferrals)
   - [Rentals](#513-rentals)
   - [Admin](#514-admin)
6. [Webhooks](#6-webhooks)
7. [SDKs & Libraries](#7-sdks--libraries)

---

## 1. Overview

### 1.1 Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.naploo.com` |
| Development | `http://localhost:3000` |

### 1.2 Request Format

All requests must include:
```http
Content-Type: application/json
Accept: application/json
```

### 1.3 Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-12-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "phone",
        "message": "Phone number is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-12-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 2. Authentication

### 2.1 Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │ Client  │     │   API   │     │  SMS    │
│         │     │  App    │     │ Server  │     │ Gateway │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Enter Phone   │               │               │
     │──────────────>│               │               │
     │               │  POST /auth/send-otp          │
     │               │──────────────>│               │
     │               │               │  Send OTP     │
     │               │               │──────────────>│
     │               │   200 OK      │               │
     │               │<──────────────│               │
     │               │               │               │
     │ Enter OTP     │               │               │
     │──────────────>│               │               │
     │               │  POST /auth/verify-otp        │
     │               │──────────────>│               │
     │               │   200 OK + tokens             │
     │               │<──────────────│               │
     │  Logged In    │               │               │
     │<──────────────│               │               │
```

### 2.2 User Roles

| Role | Description | Access |
|------|-------------|--------|
| `CUSTOMER` | End users booking pods/rooms | Customer APIs |
| `HOTEL_OWNER` | Hotel partners managing properties | Partner APIs |
| `INVESTOR` | Pod investors | Investor APIs |
| `STAFF` | Naploo staff | Limited Admin APIs |
| `ADMIN` | Full administrative access | All APIs |

### 2.3 Headers

Include the access token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Token Types

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Get new access token |

### 2.5 Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "rt_xxxxxxxxxxxx"
}
```

---

## 3. Error Handling

### 3.1 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 401 | `TOKEN_EXPIRED` | Access token expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `UNPROCESSABLE` | Business logic error |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### 3.2 Business Error Codes

| Code | Description |
|------|-------------|
| `POD_UNAVAILABLE` | Pod not available for selected time |
| `ROOM_UNAVAILABLE` | Room not available for selected dates |
| `BOOKING_NOT_FOUND` | Booking does not exist |
| `PAYMENT_FAILED` | Payment processing failed |
| `INSUFFICIENT_BALANCE` | Wallet balance too low |
| `OTP_EXPIRED` | OTP has expired |
| `OTP_INVALID` | Incorrect OTP code |
| `MAX_ATTEMPTS_EXCEEDED` | Too many OTP attempts |
| `HOTEL_NOT_VERIFIED` | Hotel not yet verified |
| `PARTNER_SUSPENDED` | Partner account suspended |

---

## 4. Rate Limiting

### 4.1 Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| OTP | 3 requests | 5 minutes |
| General API | 100 requests | 1 minute |
| Booking Creation | 10 requests | 1 minute |
| Search | 30 requests | 1 minute |

### 4.2 Headers

Rate limit info is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706007600
```

---

## 5. Endpoints

## 5.1 Auth ✅ LIVE

> **Status:** All auth endpoints below are **fully implemented** and live at `https://api.naploo.com`. OTP is stored in PostgreSQL with 5-minute expiry. In development mode (`NODE_ENV=development`), the OTP is returned in the response for testing.

### Send OTP

Send OTP to phone number for authentication. Rate limited to 5 requests per 10 minutes per phone number.

```http
POST /api/v1/auth/send-otp
```

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | 10-digit phone number (auto-prefixed with +91) |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "devOtp": "123456"  // Only in NODE_ENV=development
}
```

---

### Verify OTP

Verify the OTP code sent to phone. Creates a new user if phone is not registered. Returns JWT access and refresh tokens.

```http
POST /api/v1/auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe",     // Optional, used for new user registration
  "email": "john@example.com"  // Optional
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | 10-digit phone number |
| otp | string | Yes | 6-digit OTP code |
| name | string | No | Full name (for new users) |
| email | string | No | Email (for new users) |

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "status": "active",
    "city": null,
    "state": null,
    "phoneVerified": true,
    "emailVerified": false,
    "createdAt": "2026-02-22T10:00:00.000Z"
  },
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "isNewUser": false
}
```

---

### Get Profile (Me)

Get the authenticated user's profile.

```http
GET /api/v1/auth/me
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "status": "active",
    "city": "Mumbai",
    "state": "Maharashtra",
    "phoneVerified": true,
    "emailVerified": false,
    "createdAt": "2026-02-22T10:00:00.000Z"
  }
}
```

---

### Update Profile

Update the authenticated user's profile fields.

```http
PATCH /api/v1/auth/profile
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "johnsmith@example.com",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { ... }
}
```

---

### Refresh Token

Get new access and refresh tokens using a valid refresh token.

```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### Logout

Invalidate refresh token in the database.

```http
POST /api/v1/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

## 5.2 Users (Planned)

### Get Profile

Get current user's profile.

```http
GET /users/profile
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_xxxx",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "avatarUrl": "https://...",
      "walletBalance": 500.00,
      "role": "CUSTOMER",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  }
}
```

---

### Update Profile

Update user profile information.

```http
PUT /users/profile
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "avatarUrl": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

### Get Wallet

Get wallet balance and transactions.

```http
GET /users/wallet?page=1&limit=20
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 500.00,
    "transactions": [
      {
        "id": "txn_xxxx",
        "type": "CREDIT",
        "amount": 500.00,
        "description": "Refund for booking NPL123",
        "createdAt": "2026-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## 5.3 Search

### Unified Search

Search for hotels, pods, and rooms with various filters.

```http
GET /search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search term (hotel name, city, etc.) |
| city | string | No | Filter by city name |
| state | string | No | Filter by state |
| lat | number | No | Latitude for location-based search |
| lng | number | No | Longitude for location-based search |
| radius | number | No | Search radius in km (default: 10) |
| type | string | No | `POD`, `ROOM`, or `ALL` (default: ALL) |
| checkIn | string | Yes | Check-in date/time (ISO 8601) |
| checkOut | string | Yes | Check-out date/time (ISO 8601) |
| guests | number | No | Number of guests (default: 1) |
| minPrice | number | No | Minimum price |
| maxPrice | number | No | Maximum price |
| amenities | string | No | Comma-separated amenities |
| rating | number | No | Minimum rating (1-5) |
| sortBy | string | No | `price`, `rating`, `distance`, `popularity` |
| sortOrder | string | No | `asc`, `desc` |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "htl_xxxx",
        "type": "HOTEL",
        "name": "Grand Palace Hotel",
        "slug": "grand-palace-hotel-delhi",
        "address": "123 Main Street, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "rating": 4.5,
        "totalReviews": 328,
        "images": ["https://..."],
        "distance": 2.5,
        "hasPods": true,
        "hasRooms": true,
        "lowestPrice": {
          "pod": { "hourly": 150, "type": "SINGLE" },
          "room": { "nightly": 2500, "type": "STANDARD" }
        },
        "amenities": ["wifi", "parking", "restaurant", "gym"],
        "availability": {
          "pods": { "available": 15, "total": 30 },
          "rooms": { "available": 8, "total": 25 }
        }
      },
      {
        "id": "loc_xxxx",
        "type": "POD_LOCATION",
        "name": "Naploo IGI Airport T3",
        "slug": "naploo-igi-airport-t3",
        "address": "Terminal 3, IGI Airport",
        "city": "New Delhi",
        "category": "AIRPORT",
        "rating": 4.7,
        "totalReviews": 1250,
        "images": ["https://..."],
        "distance": 15.2,
        "hasPods": true,
        "hasRooms": false,
        "lowestPrice": {
          "pod": { "hourly": 150, "type": "SINGLE" }
        },
        "availability": {
          "pods": { "available": 25, "total": 50 }
        }
      }
    ],
    "filters": {
      "priceRange": { "min": 150, "max": 15000 },
      "availableAmenities": ["wifi", "ac", "tv", "parking"],
      "propertyTypes": ["HOTEL", "POD_LOCATION"]
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### Search Suggestions

Get autocomplete suggestions for search.

```http
GET /search/suggestions
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query (min 2 chars) |
| limit | number | No | Max suggestions (default: 10) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "CITY",
        "value": "New Delhi",
        "displayText": "New Delhi, Delhi",
        "icon": "location"
      },
      {
        "type": "HOTEL",
        "value": "htl_xxxx",
        "displayText": "Grand Palace Hotel, Connaught Place",
        "icon": "hotel"
      },
      {
        "type": "LANDMARK",
        "value": "IGI Airport Terminal 3",
        "displayText": "Indira Gandhi Airport T3, Delhi",
        "icon": "airport"
      }
    ]
  }
}
```

---

### Popular Destinations

Get popular destinations and trending searches.

```http
GET /search/popular
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "city": "New Delhi",
        "state": "Delhi",
        "image": "https://...",
        "propertyCount": 45,
        "startingPrice": 150
      },
      {
        "city": "Mumbai",
        "state": "Maharashtra",
        "image": "https://...",
        "propertyCount": 38,
        "startingPrice": 180
      }
    ],
    "trending": [
      "Delhi Airport Hotels",
      "Mumbai Budget Pods",
      "Bangalore Tech Park Stay"
    ]
  }
}
```

---

## 5.4 Hotels

### List Hotels

Get all partner hotels with optional filters.

```http
GET /hotels
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| city | string | Filter by city name |
| state | string | Filter by state |
| hasPods | boolean | Filter hotels with pods |
| hasRooms | boolean | Filter hotels with rooms |
| isVerified | boolean | Filter by verification status |
| rating | number | Minimum rating |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| sortBy | string | Sort field (name, rating, createdAt) |
| sortOrder | string | Sort order (asc, desc) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "htl_xxxx",
        "name": "Grand Palace Hotel",
        "slug": "grand-palace-hotel-delhi",
        "description": "Luxury hotel in the heart of Delhi...",
        "address": "123 Main Street, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "latitude": 28.6329,
        "longitude": 77.2195,
        "rating": 4.5,
        "totalReviews": 328,
        "images": ["https://..."],
        "amenities": ["wifi", "parking", "restaurant", "gym", "pool"],
        "hasPods": true,
        "hasRooms": true,
        "isVerified": true,
        "inventory": {
          "pods": {
            "total": 30,
            "single": 20,
            "double": 10
          },
          "rooms": {
            "total": 50,
            "standard": 25,
            "deluxe": 15,
            "suite": 10
          }
        },
        "pricing": {
          "pods": {
            "single": { "hourlyRate": 150 },
            "double": { "hourlyRate": 200 }
          },
          "rooms": {
            "standard": { "nightlyRate": 2500 },
            "deluxe": { "nightlyRate": 4000 },
            "suite": { "nightlyRate": 8000 }
          }
        },
        "owner": {
          "id": "own_xxxx",
          "businessName": "Grand Hotels Pvt Ltd"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### Get Hotel Details

Get detailed information about a specific hotel.

```http
GET /hotels/:id
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "htl_xxxx",
      "name": "Grand Palace Hotel",
      "slug": "grand-palace-hotel-delhi",
      "description": "Luxury hotel in the heart of Delhi with modern amenities...",
      "address": "123 Main Street, Connaught Place",
      "city": "New Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "latitude": 28.6329,
      "longitude": 77.2195,
      "rating": 4.5,
      "totalReviews": 328,
      "images": [
        {
          "url": "https://...",
          "alt": "Hotel Exterior",
          "isPrimary": true
        }
      ],
      "amenities": [
        {
          "id": "wifi",
          "name": "Free WiFi",
          "icon": "wifi"
        },
        {
          "id": "parking",
          "name": "Free Parking",
          "icon": "parking"
        }
      ],
      "policies": {
        "checkInTime": "14:00",
        "checkOutTime": "11:00",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
        "childPolicy": "Children under 5 stay free",
        "petPolicy": "Pets not allowed"
      },
      "hasPods": true,
      "hasRooms": true,
      "pods": [
        {
          "id": "pod_xxxx",
          "podNumber": "P001",
          "type": "SINGLE",
          "status": "AVAILABLE",
          "hourlyRate": 150,
          "features": ["tv", "ac", "usb"]
        }
      ],
      "roomTypes": [
        {
          "id": "rtyp_xxxx",
          "name": "Standard Room",
          "type": "STANDARD",
          "description": "Comfortable room with city view",
          "maxGuests": 2,
          "bedType": "QUEEN",
          "size": 250,
          "sizeUnit": "sqft",
          "amenities": ["wifi", "ac", "tv", "minibar"],
          "images": ["https://..."],
          "basePrice": 2500,
          "availableRooms": 12
        }
      ],
      "nearbyPlaces": [
        {
          "name": "Connaught Place Metro",
          "type": "METRO",
          "distance": 0.5,
          "distanceUnit": "km"
        }
      ],
      "contact": {
        "phone": "+911234567890",
        "email": "info@grandpalace.com",
        "website": "https://grandpalace.com"
      },
      "owner": {
        "id": "own_xxxx",
        "businessName": "Grand Hotels Pvt Ltd",
        "isVerified": true
      }
    }
  }
}
```

---

### Get Hotel Availability

Check room and pod availability for a hotel.

```http
GET /hotels/:id/availability
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkIn | string | Yes | Check-in date/time (ISO 8601) |
| checkOut | string | Yes | Check-out date/time (ISO 8601) |
| type | string | No | `POD`, `ROOM`, or `ALL` |
| guests | number | No | Number of guests |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hotelId": "htl_xxxx",
    "checkIn": "2024-12-25T14:00:00+05:30",
    "checkOut": "2024-12-26T11:00:00+05:30",
    "pods": {
      "available": true,
      "options": [
        {
          "type": "SINGLE",
          "available": 15,
          "hourlyRate": 150,
          "minHours": 1,
          "maxHours": 24,
          "totalHours": 21,
          "estimatedPrice": 3150
        },
        {
          "type": "DOUBLE",
          "available": 8,
          "hourlyRate": 200,
          "minHours": 1,
          "maxHours": 24,
          "totalHours": 21,
          "estimatedPrice": 4200
        }
      ]
    },
    "rooms": {
      "available": true,
      "options": [
        {
          "id": "rtyp_xxxx",
          "type": "STANDARD",
          "name": "Standard Room",
          "available": 12,
          "nights": 1,
          "basePrice": 2500,
          "taxes": 450,
          "totalPrice": 2950
        },
        {
          "id": "rtyp_yyyy",
          "type": "DELUXE",
          "name": "Deluxe Room",
          "available": 8,
          "nights": 1,
          "basePrice": 4000,
          "taxes": 720,
          "totalPrice": 4720
        }
      ]
    }
  }
}
```

---

### Get Hotel Reviews

Get reviews for a hotel.

```http
GET /hotels/:id/reviews
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| rating | number | Filter by rating |
| type | string | `POD` or `ROOM` |
| sortBy | string | `recent`, `rating`, `helpful` |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 328,
      "distribution": {
        "5": 180,
        "4": 100,
        "3": 30,
        "2": 12,
        "1": 6
      },
      "aspects": {
        "cleanliness": 4.7,
        "location": 4.8,
        "service": 4.3,
        "value": 4.2,
        "amenities": 4.5
      }
    },
    "reviews": [
      {
        "id": "rev_xxxx",
        "user": {
          "id": "usr_xxxx",
          "name": "John D.",
          "avatar": "https://..."
        },
        "bookingType": "ROOM",
        "roomType": "DELUXE",
        "rating": 5,
        "title": "Excellent stay!",
        "comment": "Great location and very clean rooms...",
        "aspects": {
          "cleanliness": 5,
          "location": 5,
          "service": 5,
          "value": 4,
          "amenities": 5
        },
        "images": ["https://..."],
        "stayDate": "2024-12-15",
        "helpful": 12,
        "response": {
          "comment": "Thank you for your kind words!",
          "respondedAt": "2024-12-16T10:00:00Z"
        },
        "createdAt": "2024-12-16T08:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 5.5 Rooms

### List Room Types

Get available room types for a hotel.

```http
GET /hotels/:hotelId/rooms
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "roomTypes": [
      {
        "id": "rtyp_xxxx",
        "name": "Standard Room",
        "type": "STANDARD",
        "description": "Comfortable room with essential amenities",
        "maxGuests": 2,
        "maxAdults": 2,
        "maxChildren": 1,
        "bedType": "QUEEN",
        "bedCount": 1,
        "size": 250,
        "sizeUnit": "sqft",
        "amenities": [
          {
            "id": "wifi",
            "name": "Free WiFi",
            "icon": "wifi"
          },
          {
            "id": "ac",
            "name": "Air Conditioning",
            "icon": "snowflake"
          }
        ],
        "images": ["https://..."],
        "basePrice": 2500,
        "totalRooms": 25,
        "availableRooms": 12
      }
    ]
  }
}
```

---

### Get Room Availability

Check availability for a specific room type.

```http
GET /hotels/:hotelId/rooms/:roomTypeId/availability
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkIn | string | Yes | Check-in date (YYYY-MM-DD) |
| checkOut | string | Yes | Check-out date (YYYY-MM-DD) |
| rooms | number | No | Number of rooms (default: 1) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "roomTypeId": "rtyp_xxxx",
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-27",
    "nights": 2,
    "available": true,
    "availableRooms": 12,
    "requestedRooms": 1,
    "pricing": {
      "perNight": [
        {
          "date": "2024-12-25",
          "basePrice": 2500,
          "seasonalRate": 1.2,
          "finalPrice": 3000
        },
        {
          "date": "2024-12-26",
          "basePrice": 2500,
          "seasonalRate": 1.2,
          "finalPrice": 3000
        }
      ],
      "subtotal": 6000,
      "taxes": {
        "gst": 1080,
        "rate": 18
      },
      "total": 7080
    }
  }
}
```

---

### Get Room Details

Get detailed information about a room type.

```http
GET /hotels/:hotelId/rooms/:roomTypeId
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "roomType": {
      "id": "rtyp_xxxx",
      "name": "Deluxe Room",
      "type": "DELUXE",
      "description": "Spacious room with premium amenities and city view",
      "longDescription": "Experience luxury in our deluxe rooms featuring...",
      "maxGuests": 3,
      "maxAdults": 2,
      "maxChildren": 1,
      "bedConfiguration": [
        { "type": "KING", "count": 1 }
      ],
      "size": 400,
      "sizeUnit": "sqft",
      "view": "CITY",
      "floor": "5-10",
      "amenities": [
        {
          "id": "wifi",
          "name": "Free High-Speed WiFi",
          "icon": "wifi",
          "description": "100 Mbps connection"
        },
        {
          "id": "minibar",
          "name": "Mini Bar",
          "icon": "glass",
          "description": "Complimentary soft drinks"
        }
      ],
      "images": [
        {
          "url": "https://...",
          "alt": "Room Interior",
          "isPrimary": true
        }
      ],
      "pricing": {
        "basePrice": 4000,
        "weekendPrice": 4500,
        "seasonalPricing": [
          {
            "name": "Peak Season",
            "from": "2024-12-20",
            "to": "2025-01-05",
            "multiplier": 1.5
          }
        ]
      },
      "inclusions": [
        "Complimentary breakfast",
        "Airport pickup",
        "Early check-in subject to availability"
      ],
      "policies": {
        "cancellation": "Free cancellation up to 48 hours before check-in",
        "payment": "Pay at hotel or prepay online"
      },
      "hotel": {
        "id": "htl_xxxx",
        "name": "Grand Palace Hotel"
      }
    }
  }
}
```

---

## 5.6 Pods

### Get Pod Details

Get information about a specific pod.

```http
GET /pods/:id
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pod": {
      "id": "pod_xxxx",
      "podNumber": "A101",
      "type": "SINGLE",
      "status": "AVAILABLE",
      "floor": 1,
      "features": [
        {
          "id": "tv",
          "name": "Smart TV",
          "description": "32-inch with headphones"
        },
        {
          "id": "ac",
          "name": "Climate Control",
          "description": "Individual AC/heater"
        },
        {
          "id": "usb",
          "name": "USB Charging",
          "description": "Multiple USB ports"
        }
      ],
      "location": {
        "id": "loc_xxxx",
        "name": "Naploo IGI Airport T3"
      },
      "pricing": {
        "hourlyRate": 150,
        "discountPercent": 10
      }
    }
  }
}
```

---

### Get Pod Availability

Check pod availability for a specific time range.

```http
GET /pods/:id/availability
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | Yes | Date (YYYY-MM-DD) |
| startTime | string | No | Start time (HH:mm) |
| endTime | string | No | End time (HH:mm) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "podId": "pod_xxxx",
    "date": "2026-01-25",
    "availableSlots": [
      {
        "startTime": "00:00",
        "endTime": "06:00",
        "available": true
      },
      {
        "startTime": "06:00",
        "endTime": "10:00",
        "available": false,
        "bookedUntil": "10:00"
      },
      {
        "startTime": "10:00",
        "endTime": "23:59",
        "available": true
      }
    ]
  }
}
```

---

## 5.7 Bookings

### Check Availability (Unified)

Check availability and get pricing for pod or room booking.

```http
POST /bookings/availability
Authorization: Bearer {access_token}
```

**Request Body (Pod Booking):**
```json
{
  "type": "POD",
  "hotelId": "htl_xxxx",
  "podType": "SINGLE",
  "date": "2024-12-25",
  "startTime": "14:00",
  "duration": 3
}
```

**Request Body (Room Booking):**
```json
{
  "type": "ROOM",
  "hotelId": "htl_xxxx",
  "roomTypeId": "rtyp_xxxx",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "rooms": 1,
  "guests": {
    "adults": 2,
    "children": 0
  }
}
```

**Response (Pod):** `200 OK`
```json
{
  "success": true,
  "data": {
    "type": "POD",
    "available": true,
    "availablePods": [
      {
        "id": "pod_xxxx",
        "podNumber": "P001",
        "floor": 1,
        "features": ["tv", "ac", "usb"]
      }
    ],
    "pricing": {
      "podType": "SINGLE",
      "hourlyRate": 150,
      "duration": 3,
      "baseAmount": 450,
      "discount": {
        "percent": 10,
        "amount": 30,
        "reason": "10% off on hours after first"
      },
      "subtotal": 420,
      "tax": {
        "gst": 75.60,
        "rate": 18
      },
      "total": 495.60
    },
    "bookingWindow": {
      "startTime": "2024-12-25T14:00:00+05:30",
      "endTime": "2024-12-25T17:00:00+05:30"
    }
  }
}
```

**Response (Room):** `200 OK`
```json
{
  "success": true,
  "data": {
    "type": "ROOM",
    "available": true,
    "availableRooms": [
      {
        "id": "room_xxxx",
        "roomNumber": "501",
        "floor": 5,
        "view": "CITY",
        "bedType": "KING"
      }
    ],
    "pricing": {
      "roomType": "DELUXE",
      "nights": 2,
      "perNight": [
        { "date": "2024-12-25", "price": 4000 },
        { "date": "2024-12-26", "price": 4000 }
      ],
      "baseAmount": 8000,
      "discount": {
        "percent": 0,
        "amount": 0
      },
      "subtotal": 8000,
      "tax": {
        "gst": 1440,
        "rate": 18
      },
      "total": 9440
    },
    "bookingWindow": {
      "checkIn": "2024-12-25T14:00:00+05:30",
      "checkOut": "2024-12-27T11:00:00+05:30"
    }
  }
}
```

---

### Create Booking

Create a new booking for pod or room.

```http
POST /bookings
Authorization: Bearer {access_token}
```

**Request Body (Pod Booking):**
```json
{
  "type": "POD",
  "hotelId": "htl_xxxx",
  "podId": "pod_xxxx",
  "startTime": "2024-12-25T14:00:00+05:30",
  "endTime": "2024-12-25T17:00:00+05:30",
  "guestName": "John Doe",
  "guestPhone": "+919876543210",
  "guestEmail": "john@example.com",
  "specialRequests": "Late checkout if possible"
}
```

**Request Body (Room Booking):**
```json
{
  "type": "ROOM",
  "hotelId": "htl_xxxx",
  "roomTypeId": "rtyp_xxxx",
  "roomId": "room_xxxx",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "guests": {
    "adults": 2,
    "children": 0,
    "details": [
      {
        "name": "John Doe",
        "isPrimary": true
      },
      {
        "name": "Jane Doe",
        "isPrimary": false
      }
    ]
  },
  "guestName": "John Doe",
  "guestPhone": "+919876543210",
  "guestEmail": "john@example.com",
  "specialRequests": "High floor preferred"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "bookingNumber": "NPL20241225001",
      "type": "ROOM",
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "hotel": {
        "id": "htl_xxxx",
        "name": "Grand Palace Hotel",
        "address": "123 Main Street, Connaught Place",
        "city": "New Delhi"
      },
      "room": {
        "id": "room_xxxx",
        "roomNumber": "501",
        "type": "DELUXE",
        "floor": 5
      },
      "checkIn": "2024-12-25T14:00:00+05:30",
      "checkOut": "2024-12-27T11:00:00+05:30",
      "nights": 2,
      "pricing": {
        "baseAmount": 8000,
        "discountAmount": 0,
        "taxAmount": 1440,
        "totalAmount": 9440
      },
      "guests": {
        "adults": 2,
        "children": 0,
        "primary": {
          "name": "John Doe",
          "phone": "+919876543210",
          "email": "john@example.com"
        }
      },
      "createdAt": "2024-12-20T10:30:00Z",
      "expiresAt": "2024-12-20T10:45:00Z"
    },
    "payment": {
      "orderId": "order_xxxx",
      "amount": 944000,
      "currency": "INR",
      "key": "rzp_live_xxxx"
    }
  }
}
```

---

### List User Bookings

Get all bookings for the current user.

```http
GET /bookings
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type (`POD`, `ROOM`) |
| status | string | Filter by status |
| fromDate | string | From date (YYYY-MM-DD) |
| toDate | string | To date (YYYY-MM-DD) |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "bkg_xxxx",
        "bookingNumber": "NPL20241225001",
        "type": "ROOM",
        "status": "CONFIRMED",
        "hotel": {
          "id": "htl_xxxx",
          "name": "Grand Palace Hotel",
          "city": "New Delhi",
          "image": "https://..."
        },
        "room": {
          "roomNumber": "501",
          "type": "DELUXE"
        },
        "checkIn": "2024-12-25T14:00:00+05:30",
        "checkOut": "2024-12-27T11:00:00+05:30",
        "totalAmount": 9440,
        "createdAt": "2024-12-20T10:30:00Z"
      },
      {
        "id": "bkg_yyyy",
        "bookingNumber": "NPL20241223001",
        "type": "POD",
        "status": "COMPLETED",
        "hotel": {
          "id": "loc_xxxx",
          "name": "Naploo IGI Airport T3",
          "city": "New Delhi",
          "image": "https://..."
        },
        "pod": {
          "podNumber": "A101",
          "type": "SINGLE"
        },
        "startTime": "2024-12-23T14:00:00+05:30",
        "endTime": "2024-12-23T17:00:00+05:30",
        "totalAmount": 495.60,
        "createdAt": "2024-12-22T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### Get Booking Details

Get detailed information about a specific booking.

```http
GET /bookings/:id
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "bookingNumber": "NPL20241225001",
      "type": "ROOM",
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED",
      "hotel": {
        "id": "htl_xxxx",
        "name": "Grand Palace Hotel",
        "address": "123 Main Street, Connaught Place",
        "city": "New Delhi",
        "contactPhone": "+911234567890"
      },
      "room": {
        "id": "room_xxxx",
        "roomNumber": "501",
        "type": "DELUXE",
        "floor": 5,
        "amenities": ["wifi", "ac", "tv", "minibar"]
      },
      "checkIn": "2024-12-25T14:00:00+05:30",
      "checkOut": "2024-12-27T11:00:00+05:30",
      "nights": 2,
      "pricing": {
        "baseAmount": 8000,
        "discountAmount": 0,
        "taxAmount": 1440,
        "totalAmount": 9440
      },
      "guests": {
        "adults": 2,
        "children": 0,
        "primary": {
          "name": "John Doe",
          "phone": "+919876543210",
          "email": "john@example.com"
        }
      },
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "checkInTime": null,
      "checkOutTime": null,
      "payment": {
        "id": "pay_xxxx",
        "method": "UPI",
        "transactionId": "txn_xxxx",
        "paidAt": "2024-12-20T10:35:00Z"
      },
      "createdAt": "2024-12-20T10:30:00Z"
    }
  }
}
```

---

### Check-In

Check in to a booked pod or room.

```http
POST /bookings/:id/check-in
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "qrCode": "NPL20241225001_501_xxxx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "status": "CHECKED_IN",
      "checkInTime": "2024-12-25T14:05:00+05:30"
    },
    "message": "Welcome! Your room 501 is ready.",
    "instructions": {
      "wifiName": "GrandPalace_Guest",
      "wifiPassword": "xxxx1234",
      "roomKeyCode": "501#1234"
    }
  }
}
```

---

### Check-Out

Check out from a pod.

```http
POST /bookings/:id/check-out
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "status": "CHECKED_OUT",
      "checkOutTime": "2026-01-25T17:00:00+05:30",
      "actualDuration": 2.92
    },
    "message": "Thank you for staying with Naploo!"
  }
}
```

---

### Cancel Booking

Cancel a pending or confirmed booking.

```http
POST /bookings/:id/cancel
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "status": "CANCELLED",
      "cancelledAt": "2026-01-22T12:00:00Z"
    },
    "refund": {
      "eligible": true,
      "amount": 495.60,
      "method": "WALLET",
      "status": "PROCESSING",
      "estimatedTime": "24-48 hours"
    }
  }
}
```

---

## 5.6 Payments

### Create Payment Order

Create a Razorpay order for booking payment.

```http
POST /payments/create-order
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "bookingId": "bkg_xxxx",
  "paymentMethod": "UPI"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxx",
    "amount": 49560,
    "currency": "INR",
    "key": "rzp_live_xxxx",
    "name": "Naploo",
    "description": "Booking NPL20260125001",
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+919876543210"
    },
    "notes": {
      "bookingId": "bkg_xxxx"
    }
  }
}
```

---

### Verify Payment

Verify payment after Razorpay callback.

```http
POST /payments/verify
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "bookingId": "bkg_xxxx",
  "razorpay_order_id": "order_xxxx",
  "razorpay_payment_id": "pay_xxxx",
  "razorpay_signature": "xxxxx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "pay_xxxx",
      "status": "COMPLETED",
      "amount": 495.60,
      "method": "UPI",
      "transactionId": "txn_xxxx"
    },
    "booking": {
      "id": "bkg_xxxx",
      "status": "CONFIRMED",
      "qrCode": "data:image/png;base64,..."
    }
  }
}
```

---

### Get Payment History

Get user's payment history.

```http
GET /payments
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| fromDate | string | From date |
| toDate | string | To date |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_xxxx",
        "bookingId": "bkg_xxxx",
        "bookingNumber": "NPL20260125001",
        "amount": 495.60,
        "currency": "INR",
        "method": "UPI",
        "status": "COMPLETED",
        "createdAt": "2026-01-22T10:35:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 5.9 Reviews

### Create Review

Create a review for a completed booking.

```http
POST /reviews
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "bookingId": "bkg_xxxx",
  "rating": 5,
  "title": "Excellent stay!",
  "comment": "Great location and very clean rooms. Staff was helpful.",
  "aspects": {
    "cleanliness": 5,
    "location": 5,
    "service": 4,
    "value": 4,
    "amenities": 5
  },
  "images": ["https://..."]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "rev_xxxx",
      "bookingId": "bkg_xxxx",
      "hotelId": "htl_xxxx",
      "rating": 5,
      "title": "Excellent stay!",
      "comment": "Great location and very clean rooms...",
      "aspects": { ... },
      "images": ["https://..."],
      "createdAt": "2024-12-28T10:00:00Z"
    }
  }
}
```

---

### Get User Reviews

Get all reviews by the current user.

```http
GET /reviews
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_xxxx",
        "hotel": {
          "id": "htl_xxxx",
          "name": "Grand Palace Hotel",
          "image": "https://..."
        },
        "bookingType": "ROOM",
        "rating": 5,
        "title": "Excellent stay!",
        "comment": "Great location...",
        "stayDate": "2024-12-25",
        "createdAt": "2024-12-28T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Update Review

Update an existing review.

```http
PUT /reviews/:id
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "rating": 4,
  "title": "Good stay",
  "comment": "Updated review...",
  "aspects": { ... }
}
```

---

### Delete Review

Delete a review.

```http
DELETE /reviews/:id
Authorization: Bearer {access_token}
```

---

## 5.10 Partner (Hotel Owner)

*Partner endpoints require `HOTEL_OWNER` role. Access via `partner.naploo.com`*

### Partner Registration

Register as a hotel partner.

```http
POST /partner/register
```

**Request Body:**
```json
{
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@grandhotels.com",
  "phone": "+919876543210",
  "businessName": "Grand Hotels Pvt Ltd",
  "businessType": "PRIVATE_LIMITED",
  "gstin": "07AAACG1234A1ZV",
  "pan": "AAACG1234A",
  "address": {
    "line1": "123 Business District",
    "line2": "Suite 500",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "bankDetails": {
    "accountName": "Grand Hotels Pvt Ltd",
    "accountNumber": "1234567890123456",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC Bank",
    "branchName": "Connaught Place"
  },
  "documents": {
    "gstCertificate": "https://...",
    "panCard": "https://...",
    "businessRegistration": "https://...",
    "cancelledCheque": "https://..."
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": "own_xxxx",
      "ownerName": "Rajesh Kumar",
      "businessName": "Grand Hotels Pvt Ltd",
      "email": "rajesh@grandhotels.com",
      "phone": "+919876543210",
      "status": "PENDING_VERIFICATION",
      "createdAt": "2024-12-20T10:00:00Z"
    },
    "message": "Registration submitted. Our team will verify your documents within 2-3 business days."
  }
}
```

---

### Partner Login

Partner authentication.

```http
POST /partner/auth/send-otp
POST /partner/auth/verify-otp
POST /partner/auth/login
```

*(Same flow as customer auth, returns partner-specific tokens)*

---

### Get Partner Dashboard

Get partner dashboard overview.

```http
GET /partner/dashboard
Authorization: Bearer {partner_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProperties": 3,
      "totalRooms": 150,
      "totalPods": 45,
      "activeBookings": 28,
      "todayCheckIns": 12,
      "todayCheckOuts": 8
    },
    "revenue": {
      "today": 45000,
      "thisWeek": 285000,
      "thisMonth": 1250000,
      "pendingPayout": 350000,
      "nextPayoutDate": "2024-12-31"
    },
    "occupancy": {
      "rooms": {
        "occupied": 85,
        "available": 65,
        "rate": 56.67
      },
      "pods": {
        "occupied": 25,
        "available": 20,
        "avgHoursPerDay": 8.5
      }
    },
    "recentBookings": [
      {
        "id": "bkg_xxxx",
        "bookingNumber": "NPL20241225001",
        "type": "ROOM",
        "guestName": "John Doe",
        "property": "Grand Palace Hotel",
        "room": "501",
        "amount": 9440,
        "status": "CONFIRMED",
        "checkIn": "2024-12-25T14:00:00+05:30"
      }
    ],
    "alerts": [
      {
        "type": "LOW_INVENTORY",
        "message": "Only 2 Deluxe rooms available for Dec 25-26",
        "severity": "WARNING"
      }
    ]
  }
}
```

---

### Get Partner Profile

Get partner account details.

```http
GET /partner/profile
Authorization: Bearer {partner_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": "own_xxxx",
      "ownerName": "Rajesh Kumar",
      "email": "rajesh@grandhotels.com",
      "phone": "+919876543210",
      "businessName": "Grand Hotels Pvt Ltd",
      "businessType": "PRIVATE_LIMITED",
      "gstin": "07AAACG1234A1ZV",
      "pan": "AAACG****4A",
      "status": "VERIFIED",
      "verifiedAt": "2024-12-15T10:00:00Z",
      "address": { ... },
      "bankDetails": {
        "accountNumber": "****3456",
        "ifscCode": "HDFC0001234",
        "bankName": "HDFC Bank"
      },
      "commissionRate": {
        "pods": 40,
        "rooms": 15
      },
      "createdAt": "2024-12-10T10:00:00Z"
    }
  }
}
```

---

### List Partner Properties

Get all properties owned by the partner.

```http
GET /partner/properties
Authorization: Bearer {partner_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `ACTIVE`, `INACTIVE`, `PENDING` |
| type | string | `HOTEL`, `POD_ONLY` |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "htl_xxxx",
        "name": "Grand Palace Hotel",
        "type": "HOTEL",
        "address": "123 Main Street, Connaught Place",
        "city": "New Delhi",
        "status": "ACTIVE",
        "rating": 4.5,
        "totalReviews": 328,
        "inventory": {
          "rooms": { "total": 50, "available": 35 },
          "pods": { "total": 30, "available": 22 }
        },
        "todayRevenue": 28000,
        "monthRevenue": 850000
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Add Property

Add a new property (hotel/pod location).

```http
POST /partner/properties
Authorization: Bearer {partner_token}
```

**Request Body:**
```json
{
  "name": "Grand Palace Hotel - Gurgaon",
  "type": "HOTEL",
  "description": "Luxury hotel with premium amenities...",
  "address": {
    "line1": "456 Cyber Hub",
    "city": "Gurgaon",
    "state": "Haryana",
    "pincode": "122002",
    "latitude": 28.4595,
    "longitude": 77.0266
  },
  "contactPhone": "+911234567891",
  "contactEmail": "gurgaon@grandpalace.com",
  "amenities": ["wifi", "parking", "restaurant", "gym", "pool"],
  "images": ["https://..."],
  "policies": {
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "cancellationPolicy": "Free cancellation up to 24 hours",
    "childPolicy": "Children under 5 stay free",
    "petPolicy": "Pets not allowed"
  },
  "hasPods": true,
  "hasRooms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "htl_yyyy",
      "name": "Grand Palace Hotel - Gurgaon",
      "status": "PENDING_VERIFICATION",
      "message": "Property submitted for verification."
    }
  }
}
```

---

### Update Property

Update property details.

```http
PUT /partner/properties/:id
Authorization: Bearer {partner_token}
```

---

### Manage Room Types

```http
# List room types for a property
GET /partner/properties/:propertyId/room-types

# Add room type
POST /partner/properties/:propertyId/room-types

# Update room type
PUT /partner/properties/:propertyId/room-types/:id

# Delete room type
DELETE /partner/properties/:propertyId/room-types/:id
```

**Add Room Type Request:**
```json
{
  "name": "Executive Suite",
  "type": "SUITE",
  "description": "Spacious suite with separate living area",
  "maxGuests": 4,
  "maxAdults": 2,
  "maxChildren": 2,
  "bedConfiguration": [
    { "type": "KING", "count": 1 },
    { "type": "SOFA_BED", "count": 1 }
  ],
  "size": 600,
  "sizeUnit": "sqft",
  "amenities": ["wifi", "ac", "tv", "minibar", "jacuzzi"],
  "images": ["https://..."],
  "basePrice": 12000,
  "weekendPrice": 15000,
  "totalRooms": 5
}
```

---

### Manage Room Inventory

```http
# List rooms for a room type
GET /partner/properties/:propertyId/room-types/:roomTypeId/rooms

# Add room
POST /partner/properties/:propertyId/room-types/:roomTypeId/rooms

# Update room
PUT /partner/properties/:propertyId/rooms/:id

# Toggle room availability
PATCH /partner/properties/:propertyId/rooms/:id/availability
```

**Add Room Request:**
```json
{
  "roomNumber": "601",
  "floor": 6,
  "view": "CITY",
  "status": "AVAILABLE",
  "notes": "Corner room with extra windows"
}
```

---

### Manage Pods

```http
# List pods for a property
GET /partner/properties/:propertyId/pods

# Add pod
POST /partner/properties/:propertyId/pods

# Update pod
PUT /partner/properties/:propertyId/pods/:id

# Toggle pod status
PATCH /partner/properties/:propertyId/pods/:id/status
```

**Add Pod Request:**
```json
{
  "podNumber": "P031",
  "type": "SINGLE",
  "floor": 1,
  "features": ["tv", "ac", "usb", "locker"],
  "hourlyRate": 150,
  "status": "AVAILABLE"
}
```

---

### Manage Pricing

```http
# Get pricing for property
GET /partner/properties/:propertyId/pricing

# Update base pricing
PUT /partner/properties/:propertyId/pricing

# Add seasonal pricing
POST /partner/properties/:propertyId/pricing/seasonal

# Update calendar pricing (specific dates)
PUT /partner/properties/:propertyId/pricing/calendar
```

**Update Pricing Request:**
```json
{
  "roomTypes": [
    {
      "id": "rtyp_xxxx",
      "basePrice": 3000,
      "weekendPrice": 3500,
      "weekendDays": ["FRI", "SAT"]
    }
  ],
  "pods": {
    "single": { "hourlyRate": 175 },
    "double": { "hourlyRate": 225 }
  }
}
```

**Seasonal Pricing Request:**
```json
{
  "name": "New Year Peak",
  "startDate": "2024-12-25",
  "endDate": "2025-01-05",
  "multiplier": 1.5,
  "applyTo": ["ROOMS", "PODS"]
}
```

---

### Get Partner Bookings

Get bookings for partner properties.

```http
GET /partner/bookings
Authorization: Bearer {partner_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | string | Filter by property |
| type | string | `POD`, `ROOM` |
| status | string | Booking status |
| fromDate | string | From date |
| toDate | string | To date |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "bkg_xxxx",
        "bookingNumber": "NPL20241225001",
        "type": "ROOM",
        "status": "CONFIRMED",
        "property": {
          "id": "htl_xxxx",
          "name": "Grand Palace Hotel"
        },
        "room": {
          "roomNumber": "501",
          "type": "DELUXE"
        },
        "guest": {
          "name": "John Doe",
          "phone": "+919876543210"
        },
        "checkIn": "2024-12-25T14:00:00+05:30",
        "checkOut": "2024-12-27T11:00:00+05:30",
        "amount": {
          "total": 9440,
          "commission": 1416,
          "payout": 8024
        },
        "createdAt": "2024-12-20T10:30:00Z"
      }
    ],
    "summary": {
      "totalBookings": 45,
      "totalRevenue": 425000,
      "totalCommission": 63750,
      "totalPayout": 361250
    },
    "pagination": { ... }
  }
}
```

---

### Partner Earnings & Payouts

```http
# Get earnings summary
GET /partner/earnings

# Get detailed earnings
GET /partner/earnings/details

# Get payout history
GET /partner/payouts

# Request early payout
POST /partner/payouts/request
```

**Earnings Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 2500000,
      "totalCommission": 375000,
      "netPayout": 2125000,
      "pendingPayout": 350000,
      "lastPayoutDate": "2024-12-15",
      "nextPayoutDate": "2024-12-31"
    },
    "breakdown": {
      "rooms": {
        "bookings": 180,
        "revenue": 1800000,
        "commission": 270000,
        "commissionRate": 15
      },
      "pods": {
        "bookings": 450,
        "revenue": 700000,
        "commission": 105000,
        "commissionRate": 15
      }
    },
    "monthly": [
      {
        "month": "2024-12",
        "revenue": 850000,
        "commission": 127500,
        "payout": 722500,
        "status": "PENDING"
      }
    ]
  }
}
```

---

### Partner Analytics

```http
# Get property analytics
GET /partner/analytics?propertyId=htl_xxxx&period=30days

# Get occupancy report
GET /partner/analytics/occupancy

# Get revenue report
GET /partner/analytics/revenue

# Export reports
GET /partner/analytics/export?type=bookings&format=csv
```

**Analytics Response:**
```json
{
  "success": true,
  "data": {
    "period": "30days",
    "property": "Grand Palace Hotel",
    "occupancy": {
      "rooms": {
        "average": 72.5,
        "peak": 95,
        "low": 45,
        "trend": "UP"
      },
      "pods": {
        "averageHoursPerDay": 14.2,
        "utilizationRate": 59.2,
        "trend": "STABLE"
      }
    },
    "revenue": {
      "total": 850000,
      "rooms": 650000,
      "pods": 200000,
      "averageDaily": 28333,
      "trend": "UP",
      "growth": 12.5
    },
    "bookings": {
      "total": 125,
      "rooms": 85,
      "pods": 240,
      "cancellationRate": 8.5,
      "averageStay": {
        "rooms": 1.8,
        "pods": 4.2
      }
    },
    "reviews": {
      "average": 4.5,
      "total": 45,
      "sentiment": "POSITIVE"
    },
    "charts": {
      "revenueByDay": { ... },
      "occupancyByDay": { ... },
      "bookingsBySource": { ... }
    }
  }
}
```

---

### Respond to Reviews

```http
POST /partner/reviews/:reviewId/respond
Authorization: Bearer {partner_token}
```

**Request Body:**
```json
{
  "response": "Thank you for your kind words! We look forward to hosting you again."
}
```

---

## 5.11 Investor Pool

### Enroll in Pool

Register to join the investor pool.

```http
POST /investor/pool/enroll
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "fullName": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+919876543210",
  "address": {
    "street": "123 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "acceptTerms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "enroll_xxxx",
      "status": "PENDING",
      "nextStep": "KYC_VERIFICATION",
      "message": "Please complete KYC verification to proceed"
    }
  }
}
```

---

### Submit KYC

Submit KYC documents for verification.

```http
POST /investor/pool/kyc
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (multipart):**
```
aadhaarNumber: 1234-5678-9012
aadhaarFront: [File]
aadhaarBack: [File]
panNumber: ABCDE1234F
panCard: [File]
bankAccountNo: 123456789012
bankIfsc: HDFC0001234
bankName: HDFC Bank
bankStatement: [File]
selfie: [File]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "kycId": "kyc_xxxx",
    "status": "SUBMITTED",
    "message": "KYC submitted for verification. Expected approval in 24-48 hours."
  }
}
```

---

### Get Pool Status

Get current pool enrollment and KYC status.

```http
GET /investor/pool/status
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "poolStatus": {
      "isEnrolled": true,
      "isApproved": true,
      "enrollmentDate": "2026-01-15T10:00:00Z",
      "approvedDate": "2026-01-17T14:00:00Z"
    },
    "kycStatus": {
      "status": "VERIFIED",
      "aadhaarVerified": true,
      "panVerified": true,
      "bankVerified": true,
      "verifiedAt": "2026-01-17T14:00:00Z"
    },
    "poolStats": {
      "totalPoolMembers": 1250,
      "activeAnnouncements": 3
    }
  }
}
```

---

### List Hotel Announcements

Get available hotel announcements for pod set purchase.

```http
GET /investor/announcements
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| city | string | Filter by city |
| status | string | `open`, `fully_claimed`, `closed` |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "ann_xxxx",
        "hotelName": "Hotel Grand Palace",
        "city": "Delhi",
        "state": "Delhi",
        "address": "Near IGI Airport T3",
        "description": "Premium location near airport with high footfall",
        "totalPodSets": 50,
        "availablePodSets": 32,
        "claimedPodSets": 18,
        "pricePerSet": 500000,
        "gstPerSet": 90000,
        "totalPerSet": 590000,
        "images": [
          "https://cdn.naploo.com/announcements/ann_xxxx/1.jpg"
        ],
        "expectedROI": "20-25% annually",
        "announcementDate": "2026-01-20T10:00:00Z",
        "claimDeadline": "2026-02-20T23:59:59Z",
        "status": "OPEN"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3
    }
  }
}
```

---

### Get Announcement Details

Get detailed information about a hotel announcement.

```http
GET /investor/announcements/:id
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "announcement": {
      "id": "ann_xxxx",
      "hotelName": "Hotel Grand Palace",
      "hotelDetails": {
        "id": "htl_xxxx",
        "rating": 4.2,
        "totalRooms": 100,
        "amenities": ["WiFi", "Restaurant", "Parking", "24x7 Reception"]
      },
      "city": "Delhi",
      "state": "Delhi",
      "address": "Near IGI Airport T3",
      "description": "Premium location near airport...",
      "totalPodSets": 50,
      "availablePodSets": 32,
      "pricePerSet": 500000,
      "gstPerSet": 90000,
      "totalPerSet": 590000,
      "podSetDetails": {
        "podsPerSet": 2,
        "podTypes": ["1 Single Bed", "1 Double Bed"],
        "estimatedMonthlyRevenue": "Rs.15,000-20,000 per set"
      },
      "images": ["..."],
      "documents": [
        {
          "name": "Hotel Agreement",
          "url": "https://cdn.naploo.com/docs/ann_xxxx/agreement.pdf"
        }
      ],
      "terms": {
        "revenueShare": "60% to Investor, 40% to Naploo",
        "guarantee": "3x return in 3 years (minimum)",
        "maintenance": "All maintenance by Naploo",
        "scrapPolicy": "Pods belong to Naploo after 3x achieved"
      },
      "announcementDate": "2026-01-20T10:00:00Z",
      "claimDeadline": "2026-02-20T23:59:59Z",
      "status": "OPEN"
    }
  }
}
```

---

### Claim Pod Set

Claim/purchase pod sets from an announcement.

```http
POST /investor/pod-sets/claim
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "announcementId": "ann_xxxx",
  "podSetCount": 2,
  "deliveryOption": "LEASEBACK"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| announcementId | string | Yes | Announcement ID |
| podSetCount | number | Yes | Number of pod sets (1-10) |
| deliveryOption | string | Yes | `DOORSTEP` or `LEASEBACK` |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "claim": {
      "id": "claim_xxxx",
      "announcementId": "ann_xxxx",
      "podSetCount": 2,
      "pricing": {
        "baseAmount": 1000000,
        "gstAmount": 180000,
        "totalAmount": 1180000
      },
      "deliveryOption": "LEASEBACK",
      "paymentStatus": "PENDING",
      "paymentLink": "https://pay.naploo.com/claim_xxxx"
    }
  }
}
```

---

### Complete Pod Set Payment

Process payment for claimed pod sets.

```http
POST /investor/pod-sets/:claimId/pay
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "paymentMethod": "RAZORPAY",
  "razorpayPaymentId": "pay_xxxx",
  "razorpaySignature": "xxxx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "purchase": {
      "id": "purchase_xxxx",
      "claimId": "claim_xxxx",
      "podSetCount": 2,
      "totalAmount": 1180000,
      "paymentStatus": "COMPLETED",
      "invoiceUrl": "https://cdn.naploo.com/invoices/purchase_xxxx.pdf",
      "deliveryOption": "LEASEBACK",
      "estimatedInstallation": "2026-02-15"
    },
    "message": "Congratulations! Your pod sets have been purchased successfully."
  }
}
```

---

### Get My Pod Sets

Get all purchased pod sets.

```http
GET /investor/pod-sets
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "podSets": [
      {
        "id": "purchase_xxxx",
        "hotel": {
          "id": "htl_xxxx",
          "name": "Hotel Grand Palace",
          "city": "Delhi"
        },
        "podSetCount": 2,
        "pods": [
          {
            "id": "pod_xxxx",
            "podNumber": "GP-A101",
            "type": "SINGLE"
          },
          {
            "id": "pod_yyyy",
            "podNumber": "GP-A102",
            "type": "DOUBLE"
          }
        ],
        "investmentAmount": 1000000,
        "gstPaid": 180000,
        "totalPaid": 1180000,
        "deliveryOption": "LEASEBACK",
        "purchaseDate": "2026-01-25T10:00:00Z",
        "installationDate": "2026-02-15T10:00:00Z",
        "status": "ACTIVE",
        "leasebackDetails": {
          "totalEarned": 45000,
          "targetAmount": 3000000,
          "progressPercentage": 1.5,
          "status": "ACTIVE"
        }
      }
    ],
    "summary": {
      "totalPodSets": 2,
      "totalInvested": 1180000,
      "totalEarned": 45000
    }
  }
}
```

---

### Get 3x Tracker

Track progress towards 3x return guarantee.

```http
GET /investor/3x-tracker
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "trackers": [
      {
        "id": "tracker_xxxx",
        "podSetPurchaseId": "purchase_xxxx",
        "hotel": {
          "name": "Hotel Grand Palace",
          "city": "Delhi"
        },
        "investment": {
          "baseAmount": 1000000,
          "targetReturn": 3000000
        },
        "earnings": {
          "totalEarned": 45000,
          "remainingToTarget": 2955000,
          "percentageComplete": 1.5
        },
        "timeline": {
          "startDate": "2026-02-15T00:00:00Z",
          "expectedEndDate": "2029-02-15T00:00:00Z",
          "projectedCompletionDate": "2029-01-01T00:00:00Z",
          "daysRemaining": 1086
        },
        "monthlyBreakdown": [
          {
            "month": "February 2026",
            "bookings": 45,
            "grossRevenue": 75000,
            "investorShare": 45000
          }
        ],
        "status": {
          "current": "ACTIVE",
          "isOnTrack": true,
          "message": "On track to achieve 3x by January 2029"
        }
      }
    ],
    "overallProgress": {
      "totalInvested": 1000000,
      "totalTarget": 3000000,
      "totalEarned": 45000,
      "overallPercentage": 1.5
    }
  }
}
```

---

### Get Dashboard

Get comprehensive investor dashboard.

```http
GET /investor/dashboard
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "poolStatus": {
      "isApproved": true,
      "enrollmentDate": "2026-01-15T10:00:00Z"
    },
    "overview": {
      "totalInvestment": 1180000,
      "totalEarnings": 45000,
      "currentMonthEarnings": 45000,
      "pendingWithdrawal": 0,
      "availableBalance": 45000,
      "progressTo3x": 1.5,
      "activePodSets": 2,
      "totalBookings": 45
    },
    "podSets": ["..."],
    "recentEarnings": [
      {
        "id": "earn_xxxx",
        "podId": "pod_xxxx",
        "bookingNumber": "NPL20260125001",
        "bookingAmount": 495.60,
        "investorShare": 297.36,
        "createdAt": "2026-01-25T17:00:00Z"
      }
    ],
    "announcements": ["..."],
    "charts": {
      "earningsOverTime": {},
      "occupancyByPodSet": {}
    }
  }
}
```

---

### List Earnings

Get detailed earnings history (60% share from bookings).

```http
GET /investor/earnings
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| podSetId | string | Filter by pod set |
| fromDate | string | From date |
| toDate | string | To date |
| page | number | Page number |
| limit | number | Items per page |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalGross": 75000,
      "totalInvestorShare": 45000,
      "totalNaplooShare": 30000,
      "period": "2026-02-01 to 2026-02-28"
    },
    "earnings": [
      {
        "id": "earn_xxxx",
        "podSetId": "purchase_xxxx",
        "podId": "pod_xxxx",
        "podNumber": "GP-A101",
        "bookingNumber": "NPL20260225001",
        "bookingAmount": 500.00,
        "investorShare": 300.00,
        "naplooShare": 200.00,
        "sharePercent": 60,
        "createdAt": "2026-02-25T17:00:00Z"
      }
    ],
    "pagination": {}
  }
}
```

---

### Request Withdrawal

Request withdrawal of earnings.

```http
POST /investor/withdrawals
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "amount": 30000,
  "paymentMethod": "BANK_TRANSFER"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "id": "wdr_xxxx",
      "amount": 30000,
      "paymentMethod": "BANK_TRANSFER",
      "status": "PENDING",
      "bankDetails": {
        "accountNo": "****9012",
        "ifsc": "HDFC0001234",
        "bankName": "HDFC Bank"
      },
      "estimatedProcessingTime": "2-3 business days",
      "createdAt": "2026-02-25T10:00:00Z"
    },
    "newAvailableBalance": 15000
  }
}
```

---

## 5.12 Associates/Referrals

### Register as Associate

Register to become a Naploo associate.

```http
POST /associate/register
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "fullName": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "+919876543210",
  "referralCode": "NAPLOO-JOHN123",
  "acceptTerms": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | Full name |
| email | string | Yes | Email address |
| phone | string | Yes | Phone number |
| referralCode | string | No | Referring associate's code |
| acceptTerms | boolean | Yes | Accept terms |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "associate": {
      "id": "assoc_xxxx",
      "referralCode": "NAPLOO-AMIT456",
      "tier": "BRONZE",
      "status": "ACTIVE",
      "referredBy": "assoc_yyyy"
    },
    "referralLinks": {
      "hotel": "https://naploo.com/partner?ref=NAPLOO-AMIT456",
      "investor": "https://naploo.com/invest?ref=NAPLOO-AMIT456",
      "customer": "https://naploo.com?ref=NAPLOO-AMIT456",
      "associate": "https://naploo.com/associate?ref=NAPLOO-AMIT456",
      "space": "https://naploo.com/space?ref=NAPLOO-AMIT456"
    }
  }
}
```

---

### Get Referral Links

Get all referral links for the associate.

```http
GET /associate/referral-links
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "referralCode": "NAPLOO-AMIT456",
    "links": {
      "hotel": {
        "url": "https://naploo.com/partner?ref=NAPLOO-AMIT456",
        "shortUrl": "https://npl.co/h/AMIT456",
        "clicks": 145,
        "conversions": 3
      },
      "investor": {
        "url": "https://naploo.com/invest?ref=NAPLOO-AMIT456",
        "shortUrl": "https://npl.co/i/AMIT456",
        "clicks": 89,
        "conversions": 2
      },
      "customer": {
        "url": "https://naploo.com?ref=NAPLOO-AMIT456",
        "shortUrl": "https://npl.co/c/AMIT456",
        "clicks": 523,
        "conversions": 45
      },
      "associate": {
        "url": "https://naploo.com/associate?ref=NAPLOO-AMIT456",
        "shortUrl": "https://npl.co/a/AMIT456",
        "clicks": 67,
        "conversions": 5
      },
      "space": {
        "url": "https://naploo.com/space?ref=NAPLOO-AMIT456",
        "shortUrl": "https://npl.co/s/AMIT456",
        "clicks": 23,
        "conversions": 1
      }
    }
  }
}
```

---

### Get Network (5-Level Tree)

Get the associate's referral network tree.

```http
GET /associate/network
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| maxLevel | number | Max depth (1-5), default 5 |
| type | string | Filter by `hotel`, `investor`, `customer`, `associate`, `space` |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "network": {
      "levels": [
        {
          "level": 1,
          "commissionRate": 10,
          "referrals": [
            {
              "id": "ref_xxxx",
              "name": "Priya Patel",
              "type": "CUSTOMER",
              "joinDate": "2026-01-20T10:00:00Z",
              "totalValue": 15000,
              "yourCommission": 1500,
              "status": "ACTIVE"
            },
            {
              "id": "ref_yyyy",
              "name": "Hotel Sunrise",
              "type": "HOTEL",
              "joinDate": "2026-01-18T10:00:00Z",
              "totalValue": 250000,
              "yourCommission": 25000,
              "status": "ACTIVE"
            }
          ],
          "totalReferrals": 48,
          "totalCommission": 52000
        },
        {
          "level": 2,
          "commissionRate": 5,
          "referrals": ["..."],
          "totalReferrals": 23,
          "totalCommission": 18500
        },
        {
          "level": 3,
          "commissionRate": 3,
          "referrals": ["..."],
          "totalReferrals": 12,
          "totalCommission": 8200
        },
        {
          "level": 4,
          "commissionRate": 2,
          "referrals": ["..."],
          "totalReferrals": 5,
          "totalCommission": 2100
        },
        {
          "level": 5,
          "commissionRate": 1,
          "referrals": ["..."],
          "totalReferrals": 2,
          "totalCommission": 450
        }
      ]
    },
    "summary": {
      "totalNetworkSize": 90,
      "totalCommissionEarned": 81250,
      "activeReferrals": 85
    }
  }
}
```

---

### Get Commissions

Get commission earnings breakdown.

```http
GET /associate/commissions
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| fromDate | string | From date |
| toDate | string | To date |
| type | string | `hotel`, `investor`, `customer`, `associate`, `space` |
| level | number | Filter by level (1-5) |
| page | number | Page number |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "thisMonth": 15000,
      "lastMonth": 12500,
      "allTime": 81250,
      "pendingPayout": 15000,
      "nextPayoutDate": "2026-03-01T00:00:00Z"
    },
    "byType": {
      "hotel": 35000,
      "investor": 20000,
      "customer": 18250,
      "associate": 6000,
      "space": 2000
    },
    "byLevel": {
      "level1": 52000,
      "level2": 18500,
      "level3": 8200,
      "level4": 2100,
      "level5": 450
    },
    "commissions": [
      {
        "id": "comm_xxxx",
        "referralId": "ref_xxxx",
        "referralName": "Priya Patel",
        "type": "CUSTOMER",
        "level": 1,
        "transactionType": "BOOKING",
        "transactionAmount": 1500,
        "commissionRate": 10,
        "commissionAmount": 150,
        "status": "CONFIRMED",
        "createdAt": "2026-02-25T15:00:00Z"
      }
    ],
    "pagination": {}
  }
}
```

---

### Get Dashboard

Get associate dashboard overview.

```http
GET /associate/dashboard
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "associateId": "assoc_xxxx",
      "name": "Amit Sharma",
      "referralCode": "NAPLOO-AMIT456",
      "tier": "SILVER",
      "joinDate": "2026-01-15T10:00:00Z"
    },
    "network": {
      "level1Count": 48,
      "level2Count": 23,
      "level3Count": 12,
      "level4Count": 5,
      "level5Count": 2,
      "totalNetwork": 90
    },
    "earnings": {
      "thisMonth": 15000,
      "lastMonth": 12500,
      "allTime": 81250,
      "pendingPayout": 15000,
      "nextPayoutDate": "2026-03-01T00:00:00Z"
    },
    "referralLinks": {},
    "recentActivity": [
      {
        "id": "act_xxxx",
        "type": "NEW_REFERRAL",
        "description": "New customer joined: Priya Patel",
        "amount": 0,
        "createdAt": "2026-02-25T10:00:00Z"
      },
      {
        "id": "act_yyyy",
        "type": "COMMISSION_EARNED",
        "description": "Commission earned from booking",
        "amount": 150,
        "createdAt": "2026-02-25T15:00:00Z"
      }
    ],
    "charts": {
      "commissionsOverTime": {},
      "networkGrowth": {}
    }
  }
}
```

---

### Request Payout

Request payout of commission earnings.

```http
POST /associate/payouts
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "amount": 10000,
  "paymentMethod": "BANK_TRANSFER"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "payout": {
      "id": "payout_xxxx",
      "amount": 10000,
      "paymentMethod": "BANK_TRANSFER",
      "status": "PENDING",
      "estimatedProcessingTime": "3-5 business days",
      "createdAt": "2026-02-25T10:00:00Z"
    },
    "newPendingBalance": 5000
  }
}
```

---

### Track Referral (Internal)

Track when a referral link is used (called automatically).

```http
POST /associate/referrals/track
```

**Request Body:**
```json
{
  "referralCode": "NAPLOO-AMIT456",
  "type": "CUSTOMER",
  "userId": "usr_xxxx",
  "source": "BOOKING"
}
```

---

## 5.13 Rentals

### Get Rental Options

Get available rental packages for home and office.

```http
GET /rentals/options
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "home": {
      "title": "Naploo Home Pods",
      "description": "Personal sleeping pods for your home",
      "minimumContract": 12,
      "options": [
        {
          "type": "SINGLE_POD",
          "name": "Single Bed Pod",
          "description": "Perfect for individuals",
          "monthlyRent": 5000,
          "setupFee": 10000,
          "securityDeposit": 15000,
          "gst": 18,
          "features": ["Climate Control", "USB Charging", "LED Lighting", "Ventilation"]
        },
        {
          "type": "DOUBLE_POD",
          "name": "Double Bed Pod",
          "description": "Spacious pod for couples",
          "monthlyRent": 8000,
          "setupFee": 15000,
          "securityDeposit": 24000,
          "gst": 18,
          "features": ["Climate Control", "USB Charging", "LED Lighting", "Ventilation", "Extra Space"]
        }
      ],
      "includes": [
        "Free delivery & installation",
        "Monthly maintenance",
        "24x7 support",
        "Free relocation (once per year)"
      ]
    },
    "office": {
      "title": "Naploo Office Nap Rooms",
      "description": "Corporate wellness solutions",
      "minimumContract": 12,
      "packages": [
        {
          "name": "Starter",
          "podCount": 2,
          "maxEmployees": 50,
          "monthlyRent": 15000,
          "setupFee": 25000,
          "securityDeposit": 45000
        },
        {
          "name": "Professional",
          "podCount": 5,
          "maxEmployees": 150,
          "monthlyRent": 35000,
          "setupFee": 50000,
          "securityDeposit": 105000
        },
        {
          "name": "Enterprise",
          "podCount": 10,
          "maxEmployees": 500,
          "monthlyRent": 65000,
          "setupFee": 80000,
          "securityDeposit": 195000
        },
        {
          "name": "Custom",
          "podCount": "Custom",
          "maxEmployees": "Unlimited",
          "monthlyRent": "Contact us",
          "setupFee": "Contact us",
          "securityDeposit": "Contact us"
        }
      ],
      "features": [
        "Dedicated booking system for employees",
        "Usage analytics dashboard",
        "Priority maintenance",
        "Branded pod customization",
        "Employee wellness reports"
      ]
    }
  }
}
```

---

### Request Site Survey

Request a site survey for rental installation.

```http
POST /rentals/request-survey
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "type": "HOME",
  "address": {
    "street": "123 MG Road, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "podType": "SINGLE_POD",
  "podCount": 1,
  "preferredDate": "2026-03-01",
  "preferredTime": "10:00-14:00",
  "contactName": "Rajesh Kumar",
  "contactPhone": "+919876543210",
  "notes": "Ground floor apartment, easy access"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey_xxxx",
      "status": "REQUESTED",
      "scheduledDate": null,
      "message": "We will contact you within 24 hours to confirm survey date."
    }
  }
}
```

---

### Get Survey Status

Get status of requested site survey.

```http
GET /rentals/surveys/:id
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey_xxxx",
      "type": "HOME",
      "address": {},
      "podType": "SINGLE_POD",
      "podCount": 1,
      "status": "SCHEDULED",
      "scheduledDate": "2026-03-01T10:00:00Z",
      "technicianName": "Rahul",
      "technicianPhone": "+919988776655",
      "notes": "Please ensure someone is available at the address"
    }
  }
}
```

---

### Get Quote

Get pricing quote after survey completion.

```http
GET /rentals/quotes/:surveyId
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "quote": {
      "id": "quote_xxxx",
      "surveyId": "survey_xxxx",
      "type": "HOME",
      "podType": "SINGLE_POD",
      "podCount": 1,
      "pricing": {
        "monthlyRent": 5000,
        "setupFee": 10000,
        "securityDeposit": 15000,
        "firstMonthTotal": 30000,
        "gst": 5400,
        "grandTotal": 35400
      },
      "installationDate": "2026-03-10",
      "contractDuration": 12,
      "validUntil": "2026-03-08T23:59:59Z",
      "status": "PENDING_ACCEPTANCE"
    }
  }
}
```

---

### Accept Quote & Create Contract

Accept quote and create rental contract.

```http
POST /rentals/contracts
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "quoteId": "quote_xxxx",
  "acceptTerms": true,
  "paymentMethod": "RAZORPAY"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "contract": {
      "id": "contract_xxxx",
      "quoteId": "quote_xxxx",
      "status": "PAYMENT_PENDING",
      "paymentLink": "https://pay.naploo.com/contract_xxxx"
    }
  }
}
```

---

### Get My Contracts

Get all rental contracts for the user.

```http
GET /rentals/contracts
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "contract_xxxx",
        "type": "HOME",
        "address": {},
        "podType": "SINGLE_POD",
        "podCount": 1,
        "pricing": {
          "monthlyRent": 5000,
          "gst": 900
        },
        "dates": {
          "startDate": "2026-03-10T00:00:00Z",
          "endDate": "2027-03-09T23:59:59Z",
          "nextPaymentDate": "2026-04-10T00:00:00Z"
        },
        "status": "ACTIVE",
        "contractDocUrl": "https://cdn.naploo.com/contracts/contract_xxxx.pdf"
      }
    ]
  }
}
```

---

### Request Maintenance

Request maintenance for rental pods.

```http
POST /rentals/maintenance
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "contractId": "contract_xxxx",
  "issue": "Climate control not working",
  "description": "The AC/heating system in the pod stopped working yesterday",
  "priority": "HIGH",
  "preferredDate": "2026-03-15",
  "preferredTime": "10:00-14:00"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "maintenance": {
      "id": "maint_xxxx",
      "contractId": "contract_xxxx",
      "issue": "Climate control not working",
      "priority": "HIGH",
      "status": "REQUESTED",
      "estimatedResponse": "Within 24 hours",
      "createdAt": "2026-03-14T10:00:00Z"
    }
  }
}
```

---

### Get Maintenance Requests

Get maintenance request history.

```http
GET /rentals/maintenance
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| contractId | string | Filter by contract |
| status | string | `REQUESTED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED` |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "maint_xxxx",
        "contractId": "contract_xxxx",
        "issue": "Climate control not working",
        "description": "...",
        "priority": "HIGH",
        "status": "SCHEDULED",
        "scheduledDate": "2026-03-15T10:00:00Z",
        "technicianName": "Suresh",
        "technicianPhone": "+919988776655",
        "createdAt": "2026-03-14T10:00:00Z"
      }
    ]
  }
}
```

---

### Make Rental Payment

Make monthly rental payment.

```http
POST /rentals/payments
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "contractId": "contract_xxxx",
  "months": 1,
  "paymentMethod": "RAZORPAY"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "rpay_xxxx",
      "contractId": "contract_xxxx",
      "amount": 5900,
      "months": 1,
      "status": "PENDING",
      "paymentLink": "https://pay.naploo.com/rpay_xxxx"
    }
  }
}
```

---

## 5.14 Admin

*Admin endpoints require `ADMIN` or `SUPER_ADMIN` role.*

### Get Dashboard Stats

```http
GET /admin/dashboard
Authorization: Bearer {admin_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "bookings": 145,
      "podBookings": 95,
      "roomBookings": 50,
      "revenue": 425000,
      "newUsers": 28,
      "newPartners": 2,
      "checkIns": 98,
      "checkOuts": 82,
      "cancellations": 8
    },
    "overall": {
      "totalHotels": 156,
      "totalPodLocations": 45,
      "totalPods": 1250,
      "totalRooms": 3500,
      "totalUsers": 25000,
      "totalPartners": 180,
      "totalInvestors": 125,
      "totalBookings": 85000,
      "totalRevenue": 125000000
    },
    "recentBookings": [ ... ],
    "pendingVerifications": {
      "partners": 5,
      "hotels": 8
    },
    "alerts": [
      {
        "type": "PARTNER_VERIFICATION",
        "message": "5 partners pending verification",
        "severity": "INFO"
      }
    ]
  }
}
```

### Manage Partners (Hotel Owners)

```http
# List all partners
GET /admin/partners?status=PENDING_VERIFICATION

# Get partner details
GET /admin/partners/:id

# Verify partner
POST /admin/partners/:id/verify

# Suspend partner
POST /admin/partners/:id/suspend

# Update partner commission
PUT /admin/partners/:id/commission
```

**Verify Partner Request:**
```json
{
  "verified": true,
  "commissionRate": {
    "pods": 40,
    "rooms": 15
  },
  "notes": "All documents verified"
}
```

### Manage Hotels

```http
# List all hotels
GET /admin/hotels?status=PENDING

# Get hotel details
GET /admin/hotels/:id

# Approve hotel
POST /admin/hotels/:id/approve

# Reject hotel
POST /admin/hotels/:id/reject

# Feature hotel
POST /admin/hotels/:id/feature

# Update hotel status
PATCH /admin/hotels/:id/status
```

### Manage Locations (Naploo Pod Centers)

```http
# List all locations
GET /admin/locations

# Create location
POST /admin/locations

# Update location
PUT /admin/locations/:id

# Delete location
DELETE /admin/locations/:id
```

### Manage Pods

```http
# List all pods
GET /admin/pods

# Create pod
POST /admin/pods

# Update pod
PUT /admin/pods/:id

# Change pod status
PATCH /admin/pods/:id/status
```

### Manage Bookings

```http
# List all bookings
GET /admin/bookings

# Get booking details
GET /admin/bookings/:id

# Manual check-in
POST /admin/bookings/:id/check-in

# Manual check-out
POST /admin/bookings/:id/check-out

# Cancel booking
POST /admin/bookings/:id/cancel

# Process refund
POST /admin/bookings/:id/refund
```

### Manage Payouts

```http
# List pending payouts
GET /admin/payouts?status=PENDING

# Process payout
POST /admin/payouts/:id/process

# Bulk process payouts
POST /admin/payouts/bulk-process
```

### Reports

```http
# Revenue report
GET /admin/reports/revenue?from=2024-12-01&to=2024-12-31

# Occupancy report
GET /admin/reports/occupancy?propertyType=HOTEL

# Partner performance report
GET /admin/reports/partners

# User analytics
GET /admin/reports/users

# Commission report
GET /admin/reports/commissions

# Export data
GET /admin/reports/export?type=bookings&format=csv
```

---

## 6. Webhooks

### 6.1 Webhook Events

| Event | Description |
|-------|-------------|
| `booking.created` | New booking created (pod or room) |
| `booking.confirmed` | Booking payment completed |
| `booking.cancelled` | Booking cancelled |
| `booking.checked_in` | Guest checked in |
| `booking.checked_out` | Guest checked out |
| `payment.completed` | Payment successful |
| `payment.failed` | Payment failed |
| `payment.refunded` | Payment refunded |
| `partner.registered` | New partner registration |
| `partner.verified` | Partner verification complete |
| `property.approved` | Hotel/property approved |
| `payout.processed` | Partner/Investor payout processed |
| `review.created` | New review submitted |
| `withdrawal.processed` | Investor withdrawal processed |

### 6.2 Webhook Payload

```json
{
  "event": "booking.confirmed",
  "timestamp": "2024-12-25T10:35:00Z",
  "data": {
    "booking": {
      "id": "bkg_xxxx",
      "bookingNumber": "NPL20241225001",
      "type": "ROOM",
      ...
    }
  },
  "signature": "sha256=xxxx"
}
```

### 6.3 Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

---

## 7. SDKs & Libraries

### 7.1 JavaScript/TypeScript SDK

```bash
npm install @naploo/api-client
```

```typescript
import { NaplooClient } from '@naploo/api-client';

const client = new NaplooClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Unified search for hotels and pods
const results = await client.search({
  city: 'Delhi',
  checkIn: '2024-12-25T14:00:00',
  checkOut: '2024-12-26T11:00:00',
  type: 'ALL' // 'POD', 'ROOM', or 'ALL'
});

// Create room booking
const roomBooking = await client.bookings.create({
  type: 'ROOM',
  hotelId: 'htl_xxxx',
  roomTypeId: 'rtyp_xxxx',
  checkIn: '2024-12-25',
  checkOut: '2024-12-27',
  guests: { adults: 2, children: 0 }
});

// Create pod booking
const podBooking = await client.bookings.create({
  type: 'POD',
  hotelId: 'htl_xxxx',
  podType: 'SINGLE',
  startTime: new Date('2024-12-25T14:00:00'),
  duration: 3
});
```

### 7.2 React Native SDK

```bash
npm install @naploo/react-native
```

```typescript
import { NaplooProvider, useNaploo } from '@naploo/react-native';

// Wrap app with provider
<NaplooProvider apiKey="your_api_key">
  <App />
</NaplooProvider>

// Use hooks in components
function BookingScreen() {
  const { search, createBooking, isLoading } = useNaploo();
  
  // Search for hotels and pods
  const handleSearch = async () => {
    const results = await search({
      city: 'Mumbai',
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      type: 'ALL'
    });
  };
  
  // Create booking
  const handleBook = async () => {
    const booking = await createBooking({
      type: 'ROOM',
      hotelId: 'htl_xxxx',
      roomTypeId: 'rtyp_xxxx',
      checkIn: '2024-12-25',
      checkOut: '2024-12-27'
    });
  };
}
```

### 7.3 Partner SDK

```bash
npm install @naploo/partner-sdk
```

```typescript
import { NaplooPartnerClient } from '@naploo/partner-sdk';

const partner = new NaplooPartnerClient({
  apiKey: 'partner_api_key'
});

// Get dashboard
const dashboard = await partner.dashboard.get();

// List properties
const properties = await partner.properties.list();

// Update room availability
await partner.rooms.updateAvailability('room_xxxx', {
  available: false,
  reason: 'Under maintenance'
});

// Get earnings
const earnings = await partner.earnings.get({
  from: '2024-12-01',
  to: '2024-12-31'
});
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Dec 2024 | Added Hotels, Rooms, Partner APIs. Updated to naploo.com domain. |
| 1.0.0 | Jan 2024 | Initial API release |

---

*For support, contact api-support@naploo.com*
