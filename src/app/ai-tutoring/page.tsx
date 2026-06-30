import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'AI tutoring: an honest look — fair-do',
  description: 'An impartial guide to AI tutors and learning chatbots — the benefits, the real risks, what the research says, the tools available, and where a human teacher still matters.',
}

export default async function AiTutoringPage() {
  const { ai_tutoring } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">{ai_tutoring.eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            {ai_tutoring.h1}
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            {ai_tutoring.lead}
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-16 space-y-10 text-sand-700 leading-relaxed text-[17px]">

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">{ai_tutoring.what_heading}</h2>
          <p>
            {ai_tutoring.what_body}
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-4">{ai_tutoring.upsides_heading}</h2>
          <div className="space-y-3">
            {ai_tutoring.upsides.map(({ t, b }) => (
              <div key={t} className="bg-white rounded-2xl border border-sand-200 p-5">
                <p className="font-medium text-brand-800 mb-1">{t}</p>
                <p className="text-sand-600 text-[16px]">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-4">{ai_tutoring.risks_heading}</h2>
          <div className="space-y-3">
            {ai_tutoring.risks.map(({ t, b }) => (
              <div key={t} className="bg-white rounded-2xl border border-sand-200 p-5">
                <p className="font-medium text-brand-800 mb-1">{t}</p>
                <p className="text-sand-600 text-[16px]">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">{ai_tutoring.research_heading}</h2>
          <p className="mb-4">
            {ai_tutoring.research_body}
          </p>
          <ul className="space-y-2">
            {ai_tutoring.research.map(r => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800 underline underline-offset-2">{r.label} ↗</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">{ai_tutoring.tools_heading}</h2>
          <p className="mb-4 text-sand-600 text-[16px]">{ai_tutoring.tools_note}</p>
          <div className="space-y-3">
            {ai_tutoring.tools.map(t => (
              <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
                <p className="font-medium text-brand-800">{t.name} ↗</p>
                <p className="text-sand-600 text-[16px] mt-1">{t.note}</p>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">{ai_tutoring.motivation_heading}</h2>
          <p>
            {ai_tutoring.motivation_body}
          </p>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">{ai_tutoring.take_heading}</h2>
          <p className="text-sand-700">
            {ai_tutoring.take_body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-7 py-3 rounded-full font-medium hover:bg-brand-700 transition text-center">
              {ai_tutoring.cta_find}
            </Link>
            <Link href="/styles" className="inline-block border border-sand-300 text-sand-700 px-7 py-3 rounded-full font-medium hover:bg-white transition text-center">
              {ai_tutoring.cta_subjects}
            </Link>
          </div>
        </div>

        <p className="text-xs text-sand-400 text-center">
          {ai_tutoring.disclaimer}
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
