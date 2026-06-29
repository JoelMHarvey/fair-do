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
const PARENT_PORTAL_TEACHER_TIERS = new Set(['practice', 'clinic', 'pro', 'studio'])

export async function teacherCanOfferParentPortal(teacherId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { teacherId },
    select: { tier: true, status: true, addOns: true },
  })
  if (!sub) return false
  const onPaidTier = sub.status === 'active' && PARENT_PORTAL_TEACHER_TIERS.has(sub.tier)
  return onPaidTier || sub.addOns.includes('parent_portal')
}

// URL-safe random invite token (Web Crypto, present in the Next.js runtime).
export function generateParentToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
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
