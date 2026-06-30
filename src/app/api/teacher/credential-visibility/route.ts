import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({ show: z.boolean() })

// Teacher opts in/out of showing their teaching credentials on the parent portal.
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

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
