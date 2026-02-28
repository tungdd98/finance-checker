'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  useCreateMarketPrice,
  useUpdateMarketPrice,
} from '@/hooks/use-market-prices'
import type { MarketPrice } from '@/types/database'
import { normalizeTickerSymbol } from '@/lib/utils'

const formSchema = z
  .object({
    asset_type: z.enum(['gold', 'stock', 'etf', 'savings']),
    ticker_symbol: z.string().optional(),
    price_per_unit: z.string().optional(),
    bank_name: z.string().optional(),
    term_months: z.string().optional(),
    interest_rate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.asset_type === 'savings') {
      if (!data.bank_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bắt buộc',
          path: ['bank_name'],
        })
      }
      const months = data.term_months ? parseInt(data.term_months) : 0
      if (!data.term_months || isNaN(months) || months < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Kỳ hạn tối thiểu 1 tháng',
          path: ['term_months'],
        })
      }
      const rate = data.interest_rate ? parseFloat(data.interest_rate) : 0
      if (!data.interest_rate || isNaN(rate) || rate <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Lãi suất phải > 0',
          path: ['interest_rate'],
        })
      }
    } else {
      if (!data.price_per_unit?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nhập giá',
          path: ['price_per_unit'],
        })
      } else {
        const num = parseFloat(
          data.price_per_unit.replace(/\./g, '').replace(',', '.')
        )
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Giá phải lớn hơn 0',
            path: ['price_per_unit'],
          })
        }
      }
    }
  })

type FormValues = z.infer<typeof formSchema>

interface MarketPriceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPrice?: MarketPrice | null
}

function formatAmountDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits).toLocaleString('vi-VN')
}

function parseAmount(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'))
}

export function MarketPriceFormDialog({
  open,
  onOpenChange,
  editingPrice,
}: MarketPriceFormDialogProps) {
  const createMutation = useCreateMarketPrice()
  const updateMutation = useUpdateMarketPrice()
  const isEditing = !!editingPrice
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset_type: 'gold',
      ticker_symbol: '',
      price_per_unit: '',
      bank_name: '',
      term_months: '',
      interest_rate: '',
    },
  })

  const watchedType = form.watch('asset_type')
  const isSavings = watchedType === 'savings'

  // Reset form when dialog opens/closes or editingPrice changes
  useEffect(() => {
    if (open && editingPrice) {
      if (editingPrice.asset_type === 'savings') {
        form.reset({
          asset_type: 'savings',
          bank_name: editingPrice.bank_name || '',
          term_months: editingPrice.term_months ? String(editingPrice.term_months) : '',
          interest_rate: editingPrice.interest_rate
            ? String(editingPrice.interest_rate)
            : '',
          ticker_symbol: '',
          price_per_unit: '',
        })
      } else {
        form.reset({
          asset_type: editingPrice.asset_type,
          ticker_symbol: editingPrice.ticker_symbol || '',
          price_per_unit:
            editingPrice.price_per_unit != null
              ? parseInt(String(editingPrice.price_per_unit)).toLocaleString('vi-VN')
              : '',
          bank_name: '',
          term_months: '',
          interest_rate: '',
        })
      }
    } else if (open && !editingPrice) {
      form.reset({
        asset_type: 'gold',
        ticker_symbol: '',
        price_per_unit: '',
        bank_name: '',
        term_months: '',
        interest_rate: '',
      })
    }
  }, [open, editingPrice, form])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      if (isEditing) {
        if (values.asset_type === 'savings') {
          await updateMutation.mutateAsync({
            id: editingPrice.id,
            bank_name: values.bank_name || null,
            term_months: values.term_months ? parseInt(values.term_months) : null,
            interest_rate: values.interest_rate ? parseFloat(values.interest_rate) : null,
            price_per_unit: null,
          })
        } else {
          await updateMutation.mutateAsync({
            id: editingPrice.id,
            ticker_symbol: normalizeTickerSymbol(values.ticker_symbol) || null,
            price_per_unit: parseAmount(values.price_per_unit || '0'),
          })
        }
      } else {
        if (values.asset_type === 'savings') {
          await createMutation.mutateAsync({
            asset_type: 'savings',
            bank_name: values.bank_name || null,
            term_months: values.term_months ? parseInt(values.term_months) : null,
            interest_rate: values.interest_rate ? parseFloat(values.interest_rate) : null,
            ticker_symbol: null,
            price_per_unit: null,
          })
        } else {
          await createMutation.mutateAsync({
            asset_type: values.asset_type,
            ticker_symbol: normalizeTickerSymbol(values.ticker_symbol),
            price_per_unit: parseAmount(values.price_per_unit || '0'),
            bank_name: null,
            term_months: null,
            interest_rate: null,
          })
        }
      }
      form.reset()
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật giá' : 'Thêm giá mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin thị trường'
              : 'Thêm giá thị trường hoặc preset tiết kiệm'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Asset Type - disabled when editing */}
            <FormField
              control={form.control}
              name="asset_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại tài sản</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại tài sản..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gold">🥇 Vàng</SelectItem>
                      <SelectItem value="stock">📊 Cổ phiếu</SelectItem>
                      <SelectItem value="etf">📈 ETF / Quỹ</SelectItem>
                      <SelectItem value="savings">🏦 Tiết kiệm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSavings ? (
              <>
                {/* Bank name */}
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân hàng / Ví</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus
                          placeholder="Vietcombank, BIDV, Techcombank..."
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term months */}
                <FormField
                  control={form.control}
                  name="term_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kỳ hạn (tháng)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="12"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interest rate */}
                <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lãi suất (%/năm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="5.5"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                {/* Ticker Symbol */}
                <FormField
                  control={form.control}
                  name="ticker_symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã / Tên (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: SJC, VNM, FUEVFVND..."
                          className="h-11"
                          onBlur={(e) => {
                            const normalized = e.target.value.trim().toUpperCase()
                            field.onChange(normalized)
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Để trống nếu áp dụng chung cho loại tài sản
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price_per_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (₫)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus
                          placeholder="0"
                          className="h-12 text-xl font-bold text-right"
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
              </>
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : isEditing ? (
                  'Cập nhật'
                ) : (
                  'Thêm'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
