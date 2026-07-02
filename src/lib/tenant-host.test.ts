import { describe, it, expect } from 'vitest'
import { tenantFromHost } from './tenant-host'

describe('tenantFromHost', () => {
  it('resolves a tenant slug from a fair-do.com subdomain', () => {
    expect(tenantFromHost('stgeorges.fair-do.com')).toEqual({ kind: 'slug', slug: 'stgeorges' })
    expect(tenantFromHost('st-georges.fair-do.co.uk')).toEqual({ kind: 'slug', slug: 'st-georges' })
    expect(tenantFromHost('demo.localhost:3000')).toEqual({ kind: 'slug', slug: 'demo' })
  })

  it('treats apex, www and previews as the marketplace (null)', () => {
    expect(tenantFromHost('fair-do.com')).toBeNull()
    expect(tenantFromHost('www.fair-do.com')).toBeNull()
    expect(tenantFromHost('fair-do.co.uk')).toBeNull()
    expect(tenantFromHost('localhost:3000')).toBeNull()
    expect(tenantFromHost('fair-do-git-branch-faresay.vercel.app')).toBeNull()
    expect(tenantFromHost(null)).toBeNull()
    expect(tenantFromHost('')).toBeNull()
  })

  it('rejects reserved and malformed subdomains', () => {
    expect(tenantFromHost('www.fair-do.com')).toBeNull()
    expect(tenantFromHost('api.fair-do.com')).toBeNull()
    expect(tenantFromHost('admin.fair-do.com')).toBeNull()
    expect(tenantFromHost('a.b.fair-do.com')).toBeNull() // nested subdomains are not tenants
    expect(tenantFromHost('-bad.fair-do.com')).toBeNull()
    expect(tenantFromHost('UPPER.fair-do.com')).toEqual({ kind: 'slug', slug: 'upper' }) // hosts are case-insensitive
  })

  it('classifies unknown domains as custom-domain candidates', () => {
    expect(tenantFromHost('tutoring.stgeorges.sch.uk')).toEqual({ kind: 'custom-domain', domain: 'tutoring.stgeorges.sch.uk' })
    expect(tenantFromHost('tutoring.stgeorges.sch.uk:443')).toEqual({ kind: 'custom-domain', domain: 'tutoring.stgeorges.sch.uk' })
  })

  it('never treats IPs as tenants', () => {
    expect(tenantFromHost('127.0.0.1:3000')).toBeNull()
    expect(tenantFromHost('192.168.1.10')).toBeNull()
  })
})
