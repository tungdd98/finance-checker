-- ============================================================
-- Family Finance Command Center - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
  icon TEXT,
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
  category_id UUID REFERENCES categories(id),
  notes TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('savings', 'gold', 'stock', 'etf', 'real_estate', 'cash', 'other')),
  quantity DECIMAL(15,6) DEFAULT 1,
  purchase_price DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'VND',
  notes TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  show_on_dashboard BOOLEAN DEFAULT true,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asset purchases table (for average cost basis tracking)
CREATE TABLE IF NOT EXISTS asset_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  quantity DECIMAL(15,6) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_deleted ON assets(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_purchases ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access (single-family app)
CREATE POLICY "Authenticated users full access" ON categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON assets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON goals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON asset_purchases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- DEFAULT CATEGORIES SEED DATA
-- ============================================================

INSERT INTO categories (name, type, icon, color, is_default) VALUES
  -- Thu nhập (Income)
  ('Lương', 'income', '💼', '#22c55e', true),
  ('Thưởng', 'income', '🎁', '#22c55e', true),
  ('Thu nhập khác', 'income', '💰', '#22c55e', true),

  -- Chi tiêu (Expense)
  ('Ăn uống', 'expense', '🍜', '#ef4444', true),
  ('Di chuyển', 'expense', '🚗', '#ef4444', true),
  ('Nhà ở', 'expense', '🏠', '#ef4444', true),
  ('Sức khỏe', 'expense', '💊', '#ef4444', true),
  ('Giáo dục', 'expense', '📚', '#ef4444', true),
  ('Mua sắm', 'expense', '🛍️', '#ef4444', true),
  ('Giải trí', 'expense', '🎬', '#ef4444', true),
  ('Chi phí khác', 'expense', '📝', '#ef4444', true),

  -- Đầu tư (Investment)
  ('Tiết kiệm ngân hàng', 'investment', '🏦', '#6366f1', true),
  ('Vàng SJC', 'investment', '🥇', '#f59e0b', true),
  ('ETF VNM', 'investment', '📈', '#6366f1', true),
  ('Cổ phiếu', 'investment', '📊', '#6366f1', true),

  -- Chuyển khoản (Transfer)
  ('Chuyển khoản', 'transfer', '🔄', '#8b5cf6', true)

ON CONFLICT DO NOTHING;
