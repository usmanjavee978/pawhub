import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { Notification, Profile } from '@/types/database'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

type NotificationActor = Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
export type NotificationWithActor = Notification & {
    actor: NotificationActor
}

export function useNotifications(userId?: string) {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    const query = useQuery<NotificationWithActor[]>({
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
            return (data ?? []) as NotificationWithActor[]
        },
        enabled: !!userId,
    })

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
                async (payload: RealtimePostgresInsertPayload<Notification>) => {
                    const { data: actorRecord } = await supabase
                        .from('profiles')
                        .select('username, display_name, avatar_url')
                        .eq('id', payload.new.actor_id)
                        .maybeSingle()

                    const newNotification: NotificationWithActor = {
                        ...payload.new,
                        actor: actorRecord,
                    }

                    queryClient.setQueryData<NotificationWithActor[]>(
                        ['notifications', userId],
                        (old = []) => [newNotification, ...old]
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
            queryClient.setQueryData<NotificationWithActor[]>(
                ['notifications', userId],
                (old = []) => old.map((n) => ({ ...n, is_read: true }))
            )
        }
    })
}
