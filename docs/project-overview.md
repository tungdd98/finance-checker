# Tổng quan dự án — Family Finance Command Center

**Ngày tạo:** 2026-02-28
**Loại:** Web Monolith (Next.js Fullstack)
**Ngôn ngữ:** Vietnamese (vi-VN)
**Tiền tệ:** VND

---

## Mô tả

Family Finance Command Center là ứng dụng quản lý tài chính gia đình cho 2 người dùng (vợ/chồng). Đây là **công cụ ra quyết định tài chính**, không chỉ đơn thuần là tracker. Ứng dụng theo dõi thu/chi, danh mục đầu tư, và tiến độ mục tiêu tài chính.

## Tech Stack tóm tắt

| Danh mục      | Công nghệ                     | Phiên bản        |
| ------------- | ----------------------------- | ---------------- |
| Framework     | Next.js (App Router)          | 16.1.6           |
| Language      | TypeScript                    | ^5               |
| UI Library    | React                         | 19.2.3           |
| Styling       | Tailwind CSS                  | ^4               |
| UI Components | shadcn/ui (New York, Neutral) | ^3.8.5           |
| Backend/DB    | Supabase (PostgreSQL + Auth)  | ^2.98.0          |
| Server State  | TanStack Query                | ^5.90.21         |
| Forms         | react-hook-form + zod         | ^7.71.2 / ^4.3.6 |
| Date          | date-fns                      | ^4.1.0           |
| Icons         | lucide-react                  | ^0.575.0         |
| Charts        | recharts                      | ^3.7.0           |
| Theme         | next-themes                   | ^0.4.6           |
| Mobile Drawer | vaul                          | ^1.1.2           |
| Deploy        | Vercel                        | —                |

## Kiến trúc

**Pattern:** Next.js App Router với Route Groups + Supabase BaaS

```
Client (React 19)
    ↕ TanStack Query (cache + mutations)
Supabase Client SDK
    ↕ Supabase (PostgreSQL + Auth + RLS)
```

**Route Groups:**

- `(auth)` → Public pages (không cần đăng nhập)
- `(dashboard)` → Protected pages (bắt buộc đăng nhập)

**Auth gate:** `src/proxy.ts` — export `proxy` function (KHÔNG phải `middleware.ts`)

## Các trang chính

| Route                     | Mô tả                                                                       |
| ------------------------- | --------------------------------------------------------------------------- |
| `/login`                  | Đăng nhập (public)                                                          |
| `/`                       | Dashboard — Goal progress + Assets summary + Cashflow + Recent transactions |
| `/transactions`           | Danh sách giao dịch, filter theo tháng/loại                                 |
| `/assets`                 | Portfolio đầu tư — P&L, CRUD, cập nhật giá                                  |
| `/goals`                  | Mục tiêu tài chính — progress bars, pin to dashboard                        |
| `/settings/market-prices` | Quản lý giá thị trường (vàng, cổ phiếu, ETF, tiết kiệm)                     |

## Tài liệu liên quan

- [Kiến trúc kỹ thuật](./architecture.md)
- [Mô hình dữ liệu](./data-models.md)
- [Danh mục API](./api-contracts.md)
- [Danh mục component](./component-inventory.md)
- [Hướng dẫn phát triển](./development-guide.md)
- [Cây thư mục](./source-tree-analysis.md)
- [CLAUDE.md](../CLAUDE.md) — Hướng dẫn cho Claude Code
