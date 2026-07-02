import { getSchoolApiContext } from '@/lib/school'
import { requireSchoolMember, SchoolAccessError } from '@/lib/org'
import { getSchoolReport, schoolReportCsv, type ReportRange } from '@/lib/school-reports'

// CSV export for /school/reports (M2.7). STAFF can view reports, so this is
// member- (not admin-) gated.

export async function GET(req: Request) {
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolMember(tenantScopedOrgId)

    const url = new URL(req.url)
    const range: ReportRange = url.searchParams.get('range') === 'month' ? 'month' : 'term'
    const report = await getSchoolReport(org.id, range)

    if (url.searchParams.get('format') === 'csv') {
      const stamp = new Date().toISOString().slice(0, 10)
      return new Response(schoolReportCsv(report), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="fair-do-report-${range}-${stamp}.csv"`,
        },
      })
    }
    return Response.json(report)
  } catch (e) {
    if (e instanceof SchoolAccessError) return Response.json({ error: e.message }, { status: e.status })
    throw e
  }
}
