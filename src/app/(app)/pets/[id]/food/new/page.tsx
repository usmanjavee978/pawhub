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
        .maybeSingle()

    if (!pet) return notFound()

    // Explicit cast to resolve persistent 'never' narrowing issue on Vercel
    const petObj = pet as { id: string; name: string }
    return <FoodNewClient petId={petObj.id} petName={petObj.name} userId={user.id} />
}
