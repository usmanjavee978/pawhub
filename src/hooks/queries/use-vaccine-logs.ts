import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import type { VaccineLog, Database } from '@/types/database'

type VaccineLogInsert = Database['public']['Tables']['vaccine_logs']['Insert']

export function useVaccineLogs(petId: string) {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['vaccine-logs', petId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vaccine_logs')
                .select('*')
                .eq('pet_id', petId)
                .order('next_due_at', { ascending: true })

            if (error) throw error
            return data as VaccineLog[]
        },
        enabled: !!petId,
    })
}

export function useCreateVaccineLog() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (log: VaccineLogInsert) => {
            const { data, error } = await supabase
                .from('vaccine_logs')
                .insert(log)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['vaccine-logs', data.pet_id] })
        },
    })
}
