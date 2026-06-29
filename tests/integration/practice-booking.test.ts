/**
 * P1 — practice/booking route integration tests
 *
 * Covers:
 *  - PRACTICE_PORTAL_ENABLED gate → 404
 *  - Unauthenticated → 401, non-therapist → 403
 *  - Match ownership: matchId belonging to another therapist → 404
 *  - Slot clash → 409
 *  - Offline booking (no Stripe) → 201 with sessionId
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must run before imports so @/lib/practice reads it at module-level eval time
vi.hoisted(() => { process.env.PRACTICE_PORTAL_ENABLED = 'true' })

const {
  mockAuth,
  mockHeaders,
  mockCheckRateLimit,
  mockUserFindUnique,
  mockMatchFindUnique,
  mockSessionFindFirst,
  mockSessionCreate,
  mockSessionUpdate,
  mockSessionDelete,
  mockSubscriptionFindUnique,
  mockCreateRoom,
  mockSendSession,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockHeaders: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockMatchFindUnique: vi.fn(),
  mockSessionFindFirst: vi.fn(),
  mockSessionCreate: vi.fn(),
  mockSessionUpdate: vi.fn(),
  mockSessionDelete: vi.fn(),
  mockSubscriptionFindUnique: vi.fn(),
  mockCreateRoom: vi.fn(),
  mockSendSession: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
vi.mock('next/headers', () => ({ headers: mockHeaders }))
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimitResponse: vi.fn(() => new Response('Rate limited', { status: 429 })),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    match: { findUnique: mockMatchFindUnique },
    session: { findFirst: mockSessionFindFirst, create: mockSessionCreate, update: mockSessionUpdate, delete: mockSessionDelete },
    subscription: { findUnique: mockSubscriptionFindUnique },
  },
}))
vi.mock('@/lib/stripe', () => ({ getStripe: () => ({ accounts: { retrieve: vi.fn().mockResolvedValue({ charges_enabled: false }) } }) }))
vi.mock('@/lib/daily', () => ({ createRoom: mockCreateRoom }))
vi.mock('@/lib/email', () => ({
  sendSessionScheduledByTherapist: mockSendSession,
  sendSessionSeriesScheduled: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from '@/app/api/practice/booking/route'

const FUTURE_SLOT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const THERAPIST_USER = {
  clerkId: 'clerk_ther',
  teacher: {
    id: 'ther_1',
    firstName: 'Alice',
    lastName: 'Smith',
    practiceName: null,
    country: 'GB',
    sessionRatePence: 6000,
    stripeAccountId: null, // no Stripe → offline path
  },
}

const MATCH = {
  id: 'match_1',
  teacherId: 'ther_1',
  studentId: 'client_1',
  active: true,
  customRatePence: null,
  student: {
    firstName: 'Bob',
    lastName: 'Jones',
    contactEmail: 'bob@example.com',
    user: null,
  },
}

const SESSION = { id: 'session_1', scheduledAt: new Date(FUTURE_SLOT), matchId: 'match_1' }

function bookingReq(body: object): Request {
  return new Request('http://localhost/api/practice/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('practice/booking — auth and gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockReturnValue({ get: () => '127.0.0.1' })
    mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when user has no therapist record', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' })
    mockUserFindUnique.mockResolvedValue({ teacher: null })
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(403)
  })
})

describe('practice/booking — ownership and clash', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'clerk_ther' })
    mockHeaders.mockReturnValue({ get: () => '127.0.0.1' })
    mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    mockUserFindUnique.mockResolvedValue(THERAPIST_USER)
    mockSessionFindFirst.mockResolvedValue(null) // no clash by default
    mockSessionCreate.mockResolvedValue(SESSION)
    mockCreateRoom.mockResolvedValue({ name: 'room_1', url: 'https://daily.co/room_1' })
    mockSessionUpdate.mockResolvedValue({})
    mockSendSession.mockResolvedValue(undefined)
  })

  it('returns 404 when match belongs to different therapist', async () => {
    mockMatchFindUnique.mockResolvedValue({ ...MATCH, teacherId: 'ther_OTHER' })
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(404)
  })

  it('returns 409 when match not found', async () => {
    mockMatchFindUnique.mockResolvedValue(null)
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(404)
  })

  it('returns 409 when slot clashes with existing session', async () => {
    mockMatchFindUnique.mockResolvedValue(MATCH)
    mockSessionFindFirst.mockResolvedValue({ id: 'clash_session' }) // clash exists
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(409)
  })

  it('returns 409 when match is inactive', async () => {
    mockMatchFindUnique.mockResolvedValue({ ...MATCH, active: false })
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(409)
  })

  it('returns 422 when scheduledAt is in the past', async () => {
    mockMatchFindUnique.mockResolvedValue(MATCH)
    const pastSlot = new Date(Date.now() - 60_000).toISOString()
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: pastSlot }))
    expect(res.status).toBe(422)
  })

  it('offline booking (no Stripe account) → 201 with sessionId', async () => {
    mockMatchFindUnique.mockResolvedValue(MATCH)
    const res = await POST(bookingReq({ matchId: 'match_1', scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.sessionId).toBe(SESSION.id)
    expect(body.mode).toBe('scheduled')
  })

  it('invalid body (missing matchId) → 400', async () => {
    const res = await POST(bookingReq({ scheduledAt: FUTURE_SLOT }))
    expect(res.status).toBe(400)
  })
})
