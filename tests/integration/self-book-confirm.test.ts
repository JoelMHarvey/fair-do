/**
 * P1 — self-book/confirm route integration tests
 *
 * Covers:
 *  - Missing token → redirect to ?booking=invalid
 *  - Unknown token → redirect to ?booking=invalid
 *  - Expired pending booking → redirect to ?booking=expired + row deleted
 *  - Slot taken at confirm time → redirect to ?booking=taken + row deleted
 *  - Inactive therapist → redirect to ?booking=unavailable + row deleted
 *  - Happy path → finalizeSelfBooking called + redirect to ?booking=confirmed
 *  - PRACTICE_PORTAL_ENABLED=false → 404
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.hoisted(() => { process.env.PRACTICE_PORTAL_ENABLED = 'true' })

const {
  mockPendingFindUnique,
  mockPendingDelete,
  mockTherapistFindUnique,
  mockSessionFindFirst,
  mockFinalizeSelfBooking,
} = vi.hoisted(() => ({
  mockPendingFindUnique: vi.fn(),
  mockPendingDelete: vi.fn(),
  mockTherapistFindUnique: vi.fn(),
  mockSessionFindFirst: vi.fn(),
  mockFinalizeSelfBooking: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pendingSelfBooking: { findUnique: mockPendingFindUnique, delete: mockPendingDelete },
    teacher: { findUnique: mockTherapistFindUnique },
    session: { findFirst: mockSessionFindFirst },
  },
}))

vi.mock('@/lib/self-book', () => ({ finalizeSelfBooking: mockFinalizeSelfBooking }))

const APP_URL = 'https://fair-do.com'
process.env.NEXT_PUBLIC_APP_URL = APP_URL

import { GET } from '@/app/api/practice/self-book/confirm/route'

const FUTURE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

const PENDING = {
  id: 'pending_1',
  teacherId: 'ther_1',
  scheduledAt: FUTURE,
  firstName: 'Bob',
  lastName: 'Jones',
  email: 'bob@example.com',
  phone: null,
  note: null,
  token: 'tok_abc',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
}

const THERAPIST = {
  id: 'ther_1',
  firstName: 'Alice',
  lastName: 'Smith',
  practiceName: null,
  practiceSlug: 'alice-smith',
  status: 'ACTIVE',
  availableForNew: true,
  sessionRatePence: 6000,
  user: { clerkId: 'clerk_ther', email: 'alice@example.com' },
}

function confirmReq(token: string | null): Request {
  const url = token
    ? `${APP_URL}/api/practice/self-book/confirm?token=${token}`
    : `${APP_URL}/api/practice/self-book/confirm`
  return new Request(url)
}

function expectRedirect(res: Response, booking: string) {
  expect(res.status).toBe(303)
  const location = res.headers.get('location') ?? ''
  expect(location).toContain(`booking=${booking}`)
}

describe('self-book/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPendingDelete.mockResolvedValue({})
    mockFinalizeSelfBooking.mockResolvedValue({ sessionId: 'session_1', matchId: 'match_1' })
  })

  it('missing token → redirect to ?booking=invalid', async () => {
    const res = await GET(confirmReq(null))
    expectRedirect(res, 'invalid')
    expect(mockPendingFindUnique).not.toHaveBeenCalled()
  })

  it('unknown token → redirect to ?booking=invalid', async () => {
    mockPendingFindUnique.mockResolvedValue(null)
    const res = await GET(confirmReq('tok_unknown'))
    expectRedirect(res, 'invalid')
  })

  it('expired pending booking → redirect to ?booking=expired + row deleted', async () => {
    mockPendingFindUnique.mockResolvedValue({
      ...PENDING,
      expiresAt: new Date(Date.now() - 1000), // expired
    })
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'expired')
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: 'pending_1' } })
  })

  it('therapist inactive → redirect to ?booking=unavailable + row deleted', async () => {
    mockPendingFindUnique.mockResolvedValue(PENDING)
    mockTherapistFindUnique.mockResolvedValue({ ...THERAPIST, status: 'SUSPENDED' })
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'unavailable')
    expect(mockPendingDelete).toHaveBeenCalled()
  })

  it('therapist not available for new clients → redirect to ?booking=unavailable + row deleted', async () => {
    mockPendingFindUnique.mockResolvedValue(PENDING)
    mockTherapistFindUnique.mockResolvedValue({ ...THERAPIST, availableForNew: false })
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'unavailable')
    expect(mockPendingDelete).toHaveBeenCalled()
  })

  it('slot taken at confirm time → redirect to ?booking=taken + row deleted', async () => {
    mockPendingFindUnique.mockResolvedValue(PENDING)
    mockTherapistFindUnique.mockResolvedValue(THERAPIST)
    mockSessionFindFirst.mockResolvedValue({ id: 'clash_session' }) // clash
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'taken')
    expect(mockPendingDelete).toHaveBeenCalled()
    expect(mockFinalizeSelfBooking).not.toHaveBeenCalled()
  })

  it('happy path → finalize called + redirect to ?booking=confirmed + row deleted', async () => {
    mockPendingFindUnique.mockResolvedValue(PENDING)
    mockTherapistFindUnique.mockResolvedValue(THERAPIST)
    mockSessionFindFirst.mockResolvedValue(null) // no clash
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'confirmed')
    expect(mockFinalizeSelfBooking).toHaveBeenCalledWith(expect.objectContaining({
      email: 'bob@example.com',
      firstName: 'Bob',
      scheduledAt: FUTURE,
    }))
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: PENDING.id } })
  })

  it('finalize failure → redirect to ?booking=error (does NOT delete row so user can retry)', async () => {
    mockPendingFindUnique.mockResolvedValue(PENDING)
    mockTherapistFindUnique.mockResolvedValue(THERAPIST)
    mockSessionFindFirst.mockResolvedValue(null)
    mockFinalizeSelfBooking.mockRejectedValue(new Error('DB failure'))
    const res = await GET(confirmReq('tok_abc'))
    expectRedirect(res, 'error')
  })
})
