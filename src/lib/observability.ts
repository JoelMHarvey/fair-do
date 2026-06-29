import * as Sentry from '@sentry/nextjs'

/**
 * Thin error-reporting wrapper. Logs to console (captured by Vercel) and,
 * when SENTRY_DSN is set, forwards to Sentry. Every call site uses logError().
 *
 * To enable Sentry: set SENTRY_DSN (server) + NEXT_PUBLIC_SENTRY_DSN (client) in env.
 * Init lives in src/instrumentation.ts and src/instrumentation-client.ts.
 */
export function logError(scope: string, err: unknown, context?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err)
  // Never log PHI/special-category data — pass only safe identifiers in `context`.
  console.error(`[${scope}] ${message}`, context ? JSON.stringify(context) : '')
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, { tags: { scope }, extra: context })
  }
}
