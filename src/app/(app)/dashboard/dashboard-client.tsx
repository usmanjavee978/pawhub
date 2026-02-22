'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Syringe, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createBrowserClient } from '@/lib/supabase/client'
import { useAnimationStore } from '@/stores/animation-store'
import { NutritionRing } from '@/components/ui/NutritionRing'
import { formatPetAge, getNextVaccineDue } from '@/lib/helpers/pet-age'
import { cn } from '@/lib/utils'
import type { PetWithLogs } from '@/types/database'

import type { CompanionCharacterProps } from '@/components/rive/CompanionCharacter'

// Dynamically import heavy Rive component
const CompanionCharacter = dynamic<CompanionCharacterProps>(() => import('@/components/rive/CompanionCharacter').then(mod => mod.CompanionCharacter), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-[hsl(var(--surface-overlay))] rounded-full" style={{ width: 160, height: 160 }} />
})

// Daily calorie target — in Phase 2 this will be per-pet based on weight/species
const DEFAULT_DAILY_CALORIES = 400

interface DashboardClientProps {
  userId: string
  displayName: string
}

export function DashboardClient({ userId, displayName }: DashboardClientProps) {
  const [activePetIndex, setActivePetIndex] = useState(0)
  const { setCharacterMood } = useAnimationStore()

  const supabase = createBrowserClient()

  const { data: pets = [], isLoading } = useQuery<PetWithLogs[]>({
    queryKey: ['pets', 'list', userId],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          food_logs!food_logs_pet_id_fkey(id, food_name, calories, meal_type, logged_at),
          vaccine_logs!vaccine_logs_pet_id_fkey(id, vaccine_name, status, next_due_at)
        `)
        .eq('owner_id', userId)
        .eq('is_active', true)
        .gte('food_logs.logged_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as PetWithLogs[]
    },
  })

  const activePet = pets[activePetIndex] ?? null

  // ── Derive companion mood from DATA STATE ────────────────────
  // The companion is NOT reacting to page load — it IS the data state.
  // This is the critical architectural distinction from slop.
  useEffect(() => {
    if (!activePet) {
      setCharacterMood('idle')
      return
    }

    const foodLogsToday = activePet.food_logs?.length ?? 0
    const hasOverdueVaccine = activePet.vaccine_logs?.some(
      v => v.status === 'overdue' ||
        (v.next_due_at && new Date(v.next_due_at) < new Date())
    )

    if (hasOverdueVaccine) {
      setCharacterMood('sad')
    } else if (foodLogsToday === 0) {
      setCharacterMood('hungry')  // ears perked, glances at food bowl
    } else if (foodLogsToday >= 2) {
      setCharacterMood('happy')   // content slow-blink idle
    } else {
      setCharacterMood('idle')
    }
  }, [activePet, setCharacterMood])

  // ── Derive the ONE gravitational CTA ────────────────────────
  function getPrimaryAction(pet: PetWithLogs | null) {
    if (!pet) return null

    const overdueVaccine = pet.vaccine_logs?.find(
      v => v.status === 'overdue' ||
        (v.next_due_at && new Date(v.next_due_at) < new Date())
    )

    if (overdueVaccine) {
      return {
        type: 'vaccine' as const,
        label: `Log vaccine: ${overdueVaccine.vaccine_name}`,
        href: `/pets/${pet.id}/vaccines/new`,
        icon: Syringe,
        urgency: 'high' as const,
      }
    }

    const foodLogsToday = pet.food_logs?.length ?? 0
    if (foodLogsToday === 0) {
      return {
        type: 'food' as const,
        label: "Log today's first meal",
        href: `/pets/${pet.id}/food/new`,
        icon: PlusCircle,
        urgency: 'medium' as const,
      }
    }

    return {
      type: 'food' as const,
      label: 'Log another meal',
      href: `/pets/${pet.id}/food/new`,
      icon: PlusCircle,
      urgency: 'low' as const,
    }
  }

  const primaryAction = getPrimaryAction(activePet)

  // ── Nutrition ring values ─────────────────────────────────────
  const loggedCalories = activePet?.food_logs?.reduce(
    (sum, log) => sum + (log.calories ?? 0), 0
  ) ?? 0
  const nutritionProgress = Math.min(1, loggedCalories / DEFAULT_DAILY_CALORIES)

  const nextVaccine = activePet
    ? getNextVaccineDue(activePet.vaccine_logs ?? [])
    : null

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CompanionCharacter size={160} className="animate-float" />
      </div>
    )
  }

  // ── Empty state — no pets yet ────────────────────────────────
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <CompanionCharacter size={200} className="mb-6" />
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to PawHub, {displayName}!
        </h2>
        <p className="text-[hsl(var(--foreground-muted))] mb-8 max-w-sm">
          Add your first pet to start tracking their health, meals, and vaccines.
        </p>
        <Link href="/pets/new" className="btn-primary">
          <PlusCircle size={18} />
          Add my first pet
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-2"
      >
        <h1 className="text-3xl font-black text-[hsl(var(--foreground))]">
          Hey, {displayName}! 👋
        </h1>
        <p className="text-[hsl(var(--foreground-muted))] font-medium mt-1">
          Here&apos;s {activePet?.name}&apos;s day so far
        </p>
      </motion.div>

      {/* ── Pet selector — if multiple pets ── */}
      {pets.length > 1 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-4 scrollbar-hide pt-1 px-1">
          {pets.map((pet, i) => (
            <button
              key={pet.id}
              onClick={() => setActivePetIndex(i)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm',
                'transition-all duration-150 active:scale-95',
                i === activePetIndex
                  ? 'bg-[hsl(var(--accent))] text-white shadow-[0_4px_0_0_hsl(var(--accent-depth))]'
                  : 'bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] shadow-[0_4px_0_0_hsl(var(--border-depth))]'
              )}
            >
              <span className="text-lg">
                {pet.species === 'cat' ? '🐱' : pet.species === 'dog' ? '🐶' : '🐾'}
              </span>
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {/* ── The Living Scene ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activePet && (
          <motion.div
            key={activePet.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="space-y-6"
          >
            {/* Hero card — companion + nutrition ring */}
            <div className="block-card p-8">
              <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                {/* Companion character */}
                <div className="flex flex-col items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[hsl(var(--accent))]/10 blur-3xl rounded-full" />
                    <CompanionCharacter
                      size={180}
                      enableEyeTracking={false}
                      enableTouchInteraction
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-2xl mb-1">{activePet.name}</p>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground-muted))] bg-[hsl(var(--surface-overlay))] px-3 py-1 rounded-full inline-block">
                      {activePet.breed} · {formatPetAge(activePet.date_of_birth)}
                    </p>
                  </div>
                </div>

                {/* Nutrition ring — data visualization */}
                <div className="flex flex-col items-center gap-4 flex-1">
                  <NutritionRing
                    progress={nutritionProgress}
                    loggedCalories={loggedCalories}
                    targetCalories={DEFAULT_DAILY_CALORIES}
                    size={160}
                    strokeWidth={14}
                    label="Nutrition"
                    animate
                  />
                  <div className="bg-[hsl(var(--surface-overlay))] px-4 py-2 rounded-2xl shadow-inner-lg">
                    <p className="text-xs font-bold text-[hsl(var(--foreground-muted))] text-center uppercase tracking-wider">
                      {activePet.food_logs?.length ?? 0} meal{(activePet.food_logs?.length ?? 0) !== 1 ? 's' : ''} today
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gravitational CTA — the one most important action ── */}
            {primaryAction && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Link
                  href={primaryAction.href}
                  className={cn(
                    'flex items-center justify-between p-6 rounded-[2rem] group',
                    'border-x border-t transition-all duration-150 active:translate-y-[2px] active:shadow-none',
                    primaryAction.urgency === 'high'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-[0_6px_0_0_#d97706]'
                      : primaryAction.urgency === 'medium'
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent-muted))] shadow-[0_6px_0_0_hsl(var(--accent-depth))]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] shadow-[0_6px_0_0_hsl(var(--border-depth))]'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner',
                      primaryAction.urgency === 'high'
                        ? 'bg-amber-100 dark:bg-amber-900/50'
                        : 'bg-[hsl(var(--accent))]/20'
                    )}>
                      <primaryAction.icon
                        size={28}
                        className={primaryAction.urgency === 'high' ? 'text-amber-600' : 'text-[hsl(var(--accent))]'}
                      />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight">{primaryAction.label}</p>
                      <p className={cn(
                        "text-sm font-bold mt-0.5",
                        primaryAction.urgency === 'high' ? "text-amber-700 dark:text-amber-400" : "text-[hsl(var(--foreground-muted))]"
                      )}>
                        {primaryAction.urgency === 'high' ? '🚨 Action required now' : 'Help keep me healthy'}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/20 group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={24} className="text-[hsl(var(--foreground-muted))]" />
                  </div>
                </Link>
              </motion.div>
            )}

            {/* ── Grid Actions ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Today's meals summary */}
              {(activePet.food_logs?.length ?? 0) > 0 && (
                <div className="block-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-[hsl(var(--foreground))]">Today&apos;s Meals</h3>
                    <Link href={`/pets/${activePet.id}/food`} className="text-xs font-bold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-muted))] px-2 py-1 rounded-lg">
                      Full History
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {activePet.food_logs.map(log => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between bg-[hsl(var(--surface-overlay))] p-3 rounded-xl border-b border-[hsl(var(--border-depth))]/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {log.meal_type === 'breakfast' ? '🌅' : log.meal_type === 'lunch' ? '☀️' : log.meal_type === 'dinner' ? '🌙' : '🍿'}
                          </span>
                          <div>
                            <p className="text-sm font-black leading-none">{log.food_name}</p>
                            <p className="text-[10px] text-[hsl(var(--foreground-muted))] font-bold uppercase mt-1">{log.meal_type}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm">{log.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming vaccine alert */}
              {nextVaccine && (
                <div className={cn(
                  'block-card p-6',
                  nextVaccine.isOverdue
                    ? 'border-red-400/50 bg-red-50/50 dark:bg-red-950/20 shadow-[0_var(--depth-offset)_0_0_#ef4444]'
                    : 'shadow-[0_var(--depth-offset)_0_0_hsl(var(--secondary-depth))]'
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      nextVaccine.isOverdue ? "bg-red-100 dark:bg-red-900/50" : "bg-emerald-100 dark:bg-emerald-900/50"
                    )}>
                      <Syringe size={24} className={nextVaccine.isOverdue ? 'text-red-500' : 'text-emerald-500'} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-[hsl(var(--foreground))]">{nextVaccine.name}</h3>
                      <p className={cn(
                        'text-sm font-bold',
                        nextVaccine.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-[hsl(var(--foreground-muted))]'
                      )}>
                        {nextVaccine.isOverdue
                          ? `Overdue by ${Math.abs(nextVaccine.daysUntil)} days`
                          : nextVaccine.daysUntil === 0 ? 'Due today!' : `Due in ${nextVaccine.daysUntil} days`
                        }
                      </p>
                    </div>
                  </div>
                  <button className="btn-game-ghost w-full py-2 mt-4 text-xs">
                    View Schedule
                  </button>
                </div>
              )}
            </div>

            {/* Quick links — Tactile Tiles */}
            <div className="grid grid-cols-2 gap-4 pb-12">
              <Link href={`/pets/${activePet.id}`} className="block-card-hover p-6 text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                <p className="font-black text-sm uppercase tracking-tighter">Pet Profile</p>
              </Link>
              <Link href={`/pets/${activePet.id}/weight`} className="block-card-hover p-6 text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚖️</div>
                <p className="font-black text-sm uppercase tracking-tighter">Weight Log</p>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
