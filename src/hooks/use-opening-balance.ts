import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/types/database'

const CATEGORY_NAME = 'Số dư ban đầu'

interface OpeningBalanceData {
  category_id: string
  transaction: Transaction | null
}

async function fetchOpeningBalance(): Promise<OpeningBalanceData | null> {
  const supabase = createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', CATEGORY_NAME)
    .eq('type', 'income')
    .maybeSingle()

  if (!category) return null

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('category_id', category.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { category_id: category.id, transaction: transaction ?? null }
}

export function useOpeningBalance() {
  return useQuery({
    queryKey: ['opening-balance'],
    queryFn: fetchOpeningBalance,
  })
}

export function useSetOpeningBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      amount,
      date,
      existingTransactionId,
      categoryId,
    }: {
      amount: number
      date: string
      existingTransactionId?: string
      categoryId?: string
    }) => {
      const supabase = createClient()

      // Find or create the opening balance category
      let catId = categoryId
      if (!catId) {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('name', CATEGORY_NAME)
          .eq('type', 'income')
          .maybeSingle()

        if (existing) {
          catId = existing.id
        } else {
          const { data: created, error } = await supabase
            .from('categories')
            .insert({
              name: CATEGORY_NAME,
              type: 'income',
              icon: '🏦',
              color: '#22c55e',
              is_default: true,
            })
            .select('id')
            .single()
          if (error) throw error
          catId = created.id
        }
      }

      if (existingTransactionId) {
        const { error } = await supabase
          .from('transactions')
          .update({ amount, transaction_date: date, updated_at: new Date().toISOString() })
          .eq('id', existingTransactionId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert({ amount, type: 'income', category_id: catId, transaction_date: date })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opening-balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['cash-balance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
