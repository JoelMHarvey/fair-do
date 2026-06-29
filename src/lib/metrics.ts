import { prisma } from '@/lib/prisma'

export type TeacherRating = { average: number; count: number }

/** Average star rating + count for a teacher. */
export async function getTeacherRating(teacherId: string): Promise<TeacherRating> {
  const agg = await prisma.review.aggregate({
    where: { teacherId: teacherId },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return { average: Math.round((agg._avg.rating ?? 0) * 10) / 10, count: agg._count.rating }
}

export type RetentionStats = {
  totalSessions: number
  uniqueClients: number
  repeatClients: number
  repeatRate: number // 0–1
  isHighContinuity: boolean
}

/**
 * Repeat-student / retention score for a teacher.
 * repeatRate = students with >1 non-cancelled session ÷ students with any session.
 * High-continuity badge requires a meaningful base (>=3 students) so it can't be gamed by one loyal student.
 */
export async function getRetentionStats(teacherId: string): Promise<RetentionStats> {
  const sessions = await prisma.session.findMany({
    where: { teacherId: teacherId, status: { in: ['COMPLETED', 'SCHEDULED', 'IN_PROGRESS'] } },
    select: { studentId: true },
  })

  const counts = new Map<string, number>()
  for (const s of sessions) counts.set(s.studentId, (counts.get(s.studentId) ?? 0) + 1)

  const uniqueClients = counts.size
  const repeatClients = [...counts.values()].filter(c => c > 1).length
  const repeatRate = uniqueClients > 0 ? repeatClients / uniqueClients : 0

  return {
    totalSessions: sessions.length,
    uniqueClients,
    repeatClients,
    repeatRate,
    isHighContinuity: uniqueClients >= 3 && repeatRate >= 0.5,
  }
}
