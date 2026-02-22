import type { Metadata } from 'next'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PetEditClient } from './pet-edit-client'

export const metadata: Metadata = { title: 'Edit Pet' }

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const resolvedParams = await params
    const petId = resolvedParams.id

    const supabase = createServerClient()

    const { data: pet, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

    const petData = pet as any
    if (error || !pet || petData.owner_id !== user.id || !petData.is_active) {
        notFound()
    }

    return <PetEditClient pet={petData} />
}
