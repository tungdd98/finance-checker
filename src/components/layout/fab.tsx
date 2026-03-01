'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FabProps {
  onClick: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="shadow-primary/25 fixed right-4 bottom-20 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
