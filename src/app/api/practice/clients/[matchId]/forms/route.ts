import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { TEMPLATE_BY_KEY } from '@/lib/forms'
import { z } from 'zod'

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

  const key = z.string().safeParse((await req.json())?.templateKey)
  const tpl = key.success ? TEMPLATE_BY_KEY[key.data] : null
  if (!tpl) return Response.json({ error: 'Unknown form' }, { status: 400 })
  if (!(await ownedMatch(matchId, userId))) return new Response('Not found', { status: 404 })

  const form = await prisma.studentForm.create({
    data: { matchId, title: tpl.title, type: tpl.type, fields: tpl.fields, token: randomBytes(18).toString('base64url') },
  })
  return Response.json({ ok: true, form: { id: form.id, title: form.title, status: form.status, token: form.token, sentAt: form.sentAt } }, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { matchId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const id = z.string().min(1).safeParse((await req.json())?.id)
  if (!id.success) return Response.json({ error: 'Invalid' }, { status: 400 })
  if (!(await ownedMatch(matchId, userId))) return new Response('Not found', { status: 404 })

  await prisma.studentForm.deleteMany({ where: { id: id.data, matchId } })
  return Response.json({ ok: true }, { status: 200 })
}
