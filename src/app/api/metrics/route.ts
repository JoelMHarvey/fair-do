import { collectMetrics } from '@/lib/monitoring'
import { bearerOk } from '@/lib/bearer'

// Machine-readable metrics for Grafana (Infinity datasource) / external monitors.
// Guarded by METRICS_TOKEN — refuses unless the bearer matches. If the token is
// unset we refuse rather than expose internal counts publicly.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.METRICS_TOKEN)) {
    return new Response('Unauthorized', { status: 401 })
  }
  const metrics = await collectMetrics()
  return Response.json(metrics, { headers: { 'Cache-Control': 'no-store' } })
}
