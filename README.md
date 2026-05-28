# BUMarket - Student Entrepreneur Marketplace

A web-based marketplace platform for student entrepreneurs, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dual User Roles**: Separate dashboards for Student Buyers and Student Sellers
- **Authentication**: Secure login and registration with Supabase Auth
- **Product Marketplace**: Browse, search, and filter products and services
- **Order Management**: Track orders and reservations
- **E-Wallet**: Digital wallet functionality for transactions
- **Favorites**: Save and manage favorite products
- **Seller Dashboard**: Comprehensive tools for managing products, orders, and analytics

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd BUMarket
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
pnpm dev
```

## Project Structure

```
BUMarket/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main application component
│   │   ├── components/             # React components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpPageBuyer.tsx
│   │   │   ├── SignUpPageSeller.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── SellerDashboard.tsx
│   │   │   └── ...
│   │   └── data/
│   │       └── mockProducts.ts     # Mock product data
│   ├── lib/
│   │   └── supabase.ts            # Supabase client configuration
│   └── styles/                     # Global styles
├── supabase/
│   └── functions/                  # Supabase Edge Functions
└── package.json

```

## Supabase Setup

### Database Tables

1. **profiles** table:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  student_id TEXT,
  role TEXT CHECK (role IN ('buyer', 'seller')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Functions

Deploy the signup Edge Functions:
```bash
supabase functions deploy signup-buyer
supabase functions deploy signup-seller
```

## Design System

- **Primary Color**: Blue (#3B82F6)
- **Typography**: Archivo Black (headers), Archivo (body)
- **Design Style**: Modern, Gen Z-friendly with card-based layouts
- **Responsive**: Mobile and desktop optimized

## Available Departments

- Computer Studies
- Engineering
- Teacher Education
- Technology
- Nursing

## Development Methodology

Built using:
- **Input-Process-Output (IPO) Model**: Clear data flow architecture
- **Rapid Application Development (RAD)**: Iterative prototype-driven development

## License

This project is developed for educational purposes.

## Contributors

Built for university student entrepreneurs.
