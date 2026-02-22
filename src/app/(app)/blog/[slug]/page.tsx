import { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createServerClient } from '@/lib/supabase/server'
import { BlogDetailClient } from './blog-detail-client'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = createServerClient()
    const { data } = await supabase
        .from('blog_posts')
        .select('title, excerpt, cover_image_url')
        .eq('slug', params.slug)
        .single()

    if (!data) {
        return {
            title: 'Post Not Found - PawHub',
        }
    }

    return {
        title: `${data.title} - PawHub Blog`,
        description: data.excerpt || 'Read this post on PawHub.',
        openGraph: {
            images: data.cover_image_url ? [data.cover_image_url] : [],
        },
    }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const queryClient = new QueryClient()
    const supabase = createServerClient()

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
            return data
        },
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BlogDetailClient slug={params.slug} />
        </HydrationBoundary>
    )
}
