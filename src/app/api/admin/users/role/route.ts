import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().min(1),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me)) return new Response('Forbidden', { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const { userId: targetId, role } = parsed.data

  // Can't change your own role — guards against an admin accidentally locking
  // themselves out (the email allowlist is the deeper failsafe).
  if (me!.id === targetId) {
    return Response.json({ error: 'You can’t change your own role.' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 })

  await prisma.user.update({ where: { id: targetId }, data: { role } })
  console.log(`[admin] ${me!.email} set ${target.email} role: ${target.role} → ${role}`)

  return Response.json({ ok: true })
}
