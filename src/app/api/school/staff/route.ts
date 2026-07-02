import { prisma } from '@/lib/prisma'
import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { z } from 'zod'

// Staff directory CRUD (M2.5). Directory entries only — never platform
// accounts. Ordering is a plain integer moved with up/down swaps.

const VISIBILITIES = ['students', 'parents', 'tutors', 'public'] as const

const fieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  department: z.string().trim().max(120).nullish(),
  email: z.string().email().max(200),
  phone: z.string().trim().max(30).nullish(),
  photoUrl: z
    .string()
    .refine(v => v === '' || v.startsWith('https://res.cloudinary.com/'), 'Photo must be a Cloudinary URL')
    .nullish(),
  isDSL: z.boolean().optional(),
  isTutoringCoordinator: z.boolean().optional(),
  visibility: z.enum(VISIBILITIES).optional(),
})

const patchSchema = fieldsSchema.partial().extend({
  id: z.string().min(1),
  move: z.enum(['up', 'down']).optional(),
})

function forbidden(e: unknown): Response {
  if (e instanceof SchoolAccessError) return Response.json({ error: e.message }, { status: e.status })
  throw e
}

async function admin() {
  const { tenantScopedOrgId } = await getSchoolApiContext()
  return requireSchoolAdmin(tenantScopedOrgId)
}

export async function GET() {
  try {
    const { org } = await admin()
    const staff = await prisma.staffContact.findMany({
      where: { organisationId: org.id },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
    return Response.json({ staff })
  } catch (e) {
    return forbidden(e)
  }
}

export async function POST(req: Request) {
  try {
    const { org } = await admin()
    const parsed = fieldsSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    const d = parsed.data

    const last = await prisma.staffContact.findFirst({
      where: { organisationId: org.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    await prisma.staffContact.create({
      data: {
        organisationId: org.id,
        name: d.name,
        title: d.title,
        department: d.department || null,
        email: d.email.toLowerCase(),
        phone: d.phone || null,
        photoUrl: d.photoUrl || null,
        isDSL: d.isDSL ?? false,
        isTutoringCoordinator: d.isTutoringCoordinator ?? false,
        visibility: d.visibility ?? 'parents',
        order: (last?.order ?? -1) + 1,
      },
    })
    return Response.json({ ok: true }, { status: 201 })
  } catch (e) {
    return forbidden(e)
  }
}

export async function PATCH(req: Request) {
  try {
    const { org } = await admin()
    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    const d = parsed.data

    const contact = await prisma.staffContact.findFirst({ where: { id: d.id, organisationId: org.id } })
    if (!contact) return Response.json({ error: 'Not found' }, { status: 404 })

    if (d.move) {
      // Swap order with the nearest neighbour in that direction (no-op at the ends).
      const neighbour = await prisma.staffContact.findFirst({
        where: { organisationId: org.id, order: d.move === 'up' ? { lt: contact.order } : { gt: contact.order } },
        orderBy: { order: d.move === 'up' ? 'desc' : 'asc' },
      })
      if (neighbour) {
        await prisma.$transaction([
          prisma.staffContact.update({ where: { id: contact.id }, data: { order: neighbour.order } }),
          prisma.staffContact.update({ where: { id: neighbour.id }, data: { order: contact.order } }),
        ])
      }
      return Response.json({ ok: true })
    }

    await prisma.staffContact.update({
      where: { id: contact.id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.title !== undefined && { title: d.title }),
        ...(d.department !== undefined && { department: d.department || null }),
        ...(d.email !== undefined && { email: d.email.toLowerCase() }),
        ...(d.phone !== undefined && { phone: d.phone || null }),
        ...(d.photoUrl !== undefined && { photoUrl: d.photoUrl || null }),
        ...(d.isDSL !== undefined && { isDSL: d.isDSL }),
        ...(d.isTutoringCoordinator !== undefined && { isTutoringCoordinator: d.isTutoringCoordinator }),
        ...(d.visibility !== undefined && { visibility: d.visibility }),
      },
    })
    return Response.json({ ok: true })
  } catch (e) {
    return forbidden(e)
  }
}

export async function DELETE(req: Request) {
  try {
    const { org } = await admin()
    const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

    const { count } = await prisma.staffContact.deleteMany({ where: { id: parsed.data.id, organisationId: org.id } })
    if (count === 0) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (e) {
    return forbidden(e)
  }
}
