import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { createRoom } from '@/lib/daily'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { sendSessionScheduledByTherapist, sendSessionSeriesScheduled } from '@/lib/email'
import { PRACTICE_PORTAL_ENABLED, effectiveRatePence, practiceDisplayName, commissionPence, clientEmail } from '@/lib/practice'
import { activeSlotKey, isUniqueViolation } from '@/lib/slots'
import { z } from 'zod'

const schema = z.object({
  matchId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMins: z.number().int().min(15).max(180).optional(),
  usePackageId: z.string().min(1).optional(),
  repeatWeekly: z.number().int().min(1).max(12).optional(),
})

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-booking:${userId}:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { matchId, scheduledAt, durationMins, usePackageId, repeatWeekly } = parsed.data
  const occurrences = Math.min(Math.max(repeatWeekly ?? 1, 1), 12)

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { student: { include: { user: true } } },
  })
  if (!match || match.teacherId !== teacher.id) return new Response('Student not found', { status: 404 })
  if (!match.active) return Response.json({ error: 'This student is not active.' }, { status: 409 })

  const scheduledDate = new Date(scheduledAt)
  if (scheduledDate.getTime() <= Date.now()) {
    return Response.json({ error: 'Pick a time in the future.' }, { status: 422 })
  }

  // No double-booking this teacher (ignore cancelled).
  const clash = await prisma.session.findFirst({
    where: { teacherId: teacher.id, scheduledAt: scheduledDate, status: { not: 'CANCELLED' } },
    select: { id: true },
  })
  if (clash) return Response.json({ error: 'You already have a lesson at that time.' }, { status: 409 })

  const ratePence = effectiveRatePence(match, teacher)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
  // Managed (accountless) students may have no email — sends are best-effort and skipped if absent.
  const cEmail = clientEmail(match.student) ?? ''

  const makeRoomFor = async (sessionId: string, when: Date) => {
    const room = await createRoom(sessionId, when, 2).catch(() => null)
    if (room) await prisma.session.update({ where: { id: sessionId }, data: { dailyRoomName: room.name, dailyRoomUrl: room.url } })
  }

  // ── Recurring series (weekly) ──────────────────────────────────────────────
  // A series isn't auto-charged per session (that would be N pay-links): it draws
  // from a package, or is scheduled offline. Online per-session charging stays single.
  if (occurrences > 1) {
    // Candidate weekly dates, skipping any that clash with an existing session.
    const candidates: Date[] = []
    for (let i = 0; i < occurrences; i++) {
      const d = new Date(scheduledDate.getTime() + i * WEEK_MS)
      const clashRow = await prisma.session.findFirst({
        where: { teacherId: teacher.id, scheduledAt: d, status: { not: 'CANCELLED' } },
        select: { id: true },
      })
      if (!clashRow) candidates.push(d)
    }
    if (candidates.length === 0) {
      return Response.json({ error: 'Those times are already taken.' }, { status: 409 })
    }

    if (usePackageId) {
      const pkg = await prisma.package.findFirst({
        where: { id: usePackageId, teacherId: teacher.id, studentId: match.studentId, status: 'active' },
      })
      if (!pkg) return Response.json({ error: 'That package isn\'t available.' }, { status: 409 })
      const available = pkg.sessionsTotal - pkg.sessionsUsed
      const toCreate = Math.min(candidates.length, available)
      if (toCreate <= 0) return Response.json({ error: 'That package has no sessions left.' }, { status: 409 })

      const willComplete = pkg.sessionsUsed + toCreate >= pkg.sessionsTotal
      const drawn = await prisma.package.updateMany({
        where: { id: pkg.id, status: 'active', sessionsUsed: pkg.sessionsUsed },
        data: { sessionsUsed: { increment: toCreate }, status: willComplete ? 'completed' : 'active' },
      })
      if (drawn.count !== 1) return Response.json({ error: 'Please try again.' }, { status: 409 })

      const created: { id: string; scheduledAt: Date }[] = []
      try {
        for (const d of candidates.slice(0, toCreate)) {
          const s = await prisma.session.create({
            data: { matchId: match.id, teacherId: teacher.id, studentId: match.studentId, scheduledAt: d, durationMins: durationMins ?? 50, status: 'SCHEDULED', slotKey: activeSlotKey(teacher.id, d) },
          })
          await makeRoomFor(s.id, d)
          created.push({ id: s.id, scheduledAt: d })
        }
      } catch (e) {
        console.error('[practice/booking] package series partial failure:', e)
      }
      // Reconcile: we drew down `toCreate` up front but only created `created.length`.
      // Give back any shortfall and reopen the package (it isn't fully used after all).
      const shortfall = toCreate - created.length
      if (shortfall > 0) {
        await prisma.package.updateMany({
          where: { id: pkg.id },
          data: { sessionsUsed: { decrement: shortfall }, status: 'active' },
        }).catch(e => console.error(`[practice/booking] CRITICAL: failed to refund ${shortfall} package session(s) on package ${pkg.id}:`, e))
      }
      if (created.length === 0) {
        return Response.json({ error: 'Couldn\'t schedule the series. Please try again.' }, { status: 500 })
      }
      await sendSessionSeriesScheduled({
        clientEmail: cEmail, clientFirstName: match.student.firstName,
        teacherFirstName: teacher.firstName, teacherLastName: teacher.lastName,
        practiceName: practiceDisplayName(teacher), firstDate: created[0].scheduledAt,
        count: created.length, viaPackage: true, sessionUrl: `${appUrl}/session/${created[0].id}`,
      }).catch(e => console.error('[practice/booking] series email failed:', e))

      return Response.json({ mode: 'series-package', created: created.length, sessionsLeft: pkg.sessionsTotal - (pkg.sessionsUsed + created.length) }, { status: 201 })
    }

    // No package → offline series only. Refuse if online charging is configured (use a package instead).
    let connectEnabled = false
    if (process.env.STRIPE_SECRET_KEY && teacher.stripeAccountId) {
      try { connectEnabled = (await getStripe().accounts.retrieve(teacher.stripeAccountId)).charges_enabled === true } catch { connectEnabled = false }
    }
    if (connectEnabled) {
      return Response.json({ error: 'For a recurring series, sell a package — or schedule lessons individually to charge each one.' }, { status: 422 })
    }

    const created: { id: string; scheduledAt: Date }[] = []
    for (const d of candidates) {
      const s = await prisma.session.create({
        data: { matchId: match.id, teacherId: teacher.id, studentId: match.studentId, scheduledAt: d, durationMins: durationMins ?? 50, status: 'SCHEDULED', slotKey: activeSlotKey(teacher.id, d) },
      })
      await makeRoomFor(s.id, d)
      created.push({ id: s.id, scheduledAt: d })
    }
    await sendSessionSeriesScheduled({
      clientEmail: cEmail, clientFirstName: match.student.firstName,
      teacherFirstName: teacher.firstName, teacherLastName: teacher.lastName,
      practiceName: practiceDisplayName(teacher), firstDate: created[0].scheduledAt,
      count: created.length, viaPackage: false, sessionUrl: `${appUrl}/session/${created[0].id}`,
    }).catch(e => console.error('[practice/booking] series email failed:', e))

    return Response.json({ mode: 'series-offline', created: created.length }, { status: 201 })
  }

  // Package draw-down: no payment — consume one session from an active package.
  if (usePackageId) {
    const pkg = await prisma.package.findFirst({
      where: { id: usePackageId, teacherId: teacher.id, studentId: match.studentId, status: 'active' },
    })
    if (!pkg) return Response.json({ error: 'That package isn\'t available.' }, { status: 409 })
    if (pkg.sessionsUsed >= pkg.sessionsTotal) {
      return Response.json({ error: 'That package has no sessions left.' }, { status: 409 })
    }
    const willComplete = pkg.sessionsUsed + 1 >= pkg.sessionsTotal
    const drawn = await prisma.package.updateMany({
      where: { id: pkg.id, status: 'active', sessionsUsed: pkg.sessionsUsed }, // optimistic concurrency
      data: { sessionsUsed: { increment: 1 }, status: willComplete ? 'completed' : 'active' },
    })
    if (drawn.count !== 1) return Response.json({ error: 'Please try again.' }, { status: 409 })

    try {
      const session = await prisma.session.create({
        data: {
          matchId: match.id,
          teacherId: teacher.id,
          studentId: match.studentId,
          scheduledAt: scheduledDate,
          durationMins: durationMins ?? 50,
          status: 'SCHEDULED',
          slotKey: activeSlotKey(teacher.id, scheduledDate),
        },
      })
      const room = await createRoom(session.id, scheduledDate, 2).catch(() => null)
      if (room) {
        await prisma.session.update({ where: { id: session.id }, data: { dailyRoomName: room.name, dailyRoomUrl: room.url } })
      }
      await sendSessionScheduledByTherapist({
        clientEmail: cEmail,
        clientFirstName: match.student.firstName,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        practiceName: practiceDisplayName(teacher),
        scheduledAt: scheduledDate,
        ratePence,
        sessionUrl: `${appUrl}/session/${session.id}`,
      }).catch(e => console.error('[practice/booking] package email failed:', e))

      return Response.json({ mode: 'package', sessionId: session.id, sessionsLeft: pkg.sessionsTotal - (pkg.sessionsUsed + 1) }, { status: 201 })
    } catch (e) {
      // Roll the draw-down back if session creation failed.
      await prisma.package.updateMany({ where: { id: pkg.id }, data: { sessionsUsed: { decrement: 1 }, status: 'active' } })
        .catch(err => console.error(`[practice/booking] CRITICAL: failed to refund 1 package session on package ${pkg.id}:`, err))
      if (isUniqueViolation(e)) return Response.json({ error: 'That time was just taken. Please pick another.' }, { status: 409 })
      console.error('[practice/booking] package draw-down failed:', e)
      return Response.json({ error: 'Couldn\'t schedule the lesson. Please try again.' }, { status: 500 })
    }
  }

  let session
  try {
    session = await prisma.session.create({
      data: {
        matchId: match.id,
        teacherId: teacher.id,
        studentId: match.studentId,
        scheduledAt: scheduledDate,
        durationMins: durationMins ?? 50,
        status: 'SCHEDULED',
        slotKey: activeSlotKey(teacher.id, scheduledDate),
      },
    })
  } catch (e) {
    if (isUniqueViolation(e)) return Response.json({ error: 'You already have a lesson at that time.' }, { status: 409 })
    throw e
  }
  const sessionUrl = `${appUrl}/session/${session.id}`

  // Can we take payment online? Needs Stripe + a Connect account with charges enabled.
  let connectEnabled = false
  if (process.env.STRIPE_SECRET_KEY && teacher.stripeAccountId) {
    try {
      const account = await getStripe().accounts.retrieve(teacher.stripeAccountId)
      connectEnabled = account.charges_enabled === true
    } catch {
      connectEnabled = false
    }
  }

  try {
    if (connectEnabled && teacher.stripeAccountId) {
      // Online payment: email the student a Stripe Checkout link. The existing
      // stripe webhook (keyed on metadata) creates the Payment + Daily room on completion.
      // Commission comes from the teacher's subscription (Starter rate if none).
      const subscription = await prisma.subscription.findUnique({ where: { teacherId: teacher.id } })
      const { bps, feePence } = commissionPence(ratePence, subscription)
      const stripe = getStripe()
      const checkout = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: teacher.country === 'US' ? 'usd' : 'gbp',
            product_data: {
              name: `Lesson with ${teacher.firstName} ${teacher.lastName}`,
              description: `${durationMins ?? 50} minutes · ${scheduledDate.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}`,
            },
            unit_amount: ratePence,
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
        success_url: `${sessionUrl}?booked=true`,
        cancel_url: `${appUrl}/dashboard`,
        metadata: { sessionId: session.id, studentId: match.studentId, teacherId: teacher.id, commissionBps: String(bps), transferred: 'true' },
      })

      await sendSessionScheduledByTherapist({
        clientEmail: cEmail,
        clientFirstName: match.student.firstName,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        practiceName: practiceDisplayName(teacher),
        scheduledAt: scheduledDate,
        ratePence,
        sessionUrl,
        payUrl: checkout.url ?? undefined,
      }).catch(e => console.error('[practice/booking] pay-request email failed:', e))

      return Response.json({ mode: 'payment', sessionId: session.id, checkoutUrl: checkout.url }, { status: 201 })
    }

    // Offline payment: create the video room now and email a plain confirmation.
    // The teacher arranges payment with the student directly.
    const room = await createRoom(session.id, scheduledDate, 2).catch(() => null)
    if (room) {
      await prisma.session.update({
        where: { id: session.id },
        data: { dailyRoomName: room.name, dailyRoomUrl: room.url },
      })
    }
    await sendSessionScheduledByTherapist({
      clientEmail: cEmail,
      clientFirstName: match.student.firstName,
      teacherFirstName: teacher.firstName,
      teacherLastName: teacher.lastName,
      practiceName: practiceDisplayName(teacher),
      scheduledAt: scheduledDate,
      ratePence,
      sessionUrl,
    }).catch(e => console.error('[practice/booking] scheduled email failed:', e))

    return Response.json({ mode: 'scheduled', sessionId: session.id }, { status: 201 })
  } catch (e) {
    console.error('[practice/booking] failed:', e)
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return Response.json({ error: 'Couldn\'t schedule the lesson. Please try again.' }, { status: 500 })
  }
}
