'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PawPrint, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pets', label: 'Pets', icon: PawPrint },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'lg:hidden',
        'flex items-center justify-around',
        'bg-[hsl(var(--surface-raised))]/90 backdrop-blur-xl',
        'border-t-4 border-[hsl(var(--border-depth))]/20',
        'pb-safe h-20',
      )}
      aria-label="Bottom Navigation"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1.5',
              'flex-1 h-full transition-all duration-150 active:scale-90',
              isActive
                ? 'text-[hsl(var(--accent))]'
                : 'text-[hsl(var(--foreground-muted))]'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative flex items-center justify-center w-12 h-12">
              <Icon size={24} strokeWidth={isActive ? 3 : 2} className="relative z-10" />
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded-2xl bg-[hsl(var(--accent))]/10 border-2 border-[hsl(var(--accent))]/20 shadow-inner z-0"
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-opacity",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
