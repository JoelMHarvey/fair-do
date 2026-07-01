import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ParentNav } from '@/components/ParentNav'
import { ParentMessages } from '@/components/ParentMessages'
import { BuyPackageButton } from '@/components/BuyPackageButton'
import { ParentProgressChart } from '@/components/ParentProgressChart'
import { PARENT_PORTAL_ENABLED, groupLinksByChild } from '@/lib/parent'
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

export default async function ParentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>
}) {
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

  // Group active links by child (student). One child may be linked to several
  // tutors, so each child owns one or more links (each with its own thread).
  const children = groupLinksByChild(active)

  // Selected child from the URL, falling back to the first.
  const { child: childParam } = await searchParams
  const selected = children.find(c => c.student.id === childParam) ?? children[0]
  const student = selected.student
  const now = new Date()

  const [upcoming, past, payments, tutors] = await Promise.all([
    prisma.session.findMany({
      where: { studentId: student.id, status: 'SCHEDULED', scheduledAt: { gte: now } },
      include: { teacher: true },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    }),
    prisma.session.findMany({
      where: { studentId: student.id, OR: [{ scheduledAt: { lt: now } }, { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } }] },
      include: { teacher: true, lessonNote: true, transcript: true },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
    }),
    prisma.payment.findMany({
      where: { studentId: student.id, status: { in: ['paid', 'refunded', 'partially_refunded'] } },
      include: { session: { include: { teacher: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    // Tutors for this child's links — only those that opted to show credentials.
    prisma.teacher.findMany({
      where: { id: { in: selected.links.map(l => l.teacherId) } },
      select: { id: true, firstName: true, lastName: true, qualificationBody: true, credentialVerified: true, credentialDocUrl: true, showCredentialToParents: true },
    }),
  ])

  const visibleTutors = tutors.filter(t => t.showCredentialToParents && !!t.qualificationBody)

  // Goal (target grade / exam board / date) — from the child's first linked tutor.
  const goal = await prisma.match.findFirst({
    where: { teacherId: selected.links[0].teacherId, studentId: student.id },
    select: { targetGrade: true, examBoard: true, examDate: true },
  })

  // Lesson packages the child's tutors have offered for parent purchase.
  const packages = await prisma.package.findMany({
    where: { studentId: student.id, teacherId: { in: selected.links.map(l => l.teacherId) }, buyableByParent: true, status: 'active' },
    include: { teacher: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const transcriptsOn = process.env.DAILY_TRANSCRIPTION_ENABLED === 'true'

  // Monthly completed-session rollup (last 6 months) for the progress chart.
  const progressMonths: { key: string; month: string; sessions: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    progressMonths.push({ key: d.toISOString().slice(0, 7), month: d.toLocaleDateString('en-GB', { month: 'short' }), sessions: 0 })
  }
  for (const s of past) {
    if (s.status === 'COMPLETED' || s.callStartedAt) {
      const bucket = progressMonths.find(mo => mo.key === new Date(s.scheduledAt).toISOString().slice(0, 7))
      if (bucket) bucket.sessions++
    }
  }
  const progressData = progressMonths.map(({ month, sessions }) => ({ month, sessions }))

  const { parent_dashboard } = await getDictionary(await getLocaleFromHeaders())

  return (
    <main className="min-h-screen bg-sand-50">
      <ParentNav signOutLabel={parent_dashboard.sign_out} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Child tabs — only when the parent has more than one child linked. */}
        {children.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label={parent_dashboard.children_tablist}>
            {children.map(c => {
              const isActive = c.student.id === student.id
              return (
                <Link
                  key={c.student.id}
                  href={`/parent/dashboard?child=${c.student.id}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-white text-sand-700 border-sand-200 hover:border-brand-300'
                  }`}
                >
                  {c.student.firstName}
                </Link>
              )
            })}
          </div>
        )}

        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">{student.firstName}&rsquo;s {parent_dashboard.heading_lessons}</h1>
        <p className="text-sand-500 mb-8 text-sm">{parent_dashboard.subtitle}</p>

        {visibleTutors.length > 0 && (
          <section className="mb-8 space-y-3">
            {visibleTutors.map(tutor => (
              <div key={tutor.id} className="bg-white rounded-2xl border border-sand-200 p-5">
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
            ))}
          </section>
        )}

        {goal?.targetGrade && (
          <div className="bg-brand-50 rounded-xl border border-brand-100 px-4 py-3 mb-8 text-sm">
            <span className="font-medium text-brand-800">{parent_dashboard.goal_label}</span>{' '}
            {goal.examBoard && `${goal.examBoard} `}{goal.targetGrade}
            {goal.examDate && ` · ${parent_dashboard.goal_exam} ${fmtDate(goal.examDate)}`}
          </div>
        )}

        {/* Progress */}
        <section id="progress" className="mb-8 scroll-mt-20">
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.progress_heading}</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <ParentProgressChart data={progressData} emptyLabel={parent_dashboard.progress_empty} />
          </div>
        </section>

        {/* Upcoming */}
        <section id="lessons" className="mb-8 scroll-mt-20">
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
                      {transcriptsOn && s.transcript && (
                        <details className="mt-2">
                          <summary className="text-xs text-brand-700 cursor-pointer">{parent_dashboard.view_transcript}</summary>
                          <pre className="text-xs text-sand-600 mt-1 whitespace-pre-wrap font-sans">{s.transcript.plainText}</pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Packages the tutor has offered */}
        {packages.length > 0 && (
          <section id="packages" className="mb-8 scroll-mt-20">
            <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.packages_heading}</h2>
            <div className="space-y-3">
              {packages.map(p => {
                const sym = student.country === 'US' ? '$' : '£'
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-sand-200 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-sand-900">{p.name}</p>
                      {p.description && <p className="text-xs text-sand-500 mt-0.5">{p.description}</p>}
                      <p className="text-xs text-sand-400 mt-0.5">
                        {p.sessionsTotal} {parent_dashboard.packages_sessions} · {p.teacher.firstName} {p.teacher.lastName} · {sym}{(p.pricePence / 100).toFixed(2)}
                      </p>
                    </div>
                    {p.paidAt
                      ? <span className="text-xs text-brand-700 font-medium shrink-0">{parent_dashboard.packages_purchased}</span>
                      : <BuyPackageButton packageId={p.id} label={parent_dashboard.packages_buy} />}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Invoices */}
        <section id="invoices" className="mb-8 scroll-mt-20">
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

        {/* Messages — one thread per tutor linked to this child. */}
        <section id="messages" className="scroll-mt-20">
          <h2 className="font-medium text-sand-900 mb-3">{parent_dashboard.message_heading}</h2>
          <div className="space-y-4">
            {selected.links.map(l => {
              const messages = (l.parentThread?.messages ?? []).map(m => ({
                id: m.id, body: m.body, mine: m.senderClerkId === userId, createdAt: m.createdAt.toISOString(),
              }))
              const tutor = tutors.find(t => t.id === l.teacherId)
              return (
                <div key={l.id} className="bg-white rounded-2xl border border-sand-200 p-4">
                  {selected.links.length > 1 && tutor && (
                    <p className="text-xs text-sand-500 mb-2">{tutor.firstName} {tutor.lastName}</p>
                  )}
                  <ParentMessages parentLinkId={l.id} initial={messages} />
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
