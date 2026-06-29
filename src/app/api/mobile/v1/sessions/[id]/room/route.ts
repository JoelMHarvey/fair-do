import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'
import { createMeetingToken } from '@/lib/daily'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const session = await prisma.session.findUnique({
    where: { id },
    select: {
      id: true,
      teacherId: true,
      studentId: true,
      scheduledAt: true,
      status: true,
      dailyRoomName: true,
      dailyRoomUrl: true,
      student: { select: { firstName: true, lastName: true } },
    },
  })

  if (!session || session.teacherId !== teacher.id) {
    return new Response('Not found', { status: 404 })
  }

  if (session.status === 'CANCELLED') {
    return Response.json({ error: 'Session cancelled' }, { status: 409 })
  }

  if (!session.dailyRoomName || !session.dailyRoomUrl) {
    return Response.json({ error: 'Video room not yet provisioned' }, { status: 503 })
  }

  // Enforce same 10-minute-before access window as the web app
  const now = new Date()
  const minutesUntil = (session.scheduledAt.getTime() - now.getTime()) / 60_000
  if (minutesUntil > 10) {
    return Response.json(
      { error: `Room opens ${Math.ceil(minutesUntil - 10)} minute(s) before the lesson` },
      { status: 403 },
    )
  }
  // Allow up to 2 hours after scheduled start
  if (minutesUntil < -120) {
    return Response.json({ error: 'Lesson has ended' }, { status: 410 })
  }

  const roleId = `teacher_${teacher.id}`
  const userName = `${teacher.firstName} ${teacher.lastName} (teacher)`
  const meetingToken = await createMeetingToken({
    roomName: session.dailyRoomName,
    userId: roleId,
    userName,
  })

  return Response.json({
    sessionId: session.id,
    roomUrl: session.dailyRoomUrl,
    meetingToken,
    studentFirstName: session.student.firstName,
    studentLastName: session.student.lastName,
    scheduledAt: session.scheduledAt.toISOString(),
  })
}
