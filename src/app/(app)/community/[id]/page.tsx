import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuestionDetailClient } from './question-detail-client'

export const metadata: Metadata = { title: 'Question Detail' }

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const resolvedParams = await params
    const questionId = resolvedParams.id

    const queryClient = new QueryClient()
    const supabase = createServerClient()

    const { data: question, error } = await supabase
        .from('questions')
        .select(`
      *,
      profiles:author_id(username, avatar_url, display_name)
    `)
        .eq('id', questionId)
        .single()

    if (error || !question) notFound()

    // Track view count (simple implementation, not deduplicated by IP)
    await supabase.rpc('increment_question_view_count', { q_id: question.id }).catch(() => {
        // Fallback if the RPC does not exist
        supabase.from('questions').update({ view_count: question.view_count + 1 }).eq('id', question.id).then()
    })

    await queryClient.prefetchQuery({
        queryKey: ['questions', questionId],
        queryFn: () => question,
    })

    await queryClient.prefetchQuery({
        queryKey: ['comments', questionId],
        queryFn: async () => {
            const { data } = await supabase
                .from('comments')
                .select(`
          *,
          profiles:author_id(username, avatar_url, display_name)
        `)
                .eq('question_id', questionId)
                .order('created_at', { ascending: true })
            return data ?? []
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QuestionDetailClient questionId={questionId} currentUserId={user.id} />
        </HydrationBoundary>
    )
}
