// Shared logic for accreditation + insurance expiry monitoring.
// Used by the daily cron (/api/cron/credentials) and the dashboard banner.

// Days before expiry at which we nudge the therapist (most-urgent last).
export const REMINDER_BUCKETS = [60, 30, 14, 7, 1] as const

// After the expiry date, how long we keep nudging before auto-suspending.
export const GRACE_DAYS = 14

// Whole days from now until `date` (negative once it's in the past). null if no date.
export function daysUntil(date: Date | null | undefined, now: Date = new Date()): number | null {
  if (!date) return null
  const ms = date.getTime() - now.getTime()
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

// The most-urgent reminder bucket reached for a given days-until value, or null if
// still further out than the widest bucket. e.g. days=20 → 30; days=3 → 7; days=80 → null.
export function currentBucket(days: number | null): number | null {
  if (days == null) return null
  if (days <= 0) return null // expired is handled separately (grace), not a pre-expiry bucket
  let reached: number | null = null
  for (const b of REMINDER_BUCKETS) {
    if (days <= b) reached = reached == null ? b : Math.min(reached, b)
  }
  return reached
}

export type ExpiryState = 'ok' | 'expiring' | 'expired' | 'suspendable'

// Classify an expiry date for banners/decisions.
export function expiryState(days: number | null): ExpiryState {
  if (days == null) return 'ok'
  if (days <= -GRACE_DAYS) return 'suspendable'
  if (days <= 0) return 'expired'
  if (days <= REMINDER_BUCKETS[0]) return 'expiring'
  return 'ok'
}
