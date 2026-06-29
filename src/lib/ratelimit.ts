import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting with a durable, shared backend when configured (Upstash Redis),
// so per-IP limits hold GLOBALLY across serverless instances. Falls back to a
// best-effort in-memory limiter when UPSTASH_REDIS_REST_URL/TOKEN are unset
// (fine for local/preview; not a real control on multi-instance serverless).

// ── In-memory fallback ────────────────────────────────────────────────
type RateLimitEntry = { count: number; reset: number }
const store = new Map<string, RateLimitEntry>()
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) if (entry.reset < now) store.delete(key)
  }, 5 * 60 * 1000)
}
function memoryCheck(key: string, opts: { limit: number; windowMs: number }) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || entry.reset < now) {
    store.set(key, { count: 1, reset: now + opts.windowMs })
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 }
  }
  if (entry.count >= opts.limit) return { allowed: false, remaining: 0, retryAfterMs: entry.reset - now }
  entry.count++
  return { allowed: true, remaining: opts.limit - entry.count, retryAfterMs: 0 }
}

// ── Upstash (shared) backend ──────────────────────────────────────────
let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null
  return redis
}
// One Ratelimit instance per (limit, window) — callers use varied budgets.
const limiters = new Map<string, Ratelimit>()
function getLimiter(r: Redis, limit: number, windowMs: number): Ratelimit {
  const k = `${limit}:${windowMs}`
  let rl = limiters.get(k)
  if (!rl) {
    rl = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`), prefix: 'frl' })
    limiters.set(k, rl)
  }
  return rl
}

export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const r = getRedis()
  if (r) {
    try {
      const res = await getLimiter(r, opts.limit, opts.windowMs).limit(key)
      return { allowed: res.success, remaining: res.remaining, retryAfterMs: res.success ? 0 : Math.max(0, res.reset - Date.now()) }
    } catch (e) {
      console.error('[ratelimit] upstash error — falling back to memory', e)
    }
  }
  return memoryCheck(key, opts)
}

export function rateLimitResponse(retryAfterMs: number) {
  return new Response('Too many requests', {
    status: 429,
    headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
  })
}
