import 'server-only'
import { prisma } from './prisma'
import { hasPaidAccess } from './access'

export type EmailBrand = {
  practiceName: string
  logoUrl?: string      // Cloudinary only — validated at write and re-checked here
  color: string         // validated #rrggbb, falls back to fair-do teal
  footerLine?: string   // studio address / qualification line, shown above "Powered by fair-do"
  replyTo?: string      // replies route to the studio, not a fair-do inbox
}

// Returns the brand to use for a student-facing email sent on behalf of this
// teacher, or null (→ fair-do default) if: teacher not found, plan is free
// or lapsed, or brandEnabled is false.
export async function resolveEmailBrand(teacherId: string): Promise<EmailBrand | null> {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      firstName: true,
      lastName: true,
      practiceName: true,
      brandEnabled: true,
      brandLogoUrl: true,
      brandColor: true,
      brandFooterLine: true,
      replyToEmail: true,
      subscription: { select: { tier: true, status: true } },
      user: { select: { email: true } },
    },
  })
  if (!teacher) return null

  const isPaid = hasPaidAccess({ email: teacher.user?.email, subscription: teacher.subscription })
  if (!isPaid || !teacher.brandEnabled) return null

  const name = teacher.practiceName?.trim() || `${teacher.firstName} ${teacher.lastName}`
  // Re-validate at render time; DB write validation is belt-and-suspenders
  const color = /^#[0-9a-fA-F]{6}$/.test(teacher.brandColor ?? '') ? teacher.brandColor! : '#4f46e5'
  const logoUrl = teacher.brandLogoUrl?.startsWith('https://res.cloudinary.com/')
    ? teacher.brandLogoUrl
    : undefined

  return {
    practiceName: name,
    logoUrl,
    color,
    footerLine: teacher.brandFooterLine ?? undefined,
    replyTo: teacher.replyToEmail ?? undefined,
  }
}
