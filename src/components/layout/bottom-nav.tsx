'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CreditCard, TrendingUp, Target, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/transactions', icon: CreditCard, label: 'Giao dịch' },
  { href: '/assets', icon: TrendingUp, label: 'Tài sản' },
  { href: '/goals', icon: Target, label: 'Mục tiêu' },
  { href: '/settings/market-prices', icon: Settings, label: 'Giá' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-background border-border fixed right-0 bottom-0 left-0 z-40 border-t md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
