import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { isFounder } from '@/lib/founder'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Support inbox — fair-do' }

function fmt(d: Date) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

const STATUS_TONE: Record<string, string> = {
  new: 'bg-sand-100 text-sand-600',
  drafted: 'bg-brand-50 text-brand-700 border border-brand-200',
  replied: 'bg-green-50 text-green-700 border border-green-200',
  escalated: 'bg-coral-50 text-coral-700 border border-coral-200',
  ignored: 'bg-sand-100 text-sand-400',
}

export default async function AdminInboxPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user) && !(await isFounder())) redirect('/')

  const messages = await prisma.inboxMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  }).catch(() => [])

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="font-display text-2xl font-semibold text-brand-900 mb-1">Support inbox</h1>
      <p className="text-sm text-sand-500 mb-6">The 100 most recent messages ingested from the support mailbox, with the agent&rsquo;s triage + drafts.</p>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-sand-400 text-sm">
          No messages yet. Ingested by the inbox cron when IMAP is configured.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-2xl border border-sand-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sand-900 truncate">{msg.subject || '(no subject)'}</p>
                  <p className="text-xs text-sand-500 mt-0.5">{msg.fromEmail} · {fmt(msg.createdAt)} · {msg.mailbox}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_TONE[msg.status] ?? 'bg-sand-100 text-sand-600'}`}>{msg.status}</span>
              </div>
              <p className="text-sm text-sand-700 mt-2 whitespace-pre-wrap">{msg.bodyPreview}</p>
              {(msg.category || msg.severity) && (
                <p className="text-xs text-sand-400 mt-2">
                  {msg.category && <>triage: {msg.category}</>}
                  {msg.severity && <> · severity: {msg.severity}</>}
                  {msg.confidence != null && <> · {Math.round(msg.confidence * 100)}%</>}
                </p>
              )}
              {msg.draftReply && (
                <details className="mt-2">
                  <summary className="text-xs text-brand-700 cursor-pointer">Draft reply</summary>
                  <p className="text-sm text-sand-600 mt-1 whitespace-pre-wrap">{msg.draftReply}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
