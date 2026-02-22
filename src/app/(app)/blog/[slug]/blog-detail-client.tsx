'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Calendar, Eye, PenLine } from 'lucide-react'

import { useBlogPost, useIncrementViewCount } from '@/hooks/queries/use-blog'
import { LikeButton } from '@/components/community/LikeButton'
import { createBrowserClient } from '@/lib/supabase/client'

export function BlogDetailClient({ slug }: { slug: string }) {
    const { data: post, isLoading, isError } = useBlogPost(slug)
    const incrementViewCount = useIncrementViewCount()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    // Fetch current user to determine if we show the "Edit" button
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createBrowserClient()
            const { data } = await supabase.auth.getUser()
            if (data.user) {
                setCurrentUserId(data.user.id)
            }
        }
        fetchUser()
    }, [])

    // Silently increment view count on mount
    useEffect(() => {
        if (post && post.id) {
            incrementViewCount.mutate(post.id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post?.id])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-[hsl(var(--accent))] border-t-transparent"></div>
            </div>
        )
    }

    if (isError || !post) {
        return notFound()
    }

    const isAuthor = currentUserId === post.author_id
    const hasCover = !!post.cover_image_url

    return (
        <article className="min-h-screen bg-[hsl(var(--background))] pb-24 md:pb-12">
            {/* Hero Header */}
            <header className="relative w-full mb-12">
                {hasCover ? (
                    <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden bg-[hsl(var(--surface-overlay))]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-black/30 to-transparent z-10" />
                        <Image
                            src={post.cover_image_url!}
                            alt={post.title}
                            fill
                            className="object-cover scale-105"
                            priority
                            sizes="100vw"
                        />

                        {/* Hero Content overlaid on image */}
                        <div className="absolute bottom-0 left-0 w-full z-20 px-4 pb-12">
                            <div className="max-w-4xl mx-auto container">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <span className="px-4 py-1.5 bg-[hsl(var(--accent))] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                                            {post.category}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 drop-shadow-xl leading-none">
                                        {post.title}
                                    </h1>
                                    {post.excerpt && (
                                        <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl font-bold leading-relaxed opacity-90">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Fallback Header without image
                    <div className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <span className="px-4 py-1.5 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[hsl(var(--accent))]/20">
                                {post.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-[hsl(var(--foreground))] tracking-tighter leading-none">
                                {post.title}
                            </h1>
                            {post.excerpt && (
                                <p className="text-xl md:text-2xl text-[hsl(var(--foreground-muted))] max-w-3xl font-bold leading-relaxed">
                                    {post.excerpt}
                                </p>
                            )}
                        </motion.div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Navigation & Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-6 py-6 mb-12 bg-[hsl(var(--surface-overlay))] p-6 rounded-3xl border border-[hsl(var(--border))] shadow-inner">
                    <Link
                        href="/blog"
                        className="btn-game-secondary px-5 py-3 flex items-center gap-2 group"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-xs">Back to Feed</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {/* Author */}
                        <Link href={`/u/${post.profiles?.username}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border border-[hsl(var(--border))] shadow-sm group-hover:scale-110 transition-transform">
                                {post.profiles?.avatar_url ? (
                                    <Image src={post.profiles.avatar_url} alt="Author" width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] font-black text-sm">
                                        {(post.profiles?.display_name || 'A')[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black group-hover:text-[hsl(var(--accent))] transition-colors leading-none">
                                    {post.profiles?.display_name || post.profiles?.username}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--foreground-muted))] mt-1 opacity-60">
                                    {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Draft'}
                                </span>
                            </div>
                        </Link>

                        <div className="h-10 w-px bg-[hsl(var(--border))] hidden sm:block" />

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground-muted))]">
                                <Eye size={16} className="text-[hsl(var(--accent))]" />
                                <span>{post.view_count}</span>
                            </div>
                            <LikeButton
                                targetId={post.id}
                                targetType="blog_post"
                                initialCount={post.like_count}
                            />
                        </div>

                        {/* Edit Button for Author */}
                        {isAuthor && (
                            <Link
                                href={`/blog/${post.slug}/edit`}
                                className="btn-game-secondary py-2 px-4 flex items-center gap-2"
                            >
                                <PenLine size={14} />
                                <span className="font-black uppercase tracking-widest text-[10px]">Edit</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Markdown Body */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-slate dark:prose-invert prose-lg max-w-none md:prose-xl prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-[hsl(var(--border))] prose-headings:font-black prose-headings:tracking-tighter prose-a:text-[hsl(var(--accent))] font-bold leading-relaxed text-[hsl(var(--foreground))]"
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content_text}
                    </ReactMarkdown>
                </motion.div>
            </div>
        </article>
    )
}
