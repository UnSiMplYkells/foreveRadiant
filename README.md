# Forever Radiant (v2.0)

Full-stack botanical skincare and haircare e-commerce platform built with React, Vite, Supabase (PostgreSQL, Auth, Storage, RPCs, Edge Functions), TanStack Query, Redux Toolkit, Recharts, Zod, and Flutterwave.

**Live Storefront:** [https://foreveradiant.netlify.app/home](https://foreveradiant.netlify.app/home)  
**Repository:** [https://github.com/UnSiMplYkells/foreveRadiant](https://github.com/UnSiMplYkells/foreveRadiant)

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Core Engineering Features](#core-engineering-features)
- [Database Schema & Migrations](#database-schema--migrations)
- [Application Routes](#application-routes)
- [Local Setup](#local-setup)
- [Demo Accounts](#demo-accounts)
- [Scripts & Verification](#scripts--verification)

---

## Architectural Overview

```
                     ┌───────────────────────────────────────────┐
                     │          Forever Radiant Web App          │
                     │     React 18 · Vite 6 · React Router 7    │
                     └─────────────────────┬─────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│ Storefront Client    │        │ Cart & Checkout      │        │ Admin Suite (/admin) │
│ • Catalog Pagination │        │ • Redux Cart Slice   │        │ • Product & Size CRUD│
│ • Size/Price Variants│        │ • Promo Code RPC     │        │ • Order Guardrails   │
│ • Verified Reviews   │        │ • Flutterwave Pay    │        │ • Promo Campaigns    │
│ • Portal Mobile Nav  │        │ • Locking RPC        │        │ • Recharts Analytics │
└──────────┬───────────┘        └──────────┬───────────┘        └──────────┬───────────┘
           └───────────────────────────────┼───────────────────────────────┘
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │         TanStack React Query v5           │
                     │       Cache Management & Mutations        │
                     └─────────────────────┬─────────────────────┘
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │        Supabase (PostgreSQL + BaaS)       │
                     │ • Row-Level Security (RLS) & is_admin()   │
                     │ • Security-Definer RPCs & Triggers        │
                     │ • Supabase Auth (Email & OAuth)           │
                     │ • Storage Buckets & Edge Functions        │
                     └───────────────────────────────────────────┘
```

---

## Core Engineering Features

### 1. Concurrency-Safe Checkout (`FOR UPDATE` Row Locking)
- Checkout executes the PostgreSQL `SECURITY DEFINER` RPC `process_order_checkout(p_order_id, p_items)` rather than mutating stock from the browser.
- Inventory rows in `public.products` are locked sequentially with `SELECT ... FOR UPDATE`, rejecting orders with insufficient stock before committing and rolling back atomically on failure.

### 2. Decoupled Payment Verification & Order Fulfillment
- Payment state (`is_paid`, `payment_status`, `paid_at`, `payment_method`) is stored separately from fulfillment `status` (`pending` → `processing` → `shipped` → `delivered`) so advancing delivery stages never overwrites payment history.
- Both frontend controls (`AdminOrders.jsx`, `apiOrder.js`) and PostgreSQL triggers (`trg_check_order_payment_before_fulfillment`) block transitioning unpaid orders to `shipped` or `delivered`.
- Customer checkout (`Orders.jsx`) integrates `flutterwave-react-v3` and checks `is_paid` / `payment_status` independently of delivery status.

### 3. Promo Code Engine (Manual & Time-Based)
- Storefront cart totals (`CartTotals.jsx`) validate promo codes via `validate_promo_code(p_code)` and atomically increment redemptions via `redeem_promo_code(p_code)`, persisting `promo_code` and `discount_amount` onto `public.orders`.
- Administrators manage campaigns from `/admin/promos` (`AdminPromos.jsx`), supporting both **manual codes** (active until toggled off, such as `RADIANT15`) and **time-based codes** (auto-expiring at a configured timestamp), alongside optional usage caps.

### 4. Verified-Buyer Review Gating
- Product reviews in `public.reviews` are restricted to customers who actually purchased the product.
- Enforced at both the UI layer (`Reviews.jsx`, `apiReviews.js`) and database layer via `has_user_purchased_product(user_id, product_id)` and the `BEFORE INSERT` trigger `trg_check_review_verified_buyer`.

### 5. Role-Protected Multi-Page Admin Portal
- Guarded by `AdminRoute.jsx` (`public.users.role = 'admin'` checked via `is_admin()` RLS helper) across dedicated nested routes:
  - `/admin`: Store overview metrics, low-stock notices, and recent order activity.
  - `/admin/products`: Catalog CRUD, storage image uploads, multi-size pricing variants (`50ml`, `100ml`, `250ml`, etc.), and per-SKU insight modals (`ProductInsightsModal.jsx`).
  - `/admin/orders`: Filterable fulfillment pipeline with manual payment verification and unpaid shipping locks.
  - `/admin/analytics`: 30-day revenue trends, top-yielding products, and category distribution rendered with **Recharts** via `get_admin_kpis()` and `get_sales_trends()` RPCs.
  - `/admin/promos`: Issue, schedule, pause, or edit storewide discount codes.
  - `/admin/profile`: Admin account details and password update view.

### 6. Validation, Responsive Navigation & Theming
- **Runtime DTO Validation:** Product payloads, registration/login forms, checkout delivery fields, reviews, and promo code definitions are validated with **Zod** (`src/Validation/schemas.js`).
- **Portal Mobile Navigation:** `MobileDrawer.jsx` renders via `createPortal(..., document.body)` so sticky header `backdrop-filter` stacking contexts never clip mobile overlays.
- **Light & Dark Mode:** CSS custom property theme tokens managed in `DarkModeContext.jsx` and `GlobalStyles.js`.

---

## Database Schema & Migrations

SQL migrations are located in `supabase/migrations/`:

| Migration File | Purpose |
| :--- | :--- |
| `20261123000001_roles_and_profiles.sql` | Adds `role` (`customer`/`admin`), `is_admin()` helper, auth signup trigger, and RLS policies on `public.users` |
| `20261123000002_concurrency_safe_inventory_rpc.sql` | Adds `process_order_checkout` RPC with `SELECT ... FOR UPDATE` row-level locking |
| `20261123000003_storage_buckets.sql` | Configures `products` Supabase Storage bucket & access policies |
| `20261123000004_payment_webhooks_and_idempotency.sql` | Adds `payment_events` tracking for webhook idempotency |
| `20261123000005_order_email_trigger.sql` | Order notification trigger wiring |
| `20261123173000_reviews_system.sql` | Creates `public.reviews` schema and RLS policies |
| `20261123180000_fix_users_trigger.sql` | Auth profile sync adjustments |
| `20261123210000_product_sizes_and_cart_pricing.sql` | Adds multi-size pricing support (`size` text, `size_price numeric`) on `public.cart` |
| `20261123220000_admin_kpi_and_sales_trends_rpc.sql` | Adds `get_admin_kpis()` and `get_sales_trends()` analytics RPCs |
| `20261123230000_enforce_order_payment_fulfillment_locks.sql` | Adds `is_paid`, `payment_method`, `paid_at` and trigger locking unpaid fulfillment |
| `20261124000000_verified_purchaser_reviews.sql` | Adds `has_user_purchased_product` RPC and verified-buyer insert trigger |
| `20261127000001_promo_codes_system.sql` | Creates `promo_codes` table, `validate_promo_code` / `redeem_promo_code` RPCs, order promo columns, and seeds `RADIANT15` |

---

## Application Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `/home` | Public | Storefront landing page, featured products, promo banner (`RADIANT15`), and footer contact anchor (`#contact`) |
| `/collection` | Public | Paginated catalog with category filtering |
| `/productDetails/:productId` | Public | Product gallery, dynamic size/volume pricing, stock count, and verified customer reviews |
| `/about` | Public | Brand overview and formulation principles |
| `/privacyPolicy` (`/privacy-policy`) | Public | Privacy policy and terms |
| `/login` / `/signup` | Public | Email/password & OAuth login/registration with Zod validation and demo quick-fill buttons |
| `/cart` | Authenticated | Cart management, item selection, promo code entry, and total calculation |
| `/place-order` | Authenticated | Order summary, delivery address selection, and checkout submission |
| `/order` (`/orders` redirects) | Authenticated | Customer order history with separate payment and fulfillment statuses plus Flutterwave payment |
| `/account` | Authenticated | Customer profile details, password update, and order link |
| `/admin` | Admin Only | Admin overview dashboard |
| `/admin/products` | Admin Only | Product & variant management + SKU insights |
| `/admin/orders` | Admin Only | Order verification & fulfillment pipeline |
| `/admin/analytics` | Admin Only | Recharts revenue, order trend, category share, and top-product charts |
| `/admin/promos` | Admin Only | Issue and manage manual or time-limited promo codes |
| `/admin/profile` | Admin Only | Administrator account and security settings |

---

## Local Setup

### Prerequisites
- Node.js v18+ and npm

### 1. Install Dependencies
```bash
git clone https://github.com/UnSiMplYkells/foreveRadiant.git
cd foreveRadiant
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and supply your values:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key
VITE_SUPABASE_API_URL=https://your-project-ref.supabase.co/rest/v1
VITE_SUPABASE_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1/object/public/avatars
VITE_FLUTTERWAVE_KEY=FLWPUBK_TEST-your-flutterwave-public-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

---

## Demo Accounts

One-click quick-fill buttons are available on `/login` for testing both roles:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foreverradiant.com` | `Password123!` | Access to `/admin/*` (products, orders, promos, analytics) and storefront |
| **Customer** | `customer@foreverradiant.com` | `Password123!` | Cart, promo codes, checkout, order history, and verified reviews |

---

## Scripts & Verification

```bash
npm run dev      # Start Vite development server
npm run lint     # Run ESLint across the codebase
npm run build    # Build production bundle to dist/
npm run preview  # Preview production bundle locally
```
