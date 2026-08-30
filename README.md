# 🛍️ Marketplace MVP — Full-Stack Next.js Platform

An enterprise-grade, multi-role Marketplace MVP built on **Next.js (App Router)**, **PostgreSQL**, **Prisma ORM**, and **JWT authentication with `httpOnly` cookies**.

---

## 🌟 Key Features & Architectural Highlights

1. **Unified Full-Stack Architecture**: Both frontend UI and backend Route Handlers run inside Next.js under `app/api/**`. No CORS setup required; same-origin cookie transport ensures zero token leakage.
2. **Deterministic Order Finite-State Machine**:
   - `pending` → `approved` (Admin only)
   - `pending` → `rejected` (Admin only — triggers automatic inventory stock restoration)
   - `approved` → `completed` (Admin or Listing Seller)
   - Illegal transitions (e.g. `rejected` → `approved` or `completed` → `rejected`) are strictly rejected with HTTP 400.
3. **Atomic Stock & Transaction Safety**:
   - Order placement executes inside a `prisma.$transaction` ensuring race conditions cannot cause inventory overselling.
   - Price calculation is strictly performed **server-side** (`listing.price * quantity`); client-sent totals are never trusted.
4. **Strict RBAC & Layered Architecture**:
   - Route handlers are ultra-thin: Validate payload with `Zod` → Call `lib/services/*` → Return `NextResponse.json()`.
   - `lib/rbac.js` centralizes permissions (`requireRole`) across all endpoints.
   - `middleware.js` guards frontend page routes based on verified JWT role cookies.
5. **Robust Error Handling**:
   - Centralized `wrapHandler` catches domain errors (`NotFoundError`, `ForbiddenError`, `InsufficientStockError`, `InvalidTransitionError`, `ValidationError`) and maps them to standard HTTP status codes.

---

## 🗄️ Database Schema & Relationships

```mermaid
erDiagram
    User ||--o{ Listing : "publishes (Seller)"
    User ||--o{ Order : "places (Buyer)"
    Listing ||--o{ Order : "contains"

    User {
        string id PK
        string name
        string email UK
        string hashedPassword
        enum role "buyer | seller | admin"
        datetime createdAt
    }

    Listing {
        string id PK
        string sellerId FK
        string title
        string description
        decimal price
        int quantityAvailable
        boolean isActive
        datetime createdAt
    }

    Order {
        string id PK
        string buyerId FK
        string listingId FK
        int quantity
        decimal totalPrice
        enum status "pending | approved | rejected | completed"
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🔄 Order Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> pending : Buyer Places Order (Atomic Stock Decrement)
    
    pending --> approved : Admin Approves
    pending --> rejected : Admin Rejects (Auto Stock Restoration)
    
    approved --> completed : Admin or Listing Seller Fulfills
    
    rejected --> [*] : Terminal State
    completed --> [*] : Terminal State
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0+ or v20+
- **PostgreSQL**: Running on port `5432` (or via Docker Compose)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` matches your local Postgres credentials:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/marketplace_db?schema=public"
JWT_SECRET="super-secret-jwt-key-for-marketplace-mvp-must-be-at-least-32-chars-long"
NODE_ENV="development"
PORT=3000
```

### 3. Start PostgreSQL (Docker or Local)
If using Docker:
```bash
docker compose up -d
```

### 4. Install Dependencies, Migrate & Seed
```bash
npm install
npx prisma db push
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-seeded Accounts & Credentials

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@marketplace.local` | `AdminPassword123!` | Manages orders, reviews queues, approves/rejects transactions |
| **Seller** | `seller@marketplace.local` | `SellerPassword123!` | Product inventory owner, stock management, order fulfillment |
| **Buyer** | `buyer@marketplace.local` | `BuyerPassword123!` | Real-time marketplace browsing, order placement, order tracking |

*(Note: The login page includes convenient **1-Click Demo buttons** to sign in instantly with any persona).*

---

## 📡 API Reference

### Authentication (`/api/auth/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new `buyer` or `seller` (Admin registration is strictly blocked) |
| `POST` | `/api/auth/login` | Public | Validates credentials, returns JWT in `httpOnly` cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clears `auth_token` cookie |
| `GET` | `/api/users/me` | Authenticated | Fetches current user profile and role |

### Listings (`/api/listings/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/listings` | Public | Get active listings (supports `?isActive=true&search=...`) |
| `POST` | `/api/listings` | `seller` | Create a new listing |
| `GET` | `/api/listings/[id]` | Public | Get details of a single listing |
| `PUT` | `/api/listings/[id]` | `seller` (Owner) | Update listing (Ownership checked: 403 on foreign edit) |
| `DELETE` | `/api/listings/[id]` | `seller` (Owner) | Soft-delete listing (`isActive = false`) |

### Orders & State Transitions (`/api/orders/*`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | `buyer` | Place order (Atomic transaction stock check & decrement) |
| `GET` | `/api/orders/me` | `buyer` / `seller` | View user's own orders |
| `GET` | `/api/orders` | `admin` | List all platform orders (supports `?status=...`) |
| `PATCH` | `/api/orders/[id]/approve` | `admin` | Transition: `pending` → `approved` |
| `PATCH` | `/api/orders/[id]/reject` | `admin` | Transition: `pending` → `rejected` (Restores stock) |
| `PATCH` | `/api/orders/[id]/complete` | `admin` / `seller` | Transition: `approved` → `completed` |

---

## 🧪 Automated API Integration Testing

Run the automated test suite against the running server:
```bash
npm run test:api
```
The test runner validates:
1. Registration & login authentication flow
2. Admin self-registration rejection
3. Unauthorized access (401/403)
4. Seller listing ownership checks (403 on editing another merchant's product)
5. Atomic stock reduction & price validation
6. Insufficient stock rejections
7. State machine transitions & invalid transition rejections
8. Inventory refund on order rejection

---

## 📦 Postman Collection
Import [`postman_collection.json`](file:///c:/Users/Asus/Desktop/MVP/postman_collection.json) directly into Postman, Insomnia, or Thunder Client for ready-to-run API testing.
