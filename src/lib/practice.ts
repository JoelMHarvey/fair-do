import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Studio portal (Phase A). Additive and OFF by default — set PRACTICE_PORTAL_ENABLED=true
// to expose the teacher-led student/studio surfaces. The marketplace is unaffected either way.
export const PRACTICE_PORTAL_ENABLED = process.env.PRACTICE_PORTAL_ENABLED === 'true'

// The public tutor directory ("Find a tutor"). Hidden until enough
// teachers are onboarded (an empty directory is a poor first impression).
// Flip on with NEXT_PUBLIC_DIRECTORY_ENABLED=true when ready.
export const DIRECTORY_ENABLED = process.env.NEXT_PUBLIC_DIRECTORY_ENABLED === 'true'

const INVITE_TTL_DAYS = 14

export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
}

// URL-safe random token for student invites. Uses Web Crypto (present in the Next.js runtime).
export function generateInviteToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'studio'
}

// A unique public booking handle for the teacher's self-booking page (/p/<slug>).
export async function ensurePracticeSlug(t: { id: string; practiceSlug: string | null; practiceName: string | null; firstName: string; lastName: string }): Promise<string> {
  if (t.practiceSlug) return t.practiceSlug
  const base = slugify(t.practiceName || `${t.firstName}-${t.lastName}`)
  let slug = base
  for (let i = 0; i < 6; i++) {
    const taken = await prisma.teacher.findUnique({ where: { practiceSlug: slug }, select: { id: true } })
    if (!taken) break
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
  }
  await prisma.teacher.update({ where: { id: t.id }, data: { practiceSlug: slug } }).catch(() => {})
  return slug
}

// The signed-in user's teacher record, or null. Convenience for studio routes/pages.
export async function getTherapistForUser() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })
  return user?.teacher ?? null
}

// A student's reachable email: their account email if they have one, else the managed contact email.
// Managed (accountless) students have no User, so this can be null.
export function clientEmail(
  client: { contactEmail?: string | null; user?: { email: string } | null },
): string | null {
  return client.user?.email ?? client.contactEmail ?? null
}

// How a studio is named to students — the teacher's chosen studio name, else their own name.
export function practiceDisplayName(t: { practiceName: string | null; firstName: string; lastName: string }): string {
  return t.practiceName?.trim() || `${t.firstName} ${t.lastName}`
}

// The rate that applies to a given relationship: per-student override, else the teacher's standard rate.
export function effectiveRatePence(
  match: { customRatePence: number | null } | null,
  therapist: { sessionRatePence: number },
): number {
  return match?.customRatePence ?? therapist.sessionRatePence
}

// The fair-do commission (in pence) on a processed payment, from the teacher's subscription.
// fair-do takes NO session commission — teachers keep what they charge. Kept as a seam so a
// future tier could reintroduce a fee, but every tier (and the no-subscription case) is 0 today.
export function commissionPence(
  amountPence: number,
  subscription: { status: string; commissionBps: number } | null,
): { bps: number; feePence: number } {
  const active = !!subscription && (subscription.status === 'active' || subscription.status === 'trialing')
  const bps = active ? subscription!.commissionBps : 0
  return { bps, feePence: Math.round((amountPence * bps) / 10000) }
}
