import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays, parseISO } from 'date-fns'

/**
 * Client-side pet age calculation — no Edge Functions (Architecture Plan VI, Decision 2)
 * Returns human-readable age string, e.g. "3 years", "8 months", "6 weeks"
 */
export function formatPetAge(dateOfBirth: string | null | undefined): string {
  if (!dateOfBirth) return 'Age unknown'

  const dob = parseISO(dateOfBirth)
  const now = new Date()

  const years = differenceInYears(now, dob)
  if (years >= 1) {
    return years === 1 ? '1 year old' : `${years} years old`
  }

  const months = differenceInMonths(now, dob)
  if (months >= 1) {
    return months === 1 ? '1 month old' : `${months} months old`
  }

  const weeks = differenceInWeeks(now, dob)
  if (weeks >= 1) {
    return weeks === 1 ? '1 week old' : `${weeks} weeks old`
  }

  return 'Newborn'
}

/**
 * Returns the pet's age in years (numeric, for comparisons)
 */
export function getPetAgeInYears(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  return differenceInYears(new Date(), parseISO(dateOfBirth))
}

/**
 * Returns the next upcoming or overdue vaccine
 */
export function getNextVaccineDue(logs: any[]) {
  if (!logs || logs.length === 0) return null

  const upcoming = logs.filter(v => v.status === 'scheduled' || v.status === 'overdue' || v.next_due_at)
  if (upcoming.length === 0) return null

  const sorted = upcoming.sort((a, b) => {
    const dateA = a.next_due_at ? new Date(a.next_due_at).getTime() : Infinity
    const dateB = b.next_due_at ? new Date(b.next_due_at).getTime() : Infinity
    return dateA - dateB
  })

  const next = sorted[0]
  if (!next) return null

  let daysUntil = 0
  if (next.next_due_at) {
    const nextDate = new Date(next.next_due_at)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    nextDate.setHours(0, 0, 0, 0)
    daysUntil = differenceInDays(nextDate, today)
  }

  return {
    name: next.vaccine_name,
    date: next.next_due_at,
    daysUntil,
    isOverdue: next.status === 'overdue' || daysUntil < 0
  }
}
