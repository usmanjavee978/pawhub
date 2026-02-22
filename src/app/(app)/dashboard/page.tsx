import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const { user, profile } = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const queryClient = new QueryClient()
  const supabase    = createServerClient()

  // Prefetch pets with today's food logs and upcoming vaccines
  // Zero loading spinners on mount — data is already in the cache
  await queryClient.prefetchQuery({
    queryKey: ['pets', 'list', user.id],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          food_logs!food_logs_pet_id_fkey(
            id, food_name, calories, meal_type, logged_at
          ),
          vaccine_logs!vaccine_logs_pet_id_fkey(
            id, vaccine_name, status, next_due_at
          )
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .gte('food_logs.logged_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient
        userId={user.id}
        displayName={profile?.display_name ?? profile?.username ?? 'there'}
      />
    </HydrationBoundary>
  )
}
