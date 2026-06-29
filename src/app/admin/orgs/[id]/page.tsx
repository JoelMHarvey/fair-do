import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { isAdminUser } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const admin = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(admin) && !(await isFounder())) redirect('/')

  const org = await prisma.organisation.findUnique({
    where: { id },
    include: { members: { select: { id: true, firstName: true, lastName: true } } },
  })
  if (!org) notFound()

  const memberIds = org.members.map(m => m.id)

  // Pool-funded payments carry an `org_`-prefixed reference.
  const orgPayments = memberIds.length
    ? await prisma.payment.findMany({
        where: { studentId: { in: memberIds }, stripePaymentIntentId: { startsWith: 'org_' }, status: 'paid' },
        select: { amountTotalPence: true, createdAt: true, studentId: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const totalDrawn = orgPayments.reduce((s, p) => s + p.amountTotalPence, 0)
  const sessionsFunded = orgPayments.length
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthDrawn = orgPayments.filter(p => p.createdAt >= startOfMonth).reduce((s, p) => s + p.amountTotalPence, 0)
  const nameById = new Map(org.members.map(m => [m.id, `${m.firstName} ${m.lastName}`]))
  const fmt = (p: number) => `£${(p / 100).toFixed(2)}`

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <Link href="/admin/orgs" className="text-sm text-sand-500 hover:text-brand-700">← Organisations</Link>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">{org.name}</h1>
        <p className="text-sand-600 mb-8">
          {org.contactEmail}{org.domain ? ` · auto-enrol @${org.domain}` : ''} · {org.active ? 'Active' : 'Inactive'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Pool remaining', value: fmt(org.creditPoolPence), accent: 'text-brand-700' },
            { label: 'Spent (all time)', value: fmt(totalDrawn) },
            { label: 'Spent this month', value: fmt(monthDrawn) },
            { label: 'Members', value: String(org.members.length) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="text-xs text-sand-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.accent ?? 'text-sand-900'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">Utilisation</h2>
          <p className="text-sm text-sand-500 mb-4">{sessionsFunded} lesson{sessionsFunded !== 1 ? 's' : ''} funded from the pool. Member identities shown to admin only — never exposed to the employer in production reports.</p>
          {sessionsFunded === 0 ? (
            <p className="text-sand-400 text-sm">No pool-funded lessons yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-sand-100">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 border-b border-sand-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-sand-600">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-sand-600">Member</th>
                    <th className="text-right px-4 py-2.5 font-medium text-sand-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {orgPayments.slice(0, 50).map((p, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-sand-600">{p.createdAt.toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2.5 text-sand-700">{nameById.get(p.studentId) ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right text-sand-700">{fmt(p.amountTotalPence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">Members ({org.members.length})</h2>
          {org.members.length === 0 ? (
            <p className="text-sand-400 text-sm">No members yet. Students with an @{org.domain ?? 'domain'} email auto-enrol on first booking.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {org.members.map(m => (
                <span key={m.id} className="text-sm bg-sand-100 text-sand-700 px-3 py-1 rounded-full">{m.firstName} {m.lastName}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
