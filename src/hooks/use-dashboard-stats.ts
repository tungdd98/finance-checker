import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import type { Goal } from '@/types/database'

interface CashflowStats {
  income: number
  expense: number
  investment: number
  net: number
}

export function useMonthlyCashflow(month: Date = new Date()) {
  return useQuery({
    queryKey: ['dashboard-stats', 'cashflow', format(month, 'yyyy-MM')],
    queryFn: async (): Promise<CashflowStats> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .is('deleted_at', null)
        .gte('transaction_date', format(startOfMonth(month), 'yyyy-MM-dd'))
        .lte('transaction_date', format(endOfMonth(month), 'yyyy-MM-dd'))

      if (error) throw error

      const stats = (data ?? []).reduce(
        (acc, t) => {
          if (t.type === 'income') acc.income += Number(t.amount)
          else if (t.type === 'expense') acc.expense += Number(t.amount)
          else if (t.type === 'investment') acc.investment += Number(t.amount)
          return acc
        },
        { income: 0, expense: 0, investment: 0, net: 0 }
      )

      stats.net = stats.income - stats.expense - stats.investment
      return stats
    },
  })
}

export function usePinnedGoal() {
  return useQuery({
    queryKey: ['dashboard-stats', 'pinned-goal'],
    queryFn: async (): Promise<Goal | null> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('show_on_dashboard', true)
        .is('achieved_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })
}

export function useTotalAssets() {
  return useQuery({
    queryKey: ['dashboard-stats', 'total-assets'],
    queryFn: async (): Promise<number> => {
      const supabase = createClient()

      // Get cash balance from view
      const { data: cashData, error: cashError } = await supabase
        .from('cash_balance')
        .select('balance')
        .single()

      if (cashError) throw cashError

      // Get asset holdings from view
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('asset_holdings')
        .select('*')

      if (holdingsError) throw holdingsError

      // Get market prices
      const { data: pricesData, error: pricesError } = await supabase
        .from('market_prices')
        .select('*')

      if (pricesError) throw pricesError

      // Calculate total investment value with market prices
      const totalInvestmentValue = (holdingsData || []).reduce((sum, holding) => {
        const category = holding.category_name.toLowerCase()
        let assetType: 'gold' | 'stock' | 'etf' | 'savings' | null = null

        if (category.includes('vàng')) assetType = 'gold'
        else if (category.includes('cổ phiếu')) assetType = 'stock'
        else if (category.includes('etf') || category.includes('quỹ')) assetType = 'etf'
        else if (category.includes('tiết kiệm')) assetType = 'savings'

        const marketPrice = assetType
          ? (pricesData || []).find(
              (p) =>
                p.asset_type === assetType &&
                (holding.ticker_symbol
                  ? p.ticker_symbol?.toUpperCase() === holding.ticker_symbol?.toUpperCase()
                  : !p.ticker_symbol)
            )
          : null

        // Fallback to cost basis when no market price available
        const currentValue = (marketPrice && marketPrice.price_per_unit != null)
          ? holding.total_quantity * marketPrice.price_per_unit
          : holding.total_cost_basis
        return sum + currentValue
      }, 0)

      // Total assets = cash + investments
      return (cashData?.balance || 0) + totalInvestmentValue
    },
  })
}
