'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'

import { createBrowserClient } from '@/lib/supabase/client'
import { PetCard } from '@/components/pets/PetCard'
import type { Profile, Pet } from '@/types/database'

export function ProfileClient({ profileId, username }: { profileId: string, username: string }) {
    const supabase = createBrowserClient()

    const { data: profile } = useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single()
            if (error) throw error
            return data as Profile
        }
    })

    const { data: pets = [] } = useQuery({
        queryKey: ['user-pets', profileId],
        queryFn: async () => {
            const { data, error } = await supabase.from('pets').select('*').eq('owner_id', profileId).eq('is_active', true).order('created_at', { ascending: true })
            if (error) throw error
            return data as Pet[]
        }
    })

    if (!profile) return null

    const displayName = profile.display_name || profile.username || 'Anonymous'

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

            {/* ── Profile Header ── */}
            <div className="card overflow-hidden">
                {/* Banner (Abstract background) */}
                <div className="h-32 md:h-48 bg-gradient-to-tr from-[hsl(var(--accent))] to-purple-500 opacity-80" />

                <div className="px-6 md:px-10 pb-8 relative">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-16 md:-mt-20">
                        {/* Avatar */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[hsl(var(--background))] bg-[hsl(var(--surface))] overflow-hidden shadow-xl shrink-0">
                            {profile.avatar_url ? (
                                <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[hsl(var(--surface-overlay))] text-[hsl(var(--foreground-muted))]">
                                    <span className="text-4xl">👤</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-2 md:pt-24 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{displayName}</h1>
                                <p className="text-[hsl(var(--foreground-muted))] font-medium">@{profile.username}</p>
                            </div>

                            {profile.bio && (
                                <p className="max-w-2xl text-[hsl(var(--foreground))]">{profile.bio}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-[hsl(var(--foreground-muted))]">
                                {profile.location && (
                                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile.location}</span>
                                )}
                                {profile.website && (
                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[hsl(var(--accent))] transition-colors">
                                        <LinkIcon size={16} /> {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} /> Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Pets List ── */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {displayName}&apos;s Family
                </h2>

                {pets.length === 0 ? (
                    <div className="card p-12 text-center border-dashed bg-transparent border-[hsl(var(--border))]">
                        <p className="text-[hsl(var(--foreground-muted))]">{displayName} hasn&apos;t added any pets yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pets.map(pet => (
                            <div key={pet.id} className="pointer-events-none">
                                <PetCard pet={pet} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
