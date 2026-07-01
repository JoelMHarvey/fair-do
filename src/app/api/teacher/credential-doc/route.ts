import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'

// Teacher uploads (or removes) a credential document/image. Stored on
// Teacher.credentialDocUrl; shown to parents only when showCredentialToParents is on.
// url null clears it. Must be an https Cloudinary URL.
const schema = z.object({
  url: z.string().url().max(2000).refine(u => /^https:\/\//i.test(u), 'Must be an https link').nullable(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rl = await checkRateLimit(`credential-doc:${userId}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  await prisma.teacher.update({ where: { id: user.teacher.id }, data: { credentialDocUrl: parsed.data.url } })
  return Response.json({ ok: true }, { status: 200 })
}
