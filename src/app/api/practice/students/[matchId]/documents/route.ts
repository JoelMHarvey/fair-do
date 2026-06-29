import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { z } from 'zod'

const CATEGORIES = ['session-notes', 'assessment', 'formulation', 'treatment-plan', 'risk', 'outcomes', 'other'] as const

const addSchema = z.object({
  label: z.string().min(1).max(120),
  url: z.string().url().max(2000).refine(u => /^https?:\/\//i.test(u), 'Must be a http(s) link'),
  category: z.enum(CATEGORIES),
})

async function ownedMatch(matchId: string, clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, include: { teacher: true } })
  if (!user?.teacher) return null
  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { teacherId: true } })
  if (!match || match.teacherId !== user.teacher.id) return null
  return match
}

export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { matchId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = addSchema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  if (!(await ownedMatch(matchId, userId))) return new Response('Not found', { status: 404 })

  const doc = await prisma.studentDocument.create({
    data: { matchId, label: parsed.data.label, url: parsed.data.url, category: parsed.data.category },
  })
  return Response.json({ ok: true, document: doc }, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { matchId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const id = z.string().min(1).safeParse((await req.json())?.id)
  if (!id.success) return Response.json({ error: 'Invalid' }, { status: 400 })
  if (!(await ownedMatch(matchId, userId))) return new Response('Not found', { status: 404 })

  await prisma.studentDocument.deleteMany({ where: { id: id.data, matchId } })
  return Response.json({ ok: true }, { status: 200 })
}
