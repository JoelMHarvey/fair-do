import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { refundSessionPayment } from '@/lib/refund'
import { refundPercentForCancellation } from '@/lib/cancellation'
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
  const cancelledBy: 'student' | 'teacher' = isStudent ? 'student' : 'teacher'
  // Per the teacher's configurable policy (P2-6): full refund if cancelled in time
  // or by the teacher; otherwise the teacher's late-cancellation percentage.
  const percent = refundPercentForCancellation({
    hoursUntil,
    windowHours: session.teacher.cancellationWindowHours,
    lateRefundPercent: session.teacher.lateCancelRefundPercent,
    cancelledBy,
  })

  await prisma.session.update({
    where: { id },
    // Null slotKey so the slot frees up for re-booking (unique guard ignores nulls).
    data: { status: 'CANCELLED', slotKey: null },
  })

  let refunded = false
  if (percent > 0) {
    const refundPence = session.payment ? Math.round((session.payment.amountTotalPence * percent) / 100) : 0
    refunded = await refundSessionPayment(session.payment, session.studentId, session.student.organisationId, refundPence)
  }

  sendCancellationNotice({
    clientEmail: clientEmail(session.student) ?? '',
    clientFirstName: session.student.firstName,
    teacherEmail: session.teacher.user.email,
    teacherFirstName: session.teacher.firstName,
    teacherLastName: session.teacher.lastName,
    scheduledAt: session.scheduledAt,
    cancelledBy,
    refunded,
  }).catch(e => console.error('[cancel] email failed:', e))

  return Response.json({ status: 'CANCELLED', refunded })
}
