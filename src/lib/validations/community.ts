import { z } from 'zod'

export const questionSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(150, 'Title too long'),
    category: z.enum(['nutrition', 'health', 'training', 'behavior', 'grooming', 'gear', 'general']).default('general'),
    content: z.string().min(20, 'Please provide more details (at least 20 characters)'),
})

export type QuestionFormValues = z.input<typeof questionSchema>

export const commentSchema = z.object({
    content: z.string().min(2, 'Comment must be at least 2 characters'),
})

export type CommentFormValues = z.infer<typeof commentSchema>
