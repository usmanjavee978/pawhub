'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { vaccineLogSchema, type VaccineLogFormValues } from '@/lib/validations/vaccine-log'
import { VACCINE_STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface VaccineLogFormProps {
    onSubmit: (data: VaccineLogFormValues) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    error?: string | null
}

const STATUS_OPTIONS = Object.entries(VACCINE_STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
}))

export function VaccineLogForm({ onSubmit, onCancel, isSubmitting = false, error }: VaccineLogFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<VaccineLogFormValues>({
        resolver: zodResolver(vaccineLogSchema),
        defaultValues: {
            vaccine_name: '',
            batch_number: '',
            manufacturer: '',
            status: 'administered',
            administered_at: new Date().toISOString().slice(0, 10),
            next_due_at: '',
            vet_name: '',
            cost: undefined,
            notes: '',
        }
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">

            {error && (
                <div className="p-3 text-sm rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="card p-5 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">

                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <label className="label">Vaccine Name *</label>
                        <input
                            {...register('vaccine_name')}
                            className={cn("input", errors.vaccine_name && "border-red-500")}
                            placeholder="e.g. Rabies"
                        />
                        {errors.vaccine_name && <p className="text-xs text-red-500">{errors.vaccine_name.message}</p>}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Status</label>
                        <select {...register('status')} className="input">
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Administered Date</label>
                        <input
                            type="date"
                            {...register('administered_at')}
                            className="input"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <label className="label">Next Due Date</label>
                        <input
                            type="date"
                            {...register('next_due_at')}
                            className="input"
                        />
                        <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">Leave blank if not recurring.</p>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Batch Number</label>
                        <input
                            {...register('batch_number')}
                            className="input"
                            placeholder="e.g. AB12345"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Manufacturer</label>
                        <input
                            {...register('manufacturer')}
                            className="input"
                            placeholder="e.g. Zoetis"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Vet Name / Clinic</label>
                        <input
                            {...register('vet_name')}
                            className="input"
                            placeholder="e.g. Dr. Smith"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Cost ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('cost')}
                            className="input"
                            placeholder="e.g. 45.00"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <label className="label">Notes</label>
                        <textarea
                            {...register('notes')}
                            className="input min-h-[80px]"
                            placeholder="Any side effects?"
                        />
                    </div>

                </div>
            </div>

            <div className="flex gap-4 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Log Vaccine'
                    )}
                </button>
            </div>
        </form>
    )
}
