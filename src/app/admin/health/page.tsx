import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { collectMetrics } from '@/lib/monitoring'
import { HealthDashboard } from '@/components/HealthDashboard'
import { getInboxAgentLevel } from '@/lib/settings'
import { agentConfigured } from '@/lib/inbox-agent'
import InboxAgentCard from './InboxAgentCard'
import { isAdminUser } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'System health — Faresay' }

export default async function AdminHealthPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user) && !(await isFounder())) redirect('/')

  const m = await collectMetrics()
  const [level, draftCount, escalatedCount] = await Promise.all([
    getInboxAgentLevel(),
    prisma.inboxMessage.count({ where: { status: 'drafted' } }).catch(() => 0),
    prisma.inboxMessage.count({ where: { status: 'escalated' } }).catch(() => 0),
  ])
  const imapConfigured = !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASSWORD)

  return (
    <main className="min-h-screen bg-sand-50">
      <HealthDashboard m={m} backHref="/admin" backLabel="← Admin" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 -mt-4">
        <InboxAgentCard
          initialLevel={level}
          configured={agentConfigured() && imapConfigured}
          draftCount={draftCount}
          escalatedCount={escalatedCount}
        />
      </div>
    </main>
  )
}
