import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const { threadId } = await params
  const clerkId = teacher.user.clerkId

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 100,
        select: {
          id: true,
          body: true,
          fileUrl: true,
          senderClerkId: true,
          readAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!thread || thread.teacherId !== teacher.id) {
    return new Response('Not found', { status: 404 })
  }

  // Mark unread student messages as read
  const unreadIds = thread.messages
    .filter(m => m.senderClerkId !== clerkId && m.readAt === null)
    .map(m => m.id)

  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    }).catch(() => {})
  }

  return Response.json({
    id: thread.id,
    matchId: thread.matchId,
    student: {
      id: thread.student.id,
      firstName: thread.student.firstName,
      lastName: thread.student.lastName,
    },
    currentClerkId: clerkId,
    messages: thread.messages.map(m => ({
      id: m.id,
      body: m.body,
      fileUrl: m.fileUrl,
      senderClerkId: m.senderClerkId,
      isFromTeacher: m.senderClerkId === clerkId,
      createdAt: m.createdAt.toISOString(),
    })),
  })
}
