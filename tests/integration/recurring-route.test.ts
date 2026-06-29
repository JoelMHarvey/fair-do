/**
 * P2-2 — recurring booking CRUD auth + creation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  canRecur: vi.fn(),
  userFind: vi.fn(),
  matchFind: vi.fn(),
  rbCreate: vi.fn(),
  rbFind: vi.fn(),
  rbDelete: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: m.auth }))
vi.mock('@/lib/recurring', () => ({
  RECURRING_ENABLED: true,
  teacherCanRecur: m.canRecur,
  nextOccurrence: () => new Date('2026-01-06T17:00:00.000Z'),
  isValidStartTime: () => true,
}))
vi.mock('@/lib/practice', () => ({ effectiveRatePence: (mt: { customRatePence: number | null } | null, t: { sessionRatePence: number }) => mt?.customRatePence ?? t.sessionRatePence }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind },
    match: { findFirst: m.matchFind },
    recurringBooking: { create: m.rbCreate, findUnique: m.rbFind, delete: m.rbDelete },
  },
}))

import { POST, DELETE } from '@/app/api/recurring/route'

const req = (body: object) => new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
const base = { matchId: 'mt1', dayOfWeek: 2, startTime: '17:00' }

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'clerk_1' })
})

describe('POST /api/recurring', () => {
  it('403 when the match is not the teacher’s', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1', sessionRatePence: 5000 } })
    m.matchFind.mockResolvedValue(null)
    expect((await POST(req(base))).status).toBe(403)
  })

  it('403 when the teacher’s plan can’t recur', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1', sessionRatePence: 5000 } })
    m.matchFind.mockResolvedValue({ id: 'mt1', customRatePence: null, studentId: 's1' })
    m.canRecur.mockResolvedValue(false)
    expect((await POST(req(base))).status).toBe(403)
  })

  it('201 creates with the locked rate and computed next slot', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1', sessionRatePence: 5000 } })
    m.matchFind.mockResolvedValue({ id: 'mt1', customRatePence: 6000, studentId: 's1' })
    m.canRecur.mockResolvedValue(true)
    m.rbCreate.mockResolvedValue({ id: 'rb1' })
    const res = await POST(req(base))
    expect(res.status).toBe(201)
    expect(m.rbCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ matchId: 'mt1', teacherId: 't1', studentId: 's1', ratePence: 6000, dayOfWeek: 2, startTime: '17:00' }),
    }))
  })
})

describe('DELETE /api/recurring', () => {
  it('403 when the booking’s match is not the teacher’s', async () => {
    m.rbFind.mockResolvedValue({ matchId: 'mt1' })
    m.userFind.mockResolvedValue({ teacher: { id: 't1', sessionRatePence: 5000 } })
    m.matchFind.mockResolvedValue(null)
    const res = await DELETE(req({ id: 'rb1' }))
    expect(res.status).toBe(403)
    expect(m.rbDelete).not.toHaveBeenCalled()
  })
})
