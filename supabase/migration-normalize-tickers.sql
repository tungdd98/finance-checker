-- ============================================================
-- NORMALIZE EXISTING TICKER SYMBOLS
-- ============================================================
--
-- This migration normalizes ticker symbols to uppercase for
-- consistent matching between transactions and market_prices.
--
-- Run this in Supabase SQL Editor AFTER deploying code changes.
--
-- IMPORTANT: Backup your data before running this migration!
-- ============================================================

-- 1. Normalize transactions
UPDATE transactions
SET ticker_symbol = UPPER(TRIM(ticker_symbol))
WHERE ticker_symbol IS NOT NULL
  AND ticker_symbol != UPPER(TRIM(ticker_symbol));

-- 2. Normalize market_prices
UPDATE market_prices
SET ticker_symbol = UPPER(TRIM(ticker_symbol))
WHERE ticker_symbol IS NOT NULL
  AND ticker_symbol != UPPER(TRIM(ticker_symbol));

-- 3. Add check constraint for transactions (optional, ensures future data integrity)
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS ticker_symbol_uppercase,
  ADD CONSTRAINT ticker_symbol_uppercase
    CHECK (ticker_symbol IS NULL OR ticker_symbol = UPPER(TRIM(ticker_symbol)));

-- 4. Add check constraint for market_prices (optional, ensures future data integrity)
ALTER TABLE market_prices
  DROP CONSTRAINT IF EXISTS ticker_symbol_uppercase,
  ADD CONSTRAINT ticker_symbol_uppercase
    CHECK (ticker_symbol IS NULL OR ticker_symbol = UPPER(TRIM(ticker_symbol)));

-- ============================================================
-- VERIFICATION QUERIES (Optional - run these to verify results)
-- ============================================================

-- Check if any transactions still have lowercase tickers
-- SELECT id, ticker_symbol
-- FROM transactions
-- WHERE ticker_symbol IS NOT NULL
--   AND ticker_symbol != UPPER(TRIM(ticker_symbol));

-- Check if any market_prices still have lowercase tickers
-- SELECT id, ticker_symbol
-- FROM market_prices
-- WHERE ticker_symbol IS NOT NULL
--   AND ticker_symbol != UPPER(TRIM(ticker_symbol));

-- Count normalized records
-- SELECT
--   (SELECT COUNT(*) FROM transactions WHERE ticker_symbol IS NOT NULL) as total_transactions_with_ticker,
--   (SELECT COUNT(*) FROM market_prices WHERE ticker_symbol IS NOT NULL) as total_market_prices_with_ticker;
