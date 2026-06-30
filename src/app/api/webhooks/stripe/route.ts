import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createRoom } from '@/lib/daily'
import { sendBookingConfirmed, sendGiftVoucher } from '@/lib/email'
import { generateVoucherCode } from '@/lib/voucher'
import { rewardReferralOnBooking } from '@/lib/referral'
import { rewardTeacherReferralOnFirstSession } from '@/lib/teacher-referral'
import { commissionBpsForTier, subscriptionPeriodEnd, tierByPriceId } from '@/lib/billing'
import { clientEmail } from '@/lib/practice'
import { syncFamilyPortalAccess } from '@/lib/parent'
import type Stripe from 'stripe'

// A handler failed AFTER we claimed the event as processed. Roll the claim back
// so Stripe's at-least-once retry re-runs the handler — otherwise the card is
// charged but the provisioning/credit is lost forever behind 'Already processed'.
async function rollbackAndRetry(eventId: string, label: string, e: unknown): Promise<Response> {
  console.error(`[stripe webhook] ${label} failed — rolling back idempotency marker for retry:`, e)
  await prisma.processedStripeEvent.delete({ where: { id: eventId } }).catch(() => {})
  return new Response('Handler error, will retry', { status: 500 })
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Idempotency: Stripe retries/redelivers events. Record the event id once;
  // a duplicate delivery short-circuits so nothing is double-applied.
  try {
    await prisma.processedStripeEvent.create({ data: { id: event.id, type: event.type } })
  } catch {
    return new Response('Already processed', { status: 200 })
  }

  // Connect account onboarding status — keep stripeOnboarded in sync so a teacher
  // becomes bookable only once Stripe has enabled charges + payouts (KYC complete).
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account
    const onboarded = !!(account.charges_enabled && account.payouts_enabled && account.details_submitted)
    await prisma.teacher.updateMany({
      where: { stripeAccountId: account.id },
      data: { stripeOnboarded: onboarded },
    })
    return new Response('OK', { status: 200 })
  }

  // Refunds issued from the Stripe Dashboard (not via our app) — sync payment status.
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const piId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null
    if (piId) {
      const fullyRefunded = charge.amount_refunded >= charge.amount
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: piId },
        data: { status: fullyRefunded ? 'refunded' : 'partially_refunded', stripeChargeId: charge.id },
      })
    }
    return new Response('OK', { status: 200 })
  }

  // Studio subscription lifecycle (teacher pays fair-do). Keep our local
  // Subscription record in sync with Stripe.
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status
    // Resync tier + commission if the plan changed (e.g. an upgrade/downgrade in the billing portal).
    const tier = tierByPriceId(sub.items?.data?.[0]?.price?.id)
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status,
        currentPeriodEnd: subscriptionPeriodEnd(sub),
        ...(tier ? { tier: tier.id, commissionBps: tier.commissionBps } : {}),
      },
    })
    // Parent portal subscriptions (parent pays fair-do directly) — one family sub
    // gates every linked child. Sync the sub record, then fan access out to links.
    const parentActive = event.type !== 'customer.subscription.deleted' && (sub.status === 'active' || sub.status === 'trialing')
    const psub = await prisma.parentSubscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
      select: { parentUserId: true },
    })
    if (psub) {
      await prisma.parentSubscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status, currentPeriodEnd: subscriptionPeriodEnd(sub) },
      })
      await syncFamilyPortalAccess(psub.parentUserId, parentActive)
    }
    return new Response('OK', { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    const checkout = event.data.object as Stripe.Checkout.Session
    const meta = checkout.metadata ?? {}

    // Studio subscription started — activate the teacher's plan.
    if (meta.type === 'practice_subscription') {
      const teacherId = meta.teacherId
      const tier = meta.tier ?? 'pro'
      const subId = typeof checkout.subscription === 'string' ? checkout.subscription : checkout.subscription?.id ?? null
      const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id ?? null
      if (teacherId) {
        try {
          let periodEnd: Date | null = null
          if (subId) periodEnd = subscriptionPeriodEnd(await getStripe().subscriptions.retrieve(subId))
          const data = {
            tier,
            status: 'active',
            commissionBps: commissionBpsForTier(tier),
            stripeCustomerId: customerId,
            stripeSubscriptionId: subId,
            currentPeriodEnd: periodEnd,
          }
          await prisma.subscription.upsert({
            where: { teacherId },
            create: { teacherId, ...data },
            update: data,
          })
          // Burn the referral free months that were redeemed on this checkout (best-effort —
          // secondary to activation, so a failure here must not roll back / retry the event).
          if (meta.freeMonthsRedeemed) {
            const n = Number(meta.freeMonthsRedeemed) || 0
            if (n > 0) {
              await prisma.teacher.update({ where: { id: teacherId }, data: { freeMonthsOwed: { decrement: n } } }).catch(() => {})
              await prisma.teacher.updateMany({ where: { id: teacherId, freeMonthsOwed: { lt: 0 } }, data: { freeMonthsOwed: 0 } }).catch(() => {})
            }
          }
        } catch (e) {
          return rollbackAndRetry(event.id, 'studio subscription activation', e)
        }
      }
      return new Response('OK', { status: 200 })
    }

    // Parent portal subscription started — activate the family plan and unlock
    // every child the parent already follows.
    if (meta.type === 'parent_portal') {
      const parentUserId = meta.parentUserId
      const subId = typeof checkout.subscription === 'string' ? checkout.subscription : checkout.subscription?.id ?? null
      const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id ?? null
      if (parentUserId) {
        try {
          let periodEnd: Date | null = null
          if (subId) periodEnd = subscriptionPeriodEnd(await getStripe().subscriptions.retrieve(subId))
          await prisma.parentSubscription.upsert({
            where: { parentUserId },
            create: { parentUserId, status: 'active', stripeSubscriptionId: subId, stripeCustomerId: customerId, currentPeriodEnd: periodEnd },
            update: { status: 'active', stripeSubscriptionId: subId, ...(customerId ? { stripeCustomerId: customerId } : {}), currentPeriodEnd: periodEnd },
          })
          await syncFamilyPortalAccess(parentUserId, true)
        } catch (e) {
          return rollbackAndRetry(event.id, 'parent portal activation', e)
        }
      }
      return new Response('OK', { status: 200 })
    }

    // Recurring-booking card saved (Checkout setup mode) — store the payment method
    // on the student's recurring bookings so the cron can charge off-session.
    if (meta.type === 'recurring_card') {
      const studentId = meta.studentId
      const siId = typeof checkout.setup_intent === 'string' ? checkout.setup_intent : checkout.setup_intent?.id ?? null
      if (studentId && siId) {
        try {
          const si = await getStripe().setupIntents.retrieve(siId)
          const pmId = typeof si.payment_method === 'string' ? si.payment_method : si.payment_method?.id ?? null
          if (pmId) {
            await prisma.recurringBooking.updateMany({
              where: { studentId, active: true, stripePaymentMethodId: null },
              data: { stripePaymentMethodId: pmId },
            })
          }
        } catch (e) {
          return rollbackAndRetry(event.id, 'recurring card setup', e)
        }
      }
      return new Response('OK', { status: 200 })
    }

    // Studio package purchased — activate it + record the payment.
    if (meta.type === 'practice_package') {
      const amountTotal = checkout.amount_total ?? 0
      const paymentIntentId = typeof checkout.payment_intent === 'string'
        ? checkout.payment_intent
        : checkout.payment_intent?.id ?? ''
      const fee = meta.commissionBps ? Math.round((amountTotal * Number(meta.commissionBps)) / 10000) : 0
      try {
        if (meta.packageId) {
          await prisma.package.update({ where: { id: meta.packageId }, data: { status: 'active' } })
        }
        if (meta.studentId && paymentIntentId) {
          const teacher = meta.teacherId ? await prisma.teacher.findUnique({ where: { id: meta.teacherId } }) : null
          await prisma.payment.create({
            data: {
              studentId: meta.studentId,
              stripePaymentIntentId: paymentIntentId,
              amountTotalPence: amountTotal,
              platformFeePence: fee,
              teacherPayoutPence: amountTotal - fee,
              currency: teacher?.country === 'US' ? 'usd' : 'gbp',
              status: 'paid',
            },
          })
        }
      } catch (e) {
        return rollbackAndRetry(event.id, 'studio package activation', e)
      }
      return new Response('OK', { status: 200 })
    }

    // Gift voucher purchase — create code, email recipient + purchaser receipt
    if (meta.type === 'gift') {
      const amountPence = Number(meta.amountPence) || (checkout.amount_total ?? 0)
      const paymentIntentId = typeof checkout.payment_intent === 'string'
        ? checkout.payment_intent
        : checkout.payment_intent?.id ?? null
      const code = generateVoucherCode()
      try {
        await prisma.giftVoucher.create({
          data: {
            code,
            amountPence,
            purchaserEmail: meta.purchaserEmail,
            recipientEmail: meta.recipientEmail || null,
            message: meta.message || null,
            stripePaymentIntentId: paymentIntentId,
          },
        })
      } catch (e) {
        return rollbackAndRetry(event.id, 'gift voucher', e)
      }
      // Emails are best-effort — a delivery blip must not roll back the (already
      // created) voucher and re-mint a new code on retry.
      const recipient = meta.recipientEmail || meta.purchaserEmail
      sendGiftVoucher({ to: recipient, code, amountPence, message: meta.message || undefined, fromPurchaser: !meta.recipientEmail })
        .catch(e => console.error('[stripe webhook] gift voucher email failed:', e))
      if (meta.recipientEmail) {
        sendGiftVoucher({ to: meta.purchaserEmail, code, amountPence, message: meta.message || undefined, fromPurchaser: true })
          .catch(e => console.error('[stripe webhook] gift voucher purchaser email failed:', e))
      }
      return new Response('OK', { status: 200 })
    }

    // Corporate credit-pool top-up — only credit immediately for synchronous methods
    // (card, PayPal). BACS arrives with payment_status 'unpaid'; the pool is credited
    // later when checkout.session.async_payment_succeeded fires.
    if (meta.type === 'org_topup') {
      if (checkout.payment_status === 'paid') {
        const amountPence = Number(meta.amountPence) || (checkout.amount_total ?? 0)
        try {
          await prisma.organisation.update({
            where: { id: meta.orgId },
            data: { creditPoolPence: { increment: amountPence } },
          })
        } catch (e) {
          return rollbackAndRetry(event.id, 'org topup', e)
        }
      }
      return new Response('OK', { status: 200 })
    }

    const { sessionId, studentId, teacherId } = meta

    if (!sessionId || !studentId || !teacherId) {
      return new Response('Missing metadata', { status: 400 })
    }

    const amountTotal = checkout.amount_total ?? 0
    const paymentIntentId = typeof checkout.payment_intent === 'string'
      ? checkout.payment_intent
      : checkout.payment_intent?.id ?? ''

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    })
    if (!teacher) return new Response('Teacher not found', { status: 404 })

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    })

    // Bookings carry their commission (bps) in metadata. fair-do takes no session
    // commission, so this is 0 — kept generic in case a tier ever reintroduces a fee.
    const platformFee = meta.commissionBps
      ? Math.round(amountTotal * (Number(meta.commissionBps) / 10000))
      : 0
    const teacherPayout = amountTotal - platformFee

    try {
      await prisma.payment.create({
        data: {
          studentId,
          sessionId,
          stripePaymentIntentId: paymentIntentId,
          amountTotalPence: amountTotal,
          platformFeePence: platformFee,
          teacherPayoutPence: teacherPayout,
          currency: teacher.country === 'US' ? 'usd' : 'gbp',
          status: 'paid',
          transferred: meta.transferred === 'true',
        },
      })
    } catch (e) {
      return rollbackAndRetry(event.id, 'booking payment', e)
    }

    // Reward referrer when this referee pays — idempotent (once per referral).
    await rewardReferralOnBooking(studentId).catch(e => console.error('[stripe webhook] referral reward failed:', e))
    // Reward referring teacher on this teacher's first paid lesson — idempotent.
    await rewardTeacherReferralOnFirstSession(teacherId).catch(e => console.error('[stripe webhook] teacher referral reward failed:', e))

    // Create Daily.co video room — non-blocking
    let dbSession = await prisma.session.findUnique({ where: { id: sessionId } })
    try {
      if (dbSession) {
        const roomMax = dbSession.isGroup ? Math.max(teacher.groupMaxSize + 1, 2) : 2
        const room = await createRoom(sessionId, dbSession.scheduledAt, roomMax)
        dbSession = await prisma.session.update({
          where: { id: sessionId },
          data: { dailyRoomName: room.name, dailyRoomUrl: room.url },
        })
      }
    } catch (e) {
      console.error('[stripe webhook] Daily.co room creation failed:', e)
    }

    // Send booking confirmation emails — non-blocking (managed students may have no email)
    if (student && dbSession && clientEmail(student)) {
      sendBookingConfirmed({
        clientEmail: clientEmail(student)!,
        clientFirstName: student.firstName,
        teacherEmail: teacher.user.email,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        sessionId,
        scheduledAt: dbSession.scheduledAt,
        ratePence: teacher.sessionRatePence,
      }).catch(e => console.error('[stripe webhook] booking email failed:', e))
    }
  }

  // BACS Direct Debit clears 3–5 business days after mandate setup. Credit the org pool
  // only once the payment has actually settled, not at checkout.session.completed.
  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}
    if (meta.type === 'org_topup') {
      const amountPence = Number(meta.amountPence) || (session.amount_total ?? 0)
      try {
        await prisma.organisation.update({
          where: { id: meta.orgId },
          data: { creditPoolPence: { increment: amountPence } },
        })
      } catch (e) {
        return rollbackAndRetry(event.id, 'org topup async payment succeeded', e)
      }
    }
    return new Response('OK', { status: 200 })
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}
    if (meta.type === 'org_topup') {
      console.error(`[stripe webhook] BACS payment failed for org top-up — orgId: ${meta.orgId}, amount: ${meta.amountPence}p, customer: ${session.customer_email}`)
    }
    return new Response('OK', { status: 200 })
  }

  return new Response('OK', { status: 200 })
}
