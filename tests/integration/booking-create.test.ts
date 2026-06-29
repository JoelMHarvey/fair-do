/**
 * P1 — booking/create route integration tests
 *
 * Regression locks:
 *  - 422 + pending session deleted when Connect not charges_enabled
 *  - transferred='true' in Stripe metadata only when connectEnabled
 *  - BOOKINGS_ENABLED gate returns 503
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockAuth,
  mockHeaders,
  mockCheckRateLimit,
  mockUserFindUnique,
  mockTherapistFindUnique,
  mockMatchFindUnique,
  mockMatchCreate,
  mockSessionCount,
  mockSessionCreate,
  mockSessionDelete,
  mockOrgFindUnique,
  mockOrgFindFirst,
  mockClientUpdateMany,
  mockOrgUpdateMany,
  mockPaymentCreate,
  mockStripeCheckoutCreate,
  mockStripeAccountRetrieve,
  mockCreateRoom,
  mockSendBookingConfirmed,
  mockRewardReferral,
  mockRewardTherapistReferral,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockHeaders: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockTherapistFindUnique: vi.fn(),
  mockMatchFindUnique: vi.fn(),
  mockMatchCreate: vi.fn(),
  mockSessionCount: vi.fn(),
  mockSessionCreate: vi.fn(),
  mockSessionDelete: vi.fn(),
  mockOrgFindUnique: vi.fn(),
  mockOrgFindFirst: vi.fn(),
  mockClientUpdateMany: vi.fn(),
  mockOrgUpdateMany: vi.fn(),
  mockPaymentCreate: vi.fn(),
  mockStripeCheckoutCreate: vi.fn(),
  mockStripeAccountRetrieve: vi.fn(),
  mockCreateRoom: vi.fn(),
  mockSendBookingConfirmed: vi.fn(),
  mockRewardReferral: vi.fn(),
  mockRewardTherapistReferral: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
vi.mock('next/headers', () => ({ headers: mockHeaders }))
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimitResponse: vi.fn(() => new Response('Rate limit', { status: 429 })),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    teacher: { findUnique: mockTherapistFindUnique },
    match: { findUnique: mockMatchFindUnique, create: mockMatchCreate },
    session: { count: mockSessionCount, create: mockSessionCreate, delete: mockSessionDelete, findFirst: vi.fn().mockResolvedValue(null) },
    organisation: { findUnique: mockOrgFindUnique, findFirst: mockOrgFindFirst },
    student: { updateMany: mockClientUpdateMany },
    payment: { create: mockPaymentCreate },
    organisation2: { updateMany: mockOrgUpdateMany },
  },
}))
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
    accounts: { retrieve: mockStripeAccountRetrieve },
  }),
}))
vi.mock('@/lib/daily', () => ({ createRoom: mockCreateRoom }))
vi.mock('@/lib/email', () => ({ sendBookingConfirmed: mockSendBookingConfirmed }))
vi.mock('@/lib/referral', () => ({ rewardReferralOnBooking: mockRewardReferral }))
vi.mock('@/lib/teacher-referral', () => ({ rewardTeacherReferralOnFirstSession: mockRewardTherapistReferral }))

import { POST } from '@/app/api/booking/create/route'

const FUTURE_SLOT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const THERAPIST = {
  id: 'ther_1',
  firstName: 'Alice',
  lastName: 'Smith',
  country: 'GB',
  sessionRatePence: 6000,
  introRatePence: null,
  groupMaxSize: 0,
  groupRatePence: null,
  stripeAccountId: 'acct_1',
  subscription: null,
  user: { email: 'alice@example.com' },
}

const CLIENT_USER = {
  clerkId: 'clerk_1',
  email: 'bob@example.com',
  student: { id: 'client_1', firstName: 'Bob', organisationId: null, creditBalancePence: 0 },
}

const MATCH = { id: 'match_1', teacherId: 'ther_1', studentId: 'client_1', active: true }
const SESSION = { id: 'session_1', scheduledAt: new Date(FUTURE_SLOT), matchId: 'match_1' }

function bookingReq(body: object): Request {
  return new Request('http://localhost/api/booking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('booking/create — gate and auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockReturnValue({ get: () => '127.0.0.1' })
    mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
  })

  it('BOOKINGS_ENABLED=false → 503', async () => {
    delete process.env.BOOKINGS_ENABLED
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(503)
  })

  it('unauthenticated → 401', async () => {
    process.env.BOOKINGS_ENABLED = 'true'
    mockAuth.mockResolvedValue({ userId: null })
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(401)
  })

  it('user without client → 403', async () => {
    process.env.BOOKINGS_ENABLED = 'true'
    mockAuth.mockResolvedValue({ userId: 'clerk_1' })
    mockUserFindUnique.mockResolvedValue({ ...CLIENT_USER, student: null })
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(403)
  })
})

describe('booking/create — regression: Connect not charges_enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BOOKINGS_ENABLED = 'true'
    mockAuth.mockResolvedValue({ userId: 'clerk_1' })
    mockHeaders.mockReturnValue({ get: () => '127.0.0.1' })
    mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    mockUserFindUnique.mockResolvedValue(CLIENT_USER)
    mockTherapistFindUnique.mockResolvedValue(THERAPIST)
    mockMatchFindUnique.mockResolvedValue(MATCH)
    mockSessionCount.mockResolvedValue(1)
    mockSessionCreate.mockResolvedValue(SESSION)
    mockSessionDelete.mockResolvedValue({})
    mockOrgFindUnique.mockResolvedValue(null)
    mockOrgFindFirst.mockResolvedValue(null)
    mockClientUpdateMany.mockResolvedValue({ count: 0 })
    mockOrgUpdateMany.mockResolvedValue({ count: 0 })
  })

  it('422 + session deleted when Connect not charges_enabled', async () => {
    mockStripeAccountRetrieve.mockResolvedValue({ charges_enabled: false })
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(422)
    expect(mockSessionDelete).toHaveBeenCalledWith({ where: { id: SESSION.id } })
  })

  it('session NOT deleted when checkout succeeds', async () => {
    mockStripeAccountRetrieve.mockResolvedValue({ charges_enabled: true })
    mockStripeCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_1' })
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(201)
    expect(mockSessionDelete).not.toHaveBeenCalled()
  })

  it('transferred="true" in Stripe metadata when connectEnabled', async () => {
    mockStripeAccountRetrieve.mockResolvedValue({ charges_enabled: true })
    mockStripeCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/x' })
    await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    const checkoutCall = mockStripeCheckoutCreate.mock.calls[0][0]
    expect(checkoutCall.metadata.transferred).toBe('true')
  })

  it('returns checkoutUrl in 201 response', async () => {
    mockStripeAccountRetrieve.mockResolvedValue({ charges_enabled: true })
    mockStripeCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/x' })
    const res = await POST(bookingReq({ teacherId: 'ther_1', scheduledAt: FUTURE_SLOT }))
    const body = await res.json()
    expect(body.checkoutUrl).toBe('https://checkout.stripe.com/x')
  })
})
