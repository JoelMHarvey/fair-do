import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { setInboxAgentLevel, INBOX_AGENT_LEVELS, type InboxAgentLevel } from '@/lib/settings'
import { isAdminUser } from '@/lib/admin'
import { z } from 'zod'

const schema = z.object({ level: z.enum(['off', 'draft', 'ack', 'assist']) })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user)) return new Response('Forbidden', { status: 403 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return new Response('Invalid level', { status: 400 })

  const level = parsed.data.level as InboxAgentLevel
  if (!INBOX_AGENT_LEVELS.includes(level)) return new Response('Invalid level', { status: 400 })

  await setInboxAgentLevel(level, userId)
  return Response.json({ level })
}
