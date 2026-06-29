import * as Sentry from '@sentry/react-native'

// Clinical data patterns — never appear in Sentry payloads
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // email
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,             // card
  /\+?[\d\s\-().]{10,}/g,                                    // phone
  /\b(patient|client|dob|dateofbirth|diagnosis|medication|note)\b/gi,
]

function scrubString(s: string): string {
  return PII_PATTERNS.reduce((acc, re) => acc.replace(re, '[redacted]'), s)
}

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  // Drop breadcrumbs containing URL params (may contain PII in query strings)
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(b => {
      if (b.data?.url) b.data.url = b.data.url.split('?')[0]
      if (b.message) b.message = scrubString(b.message)
      return b
    })
  }
  // Scrub exception values
  event.exception?.values?.forEach(ex => {
    if (ex.value) ex.value = scrubString(ex.value)
  })
  // Drop request body (may contain message text)
  if (event.request?.data) event.request.data = '[body redacted]'
  // Never send user identity beyond a non-PII identifier
  if (event.user?.email) delete event.user.email
  if (event.user?.username) delete event.user.username
  return event
}

export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN
  if (!dsn) return // no-op in development without DSN

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    // Only send 10% of traces in production — adjust post-launch
    tracesSampleRate: __DEV__ ? 0 : 0.1,
    beforeSend: scrubEvent,
    // Never capture console.log/warn — they may contain clinical text
    integrations: existing =>
      existing.filter(i => i.name !== 'Console'),
  })
}

export function setSentryUser(clerkId: string): void {
  // Store only the opaque Clerk ID — no name, no email
  Sentry.setUser({ id: clerkId })
}

export function clearSentryUser(): void {
  Sentry.setUser(null)
}
