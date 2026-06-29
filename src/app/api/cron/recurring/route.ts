import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { commissionForSource } from '@/lib/billing'
import { activeSlotKey, isUniqueViolation } from '@/lib/slots'
import { createRoom } from '@/lib/daily'
import { sendBookingConfirmed } from '@/lib/email'
import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'
import { RECURRING_ENABLED, nextOccurrence } from '@/lib/recurring'

// Daily. Materialises upcoming recurring lessons and charges the student's saved card
// off-session. Idempotent per slot (the session slotKey is unique), so a re-run never
// double-books or double-charges.
const LEAD_DAYS = 3

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (!RECURRING_ENABLED || process.env.BOOKINGS_ENABLED !== 'true') {
    return Response.json({ skipped: true }, { status: 200 })
  }

  const now = new Date()
  const horizon = new Date(now.getTime() + LEAD_DAYS * 24 * 60 * 60 * 1000)

  const due = await prisma.recurringBooking.findMany({
    where: {
      active: true,
      stripePaymentMethodId: { not: null },
      nextScheduledAt: { lte: horizon },
      OR: [{ pausedUntil: null }, { pausedUntil: { lt: now } }],
    },
    include: { match: { include: { teacher: { include: { subscription: true, user: true } }, student: { include: { user: true } } } } },
    take: 200,
  })

  let created = 0, charged = 0, failed = 0, skipped = 0
  const stripe = getStripe()

  for (const rb of due) {
    const when = new Date(rb.nextScheduledAt)
    const teacher = rb.match.teacher
    const student = rb.match.student
    const advance = () => prisma.recurringBooking.update({
      where: { id: rb.id },
      data: { nextScheduledAt: nextOccurrence(rb.dayOfWeek, rb.startTime, when) },
    }).catch(() => {})

    // Past-due (cron lag) or teacher can't take payment → skip this slot, roll forward.
    if (when.getTime() <= now.getTime() || !teacher.stripeAccountId || teacher.status !== 'ACTIVE') {
      skipped++; await advance(); continue
    }

    // Already materialised (idempotency) or the slot is taken.
    const clash = await prisma.session.findFirst({
      where: { teacherId: teacher.id, scheduledAt: when, status: { not: 'CANCELLED' } },
      select: { id: true },
    })
    if (clash) { skipped++; await advance(); continue }

    let session
    try {
      session = await prisma.session.create({
        data: {
          matchId: rb.matchId,
          teacherId: teacher.id,
          studentId: student.id,
          scheduledAt: when,
          durationMins: rb.durationMins,
          status: 'SCHEDULED',
          slotKey: activeSlotKey(teacher.id, when),
        },
      })
    } catch (e) {
      if (isUniqueViolation(e)) { skipped++; await advance(); continue }
      failed++; await advance(); continue
    }
    created++

    const { feePence: platformFee } = commissionForSource(rb.ratePence, rb.match.source)
    const currency = teacher.country === 'US' ? 'usd' : 'gbp'

    try {
      const pi = await stripe.paymentIntents.create({
        amount: rb.ratePence,
        currency,
        customer: rb.stripeCustomerId ?? undefined,
        payment_method: rb.stripePaymentMethodId!,
        off_session: true,
        confirm: true,
        application_fee_amount: platformFee,
        transfer_data: { destination: teacher.stripeAccountId },
        metadata: { type: 'recurring', recurringBookingId: rb.id, sessionId: session.id },
      })

      await prisma.payment.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          stripePaymentIntentId: pi.id,
          stripeChargeId: typeof pi.latest_charge === 'string' ? pi.latest_charge : null,
          amountTotalPence: rb.ratePence,
          platformFeePence: platformFee,
          teacherPayoutPence: rb.ratePence - platformFee,
          transferred: true,
          currency,
          status: 'paid',
        },
      })
      charged++

      const room = await createRoom(session.id, when, 2).catch(() => null)
      if (room) await prisma.session.update({ where: { id: session.id }, data: { dailyRoomName: room.name, dailyRoomUrl: room.url } })

      sendBookingConfirmed({
        clientEmail: student.user?.email ?? student.contactEmail ?? '',
        clientFirstName: student.firstName,
        teacherEmail: teacher.user.email,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        sessionId: session.id,
        scheduledAt: when,
        ratePence: rb.ratePence,
      }).catch(e => console.error('[cron/recurring] email failed:', e))
    } catch (e) {
      // Charge failed (declined, needs auth, etc.) — undo the unpaid session so the slot
      // frees up, and leave the booking active to retry next run.
      console.error('[cron/recurring] charge failed for booking', rb.id, e instanceof Error ? e.message : e)
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      created--
      failed++
    }

    await advance()
  }

  await recordCronRun('recurring', true, undefined, JSON.stringify({ due: due.length, created, charged, failed, skipped })).catch(() => {})
  return Response.json({ due: due.length, created, charged, failed, skipped }, { status: 200 })
}
