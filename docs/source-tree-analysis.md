# Phân tích cây thư mục — Family Finance Command Center

**Ngày tạo:** 2026-02-28

---

## Cây thư mục đầy đủ (bỏ qua node_modules, .next, .git)

```
finance-tracker-v2/
│
├── src/                                    # Toàn bộ source code
│   │
│   ├── app/                                # Next.js App Router
│   │   ├── layout.tsx                      # Root layout (ThemeProvider + QueryProvider)
│   │   ├── globals.css                     # Tailwind CSS global styles
│   │   ├── favicon.ico
│   │   │
│   │   ├── (auth)/                         # Route group — PUBLIC (không cần auth)
│   │   │   └── login/
│   │   │       └── page.tsx                # Trang đăng nhập
│   │   │
│   │   └── (dashboard)/                    # Route group — PROTECTED (cần auth)
│   │       ├── layout.tsx                  # Dashboard shell (Sidebar + BottomNav + FAB)
│   │       ├── page.tsx                    # /  — Dashboard tổng quan
│   │       ├── transactions/
│   │       │   └── page.tsx                # /transactions — Danh sách giao dịch
│   │       ├── assets/
│   │       │   └── page.tsx                # /assets — Danh mục đầu tư
│   │       ├── goals/
│   │       │   └── page.tsx                # /goals — Mục tiêu tài chính
│   │       └── settings/
│   │           └── market-prices/
│   │               └── page.tsx            # /settings/market-prices — Giá thị trường
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives (KHÔNG chỉnh sửa trực tiếp)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx                  # vaul drawer
│   │   │   ├── form.tsx                    # react-hook-form integration
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── command.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── date-picker.tsx
│   │   │
│   │   ├── layout/                         # Navigation components
│   │   │   ├── sidebar.tsx                 # Desktop sidebar (md+ breakpoint)
│   │   │   ├── bottom-nav.tsx              # Mobile bottom navigation
│   │   │   └── fab.tsx                     # Floating Action Button (mobile add transaction)
│   │   │
│   │   ├── dashboard/                      # Dashboard cards
│   │   │   ├── cashflow-card.tsx           # Thu/chi tháng
│   │   │   ├── goal-progress-card.tsx      # Tiến độ mục tiêu pinned
│   │   │   └── assets-summary-card.tsx     # Tổng danh mục đầu tư
│   │   │
│   │   ├── transactions/                   # Giao dịch
│   │   │   ├── transaction-form.tsx        # Form thêm/sửa giao dịch
│   │   │   ├── transaction-list.tsx        # Danh sách giao dịch
│   │   │   ├── add-transaction-dialog.tsx  # Dialog/Drawer thêm giao dịch
│   │   │   └── ticker-symbol-combobox.tsx  # Combobox chọn mã CK
│   │   │
│   │   ├── assets/                         # Đầu tư
│   │   │   └── asset-holdings-list.tsx     # Danh sách holdings với P&L
│   │   │
│   │   ├── goals/                          # Mục tiêu
│   │   │   ├── goal-form.tsx               # Form thêm/sửa mục tiêu
│   │   │   ├── goal-list.tsx               # Danh sách mục tiêu (active + achieved)
│   │   │   └── add-goal-dialog.tsx         # Dialog/Drawer thêm mục tiêu
│   │   │
│   │   ├── settings/                       # Cài đặt
│   │   │   └── market-price-form-dialog.tsx # Form cập nhật giá thị trường
│   │   │
│   │   ├── theme-provider.tsx              # next-themes ThemeProvider wrapper
│   │   └── query-provider.tsx              # TanStack QueryClientProvider wrapper
│   │
│   ├── hooks/                              # TanStack Query data hooks
│   │   ├── use-transactions.ts             # useTransactions, useCreate/Update/DeleteTransaction
│   │   ├── use-asset-holdings.ts           # useAssetHoldings (enriched với P&L)
│   │   ├── use-dashboard-stats.ts          # useMonthlyCashflow, usePinnedGoal, useTotalAssets
│   │   ├── use-goals.ts                    # useGoals, useCreate/Update/DeleteGoal
│   │   ├── use-categories.ts              # useCategories
│   │   ├── use-market-prices.ts           # useMarketPrices, useUpsertMarketPrice
│   │   ├── use-cash-balance.ts            # useCashBalance
│   │   └── use-opening-balance.ts         # useOpeningBalance
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # createBrowserClient (hooks + client components)
│   │   │   └── server.ts                   # createServerClient (server components)
│   │   └── utils.ts                        # cn(clsx + tailwind-merge)
│   │
│   ├── types/
│   │   └── database.ts                     # ⭐ Source of truth cho tất cả TypeScript types
│   │
│   └── proxy.ts                            # ⭐ Auth middleware (export `proxy`, KHÔNG phải middleware.ts)
│
├── supabase/                               # Database
│   ├── schema.sql                          # ⭐ Schema gốc (chạy đầu tiên trong Supabase)
│   ├── migration-category-redesign.sql
│   ├── migration-investment-tracking.sql
│   └── migration-normalize-tickers.sql
│
├── public/                                 # Static assets
│   └── *.svg                               # SVG icons
│
├── docs/                                   # ⭐ Project documentation (thư mục này)
│   ├── index.md                            # Master index
│   ├── project-overview.md
│   ├── architecture.md
│   ├── data-models.md
│   ├── api-contracts.md
│   ├── source-tree-analysis.md
│   ├── component-inventory.md
│   └── development-guide.md
│
├── .github/workflows/                      # CI/CD
│   ├── claude-code-review.yml              # Claude AI code review
│   └── claude.yml                          # Claude PR assistant
│
├── .claude/commands/                       # BMAD slash commands
├── _bmad/                                  # BMAD framework
├── _bmad-output/                           # BMAD output
│
├── CLAUDE.md                               # ⭐ Hướng dẫn cho Claude Code
├── README.md                               # Project README
├── MIGRATION-GUIDE.md                      # Hướng dẫn migration
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                         # shadcn/ui config
└── eslint.config.mjs
```

---

## Thư mục quan trọng (Critical Directories)

| Thư mục | Vai trò |
|---------|---------|
| `src/app/` | Routing, layouts, pages |
| `src/components/ui/` | shadcn/ui primitives — KHÔNG sửa trực tiếp |
| `src/hooks/` | Toàn bộ data access logic |
| `src/types/database.ts` | Source of truth cho TypeScript types |
| `src/proxy.ts` | Auth gate — critical cho security |
| `supabase/schema.sql` | Database schema |
| `docs/` | Project documentation |

## Entry Points

| File | Mô tả |
|------|-------|
| `src/proxy.ts` | Middleware entry point |
| `src/app/layout.tsx` | Root layout |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell |
| `src/app/(dashboard)/page.tsx` | Dashboard home |
