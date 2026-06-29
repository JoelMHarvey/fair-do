import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { sendPushToClerkId } from '@/lib/push'
import { z } from 'zod'

const schema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(4000),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`msg:${userId}:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid data', { status: 400 })

  const { threadId, body: messageBody } = parsed.data

  // Verify sender belongs to this thread
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      teacher: { include: { user: true } },
      student: { include: { user: true } },
    },
  })

  if (!thread) return new Response('Thread not found', { status: 404 })

  const isParticipant =
    thread.teacher.user.clerkId === userId ||
    thread.student.user?.clerkId === userId

  if (!isParticipant) return new Response('Forbidden', { status: 403 })

  const message = await prisma.message.create({
    data: {
      threadId,
      senderClerkId: userId,
      body: messageBody,
    },
  })

  // Notify the OTHER participant (if they've turned on push). Non-blocking.
  const senderIsTeacher = thread.teacher.user.clerkId === userId
  const recipientClerkId = senderIsTeacher ? thread.student.user?.clerkId : thread.teacher.user.clerkId
  const senderName = senderIsTeacher ? thread.teacher.firstName : thread.student.firstName
  if (recipientClerkId) {
    sendPushToClerkId(recipientClerkId, {
      title: `New message from ${senderName}`,
      body: messageBody.length > 80 ? `${messageBody.slice(0, 80)}…` : messageBody,
      url: `/messages/${thread.matchId}`,
    }).catch(e => console.error('[messages] push failed:', e))
  }

  return Response.json({
    id: message.id,
    body: message.body,
    senderClerkId: message.senderClerkId,
    createdAt: message.createdAt.toISOString(),
  }, { status: 201 })
}
