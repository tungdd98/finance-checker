# API Contracts — Family Finance Command Center

**Ngày tạo:** 2026-02-28
**Pattern:** Supabase Client SDK (không có custom REST API routes)
**Client:** `src/lib/supabase/client.ts` → `createBrowserClient`

> Tất cả data access đi qua TanStack Query hooks trong `src/hooks/`. Không có Next.js API routes (`/api/*`).

---

## Hook: `use-transactions.ts`

### `useTransactions(filters?)`

Query key: `['transactions', filters]`

**Supabase query:**

```typescript
supabase
  .from('transactions')
  .select('*, category:categories(*)')
  .is('deleted_at', null)
  .order('transaction_date', { ascending: false })
// + optional: gte/lte month range, eq type, eq category_id, limit
```

**Filters:**
| Param | Type | Mô tả |
|-------|------|-------|
| `month` | Date | Filter theo tháng (start/end of month) |
| `type` | TransactionType \| 'all' | Filter theo loại |
| `category_id` | string | Filter theo danh mục |
| `limit` | number | Giới hạn kết quả |

### `useCreateTransaction()`

Invalidates: `['transactions']`, `['asset-holdings']`, `['cash-balance']`, `['dashboard-stats']`

**Payload:**

```typescript
{
  amount: number           // VND, > 0
  type: TransactionType    // 'income' | 'expense' | 'investment' | 'transfer'
  category_id: string      // UUID
  notes?: string
  transaction_date: string // 'YYYY-MM-DD'
  // Investment fields (optional):
  transaction_direction?: 'buy' | 'sell'
  quantity?: number
  unit_price?: number
  ticker_symbol?: string
  bank_name?: string
  interest_rate?: number
  term_months?: number
}
```

### `useUpdateTransaction()`

Invalidates: same as Create

### `useDeleteTransaction(id)`

**Pattern:** Soft delete — update `deleted_at = now()`
Invalidates: same as Create

---

## Hook: `use-dashboard-stats.ts`

### `useMonthlyCashflow(month?)`

Query key: `['dashboard-stats', 'cashflow', 'yyyy-MM']`

**Supabase query:**

```typescript
supabase
  .from('transactions')
  .select('amount, type')
  .is('deleted_at', null)
  .gte('transaction_date', startOfMonth)
  .lte('transaction_date', endOfMonth)
```

**Returns:** `{ income, expense, investment, net }`

- `net = income - expense - investment`

### `usePinnedGoal()`

Query key: `['dashboard-stats', 'pinned-goal']`

```typescript
supabase
  .from('goals')
  .select('*')
  .eq('show_on_dashboard', true)
  .is('achieved_at', null)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
```

### `useTotalAssets()`

Query key: `['dashboard-stats', 'total-assets']`

Tính toán phức tạp (3 queries):

1. `cash_balance` view → `{ balance }`
2. `asset_holdings` view → array of holdings
3. `market_prices` → array of prices

**Logic:** `totalAssets = cashBalance + Σ(holding × marketPrice || costBasis)`

---

## Hook: `use-asset-holdings.ts`

### `useAssetHoldings()`

Query key: `['asset-holdings']`

Queries:

1. `asset_holdings` view (sorted by category_name)
2. `market_prices` table

**Enriches** holdings client-side với:

- `current_market_price`
- `current_value = quantity × marketPrice || costBasis`
- `unrealized_pnl = currentValue - costBasis`
- `unrealized_pnl_pct = pnl / costBasis × 100`

**Asset type detection (từ category name):**
| Từ khóa trong category_name | Asset type |
|-----------------------------|-----------|
| `vàng` | gold |
| `cổ phiếu` | stock |
| `etf` hoặc `quỹ` | etf |
| `tiết kiệm` | savings |

---

## Hook: `use-goals.ts`

### `useGoals()`

Query key: `['goals']`

### `useCreateGoal()`, `useUpdateGoal()`, `useDeleteGoal()`

- Delete: Hard delete (`.delete()`)
- Invalidates: `['goals']`, `['dashboard-stats']`

---

## Hook: `use-categories.ts`

### `useCategories(type?)`

Query key: `['categories', type]`

Filter optional theo TransactionType.

---

## Hook: `use-market-prices.ts`

### `useMarketPrices()`

Query key: `['market-prices']`

### `useUpsertMarketPrice()`

**Upsert logic:**

```typescript
supabase.from('market_prices').upsert(data, {
  onConflict: 'asset_type,ticker_symbol', // hoặc 'asset_type,bank_name,term_months'
})
```

---

## Hook: `use-cash-balance.ts`

### `useCashBalance()`

Query key: `['cash-balance']`

```typescript
supabase.from('cash_balance').select('balance').single()
```

---

## Hook: `use-opening-balance.ts`

### `useOpeningBalance(month)`

Tính số dư đầu kỳ cho tháng được chọn.

---

## Supabase Views

| View             | Mô tả                                                        |
| ---------------- | ------------------------------------------------------------ |
| `cash_balance`   | Tổng income - expense - investment của tất cả transactions   |
| `asset_holdings` | Aggregate investment transactions → avg cost basis per asset |
| `market_prices`  | Giá thị trường hiện tại (manual update)                      |

---

## Error Handling Pattern

```typescript
const { data, error } = await supabase.from('...').select(...)
if (error) throw error
return data ?? []
```

TanStack Query bắt lỗi và expose qua `isError` + `error` trong hook result.
