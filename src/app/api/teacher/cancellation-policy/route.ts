import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  windowHours: z.number().refine(v => [24, 48, 72].includes(v), 'Invalid window'),
  lateRefundPercent: z.number().refine(v => [0, 50, 100].includes(v), 'Invalid percentage'),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid policy.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  await prisma.teacher.update({
    where: { id: user.teacher.id },
    data: {
      cancellationWindowHours: parsed.data.windowHours,
      lateCancelRefundPercent: parsed.data.lateRefundPercent,
    },
  })

  return Response.json({ ok: true }, { status: 200 })
}
