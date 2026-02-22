'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { useCreatePet } from '@/hooks/queries/use-pets'
import { PetForm } from '@/components/pets/PetForm'
import { createBrowserClient } from '@/lib/supabase/client'
import type { PetFormValues } from '@/lib/validations/pet'

export default function NewPetPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const { mutateAsync: createPet, isPending } = useCreatePet()
    const supabase = createBrowserClient()

    const handleSubmit = async (data: PetFormValues & { avatar_url?: string | null }) => {
        try {
            setError(null)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('You must be logged in to add a pet.')
            }

            await createPet({
                ...data,
                owner_id: user.id,
                is_active: true,
            } as any) // Type assertion due to optional/nullable impedance matching from Zod

            router.push('/pets')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to create pet. Please try again.')
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/pets"
                    className="p-2 rounded-full hover:bg-[hsl(var(--surface-overlay))] transition-colors text-[hsl(var(--foreground-muted))]"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Add a Pet</h1>
                    <p className="text-[hsl(var(--foreground-muted))] text-sm mt-0.5">
                        Tell us about your furry family member
                    </p>
                </div>
            </div>

            <PetForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/pets')}
                isSubmitting={isPending}
                error={error}
            />
        </div>
    )
}
