import 'server-only'
import { prisma } from './prisma'
import { hasPaidAccess } from './access'
import { enterprisePortalEnabled, isPortalPlan } from './tenant'

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

// ── Enterprise portal (fair-do for Schools) — org branding on emails ─────────

// Returns the school's brand for an email to one of its students/parents, or
// null (→ fair-do default) if: the enterprise portal is dark, the org isn't on
// a portal plan, is inactive, or has no branding set. Same validation rules as
// teacher branding above.
export async function resolveOrgEmailBrand(ref: { studentId?: string; orgId?: string }): Promise<EmailBrand | null> {
  if (!enterprisePortalEnabled()) return null

  let orgId = ref.orgId
  if (!orgId && ref.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: ref.studentId },
      select: { organisationId: true },
    })
    orgId = student?.organisationId ?? undefined
  }
  if (!orgId) return null

  const org = await prisma.organisation.findUnique({
    where: { id: orgId },
    select: { name: true, active: true, plan: true, brandLogoUrl: true, brandColor: true, footerLine: true },
  })
  if (!org?.active || !isPortalPlan(org.plan)) return null

  const color = /^#[0-9a-fA-F]{6}$/.test(org.brandColor ?? '') ? org.brandColor! : null
  const logoUrl = org.brandLogoUrl?.startsWith('https://res.cloudinary.com/')
    ? org.brandLogoUrl
    : undefined
  if (!color && !logoUrl) return null // branding not set → fair-do default

  return {
    practiceName: org.name,
    logoUrl,
    color: color ?? '#4f46e5',
    footerLine: org.footerLine ?? undefined,
  }
}

// Brand for a student-facing transactional email: the teacher's paid branding
// wins when present, else the student's school (tenant) branding, else null →
// fair-do default.
export async function resolveStudentEmailBrand(teacherId: string, studentId: string): Promise<EmailBrand | null> {
  return (await resolveEmailBrand(teacherId)) ?? resolveOrgEmailBrand({ studentId })
}
