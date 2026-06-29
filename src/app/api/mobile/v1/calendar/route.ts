import { prisma } from '@/lib/prisma'
import { getMobileTherapist } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const teacher = await getMobileTherapist()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')

  const now = new Date()
  // Default: today through 30 days out
  const from = fromStr ? new Date(fromStr) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const to = toStr
    ? new Date(toStr)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return Response.json({ error: 'Invalid from/to date' }, { status: 400 })
  }

  // Cap the window at 90 days to keep response sizes reasonable
  const maxMs = 90 * 24 * 60 * 60 * 1000
  const clampedTo = new Date(Math.min(to.getTime(), from.getTime() + maxMs))

  const sessions = await prisma.session.findMany({
    where: {
      teacherId: teacher.id,
      scheduledAt: { gte: from, lt: clampedTo },
      status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'] },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 500,
  })

  return Response.json({
    from: from.toISOString(),
    to: clampedTo.toISOString(),
    sessions: sessions.map(s => ({
      id: s.id,
      studentId: s.student.id,
      studentFirstName: s.student.firstName,
      studentLastName: s.student.lastName,
      matchId: s.matchId,
      scheduledAt: s.scheduledAt.toISOString(),
      durationMins: s.durationMins,
      status: s.status,
      dailyRoomUrl: s.dailyRoomUrl,
      isJoinable:
        (s.scheduledAt.getTime() - now.getTime()) / 60_000 <= 10 &&
        (s.scheduledAt.getTime() - now.getTime()) / 60_000 > -120,
    })),
  })
}
