import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PetDetailClient } from './pet-detail-client'

export const metadata: Metadata = { title: 'Pet Details' }

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const resolvedParams = await params
    const petId = resolvedParams.id

    const queryClient = new QueryClient()
    const supabase = createServerClient()

    // Fetch pet data to prefetch and verify ownership
    const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

    const petData = pet as any
    if (petError || !pet || petData.owner_id !== user.id || !petData.is_active) {
        notFound()
    }

    await queryClient.prefetchQuery({
        queryKey: ['pets', petId],
        queryFn: () => pet,
    })

    await queryClient.prefetchQuery({
        queryKey: ['food-logs', petId],
        queryFn: async () => {
            const { data } = await supabase
                .from('food_logs')
                .select('*')
                .eq('pet_id', petId)
                .order('logged_at', { ascending: false })
                .limit(50)
            return data ?? []
        },
    })

    await queryClient.prefetchQuery({
        queryKey: ['vaccine-logs', petId],
        queryFn: async () => {
            const { data } = await supabase
                .from('vaccine_logs')
                .select('*')
                .eq('pet_id', petId)
                .order('next_due_at', { ascending: true })
            return data ?? []
        },
    })

    // Prefetch for edit view as well just in case
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PetDetailClient petId={petId} />
        </HydrationBoundary>
    )
}
