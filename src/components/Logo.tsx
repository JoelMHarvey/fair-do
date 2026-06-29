import Link from 'next/link'

export function Logo({ className = '' }: { className?: string }) {
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
