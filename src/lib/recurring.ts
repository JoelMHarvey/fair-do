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

// How far ahead of UTC the zone is (ms) at a given instant — DST-aware.
function tzOffsetMs(at: Date, tz: string): number {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a }, {})
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second)
  return asUTC - at.getTime()
}

// The UTC instant of a wall-clock time (y/mo/d h:m) in zone `tz`.
function zonedWallToUtc(y: number, mo1: number, d: number, h: number, m: number, tz: string): Date {
  const guess = Date.UTC(y, mo1 - 1, d, h, m, 0, 0)
  // Offset can differ across the DST boundary; two passes converge.
  const o1 = tzOffsetMs(new Date(guess), tz)
  const o2 = tzOffsetMs(new Date(guess - o1), tz)
  return new Date(guess - o2)
}

// Calendar date parts of an instant, as seen in `tz`.
function datePartsInTz(at: Date, tz: string): { y: number; mo: number; d: number } {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(at).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a }, {})
  return { y: +p.year, mo: +p.month, d: +p.day }
}

// Next occurrence strictly after `from` for a weekly day + local time, in the
// teacher's timezone (DST-correct — no more BST 1h drift). dayOfWeek: 0=Sun..6=Sat.
export function nextOccurrence(dayOfWeek: number, startTime: string, from: Date, tz = 'Europe/London'): Date {
  const [h, mm] = startTime.split(':').map(Number)
  for (let i = 0; i <= 7; i++) {
    const base = new Date(from.getTime() + i * 86_400_000)
    const { y, mo, d } = datePartsInTz(base, tz)
    // Weekday of a pure calendar date is zone-independent.
    if (new Date(Date.UTC(y, mo - 1, d)).getUTCDay() !== dayOfWeek) continue
    const inst = zonedWallToUtc(y, mo, d, h, mm, tz)
    if (inst.getTime() > from.getTime()) return inst
  }
  // Unreachable in practice (a matching weekday always appears within 8 days).
  return zonedWallToUtc(from.getUTCFullYear(), from.getUTCMonth() + 1, from.getUTCDate() + 7, h, mm, tz)
}

// Validation helpers for the API.
export function isValidStartTime(s: string): boolean {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s)
  return !!m
}
