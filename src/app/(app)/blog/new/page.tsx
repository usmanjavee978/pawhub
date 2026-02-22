import { BlogPostEditor } from '@/components/blog/BlogPostEditor'

export const metadata = {
    title: 'Write a Post - PawHub',
    description: 'Write a new blog post on PawHub.',
}

export default function NewBlogPostPage() {
    return (
        <main className="min-h-screen bg-[hsl(var(--background))] mt-16 md:mt-0 pb-24 md:pb-6">
            <BlogPostEditor />
        </main>
    )
}
