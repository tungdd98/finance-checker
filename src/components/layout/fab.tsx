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
      className="md:hidden fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/25"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
