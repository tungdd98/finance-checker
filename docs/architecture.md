# Kiến trúc kỹ thuật — Family Finance Command Center

**Ngày tạo:** 2026-02-28
**Pattern:** Next.js App Router + Supabase BaaS
**Loại:** Web Monolith

---

## Executive Summary

Family Finance Command Center là ứng dụng Next.js 16 fullstack dùng Supabase làm backend-as-a-service. Toàn bộ logic nghiệp vụ nằm ở client (React hooks + TanStack Query), không có custom API routes. Auth được xử lý bởi Supabase Auth + middleware proxy. UI responsive: Sidebar trên desktop, Bottom Nav + FAB trên mobile.

---

## Request Flow

```
Browser Request
    ↓
src/proxy.ts (Auth Gate)
    ├── Chưa đăng nhập + không phải /login → Redirect /login
    ├── Đã đăng nhập + đang ở /login → Redirect /
    └── Pass through
    ↓
Next.js App Router
    ├── (auth)/login/page.tsx      [Public]
    └── (dashboard)/layout.tsx     [Protected]
          ├── Sidebar (desktop)
          ├── BottomNav (mobile)
          ├── FAB + AddTransactionDialog
          └── {children} (page content)
    ↓
React Component
    ↓
TanStack Query Hook (src/hooks/)
    ↓
Supabase Client SDK (src/lib/supabase/client.ts)
    ↓
Supabase (PostgreSQL + RLS)
```

---

## Cấu trúc thư mục nguồn

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (ThemeProvider + QueryProvider)
│   ├── globals.css             # Global styles (Tailwind CSS v4)
│   ├── (auth)/
│   │   └── login/page.tsx      # Trang đăng nhập (Client Component)
│   └── (dashboard)/
│       ├── layout.tsx          # Dashboard shell (Sidebar + BottomNav + FAB)
│       ├── page.tsx            # Dashboard tổng quan
│       ├── transactions/page.tsx
│       ├── assets/page.tsx
│       ├── goals/page.tsx
│       └── settings/market-prices/page.tsx
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog...)
│   ├── layout/                 # sidebar.tsx, bottom-nav.tsx, fab.tsx
│   ├── dashboard/              # cashflow-card, goal-progress-card, assets-summary-card
│   ├── transactions/           # transaction-form, transaction-list, add-transaction-dialog
│   ├── assets/                 # asset-holdings-list
│   ├── goals/                  # goal-form, goal-list, add-goal-dialog
│   ├── settings/               # market-price-form-dialog
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── query-provider.tsx      # TanStack Query wrapper
│
├── hooks/                      # TanStack Query data hooks
│   ├── use-transactions.ts     # CRUD giao dịch
│   ├── use-asset-holdings.ts   # Danh mục đầu tư (enriched với P&L)
│   ├── use-dashboard-stats.ts  # Cashflow, pinned goal, total assets
│   ├── use-goals.ts            # CRUD mục tiêu
│   ├── use-categories.ts       # Danh mục giao dịch
│   ├── use-market-prices.ts    # Giá thị trường
│   ├── use-cash-balance.ts     # Số dư tiền mặt
│   └── use-opening-balance.ts  # Số dư đầu kỳ
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient (dùng trong hooks/components)
│   │   └── server.ts           # createServerClient (dùng trong Server Components)
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
│
├── types/
│   └── database.ts             # Tất cả TypeScript types (source of truth)
│
└── proxy.ts                    # Auth middleware (export `proxy`, KHÔNG phải `middleware`)
```

---

## Layer Architecture

### 1. Presentation Layer (`src/app/`, `src/components/`)

- **Server Components mặc định** — Next.js App Router
- **Client Components** được đánh dấu `'use client'` khi cần state/hooks
- **Dashboard layout** là Client Component (quản lý FAB + Dialog open state)
- **shadcn/ui** cung cấp UI primitives (button, card, dialog, drawer, form...)

### 2. Data Access Layer (`src/hooks/`)

- **TanStack Query** quản lý toàn bộ server state
- Mỗi hook file export: `use<Entity>` (read) + `useCreate/Update/Delete<Entity>` (mutations)
- Mutations luôn invalidate relevant query keys khi success
- **Không có custom API routes** — gọi Supabase trực tiếp từ client

### 3. Infrastructure Layer (`src/lib/supabase/`)

- **Browser client**: dùng trong hooks + client components
- **Server client**: dùng trong server components + proxy
- Supabase xử lý: Auth, Database, RLS, Real-time (chưa dùng)

---

## UI/UX Patterns

### Responsive Navigation

| Viewport         | Navigation                                         |
| ---------------- | -------------------------------------------------- |
| Mobile (`< md`)  | Bottom Nav (5 tabs) + FAB (thêm giao dịch)         |
| Desktop (`≥ md`) | Sidebar trái (60px left padding trên main content) |

### Dialog vs Drawer Pattern

```typescript
const isMobile = useIsMobile() // resize listener
// Mobile → Drawer (vaul) — slide up from bottom
// Desktop → Dialog (shadcn/ui) — center modal
```

### Theme Hydration (Anti-flash)

```typescript
// ĐÚNG — luôn dùng pattern này
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const { resolvedTheme } = useTheme()
// Render: mounted && resolvedTheme === 'dark' ? ... : ...

// SAI — gây hydration mismatch
const { theme } = useTheme() // KHÔNG dùng trực tiếp
```

---

## State Management

### Server State (TanStack Query)

- **Cache keys:**
  ```
  ['transactions', filters]
  ['asset-holdings']
  ['cash-balance']
  ['dashboard-stats', 'cashflow', 'yyyy-MM']
  ['dashboard-stats', 'pinned-goal']
  ['dashboard-stats', 'total-assets']
  ['goals']
  ['categories']
  ['market-prices']
  ```
- Mutations invalidate: `useCreateTransaction` invalidates `transactions`, `asset-holdings`, `cash-balance`, `dashboard-stats`

### Local State (React useState)

- Dialog/Drawer open state (trong Dashboard layout)
- Form state (react-hook-form)
- Month filter (transactions page)

---

## Auth & Security

### Authentication

- **Supabase Auth** — email/password
- Users tạo thủ công qua Supabase Auth dashboard (single-family app)
- Session lưu trong cookies (managed by Supabase SSR)

### Authorization

- **Row Level Security (RLS)** — bật trên tất cả tables
- Policy: `Authenticated users full access` — tất cả authenticated users có full access
- Phù hợp với single-family model (2 users dùng chung data)

### Proxy/Middleware

```typescript
// src/proxy.ts — KHÔNG phải middleware.ts
export async function proxy(request: NextRequest) { ... }
// Redirect unauthenticated → /login
// Redirect authenticated từ /login → /
```

---

## Formatting & Locale

```typescript
// Currency (VND)
new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// Date
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
format(date, 'dd/MM/yyyy', { locale: vi })
```

---

## CI/CD & Deploy

- **Deploy:** Vercel (`.vercel/project.json` hiện diện)
- **CI:** GitHub Actions (`.github/workflows/`)
  - `claude-code-review.yml` — Claude AI code review
  - `claude.yml` — Claude PR assistant
- **Build:** `npm run build` — TypeScript check + ESLint + Next.js build
