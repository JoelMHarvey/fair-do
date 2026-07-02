// Host → tenant parsing for the enterprise school portal (docs/ENTERPRISE-SCHOOLS-PLAN.md).
// Edge-safe: imported by proxy.ts (middleware), so NO prisma / server-only imports here.
// The middleware only PARSES the host; the DB lookup happens server-side in lib/tenant.ts.

// Base domains whose subdomains are tenant slugs ({slug}.fair-do.com).
// localhost supports {slug}.localhost:3000 in dev.
const BASE_DOMAINS = ['fair-do.com', 'fair-do.co.uk', 'localhost']

// Subdomains that are never tenants.
const RESERVED_SLUGS = new Set(['www', 'api', 'app', 'admin', 'mail', 'cdn', 'staging', 'preview', 'assets'])

// Slugs are set by admins, but validate defensively: url-safe, no leading/trailing dash.
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export type TenantHostMatch =
  | { kind: 'slug'; slug: string }
  | { kind: 'custom-domain'; domain: string }
  | null

/**
 * Classify a request Host header.
 * - "{slug}.fair-do.com"  → { kind: 'slug', slug }
 * - apex / www / reserved / *.vercel.app previews → null (the marketplace)
 * - any other domain      → { kind: 'custom-domain', domain } (Portal+ CNAME, M4)
 */
export function tenantFromHost(hostHeader: string | null | undefined): TenantHostMatch {
  if (!hostHeader) return null
  const host = hostHeader.split(':')[0].toLowerCase().replace(/\.$/, '')
  if (!host || host === 'localhost' || /^[\d.]+$/.test(host) || host.includes(']')) return null

  // Vercel previews (fair-do-git-*.vercel.app) are never tenants.
  if (host.endsWith('.vercel.app')) return null

  for (const base of BASE_DOMAINS) {
    if (host === base || host === `www.${base}`) return null
    if (host.endsWith(`.${base}`)) {
      const sub = host.slice(0, -(base.length + 1))
      // Only one level of subdomain is a tenant (a.b.fair-do.com is not).
      if (sub.includes('.')) return null
      if (RESERVED_SLUGS.has(sub) || !SLUG_RE.test(sub)) return null
      return { kind: 'slug', slug: sub }
    }
  }

  // Unrecognised domain pointed at us → candidate custom domain (verified in lib/tenant.ts).
  return { kind: 'custom-domain', domain: host }
}
