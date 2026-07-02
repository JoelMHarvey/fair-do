import { prisma } from '@/lib/prisma'
import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { SUBJECTS, type Subject } from '@/lib/taxonomy'
import { z } from 'zod'

// Academic structure CRUD (M2.2) — year groups, houses, classes, subjects.
// One route, entity-discriminated bodies: GET lists everything; POST creates
// (or applies the UK-secondary preset); PATCH edits; DELETE removes and clears
// references in a transaction so nothing is orphaned.

const name = z.string().trim().min(1).max(100)
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a 6-digit hex e.g. #b91c1c')
// marketplaceKey must be a real marketplace subject (Teacher.subjects values)
// so tenant matching keeps working — free-text school names live in `name`.
const marketplaceKey = z.enum(SUBJECTS)
const examBoard = z.enum(['AQA', 'Edexcel', 'OCR', 'WJEC', 'Other'])

const createSchema = z.discriminatedUnion('entity', [
  z.object({ entity: z.literal('year'), name, order: z.number().int().min(0).max(1000).optional() }),
  z.object({ entity: z.literal('house'), name, color: hexColor.nullish() }),
  z.object({
    entity: z.literal('class'),
    name,
    kind: z.enum(['form', 'set']).optional(),
    yearGroupId: z.string().nullish(),
    subjectId: z.string().nullish(),
  }),
  z.object({ entity: z.literal('subject'), name, marketplaceKey: marketplaceKey.nullish(), examBoard: examBoard.nullish() }),
  z.object({ entity: z.literal('preset'), preset: z.literal('uk-secondary') }),
])

const patchSchema = z.discriminatedUnion('entity', [
  z.object({ entity: z.literal('year'), id: z.string().min(1), name: name.optional(), order: z.number().int().min(0).max(1000).optional() }),
  z.object({ entity: z.literal('house'), id: z.string().min(1), name: name.optional(), color: hexColor.nullish() }),
  z.object({
    entity: z.literal('class'),
    id: z.string().min(1),
    name: name.optional(),
    kind: z.enum(['form', 'set']).optional(),
    yearGroupId: z.string().nullish(),
    subjectId: z.string().nullish(),
  }),
  z.object({ entity: z.literal('subject'), id: z.string().min(1), name: name.optional(), marketplaceKey: marketplaceKey.nullish(), examBoard: examBoard.nullish() }),
])

const deleteSchema = z.object({
  entity: z.enum(['year', 'house', 'class', 'subject']),
  id: z.string().min(1),
})

// One-click "UK secondary preset": Years 7–13 plus the common GCSE/A-level
// subject list. marketplaceKey values are canonical taxonomy subjects (typed
// as Subject so a taxonomy rename breaks the build, not matching).
const UK_SECONDARY_YEARS = [7, 8, 9, 10, 11, 12, 13]
const UK_SECONDARY_SUBJECTS: { name: string; marketplaceKey: Subject }[] = [
  { name: 'Maths', marketplaceKey: 'Maths' },
  { name: 'Further Maths', marketplaceKey: 'Further Maths' },
  { name: 'English Language', marketplaceKey: 'English Language' },
  { name: 'English Literature', marketplaceKey: 'English Literature' },
  { name: 'Biology', marketplaceKey: 'Biology' },
  { name: 'Chemistry', marketplaceKey: 'Chemistry' },
  { name: 'Physics', marketplaceKey: 'Physics' },
  { name: 'Combined Science', marketplaceKey: 'Combined Science' },
  { name: 'Computer Science', marketplaceKey: 'Computer Science' },
  { name: 'History', marketplaceKey: 'History' },
  { name: 'Geography', marketplaceKey: 'Geography' },
  { name: 'Religious Studies', marketplaceKey: 'Religious Studies' },
  { name: 'French', marketplaceKey: 'French' },
  { name: 'Spanish', marketplaceKey: 'Spanish' },
  { name: 'German', marketplaceKey: 'German' },
  { name: 'Art & Design', marketplaceKey: 'Art & Design' },
  { name: 'Design & Technology', marketplaceKey: 'Design & Technology' },
  { name: 'Music', marketplaceKey: 'Music' },
  { name: 'Drama', marketplaceKey: 'Drama' },
  { name: 'Physical Education', marketplaceKey: 'Physical Education' },
  { name: 'Business Studies', marketplaceKey: 'Business Studies' },
  { name: 'Economics', marketplaceKey: 'Economics' },
  { name: 'Psychology', marketplaceKey: 'Psychology' },
  { name: 'Sociology', marketplaceKey: 'Sociology' },
]

