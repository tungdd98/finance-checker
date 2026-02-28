-- ============================================================
-- FINANCE TRACKER V2 - INVESTMENT TRACKING MIGRATION
-- ============================================================
-- This migration refactors the app to use event-sourced investment tracking
-- where transactions are the source of truth and assets are derived views.
--
-- IMPORTANT: Run this after backing up your data!
-- ============================================================

-- ============================================================
-- STEP 1: Extend Transactions Table
-- ============================================================

-- Add investment-specific columns (nullable for non-investment types)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS transaction_direction TEXT CHECK (transaction_direction IN ('buy', 'sell') OR transaction_direction IS NULL),
  ADD COLUMN IF NOT EXISTS quantity DECIMAL(15,6),
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS ticker_symbol TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS term_months INTEGER;

-- Add constraints for investment transactions
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS investment_must_have_direction,
  ADD CONSTRAINT investment_must_have_direction
    CHECK (
      type != 'investment' OR transaction_direction IS NOT NULL
    );

ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS investment_buy_sell_must_have_qty_price,
  ADD CONSTRAINT investment_buy_sell_must_have_qty_price
    CHECK (
      type != 'investment' OR
      (quantity IS NOT NULL AND quantity > 0 AND unit_price IS NOT NULL AND unit_price > 0)
    );

-- Create indexes for investment queries
CREATE INDEX IF NOT EXISTS idx_transactions_direction
  ON transactions(transaction_direction)
  WHERE deleted_at IS NULL AND type = 'investment';

CREATE INDEX IF NOT EXISTS idx_transactions_ticker
  ON transactions(ticker_symbol)
  WHERE deleted_at IS NULL AND type = 'investment';

-- ============================================================
-- STEP 2: Create Market Prices Table
-- ============================================================

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('gold', 'stock', 'etf', 'savings')),
  ticker_symbol TEXT,
  price_per_unit DECIMAL(15,2) NOT NULL CHECK (price_per_unit > 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(asset_type, ticker_symbol)
);

-- Enable RLS
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access" ON market_prices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_market_prices_lookup
  ON market_prices(asset_type, ticker_symbol);

-- ============================================================
-- STEP 3: Create Asset Holdings View
-- ============================================================

CREATE OR REPLACE VIEW asset_holdings AS
SELECT
  t.category_id,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  t.ticker_symbol,
  t.bank_name,
  -- Total quantity (buys - sells)
  SUM(CASE
    WHEN t.transaction_direction = 'buy' THEN t.quantity
    WHEN t.transaction_direction = 'sell' THEN -t.quantity
    ELSE 0
  END) as total_quantity,
  -- Weighted average cost basis (only from buys)
  COALESCE(
    SUM(CASE WHEN t.transaction_direction = 'buy' THEN t.quantity * t.unit_price END) /
    NULLIF(SUM(CASE WHEN t.transaction_direction = 'buy' THEN t.quantity END), 0),
    0
  ) as avg_cost_basis,
  -- Total cost basis (total invested)
  COALESCE(
    SUM(CASE WHEN t.transaction_direction = 'buy' THEN t.quantity * t.unit_price END),
    0
  ) as total_cost_basis,
  -- Metadata
  MAX(t.transaction_date) as last_transaction_date,
  MAX(t.interest_rate) as interest_rate,
  MAX(t.term_months) as term_months
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.deleted_at IS NULL AND t.type = 'investment'
GROUP BY t.category_id, c.name, c.icon, c.color, t.ticker_symbol, t.bank_name
HAVING SUM(CASE
  WHEN t.transaction_direction = 'buy' THEN t.quantity
  WHEN t.transaction_direction = 'sell' THEN -t.quantity
  ELSE 0
END) > 0;  -- Only show positive holdings

-- ============================================================
-- STEP 4: Create Cash Balance View
-- ============================================================

CREATE OR REPLACE VIEW cash_balance AS
SELECT
  COALESCE(SUM(CASE
    WHEN type = 'income' THEN amount
    WHEN type = 'expense' THEN -amount
    WHEN type = 'investment' AND transaction_direction = 'buy' THEN -amount
    WHEN type = 'investment' AND transaction_direction = 'sell' THEN amount
    ELSE 0
  END), 0) as balance,
  MAX(updated_at) as last_updated
FROM transactions
WHERE deleted_at IS NULL;

-- ============================================================
-- STEP 5: Seed Market Prices (Common Assets)
-- ============================================================

INSERT INTO market_prices (asset_type, ticker_symbol, price_per_unit) VALUES
  ('gold', 'SJC', 82000000),        -- Gold SJC per chỉ (~82M VND as of 2024)
  ('gold', 'PNJ', 81500000),        -- Gold PNJ per chỉ
  ('stock', 'VNM', 82000),          -- VNM stock price example
  ('stock', 'VIC', 42000),          -- VIC stock price example
  ('etf', 'FUEVFVND', 30000),       -- ETF FUEVFVND example
  ('etf', 'E1VFVN30', 25000)        -- ETF E1VFVN30 example
ON CONFLICT (asset_type, ticker_symbol) DO NOTHING;

-- ============================================================
-- STEP 6: Migration Verification Queries
-- ============================================================
-- Run these after migration to verify everything works:
--
-- 1. Check extended transactions table:
--    SELECT * FROM transactions WHERE type = 'investment' LIMIT 5;
--
-- 2. Check market prices:
--    SELECT * FROM market_prices;
--
-- 3. Check asset holdings view:
--    SELECT * FROM asset_holdings;
--
-- 4. Check cash balance view:
--    SELECT * FROM cash_balance;
--
-- ============================================================

COMMENT ON TABLE market_prices IS 'Current market prices for assets (gold, stocks, ETFs, savings rates)';
COMMENT ON VIEW asset_holdings IS 'Aggregated investment holdings derived from transaction history';
COMMENT ON VIEW cash_balance IS 'Current cash balance calculated from all transactions';
