import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { toE164 } from '@/lib/sms'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const schema = z.object({
  // null clears the override (falls back to the teacher's standard rate)
  customRatePence: z.number().int().min(0).max(100000).nullable().optional(),
  notes: z.string().max(20000).nullable().optional(),
  // '' or null clears the stored mobile; any value is normalised to E.164.
  phone: z.string().max(30).nullable().optional(),
  // Goal setting (shown on the parent dashboard). null clears.
  targetGrade: z.string().max(20).nullable().optional(),
  examBoard: z.string().max(40).nullable().optional(),
  examDate: z.string().max(40).nullable().optional(), // ISO/date string, parsed below
})

export async function PATCH(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const { matchId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { teacherId: true, studentId: true } })
  if (!match || match.teacherId !== user.teacher.id) return new Response('Not found', { status: 404 })

  const data: Prisma.MatchUpdateInput = {}
  if (parsed.data.customRatePence !== undefined) data.customRatePence = parsed.data.customRatePence
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes
  if (parsed.data.targetGrade !== undefined) data.targetGrade = parsed.data.targetGrade
  if (parsed.data.examBoard !== undefined) data.examBoard = parsed.data.examBoard
  if (parsed.data.examDate !== undefined) data.examDate = parsed.data.examDate ? new Date(parsed.data.examDate) : null
  if (Object.keys(data).length) await prisma.match.update({ where: { id: matchId }, data })

  // Phone lives on the Student, not the Match. Empty string clears it.
  if (parsed.data.phone !== undefined) {
    const p = parsed.data.phone ? toE164(parsed.data.phone) : null
    await prisma.student.update({ where: { id: match.studentId }, data: { phone: p } })
  }

  return Response.json({ ok: true }, { status: 200 })
}
