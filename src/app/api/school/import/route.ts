import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { parseImportCsv, IMPORT_TEMPLATE_CSV, MAX_IMPORT_ROWS, type ImportRow } from '@/lib/school-import'
import { z } from 'zod'

// Student CSV import (M2.4). Semantics, in one place:
//
// - Columns: firstName,lastName,email,yearGroup,house,class1,class2,… (see
//   IMPORT_TEMPLATE_CSV; GET ?template=1 serves it).
// - Per row, matched by email (Student.contactEmail or the linked User.email):
//     · no student           → CREATE a managed student (userId null) in this org
//     · student in this org, or in no org → LINK (set organisationId; names are
//       NOT overwritten for existing students)
//     · student in another org → ERROR for that row
// - yearGroup / house / class names that don't exist yet are AUTO-CREATED
//   (case-insensitive name match; classes default to kind "form"). We chose
//   auto-create over erroring so a fresh school can import in one step; the
//   dry-run preview lists exactly what would be created.
// - commit=false (default) is a DRY RUN: per-row results, nothing written.
//   commit=true applies everything in one transaction.
// - Hard cap of MAX_IMPORT_ROWS (500) valid rows per request.

const bodySchema = z.object({
  csv: z.string().min(1).max(1_000_000),
  commit: z.boolean().optional(),
})

type ImportRowResult = {
  line: number
  email: string | null
  name: string | null
  action: 'create' | 'link' | 'error'
  reason?: string
}

function forbidden(e: unknown): Response {
  if (e instanceof SchoolAccessError) return Response.json({ error: e.message }, { status: e.status })
  throw e
}

export async function GET(req: Request) {
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    await requireSchoolAdmin(tenantScopedOrgId)
    const url = new URL(req.url)
    if (url.searchParams.get('template') !== '1') return Response.json({ error: 'Not found' }, { status: 404 })
    return new Response(IMPORT_TEMPLATE_CSV, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="fair-do-student-import-template.csv"',
      },
    })
  } catch (e) {
    return forbidden(e)
  }
}

