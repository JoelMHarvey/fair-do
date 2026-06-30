import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'

const schema = z.object({ show: z.boolean() })

// Teacher opts in/out of showing their teaching credentials on the parent portal.
export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`credential-visibility:${userId}:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  await prisma.teacher.update({
    where: { id: user.teacher.id },
    data: { showCredentialToParents: parsed.data.show },
  })
  return Response.json({ ok: true }, { status: 200 })
}
