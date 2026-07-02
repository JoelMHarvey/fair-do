import Link from 'next/link'
import { getSchoolContext } from '@/lib/school'
import { getSchoolReport, type ReportRange, type ReportRow } from '@/lib/school-reports'

export const metadata = { title: 'Reports — fair-do' }

// Reports v1 (M2.7): lessons, attendance and spend by year group and by tutor.
// Visible to ADMIN and STAFF (getSchoolContext admits both). Lessons are
// attributed to tutors, not subjects — sessions don't record a subject and
// tutors teach several, so per-subject numbers would be guesswork
// (see src/lib/school-reports.ts).
export default async function SchoolReportsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { org } = await getSchoolContext()
  const { range: rangeParam } = await searchParams
  const range: ReportRange = rangeParam === 'month' ? 'month' : 'term'
  const report = await getSchoolReport(org.id, range)

  const fmt = (p: number) => `£${(p / 100).toFixed(2)}`
  const pct = (v: number | null) => (v === null ? '—' : `${v}%`)
  const since = report.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-sand-900">Reports</h1>
          <p className="text-sm text-sand-500 mt-1">Lessons, attendance and spend since {since}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-sand-200 bg-white p-1 text-sm">
            {(['term', 'month'] as const).map(r => (
              <Link
                key={r}
                href={`/school/reports?range=${r}`}
                className={`px-4 py-1.5 rounded-full transition ${range === r ? 'bg-brand-600 text-white' : 'text-sand-600 hover:text-brand-700'}`}
              >
                {r === 'term' ? 'This term' : 'This month'}
              </Link>
            ))}
          </div>
          <a href={`/api/school/reports?format=csv&range=${range}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Download CSV ↓
          </a>
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Students', value: String(report.students) },
          { label: 'Lessons booked', value: String(report.totals.booked) },
          { label: 'Completed', value: String(report.totals.completed) },
          { label: 'Attendance', value: pct(report.totals.attendancePct) },
          { label: 'Spend', value: fmt(report.totals.spendPence), accent: true },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-sand-200 p-4">
            <div className={`text-2xl font-display ${s.accent ? 'text-brand-700' : 'text-sand-900'}`}>{s.value}</div>
            <div className="text-xs text-sand-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <BreakdownTable
        title="By year group"
        hint="Students are grouped by their assigned year — assign years on the Members page to fill in “Unassigned”."
        rows={report.byYearGroup}
        fmt={fmt}
        pct={pct}
      />
      <BreakdownTable
        title="By tutor"
        hint="Lessons don't record a single subject (tutors teach several), so the reliable breakdown is per tutor — their subjects are shown for context."
        rows={report.byTeacher}
        fmt={fmt}
        pct={pct}
        showDetail
      />
    </div>
  )
}

function BreakdownTable({ title, hint, rows, fmt, pct, showDetail = false }: {
  title: string
  hint: string
  rows: ReportRow[]
  fmt: (p: number) => string
  pct: (v: number | null) => string
  showDetail?: boolean
}) {
  return (
    <section className="bg-white rounded-xl border border-sand-200 p-6">
      <h2 className="font-display text-lg text-sand-900">{title}</h2>
      <p className="text-xs text-sand-500 mt-0.5 mb-4">{hint}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-sand-400">No lessons or payments in this period yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand-100">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-sand-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-sand-600">{showDetail ? 'Tutor' : 'Year group'}</th>
                {showDetail && <th className="text-left px-4 py-2.5 font-medium text-sand-600 hidden sm:table-cell">Subjects</th>}
                <th className="text-right px-4 py-2.5 font-medium text-sand-600">Booked</th>
                <th className="text-right px-4 py-2.5 font-medium text-sand-600">Completed</th>
                <th className="text-right px-4 py-2.5 font-medium text-sand-600">No-shows</th>
                <th className="text-right px-4 py-2.5 font-medium text-sand-600">Attendance</th>
                <th className="text-right px-4 py-2.5 font-medium text-sand-600">Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {rows.map(r => (
                <tr key={r.key}>
                  <td className="px-4 py-2.5 text-sand-800">{r.label}</td>
                  {showDetail && <td className="px-4 py-2.5 text-sand-500 hidden sm:table-cell">{r.detail ?? '—'}</td>}
                  <td className="px-4 py-2.5 text-right text-sand-600">{r.booked}</td>
                  <td className="px-4 py-2.5 text-right text-sand-600">{r.completed}</td>
                  <td className="px-4 py-2.5 text-right text-sand-600">{r.noShows}</td>
                  <td className="px-4 py-2.5 text-right text-sand-600">{pct(r.attendancePct)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-brand-700">{fmt(r.spendPence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
