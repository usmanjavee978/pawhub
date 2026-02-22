import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as a calorie display string */
export function formatCalories(cal: number | null | undefined): string {
  if (cal == null) return '—'
  return `${cal.toLocaleString()} kcal`
}

/** Format a currency value */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/** Get initials from a display name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Check if a date string is in the past */
export function isPast(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

/** Check if a date is within the next N days */
export function isWithinDays(dateStr: string | null | undefined, days: number): boolean {
  if (!dateStr) return false
  const target = new Date(dateStr)
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)
  return target >= now && target <= future
}
