'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Fab } from '@/components/layout/fab'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="bg-background min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="pb-20 md:pb-0 md:pl-60">
        <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
      </main>

      {/* Mobile navigation */}
      <BottomNav />

      {/* FAB - Mobile only */}
      <Fab onClick={() => setDialogOpen(true)} />

      {/* Add Transaction Dialog */}
      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
