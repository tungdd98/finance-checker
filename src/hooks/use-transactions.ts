import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, TransactionType, TransactionDirection } from '@/types/database'
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface TransactionFilters {
  month?: Date // if omitted → no date range filter (all time)
  type?: TransactionType | 'all'
  category_id?: string
  limit?: number
}

async function fetchTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  const supabase = createClient()
  const { month, type = 'all', limit, category_id } = filters

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Only apply month range when no category filter (all-time mode)
  if (month) {
    query = query
      .gte('transaction_date', format(startOfMonth(month), 'yyyy-MM-dd'))
      .lte('transaction_date', format(endOfMonth(month), 'yyyy-MM-dd'))
  }

  if (type !== 'all') {
    query = query.eq('type', type)
  }

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      amount: number
      type: TransactionType
      category_id: string
      notes?: string
      transaction_date: string
      // Investment fields
      transaction_direction?: TransactionDirection
      quantity?: number
      unit_price?: number
      ticker_symbol?: string
      bank_name?: string
      interest_rate?: number
      term_months?: number
    }) => {
      const supabase = createClient()
      const { data: result, error } = await supabase
        .from('transactions')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
      queryClient.invalidateQueries({ queryKey: ['cash-balance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      amount?: number
      type?: TransactionType
      category_id?: string
      notes?: string
      transaction_date?: string
      // Investment fields
      transaction_direction?: TransactionDirection
      quantity?: number
      unit_price?: number
      ticker_symbol?: string
      bank_name?: string
      interest_rate?: number
      term_months?: number
    }) => {
      const supabase = createClient()
      const { data: result, error } = await supabase
        .from('transactions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
      queryClient.invalidateQueries({ queryKey: ['cash-balance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['asset-holdings'] })
      queryClient.invalidateQueries({ queryKey: ['cash-balance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
