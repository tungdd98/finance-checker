'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Target } from 'lucide-react'
import { usePinnedGoal, useTotalAssets } from '@/hooks/use-dashboard-stats'

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + ' tỷ'
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'tr'
  }
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function GoalProgressCard() {
  const { data: goal, isLoading: goalLoading } = usePinnedGoal()
  const { data: totalAssets = 0, isLoading: assetsLoading } = useTotalAssets()

  const isLoading = goalLoading || assetsLoading
  const progress = goal ? Math.min((totalAssets / goal.target_amount) * 100, 100) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4" />
          Mục tiêu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : goal ? (
          <div className="space-y-3">
            <div className="text-base font-semibold">{goal.name}</div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatVND(totalAssets)}₫ / {formatVND(goal.target_amount)}₫
              </span>
              <span className="text-primary font-bold">{progress.toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="mb-2 text-3xl">🎯</div>
            <p className="text-muted-foreground text-sm">Chưa có mục tiêu</p>
            <p className="text-muted-foreground mt-1 text-xs">Thêm mục tiêu tài chính của bạn</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
