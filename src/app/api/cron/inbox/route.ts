import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'
import { runInboxAgent } from '@/lib/inbox-process'

// Polls the support inbox and runs the triage agent. A strict no-op while the agent
// level is "off" (the default) or ANTHROPIC_API_KEY / IMAP_* aren't set. CRON_SECRET-gated.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }
  const start = Date.now()
  try {
    const result = await runInboxAgent()
    await recordCronRun('inbox', true, Date.now() - start, JSON.stringify(result))
    return Response.json(result)
  } catch (e) {
    console.error('[cron/inbox] failed', e)
    await recordCronRun('inbox', false, Date.now() - start, String(e))
    return new Response('error', { status: 500 })
  }
}
