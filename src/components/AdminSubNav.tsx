'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Secondary nav for the admin area — the "additional admin menu" that sits under
// the shared top nav. Only rendered inside /admin/* (via the admin layout).
const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/health', label: 'Health' },
  { href: '/admin/orgs', label: 'Corporate' },
  { href: '/founder', label: 'Docs' },
]

export function AdminSubNav() {
  const pathname = usePathname()
  return (
    <div className="border-b border-sand-200 bg-white px-5 sm:px-8 h-11 flex items-center gap-1 overflow-x-auto">
      <span className="text-xs font-semibold text-coral-600 mr-2 shrink-0 uppercase tracking-wide">Admin</span>
      {LINKS.map(l => {
        const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm px-3 py-1 rounded-md shrink-0 transition ${active ? 'bg-sand-100 text-sand-900 font-medium' : 'text-sand-500 hover:text-brand-700'}`}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}
