'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoalProgressCard } from '@/components/dashboard/goal-progress-card'
import { AssetsSummaryCard } from '@/components/dashboard/assets-summary-card'
import { CashflowCard } from '@/components/dashboard/cashflow-card'
import { TransactionList } from '@/components/transactions/transaction-list'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { useTransactions } from '@/hooks/use-transactions'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: recentTransactions = [], isLoading } = useTransactions({ limit: 5 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground text-sm">Tài chính gia đình</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="hidden md:flex gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm giao dịch
        </Button>
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <GoalProgressCard />
        <AssetsSummaryCard />
        <CashflowCard />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Giao dịch gần đây</h2>
          <Link
            href="/transactions"
            className="text-sm text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <TransactionList transactions={recentTransactions} isLoading={isLoading} />
        </div>
      </div>

      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
