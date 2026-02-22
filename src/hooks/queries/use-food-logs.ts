import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useAnimationStore } from '@/stores/animation-store'
import type { FoodLog, Database } from '@/types/database'

type FoodLogInsert = Database['public']['Tables']['food_logs']['Insert']

export function useFoodLogs(petId: string) {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['food-logs', petId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('pet_id', petId)
                .order('logged_at', { ascending: false })
                .limit(50)

            if (error) throw error
            return data as FoodLog[]
        },
        enabled: !!petId,
    })
}

export function useCreateFoodLog() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()
    const triggerFeed = useAnimationStore((s) => s.triggerFeedAnimation)

    return useMutation({
        mutationFn: async (log: FoodLogInsert) => {
            const { data, error } = await supabase
                .from('food_logs')
                .insert(log)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['food-logs', data.pet_id] })
            triggerFeed() // Character eating animation triggers on food log!
        },
    })
}
