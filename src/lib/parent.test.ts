import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSubFind } = vi.hoisted(() => ({ mockSubFind: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { subscription: { findUnique: mockSubFind } } }))

import { teacherCanOfferParentPortal, generateParentToken, groupLinksByChild } from '@/lib/parent'

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

describe('generateParentToken', () => {
  it('returns a 48-char hex token', () => {
    expect(generateParentToken()).toMatch(/^[0-9a-f]{48}$/)
  })
  it('is unique across calls', () => {
    expect(generateParentToken()).not.toBe(generateParentToken())
  })
})
