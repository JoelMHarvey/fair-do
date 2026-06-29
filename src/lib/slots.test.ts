import { describe, it, expect } from 'vitest'
import { slotInAvailability, activeSlotKey, isUniqueViolation } from './slots'

// 2026-07-06 is a Monday (dayOfWeek 1); 2026-07-05 a Sunday.
const monWindow = [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'Europe/London' }]

describe('slotInAvailability (timezone-aware)', () => {
  it('accepts a slot that is inside the window in the window timezone, even when UTC differs (BST)', () => {
    // 08:30 UTC = 09:30 BST on a Monday → inside 09:00–17:00 London.
    // The old server-local check (UTC in CI) saw 08:30 and wrongly rejected it.
    expect(slotInAvailability(new Date('2026-07-06T08:30:00Z'), monWindow)).toBe(true)
  })

  it('honours the window start edge in-tz', () => {
    // 08:00 UTC = 09:00 BST → exactly startTime.
    expect(slotInAvailability(new Date('2026-07-06T08:00:00Z'), monWindow)).toBe(true)
  })

  it('rejects a slot before the window once converted to the window timezone (GMT/winter)', () => {
    // 08:30 UTC = 08:30 GMT (London=UTC in winter) on Monday → before 09:00.
    expect(slotInAvailability(new Date('2026-01-05T08:30:00Z'), monWindow)).toBe(false)
  })

  it('rejects the wrong day of week', () => {
    // Sunday instant against a Monday window.
    expect(slotInAvailability(new Date('2026-07-05T10:00:00Z'), monWindow)).toBe(false)
  })

  it('rejects when there are no windows', () => {
    expect(slotInAvailability(new Date('2026-07-06T10:00:00Z'), [])).toBe(false)
  })
})

describe('activeSlotKey', () => {
  it('is deterministic per therapist + instant', () => {
    const at = new Date('2026-07-06T08:00:00Z')
    expect(activeSlotKey('t1', at)).toBe('t1:2026-07-06T08:00:00.000Z')
    expect(activeSlotKey('t1', at)).toBe(activeSlotKey('t1', at))
  })

  it('differs by therapist and by time', () => {
    const at = new Date('2026-07-06T08:00:00Z')
    expect(activeSlotKey('t1', at)).not.toBe(activeSlotKey('t2', at))
    expect(activeSlotKey('t1', at)).not.toBe(activeSlotKey('t1', new Date('2026-07-06T09:00:00Z')))
  })
})

describe('isUniqueViolation', () => {
  it('detects Prisma P2002', () => {
    expect(isUniqueViolation({ code: 'P2002' })).toBe(true)
  })
  it('ignores other errors / non-objects', () => {
    expect(isUniqueViolation({ code: 'P2003' })).toBe(false)
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation('P2002')).toBe(false)
  })
})
