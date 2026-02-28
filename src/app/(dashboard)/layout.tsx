'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Fab } from '@/components/layout/fab'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="md:pl-60 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
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
