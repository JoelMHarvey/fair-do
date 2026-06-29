import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { priceIdForTier, commissionBpsForTier, tierById } from '@/lib/billing'
import { redeemFreeMonthsCoupon } from '@/lib/referral-credit'
import { z } from 'zod'

const schema = z.object({ tier: z.enum(['free', 'pro', 'school']) })

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-subscribe:${userId}:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid tier' }, { status: 400 })
  const { tier } = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  // Free tier — no Stripe subscription, just activate the local plan.
  if (tier === 'free') {
    await prisma.subscription.upsert({
      where: { teacherId: teacher.id },
      create: { teacherId: teacher.id, tier: 'free', status: 'active', commissionBps: commissionBpsForTier('free') },
      update: { tier: 'free', status: 'active', commissionBps: commissionBpsForTier('free') },
    })
    return Response.json({ ok: true, mode: 'free' }, { status: 200 })
  }

  const priceId = priceIdForTier(tier)
  if (!priceId) {
    return Response.json({ error: `Billing for the ${tierById(tier)?.name ?? tier} plan isn’t configured yet.` }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

  try {
    const stripe = getStripe()
    const existing = await prisma.subscription.findUnique({ where: { teacherId: teacher.id } })

    let customerId = existing?.stripeCustomerId ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${teacher.firstName} ${teacher.lastName}`,
        metadata: { teacherId: teacher.id },
      })
      customerId = customer.id
    }

    // Persist the customer + chosen tier now; the webhook flips status to active on completion.
    await prisma.subscription.upsert({
      where: { teacherId: teacher.id },
      create: { teacherId: teacher.id, tier, status: 'inactive', commissionBps: commissionBpsForTier(tier), stripeCustomerId: customerId },
      update: { tier, stripeCustomerId: customerId },
    })

    // Redeem any banked referral free months as a 100%-off coupon on this subscription.
    const freeMonths = teacher.freeMonthsOwed ?? 0
    const couponId = freeMonths > 0 ? await redeemFreeMonthsCoupon(freeMonths) : null

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      success_url: `${appUrl}/teacher/billing?subscribed=1`,
      cancel_url: `${appUrl}/teacher/billing`,
      metadata: { type: 'practice_subscription', teacherId: teacher.id, tier, ...(couponId ? { freeMonthsRedeemed: String(freeMonths) } : {}) },
      subscription_data: { metadata: { teacherId: teacher.id, tier } },
    })

    return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[practice/billing/subscribe] error:', msg)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
