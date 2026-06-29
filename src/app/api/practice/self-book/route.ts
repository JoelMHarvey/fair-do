import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendSelfBookingConfirm } from '@/lib/email'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName, generateInviteToken } from '@/lib/practice'
import { verifyTurnstile } from '@/lib/turnstile'
import { finalizeSelfBooking, selfBookRequiresConfirm } from '@/lib/self-book'
import { slotInAvailability, isUniqueViolation } from '@/lib/slots'
import { z } from 'zod'

const schema = z.object({
  slug: z.string().min(1),
  scheduledAt: z.string().datetime(),
  firstName: z.string().min(1).max(60).regex(/^[^\x00-\x1f]+$/, 'Invalid characters'),
  lastName: z.string().min(1).max(60).regex(/^[^\x00-\x1f]+$/, 'Invalid characters'),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  note: z.string().max(2000).optional(),
  turnstileToken: z.string().max(4096).optional(),
})

const PENDING_CAP = 30 // max live unconfirmed bookings per teacher

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`self-book:${ip}`, { limit: 8, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { slug, scheduledAt, firstName, lastName, email, phone, note, turnstileToken } = parsed.data

  // Bot check (no-op unless Turnstile is configured).
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return Response.json({ error: 'Verification failed — please try again.' }, { status: 403 })
  }

  // Per-email limit too, so rotating IPs can't fan out emails to arbitrary recipients.
  const emailRl = await checkRateLimit(`self-book-email:${email.toLowerCase()}`, { limit: 5, windowMs: 60 * 60_000 })
  if (!emailRl.allowed) return rateLimitResponse(emailRl.retryAfterMs)

  const teacher = await prisma.teacher.findUnique({
    where: { practiceSlug: slug },
    include: { availability: true, user: true },
  })
  if (!teacher || teacher.status !== 'ACTIVE' || !teacher.availableForNew) {
    return Response.json({ error: 'This studio isn\'t taking bookings.' }, { status: 404 })
  }

  const when = new Date(scheduledAt)
  if (when.getTime() <= Date.now()) return Response.json({ error: 'Pick a time in the future.' }, { status: 422 })

  // The slot must fall inside one of the teacher's availability windows, evaluated
  // in each window's OWN timezone — server-local time mis-validated slots during BST/DST.
  if (!slotInAvailability(when, teacher.availability)) {
    return Response.json({ error: 'That time isn\'t available.' }, { status: 409 })
  }

  // No double-booking the teacher.
  const clash = await prisma.session.findFirst({
    where: { teacherId: teacher.id, scheduledAt: when, status: { not: 'CANCELLED' } },
    select: { id: true },
  })
  if (clash) return Response.json({ error: 'Sorry — that time was just taken. Please pick another.' }, { status: 409 })

  // Double opt-in (default): hold the booking and email a confirm link. Nothing
  // durable (session, room, teacher notification) is created until confirmed.
  if (selfBookRequiresConfirm()) {
    const livePending = await prisma.pendingSelfBooking.count({ where: { teacherId: teacher.id, expiresAt: { gt: new Date() } } })
    if (livePending >= PENDING_CAP) {
      return Response.json({ error: 'This studio has too many unconfirmed bookings right now — please try later.' }, { status: 429 })
    }
    const token = generateInviteToken()
    await prisma.pendingSelfBooking.create({
      data: { teacherId: teacher.id, scheduledAt: when, firstName, lastName, email: email.toLowerCase(), phone: phone ?? null, note: note ?? null, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
    sendSelfBookingConfirm({
      email, firstName, teacherName: practiceDisplayName(teacher), scheduledAt: when,
      confirmUrl: `${appUrl}/api/practice/self-book/confirm?token=${token}`,
    }).catch(e => console.error('[self-book] confirm email failed:', e))
    return Response.json({ ok: true, pending: true }, { status: 202 })
  }

  // Legacy immediate path (SELFBOOK_REQUIRE_CONFIRM=false).
  try {
    await finalizeSelfBooking({ teacher, firstName, lastName, email, phone, scheduledAt: when, note })
  } catch (e) {
    if (isUniqueViolation(e)) return Response.json({ error: 'Sorry — that time was just taken. Please pick another.' }, { status: 409 })
    throw e
  }
  return Response.json({ ok: true }, { status: 201 })
}
