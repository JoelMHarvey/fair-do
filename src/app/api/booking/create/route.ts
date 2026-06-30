import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { commissionForSource } from '@/lib/billing'
import { activeSlotKey, isUniqueViolation } from '@/lib/slots'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { createRoom } from '@/lib/daily'
import { sendBookingConfirmed } from '@/lib/email'
import { rewardReferralOnBooking } from '@/lib/referral'
import { rewardTeacherReferralOnFirstSession } from '@/lib/teacher-referral'
import { z } from 'zod'

const schema = z.object({
  teacherId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  seats: z.number().int().min(1).max(12).optional(),
})

export async function POST(req: Request) {
  // Launch gate: bookings/payments stay closed until Stripe is live (set BOOKINGS_ENABLED=true to open).
  // Prevents any charge attempt — and any orphaned session row — while payments aren't wired.
  if (process.env.BOOKINGS_ENABLED !== 'true') {
    return Response.json(
      { error: 'Booking isn\'t open yet — we\'re onboarding our first tutors. Create an account and we\'ll let you know the moment you can book.' },
      { status: 503 },
    )
  }

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`booking:${userId}:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid data', { status: 400 })

  const { teacherId, scheduledAt, seats = 1 } = parsed.data

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true },
  })
  if (!user?.student) return new Response('Not a student', { status: 403 })
  const student = user.student

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId, status: 'ACTIVE' },
    include: { user: true, subscription: true },
  })
  if (!teacher) return new Response('Tutor not found', { status: 404 })
  if (!teacher.stripeAccountId) return new Response('Tutor payments not configured', { status: 422 })

  // Find or create Match
  let match = await prisma.match.findUnique({
    where: { teacherId_studentId: { teacherId, studentId: student.id } },
  })
  if (!match) {
    match = await prisma.match.create({
      data: { teacherId, studentId: student.id },
    })
  }

  // Group booking — organiser pays group rate × seats
  const isGroup = seats > 1
  if (isGroup) {
    if (teacher.groupMaxSize < seats || teacher.groupRatePence == null) {
      return Response.json({ error: 'This tutor does not offer group lessons of that size' }, { status: 422 })
    }
  }

  const now = new Date()

  // Reject double-booking: the slot must be free for this teacher (ignore cancelled).
  const scheduledDate = new Date(scheduledAt)
  const clash = await prisma.session.findFirst({
    where: { teacherId, scheduledAt: scheduledDate, status: { not: 'CANCELLED' } },
    select: { id: true },
  })
  if (clash) return Response.json({ error: 'That time has just been taken — please pick another slot.' }, { status: 409 })

  // Resolve corporate organisation. Auto-link by email domain, but never for free-mail
  // providers (a stranger on gmail must not be enrolled into — and able to spend — an org pool).
  const FREE_MAIL = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com'])
  let org = student.organisationId
    ? await prisma.organisation.findUnique({ where: { id: student.organisationId } })
    : null
  if (!org) {
    const domain = user.email.split('@')[1]?.toLowerCase()
    if (domain && !FREE_MAIL.has(domain)) {
      const domainOrg = await prisma.organisation.findFirst({ where: { domain, active: true } })
      if (domainOrg) {
        org = domainOrg
        await prisma.student.update({ where: { id: student.id }, data: { organisationId: domainOrg.id } })
      }
    }
  }

  // First lesson with this teacher? Apply intro rate if offered (not for groups).
  const priorSessions = await prisma.session.count({
    where: { teacherId, studentId: student.id, status: { not: 'CANCELLED' } },
  })
  const isFirstSession = priorSessions === 0
  const useIntroRate = !isGroup && isFirstSession && teacher.introRatePence != null && teacher.introRatePence < teacher.sessionRatePence

  let ratePence = isGroup
    ? teacher.groupRatePence! * seats
    : useIntroRate
      ? teacher.introRatePence!
      : teacher.sessionRatePence

  // Corporate onboarding discount (e.g. 10% off in first 30 days)
  const orgDiscountActive = !!org && org.active && org.discountPercent > 0 && (!org.discountExpiry || org.discountExpiry > now)
  if (orgDiscountActive) {
    ratePence = Math.round(ratePence * (1 - org!.discountPercent / 100))
  }

  // Create pending Session. slotKey makes the slot unique at the DB level — a
  // concurrent booker racing the same time loses with a clean 409, not a double-book.
  let session
  try {
    session = await prisma.session.create({
      data: {
        matchId: match.id,
        teacherId,
        studentId: student.id,
        scheduledAt: new Date(scheduledAt),
        status: 'SCHEDULED',
        isIntroRate: useIntroRate,
        isGroup,
        slotKey: activeSlotKey(teacherId, new Date(scheduledAt)),
      },
    })
  } catch (e) {
    if (isUniqueViolation(e)) return Response.json({ error: 'Sorry — that time was just taken. Please pick another.' }, { status: 409 })
    throw e
  }

  // Commission by source: marketplace (directory) bookings pay 10%; own students 0%.
  const { bps, feePence: platformFee } = commissionForSource(ratePence, match.source)
  const teacherPayout = ratePence - platformFee
  const roomMax = isGroup ? seats + 1 : 2
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  // Internal settlement — cover from corporate pool first, then personal credit, skipping Stripe.
  // Atomic: the conditional update only decrements if funds are still sufficient, so concurrent
  // bookings can never drive a balance/pool negative (count===0 means it lost the race).
  let fundedBy: 'organisation' | 'credit' | null = null

  if (org != null && org.active && org.creditPoolPence >= ratePence) {
    const res = await prisma.organisation.updateMany({
      where: { id: org.id, creditPoolPence: { gte: ratePence } },
      data: { creditPoolPence: { decrement: ratePence } },
    })
    if (res.count === 1) fundedBy = 'organisation'
  }
  if (!fundedBy && student.creditBalancePence >= ratePence) {
    const res = await prisma.student.updateMany({
      where: { id: student.id, creditBalancePence: { gte: ratePence } },
      data: { creditBalancePence: { decrement: ratePence } },
    })
    if (res.count === 1) fundedBy = 'credit'
  }

  if (fundedBy) {
    // Restore the just-decremented funds if anything downstream fails.
    const restore = async () => {
      if (fundedBy === 'organisation' && org) {
        await prisma.organisation.update({ where: { id: org.id }, data: { creditPoolPence: { increment: ratePence } } }).catch(() => {})
      } else {
        await prisma.student.update({ where: { id: student.id }, data: { creditBalancePence: { increment: ratePence } } }).catch(() => {})
      }
    }
    try {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          stripePaymentIntentId: `${fundedBy === 'organisation' ? 'org' : 'credit'}_${session.id}`,
          amountTotalPence: ratePence,
          platformFeePence: platformFee,
          teacherPayoutPence: teacherPayout,
          currency: teacher.country === 'US' ? 'usd' : 'gbp',
          status: 'paid',
          // Pin the funding org so a later refund returns to the pool that paid,
          // even if the student changes/leaves the org in between.
          fundingOrgId: fundedBy === 'organisation' && org ? org.id : null,
        },
      })
      const room = await createRoom(session.id, session.scheduledAt, roomMax).catch(() => null)
      if (room) {
        await prisma.session.update({
          where: { id: session.id },
          data: { dailyRoomName: room.name, dailyRoomUrl: room.url },
        })
      }
      sendBookingConfirmed({
        clientEmail: user.email,
        clientFirstName: student.firstName,
        teacherEmail: teacher.user.email,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        sessionId: session.id,
        scheduledAt: session.scheduledAt,
        ratePence,
      }).catch(e => console.error('[booking/create] settlement email failed:', e))
    } catch (e) {
      console.error('[booking/create] internal settlement failed:', e)
      await restore()
      await prisma.session.delete({ where: { id: session.id } })
      return Response.json({ error: 'Booking failed' }, { status: 500 })
    }
    // Corporate-pool bookings are real money (the company pre-paid) → reward referrals.
    // Personal-credit bookings are NOT rewarded here (prevents minting credit from free sessions).
    if (fundedBy === 'organisation') {
      rewardReferralOnBooking(student.id).catch(e => console.error('[booking/create] referral reward failed:', e))
      rewardTeacherReferralOnFirstSession(teacherId).catch(e => console.error('[booking/create] teacher referral reward failed:', e))
    }
    return Response.json({ paidWithCredit: true, fundedBy, sessionId: session.id }, { status: 201 })
  }

  const stripe = getStripe()

  // Only use Connect transfer if the teacher's account has active capabilities.
  // UK Express accounts require real KYC even in test mode — skip transfer until verified.
  let connectEnabled = false
  if (teacher.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(teacher.stripeAccountId)
      connectEnabled = account.charges_enabled === true
    } catch {
      connectEnabled = false
    }
  }

  // Never take a card payment that can't reach the teacher. If their Connect
  // account isn't charge-enabled, the money would sit in the platform balance
  // with no transfer — refuse and clean up the pending session instead.
  if (!connectEnabled) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return Response.json({ error: 'This tutor isn\'t set up to receive payments yet. Please try again later.' }, { status: 422 })
  }

  const stripeCurrency = teacher.country === 'US' ? 'usd' : 'gbp'

  let checkout
  try {
    checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: `Lesson with ${teacher.firstName} ${teacher.lastName}`,
              description: `${useIntroRate ? 'First-lesson rate · ' : ''}50 minutes · ${new Date(scheduledAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}`,
            },
            unit_amount: ratePence,
          },
          quantity: 1,
        },
      ],
      ...(connectEnabled ? {
        payment_intent_data: {
          application_fee_amount: platformFee,
          // Teacher is the merchant of record, so Stripe's processing fee comes off
          // THEIR account, not the platform's — without this fair-do would subsidise it.
          on_behalf_of: teacher.stripeAccountId,
          transfer_data: { destination: teacher.stripeAccountId },
          metadata: { commissionBps: String(bps) },
        },
      } : {}),
      success_url: `${appUrl}/session/${session.id}?booked=true`,
      cancel_url: `${appUrl}/book/${teacherId}`,
      metadata: {
        sessionId: session.id,
        studentId: user.student.id,
        teacherId,
        commissionBps: String(bps),
        transferred: String(connectEnabled),
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[booking/create] Stripe error:', msg)
    await prisma.session.delete({ where: { id: session.id } })
    return Response.json({ error: msg }, { status: 502 })
  }

  return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
}
