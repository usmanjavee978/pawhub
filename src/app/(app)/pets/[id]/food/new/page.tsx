import type { Metadata } from 'next'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FoodNewClient } from './food-new-client'

export const metadata: Metadata = { title: 'Log Meal' }

export default async function NewFoodLogPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const resolvedParams = await params
    const petId = resolvedParams.id

    const supabase = createServerClient()

    // Verify ownership
    const { data: pet } = await supabase
        .from('pets')
        .select('id, name')
        .eq('id', petId)
        .eq('owner_id', user.id)
        .single()

    if (!pet) notFound()
    const safePet = pet!
    return <FoodNewClient petId={safePet.id} petName={safePet.name} userId={user.id} />
}
