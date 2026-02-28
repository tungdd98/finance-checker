# Documentation Index — Family Finance Command Center

**Ngày tạo:** 2026-02-28
**Scan level:** Deep
**Loại project:** Web Monolith (Next.js 16 App Router + Supabase)

---

## Thông tin nhanh

| Thuộc tính | Giá trị |
|-----------|---------|
| **Tên** | Family Finance Command Center |
| **Mục đích** | Quản lý tài chính gia đình 2 người (vợ/chồng), VND, vi-VN |
| **Framework** | Next.js 16.1.6 (App Router) |
| **Ngôn ngữ** | TypeScript 5 |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Deploy** | Vercel |
| **Architecture** | Monolith — Client-side data access qua TanStack Query |

---

## Tài liệu được tạo

| Tài liệu | Mô tả |
|---------|-------|
| [Tổng quan dự án](./project-overview.md) | Mô tả, tech stack, routes, kiến trúc tổng quát |
| [Kiến trúc kỹ thuật](./architecture.md) | Request flow, layers, patterns, auth, state management |
| [Mô hình dữ liệu](./data-models.md) | Schema DB, views, TypeScript types, migrations |
| [API Contracts](./api-contracts.md) | Tất cả Supabase hooks, queries, mutations |
| [Danh mục Component](./component-inventory.md) | Tất cả components, patterns, usage |
| [Cây thư mục](./source-tree-analysis.md) | Cấu trúc thư mục có annotations |
| [Hướng dẫn phát triển](./development-guide.md) | Setup, commands, conventions, patterns |

---

## Tài liệu có sẵn trong project

| Tài liệu | Mô tả |
|---------|-------|
| [CLAUDE.md](../CLAUDE.md) | Hướng dẫn cho Claude Code (conventions, architecture notes) |
| [README.md](../README.md) | Project README |
| [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) | Hướng dẫn migration |

---

## Getting Started (Cho Developer)

```bash
npm install
# Tạo .env.local với Supabase credentials
npm run dev      # http://localhost:3000
```

Chi tiết: [Hướng dẫn phát triển](./development-guide.md)

---

## Getting Started (Cho AI Agent)

**Khi nhận yêu cầu mới, đọc theo thứ tự:**

1. **[CLAUDE.md](../CLAUDE.md)** — Conventions, patterns, critical rules
2. **[architecture.md](./architecture.md)** — Hiểu request flow + data layer
3. **[data-models.md](./data-models.md)** — TypeScript types + DB schema
4. **[api-contracts.md](./api-contracts.md)** — Cách query Supabase

**Cho feature liên quan đến UI:**
→ Đọc thêm [component-inventory.md](./component-inventory.md)

**Cho feature liên quan đến DB:**
→ Đọc thêm [data-models.md](./data-models.md) + `src/types/database.ts`

**Cho feature mới hoàn toàn:**
→ Chạy `/bmad-bmm-create-prd` để tạo PRD → point vào `docs/index.md` làm context

---

## Routes nhanh

| Route | Component chính | Hook chính |
|-------|----------------|-----------|
| `/` | `DashboardPage` | `useMonthlyCashflow`, `usePinnedGoal`, `useTotalAssets` |
| `/transactions` | `TransactionsPage` | `useTransactions` |
| `/assets` | `AssetsPage` | `useAssetHoldings` |
| `/goals` | `GoalsPage` | `useGoals`, `useTotalAssets` |
| `/settings/market-prices` | `MarketPricesPage` | `useMarketPrices` |

---

## Query Keys (TanStack Query)

```
['transactions', filters]
['asset-holdings']
['cash-balance']
['dashboard-stats', 'cashflow', 'yyyy-MM']
['dashboard-stats', 'pinned-goal']
['dashboard-stats', 'total-assets']
['goals']
['categories', type?]
['market-prices']
```

---

*Tạo bởi BMAD Document Project workflow — 2026-02-28*
