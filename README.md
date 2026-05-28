BUMarket — Web-Based Marketplace for Bicol University Students

BUMarket is a web-based marketplace platform designed for Bicol University students to buy, sell, and manage products within the university community.

The platform provides a streamlined marketplace experience featuring:

Buyer, Seller, and Admin roles
Product browsing and management
Order and transaction workflow
Notifications system
Context-aware support chatbot
Responsive and user-friendly interface

Built using:

React
TypeScript
Tailwind CSS
Supabase

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
- Browse marketplace products
- Search and category filtering
- Featured and trending product sections
- Combination of seller-uploaded and curated products

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
- Order-related notification system
- Notification read/unread tracking
- Notifications for:
   - order placement
   - order confirmation
   - completed transactions

### Chatbot
- FAQ-based support chatbot
- Context-aware marketplace assistance
- Product and order guidance
- Lightweight local chatbot implementation

### Admin Dashboard
- View users, products, and orders
- Marketplace overview dashboard
- Seller verification badge management

### Future Enhancements (labeled in the UI)
The platform also includes planned enhancements that may be expanded in future versions, such as:

- E-Wallet integration
- Real-time messaging
- Advanced analytics
- Recommendation systems
- Push notifications
- Online payment gateway integration

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

This project was developed as a web-based marketplace platform for Bicol University students.
