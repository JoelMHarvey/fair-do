import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const matches = await prisma.match.findMany({
    where: { teacherId: teacher.id, active: true },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          contactEmail: true,
        },
      },
      sessions: {
        where: { status: 'SCHEDULED', scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 1,
        select: { id: true, scheduledAt: true, status: true },
      },
      forms: {
        where: { status: 'pending' },
        select: { id: true },
      },
      messageThread: {
        select: { id: true },
      },
      _count: {
        select: { sessions: true },
      },
    },
    orderBy: { startedAt: 'desc' },
  })

  const clerkId = teacher.user.clerkId

  // Unread message counts per match, batched in one query
  const threadIds = matches
    .filter(m => m.messageThread != null)
    .map(m => m.messageThread!.id)

  const unreadByThread: Record<string, number> = {}
  if (threadIds.length > 0) {
    const unreadCounts = await prisma.message.groupBy({
      by: ['threadId'],
      where: {
        threadId: { in: threadIds },
        senderClerkId: { not: clerkId },
        readAt: null,
      },
      _count: { id: true },
    })
    for (const row of unreadCounts) {
      unreadByThread[row.threadId] = row._count.id
    }
  }

  const students = matches.map(m => ({
    matchId: m.id,
    studentId: m.student.id,
    firstName: m.student.firstName,
    lastName: m.student.lastName,
    contactEmail: m.student.contactEmail,
    customRatePence: m.customRatePence,
    source: m.source,
    startedAt: m.startedAt.toISOString(),
    nextSession: m.sessions[0]
      ? {
          id: m.sessions[0].id,
          scheduledAt: m.sessions[0].scheduledAt.toISOString(),
          status: m.sessions[0].status,
        }
      : null,
    totalSessions: m._count.sessions,
    pendingForms: m.forms.length,
    unreadMessages: m.messageThread != null ? (unreadByThread[m.messageThread.id] ?? 0) : 0,
  }))

  return Response.json({ students })
}
