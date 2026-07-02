import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { Organisation } from '@prisma/client'

// Enterprise portal master switch — ships dark, same convention as
// PARENT_PORTAL_ENABLED / STUDIO_PORTAL_ENABLED.
export function enterprisePortalEnabled(): boolean {
  return process.env.ENTERPRISE_PORTAL_ENABLED === 'true'
}

// Plans that unlock the tenant portal (Organisation.plan).
const PORTAL_PLANS = new Set(['portal', 'portal_plus'])

export function isPortalPlan(plan: string | null | undefined): boolean {
  return !!plan && PORTAL_PLANS.has(plan)
}

// Tiny TTL cache so every request on a tenant host doesn't re-query the org.
// Per-instance (serverless = per-lambda) which is fine at this scale; entries
// expire quickly so admin edits show up within a minute.
const TENANT_TTL_MS = 60_000
const tenantCache = new Map<string, { org: Organisation | null; at: number }>()

async function lookupTenant(key: string, where: { slug: string } | { customDomain: string }): Promise<Organisation | null> {
  const hit = tenantCache.get(key)
  if (hit && Date.now() - hit.at < TENANT_TTL_MS) return hit.org
  const org = await prisma.organisation.findFirst({ where: { ...where, active: true } })
  const valid = org && isPortalPlan(org.plan) ? org : null
  tenantCache.set(key, { org: valid, at: Date.now() })
  return valid
}

/** Test hook — clears the module-level TTL cache. */
export function clearTenantCache() {
  tenantCache.clear()
}

/**
 * Resolve the tenant (school) for the current request, or null on the apex
 * marketplace. Reads the x-tenant-slug / x-tenant-domain headers set by
 * proxy.ts — never client input. React-cached per request.
 */
export const getTenant = cache(async (): Promise<Organisation | null> => {
  if (!enterprisePortalEnabled()) return null
  const h = await headers()
  const slug = h.get('x-tenant-slug')
  if (slug) return lookupTenant(`slug:${slug}`, { slug })
  const domain = h.get('x-tenant-domain')
  if (domain) return lookupTenant(`domain:${domain}`, { customDomain: domain })
  return null
})

// Typed view over Organisation.settings (JSON). Absent keys → safe defaults.
export type TenantSettings = {
  // What happens when a booking lands on a school holiday/INSET day.
  bookingPolicy: 'off' | 'warn' | 'block'
  // Whether tenant students see the open marketplace or only school-approved tutors.
  marketplace: 'approved' | 'open'
}

export function tenantSettings(org: Pick<Organisation, 'settings'> | null): TenantSettings {
  const raw = (org?.settings ?? {}) as Partial<TenantSettings>
  return {
    bookingPolicy: raw.bookingPolicy === 'warn' || raw.bookingPolicy === 'block' ? raw.bookingPolicy : 'off',
    marketplace: raw.marketplace === 'open' ? 'open' : 'approved',
  }
}
