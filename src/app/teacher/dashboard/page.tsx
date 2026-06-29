import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ensureTherapistReferralCode } from '@/lib/therapist-referral'
import { ReferralLinkCard } from '@/components/ReferralLinkCard'
import { GettingStarted } from '@/components/GettingStarted'
import { TherapistNav } from '@/components/TherapistNav'
import { WelcomeModal } from '@/components/WelcomeModal'
import { InstallHint } from '@/components/InstallHint'
import { PushToggle } from '@/components/PushToggle'
import { CalendarSync } from '@/components/CalendarSync'
import { ensureCalendarToken, calendarFeedUrl } from '@/lib/calendar'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { daysUntil, expiryState } from '@/lib/credentials-expiry'

const STATUS_LABEL = { PENDING: 'Under review', ACTIVE: 'Live', SUSPENDED: 'Suspended' } as const
const STATUS_CLASS = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-brand-100 text-brand-700',
  SUSPENDED: 'bg-red-100 text-red-700',
} as const

export default async function TeacherDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })

  if (!user) redirect('/onboarding')
  if (!user.teacher) redirect('/onboarding')

  const { teacher } = user
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [upcomingSessions, activeStudents, monthPayments, threads] = await Promise.all([
    prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: now },
      },
      include: { student: true },
      orderBy: { scheduledAt: 'asc' },
      take: 8,
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
    prisma.messageThread.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])

  const monthTotal = monthPayments.reduce((s, p) => s + p.teacherPayoutPence, 0)
  const fmt = (p: number) => `£${(p / 100).toFixed(0)}`

  // Studio portal: nudge teachers without an active plan to choose one.
  const subscription = PRACTICE_PORTAL_ENABLED
    ? await prisma.subscription.findUnique({ where: { teacherId: teacher.id } })
    : null
  const needsPlan = PRACTICE_PORTAL_ENABLED
    && !(subscription && (subscription.status === 'active' || subscription.status === 'trialing'))

  // Studio portal: active package summary for the dashboard.
  const activePackages = PRACTICE_PORTAL_ENABLED
    ? await prisma.package.findMany({
        where: { teacherId: teacher.id, status: 'active' },
        select: { sessionsTotal: true, sessionsUsed: true },
      })
    : []
  const packageSessionsLeft = activePackages.reduce((s, p) => s + (p.sessionsTotal - p.sessionsUsed), 0)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  // Peer-referral: code + earned bonuses
  const referralCode = teacher.referralCode ?? (await ensureTherapistReferralCode(teacher.id, teacher.firstName).catch(() => null))
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
  const calToken = PRACTICE_PORTAL_ENABLED
    ? await ensureCalendarToken(teacher.id, teacher.calendarToken).catch(() => null)
    : null
  const referrals = await prisma.teacherReferral.findMany({ where: { referrerTeacherId: teacher.id } })
  const freeMonthsEarned = referrals.filter(r => r.status !== 'pending').length // each rewarded referral = one free month
  const freeMonthsWaiting = teacher.freeMonthsOwed ?? 0 // banked, auto-applied next time they subscribe/upgrade
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length

  return (
    <main className="min-h-screen bg-sand-50">
      <TherapistNav />
      {PRACTICE_PORTAL_ENABLED && <WelcomeModal firstName={teacher.firstName} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <InstallHint />
        {PRACTICE_PORTAL_ENABLED && <PushToggle />}
        {PRACTICE_PORTAL_ENABLED && calToken && <CalendarSync url={calendarFeedUrl(calToken, appUrl)} />}
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">
              {teacher.firstName} {teacher.lastName}
            </h1>
            <p className="text-sand-500 text-sm">
              {teacher.qualificationBody} · {fmt(teacher.sessionRatePence)}/lesson
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_CLASS[teacher.status]}`}>
            {STATUS_LABEL[teacher.status]}
          </span>
        </div>

        {/* Credential expiry warnings — renew to stay live */}
        {(() => {
          const items = [
            { label: `${teacher.qualificationBody} qualification`, date: teacher.qualificationExpiry, days: daysUntil(teacher.qualificationExpiry, now) },
          ].map(i => ({ ...i, state: expiryState(i.days) })).filter(i => i.date && i.state !== 'ok')
          if (items.length === 0) return null
          const worst = items.some(i => i.state === 'suspendable' || i.state === 'expired')
          const fmtD = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          return (
            <div className={`rounded-xl p-5 text-sm mb-6 border ${worst ? 'bg-coral-50 border-coral-200 text-coral-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {teacher.credentialSuspended && <p className="mb-2"><strong>Your profile is paused.</strong> Renew below to take new bookings again — sessions already booked are unaffected.</p>}
              {items.map((i, n) => (
                <p key={n} className={n > 0 ? 'mt-1' : ''}>
                  {i.days! <= 0
                    ? <>Your <strong>{i.label}</strong> expired on {fmtD(i.date!)}.</>
                    : <>Your <strong>{i.label}</strong> expires in <strong>{i.days} day{i.days === 1 ? '' : 's'}</strong> ({fmtD(i.date!)}).</>}
                </p>
              ))}
              <Link href="/teacher/profile" className="inline-block mt-3 font-medium underline">Update my details →</Link>
            </div>
          )
        })()}

        {/* Quick actions (studio portal) */}
        {PRACTICE_PORTAL_ENABLED && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/teacher/students" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-full px-4 py-2 transition">
              + Invite a student
            </Link>
            <Link href="/teacher/students" className="bg-white border border-sand-200 hover:border-brand-300 text-sand-700 text-sm font-medium rounded-full px-4 py-2 transition">
              Students
            </Link>
            <Link href="/teacher/broadcast" className="bg-white border border-sand-200 hover:border-brand-300 text-sand-700 text-sm font-medium rounded-full px-4 py-2 transition">
              Message students
            </Link>
            <Link href="/teacher/billing" className="bg-white border border-sand-200 hover:border-brand-300 text-sand-700 text-sm font-medium rounded-full px-4 py-2 transition">
              Plans &amp; billing
            </Link>
          </div>
        )}

        {/* Getting-started checklist — guides a brand-new teacher through setup, hides when done */}
        {PRACTICE_PORTAL_ENABLED && (
          <GettingStarted
            steps={[
              { label: 'Choose your plan', href: '/teacher/billing', done: !needsPlan, hint: 'Pick how you\'ll use fair-do.' },
              { label: 'Connect payments', href: '/onboarding/teacher', done: teacher.stripeOnboarded, hint: 'So you can take card payments and get paid out.' },
              { label: 'Set your lesson price', href: '/teacher/profile', done: teacher.sessionRatePence > 0, hint: 'Your default rate — you can set a different price per student later.' },
              { label: 'Add your first student', href: '/teacher/students', done: activeStudents > 0, hint: 'Invite by email, or import your existing list.' },
            ]}
          />
        )}
        {teacher.status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800 mb-6">
            <strong>Profile under review.</strong> We&apos;re verifying your {teacher.qualificationBody} credentials (ref: {teacher.qualificationRef}). You&apos;ll receive an email within 2 business days.
          </div>
        )}
        {!teacher.stripeOnboarded && (
          <div className="bg-sand-100 border border-sand-200 rounded-xl p-5 text-sm text-sand-700 mb-6">
            <strong>Payments not connected.</strong> Complete Stripe setup to receive payouts.{' '}
            <a href="/onboarding/teacher" className="text-brand-600 hover:underline">Set up now →</a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">Upcoming</p>
            <p className="text-3xl font-semibold text-sand-900">{upcomingSessions.length}</p>
            <p className="text-xs text-sand-400 mt-1">lesson{upcomingSessions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">Active students</p>
            <p className="text-3xl font-semibold text-sand-900">{activeStudents}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <p className="text-xs text-sand-500 mb-1">This month</p>
            <p className="text-3xl font-semibold text-sand-900">{fmt(monthTotal)}</p>
            <p className="text-xs text-sand-400 mt-1">{monthPayments.length} lesson{monthPayments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Active packages summary (studio portal) */}
        {PRACTICE_PORTAL_ENABLED && packageSessionsLeft > 0 && (
          <div className="bg-white rounded-2xl border border-sand-200 px-5 py-4 mb-8 text-sm text-sand-600">
            <strong className="text-sand-800">{activePackages.length}</strong> active package{activePackages.length !== 1 ? 's' : ''} ·{' '}
            <strong className="text-sand-800">{packageSessionsLeft}</strong> prepaid lesson{packageSessionsLeft !== 1 ? 's' : ''} remaining across students
          </div>
        )}

        {/* Upcoming sessions */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">Upcoming lessons</h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-sand-400 text-sm">
              No upcoming lessons
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {upcomingSessions.map((s, i) => {
                const minutesUntil = Math.floor((new Date(s.scheduledAt).getTime() - now.getTime()) / 60000)
                const isLive = minutesUntil <= 10
                const isToday = new Date(s.scheduledAt) < endOfToday
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-sand-900">
                        {s.student.firstName} {s.student.lastName}
                      </p>
                      <p className="text-sm text-sand-500">
                        {new Date(s.scheduledAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLive ? (
                        <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      ) : isToday && (
                        <span className="text-xs font-medium text-coral-700 bg-coral-50 px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                      <Link
                        href={`/session/${s.id}`}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        {isLive ? 'Join →' : 'View →'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent messages */}
        {threads.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sand-900">Messages</h2>
            </div>
            <div className="space-y-2">
              {threads.map(t => {
                const lastMsg = t.messages[0]
                const isUnread = lastMsg && lastMsg.senderClerkId !== userId && !lastMsg.readAt
                return (
                  <Link
                    key={t.id}
                    href={`/messages/${t.id}`}
                    className="flex items-center justify-between bg-white rounded-2xl border border-sand-200 px-5 py-4 hover:border-sand-300 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-sand-900">
                        {t.student.firstName} {t.student.lastName}
                      </p>
                      {lastMsg ? (
                        <p className={`text-sm mt-0.5 truncate max-w-xs ${isUnread ? 'text-sand-800 font-medium' : 'text-sand-400'}`}>
                          {lastMsg.body}
                        </p>
                      ) : (
                        <p className="text-sm text-sand-400 mt-0.5">No messages yet</p>
                      )}
                    </div>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Refer a peer */}
        {referralCode && (
          <section className="mt-8">
            <ReferralLinkCard
              title="Refer a colleague, earn a free month"
              subtitle="Know a great tutor? Share your link. When they join, get verified and run their first lesson, you get a free month of fair-do — applied to your plan now, or saved until you upgrade."
              code={referralCode}
              link={`${appUrl}/r/${referralCode}`}
              footnote={
                freeMonthsEarned > 0
                  ? `${freeMonthsEarned} free month${freeMonthsEarned > 1 ? 's' : ''} earned${freeMonthsWaiting > 0 ? ` · ${freeMonthsWaiting} waiting to apply` : ''}${pendingReferrals ? ` · ${pendingReferrals} pending` : ''}.`
                  : pendingReferrals
                    ? `${pendingReferrals} referral${pendingReferrals > 1 ? 's' : ''} pending their first lesson.`
                    : undefined
              }
            />
          </section>
        )}
      </div>
    </main>
  )
}
