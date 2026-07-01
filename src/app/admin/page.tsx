import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ApprovalActions from './ApprovalActions'
import ComplaintActions from './ComplaintActions'
import { registerFor } from '@/lib/credential-registers'
import { daysUntil, expiryState } from '@/lib/credentials-expiry'
import { isAdminUser } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user) && !(await isFounder())) redirect('/')

  // Load credential documents for pending teachers via raw SQL (new table, pre-migration safe).
  type CredDoc = {
    teacherId: string
    extractedName: string | null
    extractedBody: string | null
    extractedRef: string | null
    extractedExpiry: Date | null
    confidenceScore: number | null
    flags: string[]
  }
  let credDocsByTeacher: Record<string, CredDoc> = {}
  try {
    const docs = await prisma.$queryRaw<CredDoc[]>`
      SELECT DISTINCT ON ("teacherId")
        "teacherId", "extractedName", "extractedBody", "extractedRef",
        "extractedExpiry", "confidenceScore", "flags"
      FROM "CredentialDocument"
      WHERE "teacherId" = ANY(
        SELECT id FROM "Teacher" WHERE status = 'PENDING'
      )
      ORDER BY "teacherId", "uploadedAt" DESC
    `
    credDocsByTeacher = Object.fromEntries(docs.map(d => [d.teacherId, d]))
  } catch {
    // Table not yet created — silently skip
  }

  const [pending, all, openComplaints, stats] = await Promise.all([
    prisma.teacher.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.complaint.findMany({
      where: { status: { not: 'resolved' } },
      include: { teacher: true },
      orderBy: { createdAt: 'asc' },
    }),
    Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({ _sum: { platformFeePence: true }, where: { status: 'paid' } }),
    ]),
  ])

  const [studentCount, activeTeachers, completedSessions, revenueAgg] = stats
  const platformRevenue = revenueAgg._sum.platformFeePence ?? 0

  // Recent users + who's online now, for the dashboard Users panel.
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { teacher: { select: { firstName: true, lastName: true, status: true } } },
  })
  const onlineClerkIds = new Set<string>()
  try {
    const clerk = await clerkClient()
    const sessions = await clerk.sessions.getSessionList({ status: 'active', limit: 500 })
    for (const s of sessions.data) onlineClerkIds.add(s.userId)
  } catch (e) {
    console.error('[admin] active-session lookup failed:', e)
  }

  return (
    <main className="min-h-screen bg-sand-50">

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Platform stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Students', value: studentCount },
            { label: 'Active tutors', value: activeTeachers },
            { label: 'Lessons completed', value: completedSessions },
            { label: 'Platform revenue', value: `£${(platformRevenue / 100).toFixed(0)}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="text-xs text-sand-500 mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-sand-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Users */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide">Users</h2>
            <Link href="/admin/users" className="text-sm text-brand-700 hover:text-brand-800">View all →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            {recentUsers.map((u, i) => {
              const online = onlineClerkIds.has(u.clerkId)
              const name = u.teacher ? `${u.teacher.firstName} ${u.teacher.lastName}` : null
              return (
                <Link key={u.id} href={`/admin/users/${u.id}`} className={`flex items-center justify-between gap-3 px-5 py-3 hover:bg-sand-50/60 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-green-500' : 'bg-sand-300'}`} title={online ? 'Online now' : 'Offline'} />
                    <span className="min-w-0">
                      <span className="block text-sm text-sand-900 truncate">{u.email}</span>
                      {name && <span className="text-xs text-sand-400">{name}</span>}
                    </span>
                  </span>
                  <span className="text-xs text-sand-500 shrink-0">{u.role.toLowerCase()}{u.teacher && u.teacher.status !== 'ACTIVE' ? ` · ${u.teacher.status.toLowerCase()}` : ''}</span>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-sand-900">Credential verification</h1>
          <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            {pending.length} pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-sand-400 mb-10">
            No pending applications
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide">Pending review</h2>
            {pending.map(t => {
              const register = registerFor(t.qualificationBody)
              const qualState = expiryState(daysUntil(t.qualificationExpiry))
              const stateCls = (s: string) => s === 'ok' ? 'text-sand-900' : s === 'expiring' ? 'text-amber-700' : 'text-red-600 font-medium'
              const doc = credDocsByTeacher[t.id]
              const docConfidence = doc?.confidenceScore != null ? Math.round(Number(doc.confidenceScore) * 100) : null
              const docFlags: string[] = Array.isArray(doc?.flags) ? doc.flags : []
              return (
              <div key={t.id} className="bg-white rounded-2xl border border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-sand-900">{t.firstName} {t.lastName}</p>
                  <span className="text-xs bg-sand-100 text-sand-600 px-2 py-0.5 rounded">{t.qualificationBody}</span>
                </div>
                <p className="text-sm text-sand-500 mb-3">{t.user.email}</p>

                {/* Credential block — declared values + extraction comparison + register link */}
                <div className="rounded-xl border border-sand-200 bg-sand-50/60 p-4 space-y-2 text-sm">
                  {/* Declared vs extracted comparison table */}
                  {doc ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-sand-400 pb-1 border-b border-sand-200">
                        <span>Field</span>
                        <span>Declared</span>
                        <span>On certificate</span>
                      </div>
                      {[
                        { label: 'Name',   declared: `${t.firstName} ${t.lastName}`, extracted: doc.extractedName },
                        { label: 'Body',   declared: t.qualificationBody,             extracted: doc.extractedBody },
                        { label: 'Ref',    declared: t.qualificationRef,              extracted: doc.extractedRef },
                        { label: 'Expiry', declared: t.qualificationExpiry ? new Date(t.qualificationExpiry).toLocaleDateString('en-GB') : '—', extracted: doc.extractedExpiry ? new Date(doc.extractedExpiry).toLocaleDateString('en-GB') : null },
                      ].map(row => {
                        const mismatch = row.extracted && row.declared &&
                          row.extracted.toLowerCase().trim() !== row.declared.toLowerCase().trim()
                        return (
                          <div key={row.label} className={`grid grid-cols-3 gap-2 text-xs ${mismatch ? 'text-amber-700' : 'text-sand-700'}`}>
                            <span className="text-sand-400">{row.label}</span>
                            <span className="font-mono">{row.declared ?? '—'}</span>
                            <span className={`font-mono ${mismatch ? 'font-semibold' : ''}`}>{row.extracted ?? <span className="text-sand-300">not read</span>}</span>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-between pt-1 border-t border-sand-200">
                        <div className="flex gap-1 flex-wrap">
                          {docFlags.map(f => (
                            <span key={f} className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{f.replace('_', ' ')}</span>
                          ))}
                          {docFlags.length === 0 && <span className="text-xs text-brand-600">✓ No flags</span>}
                        </div>
                        {docConfidence !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            docConfidence >= 80 ? 'bg-brand-100 text-brand-700' :
                            docConfidence >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {docConfidence}% match
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sand-600">Qualification ref</span>
                        <span className="font-mono font-medium text-sand-900 select-all">{t.qualificationRef}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sand-600">Qualification expiry</span>
                        <span className={stateCls(qualState)}>
                          {t.qualificationExpiry ? new Date(t.qualificationExpiry).toLocaleDateString('en-GB') : '—'}{qualState !== 'ok' ? ` · ${qualState}` : ''}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-sand-200">
                    {t.credentialDocUrl
                      ? <a href={t.credentialDocUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline text-xs">View certificate ↗</a>
                      : <span className="text-sand-400 text-xs">No certificate uploaded</span>}
                    {register && (
                      <a href={register.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-700 transition shrink-0">
                        Open {t.qualificationBody} register ↗
                      </a>
                    )}
                  </div>
                  {register && (
                    <p className="text-xs text-sand-400">
                      Search by {register.checkBy}. Confirm: name matches · ref matches · status current · not expired.
                    </p>
                  )}
                </div>

                <p className="text-sm text-sand-500 mt-3 line-clamp-2">{t.bio}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {t.subjects.map(s => (
                    <span key={s} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-sand-100">
                  <ApprovalActions teacherId={t.id} teacherName={`${t.firstName} ${t.lastName}`} />
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Complaints */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide">Open complaints</h2>
            <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">{openComplaints.length}</span>
          </div>
          {openComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-6 text-center text-sand-400 text-sm">
              No open complaints
            </div>
          ) : (
            <div className="space-y-3">
              {openComplaints.map(c => (
                <div key={c.id} className={`bg-white rounded-2xl border p-5 ${c.category === 'safeguarding' ? 'border-red-300' : 'border-sand-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded uppercase ${c.category === 'safeguarding' ? 'bg-red-100 text-red-700' : 'bg-sand-100 text-sand-600'}`}>
                          {c.category}
                        </span>
                        <span className="text-xs text-sand-400">{new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
                        {c.teacher && <span className="text-xs text-sand-500">re: {c.teacher.firstName} {c.teacher.lastName}</span>}
                      </div>
                      <p className="text-sm text-sand-700 whitespace-pre-line">{c.body}</p>
                    </div>
                    <ComplaintActions complaintId={c.id} currentStatus={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide mb-4">All tutors</h2>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-sand-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Body</th>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Rate</th>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-sand-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {all.map(t => (
                  <tr key={t.id} className="hover:bg-sand-50">
                    <td className="px-6 py-4 font-medium text-sand-900">{t.firstName} {t.lastName}</td>
                    <td className="px-6 py-4 text-sand-600">{t.qualificationBody}</td>
                    <td className="px-6 py-4 text-sand-600">£{(t.sessionRatePence / 100).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        t.status === 'ACTIVE' ? 'bg-brand-100 text-brand-700' :
                        t.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sand-500">{new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
