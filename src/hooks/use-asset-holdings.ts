import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { AssetHolding, MarketPrice } from '@/types/database'

async function fetchAssetHoldings(): Promise<AssetHolding[]> {
  const supabase = createClient()

  // Fetch holdings from view
  const { data: holdings, error: holdingsError } = await supabase
    .from('asset_holdings')
    .select('*')
    .order('category_name', { ascending: true })

  if (holdingsError) throw holdingsError

  // Fetch market prices
  const { data: prices, error: pricesError } = await supabase
    .from('market_prices')
    .select('*')

  if (pricesError) throw pricesError

  // Enrich holdings with current market prices and P&L
  return (holdings || []).map((holding) => {
    const category = holding.category_name.toLowerCase()
    let assetType: 'gold' | 'stock' | 'etf' | 'savings' | null = null

    // Determine asset type from category name
    if (category.includes('vàng')) assetType = 'gold'
    else if (category.includes('cổ phiếu')) assetType = 'stock'
    else if (category.includes('etf') || category.includes('quỹ')) assetType = 'etf'
    else if (category.includes('tiết kiệm')) assetType = 'savings'

    // Find matching market price (case-insensitive ticker matching)
    const marketPrice = assetType
      ? (prices || []).find(
          (p: MarketPrice) =>
            p.asset_type === assetType &&
            (holding.ticker_symbol
              ? p.ticker_symbol?.toUpperCase() === holding.ticker_symbol?.toUpperCase()
              : !p.ticker_symbol)
        )
      : null

    // Fallback to cost basis when no market price available
    const currentMarketPrice = marketPrice?.price_per_unit
    const currentValue = currentMarketPrice != null
      ? holding.total_quantity * currentMarketPrice
      : holding.total_cost_basis
    const unrealizedPnL = currentMarketPrice != null
      ? currentValue - holding.total_cost_basis
      : 0
    const unrealizedPnLPct =
      holding.total_cost_basis > 0 ? (unrealizedPnL / holding.total_cost_basis) * 100 : 0

    return {
      ...holding,
      current_market_price: currentMarketPrice ?? undefined,
      current_value: currentValue,
      unrealized_pnl: unrealizedPnL,
      unrealized_pnl_pct: unrealizedPnLPct,
    }
  })
}

export function useAssetHoldings() {
  return useQuery({
    queryKey: ['asset-holdings'],
    queryFn: fetchAssetHoldings,
  })
}
