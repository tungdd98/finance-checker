'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Pencil, Trash2, MoreVertical, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteTransaction } from '@/hooks/use-transactions'
import { AddTransactionDialog } from './add-transaction-dialog'
import type { Transaction } from '@/types/database'

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function typeColor(type: string): string {
  switch (type) {
    case 'income':
      return 'text-green-600 dark:text-green-400'
    case 'expense':
      return 'text-red-600 dark:text-red-400'
    case 'investment':
      return 'text-blue-600 dark:text-blue-400'
    case 'transfer':
      return 'text-purple-600 dark:text-purple-400'
    default:
      return 'text-foreground'
  }
}

function getAmountSign(transaction: Transaction): string {
  if (transaction.type === 'income') return '+'
  if (transaction.type === 'investment') {
    return transaction.transaction_direction === 'sell' ? '+' : '-'
  }
  return '-'
}

interface TransactionCardProps {
  readonly transaction: Transaction
  readonly onEdit: (t: Transaction) => void
  readonly onDelete: (id: string) => void
}

function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  return (
    <div className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-3 transition-colors">
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: (transaction.category?.color ?? '#6366f1') + '20' }}
      >
        {transaction.category?.icon ?? '💰'}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-sm font-medium">
          {transaction.category?.name ?? 'Không rõ'}
          {transaction.type === 'investment' && transaction.transaction_direction && (
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                transaction.transaction_direction === 'buy'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
              }`}
            >
              {transaction.transaction_direction === 'buy' ? 'Mua' : 'Bán'}
            </span>
          )}
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
          {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: vi })}
          {transaction.type === 'investment' && transaction.quantity && transaction.unit_price && (
            <>
              <span>·</span>
              <span className="shrink-0">
                {transaction.quantity % 1 === 0
                  ? transaction.quantity
                  : transaction.quantity.toFixed(2)}{' '}
                × {formatVND(transaction.unit_price)}
              </span>
            </>
          )}
          {transaction.notes && (
            <>
              <span>·</span>
              <span className="max-w-40 truncate">{transaction.notes}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className={`shrink-0 text-sm font-semibold ${typeColor(transaction.type)}`}>
        {getAmountSign(transaction)}
        {formatVND(transaction.amount)}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(transaction)}>
            <Pencil className="mr-2 h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface TransactionListProps {
  readonly transactions: Transaction[]
  readonly isLoading?: boolean
  readonly groupByMonth?: boolean
}

export function TransactionList({ transactions, isLoading, groupByMonth }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteMutation = useDeleteTransaction()

  // Group transactions by year-month when requested
  const monthGroups = useMemo(() => {
    if (!groupByMonth || transactions.length === 0) return null
    const groups: { key: string; label: string; items: Transaction[] }[] = []
    for (const t of transactions) {
      const key = format(new Date(t.transaction_date), 'yyyy-MM')
      const last = groups[groups.length - 1]
      if (!last || last.key !== key) {
        groups.push({
          key,
          label: format(new Date(t.transaction_date), 'MMMM yyyy', { locale: vi }),
          items: [],
        })
      }
      groups[groups.length - 1].items.push(t)
    }
    return groups
  }, [transactions, groupByMonth])

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteMutation.mutateAsync(deletingId)
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-sm">Chưa có giao dịch nào</p>
      </div>
    )
  }

  return (
    <>
      {monthGroups ? (
        // All-time view: grouped by month
        <div>
          {monthGroups.map((group) => (
            <div key={group.key}>
              <div className="bg-muted/40 border-border border-b px-3 py-2">
                <span className="text-muted-foreground text-xs font-semibold capitalize">
                  {group.label}
                </span>
                <span className="text-muted-foreground ml-2 text-xs">
                  · {group.items.length} giao dịch
                </span>
              </div>
              <div className="divide-border divide-y">
                {group.items.map((t) => (
                  <TransactionCard
                    key={t.id}
                    transaction={t}
                    onEdit={setEditingTransaction}
                    onDelete={setDeletingId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Month view: flat list
        <div className="divide-border divide-y">
          {transactions.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              onEdit={setEditingTransaction}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <AddTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction ?? undefined}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá giao dịch?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Giao dịch sẽ bị xoá khỏi lịch sử.
            </DialogDescription>
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
