import 'server-only'
import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import { getMySchool, type SchoolAccess } from '@/lib/org'
import { getTenant, enterprisePortalEnabled } from '@/lib/tenant'

// School console (/school/*) page context: the signed-in user's school + role.
// On a tenant host the school MUST be that tenant (a member of school A can
// never administer school B through B's subdomain). React-cached per request so
// layout + page share one resolution.
export const getSchoolContext = cache(async (): Promise<SchoolAccess> => {
  if (!enterprisePortalEnabled()) notFound()
  const tenant = await getTenant()
  const access = await getMySchool(tenant?.id)
  if (!access) redirect('/dashboard')
  return access
})

// API-route variant for /api/school/* handlers: resolves the tenant from the
// request headers and scopes the role check to it. Throws SchoolAccessError
// (status 403) — callers map it to a NextResponse.
export async function getSchoolApiContext(): Promise<{ tenantScopedOrgId: string | undefined }> {
  const tenant = await getTenant()
  return { tenantScopedOrgId: tenant?.id }
}
