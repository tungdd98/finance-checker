import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CashBalance } from '@/types/database'

async function fetchCashBalance(): Promise<CashBalance> {
  const supabase = createClient()

  const { data, error } = await supabase.from('cash_balance').select('*').single()

  if (error) throw error

  return data
}

export function useCashBalance() {
  return useQuery({
    queryKey: ['cash-balance'],
    queryFn: fetchCashBalance,
  })
}
