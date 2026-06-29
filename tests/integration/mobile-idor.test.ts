/**
 * P1 — Mobile API IDOR / auth tests
 *
 * Critical: therapist A must not be able to read therapist B's data.
 * Protection comes from getMobileTeacher() resolving Clerk JWT → Therapist row,
 * then every query filtering on therapist.id. These tests verify:
 *  - 401 returned when getMobileTeacher() returns null (unauthenticated / not a therapist)
 *  - All queries scope to the authed therapist's id (no cross-therapist data)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mocks ──────────────────────────────────────────────────────────
const {
  mockGetMobileTherapist,
  mockSessionFindMany,
  mockMatchCount,
  mockPaymentFindMany,
  mockMessageCount,
  mockMatchFindMany,
  mockMessageGroupBy,
} = vi.hoisted(() => ({
  mockGetMobileTherapist: vi.fn(),
  mockSessionFindMany: vi.fn(),
  mockMatchCount: vi.fn(),
  mockPaymentFindMany: vi.fn(),
  mockMessageCount: vi.fn(),
  mockMatchFindMany: vi.fn(),
  mockMessageGroupBy: vi.fn(),
}))

vi.mock('@/lib/mobile-auth', () => ({ getMobileTeacher: mockGetMobileTherapist }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findMany: mockSessionFindMany },
    match: { count: mockMatchCount, findMany: mockMatchFindMany },
    payment: { findMany: mockPaymentFindMany },
    message: { count: mockMessageCount, groupBy: mockMessageGroupBy },
  },
}))

import { GET as getDashboard } from '@/app/api/mobile/v1/dashboard/route'
import { GET as getClients } from '@/app/api/mobile/v1/clients/route'
import { GET as getCalendar } from '@/app/api/mobile/v1/calendar/route'
import { GET as getEarnings } from '@/app/api/mobile/v1/earnings/route'

const THERAPIST_A = {
  id: 'ther_A',
  firstName: 'Alice',
  lastName: 'Smith',
  status: 'ACTIVE',
  profileImageUrl: null,
  stripeOnboarded: true,
  qualificationBody: 'BACP',
  sessionRatePence: 6000,
  qualificationExpiry: null,
  country: 'GB',
  user: { clerkId: 'clerk_A', email: 'alice@example.com' },
}

function calendarReq(params = ''): Request {
  return new Request(`http://localhost/api/mobile/v1/calendar${params}`)
}

// ── 401 when unauthenticated ───────────────────────────────────────────────

describe('mobile API — 401 when not authenticated', () => {
  beforeEach(() => {
    mockGetMobileTherapist.mockResolvedValue(null)
  })

  it('GET /mobile/v1/dashboard → 401', async () => {
    const res = await getDashboard()
    expect(res.status).toBe(401)
  })

  it('GET /mobile/v1/clients → 401', async () => {
    const res = await getClients()
    expect(res.status).toBe(401)
  })

  it('GET /mobile/v1/calendar → 401', async () => {
    const res = await getCalendar(calendarReq())
    expect(res.status).toBe(401)
  })

  it('GET /mobile/v1/earnings → 401', async () => {
    const res = await getEarnings()
    expect(res.status).toBe(401)
  })
})

// ── IDOR: queries scoped to authed therapist.id ────────────────────────────

describe('mobile API — data isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMobileTherapist.mockResolvedValue(THERAPIST_A)

    // Happy-path defaults
    mockSessionFindMany.mockResolvedValue([])
    mockMatchCount.mockResolvedValue(0)
    mockPaymentFindMany.mockResolvedValue([])
    mockMessageCount.mockResolvedValue(0)
    mockMatchFindMany.mockResolvedValue([])
    mockMessageGroupBy.mockResolvedValue([])
  })

  it('dashboard: sessions query uses therapist A id', async () => {
    const res = await getDashboard()
    expect(res.status).toBe(200)
    // Both session queries (today + upcoming) should scope to ther_A
    const calls = mockSessionFindMany.mock.calls
    for (const [arg] of calls) {
      expect(arg.where.teacherId).toBe('ther_A')
    }
  })

  it('dashboard: match count scoped to therapist A', async () => {
    await getDashboard()
    const call = mockMatchCount.mock.calls[0][0]
    expect(call.where.teacherId).toBe('ther_A')
  })

  it('dashboard: payment query scoped through session.teacherId', async () => {
    await getDashboard()
    const call = mockPaymentFindMany.mock.calls[0][0]
    expect(call.where.session.teacherId).toBe('ther_A')
  })

  it('dashboard: unread message count scoped to therapist A threads', async () => {
    await getDashboard()
    const call = mockMessageCount.mock.calls[0][0]
    // Therapist A's messages: senderClerkId is NOT their own clerkId
    expect(call.where.thread.teacherId).toBe('ther_A')
    expect(call.where.senderClerkId).toEqual({ not: 'clerk_A' })
  })

  it('clients: match query scoped to therapist A', async () => {
    const res = await getClients()
    expect(res.status).toBe(200)
    const call = mockMatchFindMany.mock.calls[0][0]
    expect(call.where.teacherId).toBe('ther_A')
  })

  it('calendar: session query scoped to therapist A', async () => {
    const res = await getCalendar(calendarReq('?from=2025-01-01&to=2025-02-01'))
    expect(res.status).toBe(200)
    const call = mockSessionFindMany.mock.calls[0][0]
    expect(call.where.teacherId).toBe('ther_A')
  })

  it('calendar: invalid date params → 400', async () => {
    const res = await getCalendar(calendarReq('?from=not-a-date'))
    expect(res.status).toBe(400)
  })

  it('earnings: payment query scoped to therapist A sessions', async () => {
    const res = await getEarnings()
    expect(res.status).toBe(200)
    const call = mockPaymentFindMany.mock.calls[0][0]
    expect(call.where.session.teacherId).toBe('ther_A')
  })

  it('earnings: returns correct currency symbol for GB therapist', async () => {
    const res = await getEarnings()
    const body = await res.json()
    expect(body.currencySymbol).toBe('£')
  })

  it('earnings: returns $ for US therapist', async () => {
    mockGetMobileTherapist.mockResolvedValue({ ...THERAPIST_A, id: 'ther_B', country: 'US' })
    const res = await getEarnings()
    const body = await res.json()
    expect(body.currencySymbol).toBe('$')
  })
})
