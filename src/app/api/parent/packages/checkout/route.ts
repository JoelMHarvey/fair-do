import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

const schema = z.object({ packageId: z.string().min(1) })

// A subscribed parent buys a lesson package the teacher has offered for their child.
// One-off Connect payment straight to the teacher (platform keeps nothing).
export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rl = await checkRateLimit(`parent-package:${userId}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') return new Response('Forbidden', { status: 403 })

  const pkg = await prisma.package.findUnique({ where: { id: parsed.data.packageId }, include: { teacher: true } })
  if (!pkg || !pkg.buyableByParent || pkg.status !== 'active' || pkg.paidAt || !pkg.studentId) {
    return Response.json({ error: 'That package isn’t available to buy.' }, { status: 409 })
  }

  // The parent must have an active, paid portal link to the package's student.
  const link = await prisma.parentLink.findFirst({
    where: { parentUserId: user.id, studentId: pkg.studentId, status: 'active', portalActive: true },
  })
  if (!link) return new Response('Forbidden', { status: 403 })

  if (!pkg.teacher.stripeAccountId) {
    return Response.json({ error: 'This tutor can’t take payments yet.' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  try {
    const checkout = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'paypal'],
      line_items: [{
        price_data: {
          currency: pkg.teacher.country === 'US' ? 'usd' : 'gbp',
          product_data: { name: pkg.name, description: pkg.description ?? `${pkg.sessionsTotal}-lesson package` },
          unit_amount: pkg.pricePence,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        on_behalf_of: pkg.teacher.stripeAccountId,
        transfer_data: { destination: pkg.teacher.stripeAccountId },
      },
      success_url: `${appUrl}/parent/dashboard`,
      cancel_url: `${appUrl}/parent/dashboard`,
      metadata: { type: 'parent_package', packageId: pkg.id, studentId: pkg.studentId },
    })
    return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
  } catch (e) {
    console.error('[parent/packages/checkout] error:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
