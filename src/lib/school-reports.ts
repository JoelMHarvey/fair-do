import 'server-only'
import { prisma } from '@/lib/prisma'

// Reports v1 (M2.7): lessons, attendance and spend for a school's students,
// broken down by year group and by tutor.
//
// Attribution decision: neither Session nor Match carries a subject, and
// Teacher.subjects is multi-valued ("Maths, Physics") — so per-SUBJECT
// attribution of a lesson would be guesswork. We break down by TUTOR instead
// and show each tutor's subject list as context; OrgSubject-level reporting
// can land once bookings record the subject.
//
// Spend follows the /org page approach (sum Payment.amountTotalPence, status
// 'paid'), widened to every paid payment for the school's students plus any
// payment the school's pool funded (fundingOrgId) even if the student has
// since left the org.

export type ReportRange = 'month' | 'term'

// UK term approximation until M3 school calendars land: autumn from 1 Sep,
// spring from 1 Jan, summer from 1 Apr.
export function reportRangeStart(range: ReportRange, now = new Date()): Date {
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  const m = now.getMonth()
  if (m >= 8) return new Date(now.getFullYear(), 8, 1)
  if (m >= 3) return new Date(now.getFullYear(), 3, 1)
  return new Date(now.getFullYear(), 0, 1)
}

export type ReportRow = {
  key: string
  label: string
  detail: string | null // tutor rows: their marketplace subjects
  booked: number // sessions in range that weren't cancelled
  completed: number
  noShows: number
  attendancePct: number | null // completed / (completed + noShows); null with no data
  spendPence: number
}

export type SchoolReport = {
  range: ReportRange
  start: Date
  students: number
  totals: Omit<ReportRow, 'key' | 'label' | 'detail'>
  byYearGroup: ReportRow[]
  byTeacher: ReportRow[]
}

function emptyRow(key: string, label: string, detail: string | null = null): ReportRow {
  return { key, label, detail, booked: 0, completed: 0, noShows: 0, attendancePct: null, spendPence: 0 }
}

function finalise(rows: Map<string, ReportRow>): ReportRow[] {
  const out = [...rows.values()]
  for (const r of out) {
    const attended = r.completed + r.noShows
    r.attendancePct = attended > 0 ? Math.round((r.completed / attended) * 100) : null
  }
  return out
}

export async function getSchoolReport(orgId: string, range: ReportRange, now = new Date()): Promise<SchoolReport> {
  const start = reportRangeStart(range, now)

  const students = await prisma.student.findMany({
    where: { organisationId: orgId },
    select: {
      id: true,
      orgProfile: { select: { yearGroup: { select: { id: true, name: true, order: true } } } },
    },
  })
  const studentIds = students.map(s => s.id)
  const yearOf = new Map(students.map(s => [s.id, s.orgProfile?.yearGroup ?? null]))

  const [sessions, payments] = await Promise.all([
    studentIds.length
      ? prisma.session.findMany({
          where: {
            studentId: { in: studentIds },
            scheduledAt: { gte: start, lte: now },
            status: { not: 'CANCELLED' },
          },
          select: {
            studentId: true,
            status: true,
            teacher: { select: { id: true, firstName: true, lastName: true, subjects: true } },
          },
        })
      : [],
    prisma.payment.findMany({
      where: {
        status: 'paid',
        createdAt: { gte: start, lte: now },
        OR: [...(studentIds.length ? [{ studentId: { in: studentIds } }] : []), { fundingOrgId: orgId }],
      },
      select: {
        studentId: true,
        amountTotalPence: true,
        session: { select: { teacher: { select: { id: true, firstName: true, lastName: true, subjects: true } } } },
      },
    }),
  ])

  const byYearGroup = new Map<string, ReportRow>()
  const byTeacher = new Map<string, ReportRow>()
  const totals = emptyRow('total', 'Total')

  const yearRow = (studentId: string) => {
    const yg = yearOf.get(studentId) ?? null
    const key = yg?.id ?? 'unassigned'
    if (!byYearGroup.has(key)) byYearGroup.set(key, emptyRow(key, yg?.name ?? 'Unassigned'))
    return byYearGroup.get(key)!
  }
  const teacherRow = (teacher: { id: string; firstName: string; lastName: string; subjects: string[] } | null) => {
    const key = teacher?.id ?? 'other'
    if (!byTeacher.has(key)) {
      byTeacher.set(
        key,
        teacher
          ? emptyRow(key, `${teacher.firstName} ${teacher.lastName}`, teacher.subjects.join(', ') || null)
          : emptyRow(key, 'Packages & other payments', null),
      )
    }
    return byTeacher.get(key)!
  }

  for (const s of sessions) {
    const rows = [totals, yearRow(s.studentId), teacherRow(s.teacher)]
    for (const r of rows) {
      r.booked++
      if (s.status === 'COMPLETED') r.completed++
      if (s.status === 'NO_SHOW') r.noShows++
    }
  }
  for (const p of payments) {
    totals.spendPence += p.amountTotalPence
    yearRow(p.studentId).spendPence += p.amountTotalPence
    teacherRow(p.session?.teacher ?? null).spendPence += p.amountTotalPence
  }

  // Year groups in school order (unassigned last); tutors by spend then lessons.
  const yearOrder = new Map(students.flatMap(s => (s.orgProfile?.yearGroup ? [[s.orgProfile.yearGroup.id, s.orgProfile.yearGroup.order] as const] : [])))
  const yearRows = finalise(byYearGroup).sort((a, b) => {
    if (a.key === 'unassigned') return 1
    if (b.key === 'unassigned') return -1
    return (yearOrder.get(a.key) ?? 0) - (yearOrder.get(b.key) ?? 0) || a.label.localeCompare(b.label)
  })
  const teacherRows = finalise(byTeacher).sort((a, b) => b.spendPence - a.spendPence || b.completed - a.completed)

  finalise(new Map([['total', totals]]))
  const { booked, completed, noShows, attendancePct, spendPence } = totals
  return {
    range,
    start,
    students: students.length,
    totals: { booked, completed, noShows, attendancePct, spendPence },
    byYearGroup: yearRows,
    byTeacher: teacherRows,
  }
}

// CSV export — same rows as the page renders.
export function schoolReportCsv(report: SchoolReport): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const money = (p: number) => (p / 100).toFixed(2)
  const lines = [
    ['Breakdown', 'Group', 'Subjects', 'Lessons booked', 'Completed', 'No-shows', 'Attendance %', 'Spend (GBP)'].join(','),
  ]
  const push = (section: string, r: ReportRow) =>
    lines.push([
      section,
      esc(r.label),
      esc(r.detail ?? ''),
      String(r.booked),
      String(r.completed),
      String(r.noShows),
      r.attendancePct === null ? '' : String(r.attendancePct),
      money(r.spendPence),
    ].join(','))
  for (const r of report.byYearGroup) push('Year group', r)
  for (const r of report.byTeacher) push('Tutor', r)
  lines.push(['Total', '', '', String(report.totals.booked), String(report.totals.completed), String(report.totals.noShows), report.totals.attendancePct === null ? '' : String(report.totals.attendancePct), money(report.totals.spendPence)].join(','))
  return lines.join('\r\n') + '\r\n'
}
