'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { GoalForm } from './goal-form'
import type { Goal } from '@/types/database'

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

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
}

export function AddGoalDialog({ open, onOpenChange, goal }: AddGoalDialogProps) {
  const isMobile = useIsMobile()
  const title = goal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <GoalForm goal={goal} onSuccess={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <GoalForm goal={goal} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
