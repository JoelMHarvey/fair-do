import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { findFirst, headerStore } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  headerStore: new Map<string, string>(),
}))
vi.mock('@/lib/prisma', () => ({ prisma: { organisation: { findFirst } } }))
vi.mock('next/headers', () => ({
  headers: async () => ({ get: (k: string) => headerStore.get(k) ?? null }),
}))

// React's cache() memoises per request; in tests there is no request scope, so
// stub it to identity and rely on clearTenantCache() between cases.
vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: <T>(fn: T) => fn }
})

import { getTenant, tenantSettings, isPortalPlan, clearTenantCache } from './tenant'

const org = (over: Record<string, unknown> = {}) => ({
  id: 'org_1', name: 'St Georges', slug: 'stgeorges', plan: 'portal', active: true, settings: null, ...over,
})

beforeEach(() => {
  vi.stubEnv('ENTERPRISE_PORTAL_ENABLED', 'true')
  headerStore.clear()
  findFirst.mockReset()
  clearTenantCache()
})
afterEach(() => vi.unstubAllEnvs())

describe('getTenant', () => {
  it('returns null with no tenant headers (apex)', async () => {
    expect(await getTenant()).toBeNull()
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('resolves an active portal-plan org by slug', async () => {
    headerStore.set('x-tenant-slug', 'stgeorges')
    findFirst.mockResolvedValue(org())
    const t = await getTenant()
    expect(t?.id).toBe('org_1')
    expect(findFirst).toHaveBeenCalledWith({ where: { slug: 'stgeorges', active: true } })
  })

  it('rejects orgs that are not on a portal plan', async () => {
    headerStore.set('x-tenant-slug', 'stgeorges')
    findFirst.mockResolvedValue(org({ plan: 'school' }))
    expect(await getTenant()).toBeNull()
  })

  it('resolves by custom domain when no slug header is present', async () => {
    headerStore.set('x-tenant-domain', 'tutoring.stgeorges.sch.uk')
    findFirst.mockResolvedValue(org({ plan: 'portal_plus' }))
    const t = await getTenant()
    expect(t?.plan).toBe('portal_plus')
    expect(findFirst).toHaveBeenCalledWith({ where: { customDomain: 'tutoring.stgeorges.sch.uk', active: true } })
  })

  it('is dark when the flag is off', async () => {
    vi.stubEnv('ENTERPRISE_PORTAL_ENABLED', 'false')
    headerStore.set('x-tenant-slug', 'stgeorges')
    expect(await getTenant()).toBeNull()
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('caches lookups for the TTL window', async () => {
    headerStore.set('x-tenant-slug', 'stgeorges')
    findFirst.mockResolvedValue(org())
    await getTenant()
    await getTenant()
    expect(findFirst).toHaveBeenCalledTimes(1)
  })
})

describe('tenantSettings', () => {
  it('defaults to safe values', () => {
    expect(tenantSettings(null)).toEqual({ bookingPolicy: 'off', marketplace: 'approved' })
    expect(tenantSettings({ settings: {} })).toEqual({ bookingPolicy: 'off', marketplace: 'approved' })
  })
  it('honours valid stored values and ignores junk', () => {
    expect(tenantSettings({ settings: { bookingPolicy: 'block', marketplace: 'open' } })).toEqual({ bookingPolicy: 'block', marketplace: 'open' })
    expect(tenantSettings({ settings: { bookingPolicy: 'nuke', marketplace: 'everything' } })).toEqual({ bookingPolicy: 'off', marketplace: 'approved' })
  })
})

describe('isPortalPlan', () => {
  it('recognises portal plans only', () => {
    expect(isPortalPlan('portal')).toBe(true)
    expect(isPortalPlan('portal_plus')).toBe(true)
    expect(isPortalPlan('school')).toBe(false)
    expect(isPortalPlan(null)).toBe(false)
  })
})
