'use client'

import { useState } from 'react'
import { Pencil, Trash2, MoreVertical, Pin, PinOff, Trophy, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteGoal, useUpdateGoal } from '@/hooks/use-goals'
import { AddGoalDialog } from './add-goal-dialog'
import type { Goal } from '@/types/database'

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + ' tỷ ₫'
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(0) + 'tr ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface GoalCardProps {
  goal: Goal
  totalAssets: number
  onEdit: (g: Goal) => void
  onDelete: (id: string) => void
  onTogglePin: (g: Goal) => void
  onMarkAchieved: (g: Goal) => void
}

function GoalCard({
  goal,
  totalAssets,
  onEdit,
  onDelete,
  onTogglePin,
  onMarkAchieved,
}: GoalCardProps) {
  const progress = Math.min((totalAssets / goal.target_amount) * 100, 100)
  const isAchieved = !!goal.achieved_at
  const remaining = Math.max(goal.target_amount - totalAssets, 0)

  return (
    <div className="hover:bg-muted/30 group rounded-lg p-4 transition-colors">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isAchieved && <Trophy className="h-4 w-4 shrink-0 text-yellow-500" />}
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{goal.name}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Mục tiêu: {formatVND(goal.target_amount)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {goal.show_on_dashboard && <Pin className="text-primary h-3.5 w-3.5" />}
          {isAchieved && <Badge className="bg-yellow-500 text-xs hover:bg-yellow-500">Đạt!</Badge>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isAchieved && (
                <DropdownMenuItem onClick={() => onMarkAchieved(goal)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Đánh dấu đạt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onTogglePin(goal)}>
                {goal.show_on_dashboard ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Bỏ ghim
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Ghim Dashboard
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={progress}
        className={`mb-2 h-2.5 ${isAchieved ? '[&>div]:bg-yellow-500' : ''}`}
      />

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{isAchieved ? '🎉 Đã hoàn thành!' : `Còn thiếu ${formatVND(remaining)}`}</span>
        <span className="text-foreground font-bold">{progress.toFixed(1)}%</span>
      </div>
    </div>
  )
}

interface GoalListProps {
  goals: Goal[]
  totalAssets: number
  isLoading?: boolean
}

export function GoalList({ goals, totalAssets, isLoading }: GoalListProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteMutation = useDeleteGoal()
  const updateMutation = useUpdateGoal()

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteMutation.mutateAsync(deletingId)
    setDeletingId(null)
  }

  const handleTogglePin = async (goal: Goal) => {
    await updateMutation.mutateAsync({
      id: goal.id,
      show_on_dashboard: !goal.show_on_dashboard,
    })
  }

  const handleMarkAchieved = async (goal: Goal) => {
    await updateMutation.mutateAsync({
      id: goal.id,
      achieved_at: new Date().toISOString(),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-2.5 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="text-muted-foreground py-16 text-center">
        <div className="mb-3 text-5xl">🎯</div>
        <p className="text-sm font-medium">Chưa có mục tiêu nào</p>
        <p className="mt-1 text-xs">Thêm mục tiêu tài chính để theo dõi tiến độ</p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-border divide-y">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            totalAssets={totalAssets}
            onEdit={setEditingGoal}
            onDelete={setDeletingId}
            onTogglePin={handleTogglePin}
            onMarkAchieved={handleMarkAchieved}
          />
        ))}
      </div>

      <AddGoalDialog
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        goal={editingGoal ?? undefined}
      />

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá mục tiêu?</DialogTitle>
            <DialogDescription>Mục tiêu sẽ bị xoá vĩnh viễn.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xoá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
