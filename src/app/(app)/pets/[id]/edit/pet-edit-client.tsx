'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Trash2 } from 'lucide-react'

import { useUpdatePet, useDeletePet } from '@/hooks/queries/use-pets'
import { PetForm } from '@/components/pets/PetForm'
import type { Pet } from '@/types/database'
import type { PetFormValues } from '@/lib/validations/pet'

export function PetEditClient({ pet }: { pet: Pet }) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const { mutateAsync: updatePet, isPending: isUpdating } = useUpdatePet()
    const { mutateAsync: deletePet } = useDeletePet()

    const handleSubmit = async (data: PetFormValues & { avatar_url?: string | null }) => {
        try {
            setError(null)
            await updatePet({
                id: pet.id,
                ...data,
            } as any) // Type assertion due to some impedance matching with Zod inference

            router.push(`/pets/${pet.id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to update pet. Please try again.')
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${pet.name}?`)) return

        try {
            setIsDeleting(true)
            await deletePet(pet.id)
            router.push('/pets')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            alert('Failed to delete pet.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/pets/${pet.id}`}
                        className="p-2 rounded-full hover:bg-[hsl(var(--surface-overlay))] transition-colors text-[hsl(var(--foreground-muted))]"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Edit {pet.name}</h1>
                        <p className="text-[hsl(var(--foreground-muted))] text-sm mt-0.5">
                            Update your pet's information
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting || isUpdating}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl transition-colors"
                    title="Delete Pet"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <PetForm
                initialData={pet as any}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/pets/${pet.id}`)}
                isSubmitting={isUpdating || isDeleting}
                error={error}
            />
        </div>
    )
}
