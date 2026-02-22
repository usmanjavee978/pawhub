import type { Metadata } from 'next'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { VaccineNewClient } from './vaccine-new-client'

export const metadata: Metadata = { title: 'Log Vaccine' }

export default async function NewVaccineLogPage({ params }: { params: Promise<{ id: string }> }) {
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

    const petObj = pet as { id: string; name: string }

    return <VaccineNewClient petId={petObj.id} petName={petObj.name} userId={user.id} />
}
