import { z } from 'zod'

export const petSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
    species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other']),
    breed: z.string().max(100).optional().default(''),
    date_of_birth: z.string().optional().nullable(),
    gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
    size: z.enum(['tiny', 'small', 'medium', 'large', 'giant']).optional().nullable(),
    weight_kg: z.coerce.number().positive().optional().nullable(),
    color: z.string().max(50).optional().nullable(),
    microchip_id: z.string().max(50).optional().nullable(),
    is_neutered: z.boolean().default(false),
    adoption_date: z.string().optional().nullable(),
    medical_notes: z.string().max(1000).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
})

export type PetFormValues = z.infer<typeof petSchema>
