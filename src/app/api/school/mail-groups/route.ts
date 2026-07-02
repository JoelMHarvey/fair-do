import { prisma } from '@/lib/prisma'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { getSchoolApiContext } from '@/lib/school'
import { mailGroupRuleSchema, normaliseMembers, resolveMailGroupRule } from '@/lib/mail-groups'
import { z } from 'zod'

const memberSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
})

const createSchema = z.object({
  name: z.string().min(1).max(80),
  rule: mailGroupRuleSchema.nullish(),
  members: z.array(memberSchema).max(500).default([]),
  // Plan §8: manual members require the admin to affirm the consent basis
  // (legitimate interest for school comms) before we store third-party emails.
  consentConfirmed: z.boolean().default(false),
})

function forbidden() {
  return Response.json({ error: 'School admin access required' }, { status: 403 })
}

// GET /api/school/mail-groups → the org's groups (+ manual member rows).
// GET /api/school/mail-groups?preview=1&audience=…[&yearGroupId=…&houseId=…&classId=…]
//   → live member-count preview for an (unsaved) rule: { count }.
export async function GET(req: Request) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)

    const url = new URL(req.url)
    if (url.searchParams.get('preview') === '1') {
      const parsed = mailGroupRuleSchema.safeParse({
        audience: url.searchParams.get('audience') ?? undefined,
        yearGroupId: url.searchParams.get('yearGroupId') || undefined,
        houseId: url.searchParams.get('houseId') || undefined,
        classId: url.searchParams.get('classId') || undefined,
      })
      if (!parsed.success) return Response.json({ error: 'Invalid rule' }, { status: 400 })
      const recipients = await resolveMailGroupRule(org.id, parsed.data)
      return Response.json({ count: recipients.length })
    }

    const groups = await prisma.mailGroup.findMany({
      where: { organisationId: org.id },
      include: { members: { orderBy: { email: 'asc' } } },
      orderBy: { name: 'asc' },
    })
    return Response.json({ groups })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}

// POST /api/school/mail-groups → create a group (rule-based OR manual, not both).
export async function POST(req: Request) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
    const { name, rule, members, consentConfirmed } = parsed.data

    if (rule && members.length > 0) {
      return Response.json({ error: 'A group is either rule-based or a manual list — not both.' }, { status: 400 })
    }
    if (!rule && members.length > 0 && !consentConfirmed) {
      return Response.json(
        { error: 'Please confirm you have a lawful basis (legitimate interest for school communications) for emailing the people on this list.' },
        { status: 400 },
      )
    }

    const rows = normaliseMembers(members)
    try {
      const group = await prisma.mailGroup.create({
        data: {
          organisationId: org.id,
          name,
          rule: rule ?? undefined,
          ...(rows.length > 0 ? { members: { create: rows } } : {}),
        },
        include: { members: true },
      })
      return Response.json({ group }, { status: 201 })
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'P2002') {
        return Response.json({ error: 'A group with that name already exists.' }, { status: 409 })
      }
      throw e
    }
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}
