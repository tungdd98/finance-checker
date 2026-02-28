# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build (TypeScript + lint checks)
npm run lint     # ESLint check
```

To add shadcn/ui components:
```bash
npx shadcn@latest add <component>
```

## Architecture

**Family Finance Command Center** — Vietnamese-language finance tracker for two users (husband/wife). Uses VND currency and vi-VN locale throughout.

### Request Flow

1. `src/proxy.ts` — Auth gate (exports `proxy`, not `middleware`). Redirects unauthenticated requests to `/login`, authenticated users away from `/login`.
2. Route groups: `(auth)` for public pages, `(dashboard)` for protected pages.
3. Dashboard layout (`src/app/(dashboard)/layout.tsx`) is a **client component** that manages the FAB + AddTransactionDialog open state.

### Data Layer

All data fetching goes through TanStack Query hooks in `src/hooks/`. Each hook file exports `use<Entity>` (read) and `useCreate/Update/Delete<Entity>` (mutations). Mutations always invalidate relevant query keys on success.

**Query key conventions:**
- `['transactions', filters]`
- `['assets']`
- `['goals']`
- `['dashboard-stats', 'cashflow', 'yyyy-MM']`
- `['dashboard-stats', 'pinned-goal']`
- `['dashboard-stats', 'total-assets']`

Supabase clients: browser → `src/lib/supabase/client.ts`, server → `src/lib/supabase/server.ts`. Always use the browser client in hooks and client components.

**Soft delete pattern:** `transactions` and `assets` use `deleted_at` timestamp; all queries filter with `.is('deleted_at', null)`. Goals use hard delete.

### UI Patterns

- **Mobile:** Bottom nav (`BottomNav`) + floating action button (`Fab`) for adding transactions
- **Desktop (md+):** Sidebar (`Sidebar`) with 60px left padding on main content
- **Dialog vs Drawer:** Detect viewport with `useIsMobile` hook; use Dialog on desktop, Drawer (vaul) on mobile
- **Theme hydration:** Always use `resolvedTheme` + a `mounted` state guard when rendering theme-dependent UI (never use `theme` directly for conditional rendering)

### Formatting

Currency: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
Dates: `date-fns` with `vi` locale

### Type System

All TypeScript types are centralized in `src/types/database.ts`. Key enums:
- `TransactionType`: `'income' | 'expense' | 'investment' | 'transfer'`
- `AssetType`: `'savings' | 'gold' | 'stock' | 'etf' | 'real_estate' | 'cash' | 'other'`

### Database

Schema in `supabase/schema.sql`. Run in Supabase SQL Editor to initialize. RLS is enabled with a single policy granting all authenticated users full access (single-family app). Users are created manually via Supabase Auth dashboard.

Goal progress = `totalAssets / goal.target_amount × 100` — goals have no dedicated savings column; progress is derived from total portfolio value.

### shadcn/ui Config

Style: New York, base color: Neutral, CSS variables enabled. Path alias `@/components/ui` for all UI primitives.
