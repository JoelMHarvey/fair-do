import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

// Member management (M2.3): list org students, add a managed (accountless)
// student, and assign year / house / classes via StudentOrgProfile.

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
    const students = await prisma.student.findMany({
      where: { organisationId: org.id },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactEmail: true,
        user: { select: { email: true } },
        orgProfile: { select: { yearGroupId: true, houseId: true, classIds: true } },
      },
    })
    return Response.json({
      students: students.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.user?.email ?? s.contactEmail,
        managed: !s.user,
        yearGroupId: s.orgProfile?.yearGroupId ?? null,
        houseId: s.orgProfile?.houseId ?? null,
        classIds: s.orgProfile?.classIds ?? [],
      })),
    })
  } catch (e) {
    return forbidden(e)
  }
}

const createSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  contactEmail: z.string().email().max(200).optional().or(z.literal('')),
})

// Add a single managed (accountless) student, mirroring the practice-portal
// managed-student route — userId stays null; the school, as data controller
// for its pupils, asserts the consent basis.
export async function POST(req: Request) {
  try {
    const { org } = await admin()

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const rl = await checkRateLimit(`school-member:${org.id}:${ip}`, { limit: 30, windowMs: 60_000 })
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    const contactEmail = parsed.data.contactEmail?.trim().toLowerCase() || null

    if (contactEmail) {
      const dupe = await prisma.student.findFirst({
        where: {
          organisationId: org.id,
          OR: [{ contactEmail: { equals: contactEmail, mode: 'insensitive' } }, { user: { email: { equals: contactEmail, mode: 'insensitive' } } }],
        },
        select: { id: true },
      })
      if (dupe) return Response.json({ error: 'A student with that email is already a member' }, { status: 409 })
    }

    const student = await prisma.student.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        contactEmail,
        organisationId: org.id,
        consentGiven: true,
        consentDate: new Date(),
      },
    })
    return Response.json({ studentId: student.id }, { status: 201 })
  } catch (e) {
    return forbidden(e)
  }
}

const assignSchema = z.object({
  studentId: z.string().min(1),
  yearGroupId: z.string().min(1).nullable().optional(),
  houseId: z.string().min(1).nullable().optional(),
  classIds: z.array(z.string().min(1)).max(50).optional(),
})

// Assign / change a member's year, house and classes (upserts StudentOrgProfile).
export async function PATCH(req: Request) {
  try {
    const { org } = await admin()
    const parsed = assignSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    const d = parsed.data

    const student = await prisma.student.findFirst({ where: { id: d.studentId, organisationId: org.id }, select: { id: true } })
    if (!student) return Response.json({ error: 'Not a member of this school' }, { status: 404 })

    // Every referenced structure row must belong to THIS org.
    if (d.yearGroupId) {
      const yg = await prisma.yearGroup.findFirst({ where: { id: d.yearGroupId, organisationId: org.id }, select: { id: true } })
      if (!yg) return Response.json({ error: 'Unknown year group' }, { status: 400 })
    }
    if (d.houseId) {
      const h = await prisma.house.findFirst({ where: { id: d.houseId, organisationId: org.id }, select: { id: true } })
      if (!h) return Response.json({ error: 'Unknown house' }, { status: 400 })
    }
    if (d.classIds && d.classIds.length > 0) {
      const count = await prisma.schoolClass.count({ where: { id: { in: d.classIds }, organisationId: org.id } })
      if (count !== new Set(d.classIds).size) return Response.json({ error: 'Unknown class' }, { status: 400 })
    }

    // A profile left over from a previous school is replaced wholesale so no
    // cross-org year/house/class references survive; otherwise only the
    // provided fields change.
    const existing = await prisma.studentOrgProfile.findUnique({ where: { studentId: d.studentId }, select: { organisationId: true } })
    const stale = existing !== null && existing.organisationId !== org.id
    await prisma.studentOrgProfile.upsert({
      where: { studentId: d.studentId },
      create: {
        organisationId: org.id,
        studentId: d.studentId,
        yearGroupId: d.yearGroupId ?? null,
        houseId: d.houseId ?? null,
        classIds: d.classIds ?? [],
      },
      update: stale
        ? { organisationId: org.id, yearGroupId: d.yearGroupId ?? null, houseId: d.houseId ?? null, classIds: d.classIds ?? [] }
        : {
            ...(d.yearGroupId !== undefined && { yearGroupId: d.yearGroupId }),
            ...(d.houseId !== undefined && { houseId: d.houseId }),
            ...(d.classIds !== undefined && { classIds: d.classIds }),
          },
    })
    return Response.json({ ok: true })
  } catch (e) {
    return forbidden(e)
  }
}
