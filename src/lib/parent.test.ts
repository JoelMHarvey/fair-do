import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSubFind, mockLinkFindMany, mockLinkUpdateMany, mockPsubFind, mockPsubUpdateMany } = vi.hoisted(() => ({
  mockSubFind: vi.fn(),
  mockLinkFindMany: vi.fn(),
  mockLinkUpdateMany: vi.fn(),
  mockPsubFind: vi.fn(),
  mockPsubUpdateMany: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: { findUnique: mockSubFind },
    parentLink: { findMany: mockLinkFindMany, updateMany: mockLinkUpdateMany },
    parentSubscription: { findUnique: mockPsubFind, updateMany: mockPsubUpdateMany },
  },
}))

import {
  teacherCanOfferParentPortal, generateParentToken, groupLinksByChild,
  countFamilyChildren, parentHasActivePortal, syncFamilyPortalAccess, FAMILY_SOFT_CAP,
} from '@/lib/parent'

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

  it('true on the school tier', async () => {
    mockSubFind.mockResolvedValue({ tier: 'school', status: 'active', addOns: [] })
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

describe('groupLinksByChild', () => {
  const link = (id: string, studentId: string) => ({ id, student: { id: studentId, firstName: studentId } })

  it('returns empty for no links', () => {
    expect(groupLinksByChild([])).toEqual([])
  })

  it('one child per distinct student, preserving order', () => {
    const groups = groupLinksByChild([link('l1', 'sA'), link('l2', 'sB')])
    expect(groups.map(g => g.student.id)).toEqual(['sA', 'sB'])
    expect(groups.every(g => g.links.length === 1)).toBe(true)
  })

  it('collapses multiple tutors for the same child into one group', () => {
    const groups = groupLinksByChild([link('l1', 'sA'), link('l2', 'sA'), link('l3', 'sB')])
    expect(groups).toHaveLength(2)
    expect(groups[0].student.id).toBe('sA')
    expect(groups[0].links.map(l => l.id)).toEqual(['l1', 'l2'])
    expect(groups[1].links.map(l => l.id)).toEqual(['l3'])
  })

  it('keeps the first-seen child first (default tab)', () => {
    const groups = groupLinksByChild([link('l1', 'sB'), link('l2', 'sA'), link('l3', 'sB')])
    expect(groups[0].student.id).toBe('sB')
  })
})

describe('countFamilyChildren', () => {
  beforeEach(() => mockLinkFindMany.mockReset())

  it('counts distinct students across links (one child, two tutors → 1)', async () => {
    mockLinkFindMany.mockResolvedValue([{ studentId: 's1' }, { studentId: 's1' }, { studentId: 's2' }])
    expect(await countFamilyChildren('u1')).toBe(2)
  })

  it('returns 0 when no active links', async () => {
    mockLinkFindMany.mockResolvedValue([])
    expect(await countFamilyChildren('u1')).toBe(0)
  })
})

describe('parentHasActivePortal', () => {
  beforeEach(() => mockPsubFind.mockReset())

  it('true only when the family sub is active', async () => {
    mockPsubFind.mockResolvedValue({ status: 'active' })
    expect(await parentHasActivePortal('u1')).toBe(true)
  })
  it('false when past_due / canceled / missing', async () => {
    mockPsubFind.mockResolvedValue({ status: 'past_due' })
    expect(await parentHasActivePortal('u1')).toBe(false)
    mockPsubFind.mockResolvedValue(null)
    expect(await parentHasActivePortal('u1')).toBe(false)
  })
})

describe('syncFamilyPortalAccess', () => {
  beforeEach(() => {
    mockLinkUpdateMany.mockReset(); mockLinkFindMany.mockReset(); mockPsubUpdateMany.mockReset()
    mockLinkUpdateMany.mockResolvedValue({}); mockPsubUpdateMany.mockResolvedValue({})
  })

  it('applies portalActive to all the parent links', async () => {
    mockLinkFindMany.mockResolvedValue([{ studentId: 's1' }])
    await syncFamilyPortalAccess('u1', true)
    expect(mockLinkUpdateMany).toHaveBeenCalledWith({
      where: { parentUserId: 'u1', status: 'active' },
      data: { portalActive: true },
    })
  })

  it('does not flag a family at or below the soft cap', async () => {
    mockLinkFindMany.mockResolvedValue(Array.from({ length: FAMILY_SOFT_CAP }, (_, i) => ({ studentId: `s${i}` })))
    await syncFamilyPortalAccess('u1', true)
    expect(mockPsubUpdateMany).toHaveBeenCalledWith({ where: { parentUserId: 'u1' }, data: { flaggedForReview: false } })
  })

  it('flags a family that exceeds the soft cap', async () => {
    mockLinkFindMany.mockResolvedValue(Array.from({ length: FAMILY_SOFT_CAP + 1 }, (_, i) => ({ studentId: `s${i}` })))
    await syncFamilyPortalAccess('u1', true)
    expect(mockPsubUpdateMany).toHaveBeenCalledWith({ where: { parentUserId: 'u1' }, data: { flaggedForReview: true } })
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
