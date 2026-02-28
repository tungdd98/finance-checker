import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Category, TransactionType } from '@/types/database'

async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

export function useCategoriesByType(type: TransactionType | null) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      if (!type) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name')

      if (error) throw error
      return data ?? []
    },
    enabled: !!type,
  })
}
