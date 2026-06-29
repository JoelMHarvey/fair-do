import { prisma } from '@/lib/prisma'
import { collectMetrics } from '@/lib/monitoring'
import { recordCronRun } from '@/lib/cron-run'
import { sendOpsAlert } from '@/lib/email'
import { bearerOk } from '@/lib/bearer'

// Every 15 min: threshold check → emails the founder on state change. Dedup via
// AlertState so a sustained breach emails once (re-pings after ALERT_REPEAT_HOURS)
// and sends an all-clear on resolve. Guarded by CRON_SECRET.
export const dynamic = 'force-dynamic'

// Parse an env number, falling back to the default for unset/empty/non-finite values
// (a typo'd ALERT_* must not silently disable a threshold via NaN comparisons).
const num = (k: string, d: number) => {
  const v = process.env[k]
  if (v == null || v === '') return d
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
const REPEAT_HOURS = num('ALERT_REPEAT_HOURS', 12)

type Breach = { key: string; message: string; value: string }

// Human-readable label for an all-clear, derived from the internal alert key.
function resolvedLabel(key: string): string {
  if (key === 'db_down') return 'Database recovered'
  if (key === 'db_slow') return 'Database latency back to normal'
  if (key === 'unread_mail') return 'Support inbox back under threshold'
  if (key === 'open_complaints') return 'Open complaints back under threshold'
  if (key.startsWith('endpoint_down:')) return `Endpoint "${key.slice('endpoint_down:'.length)}" recovered`
  if (key.startsWith('cron_stale:')) return `Cron "${key.slice('cron_stale:'.length)}" running again`
  return `${key} resolved`
}

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Opportunistic cleanup of expired unconfirmed self-bookings.
  await prisma.pendingSelfBooking.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {})

  // Fresh (uncached) read so alerting reflects the real current state.
  const m = await collectMetrics({ fresh: true })
  const breaches: Breach[] = []

  if (!m.db.up) breaches.push({ key: 'db_down', message: 'Database is unreachable', value: 'down' })
  else if (m.db.latencyMs != null && m.db.latencyMs > num('ALERT_DB_LATENCY_MS', 1500))
    breaches.push({ key: 'db_slow', message: `Database slow (${m.db.latencyMs}ms)`, value: `${m.db.latencyMs}` })

  for (const e of m.endpoints) {
    if (!e.ok) breaches.push({ key: `endpoint_down:${e.name}`, message: `Endpoint ${e.name} failing (${e.status ?? 'no response'})`, value: `${e.status ?? 'err'}` })
  }

  // Only the externally-scheduled jobs; the alerts cron itself is implicitly fresh.
  for (const c of m.crons) {
    if (c.name === 'alerts') continue
    if (c.stale) breaches.push({ key: `cron_stale:${c.name}`, message: `Cron "${c.name}" stale (last ran ${c.ageMins == null ? 'never' : `${c.ageMins}m ago`})`, value: `${c.ageMins ?? 'never'}` })
  }

  const unreadLimit = num('ALERT_UNREAD_MAIL', 15)
  if (m.mailbox.configured && m.mailbox.unread != null && m.mailbox.unread > unreadLimit)
    breaches.push({ key: 'unread_mail', message: `Support inbox has ${m.mailbox.unread} unread (> ${unreadLimit})`, value: `${m.mailbox.unread}` })

  const complaintLimit = num('ALERT_OPEN_COMPLAINTS', 3)
  if ((m.counts.openComplaints ?? 0) >= complaintLimit)
    breaches.push({ key: 'open_complaints', message: `${m.counts.openComplaints} open complaints (>= ${complaintLimit})`, value: `${m.counts.openComplaints}` })

  const now = new Date()
  let toEmailFiring: string[] = []
  let toEmailResolved: string[] = []

  // Reconcile against stored state — fire on transition / re-fire after REPEAT_HOURS.
  // This needs the DB. If the DB is the thing that's down, fall back to paging the
  // founder directly with the current breaches (sendOpsAlert has no DB dependency),
  // so the most important alert — "database unreachable" — can still fire.
  try {
    const states = await prisma.alertState.findMany()
    const breachKeys = new Set(breaches.map(b => b.key))
    for (const b of breaches) {
      const s = states.find(x => x.key === b.key)
      const repeatDue = s?.lastFiredAt ? (now.getTime() - s.lastFiredAt.getTime()) > REPEAT_HOURS * 3600_000 : true
      if (!s || !s.firing || repeatDue) {
        toEmailFiring.push(b.message)
        await prisma.alertState.upsert({
          where: { key: b.key },
          create: { key: b.key, firing: true, lastFiredAt: now, lastValue: b.value },
          update: { firing: true, lastFiredAt: now, lastValue: b.value },
        })
      }
    }
    for (const s of states) {
      if (s.firing && !breachKeys.has(s.key)) {
        toEmailResolved.push(resolvedLabel(s.key))
        await prisma.alertState.update({ where: { key: s.key }, data: { firing: false } })
      }
    }
  } catch (e) {
    console.error('[cron/alerts] AlertState unavailable — paging directly', e)
    toEmailFiring = breaches.map(b => b.message)
    toEmailResolved = []
  }

  let emailed = false
  if (toEmailFiring.length || toEmailResolved.length) {
    const to = process.env.ALERT_EMAIL || process.env.FOUNDER_EMAIL || 'joelmharvey@gmail.com'
    try {
      await sendOpsAlert({ to, firing: toEmailFiring, resolved: toEmailResolved })
      emailed = true
    } catch (e) { console.error('[cron/alerts] email failed', e) }
  }

  await recordCronRun('alerts', m.db.up, undefined, JSON.stringify({ breaches: breaches.length, emailed }))
  return Response.json({ breaches: breaches.map(b => b.key), firing: toEmailFiring.length, resolved: toEmailResolved.length, emailed })
}
