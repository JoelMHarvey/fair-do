import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'

export const metadata = {
  title: 'How fair-do compares — software for UK tutors',
  description: 'An honest, factual comparison of fair-do with the booking and admin tools UK tutors usually weigh up — for independent private tutors.',
}

// Providers in column order. fair-do first.
const PROVIDERS = ['fair-do', 'SimplePractice', 'WriteUpp', 'Halaxy', 'Zanda', 'Cliniko', 'Carepatron']

// y = yes/included · p = partial/add-on/paid · n = no
type Cell = 'y' | 'p' | 'n'
const ROWS: { label: string; cells: Cell[] }[] = [
  { label: 'Built for UK tutors', cells: ['y', 'n', 'y', 'p', 'p', 'p', 'n'] },
  { label: 'Free plan to start', cells: ['y', 'n', 'n', 'y', 'n', 'n', 'y'] },
  { label: 'UK / EU data residency', cells: ['y', 'n', 'y', 'y', 'y', 'y', 'p'] },
  { label: 'GBP card payments & payouts', cells: ['y', 'n', 'y', 'y', 'y', 'y', 'p'] },
  { label: 'Built-in secure video', cells: ['y', 'y', 'y', 'y', 'y', 'y', 'y'] },
  { label: 'Email + SMS reminders included', cells: ['y', 'y', 'p', 'p', 'p', 'p', 'p'] },
  { label: 'Student self-booking page', cells: ['y', 'y', 'p', 'y', 'y', 'y', 'y'] },
  { label: 'You own your students & records', cells: ['y', 'y', 'y', 'p', 'y', 'y', 'y'] },
  { label: 'Designed just for tutoring', cells: ['y', 'y', 'p', 'n', 'n', 'n', 'p'] },
]

const EDGES = [
  { icon: '🪶', title: 'Free to start', body: 'Run your whole tutoring business on the free Starter plan. Most UK alternatives are paid-only from day one.' },
  { icon: '🇬🇧', title: 'Built UK-first, for tutors', body: 'Tutoring-shaped, not a generic admin tool. UK/EU data residency, UK GDPR, you as the data controller.' },
  { icon: '📦', title: 'The essentials, all included', body: 'Secure video, GBP payments, email + SMS reminders, intake forms, self-booking — no per-feature add-ons or SMS credit packs.' },
  { icon: '🤝', title: 'You own everything', body: 'Your students, your records. Export and leave any time. fair-do is your tool, never a middleman.' },
]

function Mark({ c }: { c: Cell }) {
  if (c === 'y') return <span className="text-brand-600 font-semibold" title="Yes / included">✓</span>
  if (c === 'p') return <span className="text-amber-500" title="Partial / add-on / paid">~</span>
  return <span className="text-sand-300" title="No">✗</span>
}

export default function ComparePage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  return (
    <>
      <SiteNav />
      <main className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">How fair-do compares</h1>
            <p className="text-lg text-sand-700 mt-5 leading-relaxed">
              An honest look at fair-do next to the booking and admin software UK tutors usually weigh up. The others are
              mature and feature-rich; fair-do is the calm, UK-first, free-to-start option where the essentials are
              built in and your students stay yours.
            </p>
          </div>

          {/* Edges */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {EDGES.map(e => (
              <div key={e.title} className="bg-white rounded-2xl border border-sand-200 p-5">
                <div className="text-2xl mb-2">{e.icon}</div>
                <p className="font-medium text-brand-900">{e.title}</p>
                <p className="text-sm text-sand-600 mt-1 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>

          {/* Matrix */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-14 mb-2">Feature by feature</h2>
          <p className="text-sm text-sand-500 mb-4"><span className="text-brand-600 font-semibold">✓</span> included · <span className="text-amber-500">~</span> partial / add-on / paid · <span className="text-sand-300">✗</span> no</p>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="text-left px-4 py-3 font-medium text-sand-600 sticky left-0 bg-white">Feature</th>
                  {PROVIDERS.map((p, i) => (
                    <th key={p} className={`px-3 py-3 font-semibold text-center ${i === 0 ? 'text-brand-700 bg-brand-50' : 'text-sand-600'}`}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, ri) => (
                  <tr key={r.label} className={ri > 0 ? 'border-t border-sand-100' : ''}>
                    <td className="text-left px-4 py-3 text-sand-700 sticky left-0 bg-white">{r.label}</td>
                    {r.cells.map((c, ci) => (
                      <td key={ci} className={`px-3 py-3 text-center ${ci === 0 ? 'bg-brand-50/60' : ''}`}><Mark c={c} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Honest */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-14 mb-3">Where we&rsquo;re still growing</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-6 text-sm text-sand-700 leading-relaxed space-y-2">
            <p>We believe in being straight with you:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>We&rsquo;re newer.</strong> The established names have years of features — deep reporting, large multi-tutor academies, and more. We&rsquo;re focused and growing.</li>
              <li><strong>We&rsquo;re a web app today</strong> (it installs to your phone&rsquo;s home screen). A native app is on the way.</li>
              <li><strong>Card payments carry a small commission</strong> (0&ndash;2.5%, and 0% on Academy) on top of Stripe&rsquo;s fee — the trade for a genuinely free entry plan. <Link href="/pricing/explained" className="text-brand-700 underline">See exactly what you keep →</Link></li>
            </ul>
          </div>

          <p className="text-xs text-sand-400 mt-6">
            Comparison researched and fact-checked in June 2026 from each provider&rsquo;s own website and reputable reviews.
            Competitors&rsquo; pricing and features change — please check their sites for the latest. This is a factual
            comparison, not a criticism of any other product; they&rsquo;re good tools, built for different needs.
          </p>

          <div className="mt-10 text-center">
            <Link href="/sign-up?role=therapist" className="inline-block bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">Start free</Link>
            <p className="text-sm text-sand-500 mt-3">Free to start · UK-first · keep your own students</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
