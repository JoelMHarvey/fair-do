import { prisma } from '@/lib/prisma'
import { getMobileTherapist } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const teacher = await getMobileTherapist()
  if (!teacher) return new Response('Unauthorized', { status: 401 })

  const { matchId } = await params

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          contactEmail: true,
          phone: true,
          dateOfBirth: true,
          consentGiven: true,
          consentDate: true,
          createdAt: true,
        },
      },
      sessions: {
        orderBy: { scheduledAt: 'desc' },
        take: 50,
        select: {
          id: true,
          scheduledAt: true,
          durationMins: true,
          status: true,
          dailyRoomUrl: true,
          payment: { select: { amountTotalPence: true, teacherPayoutPence: true, status: true } },
        },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, label: true, url: true, category: true, createdAt: true },
      },
      forms: {
        orderBy: { sentAt: 'desc' },
        select: { id: true, title: true, type: true, status: true, sentAt: true, completedAt: true },
      },
    },
  })

  if (!match || match.teacherId !== teacher.id) {
    return new Response('Not found', { status: 404 })
  }

  const now = new Date()
  const upcomingSessions = match.sessions
    .filter(s => new Date(s.scheduledAt) >= now && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  return Response.json({
    matchId: match.id,
    customRatePence: match.customRatePence,
    source: match.source,
    notes: match.notes,
    startedAt: match.startedAt.toISOString(),
    active: match.active,
    student: {
      id: match.student.id,
      firstName: match.student.firstName,
      lastName: match.student.lastName,
      contactEmail: match.student.contactEmail,
      phone: match.student.phone,
      dateOfBirth: match.student.dateOfBirth?.toISOString() ?? null,
      consentGiven: match.student.consentGiven,
      consentDate: match.student.consentDate?.toISOString() ?? null,
      createdAt: match.student.createdAt.toISOString(),
    },
    upcomingSessions: upcomingSessions.map(s => ({
      id: s.id,
      scheduledAt: s.scheduledAt.toISOString(),
      durationMins: s.durationMins,
      status: s.status,
      dailyRoomUrl: s.dailyRoomUrl,
    })),
    pastSessions: match.sessions
      .filter(s => new Date(s.scheduledAt) < now || s.status !== 'SCHEDULED')
      .map(s => ({
        id: s.id,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMins: s.durationMins,
        status: s.status,
        payment: s.payment
          ? {
              amountTotalPence: s.payment.amountTotalPence,
              teacherPayoutPence: s.payment.teacherPayoutPence,
              status: s.payment.status,
            }
          : null,
      })),
    documents: match.documents.map(d => ({
      id: d.id,
      label: d.label,
      url: d.url,
      category: d.category,
      createdAt: d.createdAt.toISOString(),
    })),
    forms: match.forms.map(f => ({
      id: f.id,
      title: f.title,
      type: f.type,
      status: f.status,
      sentAt: f.sentAt.toISOString(),
      completedAt: f.completedAt?.toISOString() ?? null,
    })),
  })
}
