// Practice-portal subscription tiers (Stripe Billing). Prices for paid tiers live in
// Stripe; their Price IDs are supplied via env so this stays config-driven. Commission is
// the per-transaction fee (basis points) applied to payments the tutor processes —
// lower on higher tiers (the "free + commission, paid buys it down" model).
export type TierId = 'free' | 'pro' | 'school' | 'enterprise'

// Legacy → current id map (the tiers were starter/practice/clinic). Keeps existing
// Subscription.tier values and old Stripe metadata resolving after the rename.
const LEGACY_TIER_IDS: Record<string, TierId> = { starter: 'free', practice: 'pro', clinic: 'school' }
export function normalizeTierId(id: string | null | undefined): string | null | undefined {
  return id ? (LEGACY_TIER_IDS[id] ?? id) : id
}

export type Tier = {
  id: TierId
  name: string
  pricePence: number      // display price (paid tiers); 0 = free
  commissionBps: number   // basis points taken on processed payments (100 = 1%)
  priceEnv: string | null // env var holding the Stripe Price ID (null = free, no Stripe sub)
  blurb: string
  features: string[]
}

export const PRACTICE_TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    pricePence: 0,
    commissionBps: 0,
    priceEnv: null,
    blurb: 'Free to start. 0% commission on your own students.',
    features: ['Up to 10 active students', 'Calendar, invites & video', 'Card payments & payouts', '0% commission on own students'],
  },
  {
    id: 'pro',
    name: 'Pro',
    pricePence: 2900,
    commissionBps: 0,
    priceEnv: 'STRIPE_PRICE_PRO',
    blurb: 'For a full-time solo tutor.',
    features: ['Unlimited students', 'Per-student rates & packages', 'Branded email & invite letterhead', 'Targeted student messaging & invites', 'Earnings insights & analytics', 'In-app AI assistant', 'Reminders & calendar sync', '0% commission on own students'],
  },
  {
    id: 'school',
    name: 'School',
    pricePence: 7900,
    commissionBps: 0,
    priceEnv: 'STRIPE_PRICE_SCHOOL',
    blurb: 'For tutoring teams with multiple tutors.',
    features: ['Everything in Pro', 'Multiple tutors', 'Team-wide reporting', '0% commission'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pricePence: 0,
    commissionBps: 0,
    priceEnv: null,
    blurb: 'Custom pricing for larger schools and tutoring businesses.',
    features: ['Everything in School Pro', 'Unlimited tutors', 'Volume pricing', 'Dedicated support', 'UK data residency SLA'],
  },
]

export function tierById(id: string | null | undefined): Tier | undefined {
  const norm = normalizeTierId(id)
  return PRACTICE_TIERS.find(t => t.id === norm)
}

export function priceIdForTier(id: string): string | null {
  const t = tierById(id)
  if (!t?.priceEnv) return null
  return process.env[t.priceEnv] ?? null
}

export function commissionBpsForTier(id: string | null | undefined): number {
  return tierById(id)?.commissionBps ?? 0
}

// Commission by booking source (P2 pricing). Tutors keep 100% of their own students
// (invited/added by hand); the platform takes 10% only on directory-sourced
// (marketplace) bookings — half of Tutorful/MyTutor. Independent of subscription tier.
export const MARKETPLACE_COMMISSION_BPS = 1000 // 10%

export function commissionForSource(amountPence: number, source: string | null | undefined): { bps: number; feePence: number } {
  const bps = source === 'marketplace' ? MARKETPLACE_COMMISSION_BPS : 0
  return { bps, feePence: Math.round((amountPence * bps) / 10000) }
}

// Reverse lookup: which tier owns a given Stripe Price ID (for plan changes made
// in the Stripe billing portal). Returns undefined for free/unknown prices.
export function tierByPriceId(priceId: string | null | undefined): Tier | undefined {
  if (!priceId) return undefined
  return PRACTICE_TIERS.find(t => t.priceEnv && process.env[t.priceEnv] === priceId)
}

// Defensive read of a Stripe subscription's period end — its location has moved across
// API versions, so check the top level then the first item.
export function subscriptionPeriodEnd(s: unknown): Date | null {
  const anyS = s as { current_period_end?: number; items?: { data?: { current_period_end?: number }[] } }
  const ts = anyS.current_period_end ?? anyS.items?.data?.[0]?.current_period_end
  return ts ? new Date(ts * 1000) : null
}
