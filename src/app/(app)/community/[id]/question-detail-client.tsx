'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, CheckCircle, Clock, Heart, Eye, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { useQuestion } from '@/hooks/queries/use-community'
import { CommentThread } from '@/components/community/CommentThread'
import { LikeButton } from '@/components/community/LikeButton'
import { cn } from '@/lib/utils'

interface QuestionDetailClientProps {
    questionId: string
    currentUserId: string
}

export function QuestionDetailClient({ questionId, currentUserId }: QuestionDetailClientProps) {
    const { data: question, isLoading } = useQuestion(questionId)

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="h-10 w-32 bg-[hsl(var(--surface-overlay))] rounded-2xl animate-pulse" />
                <div className="block-card h-[400px] animate-pulse-slow" />
            </div>
        )
    }

    if (!question) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="block-card p-12 bg-transparent border-dashed">
                    <p className="text-2xl font-black mb-4 opacity-50">Empty Terrarium 🌵</p>
                    <p className="text-[hsl(var(--foreground-muted))] font-bold mb-8">Question not found or deleted.</p>
                    <Link href="/community" className="btn-game-primary px-8 py-4 inline-block">
                        <span className="font-black uppercase tracking-widest">Back to Gallery</span>
                    </Link>
                </div>
            </div>
        )
    }

    const authorName = question.profiles?.display_name || question.profiles?.username || 'Unknown'
    const authorAvatar = question.profiles?.avatar_url
    const isResolved = question.is_resolved

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
            {/* ── Back Navigation ── */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Link
                    href="/community"
                    className="btn-game-secondary px-5 py-3 flex items-center gap-2 w-fit group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Back to Forums</span>
                </Link>
            </motion.div>

            {/* ── Original Question ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="block-card p-8 md:p-12 relative overflow-hidden"
            >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-transparent via-transparent to-[hsl(var(--accent))]/5 -mr-32 -mt-32 rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20 shadow-sm">
                            {question.category}
                        </span>
                        {isResolved && (
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-2xl border border-emerald-100 shadow-sm">
                                <CheckCircle size={14} /> Solved
                            </span>
                        )}
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-[hsl(var(--foreground))] mb-8 relative z-10 leading-tight tracking-tight">
                    {question.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-[hsl(var(--foreground-muted))] mb-10 relative z-10 bg-[hsl(var(--surface-overlay))] p-4 rounded-3xl border border-[hsl(var(--border))] shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden flex items-center justify-center shrink-0 border border-[hsl(var(--border))] shadow-sm">
                            {authorAvatar ? (
                                <Image src={authorAvatar} alt={authorName} width={48} height={48} className="object-cover w-full h-full" />
                            ) : <span className="text-xl">👤</span>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-[hsl(var(--foreground))] leading-none">{authorName}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Verified Parent</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-[hsl(var(--border))] hidden md:block" />

                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <Clock size={16} className="text-[hsl(var(--accent))]" />
                            {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye size={16} className="text-[hsl(var(--accent))]" />
                            {question.view_count} views
                        </span>
                    </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none relative z-10 font-bold leading-relaxed text-[hsl(var(--foreground))] mb-12">
                    {question.content}
                </div>

                <div className="flex items-center gap-6 pt-8 border-t border-[hsl(var(--border-depth))]/20 relative z-10">
                    <LikeButton
                        targetId={question.id}
                        targetType="question"
                        currentUserId={currentUserId}
                        initialCount={question.like_count}
                    />
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[hsl(var(--surface-overlay))] border border-[hsl(var(--border))] shadow-inner">
                        <MessageCircle size={20} className="text-[hsl(var(--accent))]" />
                        <span className="text-sm font-black uppercase tracking-widest text-[hsl(var(--foreground))]">
                            {question.comment_count} Answers
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ── Comment Thread ── */}
            <CommentThread
                questionId={question.id}
                currentUserId={currentUserId}
                questionAuthorId={question.author_id}
                isResolved={isResolved}
            />
        </div>
    )
}
