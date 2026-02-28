'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'
import { useCategoriesByType } from '@/hooks/use-categories'
import { useMarketPrices } from '@/hooks/use-market-prices'
import type { Transaction, TransactionType, Category } from '@/types/database'
import { normalizeTickerSymbol } from '@/lib/utils'
import { TickerSymbolCombobox } from './ticker-symbol-combobox'

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'income', label: '💰 Thu nhập' },
  { value: 'expense', label: '💸 Chi tiêu' },
  { value: 'investment', label: '📈 Đầu tư' },
  { value: 'transfer', label: '🔄 Chuyển khoản' },
]

// Base schema for income/expense/transfer
const baseSchema = z.object({
  amount: z
    .string()
    .min(1, 'Nhập số tiền')
    .refine((v) => {
      const num = parseFloat(v.replace(/\./g, '').replace(',', '.'))
      return !isNaN(num) && num > 0
    }, 'Số tiền phải lớn hơn 0'),
  type: z.enum(['income', 'expense', 'investment', 'transfer'] as const),
  category_id: z.string().min(1, 'Chọn danh mục'),
  transaction_date: z.string().min(1, 'Chọn ngày'),
  notes: z.string().optional(),
})

// Extended schema for investments
const investmentSchema = baseSchema.extend({
  type: z.literal('investment'),
  transaction_direction: z.enum(['buy', 'sell']),
  quantity: z.string().optional(),
  unit_price: z.string().optional(),
  ticker_symbol: z.string().optional(),
  bank_name: z.string().optional(),
  interest_rate: z.string().optional(),
  term_months: z.string().optional(),
  savings_preset_id: z.string().optional(), // UI-only, not saved to DB
})

// Discriminated union
const formSchema = z.discriminatedUnion('type', [
  baseSchema.extend({ type: z.literal('income') }),
  baseSchema.extend({ type: z.literal('expense') }),
  baseSchema.extend({ type: z.literal('transfer') }),
  investmentSchema,
])

type FormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  formId?: string
  hideSubmit?: boolean
}

function formatAmountDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits).toLocaleString('vi-VN')
}

function parseAmount(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'))
}

function determineAssetType(
  categoryId: string,
  categories: Category[]
): 'gold' | 'stock' | 'etf' | null {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return null
  const name = category.name.toLowerCase()
  if (name.includes('vàng')) return 'gold'
  if (name.includes('cổ phiếu')) return 'stock'
  if (name.includes('etf') || name.includes('quỹ')) return 'etf'
  return null
}

