'use client'

import { useBlogPost } from '@/hooks/queries/use-blog'
import { BlogPostEditor } from '@/components/blog/BlogPostEditor'
import { Loader2 } from 'lucide-react'

export function EditPostClient({ slug }: { slug: string }) {
    const { data: post, isLoading, isError } = useBlogPost(slug)

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--accent))]" />
            </div>
        )
    }

    if (isError || !post) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center px-4">
                <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Post</h2>
                <p className="text-[hsl(var(--foreground-muted))]">We couldn't load this post, or you lack permission to edit it.</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[hsl(var(--background))] mt-16 md:mt-0 pb-24 md:pb-6">
            <BlogPostEditor initialData={post} isEditing={true} />
        </main>
    )
}
