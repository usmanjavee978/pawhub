'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenLine, Loader2 } from 'lucide-react'
import { useBlogPosts } from '@/hooks/queries/use-blog'
import { BlogCard } from '@/components/blog/BlogCard'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    { value: 'all', label: 'All Posts' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'health', label: 'Health' },
    { value: 'training', label: 'Training' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'lifestyle', label: 'Lifestyle' },
]

export function BlogClient() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 300)

    const { data: posts, isLoading } = useBlogPosts(activeCategory, debouncedSearch)

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

            {/* Header & Write Button */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12"
            >
                <div className="space-y-3">
                    <h1 className="text-5xl font-black tracking-tight leading-none">
                        The <span className="text-[hsl(var(--accent))]">Daily</span> Paw
                    </h1>
                    <p className="text-xl font-bold text-[hsl(var(--foreground-muted))] max-w-xl">
                        Guides, tips, and stories from our vibrant community.
                    </p>
                </div>
                <Link
                    href="/blog/new"
                    className="btn-game-primary px-8 py-5 flex items-center justify-center gap-3 group whitespace-nowrap shadow-[0_8px_0_0_hsl(var(--accent-depth))]"
                >
                    <PenLine className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase tracking-widest">Share a Story</span>
                </Link>
            </motion.div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
                <div className="relative flex-grow max-w-md group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                        <Search className="h-5 w-5 text-[hsl(var(--foreground-muted))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="input-block pl-12 h-14 font-bold text-lg"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar p-1">
                    {CATEGORIES.map((cat, i) => (
                        <motion.button
                            key={cat.value}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setActiveCategory(cat.value)}
                            className={cn(
                                "whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                activeCategory === cat.value
                                    ? "bg-[hsl(var(--accent))] text-white shadow-[0_4px_0_0_hsl(var(--accent-depth))]"
                                    : "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] shadow-[0_4px_0_0_hsl(var(--border-depth))]"
                            )}
                        >
                            {cat.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Masonry / Responsive Grid */}
            <AnimatePresence mode="popLayout">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center py-40"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--accent))]" />
                    </motion.div>
                ) : posts && posts.length > 0 ? (
                    <motion.div
                        layout
                        className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
                    >
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.05, type: 'spring' }}
                                className="break-inside-avoid"
                            >
                                <BlogCard post={post} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 block-card bg-transparent border-dashed"
                    >
                        <div className="w-24 h-24 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search className="h-10 w-10 text-[hsl(var(--foreground-muted))] opacity-20" />
                        </div>
                        <h3 className="text-3xl font-black mb-2 opacity-50">Nothing found here</h3>
                        <p className="text-xl font-bold text-[hsl(var(--foreground-muted))]">
                            Try exploring another category.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
