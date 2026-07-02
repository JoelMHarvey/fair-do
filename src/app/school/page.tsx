import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSchoolContext } from '@/lib/school'
import { isPortalPlan } from '@/lib/tenant'

export const metadata = { title: 'School console — fair-do' }

// Console home: setup checklist + headline counts. Each card links to the
// section that completes it — the "live in under an hour" onboarding path.
export default async function SchoolOverviewPage() {
  const { org, role } = await getSchoolContext()

  const [members, staff, yearGroups, mailGroups, calendars] = await Promise.all([
    prisma.student.count({ where: { organisationId: org.id } }),
    prisma.staffContact.count({ where: { organisationId: org.id } }),
    prisma.yearGroup.count({ where: { organisationId: org.id } }),
    prisma.mailGroup.count({ where: { organisationId: org.id } }),
    prisma.orgCalendar.count({ where: { organisationId: org.id } }),
  ])

  const steps = [
    { done: !!(org.brandColor && org.brandLogoUrl), href: '/school/branding', label: 'Add your logo and colours' },
    { done: yearGroups > 0, href: '/school/structure', label: 'Set up years, houses, classes and subjects' },
    { done: members > 0, href: '/school/members', label: 'Add or import your students' },
    { done: staff > 0, href: '/school/staff', label: 'Add staff contacts (including your DSL)' },
    { done: mailGroups > 0, href: '/school/mail-groups', label: 'Create a mail group' },
    { done: calendars > 0, href: '/school/calendars', label: 'Add term dates' },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl text-sand-900">{org.name}</h1>
        <p className="text-sm text-sand-500 mt-1">
          {isPortalPlan(org.plan) ? `Enterprise ${org.plan === 'portal_plus' ? 'Portal+' : 'Portal'}` : 'School plan'}
          {org.slug ? ` · ${org.slug}.fair-do.com` : ''}
          {role === 'STAFF' ? ' · staff access' : ''}
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { n: members, label: 'Students' },
          { n: staff, label: 'Staff contacts' },
          { n: yearGroups, label: 'Year groups' },
          { n: mailGroups, label: 'Mail groups' },
          { n: calendars, label: 'Calendars' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-sand-200 p-4">
            <div className="text-2xl font-display text-sand-900">{s.n}</div>
            <div className="text-xs text-sand-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {role === 'ADMIN' && (
        <section className="bg-white rounded-xl border border-sand-200 p-6">
          <h2 className="font-display text-lg text-sand-900 mb-4">Getting set up</h2>
          <ul className="space-y-3">
            {steps.map(s => (
              <li key={s.href}>
                <Link href={s.href} className="flex items-center gap-3 group">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${s.done ? 'bg-brand-600 text-white' : 'border border-sand-300 text-transparent'}`}>✓</span>
                  <span className={`text-sm ${s.done ? 'text-sand-400 line-through' : 'text-sand-700 group-hover:text-brand-700'}`}>{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
