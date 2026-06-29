import { prisma } from './prisma'
import { getStripe } from './stripe'

type RefundablePayment = { id: string; status: string; stripePaymentIntentId: string; amountTotalPence: number; transferred?: boolean }

/**
 * Refund a session's payment to the right place:
 * - org-pool funded → restore the org pool
 * - personal-credit funded → restore the student's balance
 * - card → Stripe refund
 * Marks the payment 'refunded'. Returns true on success.
 */
export async function refundSessionPayment(
  payment: RefundablePayment | null | undefined,
  studentId: string,
  clientOrganisationId: string | null,
  // Partial refunds (P2-6): the amount to refund. Defaults to the full payment.
  // 0 refunds nothing; a value below the total is a partial refund.
  refundPence?: number,
): Promise<boolean> {
  if (!payment || payment.status !== 'paid') return false
  const amount = Math.min(refundPence ?? payment.amountTotalPence, payment.amountTotalPence)
  if (amount <= 0) return false
  const partial = amount < payment.amountTotalPence
  const pi = payment.stripePaymentIntentId
  const isInternal = pi.startsWith('credit_') || pi.startsWith('org_')
  try {
    if (isInternal) {
      if (pi.startsWith('org_') && clientOrganisationId) {
        await prisma.organisation.update({ where: { id: clientOrganisationId }, data: { creditPoolPence: { increment: amount } } })
      } else {
        await prisma.student.update({ where: { id: studentId }, data: { creditBalancePence: { increment: amount } } })
      }
    } else {
      const stripe = getStripe()
      // Only reverse the transfer + refund the platform fee when the charge actually
      // transferred to a connected account. For a platform-held charge (no transfer),
      // reverse_transfer/refund_application_fee would error — do a plain refund.
      await stripe.refunds.create({
        payment_intent: pi,
        amount,
        reason: 'requested_by_customer',
        ...(payment.transferred ? { reverse_transfer: true, refund_application_fee: true } : {}),
      })
    }
    await prisma.payment.update({ where: { id: payment.id }, data: { status: partial ? 'partially_refunded' : 'refunded' } })
    return true
  } catch (e) {
    console.error('[refund] failed for payment', payment.id, e)
    return false
  }
}
