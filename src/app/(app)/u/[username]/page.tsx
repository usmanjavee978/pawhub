import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileClient } from './profile-client'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const resolvedParams = await params
    return { title: `@${resolvedParams.username} | PawHub` }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params
    const { username } = resolvedParams

    const queryClient = new QueryClient()
    const supabase = createServerClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (error || !profile) notFound()

    await queryClient.prefetchQuery({
        queryKey: ['profile', username],
        queryFn: () => profile,
    })

    await queryClient.prefetchQuery({
        queryKey: ['user-pets', profile.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', profile.id)
                .eq('is_active', true)
                .order('created_at', { ascending: true })
            return data ?? []
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileClient profileId={profile.id} username={username} />
        </HydrationBoundary>
    )
}
