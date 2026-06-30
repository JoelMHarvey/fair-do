import 'server-only'
import { prisma } from '@/lib/prisma'

// Parent portal (P2-3). Parents pay the platform £4.99/mo directly for full
// visibility into their child's lessons. Ships behind a flag so it can roll out
// without disrupting the core booking flow.
export const PARENT_PORTAL_ENABLED = process.env.PARENT_PORTAL_ENABLED === 'true'
export const PARENT_PORTAL_PRICE_PENCE = 499

// Paid teacher tiers allowed to offer the parent portal (free-tier teachers can't —
// the platform can't sustain the £4.99 price against free users). Forward-compatible
// with the upcoming free/pro/studio rename.
const PARENT_PORTAL_TEACHER_TIERS = new Set(['pro', 'school', 'practice', 'clinic'])

export async function teacherCanOfferParentPortal(teacherId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { teacherId },
    select: { tier: true, status: true, addOns: true },
  })
  if (!sub) return false
  const onPaidTier = sub.status === 'active' && PARENT_PORTAL_TEACHER_TIERS.has(sub.tier)
  return onPaidTier || sub.addOns.includes('parent_portal')
}

// Billing is per-family (one £4.99/mo plan per parent account covers every child
// a tutor has linked). This is the soft abuse ceiling: beyond it the family still
// works but is flagged for review, catching one account hoarding unrelated kids.
export const FAMILY_SOFT_CAP = 6

// Distinct children (students) a parent currently follows.
export async function countFamilyChildren(parentUserId: string): Promise<number> {
  const links = await prisma.parentLink.findMany({
    where: { parentUserId, status: 'active' },
    select: { studentId: true },
  })
  return new Set(links.map(l => l.studentId)).size
}

// True when the parent's family subscription is active.
export async function parentHasActivePortal(parentUserId: string): Promise<boolean> {
  const sub = await prisma.parentSubscription.findUnique({
    where: { parentUserId },
    select: { status: true },
  })
  return sub?.status === 'active'
}

// Apply the family subscription state to every one of the parent's active links
// and refresh the soft-abuse flag. Call after subscribe/cancel, or after a new
// child is linked to an already-subscribed family.
export async function syncFamilyPortalAccess(parentUserId: string, active: boolean): Promise<void> {
  await prisma.parentLink.updateMany({
    where: { parentUserId, status: 'active' },
    data: { portalActive: active },
  })
  const childCount = await countFamilyChildren(parentUserId)
  const flagged = childCount > FAMILY_SOFT_CAP
  await prisma.parentSubscription.updateMany({
    where: { parentUserId },
    data: { flaggedForReview: flagged },
  })
  if (flagged) {
    console.warn(`[parent] family ${parentUserId} has ${childCount} children (> ${FAMILY_SOFT_CAP}) — flagged for review`)
  }
}

// URL-safe random invite token (Web Crypto, present in the Next.js runtime).
export function generateParentToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

// Group a parent's active links by child (student). A child may be linked to
// several tutors, so each returned child owns one or more links. Input order is
// preserved, so the first child stays the default tab.
export function groupLinksByChild<L extends { student: { id: string } }>(
  links: L[],
): { student: L['student']; links: L[] }[] {
  const children: { student: L['student']; links: L[] }[] = []
  for (const l of links) {
    const existing = children.find(c => c.student.id === l.student.id)
    if (existing) existing.links.push(l)
    else children.push({ student: l.student, links: [l] })
  }
  return children
}

// The signed-in Clerk user resolved to their parent links (active student access).
export async function getParentLinks(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  })
  if (!user || user.role !== 'PARENT') return null
  const links = await prisma.parentLink.findMany({
    where: { parentUserId: user.id, status: 'active' },
    include: { student: true },
    orderBy: { createdAt: 'asc' },
  })
  return { userId: user.id, links }
}
