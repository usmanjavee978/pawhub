'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { foodLogSchema, type FoodLogFormValues } from '@/lib/validations/food-log'
import { MEAL_TYPE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FoodLogFormProps {
    onSubmit: (data: FoodLogFormValues) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    error?: string | null
}

export function FoodLogForm({ onSubmit, onCancel, isSubmitting = false, error }: FoodLogFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FoodLogFormValues>({
        resolver: zodResolver(foodLogSchema),
        defaultValues: {
            food_name: '',
            brand: '',
            portion_grams: undefined,
            calories: undefined,
            meal_type: 'dinner', // or dynamically set based on time of day
            is_wet_food: false,
            notes: '',
            logged_at: new Date().toISOString().slice(0, 16),
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
                        <label className="label">Food Name / Recipe *</label>
                        <input
                            {...register('food_name')}
                            className={cn("input", errors.food_name && "border-red-500")}
                            placeholder="e.g. Kibble & Bits"
                        />
                        {errors.food_name && <p className="text-xs text-red-500">{errors.food_name.message}</p>}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Meal Type</label>
                        <select {...register('meal_type')} className="input">
                            {MEAL_TYPE_OPTIONS.map((opt: { value: string; label: string }) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Time</label>
                        <input
                            type="datetime-local"
                            {...register('logged_at')}
                            className="input"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Calories (kcal)</label>
                        <input
                            type="number"
                            {...register('calories')}
                            className="input"
                            placeholder="e.g. 250"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Portion (grams)</label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('portion_grams')}
                            className="input"
                            placeholder="e.g. 100"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <label className="label">Brand</label>
                        <input
                            {...register('brand')}
                            className="input"
                            placeholder="e.g. Purina Pro Plan"
                        />
                    </div>

                    <div className="flex items-center space-x-3 pt-2 min-w-0 sm:col-span-2">
                        <input
                            type="checkbox"
                            id="is_wet_food"
                            {...register('is_wet_food')}
                            className="w-5 h-5 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                        />
                        <label htmlFor="is_wet_food" className="text-sm font-medium">This is wet food</label>
                    </div>

                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <label className="label">Notes</label>
                        <textarea
                            {...register('notes')}
                            className="input min-h-[80px]"
                            placeholder="Did they like it? Any toppers?"
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
                        'Log Meal'
                    )}
                </button>
            </div>
        </form>
    )
}
