import { prisma } from '@/lib/prisma'

// Lightweight health check for uptime monitors (BetterUptime, Checkly, etc.)
// Returns 200 only if the DB is reachable.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'ok', db: 'up', ts: new Date().toISOString() })
  } catch {
    return Response.json({ status: 'degraded', db: 'down' }, { status: 503 })
  }
}
