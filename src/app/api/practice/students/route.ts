import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { sendClientInvite } from '@/lib/email'
import {
  PRACTICE_PORTAL_ENABLED,
  generateInviteToken,
  inviteExpiry,
  practiceDisplayName,
} from '@/lib/practice'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().max(200),
  firstName: z.string().max(100).optional(),
  customRatePence: z.number().int().min(0).max(100000).optional(),
  note: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-invite:${userId}:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { email, firstName, customRatePence, note } = parsed.data
  const normalisedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  // Don't invite someone who's already an active student of this studio.
  const existingStudentUser = await prisma.user.findUnique({
    where: { email: normalisedEmail },
    include: { student: true },
  })
  if (existingStudentUser?.student) {
    const existingMatch = await prisma.match.findUnique({
      where: { teacherId_studentId: { teacherId: teacher.id, studentId: existingStudentUser.student.id } },
    })
    if (existingMatch?.active) {
      return Response.json({ error: 'That person is already one of your students.' }, { status: 409 })
    }
  }

  // Reuse a still-valid pending invite (resend) rather than stacking duplicates.
  const now = new Date()
  let invite = await prisma.studentInvite.findFirst({
    where: { teacherId: teacher.id, email: normalisedEmail, status: 'pending', expiresAt: { gt: now } },
  })

  if (invite) {
    invite = await prisma.studentInvite.update({
      where: { id: invite.id },
      data: {
        firstName: firstName ?? invite.firstName,
        customRatePence: customRatePence ?? invite.customRatePence,
        note: note ?? invite.note,
        expiresAt: inviteExpiry(now),
      },
    })
  } else {
    invite = await prisma.studentInvite.create({
      data: {
        teacherId: teacher.id,
        email: normalisedEmail,
        firstName: firstName ?? null,
        customRatePence: customRatePence ?? null,
        note: note ?? null,
        token: generateInviteToken(),
        expiresAt: inviteExpiry(now),
      },
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  const acceptUrl = `${appUrl}/practice/join/${invite.token}`

  // Email failure shouldn't lose the invite — the teacher can copy the link from the roster.
  await sendClientInvite({
    to: normalisedEmail,
    firstName,
    practiceName: practiceDisplayName(teacher),
    acceptUrl,
    customRatePence,
    note,
  }).catch(e => console.error('[practice/students] invite email failed:', e))

  return Response.json({ inviteId: invite.id, acceptUrl }, { status: 201 })
}
