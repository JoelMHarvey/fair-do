import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TherapistNav } from '@/components/TherapistNav'
import { PageHeader, EmptyState } from '@/components/Guidance'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'

export const metadata = { title: 'Calendar — fair-do', robots: { index: false, follow: false } }

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: 'bg-brand-50 text-brand-700',
  IN_PROGRESS: 'bg-brand-100 text-brand-800',
}
const ACTIVE = { in: ['SCHEDULED', 'IN_PROGRESS'] as ('SCHEDULED' | 'IN_PROGRESS')[] }

function dayLabel(d: Date, today: Date): string {
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diff = Math.round((startOf(d).getTime() - startOf(today).getTime()) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}
const hhmm = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export default async function TherapistCalendar({ searchParams }: { searchParams: Promise<{ view?: string; m?: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/onboarding')
  const teacherId = user.teacher.id

  const { view, m } = await searchParams
  const isMonth = view === 'month'
  const now = new Date()

  const Toggle = (
    <div className="flex gap-1 p-1 bg-sand-100 rounded-full w-fit mb-6 text-sm">
      <Link href="/therapist/calendar" className={`px-4 py-1.5 rounded-full font-medium ${!isMonth ? 'bg-white text-brand-800 shadow-sm' : 'text-sand-500'}`}>Agenda</Link>
      <Link href="/therapist/calendar?view=month" className={`px-4 py-1.5 rounded-full font-medium ${isMonth ? 'bg-white text-brand-800 shadow-sm' : 'text-sand-500'}`}>Month</Link>
    </div>
  )

  // ── MONTH GRID ──
  if (isMonth) {
    const base = m && /^\d{4}-\d{2}$/.test(m) ? new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStart = new Date(base.getFullYear(), base.getMonth(), 1)
    const monthEnd = new Date(base.getFullYear(), base.getMonth() + 1, 1)
    const prev = ym(new Date(base.getFullYear(), base.getMonth() - 1, 1))
    const next = ym(new Date(base.getFullYear(), base.getMonth() + 1, 1))

    const sessions = await prisma.session.findMany({
      where: { teacherId, scheduledAt: { gte: monthStart, lt: monthEnd }, status: ACTIVE },
      include: { student: true }, orderBy: { scheduledAt: 'asc' }, take: 400,
    })
    const byDay = new Map<number, typeof sessions>()
    for (const s of sessions) { const k = s.scheduledAt.getDate(); (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(s) }

    const lead = (monthStart.getDay() + 6) % 7 // Mon-first leading blanks
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
    const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    while (cells.length % 7 !== 0) cells.push(null)
    const isToday = (day: number) => now.getFullYear() === base.getFullYear() && now.getMonth() === base.getMonth() && now.getDate() === day

    return (
      <main className="min-h-screen bg-sand-50">
        <TherapistNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <PageHeader title="Calendar" subtitle="Your appointments, month by month." />
          {Toggle}
          <div className="flex items-center justify-between mb-3">
            <Link href={`/therapist/calendar?view=month&m=${prev}`} className="text-sm text-sand-500 hover:text-brand-700">← {new Date(base.getFullYear(), base.getMonth() - 1, 1).toLocaleDateString('en-GB', { month: 'short' })}</Link>
            <h2 className="font-display text-lg font-semibold text-brand-900">{base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
            <Link href={`/therapist/calendar?view=month&m=${next}`} className="text-sm text-sand-500 hover:text-brand-700">{new Date(base.getFullYear(), base.getMonth() + 1, 1).toLocaleDateString('en-GB', { month: 'short' })} →</Link>
          </div>
          <div className="grid grid-cols-7 gap-px bg-sand-200 rounded-2xl overflow-hidden border border-sand-200 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="bg-sand-100 text-[11px] font-semibold text-sand-500 py-1.5">{d}</div>
            ))}
            {cells.map((day, i) => {
              const items = day ? (byDay.get(day) ?? []) : []
              return (
                <div key={i} className={`bg-white min-h-[68px] sm:min-h-[88px] p-1 text-left align-top ${day && isToday(day) ? 'ring-1 ring-inset ring-brand-300' : ''}`}>
                  {day && (
                    <>
                      <div className={`text-[11px] mb-0.5 ${isToday(day) ? 'font-bold text-brand-700' : 'text-sand-400'}`}>{day}</div>
                      <div className="space-y-0.5">
                        {items.slice(0, 3).map(s => (
                          <Link key={s.id} href={`/session/${s.id}`} className="block truncate text-[10px] sm:text-[11px] bg-brand-50 text-brand-700 rounded px-1 py-0.5 hover:bg-brand-100">
                            {hhmm(s.scheduledAt)} {s.student.firstName}
                          </Link>
                        ))}
                        {items.length > 3 && <div className="text-[10px] text-sand-400 px-1">+{items.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  // ── AGENDA (default) ──
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessions = await prisma.session.findMany({
    where: { teacherId, scheduledAt: { gte: startOfToday }, status: ACTIVE },
    include: { student: true }, orderBy: { scheduledAt: 'asc' }, take: 200,
  })
  const groups: { label: string; items: typeof sessions }[] = []
  for (const s of sessions) {
    const label = dayLabel(s.scheduledAt, now)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(s)
    else groups.push({ label, items: [s] })
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <TherapistNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader title="Calendar" subtitle="Your upcoming appointments. Sync them to your phone’s calendar from the dashboard." />
        {Toggle}
        {sessions.length === 0 ? (
          <EmptyState icon="📅" title="No upcoming appointments" body="When you book lessons they will appear here, day by day. Add a student and schedule one to get started." cta={{ href: '/therapist/clients', label: 'Go to students' }} />
        ) : (
          <div className="space-y-7">
            {groups.map(g => (
              <section key={g.label}>
                <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-2">{g.label}</h2>
                <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
                  {g.items.map((s, i) => {
                    const live = s.scheduledAt <= new Date(now.getTime() + 10 * 60_000) && s.scheduledAt >= new Date(now.getTime() - 70 * 60_000)
                    return (
                      <div key={s.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                        <div className="w-16 shrink-0 text-center">
                          <p className="font-display text-lg font-semibold text-brand-900 leading-none">{hhmm(s.scheduledAt)}</p>
                          <p className="text-[11px] text-sand-400 mt-1">{s.durationMins} min</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/therapist/clients/${s.matchId}`} className="text-sm font-medium text-sand-900 hover:text-brand-700 truncate block">{s.student.firstName} {s.student.lastName}</Link>
                          <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[s.status] ?? 'bg-sand-100 text-sand-600'}`}>{s.status.replace('_', ' ').toLowerCase()}</span>
                        </div>
                        <Link href={`/session/${s.id}`} className={`text-sm font-medium shrink-0 ${live ? 'text-white bg-brand-600 px-4 py-2 rounded-full hover:bg-brand-700' : 'text-brand-600 hover:text-brand-700'}`}>{live ? 'Join' : 'Open →'}</Link>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
