import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient } from '@/lib/supabase/server'
import { BlogClient } from './blog-client'

export const metadata = {
    title: 'Blog - PawHub',
    description: 'Read the latest stories and guides from the PawHub community.',
}

export default async function BlogPage() {
    const queryClient = new QueryClient()
    const supabase = createServerClient()

    // Prefetch 'all' category
    await queryClient.prefetchQuery({
        queryKey: ['blog_posts', { category: 'all', searchQuery: '' }],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          *,
          profiles:author_id(username, display_name, avatar_url)
        `)
                .eq('is_published', true)
                .order('published_at', { ascending: false })

            if (error) throw error
            return data
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BlogClient />
        </HydrationBoundary>
    )
}
