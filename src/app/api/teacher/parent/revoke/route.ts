import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'

const schema = z.object({ parentLinkId: z.string().min(1) })

// Teacher disconnects a parent from a student. Sets the link revoked + inactive and
// clears parentUserId so the same parent can be re-invited later without tripping the
// @@unique([parentUserId, studentId]) constraint. The parent's Stripe subscription is
// untouched (they may still have other children); this only removes THIS link.
export async function POST(req: Request) {
  if (!PARENT_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rl = await checkRateLimit(`parent-revoke:${userId}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  // Must own the link.
  const link = await prisma.parentLink.findFirst({
    where: { id: parsed.data.parentLinkId, teacherId: user.teacher.id },
  })
  if (!link) return new Response('Not found', { status: 404 })

  await prisma.parentLink.update({
    where: { id: link.id },
    data: { status: 'revoked', portalActive: false, parentUserId: null },
  })

  return Response.json({ ok: true }, { status: 200 })
}
