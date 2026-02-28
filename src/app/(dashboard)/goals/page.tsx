'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoalList } from '@/components/goals/goal-list'
import { AddGoalDialog } from '@/components/goals/add-goal-dialog'
import { useGoals } from '@/hooks/use-goals'
import { useTotalAssets } from '@/hooks/use-dashboard-stats'

export default function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: goals = [], isLoading: goalsLoading } = useGoals()
  const { data: totalAssets = 0, isLoading: assetsLoading } = useTotalAssets()

  const activeGoals = goals.filter((g) => !g.achieved_at)
  const achievedGoals = goals.filter((g) => !!g.achieved_at)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mục tiêu</h1>
          <p className="text-muted-foreground text-sm">
            {activeGoals.length} đang thực hiện
            {achievedGoals.length > 0 && ` · ${achievedGoals.length} đã đạt`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {/* Active goals */}
      {(goalsLoading || activeGoals.length > 0) && (
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <GoalList
            goals={activeGoals}
            totalAssets={totalAssets}
            isLoading={goalsLoading || assetsLoading}
          />
        </div>
      )}

      {/* No goals at all */}
      {!goalsLoading && goals.length === 0 && (
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <GoalList goals={[]} totalAssets={totalAssets} />
        </div>
      )}

      {/* Achieved goals */}
      {!goalsLoading && achievedGoals.length > 0 && (
        <div>
          <h2 className="text-muted-foreground mb-2 px-1 text-sm font-semibold tracking-wide uppercase">
            🏆 Đã hoàn thành ({achievedGoals.length})
          </h2>
          <div className="bg-card border-border overflow-hidden rounded-xl border opacity-70">
            <GoalList goals={achievedGoals} totalAssets={totalAssets} />
          </div>
        </div>
      )}

      <AddGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
