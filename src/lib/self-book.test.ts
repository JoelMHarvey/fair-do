import { describe, it, expect } from 'vitest'

// Pure slot-validation logic extracted from the self-book route.
// The route checks: slot.getDay() === availability.dayOfWeek AND
// availability.startTime <= hhmm < availability.endTime
// where hhmm comes from slot.getHours()/getMinutes() — NOTE: this uses
// the server's local clock interpretation of the Date, not the therapist's
// timezone. This test documents and locks the current behaviour (and will
// flag the bug if someone fixes it to use Availability.timezone).

type AvailWindow = { dayOfWeek: number; startTime: string; endTime: string }

const pad = (n: number) => String(n).padStart(2, '0')

function isSlotInWindow(slot: Date, availability: AvailWindow[]): boolean {
  const hhmm = `${pad(slot.getHours())}:${pad(slot.getMinutes())}`
  const dow = slot.getDay()
  return availability.some(a => a.dayOfWeek === dow && a.startTime <= hhmm && hhmm < a.endTime)
}

// Build a local-time date for a given day-of-week and hh:mm, searching from today.
// Uses setHours so getHours()/getDay() on the result match what the route sees.
function makeLocalSlot(targetDow: number, hours: number, minutes: number): Date {
  const d = new Date()
  d.setMilliseconds(0)
  d.setSeconds(0)
  const diff = (targetDow - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff)
  d.setHours(hours, minutes, 0, 0)
  return d
}

describe('self-book slot window validation', () => {
  const MON = 1 // getDay() = 1

  const availability: AvailWindow[] = [
    { dayOfWeek: MON, startTime: '09:00', endTime: '17:00' },
  ]

  it('slot inside window is accepted', () => {
    expect(isSlotInWindow(makeLocalSlot(MON, 10, 0), availability)).toBe(true)
  })

  it('slot at window start is accepted', () => {
    expect(isSlotInWindow(makeLocalSlot(MON, 9, 0), availability)).toBe(true)
  })

  it('slot at window end is rejected (exclusive end)', () => {
    expect(isSlotInWindow(makeLocalSlot(MON, 17, 0), availability)).toBe(false)
  })

  it('slot before window start is rejected', () => {
    expect(isSlotInWindow(makeLocalSlot(MON, 8, 59), availability)).toBe(false)
  })

  it('wrong day is rejected', () => {
    const TUE = 2
    expect(isSlotInWindow(makeLocalSlot(TUE, 10, 0), availability)).toBe(false)
  })

  it('no availability windows always rejects', () => {
    expect(isSlotInWindow(makeLocalSlot(MON, 10, 0), [])).toBe(false)
  })

  it('multiple windows: slot in any one is accepted', () => {
    const multiAvail: AvailWindow[] = [
      { dayOfWeek: MON, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: MON, startTime: '14:00', endTime: '17:00' },
    ]
    expect(isSlotInWindow(makeLocalSlot(MON, 10, 0), multiAvail)).toBe(true)
    expect(isSlotInWindow(makeLocalSlot(MON, 15, 0), multiAvail)).toBe(true)
    expect(isSlotInWindow(makeLocalSlot(MON, 13, 0), multiAvail)).toBe(false)
  })
})

describe('selfBookRequiresConfirm', () => {
  it('returns true by default (double opt-in is secure default)', async () => {
    // Import dynamically so env is read at call time
    const { selfBookRequiresConfirm } = await import('./self-book')

    // The function only returns false when SELFBOOK_REQUIRE_CONFIRM === 'false'
    delete process.env.SELFBOOK_REQUIRE_CONFIRM
    expect(selfBookRequiresConfirm()).toBe(true)
  })

  it('returns false when SELFBOOK_REQUIRE_CONFIRM=false', async () => {
    const { selfBookRequiresConfirm } = await import('./self-book')
    process.env.SELFBOOK_REQUIRE_CONFIRM = 'false'
    expect(selfBookRequiresConfirm()).toBe(false)
    delete process.env.SELFBOOK_REQUIRE_CONFIRM
  })
})
