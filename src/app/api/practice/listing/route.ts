import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { z } from 'zod'

// Toggle whether the teacher is listed in the fair-do directory (accepting new students).
const schema = z.object({ availableForNew: z.boolean() })

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  await prisma.teacher.update({
    where: { id: user.teacher.id },
    data: { availableForNew: parsed.data.availableForNew },
  })

  return Response.json({ ok: true, availableForNew: parsed.data.availableForNew }, { status: 200 })
}
