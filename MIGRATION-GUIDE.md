# Investment Tracking Refactor - Migration Guide

## Overview

This migration refactors the finance tracker from separate transactions/assets to an **event-sourced investment tracking** system where:

- **Transactions are the source of truth** for all investment holdings
- **Assets are derived views** calculated from transaction history
- **Cash balance is automatically tracked** (income - expenses - investment buys + sells)
- **Market prices are managed centrally** in a dedicated table

## Pre-Migration Checklist

### 1. Backup Your Data

Before running the migration, export your current data:

```bash
# From Supabase Dashboard:
# 1. Go to Table Editor
# 2. Export each table as CSV:
#    - transactions
#    - assets
#    - asset_purchases
#    - categories
#    - goals
```

### 2. Test on Duplicate Project (Recommended)

If you have production data, create a duplicate Supabase project first and test the migration there.

## Migration Steps

### Step 1: Run Database Migration

1. Open your **Supabase SQL Editor**
2. Copy the entire contents of `supabase/migration-investment-tracking.sql`
3. Paste into SQL Editor
4. Click **Run** to execute

**What this does:**
- Extends `transactions` table with investment columns
- Creates `market_prices` table
- Creates `asset_holdings` view (auto-aggregates holdings from transactions)
- Creates `cash_balance` view (auto-calculates from all transactions)
- Adds indexes and constraints
- Seeds common market prices (Gold SJC, PNJ, stocks, ETFs)

### Step 2: Verify Migration

Run these queries in SQL Editor to verify:

```sql
-- Check transactions table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Check market_prices table exists
SELECT * FROM market_prices;

-- Check asset_holdings view works
SELECT * FROM asset_holdings;

-- Check cash_balance view works
SELECT * FROM cash_balance;
```

### Step 3: Install Dependencies (if needed)

The implementation should work with existing dependencies. Verify you have:

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Test Type Safety

```bash
npm run build
```

This will catch any TypeScript errors.

## What Changed

### Database Schema

**Transactions Table (Extended):**
```sql
-- New columns for investment tracking
transaction_direction  -- 'buy' or 'sell' (nullable)
quantity              -- Number of units (nullable)
unit_price           -- Price per unit (nullable)
ticker_symbol        -- Stock/ETF/Gold ticker (nullable)
bank_name           -- For savings accounts (nullable)
interest_rate       -- For savings accounts (nullable)
term_months         -- For savings accounts (nullable)
```

**New Tables:**
- `market_prices` - Current market prices for assets
- `asset_holdings` (VIEW) - Derived from transactions
- `cash_balance` (VIEW) - Derived from transactions

### TypeScript Types

**Updated:** `src/types/database.ts`
- Added `TransactionDirection` type
- Extended `Transaction` interface with investment fields
- Added `MarketPrice`, `AssetHolding`, `CashBalance` interfaces
- **Removed:** `Asset` and `AssetPurchase` interfaces (no longer used)

### New Hooks

**Created:**
- `src/hooks/use-asset-holdings.ts` - Fetch and enrich holdings
- `src/hooks/use-cash-balance.ts` - Fetch cash balance
- `src/hooks/use-market-prices.ts` - Manage market prices

**Updated:**
- `src/hooks/use-transactions.ts` - Supports investment fields
- `src/hooks/use-dashboard-stats.ts` - Uses new views for total assets

### UI Components

**Updated:**
- `src/components/transactions/transaction-form.tsx` - Dynamic form with conditional investment fields
- `src/app/(dashboard)/assets/page.tsx` - Uses new hooks and holdings view

**Created:**
- `src/components/assets/asset-holdings-list.tsx` - Display aggregated holdings

## Testing Guide

### Test 1: Create Income Transaction

1. Click "+" button or FAB
2. Select **💰 Thu nhập**
3. Choose category "Lương"
4. Enter amount: `20,000,000`
5. Save

**Expected:** Cash balance increases by 20M

### Test 2: Create Expense Transaction

1. Click "+" button
2. Select **💸 Chi tiêu**
3. Choose category "Ăn uống"
4. Enter amount: `500,000`
5. Save

**Expected:** Cash balance decreases by 500K

### Test 3: Buy Gold Investment

1. Click "+" button
2. Select **📈 Đầu tư**
3. Choose category "Vàng SJC"
4. Click **🛒 Mua** (Buy)
5. Fill in:
   - Số lượng (chỉ): `1`
   - Đơn giá (₫/chỉ): `82,000,000`
   - Loại vàng: `SJC`
   - Amount will auto-calculate to `82,000,000`
6. Save

**Expected:**
- Cash balance decreases by 82M
- Assets page shows 1 gold holding
- Total assets = cash + gold value

### Test 4: Buy More Gold (Different Price)

1. Create another gold buy transaction
2. Quantity: `0.5` chỉ
3. Unit price: `81,000,000`
4. Save

**Expected:**
- Holdings show total quantity: `1.5` chỉ
- Weighted average cost: `81,666,667` ₫/chỉ
- Total cost basis: `122,500,000` ₫

### Test 5: Sell Gold (Partial)

1. Click "+" button
2. Select **📈 Đầu tư**
3. Choose "Vàng SJC"
4. Click **💵 Bán** (Sell)
5. Quantity: `0.5` chỉ
6. Unit price: `83,000,000` (selling at higher price)
7. Save

