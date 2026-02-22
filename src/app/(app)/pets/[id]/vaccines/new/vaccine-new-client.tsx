'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { useCreateVaccineLog } from '@/hooks/queries/use-vaccine-logs'
import { VaccineLogForm } from '@/components/pets/VaccineLogForm'
import type { VaccineLogFormValues } from '@/lib/validations/vaccine-log'

interface VaccineNewClientProps {
    petId: string
    petName: string
    userId: string
}

export function VaccineNewClient({ petId, petName, userId }: VaccineNewClientProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const { mutateAsync: createLog, isPending } = useCreateVaccineLog()

    const handleSubmit = async (data: VaccineLogFormValues) => {
        try {
            setError(null)

            const administeredAtIso = data.administered_at ? new Date(data.administered_at).toISOString() : new Date().toISOString()
            const nextDueAtIso = data.next_due_at ? new Date(data.next_due_at).toISOString() : null

            await createLog({
                ...data,
                pet_id: petId,
                logged_by: userId,
                administered_at: administeredAtIso,
                next_due_at: nextDueAtIso,
            } as any) // Add as any for type impedance matching with exact Supabase generated types

            router.push(`/pets/${petId}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to log vaccine. Please try again.')
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
                    <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Log Vaccine</h1>
                    <p className="text-[hsl(var(--foreground-muted))] text-sm mt-0.5">
                        Keep {petName}'s health records up to date
                    </p>
                </div>
            </div>

            <VaccineLogForm
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/pets/${petId}`)}
                isSubmitting={isPending}
                error={error}
            />
        </div>
    )
}
