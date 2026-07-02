import Link from 'next/link'
import { Logo } from './Logo'

// Shared school-console navigation (/school/*). English-only v1 — the console
// is a school-admin surface; parent/student-facing pages stay i18n'd.
export function SchoolNav({ schoolName, role }: { schoolName: string; role: 'ADMIN' | 'STAFF' }) {
  const links = [
    { href: '/school', label: 'Overview' },
    ...(role === 'ADMIN' ? [
      { href: '/school/branding', label: 'Branding' },
      { href: '/school/structure', label: 'Structure' },
      { href: '/school/members', label: 'Members' },
      { href: '/school/staff', label: 'Staff' },
      { href: '/school/mail-groups', label: 'Mail groups' },
      { href: '/school/calendars', label: 'Calendars' },
    ] : []),
    { href: '/school/broadcasts', label: 'Broadcasts' },
    { href: '/school/reports', label: 'Reports' },
  ]

  return (
    <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="hidden sm:inline text-sm text-sand-500 border-l border-sand-200 pl-3">{schoolName}</span>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="text-sm text-sand-500 hover:text-brand-700 transition whitespace-nowrap">{l.label}</Link>
        ))}
        <Link href="/sign-out" className="text-sm text-sand-500 hover:text-brand-700 transition whitespace-nowrap">Sign out</Link>
      </div>
    </nav>
  )
}
