export type TransactionType = 'income' | 'expense' | 'investment' | 'transfer'
export type TransactionDirection = 'buy' | 'sell'

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon?: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category_id: string
  category?: Category
  notes?: string
  transaction_date: string // YYYY-MM-DD

  // Investment-specific fields (nullable)
  transaction_direction?: TransactionDirection | null
  quantity?: number | null
  unit_price?: number | null
  ticker_symbol?: string | null
  bank_name?: string | null
  interest_rate?: number | null
  term_months?: number | null

  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Goal {
  id: string
  name: string
  target_amount: number
  show_on_dashboard: boolean
  achieved_at?: string | null
  created_at: string
  updated_at: string
}

export interface MarketPrice {
  id: string
  asset_type: 'gold' | 'stock' | 'etf' | 'savings'
  ticker_symbol?: string | null
  price_per_unit?: number | null // nullable; not used for savings presets
  updated_at: string
  created_at: string
  // Savings-specific fields
  bank_name?: string | null
  term_months?: number | null
  interest_rate?: number | null
}

export interface AssetHolding {
  category_id: string
  category_name: string
  category_icon?: string | null
  category_color: string
  ticker_symbol?: string | null
  bank_name?: string | null
  total_quantity: number
  avg_cost_basis: number
  total_cost_basis: number
  last_transaction_date: string
  interest_rate?: number | null
  term_months?: number | null

  // Enriched fields (computed client-side)
  current_market_price?: number
  current_value?: number
  unrealized_pnl?: number
  unrealized_pnl_pct?: number
}

export interface CashBalance {
  balance: number
  last_updated: string
}

export interface DashboardStats {
  monthly_income: number
  monthly_expense: number
  net_cashflow: number
  total_assets: number
}
