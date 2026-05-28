# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

BUMarket is a student entrepreneur marketplace (React SPA + Supabase backend). The frontend is served via Vite; the backend is a hosted Supabase instance (auth, database, edge functions) — no local backend setup is required.

### Running the Application

- **Dev server**: `pnpm dev` — starts Vite at http://localhost:5173
- **Build**: `pnpm build` — production build via Vite

### Key Notes

- There is **no ESLint or TypeScript compiler config** (`tsconfig.json`) at the project root. Vite handles TypeScript transpilation directly. There is no `lint` script in `package.json`.
- Supabase credentials (URL and anon key) are **hardcoded** in `src/lib/supabase.ts`, so no `.env` file is needed to run the frontend.
- The app uses **mock data** (`src/app/data/mockProducts.ts`) for product listings, so the marketplace UI renders without live backend connectivity.
- The app includes a "Demo buyer" login option for quick access without creating a real account.
- `react` and `react-dom` are listed as `peerDependencies` (not direct dependencies) in `package.json`, but pnpm resolves them correctly via the lockfile.
- The `@` path alias is configured in `vite.config.ts` to resolve to `./src`.
