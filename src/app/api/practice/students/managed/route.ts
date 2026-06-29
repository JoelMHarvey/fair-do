import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { z } from 'zod'

// Create a "managed" (accountless) student — a teacher runs them without a login.
const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  contactEmail: z.string().email().max(200).optional().or(z.literal('')),
  customRatePence: z.number().int().min(0).max(100000).optional(),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`practice-managed:${userId}:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  const { firstName, lastName, customRatePence } = parsed.data
  const contactEmail = parsed.data.contactEmail?.trim().toLowerCase() || null

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })
  const teacher = user.teacher

  // Accountless student + an active, teacher-owned relationship. The teacher
  // asserts they hold the student's consent to manage their data (controller).
  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      contactEmail,
      country: teacher.country,
      consentGiven: true,
      consentDate: new Date(),
    },
  })

  const match = await prisma.match.create({
    data: {
      teacherId: teacher.id,
      studentId: student.id,
      source: 'manual',
      customRatePence: customRatePence ?? null,
    },
  })

  return Response.json({ matchId: match.id, studentId: student.id }, { status: 201 })
}
