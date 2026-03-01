'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Plus, ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionList } from '@/components/transactions/transaction-list'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { useTransactions } from '@/hooks/use-transactions'
import { useCategories } from '@/hooks/use-categories'
import type { TransactionType } from '@/types/database'

type FilterType = TransactionType | 'all'

const MONTH_LABELS = [
  'Th1',
  'Th2',
  'Th3',
  'Th4',
  'Th5',
  'Th6',
  'Th7',
  'Th8',
  'Th9',
  'Th10',
  'Th11',
  'Th12',
]

const TYPE_LABEL: Record<string, string> = {
  income: 'Thu nhập',
  expense: 'Chi tiêu',
  investment: 'Đầu tư',
  transfer: 'Chuyển khoản',
}

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear())

  const isAllTime = !!categoryFilter

  // Sync picker year to currentMonth when popover opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pickerOpen) setPickerYear(currentMonth.getFullYear())
  }, [pickerOpen, currentMonth])

  // Reset category filter if it doesn't match the selected type
  const { data: allCategories = [] } = useCategories()
  useEffect(() => {
    if (!categoryFilter) return
    const cat = allCategories.find((c) => c.id === categoryFilter)
    if (cat && filterType !== 'all' && cat.type !== filterType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryFilter('')
    }
  }, [filterType, categoryFilter, allCategories])

  // Categories shown in dropdown: filter by current type if not 'all'
  const visibleCategories = useMemo(() => {
    if (filterType === 'all') return allCategories
    return allCategories.filter((c) => c.type === filterType)
  }, [allCategories, filterType])

  const { data: transactions = [], isLoading } = useTransactions({
    month: isAllTime ? undefined : currentMonth,
    type: filterType,
    category_id: categoryFilter || undefined,
  })

  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))

  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const now = new Date()
  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(now, 'yyyy-MM')

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(new Date(pickerYear, month, 1))
    setPickerOpen(false)
  }

  const isMonthDisabled = (month: number) =>
    pickerYear > now.getFullYear() || (pickerYear === now.getFullYear() && month > now.getMonth())

  const isMonthSelected = (month: number) =>
    pickerYear === currentMonth.getFullYear() && month === currentMonth.getMonth()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giao dịch</h1>
        <Button onClick={() => setDialogOpen(true)} className="hidden gap-2 md:flex">
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {/* Month navigator */}
      <div className="bg-card border-border flex items-center justify-between rounded-xl border p-3">
        <Button variant="ghost" size="icon" onClick={prevMonth} disabled={isAllTime}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {isAllTime ? (
          // All-time mode: show label + clear button
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            <span>Tất cả thời gian</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => setCategoryFilter('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          // Month picker
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="hover:bg-muted gap-2 px-3 font-semibold capitalize"
              >
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                {format(currentMonth, 'MMMM yyyy', { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="center">
              {/* Year navigator */}
              <div className="mb-3 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPickerYear((y) => y - 1)}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-sm font-semibold">{pickerYear}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={pickerYear >= now.getFullYear()}
                  onClick={() => setPickerYear((y) => y + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              {/* Month grid 4×3 */}
              <div className="grid grid-cols-4 gap-1">
                {MONTH_LABELS.map((label, i) => (
                  <Button
                    key={i}
                    variant={isMonthSelected(i) ? 'default' : 'ghost'}
                    size="sm"
                    className="h-9 text-xs"
                    disabled={isMonthDisabled(i)}
                    onClick={() => handleMonthSelect(i)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          disabled={isCurrentMonth || isAllTime}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Type filter */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            Tất cả
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Thu
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex-1">
            Chi
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex-1">
            Đầu tư
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category filter */}
      {visibleCategories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm">Danh mục:</span>
          <Select
            value={categoryFilter || 'all'}
            onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {visibleCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                    <span className="text-muted-foreground text-xs">
                      ({TYPE_LABEL[cat.type] ?? cat.type})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          groupByMonth={isAllTime}
        />
      </div>

      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
