import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSubFind } = vi.hoisted(() => ({ mockSubFind: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { subscription: { findUnique: mockSubFind } } }))

import { teacherCanOfferParentPortal, generateParentToken } from '@/lib/parent'

describe('teacherCanOfferParentPortal', () => {
  beforeEach(() => mockSubFind.mockReset())

  it('false when the teacher has no subscription', async () => {
    mockSubFind.mockResolvedValue(null)
    expect(await teacherCanOfferParentPortal('t1')).toBe(false)
  })

  it('false on the free/starter tier', async () => {
    mockSubFind.mockResolvedValue({ tier: 'starter', status: 'active', addOns: [] })
    expect(await teacherCanOfferParentPortal('t1')).toBe(false)
  })

  it('true on a paid tier that is active', async () => {
    mockSubFind.mockResolvedValue({ tier: 'practice', status: 'active', addOns: [] })
    expect(await teacherCanOfferParentPortal('t1')).toBe(true)
  })

  it('true on pro/studio (forward-compatible with the tier rename)', async () => {
    mockSubFind.mockResolvedValue({ tier: 'studio', status: 'active', addOns: [] })
    expect(await teacherCanOfferParentPortal('t1')).toBe(true)
  })

  it('false on a paid tier that is not active (e.g. past_due)', async () => {
    mockSubFind.mockResolvedValue({ tier: 'practice', status: 'past_due', addOns: [] })
    expect(await teacherCanOfferParentPortal('t1')).toBe(false)
  })

  it('true via the parent_portal add-on even on a free tier', async () => {
    mockSubFind.mockResolvedValue({ tier: 'starter', status: 'active', addOns: ['parent_portal'] })
    expect(await teacherCanOfferParentPortal('t1')).toBe(true)
  })
})

describe('generateParentToken', () => {
  it('returns a 48-char hex token', () => {
    expect(generateParentToken()).toMatch(/^[0-9a-f]{48}$/)
  })
  it('is unique across calls', () => {
    expect(generateParentToken()).not.toBe(generateParentToken())
  })
})
