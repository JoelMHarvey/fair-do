import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getTenant, isPortalPlan } from '@/lib/tenant'
import { Logo } from '@/components/Logo'

// Public tenant page (M2.5): the school's staff directory, visibility-filtered.
// Only exists on portal-plan tenant hosts — 404s on the apex marketplace.

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  return { title: tenant ? `Contacts — ${tenant.name}` : 'Contacts' }
}

export default async function ContactsPage() {
  const tenant = await getTenant()
  if (!tenant || !isPortalPlan(tenant.plan)) notFound()

  // Visibility rule (deliberately simple for v1): signed-out visitors see only
  // 'public' entries; ANY signed-in user (student, parent, staff…) also sees
  // 'parents' + 'students' entries. 'tutors'-only entries never show here —
  // they're for tutor-facing escalation surfaces.
  const { userId } = await auth()
  const visibleTo = userId ? ['public', 'parents', 'students'] : ['public']

  const staff = await prisma.staffContact.findMany({
    where: { organisationId: tenant.id, visibility: { in: visibleTo } },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      title: true,
      department: true,
      email: true,
      phone: true,
      isDSL: true,
      isTutoringCoordinator: true,
    },
  })

  // Group by department, in the admin's chosen order within each group.
  const groups = new Map<string, typeof staff>()
  for (const s of staff) {
    const key = s.department ?? 'School contacts'
    const list = groups.get(key) ?? []
    list.push(s)
    groups.set(key, list)
  }
  const hasDSL = staff.some(s => s.isDSL)

  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/90 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Home</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">Who to contact</h1>
        <p className="text-sand-600 mb-8">The people at {tenant.name} who look after tutoring{hasDSL ? ' and safeguarding' : ''}.</p>

        {hasDSL && (
          <div className="bg-coral-50 border border-coral-200 rounded-2xl p-5 mb-8 text-sm text-sand-700">
            <p className="font-medium text-coral-600 mb-1">Safeguarding</p>
            <p>
              If you&apos;re worried about a child&apos;s safety or wellbeing, contact the Designated Safeguarding Lead
              (marked <span className="text-[10px] uppercase tracking-wide bg-white text-coral-600 border border-coral-200 rounded-full px-1.5 py-0.5">DSL</span> below).
              In an emergency, always call 999. You can also <Link href="/complaints" className="text-brand-700 underline">raise a concern with fair-do</Link> at any time.
            </p>
          </div>
        )}

        {staff.length === 0 ? (
          <p className="text-sand-400 text-sm bg-white border border-sand-200 rounded-2xl p-6">
            No contacts have been published yet{userId ? '' : ' — signing in may show more'}.
          </p>
        ) : (
          [...groups.entries()].map(([department, people]) => (
            <section key={department} className="mb-8">
              <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">{department}</h2>
              <div className="space-y-3">
                {people.map(p => (
                  <div key={p.id} className={`bg-white rounded-2xl border p-5 ${p.isDSL ? 'border-coral-200' : 'border-sand-200'}`}>
                    <p className="font-medium text-brand-900">
                      {p.name}
                      {p.isDSL && <span className="ml-2 align-middle text-[10px] uppercase tracking-wide bg-coral-50 text-coral-600 border border-coral-200 rounded-full px-2 py-0.5">DSL</span>}
                      {p.isTutoringCoordinator && <span className="ml-2 align-middle text-[10px] uppercase tracking-wide bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2 py-0.5">Tutoring coordinator</span>}
                    </p>
                    <p className="text-sm text-sand-600 mt-0.5">{p.title}</p>
                    <p className="text-sm mt-2">
                      <a href={`mailto:${p.email}`} className="text-brand-700 hover:underline">{p.email}</a>
                      {p.phone && <span className="text-sand-600"> · {p.phone}</span>}
                    </p>
                    {p.isDSL && (
                      <p className="text-xs text-coral-600 mt-2">
                        Designated Safeguarding Lead — contact them first with any safeguarding concern about a pupil.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  )
}
