import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { ParentMessages } from '@/components/ParentMessages'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

function fmtDate(d: Date) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// Plain-English attendance from the Daily-webhook fields already on Session.
function attendance(s: { scheduledAt: Date; callStartedAt: Date | null; callEndedAt: Date | null; status: string }) {
  if (s.status === 'CANCELLED') return 'Cancelled'
  if (s.status === 'NO_SHOW') return 'No-show'
  if (!s.callStartedAt) return s.status === 'COMPLETED' ? 'Completed' : '—'
  const lateMin = Math.round((new Date(s.callStartedAt).getTime() - new Date(s.scheduledAt).getTime()) / 60000)
  const ranMin = s.callEndedAt ? Math.round((new Date(s.callEndedAt).getTime() - new Date(s.callStartedAt).getTime()) / 60000) : null
  const start = lateMin > 2 ? `started ${lateMin} min late` : lateMin < -2 ? `started ${-lateMin} min early` : 'started on time'
  return ranMin != null ? `${start}, ran ${ranMin} min` : start
}

export default async function ParentDashboard() {
  if (!PARENT_PORTAL_ENABLED) redirect('/')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'PARENT') redirect('/')

  const links = await prisma.parentLink.findMany({
    where: { parentUserId: user.id, status: 'active' },
    include: { student: true, parentThread: { include: { messages: { orderBy: { createdAt: 'asc' } } } } },
    orderBy: { createdAt: 'asc' },
  })
  const active = links.filter(l => l.portalActive)
  if (active.length === 0) redirect('/parent/subscribe')

  // v1: show the first child's portal. Multi-child tabs are a follow-up.
  const link = active[0]
  const student = link.student
  const now = new Date()

  const [upcoming, past, payments] = await Promise.all([
    prisma.session.findMany({
      where: { studentId: student.id, status: 'SCHEDULED', scheduledAt: { gte: now } },
      include: { teacher: true },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    }),
    prisma.session.findMany({
      where: { studentId: student.id, OR: [{ scheduledAt: { lt: now } }, { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } }] },
      include: { teacher: true, lessonNote: true },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
    }),
    prisma.payment.findMany({
      where: { studentId: student.id, status: { in: ['paid', 'refunded', 'partially_refunded'] } },
      include: { session: { include: { teacher: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const messages = (link.parentThread?.messages ?? []).map(m => ({
    id: m.id, body: m.body, senderClerkId: m.senderClerkId, createdAt: m.createdAt.toISOString(),
  }))

  // Tutor's credentials — only if the tutor opted to show them.
  const tutor = await prisma.teacher.findUnique({
    where: { id: link.teacherId },
    select: { firstName: true, lastName: true, qualificationBody: true, credentialVerified: true, credentialDocUrl: true, showCredentialToParents: true },
  })
  const showTutorCred = tutor?.showCredentialToParents && !!tutor.qualificationBody

  const { parent_dashboard } = await getDictionary(await getLocaleFromHeaders())

  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/sign-out" className="text-sm text-sand-500 hover:text-brand-700">{parent_dashboard.sign_out}</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">{student.firstName}&rsquo;s {parent_dashboard.heading_lessons}</h1>
        <p className="text-sand-500 mb-8 text-sm">{parent_dashboard.subtitle}</p>

        {showTutorCred && tutor && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="text-xs text-sand-500 mb-1">{parent_dashboard.your_tutor}</p>
              <p className="font-medium text-sand-900">{tutor.firstName} {tutor.lastName}</p>
              <p className="text-sm text-sand-700 mt-1">
                {tutor.qualificationBody}
                {tutor.credentialVerified && <span className="text-brand-700"> · {parent_dashboard.verified} ✓</span>}
              </p>
              {tutor.credentialDocUrl && (
                <a href={tutor.credentialDocUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                  {parent_dashboard.view_certificate}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.upcoming_heading}</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-6 text-center text-sand-400 text-sm">{parent_dashboard.upcoming_empty}</div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-sand-200 p-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-sand-900">{s.teacher.firstName} {s.teacher.lastName}</p>
                    <p className="text-sm text-sand-500">{fmtDate(s.scheduledAt)}</p>
                  </div>
                  <span className="text-xs text-sand-400 self-center">{s.durationMins} min</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past + attendance */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.history_heading}</h2>
          {past.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-6 text-center text-sand-400 text-sm">{parent_dashboard.history_empty}</div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {past.map((s, i) => (
                <div key={s.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-sand-900">{fmtDate(s.scheduledAt)}</p>
                    <p className="text-sm text-sand-500">{s.teacher.firstName} {s.teacher.lastName}</p>
                  </div>
                  <p className="text-xs text-sand-400 mt-0.5">{attendance(s)}</p>
                  {s.lessonNote?.status === 'shared' && (
                    <div className="mt-2 rounded-xl bg-brand-50/60 border border-brand-100 px-3 py-2 text-sm text-sand-700">
                      <p className="text-xs font-medium text-brand-700 mb-1">{parent_dashboard.lesson_notes}</p>
                      <p>{s.lessonNote.topicsCovered}</p>
                      {s.lessonNote.difficulty && <p className="mt-1"><span className="text-sand-500">{parent_dashboard.found_tricky}</span> {s.lessonNote.difficulty}</p>}
                      {s.lessonNote.homework && <p className="mt-1"><span className="text-sand-500">{parent_dashboard.homework}</span> {s.lessonNote.homework}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.invoices_heading}</h2>
          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-6 text-center text-sand-400 text-sm">{parent_dashboard.invoices_empty}</div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {payments.map((p, i) => {
                const sym = p.currency === 'usd' ? '$' : '£'
                const refunded = p.status === 'refunded' || p.status === 'partially_refunded'
                return (
                  <div key={p.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-sand-900">
                        {p.session ? `${p.session.teacher.firstName} ${p.session.teacher.lastName}` : parent_dashboard.lesson_package}
                      </p>
                      <p className="text-xs text-sand-400 mt-0.5">
                        {p.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {sym}{(p.amountTotalPence / 100).toFixed(2)}
                        {refunded && <span className="text-red-500"> · refunded</span>}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-sand-700">{sym}{(p.amountTotalPence / 100).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Messages */}
        <section>
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.message_heading}</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-4">
            <ParentMessages parentLinkId={link.id} viewerClerkId={userId} initial={messages} />
          </div>
        </section>
      </div>
    </main>
  )
}
