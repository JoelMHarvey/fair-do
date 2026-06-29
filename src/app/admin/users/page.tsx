import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { isAdminUser, isAdminEmail } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Users — fair-do admin' }

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700',
  TEACHER: 'bg-brand-50 text-brand-700',
  STUDENT: 'bg-sand-100 text-sand-600',
}

export default async function AdminUsersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const me = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(me) && !(await isFounder())) redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { teacher: { select: { status: true, firstName: true, lastName: true } } },
  })

  // Who's logged in right now = Clerk's active sessions (authoritative).
  const onlineClerkIds = new Set<string>()
  try {
    const clerk = await clerkClient()
    const sessions = await clerk.sessions.getSessionList({ status: 'active', limit: 500 })
    for (const s of sessions.data) onlineClerkIds.add(s.userId)
  } catch (e) {
    console.error('[admin/users] active-session lookup failed:', e)
  }

  const rows = users.map(u => ({ ...u, online: onlineClerkIds.has(u.clerkId) }))
  const onlineCount = rows.filter(r => r.online).length

  return (
    <main className="min-h-screen bg-sand-50">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sand-900">Users &amp; access</h1>
            <p className="text-sm text-sand-500 mt-1">Latest {rows.length} accounts. Click a user to view their setup and manage their account.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm text-sand-600 bg-white border border-sand-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> {onlineCount} online now
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-sand-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">User</th>
                <th className="text-left font-medium px-4 py-3">Role</th>
                <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="text-left font-medium px-4 py-3">Joined</th>
                <th className="text-right font-medium px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => {
                const allowlisted = isAdminEmail(u.email)
                const name = u.teacher ? `${u.teacher.firstName} ${u.teacher.lastName}` : null
                return (
                  <tr key={u.id} className={`${i > 0 ? 'border-t border-sand-100' : ''} hover:bg-sand-50/60`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-2 group">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${u.online ? 'bg-green-500' : 'bg-sand-300'}`} title={u.online ? 'Online now' : 'Offline'} />
                        <div className="min-w-0">
                          <p className="text-sand-900 truncate group-hover:text-brand-700">{u.email}{u.id === me?.id && <span className="text-sand-400"> (you)</span>}</p>
                          {name && <p className="text-xs text-sand-400 truncate">{name}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[u.role] ?? 'bg-sand-100 text-sand-600'}`}>{u.role.toLowerCase()}</span>
                      {allowlisted && <span className="ml-1 text-[10px] text-amber-600" title="Always admin via allowlist">★</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sand-500">{u.teacher ? u.teacher.status.toLowerCase() : '—'}</td>
                    <td className="px-4 py-3 text-sand-500">{u.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/users/${u.id}`} className="text-xs text-brand-700 hover:text-brand-800">Manage →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-sand-400 mt-3">★ = full-access allowlist — always admin regardless of stored role. “Online now” = a live Clerk session.</p>
      </div>
    </main>
  )
}
