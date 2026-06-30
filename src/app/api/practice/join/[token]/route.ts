import { auth, clerkClient } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ensureReferralCode } from '@/lib/referral'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { token } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-join:${userId}:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const invite = await prisma.studentInvite.findUnique({
    where: { token },
    include: { teacher: true },
  })
  if (!invite) return Response.json({ error: 'This invite link is not valid.' }, { status: 404 })
  if (invite.status !== 'pending' || invite.expiresAt < new Date()) {
    return Response.json({ error: 'This invite has expired or already been used.' }, { status: 410 })
  }

  // Ensure the User row exists (the Clerk webhook may not have fired yet).
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true, teacher: true },
  })
  if (!user) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    await prisma.user.create({ data: { clerkId: userId, email, role: 'STUDENT' } })
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true, teacher: true },
    })
  }
  if (!user) return new Response('User not found', { status: 404 })

  // Can't accept an invite you sent yourself.
  if (user.teacher?.id === invite.teacherId) {
    return Response.json({ error: 'You can\'t accept your own invite.' }, { status: 400 })
  }

  // Find or create the student profile for this user.
  let student = user.student
  if (!student) {
    const firstName = (parsed.data.firstName ?? invite.firstName ?? '').trim()
    const lastName = (parsed.data.lastName ?? '').trim()
    if (!firstName || !lastName) {
      return Response.json({ error: 'name_required' }, { status: 422 })
    }
    student = await prisma.student.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        country: user.country,
        consentGiven: true,
        consentDate: new Date(),
      },
    })
    await ensureReferralCode(student.id, firstName).catch(() => {})
  }

  // Link the relationship: per-student rate + source=invite. Reactivate if a prior match exists.
  const existing = await prisma.match.findUnique({
    where: { teacherId_studentId: { teacherId: invite.teacherId, studentId: student.id } },
  })
  if (existing) {
    await prisma.match.update({
      where: { id: existing.id },
      data: {
        active: true,
        endedAt: null,
        customRatePence: invite.customRatePence ?? existing.customRatePence,
        invitedAt: existing.invitedAt ?? invite.createdAt,
      },
    })
  } else {
    await prisma.match.create({
      data: {
        teacherId: invite.teacherId,
        studentId: student.id,
        source: 'invite',
        customRatePence: invite.customRatePence,
        invitedAt: invite.createdAt,
      },
    })
  }

  await prisma.studentInvite.update({
    where: { id: invite.id },
    data: { status: 'accepted', acceptedStudentId: student.id, acceptedAt: new Date() },
  })

  return Response.json({ redirect: '/dashboard' }, { status: 200 })
}
