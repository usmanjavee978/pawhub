import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { Notification } from '@/types/database'

export function useNotifications(userId?: string) {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    // 1. Fetch initial notifications
    const query = useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
          *,
          actor:actor_id(username, display_name, avatar_url)
        `)
                .eq('user_id', userId as string)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            return data
        },
        enabled: !!userId,
    })

    // 2. Subscribe to realtime updates
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                async (payload) => {
                    // Fetch the actor details for the new notification since Realtime only sends raw row
                    const { data: actorRecord } = await supabase
                        .from('profiles')
                        .select('username, display_name, avatar_url')
                        .eq('id', payload.new.actor_id)
                        .single()

                    const newNotification = {
                        ...payload.new,
                        actor: actorRecord
                    } as any // Cast to our extended Notification type

                    queryClient.setQueryData(
                        ['notifications', userId],
                        (old: any[] | undefined) => {
                            if (!old) return [newNotification]
                            return [newNotification, ...old]
                        }
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, queryClient])

    return query
}

export function useMarkNotificationsRead() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (error) throw error
        },
        onSuccess: (_, userId) => {
            queryClient.setQueryData(
                ['notifications', userId],
                (old: any[] | undefined) => {
                    if (!old) return []
                    return old.map(n => ({ ...n, is_read: true }))
                }
            )
        }
    })
}
