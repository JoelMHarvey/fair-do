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
