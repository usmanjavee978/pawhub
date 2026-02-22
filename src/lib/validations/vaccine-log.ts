import { z } from 'zod'

export const vaccineLogSchema = z.object({
    vaccine_name: z.string().min(1, 'Vaccine name is required').max(100),
    batch_number: z.string().max(50).optional().nullable(),
    manufacturer: z.string().max(100).optional().nullable(),
    status: z.enum(['scheduled', 'administered', 'overdue', 'skipped']).default('administered'),
    administered_at: z.string().optional().nullable(),
    next_due_at: z.string().optional().nullable(),
    vet_name: z.string().max(100).optional().nullable(),
    cost: z.coerce.number().nonnegative().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
})

export type VaccineLogFormValues = z.input<typeof vaccineLogSchema>
