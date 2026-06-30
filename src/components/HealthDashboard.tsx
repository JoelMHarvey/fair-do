import Link from 'next/link'
import type { Metrics } from '@/lib/monitoring'
import HealthAutoRefresh from '@/components/HealthAutoRefresh'
import { E2EPanel } from '@/components/E2EPanel'

const fmtGBP = (p: number) => `£${(p / 100).toFixed(2)}`
const ago = (mins: number | null) => mins == null ? 'never' : mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`

function Dot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-brand-500' : 'bg-coral-500'}`} />
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'warn' | 'bad' }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-4">
      <p className={`text-2xl font-semibold ${tone === 'bad' ? 'text-coral-600' : tone === 'warn' ? 'text-amber-600' : 'text-brand-900'}`}>{value}</p>
      <p className="text-xs text-sand-500 mt-0.5">{label}</p>
    </div>
  )
}

// Presentational system-health dashboard. Both /admin/health and /founder/health
// fetch metrics (auth-gated) and render this.
export function HealthDashboard({ m, backHref, backLabel }: { m: Metrics; backHref: string; backLabel: string }) {
  const c = m.counts
  const endpointsUp = m.endpoints.filter(e => e.ok).length
  const cronsOk = m.crons.filter(x => !x.stale && x.ok).length
  const allGood = m.db.up && endpointsUp === m.endpoints.length && cronsOk === m.crons.length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-semibold text-brand-900">System health</h1>
        <Link href={backHref} className="text-sm text-brand-700 hover:underline">{backLabel}</Link>
      </div>
      <div className="flex items-center gap-3 mb-8 text-sm flex-wrap">
        <span className={`inline-flex items-center gap-2 font-medium ${allGood ? 'text-brand-700' : 'text-coral-600'}`}>
          <Dot ok={allGood} /> {allGood ? 'All systems normal' : 'Attention needed'}
        </span>
        <span className="text-sand-400">·</span>
        <span className="text-sand-500">{new Date(m.ts).toLocaleString('en-GB')}</span>
        <span className="text-sand-400">·</span>
        <HealthAutoRefresh />
      </div>

      {/* Infrastructure */}
      <h2 className="font-medium text-sand-900 mb-3">Infrastructure</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Database" value={m.db.up ? `up · ${m.db.latencyMs}ms` : 'DOWN'} tone={m.db.up ? undefined : 'bad'} />
        <Stat label="Endpoints up" value={`${endpointsUp}/${m.endpoints.length}`} tone={endpointsUp === m.endpoints.length ? undefined : 'bad'} />
        <Stat label="Crons healthy" value={`${cronsOk}/${m.crons.length}`} tone={cronsOk === m.crons.length ? undefined : 'warn'} />
        <Stat label="Live visitors" value={m.plausible.currentVisitors ?? '—'} />
      </div>

      {/* Endpoints + Crons */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="font-medium text-sand-900 mb-3">Endpoints</h2>
          <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
            {m.endpoints.map((e, i) => (
              <div key={e.name} className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                <span className="flex items-center gap-2"><Dot ok={e.ok} /> {e.name}</span>
                <span className="text-sand-500">{e.status ?? 'no response'}{e.latencyMs != null ? ` · ${e.latencyMs}ms` : ''}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-medium text-sand-900 mb-3">Scheduled jobs</h2>
          <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
            {m.crons.map((x, i) => (
              <div key={x.name} className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                <span className="flex items-center gap-2"><Dot ok={!x.stale && x.ok} /> {x.name}</span>
                <span className={x.stale ? 'text-coral-600' : 'text-sand-500'}>{ago(x.ageMins)}{x.stale ? ' · stale' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business state */}
      <h2 className="font-medium text-sand-900 mb-3">Application</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Active tutors" value={c.teachersActive ?? 0} />
        <Stat label="Pending review" value={c.teachersPending ?? 0} tone={(c.teachersPending ?? 0) > 0 ? 'warn' : undefined} />
        <Stat label="Suspended" value={c.teachersSuspended ?? 0} tone={(c.teachersSuspended ?? 0) > 0 ? 'warn' : undefined} />
        <Stat label="Credential-suspended" value={c.credentialSuspended ?? 0} tone={(c.credentialSuspended ?? 0) > 0 ? 'warn' : undefined} />
        <Stat label="Active clients" value={c.activeMatches ?? 0} />
        <Stat label="Sessions today" value={c.sessionsToday ?? 0} />
        <Stat label="Upcoming (7d)" value={c.sessions7d ?? 0} />
        <Stat label="Active subscriptions" value={c.activeSubscriptions ?? 0} />
        <Stat label="Revenue today" value={fmtGBP(m.revenueTodayPence)} />
        <Stat label="Payments today" value={c.paymentsToday ?? 0} />
        <Stat label="Open complaints" value={c.openComplaints ?? 0} tone={(c.openComplaints ?? 0) > 0 ? 'bad' : undefined} />
        <Stat label="Pending invites" value={c.pendingInvites ?? 0} />
      </div>

      {/* E2E test suite */}
      <h2 id="e2e" className="font-medium text-sand-900 mb-3 scroll-mt-8">E2E test suite</h2>
      <div className="mb-8">
        <E2EPanel />
      </div>

      {/* Plausible + Support inbox */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium text-sand-900 mb-3">Traffic (Plausible)</h2>
          <div className="bg-white rounded-xl border border-sand-200 p-4 text-sm">
            {!m.plausible.configured ? (
              <p className="text-sand-500">Not configured — set <code className="text-xs bg-sand-100 px-1 rounded">PLAUSIBLE_API_KEY</code> + <code className="text-xs bg-sand-100 px-1 rounded">PLAUSIBLE_SITE_ID</code>.</p>
            ) : m.plausible.error ? (
              <p className="text-red-600">Error: {m.plausible.error}</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <Stat label="Visitors 30d" value={m.plausible.visitors30d ?? 0} />
                  <Stat label="Pageviews 30d" value={m.plausible.pageviews30d ?? 0} />
                  <Stat label="Today" value={m.plausible.visitorsToday ?? 0} />
                </div>
                {m.plausible.topPages && m.plausible.topPages.length > 0 && (
                  <div className="border-t border-sand-100 pt-2">
                    <p className="text-xs text-sand-400 mb-1">Top pages (7d)</p>
                    {m.plausible.topPages.map(p => (
                      <div key={p.page} className="flex justify-between text-xs text-sand-600 py-0.5">
                        <span className="truncate pr-2">{p.page}</span><span>{p.visitors}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-medium text-sand-900 mb-3">Support inbox</h2>
          <div className="bg-white rounded-xl border border-sand-200 p-4 text-sm">
            {!m.mailbox.configured ? (
              <p className="text-sand-500">Not configured — set <code className="text-xs bg-sand-100 px-1 rounded">IMAP_HOST</code> / <code className="text-xs bg-sand-100 px-1 rounded">IMAP_USER</code> / <code className="text-xs bg-sand-100 px-1 rounded">IMAP_PASSWORD</code>.</p>
            ) : m.mailbox.error ? (
              <p className="text-red-600">Error: {m.mailbox.error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Unread" value={m.mailbox.unread ?? 0} tone={(m.mailbox.unread ?? 0) > 15 ? 'bad' : (m.mailbox.unread ?? 0) > 0 ? 'warn' : undefined} />
                <Stat label="Total" value={m.mailbox.total ?? 0} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