export async function POST(req: Request) {
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const rl = await checkRateLimit(`school-import:${org.id}:${ip}`, { limit: 10, windowMs: 60_000 })
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
    const commit = parsed.data.commit === true

    const { rows, errors } = parseImportCsv(parsed.data.csv)
    if (rows.length > MAX_IMPORT_ROWS) {
      return Response.json(
        { error: `Too many rows — imports are capped at ${MAX_IMPORT_ROWS} students per request (this file has ${rows.length}). Please split the file and import in batches.` },
        { status: 400 },
      )
    }

    // Existing structure, matched case-insensitively by name.
    const [yearGroups, houses, classes] = await Promise.all([
      prisma.yearGroup.findMany({ where: { organisationId: org.id }, select: { id: true, name: true, order: true } }),
      prisma.house.findMany({ where: { organisationId: org.id }, select: { id: true, name: true } }),
      prisma.schoolClass.findMany({ where: { organisationId: org.id }, select: { id: true, name: true } }),
    ])
    const yearByName = new Map(yearGroups.map(y => [y.name.toLowerCase(), y.id]))
    const houseByName = new Map(houses.map(h => [h.name.toLowerCase(), h.id]))
    const classByName = new Map(classes.map(c => [c.name.toLowerCase(), c.id]))

    // Structure names in the file that don't exist yet → will be auto-created.
    const missing = { yearGroups: new Map<string, string>(), houses: new Map<string, string>(), classes: new Map<string, string>() }
    for (const r of rows) {
      if (r.yearGroup && !yearByName.has(r.yearGroup.toLowerCase())) missing.yearGroups.set(r.yearGroup.toLowerCase(), r.yearGroup)
      if (r.house && !houseByName.has(r.house.toLowerCase())) missing.houses.set(r.house.toLowerCase(), r.house)
      for (const c of r.classes) if (!classByName.has(c.toLowerCase())) missing.classes.set(c.toLowerCase(), c)
    }

    // Match existing students by email — contactEmail (managed) or User.email.
    const emails = rows.map(r => r.email)
    const existing = emails.length
      ? await prisma.student.findMany({
          where: {
            OR: [
              { contactEmail: { in: emails, mode: 'insensitive' } },
              { user: { email: { in: emails, mode: 'insensitive' } } },
            ],
          },
          orderBy: { createdAt: 'asc' },
          select: { id: true, organisationId: true, contactEmail: true, user: { select: { email: true } } },
        })
      : []
    const byEmail = new Map<string, (typeof existing)[number]>()
    for (const s of existing) {
      for (const email of [s.user?.email, s.contactEmail]) {
        const key = email?.toLowerCase()
        if (key && !byEmail.has(key)) byEmail.set(key, s) // first (oldest) match wins
      }
    }

    // Decide every row before writing anything.
    type Plan = { row: ImportRow; action: 'create' | 'link'; studentId?: string }
    const results: ImportRowResult[] = errors.map(e => ({ line: e.line, email: null, name: null, action: 'error' as const, reason: e.message }))
    const plans: Plan[] = []
    for (const row of rows) {
      const match = byEmail.get(row.email)
      if (match && match.organisationId && match.organisationId !== org.id) {
        results.push({ line: row.line, email: row.email, name: `${row.firstName} ${row.lastName}`, action: 'error', reason: 'This email belongs to a student at another organisation' })
        continue
      }
      const action = match ? 'link' : 'create'
      plans.push({ row, action, studentId: match?.id })
      results.push({ line: row.line, email: row.email, name: `${row.firstName} ${row.lastName}`, action })
    }
    results.sort((a, b) => a.line - b.line)

    const summary = {
      create: results.filter(r => r.action === 'create').length,
      link: results.filter(r => r.action === 'link').length,
      error: results.filter(r => r.action === 'error').length,
    }
    const willCreate = {
      yearGroups: [...missing.yearGroups.values()],
      houses: [...missing.houses.values()],
      classes: [...missing.classes.values()],
    }

    if (!commit) {
      return Response.json({ dryRun: true, results, summary, willCreate })
    }

    // Commit: one transaction — missing structure first, then students+profiles.
    const maxOrder = yearGroups.reduce((m, y) => Math.max(m, y.order), 0)
    await prisma.$transaction(
      async tx => {
        let order = maxOrder
        for (const name of missing.yearGroups.values()) {
          const created = await tx.yearGroup.create({ data: { organisationId: org.id, name, order: ++order } })
          yearByName.set(name.toLowerCase(), created.id)
        }
        for (const name of missing.houses.values()) {
          const created = await tx.house.create({ data: { organisationId: org.id, name } })
          houseByName.set(name.toLowerCase(), created.id)
        }
        for (const name of missing.classes.values()) {
          const created = await tx.schoolClass.create({ data: { organisationId: org.id, name } })
          classByName.set(name.toLowerCase(), created.id)
        }

        for (const plan of plans) {
          const { row } = plan
          let studentId = plan.studentId
          if (studentId) {
            // Link: pull the student into this org; never overwrite their name.
            await tx.student.update({ where: { id: studentId }, data: { organisationId: org.id } })
          } else {
            const created = await tx.student.create({
              data: {
                firstName: row.firstName,
                lastName: row.lastName,
                contactEmail: row.email,
                organisationId: org.id,
                consentGiven: true, // the school (data controller) asserts the consent basis for its pupils
                consentDate: new Date(),
              },
            })
            studentId = created.id
          }

          const yearGroupId = row.yearGroup ? yearByName.get(row.yearGroup.toLowerCase()) ?? null : null
          const houseId = row.house ? houseByName.get(row.house.toLowerCase()) ?? null : null
          const classIds = row.classes.flatMap(c => classByName.get(c.toLowerCase()) ?? [])
          await tx.studentOrgProfile.upsert({
            where: { studentId },
            create: { organisationId: org.id, studentId, yearGroupId, houseId, classIds },
            update: {
              organisationId: org.id,
              // Only overwrite assignments the file actually specifies.
              ...(row.yearGroup && { yearGroupId }),
              ...(row.house && { houseId }),
              ...(row.classes.length > 0 && { classIds }),
            },
          })
        }
      },
      { timeout: 60_000 }, // 500 rows × a few writes comfortably exceeds the 5s default
    )

    return Response.json({ dryRun: false, results, summary, created: willCreate })
  } catch (e) {
    return forbidden(e)
  }
}
