import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })

  const session = await prisma.session.findUnique({ where: { id } })
  if (!session) return new Response('Not found', { status: 404 })

  // Only the teacher on this session can mark it complete
  if (user?.teacher?.id !== session.teacherId) return new Response('Forbidden', { status: 403 })
  if (session.status !== 'SCHEDULED' && session.status !== 'IN_PROGRESS') {
    return new Response('Session not in completable state', { status: 422 })
  }

  await prisma.session.update({
    where: { id },
    data: { status: 'COMPLETED', endedAt: new Date() },
  })

  return Response.json({ status: 'COMPLETED' })
}
