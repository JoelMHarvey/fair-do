import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { refundSessionPayment } from '@/lib/refund'
import { sendCancellationNotice } from '@/lib/email'
import { clientEmail } from '@/lib/practice'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true, teacher: true },
  })

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      payment: true,
      student: { include: { user: true } },
      teacher: { include: { user: true } },
    },
  })
  if (!session) return new Response('Not found', { status: 404 })

  const isStudent = user?.student?.id === session.studentId
  const isTeacher = user?.teacher?.id === session.teacherId
  if (!isStudent && !isTeacher) return new Response('Forbidden', { status: 403 })

  if (session.status !== 'SCHEDULED') {
    return new Response('Cannot cancel this session', { status: 422 })
  }

  const hoursUntil = (new Date(session.scheduledAt).getTime() - Date.now()) / 3_600_000
  const cancelledBy = isStudent ? 'student' : 'teacher'
  // Full refund if >24h ahead, OR whenever the teacher cancels (never penalise the student for that).
  const eligibleForRefund = hoursUntil >= 24 || cancelledBy === 'teacher'

  await prisma.session.update({
    where: { id },
    // Null slotKey so the slot frees up for re-booking (unique guard ignores nulls).
    data: { status: 'CANCELLED', slotKey: null },
  })

  let refunded = false
  if (eligibleForRefund) {
    refunded = await refundSessionPayment(session.payment, session.studentId, session.student.organisationId)
  }

  sendCancellationNotice({
    clientEmail: clientEmail(session.student) ?? '',
    clientFirstName: session.student.firstName,
    therapistEmail: session.teacher.user.email,
    therapistFirstName: session.teacher.firstName,
    therapistLastName: session.teacher.lastName,
    scheduledAt: session.scheduledAt,
    cancelledBy,
    refunded,
  }).catch(e => console.error('[cancel] email failed:', e))

  return Response.json({ status: 'CANCELLED', refunded })
}