**Expected:**
- Holdings show quantity: `1.0` chỉ remaining
- Cash balance increases by 41.5M
- P&L shows profit

### Test 6: Buy Stock Investment

1. Click "+" button
2. Select **📈 Đầu tư**
3. Choose "Cổ phiếu"
4. Click **🛒 Mua**
5. Fill in:
   - Số lượng (CP): `100`
   - Giá (₫/CP): `82,000`
   - Mã CK: `VNM`
6. Save

**Expected:**
- Holdings show VNM stock: 100 shares
- Cash balance decreases by 8.2M

### Test 7: Create Savings Account

1. Click "+" button
2. Select **📈 Đầu tư**
3. Choose "Tiết kiệm ngân hàng"
4. Click **🛒 Mua**
5. Fill in:
   - Ngân hàng: `Vietcombank`
   - Lãi suất (%/năm): `5.5`
   - Kỳ hạn (tháng): `12`
   - Số tiền (₫): `50,000,000`
6. Save

**Expected:**
- Holdings show savings account
- Display bank name, interest rate, term
- Cash balance decreases by 50M

### Test 8: Update Market Price

1. Go to Supabase SQL Editor (or create a UI for this later)
2. Run:
   ```sql
   UPDATE market_prices
   SET price_per_unit = 85000000
   WHERE asset_type = 'gold' AND ticker_symbol = 'SJC';
   ```
3. Refresh Assets page

**Expected:**
- Gold holding current value updates
- P&L recalculates
- Total assets updates

### Test 9: Delete Transaction

1. Go to Transactions page
2. Delete an investment transaction
3. Check Assets page

**Expected:**
- Holdings recalculate correctly
- Cash balance adjusts

### Test 10: Dashboard Total Assets

1. Go to Dashboard
2. Check "Tổng tài sản" card

**Expected:**
- Shows cash balance + sum of all investment holdings at current market prices
- Goal progress uses this calculation

## Edge Cases to Test

### 1. Sell More Than Owned

Try creating a sell transaction for more quantity than you own.

**Expected:** The holding should disappear from view (filtered by HAVING clause), but transaction exists. This might need UI validation to prevent.

### 2. Zero Holdings

Sell all of a holding.

**Expected:** Holding disappears from assets page (filtered by view).

### 3. Multiple Holdings of Same Asset

Buy same stock at different prices on different dates.

**Expected:** Holdings aggregate into single row with weighted average cost.

### 4. Missing Market Price

Create an investment with a ticker that has no market price.

**Expected:** Current value shows 0, P&L calculation works with 0 price.

## Troubleshooting

### TypeScript Errors

If you see type errors after migration:

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Supabase RLS Issues

If you get permission errors:

1. Check that RLS policies exist for `market_prices`
2. Verify you're logged in as authenticated user
3. Check browser console for detailed error

### View Not Updating

If asset holdings don't update after transactions:

1. Check transaction was created successfully
2. Verify `deleted_at` is `NULL`
3. Run manual query in SQL Editor:
   ```sql
   SELECT * FROM asset_holdings;
   ```

### Cash Balance Incorrect

If cash balance seems wrong:

1. Check all transactions have correct `type` and `transaction_direction`
2. Run manual calculation:
   ```sql
   SELECT
     type,
     transaction_direction,
     SUM(amount) as total
   FROM transactions
   WHERE deleted_at IS NULL
   GROUP BY type, transaction_direction;
   ```

## Future Enhancements

After confirming everything works, consider:

1. **Market Price Management UI** - Add a settings page to update market prices
2. **Automatic Price Fetching** - Integrate with financial APIs to auto-update prices
3. **Transaction History View** - Show all buy/sell transactions for a specific holding
4. **Realized P&L Tracking** - Calculate profit/loss from completed sales
5. **Portfolio Allocation Chart** - Visualize asset distribution
6. **Export/Import** - Bulk transaction import from CSV

## Rollback Plan

If you need to rollback:

1. Restore database from pre-migration backup
2. Git checkout previous commit:
   ```bash
   git log  # Find commit hash before migration
   git checkout <commit-hash>
   npm install
   npm run dev
   ```

## Support

If you encounter issues:

1. Check migration was run completely
2. Verify all files were updated
3. Check browser console for errors
4. Check Supabase logs in Dashboard

## Summary of Files Changed

**Database:**
- `supabase/migration-investment-tracking.sql` (NEW)

**Types:**
- `src/types/database.ts` (UPDATED)

**Hooks:**
- `src/hooks/use-asset-holdings.ts` (NEW)
- `src/hooks/use-cash-balance.ts` (NEW)
- `src/hooks/use-market-prices.ts` (NEW)
- `src/hooks/use-transactions.ts` (UPDATED)
- `src/hooks/use-dashboard-stats.ts` (UPDATED)

**Components:**
- `src/components/transactions/transaction-form.tsx` (UPDATED)
- `src/components/assets/asset-holdings-list.tsx` (NEW)
- `src/app/(dashboard)/assets/page.tsx` (UPDATED)

**Documentation:**
- `MIGRATION-GUIDE.md` (NEW - this file)
