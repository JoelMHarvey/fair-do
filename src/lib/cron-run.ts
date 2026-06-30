import { prisma } from '@/lib/prisma'

// Record a cron execution for the observability dashboard + stale-job alerting.
// Best-effort: never throws (monitoring must not break the job it monitors).
export async function recordCronRun(name: string, ok: boolean, durationMs?: number, detail?: string): Promise<void> {
  try {
    await prisma.cronRun.upsert({
      where: { name },
      create: { name, lastRunAt: new Date(), ok, durationMs, detail },
      update: { lastRunAt: new Date(), ok, durationMs, detail },
    })
  } catch (e) {
    console.error('[cron-run] failed to record', name, e)
  }
}

// Expected cadence per job (minutes) — used to decide "stale". Matches vercel.json.
export const CRON_CADENCE_MINS: Record<string, number> = {
  reminders: 60,
  'no-shows': 60,
  credentials: 24 * 60,
  alerts: 15,
  fx: 24 * 60,
  inbox: 5,
  recurring: 24 * 60,
}

export async function getCronRuns() {
  return prisma.cronRun.findMany().catch(() => [])
}
