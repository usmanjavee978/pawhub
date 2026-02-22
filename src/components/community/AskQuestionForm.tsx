'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { questionSchema, type QuestionFormValues } from '@/lib/validations/community'
import { cn } from '@/lib/utils'

interface AskQuestionFormProps {
    onSubmit: (data: QuestionFormValues) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    error?: string | null
}

const CATEGORY_OPTIONS = [
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'health', label: 'Health' },
    { value: 'training', label: 'Training' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'gear', label: 'Gear' },
    { value: 'general', label: 'General' },
]

export function AskQuestionForm({ onSubmit, onCancel, isSubmitting = false, error }: AskQuestionFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            title: '',
            category: 'general',
            content: '',
        }
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
                <div className="p-4 text-sm font-bold rounded-2xl bg-red-50 text-red-600 border border-red-100 animate-in fade-in zoom-in duration-300">
                    <span className="flex items-center gap-2">⚠️ {error}</span>
                </div>
            )}

            <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground-muted))] ml-1">Question Title *</label>
                <input
                    {...register('title')}
                    className={cn("input-block", errors.title && "border-red-500 shadow-[0_6px_0_0_#fee2e2]")}
                    placeholder="e.g. Best kibble for a sensitive stomach?"
                />
                {errors.title && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground-muted))] ml-1">Category</label>
                <div className="relative">
                    <select
                        {...register('category')}
                        className="input-block appearance-none bg-white cursor-pointer"
                    >
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <PlusCircle size={16} className="rotate-45" />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground-muted))] ml-1">Details *</label>
                <textarea
                    {...register('content')}
                    className={cn("input-block min-h-[160px] py-4", errors.content && "border-red-500 shadow-[0_6px_0_0_#fee2e2]")}
                    placeholder="Describe your situation in detail..."
                />
                {errors.content && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.content.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="btn-game-secondary flex-1 py-4 order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-game-primary flex-1 py-4 order-1 sm:order-2"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-black uppercase tracking-widest">Posting...</span>
                        </div>
                    ) : (
                        <span className="font-black uppercase tracking-widest text-lg">Post Question</span>
                    )}
                </button>
            </div>
        </form>
    )
}
