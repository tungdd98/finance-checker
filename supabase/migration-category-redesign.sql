-- Migration: Category Redesign
-- Run this in the Supabase SQL Editor BEFORE deploying the new code.

-- 1. Add savings-specific columns to market_prices
ALTER TABLE market_prices
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS term_months INTEGER,
  ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2);

-- 2. Allow price_per_unit to be NULL (savings presets don't have a unit price)
ALTER TABLE market_prices
  ALTER COLUMN price_per_unit DROP NOT NULL;

-- 3. Update unique constraints
ALTER TABLE market_prices
  DROP CONSTRAINT IF EXISTS market_prices_asset_type_ticker_symbol_key;

-- Unique constraint for tradeable assets (gold/stock/etf)
CREATE UNIQUE INDEX IF NOT EXISTS market_prices_tradeable_unique
  ON market_prices (asset_type, ticker_symbol)
  WHERE asset_type IN ('gold', 'stock', 'etf') AND ticker_symbol IS NOT NULL;

-- Unique constraint for savings presets
CREATE UNIQUE INDEX IF NOT EXISTS market_prices_savings_unique
  ON market_prices (asset_type, bank_name, term_months)
  WHERE asset_type = 'savings';

-- 4. Rename investment categories to generic names
UPDATE categories
  SET name = 'Vàng'
  WHERE name ILIKE 'Vàng%' AND type = 'investment';

UPDATE categories
  SET name = 'Quỹ đầu tư'
  WHERE (name ILIKE 'ETF%' OR name ILIKE 'Quỹ%') AND type = 'investment';

-- 5. Add opening balance category (idempotent)
INSERT INTO categories (name, type, icon, color, is_default)
SELECT 'Số dư ban đầu', 'income', '🏦', '#22c55e', true
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'Số dư ban đầu' AND type = 'income'
);
