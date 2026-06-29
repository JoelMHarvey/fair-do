import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSubFind } = vi.hoisted(() => ({ mockSubFind: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { subscription: { findUnique: mockSubFind } } }))

import { nextOccurrence, teacherCanRecur, isValidStartTime } from '@/lib/recurring'

describe('nextOccurrence', () => {
  it('returns a date on the requested weekday at the requested time, strictly in the future', () => {
    const from = new Date('2026-01-05T09:00:00Z') // Monday
    const next = nextOccurrence(2 /* Tue */, '17:00', from)
    expect(next.getUTCDay()).toBe(2)
    expect(next.getUTCHours()).toBe(17)
    expect(next.getUTCMinutes()).toBe(0)
    expect(next.getTime()).toBeGreaterThan(from.getTime())
  })

  it('returns later the same day when the time is still ahead', () => {
    const from = new Date('2026-01-05T09:00:00Z') // Monday 09:00
    const next = nextOccurrence(1 /* Mon */, '17:00', from)
    expect(next.toISOString()).toBe('2026-01-05T17:00:00.000Z')
  })

  it('rolls to next week when the slot today has passed', () => {
    const from = new Date('2026-01-05T18:00:00Z') // Monday 18:00
    const next = nextOccurrence(1 /* Mon */, '17:00', from)
    expect(next.toISOString()).toBe('2026-01-12T17:00:00.000Z')
  })
})

describe('isValidStartTime', () => {
  it('accepts HH:MM 24h', () => {
    expect(isValidStartTime('17:00')).toBe(true)
    expect(isValidStartTime('23:59')).toBe(true)
    expect(isValidStartTime('09:05')).toBe(true)
  })
  it('rejects bad times', () => {
    expect(isValidStartTime('24:00')).toBe(false)
    expect(isValidStartTime('17:60')).toBe(false)
    expect(isValidStartTime('abc')).toBe(false)
  })
})

describe('teacherCanRecur', () => {
  beforeEach(() => mockSubFind.mockReset())
  it('true on a paid+active tier', async () => {
    mockSubFind.mockResolvedValue({ tier: 'pro', status: 'active' })
    expect(await teacherCanRecur('t1')).toBe(true)
  })
  it('false on free tier', async () => {
    mockSubFind.mockResolvedValue({ tier: 'starter', status: 'active' })
    expect(await teacherCanRecur('t1')).toBe(false)
  })
  it('false when inactive', async () => {
    mockSubFind.mockResolvedValue({ tier: 'pro', status: 'past_due' })
    expect(await teacherCanRecur('t1')).toBe(false)
  })
  it('false with no subscription', async () => {
    mockSubFind.mockResolvedValue(null)
    expect(await teacherCanRecur('t1')).toBe(false)
  })
})
