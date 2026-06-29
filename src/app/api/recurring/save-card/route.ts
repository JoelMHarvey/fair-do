import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { RECURRING_ENABLED } from '@/lib/recurring'

// The student authorises a card for their recurring lessons. Uses Stripe Checkout in
// `setup` mode (saves a card without charging), so no client-side Stripe.js is needed.
// The webhook stores the resulting payment method on the student's recurring bookings.
export async function POST(req: Request) {
  if (!RECURRING_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`recurring-card:${userId}:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
  if (!user?.student) return new Response('Not a student', { status: 403 })
  const student = user.student

  const pending = await prisma.recurringBooking.findMany({
    where: { studentId: student.id, active: true, stripePaymentMethodId: null },
    select: { id: true, stripeCustomerId: true },
  })
  if (pending.length === 0) return Response.json({ error: 'No recurring lessons need a card.' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  try {
    const stripe = getStripe()
    let customerId = pending.find(p => p.stripeCustomerId)?.stripeCustomerId ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { studentId: student.id } })
      customerId = customer.id
    }
    // Persist the customer on all pending bookings so the cron can charge them.
    await prisma.recurringBooking.updateMany({
      where: { studentId: student.id, active: true, stripePaymentMethodId: null },
      data: { stripeCustomerId: customerId },
    })

    const checkout = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customerId,
      success_url: `${appUrl}/dashboard?card=saved`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { type: 'recurring_card', studentId: student.id },
      setup_intent_data: { metadata: { type: 'recurring_card', studentId: student.id } },
    })
    return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
  } catch (e) {
    console.error('[recurring/save-card] error:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start card setup. Please try again.' }, { status: 502 })
  }
}
