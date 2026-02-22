import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PetsClient } from './pets-client'

export const metadata: Metadata = { title: 'My Pets' }

export default async function PetsPage() {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const queryClient = new QueryClient()
    const supabase = createServerClient()

    await queryClient.prefetchQuery({
        queryKey: ['pets', 'list', user.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data ?? []
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PetsClient userId={user.id} />
        </HydrationBoundary>
    )
}
