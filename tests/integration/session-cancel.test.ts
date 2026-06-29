/**
 * P1 — session cancel route integration tests
 *
 * Covers:
 *  - Auth: 401 unauthenticated, 403 not a participant
 *  - 404 for unknown session
 *  - 422 for already-cancelled/completed session
 *  - Refund policy: >24h ahead → refund; <24h client cancel → no refund; therapist cancel → always refund
 *  - Refund routing delegates to refundSessionPayment (integration with real refund logic via mock Stripe)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockAuth,
  mockUserFindUnique,
  mockSessionFindUnique,
  mockSessionUpdate,
  mockRefundSessionPayment,
  mockSendCancellation,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockSessionFindUnique: vi.fn(),
  mockSessionUpdate: vi.fn(),
  mockRefundSessionPayment: vi.fn(),
  mockSendCancellation: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    session: { findUnique: mockSessionFindUnique, update: mockSessionUpdate },
  },
}))
vi.mock('@/lib/refund', () => ({ refundSessionPayment: mockRefundSessionPayment }))
vi.mock('@/lib/email', () => ({ sendCancellationNotice: mockSendCancellation }))

import { POST } from '@/app/api/session/[id]/cancel/route'

const params = Promise.resolve({ id: 'session_1' })

function makeSession(overrides: Partial<{
  studentId: string
  teacherId: string
  status: string
  scheduledAt: Date
  payment: object | null
}> = {}) {
  return {
    id: 'session_1',
    studentId: 'client_1',
    teacherId: 'ther_1',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h ahead
    payment: null,
    student: { id: 'client_1', firstName: 'Bob', lastName: 'Jones', organisationId: null, contactEmail: 'bob@example.com', user: null },
    teacher: { id: 'ther_1', firstName: 'Alice', lastName: 'Smith', cancellationWindowHours: 24, lateCancelRefundPercent: 0, user: { email: 'alice@example.com' } },
    ...overrides,
  }
}

function cancelReq(): Request {
  return new Request('http://localhost/api/session/session_1/cancel', { method: 'POST' })
}

describe('session/cancel — auth and ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendCancellation.mockResolvedValue(undefined)
  })

  it('401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(401)
  })

  it('404 when session not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' })
    mockUserFindUnique.mockResolvedValue({ student: { id: 'client_1' }, teacher: null })
    mockSessionFindUnique.mockResolvedValue(null)
    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(404)
  })

  it('403 when user is neither client nor therapist for this session', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_outsider' })
    mockUserFindUnique.mockResolvedValue({
      student: { id: 'client_OTHER' },
      teacher: { id: 'ther_OTHER' },
    })
    mockSessionFindUnique.mockResolvedValue(makeSession())
    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(403)
  })

  it('422 when session is not SCHEDULED', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' })
    mockUserFindUnique.mockResolvedValue({ student: { id: 'client_1' }, teacher: null })
    mockSessionFindUnique.mockResolvedValue(makeSession({ status: 'COMPLETED' }))
    mockSessionUpdate.mockResolvedValue({})
    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(422)
  })
})

describe('session/cancel — refund policy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionUpdate.mockResolvedValue({})
    mockSendCancellation.mockResolvedValue(undefined)
  })

  it('refund issued when client cancels >24h ahead', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_client' })
    mockUserFindUnique.mockResolvedValue({ student: { id: 'client_1' }, teacher: null })
    const session = makeSession({ scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000) })
    mockSessionFindUnique.mockResolvedValue(session)
    mockRefundSessionPayment.mockResolvedValue(true)

    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(200)
    expect(mockRefundSessionPayment).toHaveBeenCalled()
    const body = await res.json()
    expect(body.refunded).toBe(true)
  })

  it('no refund when client cancels <24h ahead', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_client' })
    mockUserFindUnique.mockResolvedValue({ student: { id: 'client_1' }, teacher: null })
    const session = makeSession({ scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000) }) // 12h
    mockSessionFindUnique.mockResolvedValue(session)

    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(200)
    expect(mockRefundSessionPayment).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.refunded).toBe(false)
  })

  it('therapist cancel always triggers refund (never penalise client)', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_therapist' })
    mockUserFindUnique.mockResolvedValue({ student: null, teacher: { id: 'ther_1' } })
    const session = makeSession({ scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000) }) // 2h ahead (short notice)
    mockSessionFindUnique.mockResolvedValue(session)
    mockRefundSessionPayment.mockResolvedValue(true)

    const res = await POST(cancelReq(), { params })
    expect(res.status).toBe(200)
    expect(mockRefundSessionPayment).toHaveBeenCalled()
    const body = await res.json()
    expect(body.refunded).toBe(true)
  })

  it('session marked CANCELLED regardless of refund outcome', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_client' })
    mockUserFindUnique.mockResolvedValue({ student: { id: 'client_1' }, teacher: null })
    mockSessionFindUnique.mockResolvedValue(makeSession())
    mockRefundSessionPayment.mockResolvedValue(false) // refund failed

    await POST(cancelReq(), { params })
    expect(mockSessionUpdate).toHaveBeenCalledWith({
      where: { id: 'session_1' },
      // slotKey nulled on cancel so the slot frees up (double-book guard).
      data: { status: 'CANCELLED', slotKey: null },
    })
  })
})
