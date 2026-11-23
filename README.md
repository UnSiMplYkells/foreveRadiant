# ✨ Forever Radiant — Enterprise Botanical E-Commerce & Analytics Platform

[![React 18](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20RLS-3ecf8e.svg?logo=supabase)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-ff4154.svg?logo=reactquery)](https://tanstack.com/query)
[![Zod](https://img.shields.io/badge/Zod-Schema%20Validation-3068b7.svg?logo=zod)](https://zod.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics%20%26%20Charts-22b5bf.svg)](https://recharts.org/)

**Forever Radiant** is a luxury botanical skincare and wellness e-commerce platform re-engineered from the ground up to meet enterprise standards. It combines an aesthetic storefront experience with high-concurrency inventory locking, role-based access control, dynamic multi-size product pricing, interactive Recharts analytics, and genuine database-driven customer reviews.

---

## 🌿 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Enterprise Features](#-key-enterprise-features)
  - [1. Dynamic Multi-Size & Pricing Variants](#1-dynamic-multi-size--pricing-variants)
  - [2. Concurrency-Safe Inventory (Pessimistic Locking RPC)](#2-concurrency-safe-inventory-pessimistic-locking-rpc)
  - [3. Order Fulfillment Pipeline & Lifecycle](#3-order-fulfillment-pipeline--lifecycle)
  - [4. Executive Admin Analytics & 30-Day RPC Trends (Recharts)](#4-executive-admin-analytics--30-day-rpc-trends-recharts)
  - [5. Inventory Intelligence: Top Sellers & Low Stock Alerts](#5-inventory-intelligence-top-sellers--low-stock-alerts)
  - [6. Genuine Backend Reviews & Ratings](#6-genuine-backend-reviews--ratings)
  - [7. Role-Based Access Control (RBAC) & Context Navigation](#7-role-based-access-control-rbac--context-navigation)
  - [8. Botanical Dark & Light Mode](#8-botanical-dark--light-mode)
  - [9. Strict Schema Validation (Zod DTOs)](#9-strict-schema-validation-zod-dtos)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Application Route Sitemap](#-application-route-sitemap)
- [Local Setup & Getting Started](#-local-setup--getting-started)
- [Demo Credentials](#-demo-credentials)
- [Production Build & Verification](#-production-build--verification)

---

## 🏛️ Architectural Overview

```
                      ┌───────────────────────────────────────────┐
                      │            Forever Radiant Web App        │
                      │           (React 18 / Vite / Router)      │
                      └─────────────────────┬─────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
  │   Storefront Client     │  │   Cart & Order State    │  │     Admin Management    │
  │ • Category Filtering    │  │ • Redux Toolkit (Cart)  │  │ • Product Catalog (CRUD)│
  │ • Size & Price Pills    │  │ • Size Price Resolution │  │ • Variant Configurator  │
  │ • Real Review Feed      │  │ • Checkout Locking RPC  │  │ • Product Insights      │
  │ • Botanical Dark Mode   │  │ • Webhook Idempotency   │  │ • Recharts Reporting    │
  └────────────┬────────────┘  └────────────┬────────────┘  └────────────┬────────────┘
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            ▼
                           ┌──────────────────────────────────┐
                           │      TanStack React Query v5     │
                           │   (Caching, Optimistic Updates)  │
                           └────────────────┬─────────────────┘
                                            ▼
                           ┌──────────────────────────────────┐
                           │        Supabase BaaS / SQL       │
                           ├──────────────────────────────────┤
                           │ • PostgreSQL Database with RLS   │
                           │ • Pessimistic Locking RPCs       │
                           │ • Supabase Auth & JWT Sessions   │
                           │ • Storage Bucket (`products`)    │
                           │ • Edge Functions (Webhooks/Email)│
                           └──────────────────────────────────┘
```

---

## 🚀 Key Enterprise Features

### 1. Dynamic Multi-Size & Pricing Variants
- **Admin Configuration**: When adding or updating products in the Admin portal, administrators can add, edit, or remove multiple size options (e.g., `50ml`, `100ml`, `250ml`, `100g`, `250g`, `500g`) and assign distinct pricing for each variant.
- **Quick Preset Shortcuts**: One-click preset chips allow instant creation of standard volume and weight variants.
- **Storefront Dynamic Pricing**: On the product details page (`FullProductDetails.jsx`), selecting any size pill dynamically recalculates and animates the displayed price.
- **Cart & Checkout Accuracy**: Selected size labels and their custom prices are persisted in the `public.cart` table (`size` and `size_price`) and accurately calculated in the subtotal, order summary, and order history.

### 2. Concurrency-Safe Inventory (Pessimistic Locking RPC)
- High-volume flash sales can cause overselling when multiple shoppers checkout simultaneously.
- To prevent race conditions, the checkout flow triggers the PostgreSQL RPC function `process_order_checkout`.
- Uses `SELECT ... FOR UPDATE` pessimistic row locking:
  ```sql
  SELECT available INTO current_stock
  FROM public.products
  WHERE id = item.product_id
  FOR UPDATE;
  ```
- If stock is insufficient, the transaction immediately rolls back and raises an exception: `"Insufficient stock for product ID: ..."`. Otherwise, it atomically decrements the inventory.

### 3. Order Fulfillment Pipeline & Lifecycle
- **Visual Status Pipeline**: In the Admin Dashboard's Orders table, administrators manage order lifecycles through a defined fulfillment workflow:
  ```
  Pending ➔ Processing ➔ Shipped ➔ Delivered
  ```
- **Dynamic Badge Visual Indicators**:
  - `Pending`: Yellow badge (`#fef9c3` background, `#a16207` text, `#fde047` border).
  - `Processing`: Warm Amber/Orange badge (`#ffedd5` background, `#c2410c` text, `#fdba74` border).
  - `Shipped`: Blue badge (`#e0f2fe` background, `#0369a1` text, `#7dd3fc` border).
  - `Delivered`: Emerald Green badge (`#dcfce7` background, `#15803d` text, `#86efac` border).
- **Two-Way Action Controls**: Each order provides a direct `<select>` dropdown to immediately transition to any state, alongside a 1-click advance pipeline button (`Start Processing ➔`, `Ship Order 🚚`, `Mark Delivered ✓`). All mutations execute through `useUpdateOrderStatus.js` and immediately invalidate React Query caches.

### 4. Executive Admin Analytics & 30-Day RPC Trends (Recharts)
- Accessible directly within the **"Visual Analytics & Reporting"** tab in the Admin Dashboard (`AdminReporting.jsx`).
- **PostgreSQL Server Aggregations (Supabase RPCs)**:
  - `get_admin_kpis()`: Calculates 30-day Total Gross Revenue, Total Orders, and Average Order Value (AOV) directly on PostgreSQL.
  - `get_sales_trends()`: Uses `generate_series` to compute a continuous 30-day timeline of daily revenue and order counts without missing dates.
- **Top Row Styled KPI Cards**:
  - 30-Day Gross Revenue (₦)
  - 30-Day Total Orders Count
  - Average Order Value (AOV)
  - Vault Inventory Units (across all registered SKUs)
  - Low Stock Warning SKUs (&lt; 10 units)
- **Interactive Visualizations**:
  - **30-Day Revenue Trends**: Interactive Recharts `LineChart` with custom currency tooltips, data point dots, and an optional toggle to overlay the daily orders count line.
  - **Category Gross Share**: Interactive `PieChart` / Donut chart showing botanical revenue distribution.
  - **Top 5 Best-Sellers**: Horizontal `BarChart` highlighting the highest revenue-generating products.
  - **Recent Orders Audit Table**: Real-time transaction feed with customer names, timestamps, order amounts, and fulfillment status badges.

### 5. Inventory Intelligence: Top Sellers & Low Stock Alerts
- Accessible via the **"Inventory Intelligence"** button in the Admin header or by clicking **"Insights"** on any product row (`ProductInsightsModal.jsx`):
  - **Top Sellers**: A ranked list (🥇 `#1`, 🥈 `#2`, 🥉 `#3`...) of the most purchased products store-wide, showing total units sold, gross sales revenue, remaining vault stock, and an "Inspect" shortcut.
  - **Low Stock Alerts Warning Block**: A prominent orange/red bordered alert card (`border: 2px solid #ea580c; background: #fff7ed`) identifying any SKU where `available < 10` units, complete with instant 1-click restock action buttons (`+15 Units`, `+30 Units`) that immediately persist to PostgreSQL via `useUpdateProduct`.
  - **SKU Deep Dive**: Variant-level sales charts, rating distribution (5★ to 1★), and genuine customer feedback.

### 5. Genuine Backend Reviews & Ratings
- All star ratings and customer feedback are stored in the PostgreSQL table `public.reviews`.
- **Zero fake/mock data**: Ratings on storefront cards, product pages, and admin insights reflect live database rows.
- Authenticated customers can submit verified reviews with a rating (1-5), review title, and detailed feedback.
- Non-authenticated visitors see existing reviews with an elegant prompt inviting them to log in before leaving a review.

### 6. Role-Based Access Control (RBAC) & Context Navigation
- User profiles in `public.users` include a `role` column (`'customer'` or `'admin'`).
- **Protected Admin Route**: `/admin` is guarded by `ProtectedRoute.jsx`. Non-admin users are denied access and redirected to the home storefront.
- **Context-Aware Navigation**:
  - **Public Visitors**: Home, About Us, Contact Us.
  - **Authenticated Customers**: Home, Collection, Orders (with shopping bag badge and account avatar in top header).
  - **Authenticated Admins**: Quick shortcut to Admin Dashboard in addition to customer views.

### 7. Botanical Dark & Light Mode
- Styled using luxury earthy and botanical tones:
  - Terracotta brown (`#7c2d12` / `#ea580c`)
  - Deep sage & forest greens (`#15803d` / `#3d6734`)
  - Warm amber cream accents (`#fef3c7`)
- Respects system preferences and allows instant 1-click toggling between light and dark modes with persistent local storage.

### 8. Strict Schema Validation (Zod DTOs)
- All forms use **Zod** schemas in `src/Validation/schemas.js` integrated with `react-hook-form`:
  - `productSchema`: Validates name, price, stock, category, description, image URLs, and dynamic size variant arrays.
  - `loginSchema` & `registerSchema`: Validates password complexity, name trimming, and email formatting.
  - `checkoutSchema`: Validates shipping address, phone contact, and zip codes.

---

## 🗄️ Database Schema & Migrations

All schema changes are versioned in `supabase/migrations/`:

| Migration File | Description |
| :--- | :--- |
| `20261123220000_admin_kpi_and_sales_trends_rpc.sql` | PostgreSQL RPCs `get_admin_kpis()` and `get_sales_trends()` for executive 30-day analytics. |
| `20261123210000_product_sizes_and_cart_pricing.sql` | Upgrades `public.cart.size` to `text` and adds `size_price numeric`. |
| `20261123190000_checkout_pessimistic_lock.sql` | PostgreSQL RPC `process_order_checkout` with `SELECT ... FOR UPDATE`. |
| `20261123180000_enterprise_storage_rls.sql` | Storage bucket `products` setup with public read and admin-only upload/delete policies. |
| `20261123160000_user_role_and_profiles.sql` | Adds `role` (`customer` / `admin`) to `public.users` with automated auth signup trigger. |

### Core Database Tables:
1. **`public.products`**: Catalog items with structured JSON sizes `[{"size": "50ml", "price": 5000}, ...]`, category, inventory stock (`available`), and image arrays.
2. **`public.users`**: Profiles linked to Supabase Auth (`auth.users.id`), with `role`, email, and full name.
3. **`public.cart`**: Active customer carts supporting `size` (text) and `size_price` (numeric).
4. **`public.orders`**: Order ledger with total price, fulfillment status, shipping address, contact, and placement date.
5. **`public.order_items`**: Line items with product ID, captured unit price, size variant (`product_size_ml`), and quantity.
6. **`public.reviews`**: Genuine customer star ratings (1-5), review title, description, and author.

---

## 🗺️ Application Route Sitemap

| Route Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Marketing landing page with hero banner, best-sellers, values, and newsletter |
| `/about` | Public | Brand story, botanical sourcing ethics, and artisanal laboratory values |
| `/contact` | Public | Customer concierge contact form and physical boutique location |
| `/privacy-policy` | Public | Data protection, privacy principles, and terms |
| `/collection` | Public / Auth | Full 52-product catalog with server pagination, category filters, and search |
| `/productDetails/:productId` | Public / Auth | High-resolution gallery, size/price variant selection, and live reviews |
| `/login` | Public | Modern authentication portal with login, registration, and 1-click test pills |
| `/cart` | Authenticated | Interactive cart with item quantity adjustments and order subtotaling |
| `/place-order` | Authenticated | Checkout drawer with Paystack payment gateway and pessimistic inventory locking |
| `/orders` | Authenticated | Customer order history with tracking status and itemized sizes |
| `/account` | Authenticated | User account details and logout controls |
| `/admin` | **Admin Only** | Catalog CRUD, size configurator, Product Insights drawer, and Recharts Analytics |

---

## 🛠️ Local Setup & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd forever-radiant
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://dncqfwbhphbhudkwerlt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Credentials

To experience both customer storefront and enterprise admin features, the login page features **1-click autofill test pills**:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@foreverradiant.com` | `Password123!` | Full Admin Dashboard (`/admin`), Product Insights, Size Manager, Reporting Charts, Stock Adjustment |
| **Customer** | `customer@foreverradiant.com` | `Password123!` | Full Storefront, Dynamic Size Selection, Cart, Order History, Customer Reviews |

---

## 📦 Production Build & Verification

To create a production-optimized build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

*Designed and engineered with passion for botanical purity and enterprise software excellence.*
