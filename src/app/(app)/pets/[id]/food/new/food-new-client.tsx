'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { useCreateFoodLog } from '@/hooks/queries/use-food-logs'
import { FoodLogForm } from '@/components/pets/FoodLogForm'
import type { FoodLogFormValues } from '@/lib/validations/food-log'

interface FoodNewClientProps {
    petId: string
    petName: string
    userId: string
}

export function FoodNewClient({ petId, petName, userId }: FoodNewClientProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const { mutateAsync: createLog, isPending } = useCreateFoodLog()

    const handleSubmit = async (data: FoodLogFormValues) => {
        try {
            setError(null)

            // We convert datetime-local string to ISO string for timestamptz
            const loggedAtIso = data.logged_at ? new Date(data.logged_at).toISOString() : new Date().toISOString()

            await createLog({
                ...data,
                pet_id: petId,
                logged_by: userId,
                logged_at: loggedAtIso,
            } as any) // Add as any for type impedance matching with exact Supabase generated types

            router.push(`/pets/${petId}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to log meal. Please try again.')
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href={`/pets/${petId}`}
                    className="p-2 rounded-full hover:bg-[hsl(var(--surface-overlay))] transition-colors text-[hsl(var(--foreground-muted))]"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Log Meal</h1>
                    <p className="text-[hsl(var(--foreground-muted))] text-sm mt-0.5">
                        What is {petName} eating?
                    </p>
                </div>
            </div>

            <FoodLogForm
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/pets/${petId}`)}
                isSubmitting={isPending}
                error={error}
            />
        </div>
    )
}
