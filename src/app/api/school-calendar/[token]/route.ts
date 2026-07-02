import { prisma } from '@/lib/prisma'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { buildCalendarFeed, type FeedEvent } from '@/lib/ics'

// Public, token-gated ICS subscribe feed for one school calendar — the school
// analogue of /api/calendar/[token] (Teacher.calendarToken). Google/Outlook
// poll the URL; the token is an unguessable cuid, so no auth beyond it.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })

  const { token } = await params
  if (!token || token.length < 16) return new Response('Not found', { status: 404 })

  const calendar = await prisma.orgCalendar.findUnique({
    where: { icsToken: token },
    include: {
      organisation: { select: { name: true, active: true } },
      events: { orderBy: { startsAt: 'asc' } },
    },
  })
  if (!calendar || !calendar.organisation.active) return new Response('Not found', { status: 404 })

  const events: FeedEvent[] = calendar.events.map(e => ({
    sessionId: `org-cal-${e.id}`, // UID: session-org-cal-{id}@fair-do.com — stable per event
    start: e.startsAt,
    end: e.endsAt,
    allDay: e.allDay,
    summary: e.title,
    description: `${calendar.organisation.name} — ${calendar.name}`,
  }))

  const feed = buildCalendarFeed(events, { name: `${calendar.organisation.name} — ${calendar.name}` })

  return new Response(feed, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="school-calendar.ics"',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
