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

const rowSchema = z.object({
  email: z.string().email().max(200),
  firstName: z.string().max(100).optional(),
  customRatePence: z.number().int().min(0).max(100000).optional(),
})
const schema = z.object({ rows: z.array(z.unknown()).max(200) })

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-import:${userId}:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  // Validate + dedupe input rows (first occurrence of each email wins).
  let invalid = 0
  const seen = new Set<string>()
  const rows: { email: string; firstName?: string; customRatePence?: number }[] = []
  for (const raw of parsed.data.rows) {
    const r = rowSchema.safeParse(raw)
    if (!r.success) { invalid++; continue }
    const email = r.data.email.toLowerCase().trim()
    if (seen.has(email)) continue
    seen.add(email)
    rows.push({ email, firstName: r.data.firstName, customRatePence: r.data.customRatePence })
  }
  if (rows.length === 0) {
    return Response.json({ created: 0, alreadyStudents: 0, alreadyInvited: 0, invalid }, { status: 200 })
  }

  const emails = rows.map(r => r.email)
  const now = new Date()

  // Batch dedup against existing pending invites + existing active students of this studio.
  const [existingInvites, existingUsers] = await Promise.all([
    prisma.studentInvite.findMany({
      where: { teacherId: teacher.id, email: { in: emails }, status: 'pending', expiresAt: { gt: now } },
      select: { email: true },
    }),
    prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, student: { select: { matches: { where: { teacherId: teacher.id, active: true }, select: { id: true } } } } },
    }),
  ])
  const invitedSet = new Set(existingInvites.map(e => e.email.toLowerCase()))
  const studentSet = new Set(
    existingUsers.filter(u => (u.student?.matches?.length ?? 0) > 0).map(u => u.email.toLowerCase()),
  )

  let alreadyInvited = 0
  let alreadyStudents = 0
  const expiresAt = inviteExpiry(now)
  const toCreate = rows.flatMap(r => {
    if (studentSet.has(r.email)) { alreadyStudents++; return [] }
    if (invitedSet.has(r.email)) { alreadyInvited++; return [] }
    return [{
      teacherId: teacher.id,
      email: r.email,
      firstName: r.firstName ?? null,
      customRatePence: r.customRatePence ?? null,
      token: generateInviteToken(),
      expiresAt,
    }]
  })

  if (toCreate.length > 0) {
    await prisma.studentInvite.createMany({ data: toCreate })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faresay.com'
  const practiceName = practiceDisplayName(teacher)
  // Fire invite emails in parallel — failures don't fail the import (links live on the roster).
  await Promise.allSettled(
    toCreate.map(d => sendClientInvite({
      to: d.email,
      firstName: d.firstName,
      practiceName,
      acceptUrl: `${appUrl}/practice/join/${d.token}`,
      customRatePence: d.customRatePence,
    })),
  )

  return Response.json(
    { created: toCreate.length, alreadyStudents, alreadyInvited, invalid },
    { status: 201 },
  )
}
