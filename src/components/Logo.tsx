import Link from 'next/link'

// Enterprise portal: on a tenant (school) host the nav shows the school's logo
// — or its name as text — with a small "powered by fair-do" line. Callers pass
// `tenant` explicitly (see SiteNav); with no tenant the fair-do mark renders
// exactly as before.
export type TenantLogo = { name: string; logoUrl?: string | null }

export function Logo({ className = '', tenant }: { className?: string; tenant?: TenantLogo | null }) {
  if (tenant) {
    return (
      <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
        {tenant.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.logoUrl}
            alt={tenant.name}
            className="h-8 max-w-[160px] object-contain"
          />
        ) : (
          <span className="font-display text-xl font-semibold tracking-tight text-brand-900">
            {tenant.name}
          </span>
        )}
        <span className="text-[10px] leading-tight text-sand-400 whitespace-nowrap">
          powered by
          <br />
          fair-do
        </span>
      </Link>
    )
  }
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <span className="relative flex h-7 w-7 items-center justify-center">
        <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7">
          <circle cx="14" cy="14" r="14" className="fill-brand-600" />
          <path
            d="M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-brand-900">
        fair-do
      </span>
    </Link>
  )
}
