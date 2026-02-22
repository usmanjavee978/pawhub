// ─── App-wide constants ─────────────────────────────────────────

export const APP_NAME = 'PawHub'
export const APP_DESCRIPTION = 'Track your pet's health, food, and vaccines.'

// Storage bucket name (Supabase Storage)
export const STORAGE_BUCKET_PETS = 'pet-photos'

// Companion tooltips — shown on click in Phase 1
export const COMPANION_TOOLTIPS = [
    "I'm watching over your pets! 🐾",
    "Don't forget to log today's meals!",
    "Your pets love you! 💛",
    "Everything looks good today!",
]

// Navigation items
export const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/pets', label: 'My Pets', icon: 'PawPrint' },
    { href: '/community', label: 'Community', icon: 'Users' },
    { href: '/profile', label: 'Profile', icon: 'User' },
] as const

// Pet species options
export const SPECIES_OPTIONS = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'rabbit', label: 'Rabbit' },
    { value: 'hamster', label: 'Hamster' },
    { value: 'fish', label: 'Fish' },
    { value: 'reptile', label: 'Reptile' },
    { value: 'other', label: 'Other' },
] as const

// Pet gender options
export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unknown', label: 'Unknown' },
] as const

// Pet size options
export const SIZE_OPTIONS = [
    { value: 'tiny', label: 'Tiny (< 5 kg)' },
    { value: 'small', label: 'Small (5–10 kg)' },
    { value: 'medium', label: 'Medium (10–25 kg)' },
    { value: 'large', label: 'Large (25–45 kg)' },
    { value: 'giant', label: 'Giant (> 45 kg)' },
] as const

// Meal type options
export const MEAL_TYPE_OPTIONS = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'treat', label: 'Treat' },
    { value: 'supplement', label: 'Supplement' },
] as const

// Vaccine status labels and colours
export const VACCINE_STATUS_CONFIG = {
    scheduled: { label: 'Scheduled', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
    administered: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    skipped: { label: 'Skipped', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
} as const

// Daily calorie targets by species (rough reference)
export const DAILY_CALORIE_TARGETS: Record<string, number> = {
    dog: 800,
    cat: 250,
    rabbit: 150,
    bird: 50,
    hamster: 30,
    fish: 0,
    reptile: 100,
    other: 200,
}
