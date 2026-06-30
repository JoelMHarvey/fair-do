import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { localeAlternates } from '@/lib/i18n-seo'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return { title: meta.compare.title, description: meta.compare.description, alternates: await localeAlternates('/compare') }
}

// Columns: fair-do first, then UK tutoring marketplace competitors.
const PROVIDERS = ['fair-do', 'Tutorful', 'MyTutor', 'Tutor Hunt', 'Superprof', 'Spires']

// y = yes/included · p = partial/limited · n = no
// Rows match compare.rows in en.json (12 rows):
//  0. 0% commission on lessons
//  1. You own your students & records
//  2. Free to get started
//  3. Built-in secure video
//  4. Interactive whiteboard
//  5. AI lesson notes
//  6. Parent portal
//  7. Resource library
//  8. Group lessons
//  9. Lesson packages & bundles
// 10. Gift vouchers
// 11. UK / EU data residency
type Cell = 'y' | 'p' | 'n'
const ROW_CELLS: Cell[][] = [
  ['y', 'n', 'n', 'n', 'n', 'n'],  // 0% commission
  ['y', 'n', 'n', 'n', 'n', 'n'],  // own students & records
  ['y', 'n', 'n', 'p', 'p', 'n'],  // free to start (Tutor Hunt/Superprof free but take more commission)
  ['y', 'y', 'y', 'n', 'n', 'y'],  // built-in video
  ['y', 'p', 'n', 'n', 'n', 'n'],  // whiteboard (Tutorful has limited canvas)
  ['y', 'n', 'n', 'n', 'n', 'n'],  // AI lesson notes
  ['y', 'p', 'p', 'n', 'n', 'n'],  // parent portal (Tutorful/MyTutor have limited views)
  ['y', 'n', 'n', 'n', 'n', 'n'],  // resource library
  ['y', 'n', 'n', 'n', 'n', 'n'],  // group lessons
  ['y', 'n', 'n', 'n', 'n', 'n'],  // packages & bundles
  ['y', 'n', 'n', 'n', 'n', 'n'],  // gift vouchers
  ['y', 'p', 'p', 'p', 'n', 'p'],  // UK/EU data (Superprof is French; others UK-based)
]

function Mark({ c, titles }: { c: Cell; titles: { yes: string; partial: string; no: string } }) {
  if (c === 'y') return <span className="text-brand-600 font-semibold" title={titles.yes}>✓</span>
  if (c === 'p') return <span className="text-amber-500" title={titles.partial}>~</span>
  return <span className="text-sand-300" title={titles.no}>✗</span>
}

export default async function ComparePage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { compare } = await getDictionary(await getLocaleFromHeaders())

  return (
    <>
      <SiteNav />
      <main className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
              {compare.h1}
            </h1>
            <p className="text-lg text-sand-700 mt-5 leading-relaxed">{compare.lead}</p>
          </div>

          {/* Key advantages */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {compare.edges.map(e => (
              <div key={e.title} className="bg-white rounded-2xl border border-sand-200 p-5">
                <div className="text-2xl mb-2">{e.icon}</div>
                <p className="font-medium text-brand-900">{e.title}</p>
                <p className="text-sm text-sand-600 mt-1 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>

          {/* Commission callout */}
          <div className="mt-10 bg-brand-900 text-white rounded-2xl p-6 sm:p-8">
            <p className="text-brand-300 text-sm font-medium uppercase tracking-wide mb-3">
              The maths on commission
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { name: 'Tutorful', pct: '25%' },
                { name: 'MyTutor', pct: '~20%' },
                { name: 'Tutor Hunt', pct: '10–12.5%' },
                { name: 'fair-do', pct: '0%' },
              ].map(({ name, pct }) => (
                <div key={name} className={`rounded-xl p-4 ${name === 'fair-do' ? 'bg-coral-500/20 border border-coral-400/30' : 'bg-white/10'}`}>
                  <p className={`font-display text-2xl font-semibold ${name === 'fair-do' ? 'text-coral-200' : 'text-white'}`}>{pct}</p>
                  <p className={`text-xs mt-1 ${name === 'fair-do' ? 'text-coral-300' : 'text-brand-400'}`}>{name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature matrix */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-14 mb-2">
            {compare.matrix_heading}
          </h2>
          <p className="text-sm text-sand-500 mb-4">
            <span className="text-brand-600 font-semibold">✓</span> {compare.legend_included} ·{' '}
            <span className="text-amber-500">~</span> {compare.legend_partial} ·{' '}
            <span className="text-sand-300">✗</span> {compare.legend_no}
          </p>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="text-left px-4 py-3 font-medium text-sand-600 sticky left-0 bg-white">
                    {compare.table_feature}
                  </th>
                  {PROVIDERS.map((p, i) => (
                    <th
                      key={p}
                      className={`px-3 py-3 font-semibold text-center ${i === 0 ? 'text-brand-700 bg-brand-50' : 'text-sand-600'}`}
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compare.rows.map((label, ri) => (
                  <tr key={label} className={ri > 0 ? 'border-t border-sand-100' : ''}>
                    <td className="text-left px-4 py-3 text-sand-700 sticky left-0 bg-white">{label}</td>
                    {ROW_CELLS[ri].map((c, ci) => (
                      <td
                        key={ci}
                        className={`px-3 py-3 text-center ${ci === 0 ? 'bg-brand-50/60' : ''}`}
                      >
                        <Mark c={c} titles={compare.marks} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Honest section */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-14 mb-3">
            {compare.growing_heading}
          </h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-6 text-sm text-sand-700 leading-relaxed space-y-2">
            <p>{compare.growing_intro}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>{compare.growing_newer_strong}</strong>
                {compare.growing_newer_body}
              </li>
              <li>
                <strong>{compare.growing_webapp_strong}</strong>
                {compare.growing_webapp_body}
              </li>
              <li>
                <strong>{compare.growing_fees_strong}</strong>
                {compare.growing_fees_body}
                <Link href="/pricing/explained" className="text-brand-700 underline">
                  {compare.growing_fees_link}
                </Link>
              </li>
            </ul>
          </div>

          <p className="text-xs text-sand-400 mt-6">{compare.disclaimer}</p>

          <div className="mt-10 text-center">
            <Link
              href="/sign-up?role=teacher"
              className="inline-block bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              {compare.cta}
            </Link>
            <p className="text-sm text-sand-500 mt-3">{compare.cta_sub}</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
