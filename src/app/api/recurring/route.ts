import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { effectiveRatePence } from '@/lib/practice'
import { RECURRING_ENABLED, teacherCanRecur, nextOccurrence, isValidStartTime } from '@/lib/recurring'

async function teacherForMatch(clerkId: string, matchId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, include: { teacher: true } })
  if (!user?.teacher) return null
  const match = await prisma.match.findFirst({
    where: { id: matchId, teacherId: user.teacher.id },
    select: { id: true, customRatePence: true, studentId: true },
  })
  if (!match) return null
  return { teacher: user.teacher, match }
}

const createSchema = z.object({
  matchId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().refine(isValidStartTime, 'Invalid time'),
  durationMins: z.number().int().min(15).max(240).optional(),
})

export async function POST(req: Request) {
  if (!RECURRING_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Pick a day and time.' }, { status: 400 })

  const ctx = await teacherForMatch(userId, parsed.data.matchId)
  if (!ctx) return new Response('Forbidden', { status: 403 })
  if (!(await teacherCanRecur(ctx.teacher.id))) {
    return Response.json({ error: 'Recurring lessons are a Pro/Studio feature.' }, { status: 403 })
  }

  const ratePence = effectiveRatePence(ctx.match, ctx.teacher)
  const nextScheduledAt = nextOccurrence(parsed.data.dayOfWeek, parsed.data.startTime, new Date(), ctx.teacher.timezone)

  const booking = await prisma.recurringBooking.create({
    data: {
      matchId: ctx.match.id,
      teacherId: ctx.teacher.id,
      studentId: ctx.match.studentId,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      durationMins: parsed.data.durationMins ?? 60,
      ratePence,
      nextScheduledAt,
    },
  })
  return Response.json({ booking }, { status: 201 })
}

const patchSchema = z.object({ id: z.string().min(1), active: z.boolean() })

export async function PATCH(req: Request) {
  if (!RECURRING_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const existing = await prisma.recurringBooking.findUnique({ where: { id: parsed.data.id }, select: { matchId: true, dayOfWeek: true, startTime: true } })
  if (!existing) return new Response('Not found', { status: 404 })
  const ctx = await teacherForMatch(userId, existing.matchId)
  if (!ctx) return new Response('Forbidden', { status: 403 })

  // Resuming recomputes the next slot so it never tries to charge for a missed week.
  await prisma.recurringBooking.update({
    where: { id: parsed.data.id },
    data: {
      active: parsed.data.active,
      ...(parsed.data.active ? { nextScheduledAt: nextOccurrence(existing.dayOfWeek, existing.startTime, new Date(), ctx.teacher.timezone) } : {}),
    },
  })
  return Response.json({ ok: true }, { status: 200 })
}

const deleteSchema = z.object({ id: z.string().min(1) })

export async function DELETE(req: Request) {
  if (!RECURRING_ENABLED) return new Response('Not found', { status: 404 })
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const existing = await prisma.recurringBooking.findUnique({ where: { id: parsed.data.id }, select: { matchId: true } })
  if (!existing) return new Response('Not found', { status: 404 })
  const ctx = await teacherForMatch(userId, existing.matchId)
  if (!ctx) return new Response('Forbidden', { status: 403 })

  await prisma.recurringBooking.delete({ where: { id: parsed.data.id } })
  return Response.json({ ok: true }, { status: 200 })
}
