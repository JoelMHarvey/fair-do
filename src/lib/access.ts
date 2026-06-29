import 'server-only'
import { isAdminEmail } from './admin'

const PAID_TIERS = new Set(['practice', 'clinic'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export function isPaidSubscription(sub: { tier: string; status: string } | null | undefined): boolean {
  return !!sub && ACTIVE_STATUSES.has(sub.status) && PAID_TIERS.has(sub.tier)
}

// Full paid-feature access: a live paid plan (Practice/Clinic) OR a full-access
// allowlist account (admin/founder emails — see lib/admin.ts), which gets every
// feature without paying.
export function hasPaidAccess(opts: {
  email?: string | null
  subscription?: { tier: string; status: string } | null
}): boolean {
  return isAdminEmail(opts.email) || isPaidSubscription(opts.subscription)
}
