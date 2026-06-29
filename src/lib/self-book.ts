import { prisma } from '@/lib/prisma'
import { createRoom } from '@/lib/daily'
import { sendSessionScheduledByTherapist } from '@/lib/email'
import { sendPushToClerkId } from '@/lib/push'
import { practiceDisplayName, generateInviteToken } from '@/lib/practice'
import { activeSlotKey } from '@/lib/slots'
import { toE164 } from '@/lib/sms'

type FinalizeTherapist = {
  id: string
  firstName: string
  lastName: string
  practiceName: string | null
  sessionRatePence: number
  user: { clerkId: string }
}

export type FinalizeInput = {
  teacher: FinalizeTherapist
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  scheduledAt: Date
  note?: string | null
}

// Commit a (verified) self-booking: find-or-create the managed student + match,
// create the SCHEDULED session + video room, and notify student + teacher.
// Caller must have already validated the teacher, slot window, and clash.
export async function finalizeSelfBooking(input: FinalizeInput): Promise<{ sessionId: string; matchId: string }> {
  const { teacher, firstName, lastName, scheduledAt, note } = input
  const lcEmail = input.email.toLowerCase()
  const e164 = toE164(input.phone)

  let match = await prisma.match.findFirst({
    where: {
      teacherId: teacher.id,
      student: { OR: [{ contactEmail: { equals: lcEmail, mode: 'insensitive' } }, { user: { email: { equals: lcEmail, mode: 'insensitive' } } }] },
    },
    include: { student: true },
  })
  if (!match) {
    const student = await prisma.student.create({
      data: { firstName, lastName, contactEmail: lcEmail, phone: e164, consentGiven: false },
    })
    match = await prisma.match.create({
      data: { teacherId: teacher.id, studentId: student.id, source: 'self-book' },
      include: { student: true },
    })
  } else if (e164 && !match.student.phone) {
    await prisma.student.update({ where: { id: match.studentId }, data: { phone: e164 } })
  }

  // Guest token lets an account-less self-booked student reach their video room
  // via the signed link in their email (the room itself stays private/no-knock).
  const guestToken = generateInviteToken()
  const session = await prisma.session.create({
    data: { matchId: match.id, teacherId: teacher.id, studentId: match.studentId, scheduledAt, durationMins: 50, status: 'SCHEDULED', guestToken, slotKey: activeSlotKey(teacher.id, scheduledAt) },
  })

  try {
    const room = await createRoom(session.id, scheduledAt, 2)
    await prisma.session.update({ where: { id: session.id }, data: { dailyRoomName: room.name, dailyRoomUrl: room.url } })
  } catch (e) { console.error('[self-book] room failed:', e) }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  sendSessionScheduledByTherapist({
    clientEmail: lcEmail, clientFirstName: firstName,
    teacherFirstName: teacher.firstName, teacherLastName: teacher.lastName,
    practiceName: practiceDisplayName(teacher), scheduledAt,
    ratePence: teacher.sessionRatePence, sessionUrl: `${appUrl}/session/${session.id}?k=${guestToken}`,
  }).catch(e => console.error('[self-book] email failed:', e))

  sendPushToClerkId(teacher.user.clerkId, {
    title: 'New booking',
    body: `${firstName} ${lastName} booked ${scheduledAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}${note ? ` — "${note.slice(0, 60)}"` : ''}`,
    url: `/teacher/students/${match.id}`,
  }).catch(() => {})

  return { sessionId: session.id, matchId: match.id }
}

// True unless explicitly disabled — double opt-in is the secure default.
export function selfBookRequiresConfirm(): boolean {
  return process.env.SELFBOOK_REQUIRE_CONFIRM !== 'false'
}
