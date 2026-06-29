import { prisma } from '@/lib/prisma'
import { getMobileTherapist } from '@/lib/mobile-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const teacher = await getMobileTherapist()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const windows = await prisma.availability.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    select: { id: true, dayOfWeek: true, startTime: true, endTime: true, timezone: true },
  })

  return Response.json({ availability: windows, timezone: windows[0]?.timezone ?? 'Europe/London' })
}

const windowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1).max(80).optional(),
})

const putSchema = z.object({
  windows: z.array(windowSchema).max(28),
})

// Full replace: caller sends the complete desired set of windows.
export async function PUT(req: Request) {
  const teacher = await getMobileTherapist()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const tz = parsed.data.windows[0]?.timezone ?? 'Europe/London'

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { teacherId: teacher.id } }),
    prisma.availability.createMany({
      data: parsed.data.windows.map(w => ({
        teacherId: teacher.id,
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime: w.endTime,
        timezone: w.timezone ?? tz,
      })),
    }),
  ])

  return Response.json({ ok: true })
}
