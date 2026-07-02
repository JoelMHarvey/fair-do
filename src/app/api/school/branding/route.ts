import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { SLUG_RE } from '@/lib/tenant-host'
import { isUniqueViolation } from '@/lib/slots'

// Empty string = clear the field. Validation mirrors src/lib/email-brand.ts /
// the teacher brand route: colours #rrggbb, logos Cloudinary-only, text fields
// stored and rendered as plain text.
const hexField = (label: string) =>
  z.string().refine(v => v === '' || /^#[0-9a-fA-F]{6}$/.test(v), `${label} must be a 6-digit hex e.g. #1d4ed8`)

const schema = z.object({
  slug: z
    .string()
    .max(63)
    .refine(v => v === '' || SLUG_RE.test(v.toLowerCase()), 'Subdomain can only use lowercase letters, numbers and dashes')
    .optional(),
  brandColor: hexField('Brand colour').optional(),
  accentColor: hexField('Accent colour').optional(),
  brandLogoUrl: z
    .string()
    .max(500)
    .refine(v => v === '' || v.startsWith('https://res.cloudinary.com/'), 'Logo must be a Cloudinary URL')
    .optional(),
  welcomeMessage: z.string().max(500, 'Welcome message must be 500 characters or fewer').optional(),
  footerLine: z.string().max(200, 'Footer line must be 200 characters or fewer').optional(),
})

export async function PATCH(req: Request) {
  let orgId: string
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    orgId = org.id
  } catch (e) {
    if (e instanceof SchoolAccessError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const d = parsed.data
  const clean = (v: string) => (v.trim() === '' ? null : v.trim())

  try {
    const org = await prisma.organisation.update({
      where: { id: orgId },
      data: {
        ...(d.slug !== undefined && { slug: clean(d.slug.toLowerCase()) }),
        ...(d.brandColor !== undefined && { brandColor: clean(d.brandColor) }),
        ...(d.accentColor !== undefined && { accentColor: clean(d.accentColor) }),
        ...(d.brandLogoUrl !== undefined && { brandLogoUrl: clean(d.brandLogoUrl) }),
        ...(d.welcomeMessage !== undefined && { welcomeMessage: clean(d.welcomeMessage) }),
        ...(d.footerLine !== undefined && { footerLine: clean(d.footerLine) }),
      },
      select: {
        slug: true, brandColor: true, accentColor: true, brandLogoUrl: true,
        welcomeMessage: true, footerLine: true,
      },
    })
    return NextResponse.json({ ok: true, org })
  } catch (e) {
    // slug is @unique — another school already claimed that subdomain.
    if (isUniqueViolation(e)) {
      return NextResponse.json({ error: 'That subdomain is already taken' }, { status: 409 })
    }
    throw e
  }
}
