import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

const schema = z.object({ parentLinkId: z.string().min(1) })

export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`parent-subscribe:${userId}:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') return new Response('Forbidden', { status: 403 })

  const link = await prisma.parentLink.findFirst({
    where: { id: parsed.data.parentLinkId, parentUserId: user.id, status: 'active' },
    include: { student: { select: { firstName: true } } },
  })
  if (!link) return new Response('Not found', { status: 404 })
  if (link.portalActive) return Response.json({ ok: true, already: true }, { status: 200 })

  const priceId = process.env.STRIPE_PRICE_PARENT_PORTAL
  if (!priceId) return Response.json({ error: 'Parent portal billing isn’t configured yet.' }, { status: 503 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

  try {
    const stripe = getStripe()
    let customerId = link.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { parentLinkId: link.id, parentUserId: user.id },
      })
      customerId = customer.id
      await prisma.parentLink.update({ where: { id: link.id }, data: { stripeCustomerId: customerId } })
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/parent/dashboard?subscribed=1`,
      cancel_url: `${appUrl}/parent/subscribe`,
      metadata: { type: 'parent_portal', parentLinkId: link.id },
      subscription_data: { metadata: { type: 'parent_portal', parentLinkId: link.id } },
    })

    return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
  } catch (e) {
    console.error('[parent/subscribe] error:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
