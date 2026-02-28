# Mô hình dữ liệu — Family Finance Command Center

**Nguồn:** `supabase/schema.sql` + `src/types/database.ts`
**Database:** Supabase (PostgreSQL)
**RLS:** Bật — tất cả authenticated users có full access (single-family app)

---

## Sơ đồ quan hệ

```
categories ──< transactions
assets ──< asset_purchases

[Views]
cash_balance        ← tính từ transactions (income - expense - investment)
asset_holdings      ← tính từ transactions (investment buy/sell)
market_prices       ← bảng riêng, cập nhật thủ công
```

---

## Bảng: `categories`

Danh mục giao dịch. Seeded sẵn 16 danh mục mặc định.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | Auto-generated |
| `name` | TEXT NOT NULL | Tên danh mục (tiếng Việt) |
| `type` | TEXT | Enum: `income`, `expense`, `investment`, `transfer` |
| `icon` | TEXT | Emoji icon |
| `color` | TEXT | Hex color code |
| `is_default` | BOOLEAN | Danh mục mặc định (không thể xóa) |
| `created_at` | TIMESTAMPTZ | Thời điểm tạo |

**Seed mặc định:** 3 income, 8 expense, 4 investment, 1 transfer

---

## Bảng: `transactions`

Giao dịch tài chính. **Soft delete** — dùng `deleted_at` IS NULL để filter.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | Auto-generated |
| `amount` | DECIMAL(15,2) | Số tiền (> 0, VND) |
| `type` | TEXT | Enum: `income`, `expense`, `investment`, `transfer` |
| `category_id` | UUID FK → categories | Danh mục |
| `notes` | TEXT | Ghi chú tùy chọn |
| `transaction_date` | DATE | Ngày giao dịch (YYYY-MM-DD) |
| `transaction_direction` | TEXT | `buy` hoặc `sell` (chỉ cho investment) |
| `quantity` | DECIMAL(15,6) | Số lượng (cho vàng/cổ phiếu/ETF) |
| `unit_price` | DECIMAL(15,2) | Giá mỗi đơn vị |
| `ticker_symbol` | TEXT | Mã chứng khoán/ETF |
| `bank_name` | TEXT | Tên ngân hàng (cho tiết kiệm) |
| `interest_rate` | DECIMAL | Lãi suất %/năm |
| `term_months` | INTEGER | Kỳ hạn (tháng) |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-update qua trigger |
| `deleted_at` | TIMESTAMPTZ | NULL = chưa xóa (soft delete) |

**Indexes:** `transaction_date`, `type`, `category_id` — tất cả WHERE deleted_at IS NULL

---

## Bảng: `assets` *(Legacy)*

Bảng assets cũ. Hiện tại hệ thống chủ yếu dùng `transactions` với type=investment + view `asset_holdings`.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | Tên tài sản |
| `asset_type` | TEXT | Enum: `savings`, `gold`, `stock`, `etf`, `real_estate`, `cash`, `other` |
| `quantity` | DECIMAL(15,6) | Số lượng |
| `purchase_price` | DECIMAL(15,2) | Giá mua |
| `current_price` | DECIMAL(15,2) | Giá hiện tại |
| `currency` | TEXT | Mặc định `VND` |
| `notes` | TEXT | |
| `last_updated_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

---

## Bảng: `goals`

Mục tiêu tài chính. **Hard delete** (không dùng soft delete).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | Tên mục tiêu |
| `target_amount` | DECIMAL(15,2) | Số tiền mục tiêu |
| `show_on_dashboard` | BOOLEAN | Pin lên dashboard |
| `achieved_at` | TIMESTAMPTZ | NULL = chưa đạt; có giá trị = đã đạt |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-update qua trigger |

**Goal progress = `totalAssets / target_amount × 100`** — không có cột savings riêng; progress dựa trên tổng portfolio.

---

## Bảng: `asset_purchases`

Lịch sử mua vào để tính average cost basis. Cascade delete khi xóa asset.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | |
| `asset_id` | UUID FK → assets | ON DELETE CASCADE |
| `quantity` | DECIMAL(15,6) | Số lượng |
| `purchase_price` | DECIMAL(15,2) | Giá mua |
| `purchase_date` | DATE | |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

## Views (Supabase)

### `cash_balance`
Tính số dư tiền mặt từ transactions:
- `balance` = Tổng income − Tổng expense − Tổng investment (tất cả thời gian)

### `asset_holdings`
Tổng hợp danh mục đầu tư từ transactions type=investment:
- Nhóm theo category + ticker_symbol (nếu có)
- `total_quantity` = SUM buy quantity − SUM sell quantity
- `avg_cost_basis` = Weighted average purchase price
- `total_cost_basis` = total_quantity × avg_cost_basis

### `market_prices`
Giá thị trường hiện tại cho các loại tài sản:
- Hỗ trợ: `gold`, `stock`, `etf`, `savings`
- Cập nhật thủ công qua trang `/settings/market-prices`

---

## TypeScript Types (`src/types/database.ts`)

```typescript
type TransactionType = 'income' | 'expense' | 'investment' | 'transfer'
type TransactionDirection = 'buy' | 'sell'

interface Transaction { ... }
interface Category { ... }
interface Goal { ... }
interface MarketPrice { asset_type: 'gold'|'stock'|'etf'|'savings', ... }
interface AssetHolding { ... }  // Enriched với P&L từ client-side
interface CashBalance { balance: number, last_updated: string }
interface DashboardStats { monthly_income, monthly_expense, net_cashflow, total_assets }
```

---

## Migrations

| File | Mô tả |
|------|-------|
| `supabase/schema.sql` | Schema gốc (chạy đầu tiên) |
| `supabase/migration-category-redesign.sql` | Redesign category system |
| `supabase/migration-investment-tracking.sql` | Thêm investment tracking fields |
| `supabase/migration-normalize-tickers.sql` | Normalize ticker symbols |
