# Sidebar parity + Investor Offer workflow — June 8, 2026

## What user flagged
- "Loyalty aur Concierge click karne me koi changes nhi huye sidemenu me na koi new sid emenu aya"
  → Confirmed: 4 module checkboxes in `/partner/portal/settings` had NO matching sidebar pages.
- "admin sid ese hi invesots k liye new premises ka offer jayega than investor premises choose kareng kon kitne pods instal karega aur paymen kkre billing kareng thn agreement start hoga"
  → Built two-sided offer workflow.

## DB tables added (migration `qlo2-migration.sql`)
- `loyalty_programs`, `loyalty_members`, `loyalty_transactions`
- `concierge_requests`
- `spa_services`, `spa_appointments`
- `admin_departments`, `admin_employees`
- `investor_offers`, `investor_offer_responses`

## New partner sidebar pages (4)
| Route | Module gate | Backend |
|---|---|---|
| `/partner/portal/spa` | `spa_services` | `/api/v1/pms/spa/{services,appointments}` |
| `/partner/portal/outlets` | `multi_outlet` | `/api/v1/pms/outlets` |
| `/partner/portal/loyalty` | `loyalty` | `/api/v1/pms/loyalty/{program,members}` |
| `/partner/portal/concierge` | `concierge` | `/api/v1/pms/concierge/requests` |

## Investor leaseback offer workflow

### Admin side (`/admin/offers`)
- Create offer: property name, location, pod set count, price/set, expected yield, delivery default, description
- View responses per offer
- Accept/decline responses
- On accept: auto-increments offer.sets_reserved, sets contract_start/end_date

### Investor side (`/investor/portal/offers`)
- Browse open offers (filtered by KYC status — only approved investors see them)
- Respond with pod-set count + delivery option + notes
- Status badge: pending -> accepted -> declined

### Endpoints
- Admin: `GET/POST/PUT /api/v1/admin/investor-offers`, `GET /investor-offers/:id/responses`, `POST /investor-offer-responses/:id/{accept,decline}`
- Investor: `GET /api/v1/investors/offers`, `GET /offers/:id`, `POST /offers/:id/respond`, `GET /my-offers`

## Admin team management (`/admin/team`)
Naploo internal staff with department hierarchy — separate from partner staff.
- Departments CRUD (`/api/v1/admin/departments`)
- Employees CRUD (`/api/v1/admin/employees`) with role-in-dept (head/manager/member)

## Copilot June 7 work (audited, kept)
- Cashfree payment gateway (live mode) — 5f5bcb0
- Refund + partner settlement ops — 28797b0
- Mobile in-app WebView Cashfree checkout — 1e95721
- Mobile session persistence — dcd6f0c
- Pod pricing mismatch fix — 8c6249c
- Dynamic SEO sitemap — 9cb220b
- 10rs demo pod hotel for e2e — 7f4f23b

## Pending
- Tier-based feature auto-gating (1-star cannot enable Spa/Loyalty)
- Per-tier amenity catalog with property-level + room-level distinction
- Investor mobile app (Task #3)
- First-login wizard (Task #2)
- Mobile partner POS/housekeeping screens
