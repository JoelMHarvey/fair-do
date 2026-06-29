// Plausible Stats API reader. Env-gated: returns { configured: false } and never
// throws if PLAUSIBLE_API_KEY / PLAUSIBLE_SITE_ID aren't set.
// Generate a key in Plausible → Settings → API Keys; site id is your domain (faresay.com).

const BASE = process.env.PLAUSIBLE_API_HOST ?? 'https://plausible.io'

export type PlausibleStats = {
  configured: boolean
  visitors30d?: number
  pageviews30d?: number
  visitorsToday?: number
  currentVisitors?: number
  topPages?: { page: string; visitors: number }[]
  error?: string
}

function cfg() {
  const key = process.env.PLAUSIBLE_API_KEY
  const site = process.env.PLAUSIBLE_SITE_ID
  return key && site ? { key, site } : null
}

// Collapse identifier/token path segments to route templates so capability URLs
// (e.g. /forms/<secret-token>) and client/therapist identifiers never leak from
// the analytics provider into the metrics surface. Strips query strings too.
function sanitizePath(raw: string): string {
  const path = raw.split('?')[0]
    .replace(/^\/forms\/[^/]+/, '/forms/[token]')
    .replace(/^\/practice\/join\/[^/]+/, '/practice/join/[token]')
    .replace(/^\/r\/[^/]+/, '/r/[code]')
    .replace(/^\/session\/[^/]+/, '/session/[id]')
    .replace(/^\/book\/[^/]+/, '/book/[id]')
    .replace(/^\/messages\/[^/]+/, '/messages/[id]')
    .replace(/^\/p\/[^/]+/, '/p/[slug]')
    .replace(/^\/tutors\/[^/]+/, '/tutors/[id]')
    .replace(/^\/teacher\/clients\/[^/]+/, '/teacher/clients/[id]')
  // Generic backstop: collapse any remaining long opaque segment (cuid/hex/token).
  return path.split('/').map(seg => (/^[A-Za-z0-9_-]{16,}$/.test(seg) ? '[id]' : seg)).join('/')
}

// Map an upstream error to a generic, non-sensitive code (never echo host/key/url).
function errorCode(e: unknown): string {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
  if (msg.includes('401') || msg.includes('403') || msg.includes('auth')) return 'auth_failed'
  if (msg.includes('429')) return 'rate_limited'
  if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout'
  return 'upstream_error'
}

async function api(path: string, params: Record<string, string>, key: string): Promise<unknown> {
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`plausible ${res.status}`)
  return res.json()
}

export async function getPlausibleStats(): Promise<PlausibleStats> {
  const c = cfg()
  if (!c) return { configured: false }
  try {
    const [agg, realtime, today, pages] = await Promise.all([
      api('/api/v1/stats/aggregate', { site_id: c.site, period: '30d', metrics: 'visitors,pageviews' }, c.key) as Promise<{ results: { visitors: { value: number }; pageviews: { value: number } } }>,
      api('/api/v1/stats/realtime/visitors', { site_id: c.site }, c.key) as Promise<number>,
      api('/api/v1/stats/aggregate', { site_id: c.site, period: 'day', metrics: 'visitors' }, c.key) as Promise<{ results: { visitors: { value: number } } }>,
      api('/api/v1/stats/breakdown', { site_id: c.site, period: '7d', property: 'event:page', limit: '5', metrics: 'visitors' }, c.key) as Promise<{ results: { page: string; visitors: number }[] }>,
    ])
    return {
      configured: true,
      visitors30d: agg.results.visitors.value,
      pageviews30d: agg.results.pageviews.value,
      visitorsToday: today.results.visitors.value,
      currentVisitors: typeof realtime === 'number' ? realtime : undefined,
      topPages: pages.results?.map(r => ({ page: sanitizePath(r.page), visitors: r.visitors })) ?? [],
    }
  } catch (e) {
    console.error('[plausible] stats failed', e)
    return { configured: true, error: errorCode(e) }
  }
}
