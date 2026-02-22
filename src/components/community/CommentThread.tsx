import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle, Clock, Heart, MessageCircle, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useComments, useCreateComment, useAcceptAnswer } from '@/hooks/queries/use-community'
import { LikeButton } from '@/components/community/LikeButton'
import { commentSchema, type CommentFormValues } from '@/lib/validations/community'
import { cn } from '@/lib/utils'

export function CommentThread({ questionId, currentUserId, questionAuthorId, isResolved }: any) {
    const { data: comments = [], isLoading } = useComments(questionId)
    const { mutateAsync: createComment, isPending: isCreating } = useCreateComment()
    const { mutate: acceptAnswer } = useAcceptAnswer()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>({
        resolver: zodResolver(commentSchema)
    })

    const onSubmit = async (data: CommentFormValues) => {
        await createComment({
            content: data.content,
            question_id: questionId,
            author_id: currentUserId,
        })
        reset()
    }

    const handleAccept = (commentId: string) => {
        if (currentUserId !== questionAuthorId) return
        acceptAnswer({ commentId, questionId })
    }

    if (isLoading) return (
        <div className="py-12 space-y-4">
            <div className="h-20 bg-[hsl(var(--surface-overlay))] rounded-3xl animate-pulse" />
            <div className="h-20 bg-[hsl(var(--surface-overlay))] rounded-3xl animate-pulse delay-75" />
        </div>
    )

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between border-b-4 border-[hsl(var(--border-depth))]/10 pb-4">
                <h3 className="font-black text-2xl uppercase tracking-tighter text-[hsl(var(--foreground))]">
                    {comments.length} Discussion{comments.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] opacity-40" />
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {comments.map((comment: any, index: number) => {
                        const authorName = comment.profiles?.display_name || comment.profiles?.username || 'Unknown'
                        const authorAvatar = comment.profiles?.avatar_url
                        const isAccepted = comment.is_accepted_answer

                        return (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
                                className={cn(
                                    "block-card p-6 md:p-8 relative transition-shadow",
                                    isAccepted ? "border-emerald-500 shadow-[0_8px_0_0_rgba(16,185,129,1)]" : "block-card-hover"
                                )}
                            >
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-[hsl(var(--border))] shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
                                        {authorAvatar ? (
                                            <Image src={authorAvatar} alt={authorName} width={48} height={48} className="object-cover w-full h-full" />
                                        ) : <span className="text-xl">👤</span>}
                                    </div>

                                    <div className="flex-1 space-y-4 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[hsl(var(--foreground))] leading-none">{authorName}</span>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--foreground-muted))] mt-1.5 opacity-60">
                                                    <Clock size={12} className="text-[hsl(var(--accent))]" />
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </div>
                                            </div>

                                            {isAccepted && (
                                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-2xl border border-emerald-100 shadow-sm animate-in zoom-in duration-500">
                                                    <CheckCircle size={14} /> Official Answer
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[hsl(var(--foreground))] font-bold leading-relaxed whitespace-pre-wrap text-base">
                                            {comment.content}
                                        </p>

                                        <div className="flex items-center gap-6 pt-4 border-t border-[hsl(var(--border))]">
                                            <LikeButton
                                                targetId={comment.id}
                                                targetType="comment"
                                                currentUserId={currentUserId}
                                                initialCount={comment.like_count}
                                                variant="minimal"
                                            />

                                            {!isResolved && currentUserId === questionAuthorId && !isAccepted && (
                                                <button
                                                    onClick={() => handleAccept(comment.id)}
                                                    className="btn-game-secondary px-4 py-1.5"
                                                >
                                                    <span className="font-black uppercase tracking-widest text-[9px]">Accept Answer</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* Comment Form */}
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="block-card p-8 bg-[hsl(var(--surface-overlay))] mt-12 border-dashed"
                >
                    <div className="mb-6">
                        <h4 className="font-black uppercase tracking-widest text-xs mb-2 text-[hsl(var(--accent))]">Submit your answer</h4>
                        <textarea
                            {...register('content')}
                            placeholder="Share your expertise with the paw-rents..."
                            className={cn(
                                "input-block min-h-[140px] px-6 py-4 font-bold text-lg bg-white",
                                errors.content && "border-red-500 shadow-[0_6px_0_0_rgba(239,68,68,1)]"
                            )}
                        />
                        {errors.content && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-3 block ml-1">
                                ⚠️ {errors.content?.message}
                            </motion.span>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="btn-game-primary px-10 py-4 flex items-center gap-3"
                        >
                            <span className="font-black uppercase tracking-widest">
                                {isCreating ? 'Transmitting...' : 'Post Wisdom'}
                            </span>
                            <Send size={18} className={cn(isCreating && "animate-pulse")} />
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}
