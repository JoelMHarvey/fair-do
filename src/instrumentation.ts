import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (!process.env.SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    // Never capture special-category (mental health) data.
    sendDefaultPii: false,
  })
}

// Capture uncaught server errors (route handlers + RSC 500s — the class of failure
// that only showed up in raw Vercel logs before). Record to the self-hosted counter
// for ops alerting, then forward to Sentry. Prisma is imported dynamically so it's
// never pulled into the edge runtime bundle.
export const onRequestError: typeof Sentry.captureRequestError = async (err, request, context) => {
  try {
    const { recordError } = await import('@/lib/error-log')
    const e = err as { message?: string; digest?: string }
    recordError('request', e?.message ? String(e.message) : String(err), e?.digest)
  } catch {
    // never let instrumentation throw
  }
  return Sentry.captureRequestError(err, request, context)
}
