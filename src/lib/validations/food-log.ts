import { z } from 'zod'

export const foodLogSchema = z.object({
    food_name: z.string().min(1, 'Food name is required').max(100),
    brand: z.string().max(100).optional().nullable(),
    portion_grams: z.coerce.number().positive().optional().nullable(),
    calories: z.coerce.number().int().nonnegative().optional().nullable(),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'treat', 'supplement']).default('dinner'),
    is_wet_food: z.boolean().default(false),
    notes: z.string().max(500).optional().nullable(),
    logged_at: z.string().optional(),
})

export type FoodLogFormValues = z.infer<typeof foodLogSchema>
