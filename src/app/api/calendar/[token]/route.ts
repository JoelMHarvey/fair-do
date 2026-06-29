import { prisma } from '@/lib/prisma'
import { buildCalendarFeed, type FeedEvent } from '@/lib/ics'

// Public, token-gated ICS subscribe feed: all of a teacher's sessions, live.
// Subscribe to this URL in Google/Apple/Outlook — it polls hourly and auto-updates.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!token || token.length < 16) return new Response('Not found', { status: 404 })

  const teacher = await prisma.teacher.findUnique({ where: { calendarToken: token } })
  if (!teacher) return new Response('Not found', { status: 404 })

  // Recent + all future sessions (cancelled ones included so they drop off the calendar).
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sessions = await prisma.session.findMany({
    where: { teacherId: teacher.id, scheduledAt: { gte: since } },
    include: { student: true },
    orderBy: { scheduledAt: 'asc' },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
  const events: FeedEvent[] = sessions.map(s => ({
    sessionId: s.id,
    start: s.scheduledAt,
    durationMins: s.durationMins,
    summary: `Lesson — ${s.student.firstName} ${s.student.lastName}`.trim(),
    description: `fair-do lesson. Open: ${appUrl}/session/${s.id}`,
    url: `${appUrl}/session/${s.id}`,
    status: s.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
  }))

  const feed = buildCalendarFeed(events, { name: `fair-do — ${teacher.firstName}'s lessons` })

  return new Response(feed, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="fair-do.ics"',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
