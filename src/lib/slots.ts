// Slot helpers shared by the booking paths.

export type AvailabilityWindow = { dayOfWeek: number; startTime: string; endTime: string; timezone: string }

// Does `when` fall inside any availability window, evaluated in that window's OWN
// timezone (not the server's)? Fixes BST/DST mis-validation on self-booking, where
// server-local getHours()/getDay() shifted a valid London slot by an hour.
export function slotInAvailability(when: Date, windows: AvailabilityWindow[]): boolean {
  const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return windows.some(w => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: w.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(when)
    const wd = parts.find(p => p.type === 'weekday')?.value ?? ''
    let hh = parts.find(p => p.type === 'hour')?.value ?? '00'
    const mm = parts.find(p => p.type === 'minute')?.value ?? '00'
    if (hh === '24') hh = '00' // some ICU builds render midnight as "24"
    const localHhmm = `${hh}:${mm}`
    return w.dayOfWeek === DOW[wd] && w.startTime <= localHhmm && localHhmm < w.endTime
  })
}

// Uniqueness key for an ACTIVE session slot, stored on Session.slotKey (unique) and
// nulled on cancel so the slot frees up. Turns double-booking into a DB-level
// race-proof constraint instead of a check-then-create TOCTOU.
export function activeSlotKey(teacherId: string, scheduledAt: Date): string {
  return `${teacherId}:${scheduledAt.toISOString()}`
}

// Prisma's unique-constraint violation code.
export function isUniqueViolation(e: unknown): boolean {
  return !!e && typeof e === 'object' && (e as { code?: string }).code === 'P2002'
}
