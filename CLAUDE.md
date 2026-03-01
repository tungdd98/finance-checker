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

## BMAD Workflow Rules

This project uses the BMAD method. When receiving implementation requests, follow the decision tree below — **do not implement directly** without going through the appropriate BMAD workflow.

### Decision Tree

```
New request received
       │
       ├─ Bug fix or typo? ──────────────────────────► Implement directly (no BMAD needed)
       │
       ├─ Small change / simple feature               ► /bmad-bmm-quick-spec → review → /bmad-bmm-quick-dev
       │   (≤ 3 files, follows existing patterns)
       │
       └─ Medium/large feature or multi-file change  ► /bmad-bmm-create-story → /bmad-bmm-dev-story
           (new behavior, architecture impact)                                        │
                                                                          /bmad-bmm-code-review
```

### When to Use Each Workflow

| Scenario                                             | Workflow                                         | Agent                          |
| ---------------------------------------------------- | ------------------------------------------------ | ------------------------------ |
| Quick one-off task, small addition, brownfield tweak | `/bmad-bmm-quick-spec` → `/bmad-bmm-quick-dev`   | 🚀 Barry (Quick Flow Solo Dev) |
| Feature tracked in sprint plan                       | `/bmad-bmm-create-story` → `/bmad-bmm-dev-story` | 🏃 Bob → 💻 Amelia             |
| Post-implementation quality check                    | `/bmad-bmm-code-review`                          | 💻 Amelia                      |
| Sprint overview or next story guidance               | `/bmad-bmm-sprint-status`                        | 🏃 Bob                         |
| Significant pivot or scope change                    | `/bmad-bmm-correct-course`                       | 🏃 Bob                         |

### Rules

- **Never implement directly** when the request touches > 3 files or introduces new behavior.
- **Always use a fresh context window** for each BMAD workflow invocation.
- **Quick Spec must be reviewed and approved** by the user before Quick Dev begins.
- **Story files are the source of truth** for Dev Story — do not deviate from the spec without user approval.
- For **validation workflows** (Validate PRD, Code Review), prefer running in a separate high-quality LLM session if available.
