import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { getSchoolApiContext } from '@/lib/school'
import { mailGroupRuleSchema, normaliseMembers } from '@/lib/mail-groups'
import { z } from 'zod'

const memberSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
})

// PATCH body. rule:null explicitly converts the group to a manual list;
// members (when present) fully replaces the manual rows.
const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  rule: mailGroupRuleSchema.nullable().optional(),
  members: z.array(memberSchema).max(500).optional(),
  consentConfirmed: z.boolean().default(false),
})

function forbidden() {
  return Response.json({ error: 'School admin access required' }, { status: 403 })
}

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    const { id } = await params

    const existing = await prisma.mailGroup.findFirst({ where: { id, organisationId: org.id } })
    if (!existing) return Response.json({ error: 'Group not found' }, { status: 404 })

    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
    const { name, rule, members, consentConfirmed } = parsed.data

    const nextRule = rule === undefined ? (existing.rule as unknown) : rule
    if (nextRule && members && members.length > 0) {
      return Response.json({ error: 'A group is either rule-based or a manual list — not both.' }, { status: 400 })
    }
    // Plan §8: storing manually-entered emails needs an affirmed consent basis.
    if (members && members.length > 0 && !consentConfirmed) {
      return Response.json(
        { error: 'Please confirm you have a lawful basis (legitimate interest for school communications) for emailing the people on this list.' },
        { status: 400 },
      )
    }

    const rows = members ? normaliseMembers(members) : null
    try {
      const group = await prisma.$transaction(async tx => {
        if (rows) {
          await tx.mailGroupMember.deleteMany({ where: { mailGroupId: id } })
          if (rows.length > 0) {
            await tx.mailGroupMember.createMany({ data: rows.map(r => ({ ...r, mailGroupId: id })) })
          }
        } else if (rule) {
          // Switching to a rule clears any stale manual rows.
          await tx.mailGroupMember.deleteMany({ where: { mailGroupId: id } })
        }
        return tx.mailGroup.update({
          where: { id },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(rule !== undefined ? { rule: rule ?? Prisma.DbNull } : {}),
          },
          include: { members: { orderBy: { email: 'asc' } } },
        })
      })
      return Response.json({ group })
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

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    const { id } = await params

    const existing = await prisma.mailGroup.findFirst({ where: { id, organisationId: org.id } })
    if (!existing) return Response.json({ error: 'Group not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.mailGroupMember.deleteMany({ where: { mailGroupId: id } }),
      prisma.mailGroup.delete({ where: { id } }),
    ])
    return Response.json({ ok: true })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}
