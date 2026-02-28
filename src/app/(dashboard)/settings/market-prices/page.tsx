'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MarketPriceFormDialog } from '@/components/settings/market-price-form-dialog'
import {
  useMarketPrices,
  useDeleteMarketPrice,
} from '@/hooks/use-market-prices'
import type { MarketPrice } from '@/types/database'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  all: 'Tất cả',
  gold: '🥇 Vàng',
  stock: '📊 Cổ phiếu',
  etf: '📈 ETF',
  savings: '🏦 Tiết kiệm',
}

export default function MarketPricesPage() {
  const [filter, setFilter] = useState<string>('all')
  const [editingPrice, setEditingPrice] = useState<MarketPrice | null>(null)
  const [deletingPrice, setDeletingPrice] = useState<MarketPrice | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  const { data: prices = [], isLoading } = useMarketPrices()
  const deleteMutation = useDeleteMarketPrice()

  const filteredPrices = prices.filter((p) => {
    if (filter === 'all') return true
    return p.asset_type === filter
  })

  const handleEdit = (price: MarketPrice) => {
    setEditingPrice(price)
    setFormDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingPrice) return
    await deleteMutation.mutateAsync(deletingPrice.id)
    setDeletingPrice(null)
  }

  const handleFormClose = () => {
    setFormDialogOpen(false)
    setEditingPrice(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý giá thị trường</h1>
          <p className="text-muted-foreground text-sm">
            Cập nhật giá hiện tại cho các tài sản đầu tư
          </p>
        </div>
        <Button onClick={() => setFormDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm giá
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Loại tài sản:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredPrices.length} kết quả
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Danh sách giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Chưa có giá nào</p>
              <p className="text-xs mt-1">Thêm giá thị trường để bắt đầu</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại tài sản</TableHead>
                    <TableHead>Mã / Tên</TableHead>
                    <TableHead className="text-right">Giá / Thông tin</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrices.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell className="font-medium">
                        {ASSET_TYPE_LABELS[price.asset_type]}
                      </TableCell>
                      <TableCell>
                        {price.asset_type === 'savings' ? (
                          price.bank_name || (
                            <span className="text-muted-foreground italic">—</span>
                          )
                        ) : (
                          price.ticker_symbol || (
                            <span className="text-muted-foreground italic">
                              Chung
                            </span>
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {price.asset_type === 'savings' ? (
                          <span className="text-sm">
                            {price.term_months}T – {price.interest_rate}%/năm
                          </span>
                        ) : price.price_per_unit != null ? (
                          formatVND(price.price_per_unit)
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(
                          new Date(price.updated_at),
                          'dd/MM/yyyy HH:mm',
                          { locale: vi }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(price)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingPrice(price)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <MarketPriceFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        editingPrice={editingPrice}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPrice}
        onOpenChange={() => setDeletingPrice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa giá{' '}
              <strong>
                {deletingPrice?.asset_type === 'savings'
                  ? `${deletingPrice.bank_name} – ${deletingPrice.term_months}T`
                  : deletingPrice?.ticker_symbol || deletingPrice?.asset_type}
              </strong>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
