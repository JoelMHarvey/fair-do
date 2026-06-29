import { describe, it, expect } from 'vitest'
import {
  commissionPence,
  clientEmail,
  practiceDisplayName,
  generateInviteToken,
  effectiveRatePence,
  inviteExpiry,
  PRACTICE_PORTAL_ENABLED,
  DIRECTORY_ENABLED,
} from './practice'

describe('commissionPence', () => {
  it('active subscription uses subscription bps', () => {
    const r = commissionPence(10000, { status: 'active', commissionBps: 100 })
    expect(r.bps).toBe(100)
    expect(r.feePence).toBe(100) // 10000 * 100 / 10000
  })

  it('trialing subscription also uses subscription bps', () => {
    const r = commissionPence(10000, { status: 'trialing', commissionBps: 0 })
    expect(r.bps).toBe(0)
    expect(r.feePence).toBe(0)
  })

  it('null subscription → 0bps (no commission)', () => {
    const r = commissionPence(10000, null)
    expect(r.bps).toBe(0)
    expect(r.feePence).toBe(0)
  })

  it('inactive subscription → 0bps (no commission)', () => {
    const r = commissionPence(10000, { status: 'canceled', commissionBps: 100 })
    expect(r.bps).toBe(0)
    expect(r.feePence).toBe(0)
  })

  it('fee rounds correctly (Math.round)', () => {
    // 10001 * 250 / 10000 = 250.025 → 250
    const r = commissionPence(10001, { status: 'active', commissionBps: 250 })
    expect(r.feePence).toBe(250)
    // 10005 * 250 / 10000 = 250.125 → 250
    const r2 = commissionPence(10005, { status: 'active', commissionBps: 250 })
    expect(r2.feePence).toBe(250)
  })

  it('fee is never negative', () => {
    const r = commissionPence(0, { status: 'active', commissionBps: 250 })
    expect(r.feePence).toBeGreaterThanOrEqual(0)
  })

  it('fee never exceeds amount', () => {
    // Max bps is 250 = 2.5%, so fee < amount always
    const r = commissionPence(10000, { status: 'active', commissionBps: 250 })
    expect(r.feePence).toBeLessThanOrEqual(10000)
  })
})

describe('clientEmail', () => {
  it('returns user email when user has account', () => {
    expect(clientEmail({ user: { email: 'user@example.com' }, contactEmail: 'contact@example.com' })).toBe('user@example.com')
  })

  it('returns contactEmail when no user account', () => {
    expect(clientEmail({ contactEmail: 'contact@example.com' })).toBe('contact@example.com')
    expect(clientEmail({ user: null, contactEmail: 'contact@example.com' })).toBe('contact@example.com')
  })

  it('returns null when neither email available', () => {
    expect(clientEmail({})).toBeNull()
    expect(clientEmail({ user: null, contactEmail: null })).toBeNull()
  })
})

describe('practiceDisplayName', () => {
  it('returns practiceName when set', () => {
    expect(practiceDisplayName({ practiceName: 'Healing Space', firstName: 'Jo', lastName: 'Smith' })).toBe('Healing Space')
  })

  it('falls back to full name when practiceName is null', () => {
    expect(practiceDisplayName({ practiceName: null, firstName: 'Jo', lastName: 'Smith' })).toBe('Jo Smith')
  })

  it('trims whitespace from practiceName', () => {
    expect(practiceDisplayName({ practiceName: '  ', firstName: 'Jo', lastName: 'Smith' })).toBe('Jo Smith')
  })
})

describe('generateInviteToken', () => {
  it('produces 48-char hex string', () => {
    const token = generateInviteToken()
    expect(token).toHaveLength(48)
    expect(token).toMatch(/^[0-9a-f]{48}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 50 }, generateInviteToken))
    expect(tokens.size).toBe(50)
  })
})

describe('effectiveRatePence', () => {
  it('uses customRatePence when set on match', () => {
    expect(effectiveRatePence({ customRatePence: 8000 }, { sessionRatePence: 6000 })).toBe(8000)
  })

  it('falls back to therapist standard rate when match has no custom rate', () => {
    expect(effectiveRatePence({ customRatePence: null }, { sessionRatePence: 6000 })).toBe(6000)
  })

  it('falls back when match is null', () => {
    expect(effectiveRatePence(null, { sessionRatePence: 6000 })).toBe(6000)
  })
})

describe('inviteExpiry', () => {
  it('is 14 days from the given date', () => {
    const from = new Date('2024-01-01T00:00:00Z')
    const expiry = inviteExpiry(from)
    const diffDays = (expiry.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBe(14)
  })
})

describe('feature flags', () => {
  it('PRACTICE_PORTAL_ENABLED is boolean', () => {
    expect(typeof PRACTICE_PORTAL_ENABLED).toBe('boolean')
  })

  it('DIRECTORY_ENABLED is boolean', () => {
    expect(typeof DIRECTORY_ENABLED).toBe('boolean')
  })
})

// ─── Clinic commission-resolution correctness ────────────────────────────────
// CLINIC-PLAN.md §3 flagged that a clinic member with no personal subscription could
// fall back to a non-zero commission and be overcharged. That's now moot: Faresay
// takes NO session commission on any tier, so every path resolves to 0bps and no
// overcharge is possible. (If a future tier ever reintroduces a fee, resolve it from
// the clinic tier, not the solo fallback.)
describe('commissionPence — no commission (CLINIC-PLAN §3 resolved)', () => {
  it('clinic member without a personal sub → 0bps (no overcharge)', () => {
    expect(commissionPence(10000, null).bps).toBe(0)
  })

  it('any member, with or without a subscription → 0bps today', () => {
    expect(commissionPence(10000, { status: 'active', commissionBps: 0 }).bps).toBe(0)
    expect(commissionPence(10000, { status: 'canceled', commissionBps: 0 }).bps).toBe(0)
  })
})
