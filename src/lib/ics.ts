// Minimal RFC-5545 VEVENT generator for session calendar invites + a subscribe feed.

function toICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function esc(s: string): string {
  return s
    .replace(/([,;\\])/g, '\\$1')
    .replace(/\r\n|\r|\n/g, '\\n') // fold all line endings (a lone \r could inject a property)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') // drop remaining control chars
}

export type FeedEvent = {
  sessionId: string
  start: Date
  durationMins?: number
  summary: string
  description?: string
  url?: string
  status?: 'CONFIRMED' | 'CANCELLED'
}

// A subscribable VCALENDAR of many events (for a therapist's live calendar feed).
// Calendar apps poll the URL, so this is one-way Faresay → Google/Apple/Outlook, auto-updating.
export function buildCalendarFeed(events: FeedEvent[], opts?: { name?: string }): string {
  const name = opts?.name ?? 'Faresay sessions'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Faresay//Practice//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ]
  for (const e of events) {
    const end = new Date(e.start.getTime() + (e.durationMins ?? 50) * 60_000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:session-${e.sessionId}@faresay.com`,
      `DTSTAMP:${toICSDate(new Date(e.start))}`,
      `DTSTART:${toICSDate(e.start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${esc(e.summary)}`,
      `STATUS:${e.status ?? 'CONFIRMED'}`,
    )
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    if (e.url) lines.push(`URL:${e.url}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

// "Add to Google Calendar" link for a single session.
export function googleCalendarUrl(opts: {
  title: string
  start: Date
  durationMins?: number
  details?: string
  location?: string
}): string {
  const end = new Date(opts.start.getTime() + (opts.durationMins ?? 50) * 60_000)
  const fmt = (d: Date) => toICSDate(d)
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
  })
  if (opts.details) p.set('details', opts.details)
  if (opts.location) p.set('location', opts.location)
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

export function buildSessionICS(opts: {
  sessionId: string
  start: Date
  durationMins?: number
  therapistName: string
  joinUrl: string
  practiceName?: string   // when set, SUMMARY + ORGANIZER use the practice brand
}): string {
  const start = opts.start
  const end = new Date(start.getTime() + (opts.durationMins ?? 50) * 60_000)
  const stamp = toICSDate(start)
  const summary = opts.practiceName
    ? `Session with ${esc(opts.practiceName)}`
    : `Therapy session with ${esc(opts.therapistName)}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Faresay//Therapy//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:session-${opts.sessionId}@faresay.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:Join your session here: ${opts.joinUrl}\\n\\nThe room opens 10 minutes before the start. Cancel free up to 24 hours before.`,
    `URL:${opts.joinUrl}`,
  ]
  if (opts.practiceName) {
    lines.push(`ORGANIZER;CN="${esc(opts.practiceName)}":mailto:noreply@faresay.com`)
  }
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  )
  return lines.join('\r\n')
}

// A general, personalised calendar invite (METHOD:REQUEST + a single ATTENDEE) used by
// practice broadcasts — a workshop, group, or practice-wide event. Per-attendee UID so
// each client gets their own invite they can RSVP/add, and it reads as individual.
export function buildEventICS(opts: {
  uid: string
  start: Date
  durationMins?: number
  title: string
  description?: string
  location?: string
  joinUrl?: string
  organizerName: string
  attendeeEmail: string
  attendeeName?: string
}): string {
  const start = opts.start
  const end = new Date(start.getTime() + (opts.durationMins ?? 60) * 60_000)
  const stamp = toICSDate(new Date(start.getTime())) // deterministic stamp from the event start (no wall clock)
  const descParts = [opts.description?.trim(), opts.joinUrl ? `Join: ${opts.joinUrl}` : ''].filter(Boolean)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Faresay//Therapy//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${esc(opts.uid)}@faresay.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `ORGANIZER;CN="${esc(opts.organizerName)}":mailto:noreply@faresay.com`,
    `ATTENDEE;CN="${esc(opts.attendeeName ?? opts.attendeeEmail)}";RSVP=TRUE:mailto:${esc(opts.attendeeEmail)}`,
  ]
  if (descParts.length) lines.push(`DESCRIPTION:${esc(descParts.join('\n\n'))}`)
  if (opts.location) lines.push(`LOCATION:${esc(opts.location)}`)
  if (opts.joinUrl) lines.push(`URL:${esc(opts.joinUrl)}`)
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(opts.title)} in 30 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  )
  return lines.join('\r\n')
}
