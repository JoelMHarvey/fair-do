import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  PRACTICE_TIERS,
  tierById,
  commissionBpsForTier,
  commissionForSource,
  tierByPriceId,
  subscriptionPeriodEnd,
} from './billing'

describe('tierById', () => {
  it('returns correct tier for each id', () => {
    // fair-do takes no session commission — every tier is 0.
    expect(tierById('starter')?.commissionBps).toBe(0)
    expect(tierById('practice')?.commissionBps).toBe(0)
    expect(tierById('clinic')?.commissionBps).toBe(0)
  })

  it('returns undefined for unknown id', () => {
    expect(tierById('unknown')).toBeUndefined()
    expect(tierById(null)).toBeUndefined()
    expect(tierById(undefined)).toBeUndefined()
  })
})

describe('commissionBpsForTier', () => {
  it('starter → 0bps', () => expect(commissionBpsForTier('starter')).toBe(0))
  it('practice → 0bps', () => expect(commissionBpsForTier('practice')).toBe(0))
  it('clinic → 0bps', () => expect(commissionBpsForTier('clinic')).toBe(0))

  it('unknown/null/undefined falls back to 0bps', () => {
    expect(commissionBpsForTier('unknown')).toBe(0)
    expect(commissionBpsForTier(null)).toBe(0)
    expect(commissionBpsForTier(undefined)).toBe(0)
  })
})

describe('priceIdForTier', () => {
  beforeEach(() => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_x'
    process.env.STRIPE_PRICE_SCHOOL = 'price_school_x'
  })
  afterEach(() => {
    delete process.env.STRIPE_PRICE_PRO
    delete process.env.STRIPE_PRICE_SCHOOL
  })

  it('free returns null (free tier, no price)', async () => {
    const { priceIdForTier } = await import('./billing')
    expect(priceIdForTier('free')).toBeNull()
  })

  it('pro returns env price id', async () => {
    const { priceIdForTier } = await import('./billing')
    expect(priceIdForTier('pro')).toBe('price_pro_x')
  })

  it('legacy id (practice) still resolves to the pro price', async () => {
    const { priceIdForTier } = await import('./billing')
    expect(priceIdForTier('practice')).toBe('price_pro_x')
  })

  it('unknown id returns null', async () => {
    const { priceIdForTier } = await import('./billing')
    expect(priceIdForTier('unknown')).toBeNull()
  })
})

describe('tierByPriceId', () => {
  beforeEach(() => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_test'
    process.env.STRIPE_PRICE_SCHOOL = 'price_school_test'
  })
  afterEach(() => {
    delete process.env.STRIPE_PRICE_PRO
    delete process.env.STRIPE_PRICE_SCHOOL
  })

  it('returns pro tier for matching price id', () => {
    expect(tierByPriceId('price_pro_test')?.id).toBe('pro')
  })

  it('returns school tier for matching price id', () => {
    expect(tierByPriceId('price_school_test')?.id).toBe('school')
  })

  it('returns undefined for unknown price id', () => {
    expect(tierByPriceId('price_unknown')).toBeUndefined()
  })

  it('returns undefined for null/undefined', () => {
    expect(tierByPriceId(null)).toBeUndefined()
    expect(tierByPriceId(undefined)).toBeUndefined()
  })
})

describe('PRACTICE_TIERS', () => {
  it('free tier has pricePence 0', () => {
    expect(PRACTICE_TIERS.find(t => t.id === 'free')?.pricePence).toBe(0)
  })

  it('commission is non-negative for all tiers', () => {
    PRACTICE_TIERS.forEach(t => expect(t.commissionBps).toBeGreaterThanOrEqual(0))
  })

  it('tiers are in ascending commission order (higher tier = lower commission)', () => {
    const bps = PRACTICE_TIERS.map(t => t.commissionBps)
    for (let i = 1; i < bps.length; i++) {
      expect(bps[i]).toBeLessThanOrEqual(bps[i - 1])
    }
  })
})

describe('subscriptionPeriodEnd', () => {
  it('reads top-level current_period_end', () => {
    const ts = 1700000000
    const result = subscriptionPeriodEnd({ current_period_end: ts })
    expect(result?.getTime()).toBe(ts * 1000)
  })

  it('reads from items.data[0] when top-level absent', () => {
    const ts = 1700000000
    const result = subscriptionPeriodEnd({ items: { data: [{ current_period_end: ts }] } })
    expect(result?.getTime()).toBe(ts * 1000)
  })

  it('returns null when neither field present', () => {
    expect(subscriptionPeriodEnd({})).toBeNull()
    expect(subscriptionPeriodEnd({ items: { data: [] } })).toBeNull()
  })
})

describe('commissionForSource (P2 pricing)', () => {
  it('takes 10% on marketplace bookings', () => {
    expect(commissionForSource(5000, 'marketplace')).toEqual({ bps: 1000, feePence: 500 })
  })
  it('takes nothing on own students (invite/manual/null)', () => {
    expect(commissionForSource(5000, 'invite')).toEqual({ bps: 0, feePence: 0 })
    expect(commissionForSource(5000, 'manual')).toEqual({ bps: 0, feePence: 0 })
    expect(commissionForSource(5000, null)).toEqual({ bps: 0, feePence: 0 })
  })
  it('rounds the fee', () => {
    expect(commissionForSource(3333, 'marketplace').feePence).toBe(333)
  })
})
