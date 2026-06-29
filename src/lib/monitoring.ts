import { prisma } from '@/lib/prisma'
import { getPlausibleStats, type PlausibleStats } from '@/lib/plausible'
import { getSupportMailboxStats, type MailboxStats } from '@/lib/mailbox'
import { getCronRuns, CRON_CADENCE_MINS } from '@/lib/cron-run'

export type CronHealth = { name: string; lastRunAt: string | null; ok: boolean; ageMins: number | null; cadenceMins: number | null; stale: boolean }
export type EndpointHealth = { name: string; url: string; ok: boolean; status: number | null; latencyMs: number | null }
export type Metrics = {
  ts: string
  db: { up: boolean; latencyMs: number | null }
  counts: Record<string, number>
  revenueTodayPence: number
  crons: CronHealth[]
  endpoints: EndpointHealth[]
  plausible: PlausibleStats
  mailbox: MailboxStats
}

function startOfToday(): Date { const d = new Date(); d.setHours(0, 0, 0, 0); return d }

async function dbHealth(): Promise<{ up: boolean; latencyMs: number | null }> {
  const t = performance.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { up: true, latencyMs: Math.round(performance.now() - t) }
  } catch {
    return { up: false, latencyMs: null }
  }
}

async function counts(now: Date) {
  const today = startOfToday()
  const in7d = new Date(now.getTime() + 7 * 864e5)
  const [
    teachersActive, teachersPending, teachersSuspended, credentialSuspended,
    activeMatches, sessionsToday, sessionsUpcoming, sessions7d,
    openComplaints, pendingInvites, activeSubscriptions, paidToday,
  ] = await prisma.$transaction([
    prisma.teacher.count({ where: { status: 'ACTIVE' } }),
    prisma.teacher.count({ where: { status: 'PENDING' } }),
    prisma.teacher.count({ where: { status: 'SUSPENDED' } }),
    prisma.teacher.count({ where: { credentialSuspended: true } }),
    prisma.match.count({ where: { active: true } }),
    prisma.session.count({ where: { status: 'SCHEDULED', scheduledAt: { gte: today, lt: new Date(today.getTime() + 864e5) } } }),
    prisma.session.count({ where: { status: 'SCHEDULED', scheduledAt: { gte: now } } }),
    prisma.session.count({ where: { status: 'SCHEDULED', scheduledAt: { gte: now, lt: in7d } } }),
    prisma.complaint.count({ where: { status: { in: ['open', 'reviewing'] } } }),
    prisma.studentInvite.count({ where: { status: 'pending', expiresAt: { gt: now } } }),
    prisma.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.payment.aggregate({ _sum: { amountTotalPence: true }, _count: true, where: { status: 'paid', createdAt: { gte: today } } }),
  ])
  return {
    counts: {
      teachersActive, teachersPending, teachersSuspended, credentialSuspended,
      activeMatches, sessionsToday, sessionsUpcoming, sessions7d,
      openComplaints, pendingInvites, activeSubscriptions,
      paymentsToday: paidToday._count,
    },
    revenueTodayPence: paidToday._sum.amountTotalPence ?? 0,
  }
}

function cronHealth(runs: Awaited<ReturnType<typeof getCronRuns>>, now: Date): CronHealth[] {
  return Object.keys(CRON_CADENCE_MINS).map(name => {
    const r = runs.find(x => x.name === name)
    const cadence = CRON_CADENCE_MINS[name]
    if (!r) return { name, lastRunAt: null, ok: false, ageMins: null, cadenceMins: cadence, stale: true }
    const ageMins = Math.round((now.getTime() - r.lastRunAt.getTime()) / 60000)
    // stale if older than ~2.5× its expected cadence
    return { name, lastRunAt: r.lastRunAt.toISOString(), ok: r.ok, ageMins, cadenceMins: cadence, stale: ageMins > cadence * 2.5 }
  })
}

// MUST stay cheap and MUST NOT include /api/metrics or /admin/health — those call
// collectMetrics, so probing them would recurse and fan out exponentially.
const ENDPOINTS = [
  { name: 'health', path: '/api/health' },
  { name: 'home', path: '/' },
  { name: 'directory', path: '/tutors' },
  { name: 'pricing', path: '/pricing' },
]

async function endpointHealth(): Promise<EndpointHealth[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faresay.com'
  return Promise.all(ENDPOINTS.map(async e => {
    const url = `${base}${e.path}`
    const t = performance.now()
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(8000), cache: 'no-store' })
      // 401 means an auth-gated route answered (still "up"); anything <400 is healthy.
      return { name: e.name, url, ok: res.status < 400 || res.status === 401, status: res.status, latencyMs: Math.round(performance.now() - t) }
    } catch {
      return { name: e.name, url, ok: false, status: null, latencyMs: null }
    }
  }))
}

// Aggregate the whole picture. Each source is independent + failure-isolated, so a
// down integration degrades its panel without breaking the rest.
async function computeMetrics(): Promise<Metrics> {
  const now = new Date()
  const [db, cnt, runs, plausible, mailbox, endpoints] = await Promise.all([
    dbHealth(),
    counts(now).catch(() => ({ counts: {} as Record<string, number>, revenueTodayPence: 0 })),
    getCronRuns(),
    getPlausibleStats(),
    getSupportMailboxStats(),
    endpointHealth(),
  ])
  return {
    ts: now.toISOString(),
    db,
    counts: cnt.counts,
    revenueTodayPence: cnt.revenueTodayPence,
    crons: cronHealth(runs, now),
    endpoints,
    plausible,
    mailbox,
  }
}

// Short-TTL in-process cache. collectMetrics fans out to ~9 outbound calls
// (DB, IMAP, 4 Plausible, 4 self-fetches); the read callers (admin dashboard
// auto-refresh + every Grafana panel scrape) hammer it, so memoise for a window
// and share the in-flight promise. The alerts cron passes { fresh: true } for an
// accurate, uncached read.
const TTL_MS = 60_000
let memo: { promise: Promise<Metrics>; expires: number } | null = null

export async function collectMetrics(opts: { fresh?: boolean } = {}): Promise<Metrics> {
  if (!opts.fresh && memo && Date.now() < memo.expires) return memo.promise
  const promise = computeMetrics()
  if (!opts.fresh) memo = { promise, expires: Date.now() + TTL_MS }
  try {
    return await promise
  } catch (e) {
    memo = null
    throw e
  }
}
