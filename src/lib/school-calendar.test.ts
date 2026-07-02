import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockEventFindFirst } = vi.hoisted(() => ({ mockEventFindFirst: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: { orgCalendarEvent: { findFirst: mockEventFindFirst } },
}))

import { parseICS, allDaySpan, getHolidayConflict } from './school-calendar'

const CRLF = '\r\n'
const wrap = (body: string) => ['BEGIN:VCALENDAR', 'VERSION:2.0', body, 'END:VCALENDAR'].join(CRLF)

describe('parseICS', () => {
  it('parses an all-day VALUE=DATE event (DTEND exclusive, per RFC)', () => {
    const ics = wrap([
      'BEGIN:VEVENT',
      'UID:x@y',
      'SUMMARY:October half term',
      'DTSTART;VALUE=DATE:20261026',
      'DTEND;VALUE=DATE:20261031',
      'END:VEVENT',
    ].join(CRLF))
    const [e] = parseICS(ics)
    expect(e.title).toBe('October half term')
    expect(e.allDay).toBe(true)
    expect(e.startsAt.toISOString()).toBe('2026-10-26T00:00:00.000Z')
    expect(e.endsAt.toISOString()).toBe('2026-10-31T00:00:00.000Z')
  })

  it('all-day event with no DTEND spans one day', () => {
    const ics = wrap(['BEGIN:VEVENT', 'SUMMARY:INSET day', 'DTSTART;VALUE=DATE:20260907', 'END:VEVENT'].join(CRLF))
    const [e] = parseICS(ics)
    expect(e.allDay).toBe(true)
    expect(e.endsAt.getTime() - e.startsAt.getTime()).toBe(86_400_000)
  })

  it('parses timed events (UTC Z form)', () => {
    const ics = wrap([
      'BEGIN:VEVENT',
      'SUMMARY:Parents evening',
      'DTSTART:20260910T170000Z',
      'DTEND:20260910T190000Z',
      'END:VEVENT',
    ].join(CRLF))
    const [e] = parseICS(ics)
    expect(e.allDay).toBe(false)
    expect(e.startsAt.toISOString()).toBe('2026-09-10T17:00:00.000Z')
    expect(e.endsAt.toISOString()).toBe('2026-09-10T19:00:00.000Z')
  })

  it('unfolds folded lines and unescapes TEXT', () => {
    const ics = wrap([
      'BEGIN:VEVENT',
      'SUMMARY:Sports day\\, whole sch' + CRLF + ' ool — bring kit',
      'DTSTART;VALUE=DATE:20270702',
      'END:VEVENT',
    ].join(CRLF))
    const [e] = parseICS(ics)
    expect(e.title).toBe('Sports day, whole school — bring kit')
  })

  it('ignores unknown properties, skips events without DTSTART, handles LF-only files', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'X-WR-CALNAME:Term dates',
      'BEGIN:VEVENT',
      'SUMMARY:No date — skipped',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:Kept',
      'DESCRIPTION:noise',
      'LOCATION:Hall',
      'DTSTART;VALUE=DATE:20261101',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n')
    const events = parseICS(ics)
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('Kept')
  })

  it('untitled events get a fallback title; garbage input parses to nothing', () => {
    const ics = wrap(['BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261101', 'END:VEVENT'].join(CRLF))
    expect(parseICS(ics)[0].title).toBe('Untitled event')
    expect(parseICS('not an ics file at all')).toEqual([])
  })
})

describe('allDaySpan', () => {
  it('single day → exclusive end at next midnight', () => {
    const span = allDaySpan('2026-09-07')!
    expect(span.startsAt.toISOString()).toBe('2026-09-07T00:00:00.000Z')
    expect(span.endsAt.toISOString()).toBe('2026-09-08T00:00:00.000Z')
  })

  it('inclusive end date from the form becomes exclusive storage', () => {
    const span = allDaySpan('2026-10-26', '2026-10-30')!
    expect(span.endsAt.toISOString()).toBe('2026-10-31T00:00:00.000Z')
  })

  it('rejects malformed and inverted ranges', () => {
    expect(allDaySpan('26/10/2026')).toBeNull()
    expect(allDaySpan('2026-10-26', '2026-10-20')).toBeNull()
  })
})

describe('getHolidayConflict', () => {
  beforeEach(() => vi.clearAllMocks())

  it('queries only blocking kinds (holiday, inset) with exclusive-end containment, org-scoped', async () => {
    const evt = { id: 'evt_1', title: 'Half term', kind: 'holiday' }
    mockEventFindFirst.mockResolvedValue(evt)
    const date = new Date('2026-10-27T16:00:00Z')
    const out = await getHolidayConflict('org_1', date)
    expect(out).toBe(evt)
    expect(mockEventFindFirst).toHaveBeenCalledWith({
      where: {
        calendar: { organisationId: 'org_1' },
        kind: { in: ['holiday', 'inset'] },
        startsAt: { lte: date },
        endsAt: { gt: date },
      },
      orderBy: { startsAt: 'asc' },
    })
  })

  it('returns null when nothing covers the date', async () => {
    mockEventFindFirst.mockResolvedValue(null)
    expect(await getHolidayConflict('org_1', new Date())).toBeNull()
  })
})
