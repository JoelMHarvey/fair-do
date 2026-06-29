import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED, teacherCanOfferParentPortal, generateParentToken } from '@/lib/parent'
import { sendParentInvite } from '@/lib/email'

const schema = z.object({
  matchId: z.string().min(1),
  parentEmail: z.string().email(),
})

export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`parent-invite:${userId}:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Enter a valid email.' }, { status: 400 })
  const { matchId, parentEmail } = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  if (!(await teacherCanOfferParentPortal(teacher.id))) {
    return Response.json({ error: 'The parent portal is a Pro/School feature. Upgrade your plan to offer it.' }, { status: 403 })
  }

  // The match must belong to this teacher.
  const match = await prisma.match.findFirst({
    where: { id: matchId, teacherId: teacher.id },
    include: { student: true },
  })
  if (!match) return new Response('Not found', { status: 404 })

  // One pending/active link per (student, inviteEmail) — don't spam duplicate invites.
  const existing = await prisma.parentLink.findFirst({
    where: { studentId: match.studentId, inviteEmail: parentEmail.toLowerCase(), status: { in: ['pending', 'active'] } },
  })
  if (existing) {
    return Response.json({ error: 'That parent already has an invite for this student.' }, { status: 409 })
  }

  const token = generateParentToken()
  await prisma.parentLink.create({
    data: {
      studentId: match.studentId,
      teacherId: teacher.id,
      inviteEmail: parentEmail.toLowerCase(),
      token,
      status: 'pending',
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  try {
    await sendParentInvite({
      to: parentEmail,
      studentFirstName: match.student.firstName,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      acceptUrl: `${appUrl}/parent/accept/${token}`,
    })
  } catch (e) {
    console.error('[parent/invite] email failed:', e instanceof Error ? e.message : e)
    // Link is created; surface a soft warning so the teacher can resend.
    return Response.json({ ok: true, emailed: false }, { status: 201 })
  }

  return Response.json({ ok: true, emailed: true }, { status: 201 })
}
