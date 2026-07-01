import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

// GDPR erasure (Art. 17) by PSEUDONYMISATION + RETENTION.
//
// We do not hard-delete, because: (a) financial rows (Payment, Subscription,
// ParentSubscription) are under tax/accounting retention; (b) Complaint /
// CredentialCheck are safeguarding records (Art. 17(3)(b) legal-obligation
// exemption); (c) Session/Message/Match/LessonNote are SHARED with a counterparty
// whose data we must not destroy. Instead we scrub every PII field the leaving
// user contributed, and keep the rows with the subject's identity anonymised.
//
// Implementation is almost entirely UPDATEs, so there is no FK-delete ordering to
// get wrong. Purely-personal, no-retention rows (devices, push, pending bookings,
// invites) are deleted outright.

const REDACTED = '[deleted]'
const ANON_NAME_FIRST = 'Deleted'

function anonEmail(userId: string) {
  return `deleted+${userId}@anon.invalid`
}

export type EraseResult = { userId: string; role: string; scrubbed: string[] }

// Erase the user identified by their Clerk id. Idempotent: a second run finds an
// already-anonymised row (or none) and no-ops safely.
export async function eraseUserByClerkId(clerkId: string): Promise<EraseResult | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { teacher: true, student: true },
  })
  if (!user) return null

  const scrubbed: string[] = []
  const tx: Prisma.PrismaPromise<unknown>[] = []

  // ── Free text the user AUTHORED in shared threads (keep the thread + counterparty)
  tx.push(
    prisma.message.updateMany({
      where: { senderClerkId: clerkId },
      data: { body: REDACTED, fileUrl: null, senderClerkId: 'deleted' },
    }),
    prisma.parentMessage.updateMany({
      where: { senderClerkId: clerkId },
      data: { body: REDACTED, senderClerkId: 'deleted' },
    }),
  )

  // ── Safeguarding / audit: retain the record, scrub the actor identity
  tx.push(
    prisma.complaint.updateMany({ where: { reporterClerkId: clerkId }, data: { reporterClerkId: 'deleted' } }),
    prisma.credentialCheck.updateMany({ where: { checkedByClerkId: clerkId }, data: { checkedByClerkId: 'deleted' } }),
    prisma.setting.updateMany({ where: { updatedBy: clerkId }, data: { updatedBy: 'deleted' } }),
    prisma.inboxMessage.updateMany({ where: { handledBy: clerkId }, data: { handledBy: 'deleted' } }),
  )

  // ── Devices / push: purely personal, no retention value → delete
  tx.push(
    prisma.pushSubscription.deleteMany({ where: { clerkId } }),
    prisma.nativeDevice.deleteMany({ where: { clerkId } }),
  )

  // ── Support inbox correspondence + gift vouchers keyed by the user's email
  tx.push(
    prisma.inboxMessage.updateMany({
      where: { fromEmail: user.email },
      data: { fromEmail: anonEmail(user.id), bodyPreview: REDACTED, draftReply: null },
    }),
    prisma.giftVoucher.updateMany({ where: { purchaserEmail: user.email }, data: { purchaserEmail: anonEmail(user.id), message: null } }),
    prisma.giftVoucher.updateMany({ where: { recipientEmail: user.email }, data: { recipientEmail: anonEmail(user.id) } }),
    prisma.pendingSelfBooking.deleteMany({ where: { email: user.email } }),
  )

  if (user.student) {
    const s = user.student.id
    scrubbed.push('student')
    const sessions = await prisma.session.findMany({ where: { studentId: s }, select: { id: true } })
    const sessionIds = sessions.map(r => r.id)
    const matches = await prisma.match.findMany({ where: { studentId: s }, select: { id: true } })
    const matchIds = matches.map(r => r.id)

    tx.push(
      // The student's own voice/content
      prisma.lessonTranscript.deleteMany({ where: { sessionId: { in: sessionIds } } }),
      // Teacher's private notes about this student
      prisma.match.updateMany({ where: { studentId: s }, data: { notes: null } }),
      // Shared lesson notes: scrub the free text but keep the row for the teacher
      prisma.lessonNote.updateMany({ where: { studentId: s }, data: { topicsCovered: REDACTED, difficulty: null, homework: null, teacherEdit: null } }),
      // Forms + documents are the student's personal data
      prisma.studentForm.deleteMany({ where: { matchId: { in: matchIds } } }),
      prisma.studentDocument.deleteMany({ where: { matchId: { in: matchIds } } }),
      prisma.review.updateMany({ where: { studentId: s }, data: { comment: null } }),
      // Pseudonymise the identity row — keep id so Payment/Session FKs stay valid
      prisma.student.update({
        where: { id: s },
        data: {
          firstName: ANON_NAME_FIRST, lastName: 'Student', contactEmail: null, phone: null,
          dateOfBirth: null, usState: null, questionnaire: Prisma.JsonNull, referralCode: null, referredByCode: null,
        },
      }),
    )
  }

  if (user.teacher) {
    const t = user.teacher.id
    scrubbed.push('teacher')
    tx.push(
      // Teacher-authored free text in shared records
      prisma.lessonNote.updateMany({ where: { teacherId: t }, data: { teacherEdit: null } }),
      prisma.match.updateMany({ where: { teacherId: t }, data: { notes: null } }),
      prisma.broadcast.deleteMany({ where: { teacherId: t } }),
      prisma.broadcastTemplate.deleteMany({ where: { teacherId: t } }),
      prisma.studentInvite.deleteMany({ where: { teacherId: t } }),
      prisma.availability.deleteMany({ where: { teacherId: t } }),
      // Pseudonymise the profile — keep id (sessions, payouts, complaints reference it)
      prisma.teacher.update({
        where: { id: t },
        data: {
          firstName: ANON_NAME_FIRST, lastName: 'Teacher', phone: null, professionalTitle: null,
          bio: '', tagline: null, practiceName: null, practiceSlug: null, calendarToken: null,
          profileImageUrl: null, photoBaseUrl: null, credentialDocUrl: null, qualificationRef: null,
          dbsNumber: null, websiteUrl: null, linkedinUrl: null, introVideoUrl: null,
          brandEnabled: false, brandLogoUrl: null, brandFooterLine: null, replyToEmail: null,
          referralCode: null, referredByCode: null, availableForNew: false,
        },
      }),
    )
  }

  // ── Parent links the user owns: revoke access + scrub identity, keep thread for teacher
  tx.push(
    prisma.parentLink.updateMany({
      where: { parentUserId: user.id },
      data: { inviteEmail: anonEmail(user.id), status: 'revoked', portalActive: false },
    }),
  )

  // ── The identity row itself. clerkId is @unique; free it without collisions.
  tx.push(
    prisma.user.update({
      where: { id: user.id },
      data: { email: anonEmail(user.id), clerkId: `deleted_${user.id}`, locale: null },
    }),
  )

  await prisma.$transaction(tx)
  return { userId: user.id, role: user.role, scrubbed }
}
