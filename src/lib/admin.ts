import 'server-only'

// Full-access accounts: founder + admin pages, all admin powers (approve therapists,
// see who's online, change roles). The allowlist is the lockout-proof failsafe — these
// emails are always admins regardless of their stored DB role. Override via env.
const DEFAULT_ADMIN_EMAILS = ['joelmharvey@gmail.com', 'admin@fair-do.com', 'support@fair-do.com']

export const ADMIN_EMAILS: Set<string> = new Set(
  (process.env.FOUNDER_EMAILS ?? DEFAULT_ADMIN_EMAILS.join(','))
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),
)

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase())
}

// A user has admin access if they hold the ADMIN role OR their email is on the
// allowlist. The email path never depends on the DB role, so an allowlisted
// account can't be accidentally locked out by a role change.
export function isAdminUser(user: { role?: string | null; email?: string | null } | null | undefined): boolean {
  return !!user && (user.role === 'ADMIN' || isAdminEmail(user.email))
}
