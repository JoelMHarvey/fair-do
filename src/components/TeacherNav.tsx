import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from './Logo'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { isFounder } from '@/lib/founder'
import { TeacherMobileMenu } from './TeacherMobileMenu'

// Shared therapist navigation — consistent across every therapist page, with a
// compact hamburger on mobile so the links never crowd a small screen.
export async function TeacherNav() {
  // Admin/founder accounts (the full-access allowlist) get an Admin link so the
  // console is reachable from where they work (Docs lives in the admin sub-nav).
  const { userId } = await auth()
  let admin = false
  if (userId) {
    const [user, founder] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }),
      isFounder(),
    ])
    admin = founder || user?.role === 'ADMIN'
  }

  const links = [
    { href: '/teacher/dashboard', label: 'Dashboard' },
    ...(PRACTICE_PORTAL_ENABLED ? [
      { href: '/teacher/calendar', label: 'Calendar' },
      { href: '/teacher/students', label: 'Clients' },
      { href: '/teacher/supervision', label: 'Supervision' },
      { href: '/teacher/billing', label: 'Billing' },
    ] : []),
    { href: '/teacher/earnings', label: 'Earnings' },
    { href: '/teacher/profile', label: 'Edit profile' },
    // Docs lives in the admin sub-nav now, so the top nav just has the Admin entry.
    ...(admin ? [
      { href: '/admin', label: 'Admin' },
    ] : []),
  ]

  return (
    <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
      <Logo />
      <div className="hidden sm:flex items-center gap-4">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`text-sm transition ${l.href === '/admin' ? 'font-medium text-coral-600 hover:text-coral-700' : 'text-sand-500 hover:text-brand-700'}`}>{l.label}</Link>
        ))}
        <Link href="/teacher/help" className="text-sm font-medium text-brand-700 hover:text-brand-800 transition">Help</Link>
        <Link href="/sign-out" className="text-sm text-sand-500 hover:text-brand-700 transition">Sign out</Link>
      </div>
      <TeacherMobileMenu links={links} />
    </nav>
  )
}
