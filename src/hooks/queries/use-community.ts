import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Question, Comment, Like, Database } from '@/types/database'

type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type CommentInsert = Database['public']['Tables']['comments']['Insert']
type LikeInsert = Database['public']['Tables']['likes']['Insert']

// ─── QUESTIONS ──────────────────────────────────────────────────

export function useQuestions(category?: string) {
    const supabase = createBrowserClient()
    return useQuery({
        queryKey: ['questions', category],
        queryFn: async () => {
            let query = supabase.from('questions').select(`
        *,
        profiles:author_id(username, avatar_url, display_name)
      `).order('created_at', { ascending: false })

            if (category && category !== 'all') {
                query = query.eq('category', category)
            }

            const { data, error } = await query
            if (error) throw error
            return data
        }
    })
}

export function useQuestion(id: string) {
    const supabase = createBrowserClient()
    return useQuery({
        queryKey: ['questions', id],
        queryFn: async () => {
            const { data, error } = await supabase.from('questions').select(`
        *,
        profiles:author_id(username, avatar_url, display_name)
      `).eq('id', id).single()

            if (error) throw error
            return data
        },
        enabled: !!id,
    })
}

export function useCreateQuestion() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (question: QuestionInsert) => {
            const { data, error } = await supabase.from('questions').insert(question).select().single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] })
        }
    })
}

// ─── COMMENTS (10s Polling) ─────────────────────────────────────

export function useComments(questionId: string) {
    const supabase = createBrowserClient()
    return useQuery({
        queryKey: ['comments', questionId],
        queryFn: async () => {
            const { data, error } = await supabase.from('comments').select(`
        *,
        profiles:author_id(username, avatar_url, display_name)
      `).eq('question_id', questionId).order('created_at', { ascending: true })

            if (error) throw error
            return data
        },
        enabled: !!questionId,
        refetchInterval: 10000, // 10-second polling as per TRD
    })
}

export function useCreateComment() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (comment: CommentInsert) => {
            const { data, error } = await supabase.from('comments').insert(comment).select().single()
            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Provide optimistic-like immediate invalidation
            queryClient.invalidateQueries({ queryKey: ['comments', data.question_id] })
        }
    })
}

export function useAcceptAnswer() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ commentId, questionId }: { commentId: string, questionId: string }) => {
            // In a real app we'd wrap this in an RPC or DB transaction,
            // but for MVP we update the question to resolved and comment to accepted.
            const { error: error1 } = await supabase.from('comments').update({ is_accepted_answer: true }).eq('id', commentId)
            if (error1) throw error1

            const { error: error2 } = await supabase.from('questions').update({ is_resolved: true }).eq('id', questionId)
            if (error2) throw error2
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['questions', variables.questionId] })
            queryClient.invalidateQueries({ queryKey: ['comments', variables.questionId] })
        }
    })
}

// ─── LIKES ──────────────────────────────────────────────────────

export function useToggleLike() {
    const supabase = createBrowserClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ targetId, targetType, userId, isLiked }: { targetId: string, targetType: 'question' | 'comment' | 'blog_post', userId: string, isLiked: boolean }) => {
            if (isLiked) {
                // Unlike
                const { error } = await supabase.from('likes')
                    .delete()
                    .match({ user_id: userId, target_id: targetId, target_type: targetType })
                if (error) throw error
            } else {
                // Like
                const { error } = await supabase.from('likes')
                    .insert({ user_id: userId, target_id: targetId, target_type: targetType })
                if (error) throw error
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate specific questions or comments
            if (variables.targetType === 'question') {
                queryClient.invalidateQueries({ queryKey: ['questions'] })
            } else if (variables.targetType === 'comment') {
                queryClient.invalidateQueries({ queryKey: ['comments'] })
            } else {
                queryClient.invalidateQueries({ queryKey: ['blog_posts'] })
            }
        }
    })
}

// Hook to check if current user liked a target
export function useIsLiked(targetId: string, targetType: 'question' | 'comment' | 'blog_post', userId?: string) {
    const supabase = createBrowserClient()
    return useQuery({
        queryKey: ['likes', targetId, userId],
        queryFn: async () => {
            if (!userId) return false
            const { data, error } = await supabase.from('likes')
                .select('id')
                .match({ target_id: targetId, target_type: targetType, user_id: userId })
                .maybeSingle()

            if (error) throw error
            return !!data
        },
        enabled: !!targetId && !!userId,
    })
}
