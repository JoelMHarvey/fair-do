import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getMyOrg } from '@/lib/org'
import { Logo } from '@/components/Logo'
import OrgTopUp from './OrgTopUp'

export const metadata = { title: 'Your organisation — fair-do' }

export default async function OrgPortalPage() {
  const mine = await getMyOrg()

  if (!mine) {
    return (
      <main className="min-h-screen bg-sand-50">
        <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <Link href="/dashboard" className="text-sm text-sand-500 hover:text-brand-700">Dashboard</Link>
        </nav>
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-brand-900 mb-2">No organisation found</h1>
          <p className="text-sand-600 mb-6">This account isn&apos;t linked to a school or agency plan. Interested in fair-do for your institution?</p>
          <Link href="/for-schools" className="inline-block bg-brand-600 text-white px-7 py-3 rounded-full font-medium hover:bg-brand-700 transition">
            fair-do for Schools
          </Link>
        </div>
      </main>
    )
  }

  const { org, isContact } = mine

  // Members + aggregate utilisation (privacy: NO per-person breakdown for the employer)
  const members = await prisma.student.findMany({ where: { organisationId: org.id }, select: { id: true } })
  const memberIds = members.map(m => m.id)
  const payments = memberIds.length
    ? await prisma.payment.findMany({
        where: { studentId: { in: memberIds }, stripePaymentIntentId: { startsWith: 'org_' }, status: 'paid' },
        select: { amountTotalPence: true, createdAt: true },
      })
    : []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const totalSpent = payments.reduce((s, p) => s + p.amountTotalPence, 0)
  const monthSpent = payments.filter(p => p.createdAt >= startOfMonth).reduce((s, p) => s + p.amountTotalPence, 0)
  const fmt = (p: number) => `£${(p / 100).toFixed(2)}`
  const discountActive = org.discountPercent > 0 && (!org.discountExpiry || org.discountExpiry > now)

  // Month-by-month utilisation (last 6 months that have activity).
  const byMonth = new Map<string, { count: number; pence: number }>()
  for (const p of payments) {
    const key = p.createdAt.toISOString().slice(0, 7) // YYYY-MM
    const cur = byMonth.get(key) ?? { count: 0, pence: 0 }
    cur.count++; cur.pence += p.amountTotalPence
    byMonth.set(key, cur)
  }
  const monthly = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 6)
  const monthLabel = (ym: string) => new Date(ym + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/dashboard" className="text-sm text-sand-500 hover:text-brand-700">Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">{org.name}</h1>
        <p className="text-sand-600 mb-2">Your students&apos; tuition.</p>
        {discountActive && (
          <p className="inline-block text-sm bg-coral-50 text-coral-600 border border-coral-200 px-3 py-1 rounded-full mb-6">
            🎉 {org.discountPercent}% off active{org.discountExpiry ? ` until ${org.discountExpiry.toLocaleDateString('en-GB')}` : ''}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
          {[
            { label: 'Pool balance', value: fmt(org.creditPoolPence), accent: 'text-brand-700' },
            { label: 'Spent this month', value: fmt(monthSpent) },
            { label: 'Spent all time', value: fmt(totalSpent) },
            { label: 'Students', value: String(members.length) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="text-xs text-sand-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.accent ?? 'text-sand-900'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly usage report */}
        <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-brand-900">Monthly usage</h2>
            {isContact && monthly.length > 0 && (
              <a href="/api/org/report" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Download CSV ↓</a>
            )}
          </div>
          {monthly.length === 0 ? (
            <p className="text-sand-400 text-sm">No pool-funded lessons yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-sand-100">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 border-b border-sand-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-sand-600">Month</th>
                    <th className="text-right px-4 py-2.5 font-medium text-sand-600">Lessons</th>
                    <th className="text-right px-4 py-2.5 font-medium text-sand-600">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {monthly.map(([ym, v]) => (
                    <tr key={ym}>
                      <td className="px-4 py-2.5 text-sand-700">{monthLabel(ym)}</td>
                      <td className="px-4 py-2.5 text-right text-sand-600">{v.count}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-brand-700">{fmt(v.pence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy notice */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mb-6 text-sm text-sand-700">
          <p className="font-medium text-brand-800 mb-1">Private by design</p>
          <p>You see totals and spend — never who attended a lesson or what was discussed. Your students&apos; tuition is confidential.</p>
        </div>

        {/* Top-up */}
        {isContact ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">Top up the pool</h2>
            <p className="text-sm text-sand-500 mb-4">Add credit your team draws from automatically. Credits never expire.</p>
            <OrgTopUp />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-sand-200 p-6 text-sm text-sand-600">
            You have access as a team member. Only {org.contactEmail} can top up the pool.
          </div>
        )}

        {/* How members join */}
        <div className="mt-6 bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">How your team joins</h2>
          <p className="text-sm text-sand-600">
            {org.domain
              ? <>Anyone who signs up with an <strong>@{org.domain}</strong> email is automatically enrolled — their lessons draw from this pool. Just share fair-do.com and ask them to use their school email.</>
              : <>Add a company email domain (contact us) so staff auto-enrol, or invite them individually.</>}
          </p>
        </div>
      </div>
    </main>
  )
}
