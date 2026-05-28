# BUMarket — Capstone Demo Marketplace

A presentation-ready, student-entrepreneur marketplace built for academic
evaluation. Designed for **stability**, **smooth demo flow**, and **working
CRUD** — not for production.

- **Buyer**, **Seller**, and a hidden **Admin** role
- Authentication, marketplace browsing, product CRUD, order workflow
- Database-backed notifications + a context-aware FAQ chatbot
- Built with **React + TypeScript + Tailwind CSS + Supabase**

---

## 1. Quick Start (Local Demo)

```bash
pnpm install
pnpm dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

> The Supabase URL & anon key default to a demo project. If you want to use
> your own Supabase project, see **Section 3**.

### Demo accounts (password `bumarket123`)

| Role      | Email                  |
| --------- | ---------------------- |
| Buyer     | `buyer@bumarket.com`   |
| Seller    | `seller@bumarket.com`  |
| Admin     | `admin@bumarket.com`   |

The admin role is **not** exposed in the role selector. Sign in with the
admin email to access the admin dashboard.

---

## 2. Production Build

```bash
pnpm build
```

Outputs to `dist/`. Deploy to Vercel, Netlify, or any static host. There is no
custom backend — Supabase handles auth, database, and storage.

---

## 3. Supabase Setup

### Step 1 — Create a project

Go to [supabase.com](https://supabase.com) and create a new project. Once it
finishes provisioning, grab the **Project URL** and **anon public key** from
*Settings → API*.

### Step 2 — Provide credentials to the app

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> If you leave `.env` empty, the app falls back to the shared demo project
> bundled in `src/lib/supabase.ts`.

### Step 3 — Apply the database schema

Open *SQL Editor* in the Supabase dashboard and paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), then click **Run**.

The script creates:

- `profiles`, `products`, `orders`, `notifications` tables
- Simplified Row Level Security policies (buyers can buy, sellers can manage
  their own products, everyone can read profiles + products)
- A trigger that auto-creates a `profiles` row whenever a new auth user is
  created (so registration "just works")
- A public **`products`** storage bucket for seller image uploads
- Demo seed products (linked to the seller demo account)

### Step 4 — Create demo accounts

In *Authentication → Users* click **Add user** and create:

| Email                  | Password      | Auto-confirm |
| ---------------------- | ------------- | ------------ |
| `buyer@bumarket.com`   | `bumarket123` | ✅ Yes       |
| `seller@bumarket.com`  | `bumarket123` | ✅ Yes       |
| `admin@bumarket.com`   | `bumarket123` | ✅ Yes       |

After creating the accounts, re-run the `DEMO PROFILE BACKFILL` block in
`supabase/schema.sql` (it's idempotent) so the role/full_name fields are
correct. The script also seeds 4 demo products attached to the seller.

That's it — the app is now wired to your Supabase project.

---

## 4. Features Overview

### Authentication
- Single login page (admin role hidden from the role selector)
- Public buyer / seller registration with simplified flow (no OTP / 2FA)
- Session persistence via Supabase Auth
- Role detected from `profiles` table, automatic dashboard routing

### Marketplace
- Mixed feed of real seller products + curated mock products
- Search, category filters, price/condition/rating filters
- Featured + trending sections on the buyer home

### Product Management (Seller)
- Full CRUD via Supabase (`products` table)
- Image upload to Supabase Storage (or paste an image URL)
- Listings appear immediately — no admin approval

### Orders
- **Buy Now** or **Cash on Pickup** payment methods
- Order statuses: `pending` → `confirmed` → `completed`
- Sellers manually confirm orders from their dashboard
- Buyers can mark a confirmed order as received

### Notifications
- Database-backed (`notifications` table) — no realtime, no push
- Order placed / confirmed / completed events automatically generate
  notifications for both parties
- Click a notification to mark it read

### Chatbot
- Keyword-based FAQ chatbot (BUBot)
- Context-aware tips for the page you're currently on
- No external AI calls — fully local

### Admin Dashboard
- View users, products, and orders
- Visual-only "verified" badge — admins do not block user access

### Future Enhancements (labeled in the UI)
- Real-time messaging, push notifications, real payment gateway, refunds,
  advanced analytics, recommendation engine, and the E-Wallet (top-up,
  transfers, balances) are all marked **Coming Soon / Future Enhancement**.

---

## 5. Project Structure

```
BUMarket/
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Root component + auth-aware routing
│   │   ├── context/AuthContext.tsx  # useAuth() hook
│   │   ├── components/              # All UI components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   ├── BuyerLayout.tsx + BuyerHome.tsx
│   │   │   ├── SellerDashboard.tsx + SellerInventory.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Marketplace.tsx + ProductCard.tsx + ProductDetails.tsx
│   │   │   ├── MyOrders.tsx + NotificationsPanel.tsx
│   │   │   ├── BuyNowModal.tsx
│   │   │   ├── AIChatbot.tsx
│   │   │   ├── EWallet.tsx          # "Coming Soon" placeholder
│   │   │   └── ...
│   │   └── data/
│   │       ├── mockProducts.ts      # Static mock catalog for demo polish
│   │       ├── productFeed.ts       # DB ↔ UI product adapter
│   │       └── useProducts.ts       # Hook merging DB + mock products
│   ├── lib/
│   │   ├── supabase.ts              # Env-driven Supabase client
│   │   └── db.ts                    # Data layer (CRUD helpers)
│   ├── pages/AuthCallback.tsx
│   └── styles/
├── supabase/
│   └── schema.sql                   # ⭐ Paste me into the Supabase SQL editor
├── .env.example
└── package.json
```

---

## 6. Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Backend / Data**: Supabase (Auth, Postgres, Storage)
- **Icons**: lucide-react
- **Charts**: recharts (admin overview only)

---

## 7. Deployment Notes

- The app is a pure static SPA — drop the `dist/` folder onto Vercel,
  Netlify, GitHub Pages, etc.
- Configure the host with the same `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` environment variables as your local `.env`.
- In Supabase, under *Authentication → URL Configuration*, add your
  deployed origin (e.g. `https://bumarket.vercel.app`) to the allowed list
  and to the redirect URLs (`/auth/callback`).

---

## 8. License

Built for academic evaluation. Not intended for production use.
