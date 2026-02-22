'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatPetAge } from '@/lib/helpers/pet-age'
import type { Pet } from '@/types/database'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PetCardProps {
    pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ y: 2 }}
        >
            <Link
                href={`/pets/${pet.id}`}
                className={cn(
                    "flex items-center gap-5 p-5 rounded-[2rem] group block-card transition-all",
                    "hover:border-[hsl(var(--accent))] hover:shadow-[0_8px_0_0_hsl(var(--border-depth))]"
                )}
            >
                <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--surface-overlay))] flex items-center justify-center overflow-hidden shrink-0 text-4xl shadow-inner border border-[hsl(var(--border))]/50">
                    {pet.avatar_url ? (
                        <Image
                            src={pet.avatar_url}
                            alt={pet.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
                            {pet.species === 'cat' ? '🐱' : pet.species === 'dog' ? '🐶' : '🐾'}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl text-[hsl(var(--foreground))] truncate leading-tight">
                        {pet.name}
                    </h3>
                    <p className="text-sm font-bold text-[hsl(var(--foreground-muted))] mt-1 truncate flex items-center gap-1.5">
                        <span className="bg-[hsl(var(--surface-overlay))] px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider">
                            {pet.breed || pet.species}
                        </span>
                        <span>•</span>
                        <span>{formatPetAge(pet.date_of_birth)}</span>
                    </p>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--surface-overlay))] group-hover:bg-[hsl(var(--accent-muted))] transition-colors group-hover:translate-x-1 duration-200">
                    <ChevronRight className="text-[hsl(var(--foreground-muted))] group-hover:text-[hsl(var(--accent))] transition-colors shrink-0" size={24} />
                </div>
            </Link>
        </motion.div>
    )
}
