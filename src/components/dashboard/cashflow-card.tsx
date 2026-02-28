'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { useMonthlyCashflow } from '@/hooks/use-dashboard-stats'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function formatVND(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'tr'
  }
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function CashflowCard() {
  const month = new Date()
  const { data, isLoading } = useMonthlyCashflow(month)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Dòng tiền tháng {format(month, 'MM/yyyy', { locale: vi })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        ) : (
          <>
            {/* Net cashflow */}
            <div
              className={`text-2xl font-bold mb-4 ${
                (data?.net ?? 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {(data?.net ?? 0) >= 0 ? '+' : ''}
              {formatVND(data?.net ?? 0)}₫
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">Thu</span>
                </div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {formatVND(data?.income ?? 0)}₫
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 mb-1">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs">Chi</span>
                </div>
                <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {formatVND(data?.expense ?? 0)}₫
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  <span className="text-xs">Đầu tư</span>
                </div>
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {formatVND(data?.investment ?? 0)}₫
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
