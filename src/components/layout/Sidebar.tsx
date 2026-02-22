'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PawPrint, Users, User, BookOpen, Settings } from 'lucide-react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/layout/NotificationBell'
import type { CompanionCharacterProps } from '@/components/rive/CompanionCharacter'

const CompanionCharacter = dynamic<CompanionCharacterProps>(
  () => import('@/components/rive/CompanionCharacter').then(mod => mod.CompanionCharacter),
  { ssr: false }
)

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pets', label: 'My Pets', icon: PawPrint },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        // Hidden on mobile (bottom nav takes over)
        'hidden lg:flex',
        'flex-col gap-2',
        'w-64 shrink-0',
        'h-screen sticky top-0',
        'border-r border-[hsl(var(--border))]',
        'bg-[hsl(var(--surface-raised))]/60 backdrop-blur-md',
        'px-4 py-6',
      )}
    >
      {/* Logo and Notifications */}
      <div className="px-3 mb-6 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-2xl">🐾</span>
          <span className="font-display text-xl font-semibold text-[hsl(var(--foreground))]">
            PawHub
          </span>
        </Link>
        <NotificationBell userId={userId} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl',
                'text-sm font-black transition-all duration-150 active:scale-95',
                isActive
                  ? 'bg-[hsl(var(--accent))] text-white shadow-[0_4px_0_0_hsl(var(--accent-depth))]'
                  : 'text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-overlay))] hover:text-[hsl(var(--foreground))] hover:translate-x-1'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className="uppercase tracking-tight">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Companion character — desktop sidebar */}
      <div className="flex justify-center py-4">
        <CompanionCharacter size={140} enableEyeTracking />
      </div>

      {/* Settings */}
      <Link
        href="/settings"
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'text-sm font-medium text-[hsl(var(--foreground-muted))]',
          'hover:bg-[hsl(var(--surface-overlay))] hover:text-[hsl(var(--foreground))]',
          'transition-all duration-150'
        )}
      >
        <Settings size={18} strokeWidth={1.75} />
        Settings
      </Link>
    </aside>
  )
}
