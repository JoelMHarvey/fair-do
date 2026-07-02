/**
 * M3 — booking/create × school calendar policy (docs/ENTERPRISE-SCHOOLS-PLAN.md §3.7)
 *
 * Locks:
 *  - portal org + bookingPolicy 'block' + holiday conflict → 422 naming the event, no session created
 *  - bookingPolicy 'warn' + conflict → booking proceeds, schoolCalendarWarning in the 201 response
 *  - policy 'off' / non-portal plan / no org → getHolidayConflict never queried (zero-cost path)
 *
 * Uses the REAL @/lib/tenant (enterprisePortalEnabled/isPortalPlan/tenantSettings)
 * so the gate logic is exercised; only the calendar lookup is mocked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const {
  mockAuth,
  mockHeaders,
  mockCheckRateLimit,
  mockUserFindUnique,
  mockTeacherFindUnique,
  mockMatchFindUnique,
  mockSessionCount,
  mockSessionCreate,
  mockSessionDelete,
  mockOrgFindUnique,
  mockOrgFindFirst,
  mockStudentUpdateMany,
  mockOrgUpdateMany,
  mockStripeCheckoutCreate,
  mockStripeAccountRetrieve,
  mockGetHolidayConflict,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockHeaders: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockTeacherFindUnique: vi.fn(),
  mockMatchFindUnique: vi.fn(),
  mockSessionCount: vi.fn(),
  mockSessionCreate: vi.fn(),
  mockSessionDelete: vi.fn(),
  mockOrgFindUnique: vi.fn(),
  mockOrgFindFirst: vi.fn(),
  mockStudentUpdateMany: vi.fn(),
  mockOrgUpdateMany: vi.fn(),
  mockStripeCheckoutCreate: vi.fn(),
  mockStripeAccountRetrieve: vi.fn(),
  mockGetHolidayConflict: vi.fn(),
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
    teacher: { findUnique: mockTeacherFindUnique },
    match: { findUnique: mockMatchFindUnique, create: vi.fn() },
    session: { count: mockSessionCount, create: mockSessionCreate, delete: mockSessionDelete, findFirst: vi.fn().mockResolvedValue(null) },
    organisation: { findUnique: mockOrgFindUnique, findFirst: mockOrgFindFirst, updateMany: mockOrgUpdateMany },
    student: { updateMany: mockStudentUpdateMany, update: vi.fn() },
    payment: { create: vi.fn() },
  },
}))
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
    accounts: { retrieve: mockStripeAccountRetrieve },
  }),
}))
vi.mock('@/lib/daily', () => ({ createRoom: vi.fn() }))
vi.mock('@/lib/email', () => ({ sendBookingConfirmed: vi.fn() }))
vi.mock('@/lib/email-brand', () => ({ resolveStudentEmailBrand: vi.fn().mockResolvedValue(null) }))
vi.mock('@/lib/referral', () => ({ rewardReferralOnBooking: vi.fn() }))
vi.mock('@/lib/teacher-referral', () => ({ rewardTeacherReferralOnFirstSession: vi.fn() }))
vi.mock('@/lib/school-calendar', () => ({ getHolidayConflict: mockGetHolidayConflict }))

import { POST } from '@/app/api/booking/create/route'

const FUTURE_SLOT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const TEACHER = {
  id: 'teach_1',
  firstName: 'Alice',
  lastName: 'Smith',
  country: 'GB',
  sessionRatePence: 6000,
  introRatePence: null,
  groupMaxSize: 0,
  groupRatePence: null,
  cancellationWindowHours: 24,
  stripeAccountId: 'acct_1',
  subscription: null,
  user: { email: 'alice@example.com' },
}

const STUDENT_USER = {
  clerkId: 'clerk_1',
  email: 'bob@stgeorges.sch.uk',
  student: { id: 'stu_1', firstName: 'Bob', organisationId: 'org_1', creditBalancePence: 0 },
}

const portalOrg = (settings: object | null) => ({
  id: 'org_1',
  name: "St George's",
  active: true,
  plan: 'portal',
  settings,
  discountPercent: 0,
  discountExpiry: null,
  creditPoolPence: 0,
})

const HOLIDAY = { id: 'evt_1', title: 'October half term', kind: 'holiday' }

function bookingReq(): Request {
  return new Request('http://localhost/api/booking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId: 'teach_1', scheduledAt: FUTURE_SLOT }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.BOOKINGS_ENABLED = 'true'
  process.env.ENTERPRISE_PORTAL_ENABLED = 'true'
  mockAuth.mockResolvedValue({ userId: 'clerk_1' })
  mockHeaders.mockReturnValue({ get: () => '127.0.0.1' })
  mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
  mockUserFindUnique.mockResolvedValue(STUDENT_USER)
  mockTeacherFindUnique.mockResolvedValue(TEACHER)
  mockMatchFindUnique.mockResolvedValue({ id: 'match_1', teacherId: 'teach_1', studentId: 'stu_1', active: true, source: 'marketplace' })
  mockSessionCount.mockResolvedValue(1)
  mockSessionCreate.mockResolvedValue({ id: 'session_1', scheduledAt: new Date(FUTURE_SLOT), matchId: 'match_1' })
  mockOrgFindFirst.mockResolvedValue(null)
  mockStudentUpdateMany.mockResolvedValue({ count: 0 })
  mockOrgUpdateMany.mockResolvedValue({ count: 0 })
  mockStripeAccountRetrieve.mockResolvedValue({ charges_enabled: true })
  mockStripeCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/x' })
  mockGetHolidayConflict.mockResolvedValue(null)
})

afterEach(() => {
  delete process.env.ENTERPRISE_PORTAL_ENABLED
})

describe('booking/create — school calendar policy', () => {
  it("bookingPolicy 'block' + holiday conflict → 422 naming the event, before any session exists", async () => {
    mockOrgFindUnique.mockResolvedValue(portalOrg({ bookingPolicy: 'block' }))
    mockGetHolidayConflict.mockResolvedValue(HOLIDAY)

    const res = await POST(bookingReq())
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toContain('October half term')
    expect(body.error).toContain("St George's")
    expect(mockSessionCreate).not.toHaveBeenCalled()
    expect(mockGetHolidayConflict).toHaveBeenCalledWith('org_1', new Date(FUTURE_SLOT))
  })

  it("bookingPolicy 'warn' + conflict → 201 with schoolCalendarWarning, booking proceeds", async () => {
    mockOrgFindUnique.mockResolvedValue(portalOrg({ bookingPolicy: 'warn' }))
    mockGetHolidayConflict.mockResolvedValue(HOLIDAY)

    const res = await POST(bookingReq())
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.checkoutUrl).toBe('https://checkout.stripe.com/x')
    expect(body.schoolCalendarWarning).toContain('October half term')
    expect(mockSessionCreate).toHaveBeenCalled()
  })

  it("'warn' with no conflict → clean 201, no warning field", async () => {
    mockOrgFindUnique.mockResolvedValue(portalOrg({ bookingPolicy: 'warn' }))

    const res = await POST(bookingReq())
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.schoolCalendarWarning).toBeUndefined()
  })

  it("bookingPolicy 'off' (default settings) → calendar never queried", async () => {
    mockOrgFindUnique.mockResolvedValue(portalOrg(null))

    const res = await POST(bookingReq())
    expect(res.status).toBe(201)
    expect(mockGetHolidayConflict).not.toHaveBeenCalled()
  })

  it('non-portal plan (legacy school org) → zero-cost early return, calendar never queried', async () => {
    mockOrgFindUnique.mockResolvedValue({ ...portalOrg({ bookingPolicy: 'block' }), plan: 'school' })

    const res = await POST(bookingReq())
    expect(res.status).toBe(201)
    expect(mockGetHolidayConflict).not.toHaveBeenCalled()
  })

  it('ENTERPRISE_PORTAL_ENABLED unset → feature fully dark even for portal orgs', async () => {
    delete process.env.ENTERPRISE_PORTAL_ENABLED
    mockOrgFindUnique.mockResolvedValue(portalOrg({ bookingPolicy: 'block' }))
    mockGetHolidayConflict.mockResolvedValue(HOLIDAY)

    const res = await POST(bookingReq())
    expect(res.status).toBe(201)
    expect(mockGetHolidayConflict).not.toHaveBeenCalled()
  })
})
