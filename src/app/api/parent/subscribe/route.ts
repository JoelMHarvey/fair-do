import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED, parentHasActivePortal } from '@/lib/parent'

// parentLinkId is accepted for backward-compat but ignored: billing is per-family
// (one subscription per parent account), not per child-link.
const schema = z.object({ parentLinkId: z.string().optional() }).optional()

export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rl = await checkRateLimit(`parent-subscribe:${userId}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  // Body is optional — nothing in it is required for a family subscription.
  const parsed = schema.safeParse(await req.json().catch(() => undefined))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') return new Response('Forbidden', { status: 403 })

  // Need at least one child linked before there's anything to subscribe for.
  const linkCount = await prisma.parentLink.count({ where: { parentUserId: user.id, status: 'active' } })
  if (linkCount === 0) return new Response('Not found', { status: 404 })

  if (await parentHasActivePortal(user.id)) return Response.json({ ok: true, already: true }, { status: 200 })

  const priceId = process.env.STRIPE_PRICE_PARENT_PORTAL
  if (!priceId) return Response.json({ error: 'Parent portal billing isn’t configured yet.' }, { status: 503 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

  try {
    const stripe = getStripe()
    const existing = await prisma.parentSubscription.findUnique({ where: { parentUserId: user.id } })
    let customerId = existing?.stripeCustomerId ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { parentUserId: user.id },
      })
      customerId = customer.id
    }
    // Ensure a ParentSubscription row holds the customer before checkout.
    await prisma.parentSubscription.upsert({
      where: { parentUserId: user.id },
      create: { parentUserId: user.id, stripeCustomerId: customerId, status: 'inactive' },
      update: { stripeCustomerId: customerId },
    })

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/parent/dashboard?subscribed=1`,
      cancel_url: `${appUrl}/parent/subscribe`,
      metadata: { type: 'parent_portal', parentUserId: user.id },
      subscription_data: { metadata: { type: 'parent_portal', parentUserId: user.id } },
    })

    return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
  } catch (e) {
    console.error('[parent/subscribe] error:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
