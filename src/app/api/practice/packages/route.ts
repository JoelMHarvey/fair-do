import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { sendPackageOffered } from '@/lib/email'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName, commissionPence, clientEmail } from '@/lib/practice'
import { z } from 'zod'

const schema = z.object({
  matchId: z.string().min(1),
  name: z.string().min(1).max(120),
  sessionsTotal: z.number().int().min(2).max(100),
  pricePence: z.number().int().min(100).max(2_000_000),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-package:${userId}:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { matchId, name, sessionsTotal, pricePence } = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { student: { include: { user: true } } },
  })
  if (!match || match.teacherId !== teacher.id) return new Response('Student not found', { status: 404 })

  const pkg = await prisma.package.create({
    data: { teacherId: teacher.id, studentId: match.studentId, name, sessionsTotal, pricePence, status: 'unpaid' },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'

  // Can we collect payment online? Needs Stripe + a Connect account with charges enabled.
  let connectEnabled = false
  if (process.env.STRIPE_SECRET_KEY && teacher.stripeAccountId) {
    try {
      connectEnabled = (await getStripe().accounts.retrieve(teacher.stripeAccountId)).charges_enabled === true
    } catch {
      connectEnabled = false
    }
  }

  try {
    if (connectEnabled && teacher.stripeAccountId) {
      const subscription = await prisma.subscription.findUnique({ where: { teacherId: teacher.id } })
      const { bps, feePence } = commissionPence(pricePence, subscription)
      const checkout = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: teacher.country === 'US' ? 'usd' : 'gbp',
            product_data: { name, description: `${sessionsTotal}-lesson package with ${teacher.firstName} ${teacher.lastName}` },
            unit_amount: pricePence,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: feePence,
          // Teacher is the merchant of record → Stripe's processing fee comes off their
          // account, not the platform's (we take no commission, so we don't subsidise it).
          on_behalf_of: teacher.stripeAccountId,
          transfer_data: { destination: teacher.stripeAccountId },
        },
        success_url: `${appUrl}/dashboard`,
        cancel_url: `${appUrl}/dashboard`,
        metadata: { type: 'practice_package', packageId: pkg.id, studentId: match.studentId, teacherId: teacher.id, commissionBps: String(bps) },
      })

      await sendPackageOffered({
        clientEmail: clientEmail(match.student) ?? '',
        clientFirstName: match.student.firstName,
        practiceName: practiceDisplayName(teacher),
        packageName: name,
        sessionsTotal,
        pricePence,
        payUrl: checkout.url ?? `${appUrl}/dashboard`,
      }).catch(e => console.error('[practice/packages] offer email failed:', e))

      return Response.json({ mode: 'payment', packageId: pkg.id, checkoutUrl: checkout.url }, { status: 201 })
    }

    // Offline: mark active immediately; the teacher collects payment directly.
    await prisma.package.update({ where: { id: pkg.id }, data: { status: 'active' } })
    return Response.json({ mode: 'offline', packageId: pkg.id }, { status: 201 })
  } catch (e) {
    console.error('[practice/packages] failed:', e)
    await prisma.package.delete({ where: { id: pkg.id } }).catch(() => {})
    return Response.json({ error: 'Could not create the package. Please try again.' }, { status: 500 })
  }
}
