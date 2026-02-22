'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

import { createBrowserClient } from '@/lib/supabase/client'
import { petSchema, type PetFormValues } from '@/lib/validations/pet'
import {
    SPECIES_OPTIONS,
    GENDER_OPTIONS,
    SIZE_OPTIONS,
    STORAGE_BUCKET_PETS
} from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PetFormProps {
    initialData?: Partial<PetFormValues> & { id?: string; avatar_url?: string | null }
    onSubmit: (data: PetFormValues & { avatar_url?: string | null }) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    error?: string | null
}

export function PetForm({ initialData, onSubmit, onCancel, isSubmitting = false, error }: PetFormProps) {
    const supabase = createBrowserClient()

    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar_url || null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors }, watch } = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        defaultValues: {
            name: initialData?.name || '',
            species: initialData?.species || 'dog',
            breed: initialData?.breed || '',
            date_of_birth: initialData?.date_of_birth || '',
            gender: initialData?.gender || 'unknown',
            size: initialData?.size || null,
            weight_kg: initialData?.weight_kg || undefined,
            color: initialData?.color || '',
            microchip_id: initialData?.microchip_id || '',
            is_neutered: initialData?.is_neutered || false,
            adoption_date: initialData?.adoption_date || '',
            medical_notes: initialData?.medical_notes || '',
            notes: initialData?.notes || '',
        }
    })

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            setUploadError(null)

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET_PETS)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from(STORAGE_BUCKET_PETS)
                .getPublicUrl(filePath)

            setAvatarUrl(data.publicUrl)
        } catch (err: any) {
            setUploadError(err.message || 'Error uploading image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFormSubmit = async (data: PetFormValues) => {
        await onSubmit({ ...data, avatar_url: avatarUrl })
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 animate-in fade-in duration-500">

            {/* Photo Upload Area */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[hsl(var(--surface-raised))] border-4 border-[hsl(var(--surface))] shadow-lg flex items-center justify-center">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-[hsl(var(--accent))] animate-spin" />
                    ) : avatarUrl ? (
                        <Image src={avatarUrl} alt="Pet photo" fill className="object-cover" />
                    ) : (
                        <Camera className="w-10 h-10 text-[hsl(var(--foreground-muted))]" />
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading || isSubmitting}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="Upload pet photo"
                    />
                </div>

                {uploadError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {uploadError}
                    </p>
                )}
                <p className="text-xs text-[hsl(var(--foreground-muted))]">
                    Tap to upload a profile photo
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Form Fields - Bento Style Grid */}
            <div className="card p-5 space-y-5">
                <h3 className="font-semibold text-lg border-b border-[hsl(var(--border))] pb-2">Basic Info</h3>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Name *</label>
                        <input
                            {...register('name')}
                            className={cn("input", errors.name && "border-red-500")}
                            placeholder="e.g. Luna"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Species *</label>
                        <select {...register('species')} className="input">
                            {SPECIES_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Breed</label>
                        <input
                            {...register('breed')}
                            className="input"
                            placeholder="e.g. Golden Retriever"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Gender</label>
                        <select {...register('gender')} className="input">
                            {GENDER_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Date of Birth</label>
                        <input
                            type="date"
                            {...register('date_of_birth')}
                            className="input"
                        />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Adoption Date</label>
                        <input
                            type="date"
                            {...register('adoption_date')}
                            className="input"
                        />
                    </div>
                </div>
            </div>

            <div className="card p-5 space-y-5">
                <h3 className="font-semibold text-lg border-b border-[hsl(var(--border))] pb-2">Physical Traits</h3>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Size Category</label>
                        <select {...register('size')} className="input">
                            <option value="">Select size...</option>
                            {SIZE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            {...register('weight_kg')}
                            className="input"
                            placeholder="e.g. 15.5"
                        />
                        {errors.weight_kg && <p className="text-xs text-red-500">{errors.weight_kg.message}</p>}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <label className="label">Color / Markings</label>
                        <input
                            {...register('color')}
                            className="input"
                            placeholder="e.g. Black and white"
                        />
                    </div>

                    <div className="flex items-center space-x-3 pt-5 min-w-0">
                        <input
                            type="checkbox"
                            id="is_neutered"
                            {...register('is_neutered')}
                            className="w-5 h-5 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                        />
                        <label htmlFor="is_neutered" className="text-sm font-medium">Neutered / Spayed</label>
                    </div>
                </div>
            </div>

            <div className="card p-5 space-y-5">
                <h3 className="font-semibold text-lg border-b border-[hsl(var(--border))] pb-2">Health & Notes</h3>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="label">Microchip ID</label>
                        <input
                            {...register('microchip_id')}
                            className="input"
                            placeholder="Microchip number"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">Medical Notes / Allergies</label>
                        <textarea
                            {...register('medical_notes')}
                            className="input min-h-[80px]"
                            placeholder="Any known allergies, chronic conditions, etc."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="label">General Notes</label>
                        <textarea
                            {...register('notes')}
                            className="input min-h-[80px]"
                            placeholder="Favorite toys, personality quirks, etc."
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
                    disabled={isSubmitting || isUploading}
                    className="btn-primary flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Pet'
                    )}
                </button>
            </div>
        </form>
    )
}
