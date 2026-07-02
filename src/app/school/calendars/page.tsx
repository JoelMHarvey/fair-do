import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import CalendarsClient from './CalendarsClient'

export const metadata = { title: 'Calendars — fair-do' }

// School calendars: term dates, holidays/INSET, exams and events. Holiday and
// INSET entries drive the booking warn/block policy; every calendar has a
// read-only ICS subscribe feed. Admin-only console page.
export default async function SchoolCalendarsPage() {
  const { org, role } = await getSchoolContext()
  if (role !== 'ADMIN') redirect('/school')

  const calendars = await prisma.orgCalendar.findMany({
    where: { organisationId: org.id },
    include: { events: { orderBy: { startsAt: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Calendars</h1>
        <p className="text-sm text-sand-500 mt-1">
          Term dates, holidays and school events. Mark days as <span className="font-medium">holiday</span> or{' '}
          <span className="font-medium">INSET</span> to warn or block lesson bookings on them (set the policy with your
          fair-do contact). Each calendar has a private ICS link for Google/Outlook.
        </p>
      </header>

      <CalendarsClient
        appUrl={appUrl}
        calendars={calendars.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icsToken: c.icsToken,
          events: c.events.map(e => ({
            id: e.id,
            title: e.title,
            kind: e.kind,
            startsAt: e.startsAt.toISOString(),
            endsAt: e.endsAt.toISOString(),
            allDay: e.allDay,
          })),
        }))}
      />
    </div>
  )
}
