import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Resolve the organisation the signed-in user administers.
 * The org contact (matching contactEmail) is the admin; domain members get read access too,
 * but only the contact can top up. Returns { org, isContact } or null.
 */
export async function getMyOrg(): Promise<{ org: NonNullable<Awaited<ReturnType<typeof prisma.organisation.findFirst>>>; isContact: boolean } | null> {
  const { userId } = await auth()
  if (!userId) return null

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase()
  if (!email) return null
  const domain = email.split('@')[1]

  const byContact = await prisma.organisation.findFirst({ where: { contactEmail: { equals: email, mode: 'insensitive' }, active: true } })
  if (byContact) return { org: byContact, isContact: true }

  if (domain) {
    const byDomain = await prisma.organisation.findFirst({ where: { domain, active: true } })
    if (byDomain) return { org: byDomain, isContact: false }
  }
  return null
}

// ── Enterprise portal (fair-do for Schools) — school-side roles ──────────────
// School roles are ADDITIVE to the platform UserRole (a parent can also be the
// school's tutoring coordinator). The org contact is always an ADMIN — the
// lockout-proof failsafe, mirroring lib/admin.ts; invited admins/staff get an
// OrgMembership row.

export type SchoolRole = 'ADMIN' | 'STAFF'

export type SchoolAccess = {
  org: NonNullable<Awaited<ReturnType<typeof prisma.organisation.findFirst>>>
  role: SchoolRole
  isContact: boolean
}

/**
 * Resolve the signed-in user's school + role, or null if they administer no
 * school. When orgId is given, access is checked against THAT org only —
 * every /school and /api/school handler must pass the tenant's org id so a
 * member of school A can never act on school B.
 */
export async function getMySchool(orgId?: string): Promise<SchoolAccess | null> {
  const { userId } = await auth()
  if (!userId) return null

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase()

  // Contact-email match → ADMIN (failsafe, no membership row needed).
  if (email) {
    const byContact = await prisma.organisation.findFirst({
      where: { contactEmail: { equals: email, mode: 'insensitive' }, active: true, ...(orgId ? { id: orgId } : {}) },
    })
    if (byContact) return { org: byContact, role: 'ADMIN', isContact: true }
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!dbUser) return null
  const membership = await prisma.orgMembership.findFirst({
    where: { userId: dbUser.id, ...(orgId ? { organisationId: orgId } : {}), organisation: { active: true } },
    include: { organisation: true },
  })
  if (!membership) return null
  const role: SchoolRole = membership.role === 'STAFF' ? 'STAFF' : 'ADMIN'
  return { org: membership.organisation, role, isContact: false }
}

/** School admin or throws — for API routes. Pass the tenant org id when on a tenant host. */
export async function requireSchoolAdmin(orgId?: string): Promise<SchoolAccess> {
  const access = await getMySchool(orgId)
  if (!access || access.role !== 'ADMIN') throw new SchoolAccessError()
  return access
}

/** Any school membership (admin or staff) or throws. */
export async function requireSchoolMember(orgId?: string): Promise<SchoolAccess> {
  const access = await getMySchool(orgId)
  if (!access) throw new SchoolAccessError()
  return access
}

export class SchoolAccessError extends Error {
  status = 403
  constructor() {
    super('School admin access required')
  }
}
