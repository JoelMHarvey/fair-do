import 'server-only'
import { prisma } from '@/lib/prisma'

// Recurring / standing bookings (P2-2). A daily cron materialises the next session
// and charges the student's saved card off-session. Ships behind a flag.
export const RECURRING_ENABLED = process.env.RECURRING_ENABLED === 'true'

// Paid teacher tiers allowed to offer recurring bookings (Pro+). Forward-compatible
// with the free/pro/studio rename.
const RECURRING_TIERS = new Set(['pro', 'school', 'practice', 'clinic'])

export async function teacherCanRecur(teacherId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { teacherId },
    select: { tier: true, status: true },
  })
  return !!sub && sub.status === 'active' && RECURRING_TIERS.has(sub.tier)
}

// Next occurrence strictly after `from` for a weekly day + time.
// startTime is "HH:MM"; times are treated as UTC (v1 — no per-teacher timezone yet,
// so this can be an hour off during BST; revisit with a tz field).
export function nextOccurrence(dayOfWeek: number, startTime: string, from: Date): Date {
  const [h, mm] = startTime.split(':').map(Number)
  const cand = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), h, mm, 0, 0))
  const delta = (dayOfWeek - cand.getUTCDay() + 7) % 7
  cand.setUTCDate(cand.getUTCDate() + delta)
  if (cand.getTime() <= from.getTime()) cand.setUTCDate(cand.getUTCDate() + 7)
  return cand
}

// Validation helpers for the API.
export function isValidStartTime(s: string): boolean {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s)
  return !!m
}
