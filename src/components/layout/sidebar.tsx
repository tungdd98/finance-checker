'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  CreditCard,
  TrendingUp,
  Target,
  Settings,
  TrendingUp as Logo,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/transactions', icon: CreditCard, label: 'Giao dịch' },
  { href: '/assets', icon: TrendingUp, label: 'Tài sản' },
  { href: '/goals', icon: Target, label: 'Mục tiêu' },
  { href: '/settings/market-prices', icon: Settings, label: 'Cài đặt giá' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="bg-background border-border fixed top-0 left-0 z-30 hidden h-screen w-60 flex-col border-r md:flex">
      {/* Logo */}
      <div className="border-border flex items-center gap-2 border-b px-4 py-5">
        <div className="bg-primary rounded-lg p-1.5">
          <Logo className="text-primary-foreground h-5 w-5" />
        </div>
        <div>
          <div className="text-sm leading-none font-bold">Finance CC</div>
          <div className="text-muted-foreground mt-0.5 text-xs">Command Center</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-border space-y-1 border-t px-2 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-full justify-start gap-3"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {mounted && resolvedTheme === 'dark' ? 'Sáng' : 'Tối'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
