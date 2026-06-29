import { prisma } from '@/lib/prisma'
import { getMobileTeacher } from '@/lib/mobile-auth'
import { daysUntil, expiryState } from '@/lib/credentials-expiry'

export const dynamic = 'force-dynamic'

type Alert = {
  type: string
  severity: 'warning' | 'critical'
  message: string
  daysUntil: number | null
}

type SessionSummary = {
  id: string
  studentFirstName: string
  studentLastName: string
  studentId: string
  scheduledAt: string
  durationMins: number
  status: string
  dailyRoomUrl: string | null
  isJoinable: boolean
}

function toSessionSummary(
  s: {
    id: string
    scheduledAt: Date
    durationMins: number
    status: string
    dailyRoomUrl: string | null
    student: { id: string; firstName: string; lastName: string }
  },
  now: Date,
): SessionSummary {
  const minutesUntil = (s.scheduledAt.getTime() - now.getTime()) / 60_000
  return {
    id: s.id,
    studentFirstName: s.student.firstName,
    studentLastName: s.student.lastName,
    studentId: s.student.id,
    scheduledAt: s.scheduledAt.toISOString(),
    durationMins: s.durationMins,
    status: s.status,
    dailyRoomUrl: s.dailyRoomUrl,
    // Joinable within 10 min before scheduled time until 2h after
    isJoinable: minutesUntil <= 10 && minutesUntil > -120,
  }
}

export async function GET() {
  const teacher = await getMobileTeacher()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    todaySessions,
    upcomingSessions,
    activeStudentCount,
    monthPayments,
    unreadMessageCount,
  ] = await Promise.all([
    // Today's sessions (all statuses so teacher sees cancellations too)
    prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        scheduledAt: { gte: startOfToday, lt: endOfToday },
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { scheduledAt: 'asc' },
    }),
    // Next 20 upcoming (after today)
    prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: endOfToday },
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    }),
    prisma.match.count({
      where: { teacherId: teacher.id, active: true },
    }),
    prisma.payment.findMany({
      where: {
        session: { teacherId: teacher.id },
        status: 'paid',
        createdAt: { gte: startOfMonth },
      },
      select: { teacherPayoutPence: true },
    }),
    // Messages in this teacher's threads where sender is not them and readAt is null
    prisma.message.count({
      where: {
        thread: { teacherId: teacher.id },
        senderClerkId: { not: teacher.user.clerkId },
        readAt: null,
      },
    }),
  ])

  const alerts: Alert[] = []

  const qualDays = daysUntil(teacher.qualificationExpiry, now)
  const qualState = expiryState(qualDays)
  if (qualState !== 'ok') {
    alerts.push({
      type: 'CREDENTIAL_EXPIRY',
      severity: qualState === 'expiring' ? 'warning' : 'critical',
      message:
        qualDays != null && qualDays <= 0
          ? `${teacher.qualificationBody} qualification expired`
          : `${teacher.qualificationBody} qualification expires in ${qualDays} day${qualDays === 1 ? '' : 's'}`,
      daysUntil: qualDays,
    })
  }

  if (!teacher.stripeOnboarded) {
    alerts.push({
      type: 'STRIPE_NOT_ONBOARDED',
      severity: 'warning',
      message: 'Payments not connected — complete Stripe setup to receive payouts',
      daysUntil: null,
    })
  }

  if (teacher.status === 'PENDING') {
    alerts.push({
      type: 'PROFILE_PENDING',
      severity: 'warning',
      message: 'Profile under review — credentials verification in progress',
      daysUntil: null,
    })
  }

  const monthTotalPence = monthPayments.reduce((s, p) => s + p.teacherPayoutPence, 0)

  return Response.json({
    teacher: {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      status: teacher.status,
      profileImageUrl: teacher.profileImageUrl,
      stripeOnboarded: teacher.stripeOnboarded,
      qualificationBody: teacher.qualificationBody,
      sessionRatePence: teacher.sessionRatePence,
    },
    todaySessions: todaySessions.map(s => toSessionSummary(s, now)),
    upcomingSessions: upcomingSessions.map(s => toSessionSummary(s, now)),
    earnings: {
      monthTotalPence,
      monthSessionCount: monthPayments.length,
    },
    activeStudentCount,
    unreadMessageCount,
    alerts,
  })
}
