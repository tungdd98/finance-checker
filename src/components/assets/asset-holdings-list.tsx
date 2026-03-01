'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AssetHolding } from '@/types/database'
import { cn } from '@/lib/utils'

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

function formatPercent(value: number): string {
  return value.toFixed(2) + '%'
}

interface AssetHoldingsListProps {
  holdings: AssetHolding[]
  isLoading?: boolean
}

export function AssetHoldingsList({ holdings, isLoading }: AssetHoldingsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="ml-auto h-6 w-24" />
                  <Skeleton className="ml-auto h-4 w-20" />
                </div>
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p className="text-sm">Chưa có tài sản đầu tư nào</p>
        <p className="mt-1 text-xs">Thêm giao dịch đầu tư để bắt đầu theo dõi danh mục</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {holdings.map((holding) => {
        const isProfit = (holding.unrealized_pnl || 0) >= 0
        const holdingKey = `${holding.category_id}-${holding.ticker_symbol || ''}-${
          holding.bank_name || ''
        }`

        return (
          <Card key={holdingKey}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Category + Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {holding.category_icon && (
                      <span className="text-base">{holding.category_icon}</span>
                    )}
                    <h3 className="truncate text-base font-semibold">{holding.category_name}</h3>
                  </div>

                  {/* Ticker or Bank */}
                  {holding.ticker_symbol && (
                    <p className="text-muted-foreground mt-1 text-sm">{holding.ticker_symbol}</p>
                  )}
                  {holding.bank_name && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {holding.bank_name}
                      {holding.interest_rate && ` • ${holding.interest_rate}%/năm`}
                      {holding.term_months && ` • ${holding.term_months} tháng`}
                    </p>
                  )}
                </div>

                {/* Right: Current Value + P&L */}
                <div className="text-right">
                  <p className="text-lg font-bold">{formatVND(holding.current_value || 0)}</p>
                  {holding.unrealized_pnl !== undefined && (
                    <div
                      className={cn(
                        'mt-1 flex items-center justify-end gap-1 text-sm',
                        isProfit
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {isProfit ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {isProfit ? '+' : ''}
                        {formatVND(holding.unrealized_pnl)}
                      </span>
                      <span className="text-xs">
                        ({isProfit ? '+' : ''}
                        {formatPercent(holding.unrealized_pnl_pct || 0)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Quantity, Avg Cost, Current Price */}
              <div className="border-border text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-xs">
                <span>
                  Số lượng:{' '}
                  <span className="text-foreground font-medium">
                    {holding.total_quantity.toLocaleString('vi-VN', {
                      maximumFractionDigits: 6,
                    })}
                  </span>
                </span>
                <span>•</span>
                <span>
                  Giá TB:{' '}
                  <span className="text-foreground font-medium">
                    {formatVND(holding.avg_cost_basis)}
                  </span>
                </span>
                {holding.current_market_price !== undefined && holding.current_market_price > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      Giá HT:{' '}
                      <span className="text-foreground font-medium">
                        {formatVND(holding.current_market_price)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
