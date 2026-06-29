import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AI_NOTES_ENABLED } from '@/lib/lesson-notes'

const schema = z.object({
  sessionId: z.string().min(1),
  action: z.enum(['save', 'share']),
  topicsCovered: z.string().trim().min(1).max(4000),
  difficulty: z.string().trim().max(4000).optional(),
  homework: z.string().trim().max(4000).optional(),
})

// Teacher reviews/edits an AI-drafted lesson note and shares it with the student
// (and parent, if linked). Editing writes the structured fields directly.
export async function POST(req: Request) {
  if (!AI_NOTES_ENABLED) return new Response('Not found', { status: 404 })

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Notes can’t be empty.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  const note = await prisma.lessonNote.findFirst({
    where: { sessionId: parsed.data.sessionId, teacherId: user.teacher.id },
  })
  if (!note) return new Response('Not found', { status: 404 })

  const share = parsed.data.action === 'share'
  const updated = await prisma.lessonNote.update({
    where: { id: note.id },
    data: {
      topicsCovered: parsed.data.topicsCovered,
      difficulty: parsed.data.difficulty?.trim() || null,
      homework: parsed.data.homework?.trim() || null,
      ...(share ? { status: 'shared', sharedAt: new Date() } : note.status === 'draft' ? { status: 'approved' } : {}),
    },
  })

  return Response.json({ ok: true, status: updated.status }, { status: 200 })
}