function forbidden(e: unknown): Response {
  if (e instanceof SchoolAccessError) return Response.json({ error: e.message }, { status: e.status })
  throw e
}

async function admin() {
  const { tenantScopedOrgId } = await getSchoolApiContext()
  return requireSchoolAdmin(tenantScopedOrgId)
}

async function listStructure(orgId: string) {
  const [yearGroups, houses, classes, subjects] = await Promise.all([
    prisma.yearGroup.findMany({ where: { organisationId: orgId }, orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
    prisma.house.findMany({ where: { organisationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.schoolClass.findMany({ where: { organisationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.orgSubject.findMany({ where: { organisationId: orgId }, orderBy: { name: 'asc' } }),
  ])
  return { yearGroups, houses, classes, subjects }
}

export async function GET() {
  try {
    const { org } = await admin()
    return Response.json(await listStructure(org.id))
  } catch (e) {
    return forbidden(e)
  }
}

export async function POST(req: Request) {
  try {
    const { org } = await admin()
    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    const d = parsed.data

    if (d.entity === 'preset') {
      // Idempotent: skipDuplicates on the [organisationId, name] unique means
      // re-running fills gaps without touching what the admin already renamed.
      await prisma.$transaction([
        prisma.yearGroup.createMany({
          data: UK_SECONDARY_YEARS.map(n => ({ organisationId: org.id, name: `Year ${n}`, order: n })),
          skipDuplicates: true,
        }),
        prisma.orgSubject.createMany({
          data: UK_SECONDARY_SUBJECTS.map(s => ({ organisationId: org.id, name: s.name, marketplaceKey: s.marketplaceKey })),
          skipDuplicates: true,
        }),
      ])
      return Response.json(await listStructure(org.id), { status: 201 })
    }

    try {
      if (d.entity === 'year') {
        await prisma.yearGroup.create({ data: { organisationId: org.id, name: d.name, order: d.order ?? 0 } })
      } else if (d.entity === 'house') {
        await prisma.house.create({ data: { organisationId: org.id, name: d.name, color: d.color ?? null } })
      } else if (d.entity === 'class') {
        const refError = await validateClassRefs(org.id, d.yearGroupId, d.subjectId)
        if (refError) return Response.json({ error: refError }, { status: 400 })
        await prisma.schoolClass.create({
          data: { organisationId: org.id, name: d.name, kind: d.kind ?? 'form', yearGroupId: d.yearGroupId ?? null, subjectId: d.subjectId ?? null },
        })
      } else {
        await prisma.orgSubject.create({
          data: { organisationId: org.id, name: d.name, marketplaceKey: d.marketplaceKey ?? null, examBoard: d.examBoard ?? null },
        })
      }
    } catch (err) {
      if (isUniqueViolation(err)) return Response.json({ error: `"${'name' in d ? d.name : ''}" already exists` }, { status: 409 })
      throw err
    }
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

    // Every update is guarded by { id, organisationId } so a school can never
    // edit another tenant's rows — updateMany returns count 0 instead of throwing.
    const where = { id: d.id, organisationId: org.id }
    let count = 0
    try {
      if (d.entity === 'year') {
        count = (await prisma.yearGroup.updateMany({
          where,
          data: { ...(d.name !== undefined && { name: d.name }), ...(d.order !== undefined && { order: d.order }) },
        })).count
      } else if (d.entity === 'house') {
        count = (await prisma.house.updateMany({
          where,
          data: { ...(d.name !== undefined && { name: d.name }), ...(d.color !== undefined && { color: d.color }) },
        })).count
      } else if (d.entity === 'class') {
        const refError = await validateClassRefs(org.id, d.yearGroupId, d.subjectId)
        if (refError) return Response.json({ error: refError }, { status: 400 })
        count = (await prisma.schoolClass.updateMany({
          where,
          data: {
            ...(d.name !== undefined && { name: d.name }),
            ...(d.kind !== undefined && { kind: d.kind }),
            ...(d.yearGroupId !== undefined && { yearGroupId: d.yearGroupId }),
            ...(d.subjectId !== undefined && { subjectId: d.subjectId }),
          },
        })).count
      } else {
        count = (await prisma.orgSubject.updateMany({
          where,
          data: {
            ...(d.name !== undefined && { name: d.name }),
            ...(d.marketplaceKey !== undefined && { marketplaceKey: d.marketplaceKey }),
            ...(d.examBoard !== undefined && { examBoard: d.examBoard }),
          },
        })).count
      }
    } catch (err) {
      if (isUniqueViolation(err)) return Response.json({ error: 'That name is already in use' }, { status: 409 })
      throw err
    }
    if (count === 0) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (e) {
    return forbidden(e)
  }
}

export async function DELETE(req: Request) {
  try {
    const { org } = await admin()
    const parsed = deleteSchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
    const { entity, id } = parsed.data
    const where = { id, organisationId: org.id }

    if (entity === 'year') {
      const found = await prisma.yearGroup.findFirst({ where, select: { id: true } })
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 })
      // Clear references before deleting — students/classes stay, just unassigned.
      await prisma.$transaction([
        prisma.studentOrgProfile.updateMany({ where: { organisationId: org.id, yearGroupId: id }, data: { yearGroupId: null } }),
        prisma.schoolClass.updateMany({ where: { organisationId: org.id, yearGroupId: id }, data: { yearGroupId: null } }),
        prisma.yearGroup.delete({ where: { id } }),
      ])
    } else if (entity === 'house') {
      const found = await prisma.house.findFirst({ where, select: { id: true } })
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 })
      await prisma.$transaction([
        prisma.studentOrgProfile.updateMany({ where: { organisationId: org.id, houseId: id }, data: { houseId: null } }),
        prisma.house.delete({ where: { id } }),
      ])
    } else if (entity === 'class') {
      const found = await prisma.schoolClass.findFirst({ where, select: { id: true } })
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 })
      // classIds is a scalar array — pull the id out of each referencing profile
      // in the same transaction as the delete (school-sized, so per-row is fine).
      await prisma.$transaction(async tx => {
        const profiles = await tx.studentOrgProfile.findMany({
          where: { organisationId: org.id, classIds: { has: id } },
          select: { id: true, classIds: true },
        })
        for (const p of profiles) {
          await tx.studentOrgProfile.update({ where: { id: p.id }, data: { classIds: p.classIds.filter(c => c !== id) } })
        }
        await tx.schoolClass.delete({ where: { id } })
      })
    } else {
      const found = await prisma.orgSubject.findFirst({ where, select: { id: true } })
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 })
      await prisma.$transaction([
        prisma.schoolClass.updateMany({ where: { organisationId: org.id, subjectId: id }, data: { subjectId: null } }),
        prisma.orgSubject.delete({ where: { id } }),
      ])
    }
    return Response.json({ ok: true })
  } catch (e) {
    return forbidden(e)
  }
}

// A class's year group / subject must belong to the same org.
async function validateClassRefs(orgId: string, yearGroupId: string | null | undefined, subjectId: string | null | undefined): Promise<string | null> {
  if (yearGroupId) {
    const yg = await prisma.yearGroup.findFirst({ where: { id: yearGroupId, organisationId: orgId }, select: { id: true } })
    if (!yg) return 'Unknown year group'
  }
  if (subjectId) {
    const s = await prisma.orgSubject.findFirst({ where: { id: subjectId, organisationId: orgId }, select: { id: true } })
    if (!s) return 'Unknown subject'
  }
  return null
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2002'
}
