import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  sessionId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
  if (!user?.student) return new Response('Only students can review', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid review' }, { status: 400 })

  const session = await prisma.session.findUnique({ where: { id: parsed.data.sessionId } })
  if (!session) return new Response('Session not found', { status: 404 })
  if (session.studentId !== user.student.id) return new Response('Forbidden', { status: 403 })
  // Only review a session that has actually happened (its start time has passed) and wasn't cancelled.
  if (session.status === 'CANCELLED' || session.scheduledAt > new Date()) {
    return Response.json({ error: 'You can review after your lesson.' }, { status: 422 })
  }

  const existing = await prisma.review.findUnique({ where: { sessionId: session.id } })
  if (existing) return Response.json({ error: 'You\'ve already reviewed this lesson.' }, { status: 409 })

  await prisma.review.create({
    data: {
      sessionId: session.id,
      studentId: user.student.id,
      teacherId: session.teacherId,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
    },
  })

  return Response.json({ ok: true })
}
