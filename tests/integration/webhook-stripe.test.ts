/**
 * P1 — Stripe webhook integration tests
 *
 * Regression locks:
 *  - Duplicate event delivery short-circuits (200 "Already processed")
 *  - Handler failure AFTER idempotency marker created → marker deleted, 500 returned
 *  - `transferred` field set from checkout.metadata.transferred === 'true'
 *  - gift / org_topup / practice_subscription / booking branches
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mocks ──────────────────────────────────────────────────────────
const {
  mockConstructEvent,
  mockProcessedCreate,
  mockProcessedDelete,
  mockTherapistFindUnique,
  mockTherapistUpdateMany,
  mockClientFindUnique,
  mockPaymentCreate,
  mockPaymentUpdateMany,
  mockSessionFindUnique,
  mockSessionUpdate,
  mockGiftVoucherCreate,
  mockOrgUpdate,
  mockSubscriptionUpsert,
  mockSubscriptionUpdateMany,
  mockPackageUpdate,
  mockSubscriptionsRetrieve,
  mockAccountsRetrieve,
  mockCreateRoom,
  mockSendBookingConfirmed,
  mockSendGiftVoucher,
  mockRewardReferral,
  mockRewardTherapistReferral,
} = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockProcessedCreate: vi.fn(),
  mockProcessedDelete: vi.fn(),
  mockTherapistFindUnique: vi.fn(),
  mockTherapistUpdateMany: vi.fn(),
  mockClientFindUnique: vi.fn(),
  mockPaymentCreate: vi.fn(),
  mockPaymentUpdateMany: vi.fn(),
  mockSessionFindUnique: vi.fn(),
  mockSessionUpdate: vi.fn(),
  mockGiftVoucherCreate: vi.fn(),
  mockOrgUpdate: vi.fn(),
  mockSubscriptionUpsert: vi.fn(),
  mockSubscriptionUpdateMany: vi.fn(),
  mockPackageUpdate: vi.fn(),
  mockSubscriptionsRetrieve: vi.fn(),
  mockAccountsRetrieve: vi.fn(),
  mockCreateRoom: vi.fn(),
  mockSendBookingConfirmed: vi.fn(),
  mockSendGiftVoucher: vi.fn(),
  mockRewardReferral: vi.fn(),
  mockRewardTherapistReferral: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    processedStripeEvent: { create: mockProcessedCreate, delete: mockProcessedDelete },
    teacher: { findUnique: mockTherapistFindUnique, updateMany: mockTherapistUpdateMany },
    student: { findUnique: mockClientFindUnique },
    payment: { create: mockPaymentCreate, updateMany: mockPaymentUpdateMany },
    session: { findUnique: mockSessionFindUnique, update: mockSessionUpdate },
    giftVoucher: { create: mockGiftVoucherCreate },
    organisation: { update: mockOrgUpdate },
    subscription: { upsert: mockSubscriptionUpsert, updateMany: mockSubscriptionUpdateMany },
    package: { update: mockPackageUpdate },
  },
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
    accounts: { retrieve: mockAccountsRetrieve },
  }),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({ get: (k: string) => k === 'stripe-signature' ? 'sig_test' : null })),
}))

vi.mock('@/lib/daily', () => ({ createRoom: mockCreateRoom }))
vi.mock('@/lib/email', () => ({
  sendBookingConfirmed: mockSendBookingConfirmed,
  sendGiftVoucher: mockSendGiftVoucher,
}))
vi.mock('@/lib/referral', () => ({ rewardReferralOnBooking: mockRewardReferral }))
vi.mock('@/lib/therapist-referral', () => ({ rewardTherapistReferralOnFirstSession: mockRewardTherapistReferral }))

import { POST } from '@/app/api/webhooks/stripe/route'

// ── Factories ──────────────────────────────────────────────────────────────

function makeEvent(type: string, data: object, metadata: Record<string, string> = {}, id = 'evt_test'): object {
  return { id, type, data: { object: { metadata, ...data } } }
}

function makeCheckout(metadata: Record<string, string>, extras: object = {}): object {
  return makeEvent('checkout.session.completed', {
    amount_total: 5000,
    payment_intent: 'pi_test',
    subscription: null,
    customer: null,
    ...extras,
    metadata,
  })
}

function webhookReq(event: object): Request {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  mockConstructEvent.mockReturnValue(event)
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: JSON.stringify(event),
  })
}

// ── Fixtures ───────────────────────────────────────────────────────────────

const THERAPIST = {
  id: 'ther_1',
  firstName: 'Alice',
  lastName: 'Smith',
  country: 'GB',
  sessionRatePence: 6000,
  groupMaxSize: 0,
  stripeAccountId: 'acct_1',
  user: { email: 'alice@example.com' },
}

const CLIENT = {
  id: 'client_1',
  firstName: 'Bob',
  lastName: 'Jones',
  organisationId: null,
  user: { email: 'bob@example.com' },
}

const SESSION = {
  id: 'session_1',
  scheduledAt: new Date('2025-01-01T10:00:00Z'),
  isGroup: false,
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Stripe webhook — idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
    mockRewardReferral.mockResolvedValue(undefined)
    mockRewardTherapistReferral.mockResolvedValue(undefined)
    mockSendBookingConfirmed.mockResolvedValue(undefined)
    mockSendGiftVoucher.mockResolvedValue(undefined)
    mockCreateRoom.mockResolvedValue({ name: 'room_1', url: 'https://daily.co/room_1' })
    mockSessionUpdate.mockResolvedValue({})
    mockSubscriptionsRetrieve.mockResolvedValue({ current_period_end: 1700000000 })
  })

  it('missing webhook secret → 400', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'body',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('invalid signature → 400', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockConstructEvent.mockImplementation(() => { throw new Error('Bad sig') })
    const req = new Request('http://localhost/api/webhooks/stripe', { method: 'POST', body: 'bad' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('duplicate event delivery → 200 "Already processed" without running effects', async () => {
    const event = makeEvent('account.updated', { id: 'acct_1', charges_enabled: true, payouts_enabled: true, details_submitted: true })
    // Simulate unique constraint failure (event already recorded)
    mockProcessedCreate.mockRejectedValue(Object.assign(new Error('Unique'), { code: 'P2002' }))
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Already processed')
    // Effects must NOT have run
    expect(mockTherapistUpdateMany).not.toHaveBeenCalled()
  })

  // Regression: handler failure after idempotency marker created → marker deleted, 500 returned
  it('handler failure after event claimed → deletes marker, returns 500', async () => {
    const event = makeCheckout({
      type: 'gift',
      purchaserEmail: 'buyer@example.com',
      amountPence: '5000',
    })
    mockGiftVoucherCreate.mockRejectedValue(new Error('DB error'))
    mockProcessedDelete.mockResolvedValue({})

    const res = await POST(webhookReq(event))
    expect(res.status).toBe(500)
    expect(mockProcessedDelete).toHaveBeenCalledWith({ where: { id: 'evt_test' } })
  })
})

describe('Stripe webhook — account.updated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
  })

  it('syncs stripeOnboarded=true when all capabilities enabled', async () => {
    const event = makeEvent('account.updated', {
      id: 'acct_1', charges_enabled: true, payouts_enabled: true, details_submitted: true,
    })
    mockTherapistUpdateMany.mockResolvedValue({ count: 1 })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(mockTherapistUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { stripeOnboarded: true },
    }))
  })

  it('syncs stripeOnboarded=false when charges_enabled=false', async () => {
    const event = makeEvent('account.updated', {
      id: 'acct_1', charges_enabled: false, payouts_enabled: true, details_submitted: true,
    })
    mockTherapistUpdateMany.mockResolvedValue({ count: 1 })
    await POST(webhookReq(event))
    expect(mockTherapistUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { stripeOnboarded: false },
    }))
  })
})

describe('Stripe webhook — booking payment (checkout.session.completed default branch)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
    mockTherapistFindUnique.mockResolvedValue(THERAPIST)
    mockClientFindUnique.mockResolvedValue(CLIENT)
    mockPaymentCreate.mockResolvedValue({})
    mockSessionFindUnique.mockResolvedValue(SESSION)
    mockSessionUpdate.mockResolvedValue({})
    mockCreateRoom.mockResolvedValue({ name: 'room_1', url: 'https://daily.co/room_1' })
    mockRewardReferral.mockResolvedValue(undefined)
    mockRewardTherapistReferral.mockResolvedValue(undefined)
    mockSendBookingConfirmed.mockResolvedValue(undefined)
  })

  it('creates payment with correct currency for GB therapist', async () => {
    const event = makeCheckout({ sessionId: 'session_1', studentId: 'client_1', teacherId: 'ther_1', transferred: 'false' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(mockPaymentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ currency: 'gbp' }),
    }))
  })

  // Regression: transferred field set from metadata string 'true'/'false'
  it('sets transferred=true when metadata.transferred === "true"', async () => {
    const event = makeCheckout({ sessionId: 'session_1', studentId: 'client_1', teacherId: 'ther_1', transferred: 'true' })
    await POST(webhookReq(event))
    expect(mockPaymentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ transferred: true }),
    }))
  })

  it('sets transferred=false when metadata.transferred === "false"', async () => {
    const event = makeCheckout({ sessionId: 'session_1', studentId: 'client_1', teacherId: 'ther_1', transferred: 'false' })
    await POST(webhookReq(event))
    expect(mockPaymentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ transferred: false }),
    }))
  })

  it('missing sessionId/studentId/teacherId metadata → 400', async () => {
    const event = makeCheckout({ sessionId: '', studentId: '', teacherId: '' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(400)
  })

  it('unknown therapist → 404', async () => {
    mockTherapistFindUnique.mockResolvedValue(null)
    const event = makeCheckout({ sessionId: 'session_1', studentId: 'client_1', teacherId: 'unknown' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(404)
  })

  it('on payment.create failure → deletes marker, returns 500', async () => {
    mockPaymentCreate.mockRejectedValue(new Error('DB down'))
    mockProcessedDelete.mockResolvedValue({})
    const event = makeCheckout({ sessionId: 'session_1', studentId: 'client_1', teacherId: 'ther_1', transferred: 'false' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(500)
    expect(mockProcessedDelete).toHaveBeenCalledWith({ where: { id: 'evt_test' } })
  })
})

describe('Stripe webhook — gift branch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
    mockGiftVoucherCreate.mockResolvedValue({})
    mockSendGiftVoucher.mockResolvedValue(undefined)
  })

  it('creates gift voucher with correct amount', async () => {
    const event = makeCheckout({ type: 'gift', purchaserEmail: 'buyer@example.com', amountPence: '10000' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(mockGiftVoucherCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        purchaserEmail: 'buyer@example.com',
        amountPence: 10000,
      }),
    }))
  })

  it('uses checkout.amount_total as fallback when amountPence missing', async () => {
    const event = makeCheckout({ type: 'gift', purchaserEmail: 'buyer@example.com' })
    await POST(webhookReq(event))
    expect(mockGiftVoucherCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ amountPence: 5000 }), // from makeCheckout default amount_total
    }))
  })
})

describe('Stripe webhook — org_topup branch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
    mockOrgUpdate.mockResolvedValue({})
  })

  it('increments org credit pool', async () => {
    const event = makeCheckout({ type: 'org_topup', orgId: 'org_1', amountPence: '20000' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { id: 'org_1' },
      data: { creditPoolPence: { increment: 20000 } },
    })
  })

  it('on org update failure → deletes marker, returns 500', async () => {
    mockOrgUpdate.mockRejectedValue(new Error('DB error'))
    mockProcessedDelete.mockResolvedValue({})
    const event = makeCheckout({ type: 'org_topup', orgId: 'org_1', amountPence: '20000' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(500)
    expect(mockProcessedDelete).toHaveBeenCalled()
  })
})

describe('Stripe webhook — practice_subscription branch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessedCreate.mockResolvedValue({})
    mockSubscriptionUpsert.mockResolvedValue({})
    mockSubscriptionsRetrieve.mockResolvedValue({ current_period_end: 1700000000 })
  })

  it('upserts subscription with active status', async () => {
    const event = makeCheckout(
      { type: 'practice_subscription', teacherId: 'ther_1', tier: 'practice' },
      { subscription: 'sub_1', customer: 'cus_1' },
    )
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(200)
    expect(mockSubscriptionUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { teacherId: 'ther_1' },
      create: expect.objectContaining({ status: 'active', tier: 'practice' }),
    }))
  })

  it('on upsert failure → deletes marker, returns 500', async () => {
    mockSubscriptionUpsert.mockRejectedValue(new Error('DB error'))
    mockProcessedDelete.mockResolvedValue({})
    const event = makeCheckout({ type: 'practice_subscription', teacherId: 'ther_1', tier: 'practice' })
    const res = await POST(webhookReq(event))
    expect(res.status).toBe(500)
    expect(mockProcessedDelete).toHaveBeenCalled()
  })
})
