'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { useAnimationStore } from '@/stores/animation-store'

// ─── QueryClient singleton with PawHub defaults ───────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1 minute — data stays fresh
        gcTime: 5 * 60 * 1000,       // 5 minute garbage collection
        retry: 1,
        refetchOnWindowFocus: false,  // pets don't change that fast
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// ─── Animation Init — runs once on mount ─────────────────────
function AnimationInit() {
  const { setPrefersReducedMotion, setTimeOfDay } = useAnimationStore()

  useEffect(() => {
    // Detect reduced motion preference
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)

    // Set time-of-day for ambient theme
    const hour = new Date().getHours()
    setTimeOfDay(hour >= 7 && hour < 19 ? 'day' : 'night')

    // Cursor tracking → CSS custom properties only (no state updates = no re-renders)
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', String(e.clientX))
      document.documentElement.style.setProperty('--my', String(e.clientY))
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      mql.removeEventListener('change', handler)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [setPrefersReducedMotion, setTimeOfDay])

  return null
}

// ─── Providers ────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AnimationInit />
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
