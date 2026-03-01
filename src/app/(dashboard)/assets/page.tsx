'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, Wallet, Pencil, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { AssetHoldingsList } from '@/components/assets/asset-holdings-list'
import { useAssetHoldings } from '@/hooks/use-asset-holdings'
import { useCashBalance } from '@/hooks/use-cash-balance'
import { useOpeningBalance, useSetOpeningBalance } from '@/hooks/use-opening-balance'

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + ' tỷ ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatAmountDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits).toLocaleString('vi-VN')
}

function parseAmount(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'))
}

// ─── Opening Balance Dialog ───────────────────────────────────────────────────

function OpeningBalanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: ob } = useOpeningBalance()
  const mutation = useSetOpeningBalance()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'))

  // Pre-fill when editing existing
  useEffect(() => {
    if (open && ob?.transaction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmount(parseInt(String(ob.transaction.amount)).toLocaleString('vi-VN'))
       
      setDate(ob.transaction.transaction_date)
    } else if (open) {
       
      setAmount('')
       
      setDate(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'))
    }
  }, [open, ob])

  const handleSubmit = async () => {
    const parsed = parseAmount(amount)
    if (!parsed || parsed <= 0 || !date) return

    await mutation.mutateAsync({
      amount: parsed,
      date,
      existingTransactionId: ob?.transaction?.id,
      categoryId: ob?.category_id,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Số dư ban đầu</DialogTitle>
          <DialogDescription>
            Nhập số tiền bạn đã có trước khi bắt đầu dùng app. Sẽ được ghi nhận là một khoản Thu
            nhập.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Số tiền (₫)</Label>
            <Input
              autoFocus
              placeholder="0"
              className="h-12 text-right text-2xl font-bold"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatAmountDisplay(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending || !amount}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : ob?.transaction ? (
              'Cập nhật'
            ) : (
              'Lưu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Portfolio Summary Card ───────────────────────────────────────────────────

function PortfolioSummary({
  totalValue,
  totalCost,
  totalPnL,
  totalPnLPct,
  cashBalance,
  isLoading,
  onEditOpeningBalance,
}: {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPct: number
  cashBalance: number
  isLoading: boolean
  onEditOpeningBalance: () => void
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    )
  }

  const isProfit = totalPnL >= 0
  const cashIsNegative = cashBalance < 0

  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-muted-foreground mb-1 text-sm">Tổng giá trị danh mục</p>
        <p className="mb-4 text-3xl font-bold">{formatVND(totalValue)}</p>

        <div className="mb-3 grid grid-cols-2 gap-3">
          {/* Total Cost */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground mb-1 text-xs">Vốn đầu tư</p>
            <p className="text-sm font-semibold">{formatVND(totalCost)}</p>
          </div>

          {/* P&L */}
          <div
            className={`rounded-lg p-3 ${
              isProfit ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
            }`}
          >
            <div
              className={`mb-1 flex items-center gap-1 text-xs ${
                isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              Lãi / Lỗ
            </div>
            <p
              className={`text-sm font-semibold ${
                isProfit ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}
            >
              {isProfit ? '+' : ''}
              {formatVND(totalPnL)}
              <span className="ml-1 text-xs">
                ({isProfit ? '+' : ''}
                {totalPnLPct.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Cash Balance */}
        <div
          className={`rounded-lg p-3 ${
            cashIsNegative ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-blue-50 dark:bg-blue-950/30'
          }`}
        >
          <div
            className={`mb-1 flex items-center justify-between ${
              cashIsNegative
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Wallet className="h-3 w-3" />
              Tiền mặt / Tài khoản
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 h-6 w-6"
              onClick={onEditOpeningBalance}
              title="Thiết lập số dư ban đầu"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <p
            className={`text-sm font-semibold ${
              cashIsNegative
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {formatVND(cashBalance)}
          </p>
          {cashIsNegative && (
            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              Thiếu số dư ban đầu — nhấn ✏️ để thiết lập
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [obDialogOpen, setObDialogOpen] = useState(false)

  const { data: holdings = [], isLoading: holdingsLoading } = useAssetHoldings()
  const { data: cashBalanceData, isLoading: cashLoading } = useCashBalance()

  const cashBalance = cashBalanceData?.balance || 0
  const totalInvestmentValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.total_cost_basis, 0)
  const totalPnL = totalInvestmentValue - totalCost
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
  const totalValue = cashBalance + totalInvestmentValue

  const isLoading = holdingsLoading || cashLoading

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tài sản</h1>
          <p className="text-muted-foreground text-sm">
            {holdings.length} tài sản đầu tư
            {cashBalance > 0 && ' • Bao gồm tiền mặt'}
          </p>
        </div>
      </div>

      {/* Portfolio summary */}
      <PortfolioSummary
        totalValue={totalValue}
        totalCost={totalCost}
        totalPnL={totalPnL}
        totalPnLPct={totalPnLPct}
        cashBalance={cashBalance}
        isLoading={isLoading}
        onEditOpeningBalance={() => setObDialogOpen(true)}
      />

      {/* Holdings list */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-border border-b p-4">
          <h2 className="font-semibold">Danh mục đầu tư</h2>
        </div>
        <div className="p-4">
          <AssetHoldingsList holdings={holdings} isLoading={holdingsLoading} />
        </div>
      </div>

      <OpeningBalanceDialog open={obDialogOpen} onOpenChange={setObDialogOpen} />
    </div>
  )
}
