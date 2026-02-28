'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet } from 'lucide-react'
import { useTotalAssets } from '@/hooks/use-dashboard-stats'

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AssetsSummaryCard() {
  const { data: totalAssets = 0, isLoading } = useTotalAssets()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Tổng tài sản
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{formatVND(totalAssets)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Giá trị thị trường hiện tại
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
