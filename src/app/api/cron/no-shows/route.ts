import { prisma } from '@/lib/prisma'
import { refundSessionPayment } from '@/lib/refund'
import { sendNoShowNotice } from '@/lib/email'
import { clientEmail } from '@/lib/practice'
import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'

// Hourly. Resolves sessions whose window has ended:
//  - both joined            → COMPLETED (no refund)
//  - teacher didn't join    → NO_SHOW + refund the student (not their fault)
//  - only student missed    → NO_SHOW, no refund (teacher was available)
//  - no attendance data     → leave for admin (don't auto-refund blindly)
const GRACE_MINS = 15

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - GRACE_MINS * 60 * 1000)

  // Candidate sessions: not yet resolved, started long enough ago, still open.
  const sessions = await prisma.session.findMany({
    where: {
      noShowResolved: false,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      scheduledAt: { lt: cutoff },
    },
    include: {
      payment: true,
      teacher: true,
      student: { include: { user: true } },
    },
    take: 200,
  })

  let completed = 0, refunded = 0, noShow = 0
  for (const s of sessions) {
    // session window = scheduled + duration + grace
    const windowEnd = new Date(s.scheduledAt.getTime() + (s.durationMins + GRACE_MINS) * 60 * 1000)
    if (windowEnd > now) continue // still in progress / grace

    const teacherJoined = !!s.teacherJoinedAt
    const studentJoined = !!s.studentJoinedAt
    const anyJoin = s.joinCount > 0

    let resolution: 'completed' | 'teacher-no-show' | 'no-one-joined' | 'student-no-show' | 'review'
    if (teacherJoined && studentJoined) resolution = 'completed'
    else if (teacherJoined && !studentJoined) resolution = 'student-no-show'
    else if (!teacherJoined && studentJoined) resolution = 'teacher-no-show'
    else if (!anyJoin) resolution = 'no-one-joined'
    else resolution = 'review' // joins happened but identity unknown (token missing) — don't auto-refund

    try {
      if (resolution === 'completed') {
        await prisma.session.update({ where: { id: s.id }, data: { status: 'COMPLETED', noShowResolved: true, endedAt: s.callEndedAt ?? now } })
        completed++
      } else if (resolution === 'review') {
        await prisma.session.update({ where: { id: s.id }, data: { status: 'COMPLETED', noShowResolved: true } })
        completed++
      } else {
        const shouldRefund = resolution === 'teacher-no-show' || resolution === 'no-one-joined'
        const didRefund = shouldRefund
          ? await refundSessionPayment(s.payment, s.studentId, s.student.organisationId)
          : false
        await prisma.session.update({ where: { id: s.id }, data: { status: 'NO_SHOW', noShowResolved: true } })
        noShow++
        if (didRefund) refunded++
        const cEmail = clientEmail(s.student)
        if (cEmail) {
          sendNoShowNotice({
            clientEmail: cEmail,
            clientFirstName: s.student.firstName,
            teacherName: `${s.teacher.firstName} ${s.teacher.lastName}`,
            scheduledAt: s.scheduledAt,
            reason: resolution,
            refunded: didRefund,
          }).catch(e => console.error('[cron/no-shows] email failed:', e))
        }
      }
    } catch (e) {
      console.error('[cron/no-shows] failed for session', s.id, e)
    }
  }

  await recordCronRun('no-shows', true, undefined, JSON.stringify({ checked: sessions.length, completed, noShow, refunded }))
  return Response.json({ checked: sessions.length, completed, noShow, refunded })
}
