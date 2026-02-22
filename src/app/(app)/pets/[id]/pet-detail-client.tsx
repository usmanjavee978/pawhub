'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Edit, PlusCircle, Syringe, Trash2, Calendar, Weight, Ruler } from 'lucide-react'
import { format } from 'date-fns'

import dynamic from 'next/dynamic'
import { usePet } from '@/hooks/queries/use-pets'
import { useFoodLogs } from '@/hooks/queries/use-food-logs'
import { useVaccineLogs } from '@/hooks/queries/use-vaccine-logs'
import { formatPetAge, getNextVaccineDue } from '@/lib/helpers/pet-age'
import { NutritionRing } from '@/components/ui/NutritionRing'
import { cn, formatCalories } from '@/lib/utils'

const WeightChart = dynamic(() => import('@/components/pets/WeightChart'), {
    ssr: false,
    loading: () => <div className="h-[250px] animate-pulse bg-[hsl(var(--surface-overlay))] rounded-xl w-full" />
})

export function PetDetailClient({ petId }: { petId: string }) {
    const { data: pet, isLoading: isPetLoading } = usePet(petId)
    const { data: foodLogs = [], isLoading: isFoodLogsLoading } = useFoodLogs(petId)
    const { data: vaccineLogs = [], isLoading: isVaccineLogsLoading } = useVaccineLogs(petId)

    if (isPetLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 flex justify-center mt-10">
                <div className="animate-pulse space-y-4 w-full">
                    <div className="h-48 bg-[hsl(var(--surface-overlay))] rounded-2xl w-full"></div>
                    <div className="h-8 bg-[hsl(var(--surface-overlay))] rounded w-1/3"></div>
                    <div className="h-32 bg-[hsl(var(--surface-overlay))] rounded-2xl w-full"></div>
                </div>
            </div>
        )
    }

    if (!pet) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <h2 className="text-xl font-semibold">Pet not found</h2>
                <Link href="/pets" className="text-[hsl(var(--accent))] hover:underline mt-4 inline-block">
                    Return to My Pets
                </Link>
            </div>
        )
    }

    // Calculate today's nutrition
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaysFoodLogs = foodLogs.filter(log => new Date(log.logged_at) >= today)
    const loggedCalories = todaysFoodLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0)
    const nutritionProgress = Math.min(1, loggedCalories / 400) // Default 400 for MVP Phase 1

    const nextVaccine = getNextVaccineDue(vaccineLogs)

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/pets"
                        className="p-2 rounded-full hover:bg-[hsl(var(--surface-overlay))] transition-colors text-[hsl(var(--foreground-muted))]"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                </div>
                <Link
                    href={`/pets/${pet.id}/edit`}
                    className="btn-secondary text-sm py-1.5 px-3"
                >
                    <Edit size={14} className="mr-1.5" />
                    Edit Pet
                </Link>
            </div>

            {/* ── Hero Profile ── */}
            <div className="card p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                {/* Abstract shape background hint */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[hsl(var(--accent))]/5 rounded-full blur-3xl" />

                <div className="relative w-32 h-32 rounded-full border-4 border-[hsl(var(--surface))] shadow-xl overflow-hidden bg-[hsl(var(--surface-raised))] flex items-center justify-center shrink-0 z-10 text-5xl">
                    {pet.avatar_url ? (
                        <Image src={pet.avatar_url} alt={pet.name} fill className="object-cover" />
                    ) : (
                        pet.species === 'cat' ? '🐱' : pet.species === 'dog' ? '🐶' : '🐾'
                    )}
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{pet.name}</h1>
                    <p className="text-[hsl(var(--foreground-muted))] mt-1 font-medium flex items-center justify-center md:justify-start gap-2">
                        <span className="capitalize">{pet.breed || pet.species}</span>
                        <span>•</span>
                        <span>{formatPetAge(pet.date_of_birth)} old</span>
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                        {pet.gender !== 'unknown' && (
                            <Badge>{pet.gender}</Badge>
                        )}
                        {pet.weight_kg && (
                            <Badge icon={<Weight size={12} />}>{pet.weight_kg} kg</Badge>
                        )}
                        {pet.size && (
                            <Badge icon={<Ruler size={12} />}>{pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}</Badge>
                        )}
                        {pet.is_neutered && (
                            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                Altered
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Health & Nutrition Grid ── */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Nutrition Card */}
                <div className="card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span>🍗</span> Today's Nutrition
                        </h3>
                        <Link href={`/pets/${pet.id}/food/new`} className="text-[hsl(var(--accent))] hover:bg-[hsl(var(--surface-overlay))] p-1.5 rounded-full transition-colors">
                            <PlusCircle size={18} />
                        </Link>
                    </div>

                    <div className="flex items-center justify-between">
                        <NutritionRing
                            progress={nutritionProgress}
                            loggedCalories={loggedCalories}
                            targetCalories={400}
                            size={90}
                        />
                        <div className="text-right">
                            <p className="font-medium text-[hsl(var(--foreground))]">{todaysFoodLogs.length} meals</p>
                            <p className="text-sm text-[hsl(var(--foreground-muted))]">logged today</p>
                        </div>
                    </div>
                </div>

                {/* Vaccines Card */}
                <div className="card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Syringe className="text-[hsl(var(--accent))]" size={18} /> Vaccines
                        </h3>
                        <Link href={`/pets/${pet.id}/vaccines/new`} className="text-[hsl(var(--accent))] hover:bg-[hsl(var(--surface-overlay))] p-1.5 rounded-full transition-colors">
                            <PlusCircle size={18} />
                        </Link>
                    </div>

                    {!nextVaccine ? (
                        <div className="py-2 text-center text-sm text-[hsl(var(--foreground-muted))]">
                            <p>No vaccines scheduled.</p>
                        </div>
                    ) : (
                        <div className={cn(
                            'rounded-xl p-3 border',
                            nextVaccine.isOverdue
                                ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                                : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'
                        )}>
                            <p className="font-medium text-sm">{nextVaccine.name}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className={cn("text-xs", nextVaccine.isOverdue ? "text-red-600 dark:text-red-400 font-semibold" : "text-amber-700 dark:text-amber-300")}>
                                    {nextVaccine.isOverdue ? 'Overdue' : `Due in ${nextVaccine.daysUntil} days`}
                                </span>
                                <span className="text-xs text-[hsl(var(--foreground-muted))]">
                                    {format(new Date(nextVaccine.date!), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Notes ── */}
            {(pet.medical_notes || pet.notes) && (
                <div className="card p-5 space-y-4">
                    <h3 className="font-semibold">Notes & Medical</h3>
                    {pet.medical_notes && (
                        <div className="bg-red-50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wider">Medical Alerts / Allergies</p>
                            <p className="text-sm text-red-900 dark:text-red-200">{pet.medical_notes}</p>
                        </div>
                    )}
                    {pet.notes && (
                        <div className="bg-[hsl(var(--surface-overlay))] p-3 rounded-xl">
                            <p className="text-xs font-semibold text-[hsl(var(--foreground-muted))] mb-1 uppercase tracking-wider">General Notes</p>
                            <p className="text-sm">{pet.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Weight Tracking ── */}
            <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Weight className="text-[hsl(var(--accent))]" size={18} /> Weight Tracking
                    </h3>
                </div>
                <WeightChart currentWeight={pet.weight_kg} />
            </div>

        </div>
    )
}

function Badge({ children, className, icon }: { children: React.ReactNode, className?: string, icon?: React.ReactNode }) {
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--surface-overlay))] text-[hsl(var(--foreground))]", className)}>
            {icon}
            {children}
        </span>
    )
}
