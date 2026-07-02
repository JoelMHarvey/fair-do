import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import BroadcastComposer from './BroadcastComposer'

export const metadata = { title: 'Broadcasts — fair-do' }

// School broadcast composer + history. Available to ADMIN and STAFF — the
// layout's getSchoolContext gates membership; the API re-checks on send.
export default async function SchoolBroadcastsPage() {
  const { org } = await getSchoolContext()

  const [groups, history] = await Promise.all([
    prisma.mailGroup.findMany({
      where: { organisationId: org.id },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.broadcast.findMany({
      where: { organisationId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const groupName = new Map(groups.map(g => [g.id, g.name]))

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Broadcasts</h1>
        <p className="text-sm text-sand-500 mt-1">
          Send an announcement to a mail group. Rule-based groups resolve their members at the moment you send.
        </p>
      </header>

      <BroadcastComposer
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
          manualCount: g.rule ? null : g._count.members, // rule groups → live count shown on send
        }))}
      />

      <section>
        <h2 className="font-display text-lg text-sand-900 mb-3">Sent</h2>
        {history.length === 0 ? (
          <p className="text-sm text-sand-400">Nothing sent yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-sand-400 border-b border-sand-100">
                  <th className="px-4 py-2.5 font-medium">Sent</th>
                  <th className="px-4 py-2.5 font-medium">Group</th>
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium text-right">Recipients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {history.map(b => (
                  <tr key={b.id}>
                    <td className="px-4 py-2.5 text-sand-500 whitespace-nowrap">
                      {b.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-sand-600">
                      {(b.mailGroupId && groupName.get(b.mailGroupId)) ?? <span className="text-sand-400">deleted group</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sand-800 max-w-xs truncate">{b.subject}</td>
                    <td className="px-4 py-2.5 text-sand-600 text-right">{b.recipientCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
