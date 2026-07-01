import 'server-only'
import { prisma } from './prisma'

// Best-effort, self-hosted error counter. Records a truncated error line so the
// alerts cron can threshold on recent volume — giving route-level 500 alerting
// (email) that does not depend on Sentry's paid alerting.
//
// MUST never throw and never block the caller: it's called from catch blocks and
// the request-error hook. If the DB is the thing that's down, the insert fails
// silently (we do not re-log the failure, so there's no cascade).
export function recordError(scope: string, message: string, digest?: string): void {
  prisma.errorEvent
    .create({ data: { scope: scope.slice(0, 120), message: message.slice(0, 500), digest: digest ?? null } })
    .catch(() => {})
}

// Count errors newer than `sinceMs` ago, and prune anything older than `keepMs`.
// Called by the alerts cron.
export async function recentErrorCount(sinceMs: number, keepMs: number): Promise<number> {
  const now = Date.now()
  await prisma.errorEvent.deleteMany({ where: { createdAt: { lt: new Date(now - keepMs) } } }).catch(() => {})
  return prisma.errorEvent.count({ where: { createdAt: { gte: new Date(now - sinceMs) } } })
}
