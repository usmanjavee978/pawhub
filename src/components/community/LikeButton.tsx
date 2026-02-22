'use client'

import { Heart } from 'lucide-react'
import { useToggleLike, useIsLiked } from '@/hooks/queries/use-community'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
    targetId: string
    targetType: 'question' | 'comment' | 'blog_post'
    initialCount: number
    currentUserId?: string
    className?: string
    variant?: 'minimal' | 'full'
}

export function LikeButton({
    targetId,
    targetType,
    initialCount,
    currentUserId,
    className,
    variant = 'full'
}: LikeButtonProps) {
    const { data: isLiked } = useIsLiked(targetId, targetType, currentUserId)
    const { mutate: toggleLike } = useToggleLike()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!currentUserId) return
        toggleLike({ targetId, targetType, userId: currentUserId, isLiked: !!isLiked })
    }

    const label = isLiked ? `Unlike this ${targetType}` : `Like this ${targetType}`

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleClick}
                aria-label={label}
                aria-pressed={!!isLiked}
                disabled={!currentUserId}
                className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    isLiked ? "text-red-500" : "text-[hsl(var(--foreground-muted))] hover:text-red-500",
                    className
                )}
            >
                <Heart size={14} className={cn(isLiked && "fill-current")} />
                <span>{initialCount}</span>
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            aria-label={label}
            aria-pressed={!!isLiked}
            disabled={!currentUserId}
            className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-full border",
                isLiked
                    ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/50"
                    : "bg-[hsl(var(--surface-overlay))] text-[hsl(var(--foreground-muted))] hover:text-red-500 border-transparent",
                className
            )}
        >
            <Heart size={16} className={cn(isLiked && "fill-current")} />
            <span>{initialCount} {initialCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
    )
}
