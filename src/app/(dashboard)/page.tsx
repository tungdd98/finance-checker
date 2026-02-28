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
        <Button onClick={() => setDialogOpen(true)} className="hidden gap-2 md:flex">
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Giao dịch gần đây</h2>
          <Link href="/transactions" className="text-primary text-sm hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <TransactionList transactions={recentTransactions} isLoading={isLoading} />
        </div>
      </div>

      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
