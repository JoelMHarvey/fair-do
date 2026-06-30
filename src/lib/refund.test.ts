import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these fns exist before the hoisted vi.mock calls run
const { mockPrismaUpdate, mockOrgUpdate, mockClientUpdate, mockRefundsCreate } = vi.hoisted(() => ({
  mockPrismaUpdate: vi.fn().mockResolvedValue({}),
  mockOrgUpdate: vi.fn().mockResolvedValue({}),
  mockClientUpdate: vi.fn().mockResolvedValue({}),
  mockRefundsCreate: vi.fn().mockResolvedValue({ id: 'rf_test' }),
}))

vi.mock('./prisma', () => ({
  prisma: {
    payment: { update: mockPrismaUpdate },
    organisation: { update: mockOrgUpdate },
    student: { update: mockClientUpdate },
  },
}))

vi.mock('./stripe', () => ({
  getStripe: () => ({
    refunds: { create: mockRefundsCreate },
  }),
}))

import { refundSessionPayment } from './refund'

const CLIENT_ID = 'client_1'
const ORG_ID = 'org_1'

function makePayment(overrides: Partial<{
  id: string
  status: string
  stripePaymentIntentId: string
  amountTotalPence: number
  transferred: boolean
  fundingOrgId: string | null
}> = {}) {
  return {
    id: 'pay_1',
    status: 'paid',
    stripePaymentIntentId: 'pi_test',
    amountTotalPence: 5000,
    transferred: false,
    ...overrides,
  }
}

describe('refundSessionPayment — routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaUpdate.mockResolvedValue({})
    mockOrgUpdate.mockResolvedValue({})
    mockClientUpdate.mockResolvedValue({})
    mockRefundsCreate.mockResolvedValue({ id: 'rf_test' })
  })

  it('returns false for null payment', async () => {
    expect(await refundSessionPayment(null, CLIENT_ID, null)).toBe(false)
  })

  it('returns false for undefined payment', async () => {
    expect(await refundSessionPayment(undefined, CLIENT_ID, null)).toBe(false)
  })

  it('returns false when payment status is not paid', async () => {
    const result = await refundSessionPayment(makePayment({ status: 'pending' }), CLIENT_ID, null)
    expect(result).toBe(false)
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })

  it('routes credit_ prefix to client credit balance', async () => {
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'credit_abc', amountTotalPence: 5000 }),
      CLIENT_ID,
      null,
    )
    expect(result).toBe(true)
    expect(mockClientUpdate).toHaveBeenCalledWith({
      where: { id: CLIENT_ID },
      data: { creditBalancePence: { increment: 5000 } },
    })
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })

  it('routes org_ prefix to org credit pool when orgId present', async () => {
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'org_abc', amountTotalPence: 3000 }),
      CLIENT_ID,
      ORG_ID,
    )
    expect(result).toBe(true)
    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { id: ORG_ID },
      data: { creditPoolPence: { increment: 3000 } },
    })
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })

  it('routes org_ prefix to the FUNDING org, not the student current org', async () => {
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'org_abc', amountTotalPence: 3000, fundingOrgId: 'org_funder' }),
      CLIENT_ID,
      'org_current_different', // student's org at refund time differs from funder
    )
    expect(result).toBe(true)
    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { id: 'org_funder' },
      data: { creditPoolPence: { increment: 3000 } },
    })
    expect(mockClientUpdate).not.toHaveBeenCalled()
  })

  it('routes org_ prefix to client balance when no orgId', async () => {
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'org_abc', amountTotalPence: 3000 }),
      CLIENT_ID,
      null,
    )
    expect(result).toBe(true)
    expect(mockClientUpdate).toHaveBeenCalledWith({
      where: { id: CLIENT_ID },
      data: { creditBalancePence: { increment: 3000 } },
    })
  })

  it('card payment calls stripe.refunds.create', async () => {
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'pi_card', amountTotalPence: 5000 }),
      CLIENT_ID,
      null,
    )
    expect(result).toBe(true)
    expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({
      payment_intent: 'pi_card',
      reason: 'requested_by_customer',
    }))
  })

  // Regression: reverse_transfer + refund_application_fee only when transferred=true
  it('does NOT pass reverse_transfer when transferred is false', async () => {
    await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'pi_card', transferred: false }),
      CLIENT_ID,
      null,
    )
    const call = mockRefundsCreate.mock.calls[0][0]
    expect(call.reverse_transfer).toBeUndefined()
    expect(call.refund_application_fee).toBeUndefined()
  })

  it('passes reverse_transfer and refund_application_fee when transferred=true', async () => {
    await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'pi_card', transferred: true }),
      CLIENT_ID,
      null,
    )
    const call = mockRefundsCreate.mock.calls[0][0]
    expect(call.reverse_transfer).toBe(true)
    expect(call.refund_application_fee).toBe(true)
  })

  it('marks payment as refunded on success', async () => {
    await refundSessionPayment(makePayment(), CLIENT_ID, null)
    expect(mockPrismaUpdate).toHaveBeenCalledWith({
      where: { id: 'pay_1' },
      data: { status: 'refunded' },
    })
  })

  it('returns false and does not throw when stripe throws', async () => {
    mockRefundsCreate.mockRejectedValueOnce(new Error('Stripe error'))
    const result = await refundSessionPayment(
      makePayment({ stripePaymentIntentId: 'pi_card' }),
      CLIENT_ID,
      null,
    )
    expect(result).toBe(false)
  })
})
