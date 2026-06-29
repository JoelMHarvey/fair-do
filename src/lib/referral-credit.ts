import { prisma } from './prisma'
import { getStripe } from './stripe'

// Referral reward = a free month of the paid plan (we take no commission, so cash bonuses
// don't fit). A 100%-off coupon: `once` for one month, `repeating` for several.
async function freeMonthCoupon(months: number): Promise<string> {
  const stripe = getStripe()
  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: months > 1 ? 'repeating' : 'once',
    ...(months > 1 ? { duration_in_months: months } : {}),
    name: `fair-do referral — ${months} free month${months > 1 ? 's' : ''}`,
  })
  return coupon.id
}

/**
 * Reward the referrer with one free month. If they're already on a paid plan, apply it to
 * their live subscription now; otherwise bank it (redeemed when they next subscribe).
 * Best-effort: on any Stripe failure it falls back to banking, never throws.
 */
export async function grantReferralFreeMonth(referrerTeacherId: string): Promise<void> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { teacherId: referrerTeacherId } })
    const paidActive = sub && (sub.status === 'active' || sub.status === 'trialing')
      && sub.tier !== 'starter' && !!sub.stripeSubscriptionId
    if (paidActive) {
      const coupon = await freeMonthCoupon(1)
      await getStripe().subscriptions.update(sub!.stripeSubscriptionId!, { discounts: [{ coupon }] })
      return
    }
  } catch (e) {
    console.error('[referral] immediate free-month apply failed — banking instead', e)
  }
  await prisma.teacher
    .update({ where: { id: referrerTeacherId }, data: { freeMonthsOwed: { increment: 1 } } })
    .catch(e => console.error('[referral] banking free month failed', e))
}

/** Coupon id to redeem N banked free months on a new subscription checkout, or null. */
export async function redeemFreeMonthsCoupon(months: number): Promise<string | null> {
  if (months <= 0) return null
  try {
    return await freeMonthCoupon(months)
  } catch (e) {
    console.error('[referral] redemption coupon create failed', e)
    return null
  }
}
