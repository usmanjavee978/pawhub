import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { PetCard } from '@/components/pets/PetCard'
import type { Pet } from '@/types/database'

interface PetsClientProps {
    userId: string
}

export function PetsClient({ userId }: PetsClientProps) {
    const supabase = createBrowserClient()

    const { data: pets = [], isLoading } = useQuery<Pet[]>({
        queryKey: ['pets', 'list', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Pet[]
        },
    })

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-24 h-24 rounded-3xl bg-[hsl(var(--surface-overlay))] animate-pulse mb-4 shadow-inner" />
                <div className="h-4 bg-[hsl(var(--surface-overlay))] rounded-full w-48 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-black text-[hsl(var(--foreground))]">My Pets</h1>
                    <p className="text-[hsl(var(--foreground-muted))] font-bold mt-1">
                        Manage your furry family members
                    </p>
                </div>

                <Link href="/pets/new" className="btn-game-primary text-sm py-2 px-4">
                    <PlusCircle size={18} />
                    Add Pet
                </Link>
            </motion.div>

            {pets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 block-card border-dashed"
                >
                    <div className="text-6xl mb-4 drop-shadow-md">🐾</div>
                    <h3 className="text-xl font-black mb-2">No pets yet</h3>
                    <p className="text-[hsl(var(--foreground-muted))] font-bold mb-8 max-w-xs mx-auto">
                        Your pet family starts here. Add your first companion to begin tracking!
                    </p>
                    <Link href="/pets/new" className="btn-game-primary">
                        Add a Pet
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid gap-6 sm:grid-cols-2"
                >
                    {pets.map((pet) => (
                        <motion.div
                            key={pet.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9, y: 20 },
                                show: { opacity: 1, scale: 1, y: 0 }
                            }}
                        >
                            <PetCard pet={pet} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
