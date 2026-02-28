import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { MarketPrice } from '@/types/database'

async function fetchMarketPrices(): Promise<MarketPrice[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .order('asset_type', { ascending: true })
    .order('ticker_symbol', { ascending: true })

  if (error) throw error
  return data || []
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ['market-prices'],
    queryFn: fetchMarketPrices,
  })
}

export function useCreateMarketPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      asset_type: 'gold' | 'stock' | 'etf' | 'savings'
      ticker_symbol?: string | null
      price_per_unit?: number | null
      bank_name?: string | null
      term_months?: number | null
      interest_rate?: number | null
    }) => {
      const supabase = createClient()
      const { data: result, error } = await supabase
        .from('market_prices')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-prices'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
    },
  })
}

export function useUpdateMarketPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      price_per_unit?: number | null
      bank_name?: string | null
      term_months?: number | null
      interest_rate?: number | null
    }) => {
      const supabase = createClient()
      const { data: result, error } = await supabase
        .from('market_prices')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-prices'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
    },
  })
}

export function useDeleteMarketPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('market_prices').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-prices'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
    },
  })
}
