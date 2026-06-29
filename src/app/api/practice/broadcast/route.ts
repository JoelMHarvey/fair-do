import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { sendClientBroadcast, sendClientEventInvite } from '@/lib/email'
import { buildEventICS } from '@/lib/ics'
import { resolveEmailBrand } from '@/lib/email-brand'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName, clientEmail } from '@/lib/practice'
import { hasPaidAccess } from '@/lib/access'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1).max(160),
  startISO: z.string().datetime(),
  durationMins: z.number().int().min(10).max(600).default(60),
  location: z.string().max(200).optional(),
  joinUrl: z.string().url().max(500).optional(),
})

const schema = z.object({
  subject: z.string().min(1).max(160),
  body: z.string().max(5000).default(''),
  channel: z.enum(['email', 'event']).default('email'),
  // Explicit recipient allowlist (paid). Omitted → every reachable active student.
  studentIds: z.array(z.string()).max(2000).optional(),
  event: eventSchema.optional(),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-broadcast:${userId}:${ip}`, { limit: 5, windowMs: 60 * 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const json = await req.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { subject, body, channel, studentIds, event } = parsed.data

  if (channel === 'event' && !event) {
    return Response.json({ error: 'A calendar invite needs a title and date/time.' }, { status: 400 })
  }
  // A plain email needs a body; an invite can lean on the event details.
  if (channel === 'email' && !body.trim()) {
    return Response.json({ error: 'Write a message before sending.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: { select: { tier: true, status: true } } } } },
  })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  // Recipient selection + calendar invites are paid-tier (Practice/Clinic) powers.
  const sub = teacher.subscription
  const isPaid = hasPaidAccess({ email: user.email, subscription: sub })
  if (!isPaid && (channel === 'event' || studentIds)) {
    return Response.json({ error: 'Choosing recipients and calendar invites are on the Pro plan.' }, { status: 403 })
  }

  const matches = await prisma.match.findMany({
    where: { teacherId: teacher.id, active: true },
    include: { student: { include: { user: true } } },
  })

  // Restrict to the chosen students when an allowlist is supplied (paid).
  const allow = studentIds ? new Set(studentIds) : null
  const seen = new Set<string>()
  const recipients: { studentId: string; email: string; firstName: string }[] = []
  for (const m of matches) {
    if (allow && !allow.has(m.studentId)) continue
    const email = clientEmail(m.student)
    if (!email || seen.has(email)) continue
    seen.add(email)
    recipients.push({ studentId: m.studentId, email, firstName: m.student.firstName })
  }

  if (recipients.length === 0) {
    return Response.json({ error: 'No students with an email address to send to.' }, { status: 422 })
  }

  const practiceName = practiceDisplayName(teacher)
  const brand = await resolveEmailBrand(teacher.id)

  let results: PromiseSettledResult<unknown>[]
  if (channel === 'event' && event) {
    const start = new Date(event.startISO)
    const whenLabel = start.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })
    results = await Promise.allSettled(
      recipients.map(r =>
        sendClientEventInvite({
          to: r.email,
          clientFirstName: r.firstName,
          practiceName,
          title: event.title,
          whenLabel,
          location: event.location,
          joinUrl: event.joinUrl,
          note: body,
          ics: buildEventICS({
            uid: `broadcast-${teacher.id}-${r.studentId}-${event.startISO}`,
            start,
            durationMins: event.durationMins,
            title: event.title,
            description: body,
            location: event.location,
            joinUrl: event.joinUrl,
            organizerName: brand?.practiceName ?? practiceName,
            attendeeEmail: r.email,
            attendeeName: r.firstName,
          }),
          brand,
        }),
      ),
    )
  } else {
    results = await Promise.allSettled(
      recipients.map(r => sendClientBroadcast({ to: r.email, clientFirstName: r.firstName, practiceName, subject, body, brand })),
    )
  }
  const delivered = results.filter(r => r.status === 'fulfilled').length

  await prisma.broadcast.create({
    data: { teacherId: teacher.id, subject, body, channel, recipientCount: delivered },
  })

  return Response.json({ recipientCount: delivered, attempted: recipients.length }, { status: 201 })
}
