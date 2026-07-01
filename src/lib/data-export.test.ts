import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  userFind: vi.fn(),
  complaintFind: vi.fn(),
  linkFind: vi.fn(),
  psubFind: vi.fn(),
  sessionFind: vi.fn(),
  noteFind: vi.fn(),
  paymentFind: vi.fn(),
  reviewFind: vi.fn(),
  packageFind: vi.fn(),
  matchFind: vi.fn(),
  subFind: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind },
    complaint: { findMany: m.complaintFind },
    parentLink: { findMany: m.linkFind },
    parentSubscription: { findUnique: m.psubFind },
    session: { findMany: m.sessionFind },
    lessonNote: { findMany: m.noteFind },
    payment: { findMany: m.paymentFind },
    review: { findMany: m.reviewFind },
    package: { findMany: m.packageFind },
    match: { findMany: m.matchFind },
    subscription: { findUnique: m.subFind },
  },
}))

import { exportUserByClerkId } from '@/lib/data-export'

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.complaintFind.mockResolvedValue([])
  m.linkFind.mockResolvedValue([])
  m.psubFind.mockResolvedValue(null)
})

describe('exportUserByClerkId', () => {
  it('returns null for an unknown clerk id', async () => {
    m.userFind.mockResolvedValue(null)
    expect(await exportUserByClerkId('nope')).toBeNull()
  })

  it('parent bundle: account + own links + subscription, no student/teacher blocks', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', email: 'p@x.test', role: 'PARENT', country: 'UK', locale: null, createdAt: new Date(), teacher: null, student: null })
    m.linkFind.mockResolvedValue([{ studentId: 's1', status: 'active', inviteEmail: 'p@x.test', acceptedAt: null, createdAt: new Date() }])
    m.psubFind.mockResolvedValue({ status: 'active', currentPeriodEnd: null, createdAt: new Date() })

    const bundle = await exportUserByClerkId('ck1') as Record<string, unknown>
    expect((bundle.account as { email: string }).email).toBe('p@x.test')
    expect(bundle.parentLinks).toBeTruthy()
    expect(bundle.parentSubscription).toBeTruthy()
    expect(bundle.student).toBeUndefined()
    expect(bundle.teacher).toBeUndefined()
  })

  it('never leaks secrets — no token / stripe id anywhere in the bundle', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', email: 'p@x.test', role: 'PARENT', country: 'UK', locale: null, createdAt: new Date(), teacher: null, student: null })
    m.linkFind.mockResolvedValue([{ studentId: 's1', status: 'active', inviteEmail: 'p@x.test', acceptedAt: null, createdAt: new Date() }])
    m.psubFind.mockResolvedValue({ status: 'active', currentPeriodEnd: null, createdAt: new Date() })

    const json = JSON.stringify(await exportUserByClerkId('ck1'))
    expect(json).not.toMatch(/token/i)
    expect(json).not.toMatch(/stripe/i)
    expect(json).not.toMatch(/clerkId/i)
  })
})
