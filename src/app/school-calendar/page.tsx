import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTenant } from '@/lib/tenant'

export const metadata = { title: 'School calendar' }

const DAY_MS = 86_400_000

// endsAt is stored exclusive for all-day spans — render the inclusive range.
function spanLabel(e: { startsAt: Date; endsAt: Date; allDay: boolean }): string {
  const day = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
  if (!e.allDay) {
    const t = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    return `${day(e.startsAt)}, ${t(e.startsAt)}–${t(e.endsAt)}`
  }
  const lastDay = new Date(e.endsAt.getTime() - DAY_MS)
  return lastDay.getTime() <= e.startsAt.getTime() ? day(e.startsAt) : `${day(e.startsAt)} – ${day(lastDay)}`
}

const KIND_LABELS: Record<string, string> = { term: 'Term', holiday: 'Holiday', inset: 'INSET', exam: 'Exams', event: 'Event' }

// Public tenant portal page (route whitelisted in the proxy): the school's
// calendars merged into a month-by-month list for the next 12 months. Server
// rendered — no client calendar library.
export default async function SchoolCalendarPage() {
  const tenant = await getTenant()
  if (!tenant) notFound()

  const calendars = await prisma.orgCalendar.findMany({
    where: { organisationId: tenant.id },
    orderBy: { name: 'asc' },
  })

  const now = new Date()
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 12, 1))

  const events = calendars.length
    ? await prisma.orgCalendarEvent.findMany({
        where: {
          calendarId: { in: calendars.map(c => c.id) },
          startsAt: { lt: windowEnd },
          endsAt: { gte: windowStart },
        },
        orderBy: { startsAt: 'asc' },
      })
    : []

  const calendarById = new Map(calendars.map(c => [c.id, c]))

  // Group by the month the event starts in (ongoing events surface in their start month).
  const months = new Map<string, typeof events>()
  for (const e of events) {
    const key = `${e.startsAt.getUTCFullYear()}-${String(e.startsAt.getUTCMonth()).padStart(2, '0')}`
    const list = months.get(key)
    if (list) list.push(e)
    else months.set(key, [e])
  }
  const monthKeys = [...months.keys()].sort()

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-sand-900">{tenant.name} — school calendar</h1>
        <p className="text-sm text-sand-500 mt-2">Term dates, holidays and school events for the year ahead.</p>
        {calendars.length > 1 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
            {calendars.map(c => (
              <span key={c.id} className="inline-flex items-center gap-1.5 text-xs text-sand-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color ?? '#4f46e5' }} />
                {c.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {monthKeys.length === 0 ? (
        <p className="text-sand-400 text-sm">No calendar events published yet — check back soon.</p>
      ) : (
        <div className="space-y-8">
          {monthKeys.map(key => {
            const list = months.get(key)!
            const [y, m] = key.split('-').map(Number)
            const label = new Date(Date.UTC(y, m, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
            return (
              <section key={key}>
                <h2 className="font-display text-lg text-sand-900 mb-3">{label}</h2>
                <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-100">
                  {list.map(e => {
                    const cal = calendarById.get(e.calendarId)
                    return (
                      <div key={e.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cal?.color ?? '#4f46e5' }}
                          title={cal?.name}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="text-sm text-sand-800">{e.title}</span>
                          {e.kind !== 'event' && (
                            <span className="text-[11px] text-sand-400 ml-2 uppercase tracking-wide">{KIND_LABELS[e.kind] ?? e.kind}</span>
                          )}
                        </span>
                        <span className="text-xs text-sand-500 shrink-0">{spanLabel(e)}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {calendars.length > 0 && (
        <footer className="mt-10 border-t border-sand-200 pt-6">
          <h2 className="text-sm font-medium text-sand-700 mb-2">Subscribe in your own calendar</h2>
          <ul className="space-y-1">
            {calendars.map(c => (
              <li key={c.id} className="text-xs text-sand-500">
                <a href={`/api/school-calendar/${c.icsToken}`} className="text-brand-700 hover:text-brand-800 underline underline-offset-4">
                  {c.name} (.ics)
                </a>
                <span className="ml-2">— add by URL in Google or Outlook and it stays up to date.</span>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </main>
  )
}
