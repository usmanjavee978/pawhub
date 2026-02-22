import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CommunityClient } from './community-client'

export const metadata: Metadata = { title: 'Community Pulse' }

export default async function CommunityPage() {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const queryClient = new QueryClient()
    const supabase = createServerClient()

    await queryClient.prefetchQuery({
        queryKey: ['questions', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('questions')
                .select(`
          *,
          profiles:author_id(username, avatar_url, display_name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data ?? []
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CommunityClient />
        </HydrationBoundary>
    )
}