export function TransactionForm({
  transaction,
  onSuccess,
  formId,
  hideSubmit,
}: TransactionFormProps) {
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isEditing = !!transaction

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: transaction ? parseInt(String(transaction.amount)).toLocaleString('vi-VN') : '',
      type: transaction?.type ?? 'expense',
      category_id: transaction?.category_id ?? '',
      transaction_date: transaction?.transaction_date ?? format(new Date(), 'yyyy-MM-dd'),
      notes: transaction?.notes ?? '',
      transaction_direction: transaction?.transaction_direction ?? 'buy',
      quantity: transaction?.quantity ? String(transaction.quantity) : '',
      unit_price: transaction?.unit_price
        ? parseInt(String(transaction.unit_price)).toLocaleString('vi-VN')
        : '',
      ticker_symbol: transaction?.ticker_symbol ?? '',
      bank_name: transaction?.bank_name ?? '',
      interest_rate: transaction?.interest_rate ? String(transaction.interest_rate) : '',
      term_months: transaction?.term_months ? String(transaction.term_months) : '',
      savings_preset_id: '',
    },
  })

  const selectedType = form.watch('type')
  const selectedCategoryId = form.watch('category_id')
  const watchedQuantity = form.watch('quantity')
  const watchedUnitPrice = form.watch('unit_price')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedPresetId = (form as any).watch('savings_preset_id') as string | undefined

  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesByType(selectedType)
  const { data: marketPrices = [] } = useMarketPrices()

  const savingsPresets = marketPrices.filter((p) => p.asset_type === 'savings')

  // Reset category when type changes
  useEffect(() => {
    if (!isEditing) {
      form.setValue('category_id', '')
    }
  }, [selectedType, form, isEditing])

  // Reset investment fields when category changes
  useEffect(() => {
    if (isEditing || selectedType !== 'investment') return
    form.setValue('ticker_symbol', '')
    form.setValue('quantity', '')
    form.setValue('unit_price', '')
    form.setValue('bank_name', '')
    form.setValue('interest_rate', '')
    form.setValue('term_months', '')
    form.setValue('savings_preset_id', '')
    form.setValue('amount', '')
  }, [selectedCategoryId, form, isEditing, selectedType])

  // Auto-fill savings fields when a preset is selected
  useEffect(() => {
    if (!selectedPresetId) return
    const preset = savingsPresets.find((p) => p.id === selectedPresetId)
    if (!preset) return
    form.setValue('bank_name', preset.bank_name ?? '')
    form.setValue('interest_rate', preset.interest_rate?.toString() ?? '')
    form.setValue('term_months', preset.term_months?.toString() ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresetId])

  // Investment field configuration based on selected category
  const investmentConfig = useMemo(() => {
    if (selectedType !== 'investment') return null

    const category = categories.find((c) => c.id === selectedCategoryId)
    if (!category) return null

    const categoryName = category.name.toLowerCase()

    // Gold
    if (categoryName.includes('vàng')) {
      return {
        fields: ['quantity', 'unit_price', 'ticker_symbol'],
        labels: {
          quantity: 'Số lượng (chỉ)',
          unit_price: 'Đơn giá (₫/chỉ)',
          ticker_symbol: 'Loại vàng',
        },
        placeholders: {
          quantity: '1',
          unit_price: '0',
          ticker_symbol: 'SJC, PNJ...',
        },
      }
    }

    // Stock
    if (categoryName.includes('cổ phiếu')) {
      return {
        fields: ['quantity', 'unit_price', 'ticker_symbol'],
        labels: {
          quantity: 'Số lượng (CP)',
          unit_price: 'Giá (₫/CP)',
          ticker_symbol: 'Mã CK',
        },
        placeholders: {
          quantity: '100',
          unit_price: '0',
          ticker_symbol: 'VNM, VIC...',
        },
      }
    }

    // ETF / Quỹ đầu tư
    if (categoryName.includes('etf') || categoryName.includes('quỹ')) {
      return {
        fields: ['quantity', 'unit_price', 'ticker_symbol'],
        labels: {
          quantity: 'Số lượng (CCQ)',
          unit_price: 'Giá (₫/CCQ)',
          ticker_symbol: 'Mã ETF',
        },
        placeholders: {
          quantity: '100',
          unit_price: '0',
          ticker_symbol: 'FUEVFVND...',
        },
      }
    }

    // Savings
    if (categoryName.includes('tiết kiệm')) {
      return {
        fields: ['bank_name', 'interest_rate', 'term_months'],
        labels: {
          bank_name: 'Ngân hàng',
          interest_rate: 'Lãi suất (%/năm)',
          term_months: 'Kỳ hạn (tháng)',
        },
        placeholders: {
          bank_name: 'Vietcombank, BIDV...',
          interest_rate: '5.5',
          term_months: '12',
        },
        hideQuantity: true, // Don't show quantity for savings
      }
    }

    return null
  }, [selectedType, selectedCategoryId, categories])

  // Auto-calculate amount for investment transactions
  useEffect(() => {
    if (selectedType === 'investment' && investmentConfig && !investmentConfig.hideQuantity) {
      const qty = watchedQuantity ? parseFloat(watchedQuantity) : 0
      const price = watchedUnitPrice ? parseAmount(watchedUnitPrice) : 0

      if (qty > 0 && price > 0) {
        const calculatedAmount = qty * price
        form.setValue('amount', formatAmountDisplay(String(calculatedAmount)))
      }
    }
  }, [watchedQuantity, watchedUnitPrice, selectedType, investmentConfig, form])

  const onSubmit = async (values: FormValues) => {
    if (values.type === 'investment') {
      const investmentValues = values as z.infer<typeof investmentSchema>

      // Calculate quantity and unit_price based on category
      let quantity: number | undefined
      let unit_price: number | undefined

      if (investmentConfig?.hideQuantity) {
        // For savings, quantity = 1, unit_price = amount
        quantity = 1
        unit_price = parseAmount(investmentValues.amount)
      } else {
        quantity = investmentValues.quantity ? parseFloat(investmentValues.quantity) : undefined
        unit_price = investmentValues.unit_price
          ? parseAmount(investmentValues.unit_price)
          : undefined
      }

      const payload = {
        amount:
          quantity && unit_price ? quantity * unit_price : parseAmount(investmentValues.amount),
        type: 'investment' as const,
        category_id: investmentValues.category_id,
        transaction_date: investmentValues.transaction_date,
        transaction_direction: investmentValues.transaction_direction,
        quantity,
        unit_price,
        ticker_symbol: normalizeTickerSymbol(investmentValues.ticker_symbol),
        bank_name: investmentValues.bank_name || undefined,
        interest_rate: investmentValues.interest_rate
          ? parseFloat(investmentValues.interest_rate)
          : undefined,
        term_months: investmentValues.term_months
          ? parseInt(investmentValues.term_months)
          : undefined,
        notes: investmentValues.notes || undefined,
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } else {
      // Regular income/expense/transfer
      const amount = parseAmount(values.amount)

      const payload = {
        amount,
        type: values.type,
        category_id: values.category_id,
        transaction_date: values.transaction_date,
        notes: values.notes || undefined,
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    }

    form.reset()
    onSuccess?.()
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const submitLabel = isEditing ? 'Cập nhật' : 'Lưu giao dịch'

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type - segmented */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {TRANSACTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => field.onChange(t.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      field.value === t.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={categoriesLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Chọn danh mục..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Investment Direction (Buy/Sell) - Only for investment type */}
        {selectedType === 'investment' && (
          <FormField
            control={form.control}
            name="transaction_direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hành động</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange('buy')}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      field.value === 'buy'
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    🛒 Mua
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('sell')}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      field.value === 'sell'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    💵 Bán
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Investment-specific fields */}
        {selectedType === 'investment' && investmentConfig && (
          <>
            {/* Quantity field - hide for savings */}
            {investmentConfig.fields.includes('quantity') && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.quantity}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.000001"
                        placeholder={investmentConfig.placeholders.quantity}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Unit price field */}
            {investmentConfig.fields.includes('unit_price') && (
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.unit_price}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={investmentConfig.placeholders.unit_price}
                        className="h-12 text-right"
                        inputMode="numeric"
                        onChange={(e) => {
                          field.onChange(formatAmountDisplay(e.target.value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ticker symbol */}
            {investmentConfig.fields.includes('ticker_symbol') && (
              <FormField
                control={form.control}
                name="ticker_symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.ticker_symbol}</FormLabel>
                    <FormControl>
                      <TickerSymbolCombobox
                        value={field.value || ''}
                        onChange={field.onChange}
                        assetType={determineAssetType(selectedCategoryId, categories)}
                        suggestions={marketPrices}
                        placeholder={investmentConfig.placeholders.ticker_symbol}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Savings Preset Picker */}
            {investmentConfig.fields.includes('bank_name') && savingsPresets.length > 0 && (
              <FormField
                control={form.control}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={'savings_preset_id' as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preset tiết kiệm</FormLabel>
                    <Select value={(field.value as string) || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn ngân hàng / kỳ hạn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {savingsPresets.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.bank_name} – {p.term_months}T – {p.interest_rate}%/năm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Bank name */}
            {investmentConfig.fields.includes('bank_name') && (
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.bank_name}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={investmentConfig.placeholders.bank_name}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Interest rate */}
            {investmentConfig.fields.includes('interest_rate') && (
              <FormField
                control={form.control}
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.interest_rate}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder={investmentConfig.placeholders.interest_rate}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Term months */}
            {investmentConfig.fields.includes('term_months') && (
              <FormField
                control={form.control}
                name="term_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{investmentConfig.labels.term_months}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={investmentConfig.placeholders.term_months}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {/* Amount - auto-focus, large */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số tiền (₫)
                {selectedType === 'investment' &&
                  investmentConfig &&
                  !investmentConfig.hideQuantity && (
                    <span className="text-muted-foreground ml-2 text-xs">(Tự động tính)</span>
                  )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus={selectedType !== 'investment'}
                  placeholder="0"
                  className="h-14 text-right text-2xl font-bold"
                  inputMode="numeric"
                  readOnly={
                    selectedType === 'investment' &&
                    !!investmentConfig &&
                    !investmentConfig.hideQuantity
                  }
                  onChange={(e) => {
                    if (selectedType !== 'investment' || investmentConfig?.hideQuantity) {
                      field.onChange(formatAmountDisplay(e.target.value))
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú (tuỳ chọn)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mô tả ngắn..." className="h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideSubmit && (
          <Button type="submit" className="h-12 w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </form>
    </Form>
  )
}
