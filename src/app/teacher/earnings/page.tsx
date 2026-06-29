import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PageHeader, HelpHint, EmptyState } from '@/components/Guidance'
import { HelpTip } from '@/components/HelpTip'
import { hasPaidAccess } from '@/lib/access'

export const dynamic = 'force-dynamic'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5">
      <p className="text-sm text-sand-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-sand-900">{value}</p>
      {sub && <p className="text-xs text-sand-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function EarningsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: true } } },
  })
  if (!user?.teacher) redirect('/teacher/dashboard')
  const teacher = user.teacher

  const sub = teacher.subscription
  const isPaid = hasPaidAccess({ email: user.email, subscription: sub })

  const cur = teacher.country === 'US' ? '$' : '£'
  const fmt = (p: number) => `${cur}${(p / 100).toFixed(2)}`
  const fmt0 = (p: number) => `${cur}${Math.round(p / 100)}`

  // Recent payments for the table.
  const payments = await prisma.payment.findMany({
    where: { session: { teacherId: teacher.id }, status: 'paid' },
    include: { session: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // All paid payments (payout + date) for money metrics, and completed sessions for activity metrics.
  const [allPaid, completed] = await Promise.all([
    prisma.payment.findMany({
      where: { session: { teacherId: teacher.id }, status: 'paid' },
      select: { teacherPayoutPence: true, createdAt: true },
    }),
    prisma.session.findMany({
      where: { teacherId: teacher.id, status: 'COMPLETED' },
      select: { scheduledAt: true, studentId: true, student: { select: { firstName: true, lastName: true } } },
    }),
  ])

  const now = new Date()
  const monthStart = (back: number) => new Date(now.getFullYear(), now.getMonth() - back, 1)
  const inMonth = (d: Date, back: number) => d >= monthStart(back) && d < monthStart(back - 1)

  const thisMonthTotal = allPaid.filter(p => inMonth(new Date(p.createdAt), 0)).reduce((s, p) => s + p.teacherPayoutPence, 0)
  const prevMonthTotal = allPaid.filter(p => inMonth(new Date(p.createdAt), 1)).reduce((s, p) => s + p.teacherPayoutPence, 0)
  const thisMonthCount = allPaid.filter(p => inMonth(new Date(p.createdAt), 0)).length
  const allTimeTotal = allPaid.reduce((s, p) => s + p.teacherPayoutPence, 0)
  const pctChange = prevMonthTotal > 0 ? Math.round(((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100) : null

  // Last 6 months trend.
  const trend = Array.from({ length: 6 }, (_, i) => {
    const back = 5 - i
    const total = allPaid.filter(p => inMonth(new Date(p.createdAt), back)).reduce((s, p) => s + p.teacherPayoutPence, 0)
    return { label: monthStart(back).toLocaleDateString('en-GB', { month: 'short' }), total }
  })
  const trendMax = Math.max(1, ...trend.map(t => t.total))
  const avg6 = Math.round(trend.reduce((s, t) => s + t.total, 0) / 6)

  // Lessons run: week / month / all-time (completed).
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0)
  const sessWeek = completed.filter(s => new Date(s.scheduledAt) >= weekStart).length
  const sessMonth = completed.filter(s => inMonth(new Date(s.scheduledAt), 0)).length
  const sessAll = completed.length

  // Most active students (by completed lessons).
  const byStudent = new Map<string, { name: string; count: number }>()
  for (const s of completed) {
    const name = `${s.student.firstName} ${s.student.lastName}`.trim()
    byStudent.set(s.studentId, { name, count: (byStudent.get(s.studentId)?.count ?? 0) + 1 })
  }
  const topStudents = [...byStudent.values()].sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <main className="min-h-screen bg-sand-50">
      <TeacherNav />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <PageHeader
          title="Earnings"
          subtitle="What you've been paid for completed lessons, your trends, and when the money reaches your bank."
          help={{ href: '/teacher/help', label: 'How payouts work' }}
        />

        {/* Headline totals — everyone */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-sand-200 p-6">
            <p className="text-sm text-sand-500 mb-1 inline-flex items-center">
              This month
              <HelpTip>The amount you've been paid for lessons completed since the 1st of this month.</HelpTip>
            </p>
            <p className="text-3xl font-semibold text-sand-900">{fmt(thisMonthTotal)}</p>
            <p className="text-xs text-sand-400 mt-1">
              {thisMonthCount} lesson{thisMonthCount !== 1 ? 's' : ''}
              {pctChange != null && <span className={pctChange >= 0 ? ' text-brand-600' : ' text-coral-600'}> · {pctChange >= 0 ? '+' : ''}{pctChange}% vs last month</span>}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-6">
            <p className="text-sm text-sand-500 mb-1 inline-flex items-center">
              All time
              <HelpTip>Everything you've earned on fair-do so far, across every completed and paid lesson.</HelpTip>
            </p>
            <p className="text-3xl font-semibold text-sand-900">{fmt(allTimeTotal)}</p>
            <p className="text-xs text-sand-400 mt-1">{allPaid.length} lesson{allPaid.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Insights — paid tier */}
        {isPaid ? (
          <section className="mb-10">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">Insights</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <Stat label="Last month" value={fmt(prevMonthTotal)} />
              <Stat label="Monthly average" value={fmt(avg6)} sub="last 6 months" />
              <Stat label="Lessons this week" value={String(sessWeek)} />
              <Stat label="Lessons this month" value={String(sessMonth)} />
              <Stat label="Lessons all time" value={String(sessAll)} />
            </div>

            {/* 6-month trend */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 mb-4">
              <p className="text-sm font-medium text-sand-700 mb-4">Payout — last 6 months</p>
              <div className="flex items-end gap-3 h-32">
                {trend.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div className="w-full rounded-t-lg bg-brand-500/80" style={{ height: `${Math.max(4, (t.total / trendMax) * 100)}%` }} title={fmt(t.total)} />
                    <span className="text-xs text-sand-400">{t.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-sand-400 mt-3">Tallest bar = {fmt0(trendMax)}. Based on completed, paid lessons.</p>
            </div>

            {/* Most active students */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <p className="text-sm font-medium text-sand-700 mb-3">Most active students</p>
              {topStudents.length === 0 ? (
                <p className="text-sm text-sand-400">No completed lessons yet.</p>
              ) : (
                <ul className="space-y-2">
                  {topStudents.map((s, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-sand-800">{s.name || 'Student'}</span>
                      <span className="text-sand-500">{s.count} lesson{s.count !== 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <div className="mb-10 bg-gradient-to-br from-brand-50 to-sand-50 rounded-2xl border border-brand-200 p-6">
            <p className="text-sm font-semibold text-brand-800 mb-1">Earnings insights — on the Practice plan</p>
            <p className="text-sm text-sand-600 mb-4">
              Month-on-month trends, a 6-month payout chart, lessons per week and month, and your most active students —
              so you can see how your studio is growing.
            </p>
            <Link href="/teacher/billing" className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-700 transition shadow-sm">
              Upgrade to unlock insights →
            </Link>
          </div>
        )}

        <div className="mb-6">
          <HelpHint>
            <strong>When you get paid:</strong> once a lesson is completed and your student has paid, the money reaches
            your bank account in about 2 business days. Payments are handled securely by Stripe and go straight to the
            bank details on your account — fair-do never holds your money.
          </HelpHint>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon="💷"
            title="No earnings yet"
            body="Your payments will appear here once you've run your first paid lesson. As soon as a lesson is completed and paid, you'll see it here — and the money reaches your bank about 2 business days later."
            cta={{ href: '/teacher/dashboard', label: 'Go to dashboard' }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-sand-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Lesson</th>
                  <th className="text-right px-6 py-3 font-medium text-sand-600">Student paid</th>
                  <th className="text-right px-6 py-3 font-medium text-sand-600">You received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-sand-50">
                    <td className="px-6 py-4 text-sand-600">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sand-600">
                      {p.session ? new Date(p.session.scheduledAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sand-700">{fmt(p.amountTotalPence)}</td>
                    <td className="px-6 py-4 text-right font-medium text-brand-700">{fmt(p.teacherPayoutPence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
