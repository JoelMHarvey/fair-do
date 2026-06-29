import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { RESOURCES_ENABLED, MAX_RESOURCE_BYTES, RESOURCE_CATEGORIES } from '@/lib/resources'

const createSchema = z.object({
  matchId: z.string().min(1),
  label: z.string().trim().min(1).max(200),
  url: z.string().url().max(2000),
  category: z.enum(RESOURCE_CATEGORIES),
  fileName: z.string().max(300).optional(),
  fileSizeBytes: z.number().int().nonnegative().max(MAX_RESOURCE_BYTES).optional(),
})

// Resolve the caller to their role for this match. Returns which side they're on,
// or null if they don't own the match.
async function resolveAccess(clerkId: string, matchId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, include: { teacher: true, student: true } })
  if (!user) return null
  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { teacherId: true, studentId: true } })
  if (!match) return null
  if (user.teacher && user.teacher.id === match.teacherId) return { role: 'teacher' as const }
  if (user.student && user.student.id === match.studentId) return { role: 'student' as const }
  return null
}

export async function POST(req: Request) {
  if (!RESOURCES_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`resource:${userId}:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid file.' }, { status: 400 })

  const access = await resolveAccess(userId, parsed.data.matchId)
  if (!access) return new Response('Forbidden', { status: 403 })

  // Student uploads are always visible to the teacher and tagged as theirs.
  const doc = await prisma.studentDocument.create({
    data: {
      matchId: parsed.data.matchId,
      label: parsed.data.label,
      url: parsed.data.url,
      category: parsed.data.category,
      fileName: parsed.data.fileName ?? null,
      fileSizeBytes: parsed.data.fileSizeBytes ?? null,
      uploadedBy: access.role,
      studentVisible: true,
    },
  })
  return Response.json({ document: doc }, { status: 201 })
}

const patchSchema = z.object({ id: z.string().min(1), studentVisible: z.boolean() })

// Teacher toggles whether a resource is visible to the student.
export async function PATCH(req: Request) {
  if (!RESOURCES_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const doc = await prisma.studentDocument.findUnique({ where: { id: parsed.data.id }, select: { matchId: true } })
  if (!doc) return new Response('Not found', { status: 404 })
  const access = await resolveAccess(userId, doc.matchId)
  if (access?.role !== 'teacher') return new Response('Forbidden', { status: 403 })

  await prisma.studentDocument.update({ where: { id: parsed.data.id }, data: { studentVisible: parsed.data.studentVisible } })
  return Response.json({ ok: true }, { status: 200 })
}

const deleteSchema = z.object({ id: z.string().min(1) })

// The uploader (teacher or student) or the teacher can delete.
export async function DELETE(req: Request) {
  if (!RESOURCES_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const doc = await prisma.studentDocument.findUnique({ where: { id: parsed.data.id }, select: { matchId: true, uploadedBy: true } })
  if (!doc) return new Response('Not found', { status: 404 })
  const access = await resolveAccess(userId, doc.matchId)
  if (!access) return new Response('Forbidden', { status: 403 })
  if (access.role === 'student' && doc.uploadedBy !== 'student') return new Response('Forbidden', { status: 403 })

  await prisma.studentDocument.delete({ where: { id: parsed.data.id } })
  return Response.json({ ok: true }, { status: 200 })
}
