import { prisma } from '@/lib/prisma'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { getSchoolApiContext } from '@/lib/school'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
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

    const existing = await prisma.orgCalendar.findFirst({ where: { id, organisationId: org.id } })
    if (!existing) return Response.json({ error: 'Calendar not found' }, { status: 404 })

    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

    try {
      const calendar = await prisma.orgCalendar.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.color !== undefined ? { color: parsed.data.color } : {}),
        },
      })
      return Response.json({ calendar })
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'P2002') {
        return Response.json({ error: 'A calendar with that name already exists.' }, { status: 409 })
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

    const existing = await prisma.orgCalendar.findFirst({ where: { id, organisationId: org.id } })
    if (!existing) return Response.json({ error: 'Calendar not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.orgCalendarEvent.deleteMany({ where: { calendarId: id } }),
      prisma.orgCalendar.delete({ where: { id } }),
    ])
    return Response.json({ ok: true })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}
