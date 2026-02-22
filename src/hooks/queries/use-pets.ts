import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useAnimationStore } from '@/stores/animation-store'
import type { Pet, Database } from '@/types/database'

type PetInsert = Database['public']['Tables']['pets']['Insert']
type PetUpdate = Database['public']['Tables']['pets']['Update']

export function usePets() {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['pets'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pets')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Pet[]
        },
    })
}

export function usePet(petId: string) {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['pets', petId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pets')
                .select('*')
                .eq('id', petId)
                .single()

            if (error) throw error
            return data as Pet
        },
        enabled: !!petId,
    })
}

export function useCreatePet() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()
    const triggerCelebration = useAnimationStore((s) => s.triggerCelebration)

    return useMutation({
        mutationFn: async (pet: PetInsert) => {
            const { data, error } = await supabase
                .from('pets')
                .insert(pet)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] })
            triggerCelebration() // Character celebrates when a new pet is added!
        },
    })
}

export function useUpdatePet() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...changes }: PetUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('pets')
                .update(changes)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pets'] })
            queryClient.invalidateQueries({ queryKey: ['pets', data.id] })
        },
    })
}

export function useDeletePet() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('pets')
                .update({ is_active: false })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] })
        },
    })
}
