import { describe, it, expect } from 'vitest'
import { daysUntil, currentBucket, expiryState, REMINDER_BUCKETS, GRACE_DAYS } from './credentials-expiry'

const DAY_MS = 24 * 60 * 60 * 1000

function daysFromNow(n: number, now = new Date()): Date {
  return new Date(now.getTime() + n * DAY_MS)
}

describe('daysUntil', () => {
  it('returns null for null/undefined date', () => {
    expect(daysUntil(null)).toBeNull()
    expect(daysUntil(undefined)).toBeNull()
  })

  it('returns positive days for future date', () => {
    const now = new Date()
    expect(daysUntil(daysFromNow(7, now), now)).toBe(7)
    expect(daysUntil(daysFromNow(60, now), now)).toBe(60)
  })

  it('returns negative for past dates', () => {
    const now = new Date()
    expect(daysUntil(daysFromNow(-1, now), now)).toBeLessThan(0)
    expect(daysUntil(daysFromNow(-14, now), now)).toBeLessThanOrEqual(0)
  })

  it('uses Math.ceil (partial day rounds up)', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    // 1.5 days in the future → ceil → 2
    const future = new Date(now.getTime() + 1.5 * DAY_MS)
    expect(daysUntil(future, now)).toBe(2)
  })
})

describe('currentBucket', () => {
  it('returns null for null days', () => {
    expect(currentBucket(null)).toBeNull()
  })

  it('returns null for days past expiry (≤0)', () => {
    expect(currentBucket(0)).toBeNull()
    expect(currentBucket(-5)).toBeNull()
  })

  it('returns null when beyond widest bucket (60)', () => {
    expect(currentBucket(61)).toBeNull()
    expect(currentBucket(100)).toBeNull()
  })

  it('days=60 → bucket 60', () => expect(currentBucket(60)).toBe(60))
  it('days=30 → bucket 30', () => expect(currentBucket(30)).toBe(30))
  it('days=14 → bucket 14', () => expect(currentBucket(14)).toBe(14))
  it('days=7 → bucket 7', () => expect(currentBucket(7)).toBe(7))
  it('days=1 → bucket 1', () => expect(currentBucket(1)).toBe(1))

  it('days between buckets → smallest enclosing bucket', () => {
    expect(currentBucket(20)).toBe(30)
    expect(currentBucket(8)).toBe(14)
    expect(currentBucket(3)).toBe(7)
    expect(currentBucket(59)).toBe(60)
  })
})

describe('expiryState', () => {
  it('null days → ok', () => expect(expiryState(null)).toBe('ok'))

  it('positive but beyond reminder buckets → ok', () => {
    expect(expiryState(REMINDER_BUCKETS[0] + 1)).toBe('ok')
    expect(expiryState(100)).toBe('ok')
  })

  it('days within expiring window → expiring', () => {
    expect(expiryState(REMINDER_BUCKETS[0])).toBe('expiring')
    expect(expiryState(1)).toBe('expiring')
  })

  it('days=0 → expired', () => expect(expiryState(0)).toBe('expired'))
  it('negative days within grace → expired', () => {
    // days <= -GRACE_DAYS triggers suspendable, so grace window is (-GRACE_DAYS+1) to 0
    expect(expiryState(-1)).toBe('expired')
    expect(expiryState(-GRACE_DAYS + 1)).toBe('expired')
  })

  it('exactly at -GRACE_DAYS boundary → suspendable', () => {
    expect(expiryState(-GRACE_DAYS)).toBe('suspendable')
  })

  it('past grace window → suspendable', () => {
    expect(expiryState(-GRACE_DAYS - 1)).toBe('suspendable')
    expect(expiryState(-30)).toBe('suspendable')
  })
})
