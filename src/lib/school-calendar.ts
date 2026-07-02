import { prisma } from '@/lib/prisma'
import type { OrgCalendarEvent } from '@prisma/client'

// ── School calendars (fair-do for Schools, plan §3.5–3.7) ────────────────────
// Storage convention: all-day events span [startsAt, endsAt) with endsAt
// EXCLUSIVE at UTC midnight after the last day — matching RFC 5545 VALUE=DATE
// semantics, so imports round-trip and containment checks are a simple
// startsAt <= t < endsAt.

export type ParsedICSEvent = {
  title: string
  startsAt: Date
  endsAt: Date
  allDay: boolean
}

// Unescape RFC 5545 TEXT values (\n \, \; \\).
function unescapeText(s: string): string {
  return s.replace(/\\(.)/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c))
}

// Parse a DTSTART/DTEND value. VALUE=DATE ("20260907") → UTC midnight, allDay.
// DATE-TIME ("20260907T090000" / "...Z") → that instant; floating and TZID
// forms are read as UTC — term-date files are effectively date-precision, and
// a rendering error of a few hours doesn't move the day a holiday falls on.
function parseIcsDate(value: string): { date: Date; dateOnly: boolean } | null {
  const v = value.trim()
  let m = v.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (m) {
    return { date: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])), dateOnly: true }
  }
  m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/)
  if (m) {
    return { date: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])), dateOnly: false }
  }
  return null
}

const DAY_MS = 86_400_000

/**
 * Minimal RFC 5545 VEVENT parser for term-date files: reads SUMMARY and
 * DTSTART/DTEND (including the VALUE=DATE all-day form), handles folded lines,
 * and ignores every other property. Events without a parsable DTSTART are
 * skipped. Missing DTEND follows the RFC default: all-day → one day; timed →
 * zero duration.
 */
export function parseICS(text: string): ParsedICSEvent[] {
  // Unfold: a CRLF (or bare LF/CR) followed by a space/tab continues the line.
  const unfolded = text.replace(/(?:\r\n|\n|\r)[ \t]/g, '')
  const lines = unfolded.split(/\r\n|\n|\r/)

  const events: ParsedICSEvent[] = []
  let cur: { title?: string; start?: { date: Date; dateOnly: boolean }; end?: { date: Date; dateOnly: boolean } } | null = null

  for (const line of lines) {
    if (/^BEGIN:VEVENT$/i.test(line.trim())) {
      cur = {}
      continue
    }
    if (/^END:VEVENT$/i.test(line.trim())) {
      if (cur?.start) {
        const allDay = cur.start.dateOnly
        const startsAt = cur.start.date
        const endsAt = cur.end?.date ?? (allDay ? new Date(startsAt.getTime() + DAY_MS) : startsAt)
        events.push({
          title: cur.title?.trim() || 'Untitled event',
          startsAt,
          endsAt: endsAt > startsAt ? endsAt : allDay ? new Date(startsAt.getTime() + DAY_MS) : startsAt,
          allDay,
        })
      }
      cur = null
      continue
    }
    if (!cur) continue

    const colon = line.indexOf(':')
    if (colon === -1) continue
    const nameAndParams = line.slice(0, colon)
    const value = line.slice(colon + 1)
    const name = nameAndParams.split(';')[0].toUpperCase()

    if (name === 'SUMMARY') cur.title = unescapeText(value)
    else if (name === 'DTSTART') cur.start = parseIcsDate(value) ?? cur.start
    else if (name === 'DTEND') cur.end = parseIcsDate(value) ?? cur.end
  }

  return events
}

/**
 * Normalise the console's date inputs ("YYYY-MM-DD", end inclusive as a human
 * writes it) into the stored [startsAt, endsAt-exclusive) all-day span.
 */
export function allDaySpan(startDate: string, endDate?: string): { startsAt: Date; endsAt: Date } | null {
  const parse = (s: string): Date | null => {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null
  }
  const startsAt = parse(startDate)
  if (!startsAt) return null
  const endDay = endDate ? parse(endDate) : startsAt
  if (!endDay || endDay < startsAt) return null
  return { startsAt, endsAt: new Date(endDay.getTime() + DAY_MS) }
}

/**
 * The school calendar event that makes `date` a no-lesson day, or null.
 *
 * Only kind 'holiday' and 'inset' count: those are the days the school is
 * closed to lessons. 'term' events span whole teaching weeks (bookings during
 * term are the point of the product), and 'exam'/'event' entries are
 * informational — tutoring routinely continues around them (and often ramps up
 * before exams). Containment uses the exclusive-end convention above.
 */
export async function getHolidayConflict(orgId: string, date: Date): Promise<OrgCalendarEvent | null> {
  return prisma.orgCalendarEvent.findFirst({
    where: {
      calendar: { organisationId: orgId },
      kind: { in: ['holiday', 'inset'] },
      startsAt: { lte: date },
      endsAt: { gt: date },
    },
    orderBy: { startsAt: 'asc' },
  })
}

export const EVENT_KINDS = ['term', 'holiday', 'inset', 'exam', 'event'] as const
export type EventKind = (typeof EVENT_KINDS)[number]
