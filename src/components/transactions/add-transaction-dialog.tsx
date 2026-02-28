'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { TransactionForm } from './transaction-form'
import type { Transaction } from '@/types/database'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: AddTransactionDialogProps) {
  const isMobile = useIsMobile()
  const title = transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'

  const handleSuccess = () => {
    onOpenChange(false)
  }

  if (isMobile) {
    const submitLabel = transaction ? 'Cập nhật' : 'Lưu giao dịch'
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="scrollbar-hide flex-1 overflow-y-auto px-4 pb-2">
            <TransactionForm
              formId="transaction-form"
              hideSubmit
              transaction={transaction}
              onSuccess={handleSuccess}
            />
          </div>
          <div className="shrink-0 border-t bg-background px-4 pb-8 pt-3">
            <Button type="submit" form="transaction-form" className="w-full h-12">
              {submitLabel}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <TransactionForm transaction={transaction} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
