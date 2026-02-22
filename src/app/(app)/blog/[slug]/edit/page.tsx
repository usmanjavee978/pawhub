import { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient } from '@/lib/supabase/server'
import { EditPostClient } from './edit-post-client'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Edit Post - PawHub',
    description: 'Edit your PawHub blog post.',
}

export default async function EditPostPage({ params }: { params: { slug: string } }) {
    const queryClient = new QueryClient()
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return notFound() // or redirect to login
    }

    // Prefetch the specific blog post
    await queryClient.prefetchQuery({
        queryKey: ['blog_post', params.slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          *,
          profiles:author_id(username, display_name, avatar_url)
        `)
                .eq('slug', params.slug)
                .single()

            if (error || !data) throw error

            // Strict authorization check — you can only edit if you are the author
            if (data.author_id !== user.id) {
                throw new Error('Unauthorized')
            }

            return data
        },
    })

    // We can safely try/catch the above or let the client-component boundary handle errors,
    // but we know if prefetching throws, dehydrated state won't contain the data.
    // The client will see an error state from its own useQuery.

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditPostClient slug={params.slug} />
        </HydrationBoundary>
    )
}
