import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

const schema = z.object({ parentLinkId: z.string().min(1), body: z.string().trim().min(1).max(4000) })

// Shared parent↔teacher thread. Either party may post: the parent (parentUserId) or
// the inviting teacher (teacherId). The student never sees this thread.
export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`parent-msg:${userId}:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Message can’t be empty.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user) return new Response('Forbidden', { status: 403 })

  const link = await prisma.parentLink.findFirst({
    where: { id: parsed.data.parentLinkId, status: 'active' },
    include: { parentThread: true },
  })
  if (!link) return new Response('Not found', { status: 404 })

  const isParent = link.parentUserId === user.id
  const isTeacher = !!user.teacher && user.teacher.id === link.teacherId
  if (!isParent && !isTeacher) return new Response('Forbidden', { status: 403 })

  // Ensure the thread exists (created on accept, but be defensive).
  const thread = link.parentThread
    ?? (await prisma.parentMessageThread.create({ data: { parentLinkId: link.id, teacherId: link.teacherId } }))

  const message = await prisma.parentMessage.create({
    data: { threadId: thread.id, senderClerkId: userId, body: parsed.data.body },
  })
  await prisma.parentMessageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } })

  return Response.json({ id: message.id, body: message.body, createdAt: message.createdAt }, { status: 201 })
}
