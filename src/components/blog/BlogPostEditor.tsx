'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Image as ImageIcon, Save, Send } from 'lucide-react'

import { useCreateBlogPost, useUpdateBlogPost } from '@/hooks/queries/use-blog'
import { generateSlug } from '@/lib/utils'
import type { BlogPost, BlogCategory } from '@/types/database'

const blogSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
    excerpt: z.string().max(300, 'Excerpt must be under 300 characters').optional(),
    category: z.enum([
        'nutrition', 'health', 'training', 'grooming', 'recipes', 'lifestyle', 'adoption', 'behavior', 'gear', 'other'
    ] as const),
    cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    content_text: z.string().min(20, 'Content must be at least 20 characters'),
})

type BlogFormData = z.infer<typeof blogSchema>

interface BlogPostEditorProps {
    initialData?: BlogPost
    isEditing?: boolean
}

const CATEGORIES: { value: BlogCategory; label: string }[] = [
    { value: 'nutrition', label: 'Nutrition & Diet' },
    { value: 'health', label: 'Health & Vet' },
    { value: 'training', label: 'Training' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'gear', label: 'Gear & Toys' },
    { value: 'recipes', label: 'Recipes' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'adoption', label: 'Adoption' },
    { value: 'other', label: 'Other' },
]

export function BlogPostEditor({ initialData, isEditing }: BlogPostEditorProps) {
    const router = useRouter()
    const createMutation = useCreateBlogPost()
    const updateMutation = useUpdateBlogPost()

    const [isSubmittingDraft, setIsSubmittingDraft] = useState(false)
    const [isSubmittingPublish, setIsSubmittingPublish] = useState(false)

    const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<BlogFormData>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: initialData?.title || '',
            excerpt: initialData?.excerpt || '',
            category: (initialData?.category as BlogCategory) || 'general', // Type assertion mapped to form safely via enum
            cover_image_url: initialData?.cover_image_url || '',
            content_text: initialData?.content_text || '',
        },
        mode: 'onChange'
    })

    // Provide visual preview of cover image if user provides one
    const watchCoverImage = watch('cover_image_url')

    const onSubmit = async (data: BlogFormData, is_published: boolean) => {
        try {
            if (is_published) {
                setIsSubmittingPublish(true)
            } else {
                setIsSubmittingDraft(true)
            }

            // Safe slug generation
            const slug = generateSlug(data.title)

            const payload = {
                ...data,
                slug,
                is_published,
                published_at: is_published ? new Date().toISOString() : null,
                // Since we aren't uploading JSONB blocks in this engine phase, we store pure markdown strings
                content: data.content_text,
            }

            if (isEditing && initialData) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    ...payload,
                    // Do not overwrite publish date if already published
                    published_at: initialData.is_published ? initialData.published_at : payload.published_at
                })
            } else {
                await createMutation.mutateAsync(payload as any) // Type mapping is handled by the hook
            }

            // Route based on publish intent
            if (is_published) {
                router.push(`/blog/${slug}`)
            } else {
                router.push('/dashboard') // Or a drafts page if we had one
            }

        } catch (error) {
            console.error('Error saving post:', error)
        } finally {
            setIsSubmittingDraft(false)
            setIsSubmittingPublish(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEditing ? 'Edit Post' : 'Write a New Post'}
                </h1>
                <p className="text-[hsl(var(--foreground-muted))]">
                    Share your knowledge and stories with the PawHub community using Markdown.
                </p>
            </div>

            <form className="space-y-8">
                {/* Top Controls: Title, Excerpt, Category, Cover */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 md:col-span-2">
                        <div className="space-y-1">
                            <label className="label">Title</label>
                            <input
                                {...register('title')}
                                className="input text-lg font-medium"
                                placeholder="E.g., 5 Signs Your Dog Needs a Diet Change"
                            />
                            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="label">Excerpt (Optional)</label>
                            <textarea
                                {...register('excerpt')}
                                className="input min-h-[80px]"
                                placeholder="A brief summary of your post..."
                            />
                            {errors.excerpt && <p className="text-sm text-red-500 mt-1">{errors.excerpt.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="label">Content (Markdown)</label>
                            <textarea
                                {...register('content_text')}
                                className="input min-h-[400px] font-mono text-sm leading-relaxed"
                                placeholder="## Introduction\n\nStart writing here...\n\n- Point 1\n- Point 2\n\n**Bold Text**"
                            />
                            {errors.content_text && <p className="text-sm text-red-500 mt-1">{errors.content_text.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="label">Category</label>
                            <select {...register('category')} className="input app-select">
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="label">Cover Image URL</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <ImageIcon className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                                    </div>
                                    <input
                                        {...register('cover_image_url')}
                                        className="input pl-9"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            {errors.cover_image_url && <p className="text-sm text-red-500 mt-1">{errors.cover_image_url.message}</p>}
                        </div>

                        {/* Image Preview Block */}
                        {watchCoverImage && !errors.cover_image_url && (
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[hsl(var(--card-alt))] border border-[hsl(var(--border))]">
                                {/*  eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={watchCoverImage}
                                    alt="Cover preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZS1vZmYiPmxpbmUgeDE9IjIiIHkxPSIyIiB4Mj0iMjIiIHkyPSIyMiI+PC9saW5lPjxwYXRoIGQ9Ik0xMC40MSAxMC40MWEyIDIgMCAxIDEtMi44My0yLjgzIj48L3BhdGg+PGxpbmUgeDE9IjEzLjUiIHkxPSIxMy41IiB4Mj0iNiIgeTI9IjIxIj48L2xpbmU+PHBhdGggZD0iTTE4IDEyTDE0LjQgOSI+PC9wYXRoPjxwb2x5Z29uIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSI+PC9wb2x5Z29uPjxyaWdodCBYPSIyIiBZPSIyIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIyIiByeT0iMiI+PC9yaWdodD48L3N2Zz4='
                                    }}
                                />
                            </div>
                        )}

                        <div className="pt-6 border-t border-[hsl(var(--border))] space-y-3">
                            <button
                                type="button"
                                onClick={handleSubmit((data) => onSubmit(data, false))}
                                disabled={!isValid || isSubmittingDraft || isSubmittingPublish}
                                className="btn-secondary w-full flex justify-center items-center gap-2"
                            >
                                {isSubmittingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save as Draft
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit((data) => onSubmit(data, true))}
                                disabled={!isValid || isSubmittingDraft || isSubmittingPublish}
                                className="btn-primary w-full flex justify-center items-center gap-2"
                            >
                                {isSubmittingPublish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isEditing && initialData?.is_published ? 'Update Published Post' : 'Publish Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
