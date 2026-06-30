import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ensureReferralCode, REFERRAL_REWARD_PENCE } from '@/lib/referral'
import { AI_NOTES_ENABLED } from '@/lib/lesson-notes'
import { RESOURCES_ENABLED } from '@/lib/resources'
import { ResourceLibrary } from '@/components/ResourceLibrary'
import { RECURRING_ENABLED } from '@/lib/recurring'
import { RecurringCardPrompt } from '@/components/RecurringCardPrompt'
import ReferralCard from './ReferralCard'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export default async function Dashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true, teacher: true },
  })

  if (!user) redirect('/onboarding')
  if (user.role === 'ADMIN') redirect('/admin')
  if (user.role === 'TEACHER') redirect('/teacher/dashboard')
  if (user.role === 'PARENT') redirect('/parent/dashboard')
  if (!user.student) redirect('/onboarding')

  const { student } = user
  const now = new Date()

  const referralCode = student.referralCode ?? (await ensureReferralCode(student.id, student.firstName).catch(() => null))
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

  const [upcomingSessions, matches, payments] = await Promise.all([
    prisma.session.findMany({
      where: {
        studentId: student.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: now },
      },
      include: { teacher: true },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    prisma.match.findMany({
      where: { studentId: student.id, active: true },
      include: {
        teacher: true,
        messageThread: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: { studentId: student.id, status: { in: ['paid', 'refunded', 'partially_refunded'] } },
      include: { session: { include: { teacher: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const unreadCount = matches.reduce((total, m) => {
    const lastMsg = m.messageThread?.messages[0]
    if (lastMsg && lastMsg.senderClerkId !== userId && !lastMsg.readAt) return total + 1
    return total
  }, 0)

  const lessonNotes = AI_NOTES_ENABLED
    ? await prisma.lessonNote.findMany({
        where: { studentId: student.id, status: 'shared' },
        include: { session: { select: { scheduledAt: true } } },
        orderBy: { sharedAt: 'desc' },
        take: 8,
      })
    : []

  // Resources for the student's primary tutor (P2-5): what the tutor shared + their own uploads.
  const needsRecurringCard = RECURRING_ENABLED
    ? await prisma.recurringBooking.count({ where: { studentId: student.id, active: true, stripePaymentMethodId: null } })
    : 0

  const primaryMatch = matches[0]
  const resources = RESOURCES_ENABLED && primaryMatch
    ? await prisma.studentDocument.findMany({
        where: { matchId: primaryMatch.id, OR: [{ studentVisible: true }, { uploadedBy: 'student' }], fileName: { not: null } },
        orderBy: { createdAt: 'asc' },
      })
    : []

  const { student_dashboard } = await getDictionary(await getLocaleFromHeaders())

  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">{student_dashboard.nav_home}</Link>
          <Link href="/tutors" className="text-sm text-sand-500 hover:text-brand-700">{student_dashboard.nav_find_tutor}</Link>
          <Link href="/sign-out" className="text-sm text-sand-500 hover:text-brand-700">{student_dashboard.nav_sign_out}</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">
          Welcome back, {student.firstName}
        </h1>
        <p className="text-sand-500 mb-8 text-sm">{student_dashboard.subtitle}</p>

        {RECURRING_ENABLED && needsRecurringCard > 0 && (
          <div className="mb-8">
            <RecurringCardPrompt />
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">{student_dashboard.stat_upcoming}</p>
            <p className="text-3xl font-semibold text-sand-900">{upcomingSessions.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">{student_dashboard.stat_tutors}</p>
            <p className="text-3xl font-semibold text-sand-900">{matches.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">{student_dashboard.stat_unread}</p>
            <p className="text-3xl font-semibold text-sand-900">{unreadCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-5 col-span-2 sm:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sand-500 mb-1">{student_dashboard.stat_credit}</p>
                <p className="text-3xl font-semibold text-brand-700">£{(student.creditBalancePence / 100).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/redeem" className="text-sm border border-sand-200 px-4 py-2 rounded-lg text-sand-700 hover:border-brand-300 transition">{student_dashboard.redeem_voucher}</Link>
                <Link href="/gift" className="text-sm bg-sand-100 px-4 py-2 rounded-lg text-sand-700 hover:bg-sand-200 transition">{student_dashboard.gift_lesson}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Referral */}
        {referralCode && (
          <ReferralCard
            code={referralCode}
            link={`${appUrl}/r/${referralCode}`}
            rewardPounds={REFERRAL_REWARD_PENCE / 100}
          />
        )}

        {/* Upcoming sessions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sand-900">{student_dashboard.upcoming_heading}</h2>
            <Link href="/tutors" className="text-sm text-brand-600 hover:text-brand-700">
              {student_dashboard.book_new}
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center">
              <p className="text-sand-400 text-sm mb-3">{student_dashboard.no_lessons}</p>
              <Link
                href="/tutors"
                className="inline-block bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition"
              >
                {student_dashboard.find_tutor_cta}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(s => {
                const minutesUntil = Math.floor((new Date(s.scheduledAt).getTime() - now.getTime()) / 60000)
                const isLive = minutesUntil <= 10
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-sand-200 p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sand-900 text-sm">
                        {s.teacher.firstName} {s.teacher.lastName}
                      </p>
                      <p className="text-sand-500 text-sm">
                        {new Date(s.scheduledAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                      {isLive && (
                        <span className="inline-block mt-1 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                          {student_dashboard.live_now}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/session/${s.id}`}
                      className={`shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition ${
                        isLive
                          ? 'bg-brand-600 text-white hover:bg-brand-700'
                          : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                      }`}
                    >
                      {isLive ? student_dashboard.join : student_dashboard.view}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Resources (P2-5) */}
        {RESOURCES_ENABLED && primaryMatch && (
          <section className="mb-8">
            <h2 className="font-medium text-sand-900 mb-3">{student_dashboard.resources_heading}</h2>
            <ResourceLibrary
              matchId={primaryMatch.id}
              role="student"
              initial={resources.map(d => ({ id: d.id, label: d.label, url: d.url, category: d.category, uploadedBy: d.uploadedBy, studentVisible: d.studentVisible, fileName: d.fileName, fileSizeBytes: d.fileSizeBytes }))}
            />
          </section>
        )}

        {/* Lesson notes (P2-4) */}
        {AI_NOTES_ENABLED && lessonNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="font-medium text-sand-900 mb-3">{student_dashboard.notes_heading}</h2>
            <div className="space-y-3">
              {lessonNotes.map(n => (
                <div key={n.id} className="bg-white rounded-2xl border border-sand-200 p-4">
                  <p className="text-xs text-sand-400 mb-1.5">
                    {new Date(n.session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-sand-800">{n.topicsCovered}</p>
                  {n.difficulty && <p className="text-sm text-sand-600 mt-1"><span className="text-sand-400">{student_dashboard.found_tricky}</span> {n.difficulty}</p>}
                  {n.homework && <p className="text-sm text-sand-600 mt-1"><span className="text-sand-400">{student_dashboard.homework}</span> {n.homework}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Messages / therapist threads */}
        {matches.length > 0 && (
          <section>
            <h2 className="font-medium text-sand-900 mb-3">{student_dashboard.messages_heading}</h2>
            <div className="space-y-3">
              {matches.map(m => {
                const lastMsg = m.messageThread?.messages[0]
                const isUnread = lastMsg && lastMsg.senderClerkId !== userId && !lastMsg.readAt
                return (
                  <Link
                    key={m.id}
                    href={m.messageThread ? `/messages/${m.messageThread.id}` : '#'}
                    className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-sand-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sand-900 text-sm">
                          {m.teacher.firstName} {m.teacher.lastName}
                        </p>
                        {lastMsg ? (
                          <p className={`text-sm mt-0.5 truncate max-w-xs ${isUnread ? 'text-sand-800 font-medium' : 'text-sand-400'}`}>
                            {lastMsg.body}
                          </p>
                        ) : (
                          <p className="text-sm text-sand-400 mt-0.5">{student_dashboard.no_messages}</p>
                        )}
                      </div>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Payments & receipts */}
        {payments.length > 0 && (
          <section className="mt-8">
            <h2 className="font-medium text-sand-900 mb-3">{student_dashboard.payments_heading}</h2>
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {payments.map((p, i) => {
                const sym = p.currency === 'usd' ? '$' : '£'
                const refunded = p.status === 'refunded' || p.status === 'partially_refunded'
                return (
                  <div key={p.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-sand-900 truncate">
                        {p.session ? `${p.session.teacher.firstName} ${p.session.teacher.lastName}` : student_dashboard.lesson_package}
                      </p>
                      <p className="text-xs text-sand-400 mt-0.5">
                        {p.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {sym}{(p.amountTotalPence / 100).toFixed(2)}
                        {refunded && <span className="text-red-500"> · {student_dashboard.refunded}</span>}
                      </p>
                    </div>
                    <Link href={`/receipt/${p.id}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium shrink-0">
                      {student_dashboard.receipt}
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
