import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

// Opens the Stripe Billing customer portal so a parent can update their card or
// cancel the £4.99/mo family subscription.
export async function POST() {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rl = await checkRateLimit(`parent-portal-billing:${userId}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') return new Response('Forbidden', { status: 403 })

  const sub = await prisma.parentSubscription.findUnique({ where: { parentUserId: user.id } })
  if (!sub?.stripeCustomerId) {
    return Response.json({ error: 'No billing account yet — subscribe first.' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/parent/dashboard`,
    })
    return Response.json({ url: portal.url }, { status: 200 })
  } catch (e) {
    console.error('[parent/billing-portal] error:', e)
    return Response.json({ error: 'Could not open the billing portal.' }, { status: 502 })
  }
}
