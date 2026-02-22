import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ThumbsUp, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'

interface Author {
    username: string
    avatar_url: string | null
    display_name: string | null
}

interface QuestionProps {
    id: string
    title: string
    category: string
    content: string
    like_count: number
    comment_count: number
    is_resolved: boolean
    created_at: string
    profiles?: Author | null
}

export function QuestionCard({ question }: { question: QuestionProps }) {
    const authorName = question.profiles?.display_name || question.profiles?.username || 'Unknown User'
    const authorAvatar = question.profiles?.avatar_url
    const isResolved = question.is_resolved

    return (
        <Link
            href={`/community/${question.id}`}
            className="block card p-5 hover:border-[hsl(var(--accent))] transition-colors group"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--surface-overlay))] text-[hsl(var(--accent))] capitalize">
                    {question.category}
                </span>
                {isResolved && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={14} /> Solved
                    </span>
                )}
            </div>

            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
                {question.title}
            </h3>

            <p className="text-sm text-[hsl(var(--foreground-muted))] line-clamp-2 mb-4">
                {question.content}
            </p>

            <div className="flex items-center justify-between text-xs text-[hsl(var(--foreground-muted))] mt-auto pt-4 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--surface-overlay))] overflow-hidden flex items-center justify-center shrink-0">
                        {authorAvatar ? (
                            <Image src={authorAvatar} alt={authorName} width={24} height={24} className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-[10px] select-none">👤</span>
                        )}
                    </div>
                    <span className="font-medium text-[hsl(var(--foreground))]">{authorName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <span className="flex items-center gap-1.5 focus-within:text-red-500">
                        <ThumbsUp size={14} />
                        {question.like_count}
                    </span>
                    <span className={cn("flex items-center gap-1.5", question.comment_count > 0 && "text-[hsl(var(--accent))] font-medium")}>
                        <MessageCircle size={14} />
                        {question.comment_count}
                    </span>
                </div>
            </div>
        </Link>
    )
}
