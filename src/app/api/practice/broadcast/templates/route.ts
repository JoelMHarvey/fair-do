import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { hasPaidAccess } from '@/lib/access'
import { z } from 'zod'

// Saved message/invite templates — a Practice-plan convenience.
async function paidTherapist(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: { select: { tier: true, status: true } } } } },
  })
  const t = user?.teacher
  if (!t) return { teacher: null, isPaid: false }
  const isPaid = hasPaidAccess({ email: user!.email, subscription: t.subscription })
  return { teacher: t, isPaid }
}

export async function GET() {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const { teacher, isPaid } = await paidTherapist(userId)
  if (!teacher) return new Response('Not a teacher', { status: 403 })
  if (!isPaid) return Response.json({ templates: [] }, { status: 200 })

  const templates = await prisma.broadcastTemplate.findMany({
    where: { teacherId: teacher.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, subject: true, body: true, channel: true },
  })
  return Response.json({ templates }, { status: 200 })
}

const createSchema = z.object({
  name: z.string().min(1).max(80),
  subject: z.string().min(1).max(160),
  body: z.string().max(5000).default(''),
  channel: z.enum(['email', 'event']).default('email'),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const { teacher, isPaid } = await paidTherapist(userId)
  if (!teacher) return new Response('Not a teacher', { status: 403 })
  if (!isPaid) return Response.json({ error: 'Templates are on the Pro plan.' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid template' }, { status: 400 })

  const template = await prisma.broadcastTemplate.create({
    data: { teacherId: teacher.id, ...parsed.data },
    select: { id: true, name: true, subject: true, body: true, channel: true },
  })
  return Response.json({ template }, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const { teacher, isPaid } = await paidTherapist(userId)
  if (!teacher) return new Response('Not a teacher', { status: 403 })
  if (!isPaid) return Response.json({ error: 'Templates are on the Pro plan.' }, { status: 403 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  // Scope the delete to this teacher so one can't delete another's template.
  await prisma.broadcastTemplate.deleteMany({ where: { id, teacherId: teacher.id } })
  return new Response(null, { status: 204 })
}
