import { prisma } from '@/lib/prisma'
import { getMobileTherapist } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const teacher = await getMobileTherapist()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const threads = await prisma.messageThread.findMany({
    where: { teacherId: teacher.id },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, body: true, senderClerkId: true, readAt: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const clerkId = teacher.user.clerkId

  // Batch unread counts in one query
  const threadIds = threads.map(t => t.id)
  const unreadCounts = await prisma.message.groupBy({
    by: ['threadId'],
    where: {
      threadId: { in: threadIds },
      senderClerkId: { not: clerkId },
      readAt: null,
    },
    _count: { id: true },
  })
  const unreadByThread: Record<string, number> = {}
  for (const row of unreadCounts) {
    unreadByThread[row.threadId] = row._count.id
  }

  return Response.json({
    threads: threads.map(t => {
      const last = t.messages[0] ?? null
      return {
        id: t.id,
        matchId: t.matchId,
        studentId: t.student.id,
        studentFirstName: t.student.firstName,
        studentLastName: t.student.lastName,
        updatedAt: t.updatedAt.toISOString(),
        unreadCount: unreadByThread[t.id] ?? 0,
        lastMessage: last
          ? {
              id: last.id,
              body: last.body,
              senderClerkId: last.senderClerkId,
              isFromTeacher: last.senderClerkId === clerkId,
              createdAt: last.createdAt.toISOString(),
            }
          : null,
      }
    }),
  })
}
