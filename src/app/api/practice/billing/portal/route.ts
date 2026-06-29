import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'

// Opens the Stripe Billing customer portal so a therapist can change or cancel their plan.
export async function POST() {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-portal:${userId}:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  const sub = await prisma.subscription.findUnique({ where: { teacherId: user.teacher.id } })
  if (!sub?.stripeCustomerId) {
    return Response.json({ error: 'No billing account yet — choose a paid plan first.' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faresay.com'
  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/teacher/billing`,
    })
    return Response.json({ url: portal.url }, { status: 200 })
  } catch (e) {
    console.error('[practice/billing/portal] error:', e)
    return Response.json({ error: 'Could not open the billing portal.' }, { status: 502 })
  }
}
