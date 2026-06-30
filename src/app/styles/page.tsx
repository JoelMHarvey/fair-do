import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { localeAlternates } from '@/lib/i18n-seo'

const baseMetadata: Metadata = {
  title: 'Subjects & how tutoring works — fair-do',
  description: 'Maths, English, the sciences, languages, music and exam prep explained — what you\'ll cover, how lessons work, the exams they map to, and where to read more.',
}

export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, alternates: await localeAlternates('/styles') }
}

export default async function StylesPage() {
  const { styles } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">{styles.eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            {styles.h1}
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            {styles.lead}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <div className="space-y-5">
          {styles.subjects.map(s => (
            <div key={s.key} className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">{s.icon}</div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">{s.name}</h2>
                  <p className="text-sand-600 text-sm leading-relaxed mb-4">{s.what}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">{styles.good_for}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.goodFor.map(g => (
                        <span key={g} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-sand-600"><span className="font-medium text-sand-800">{styles.feels_label}</span> {s.feels}</p>

                  <details className="group mt-4 border-t border-sand-100 pt-4">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800">
                      <span className="transition group-open:rotate-90">▸</span> {styles.go_deeper}
                    </summary>
                    <div className="mt-4 space-y-4 text-sm text-sand-600 leading-relaxed">
                      <div><p className="font-medium text-sand-800 mb-1">{styles.cover_label}</p><p>{s.origin}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">{styles.exams_label}</p><p>{s.history}</p></div>
                      <div><p className="font-medium text-sand-800 mb-1">{styles.how_label}</p><p>{s.howItWorks}</p></div>
                      <div>
                        <p className="font-medium text-sand-800 mb-1.5">{styles.read_more}</p>
                        <ul className="space-y-1">
                          {s.resources.map(r => (
                            <li key={r.url}>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800 underline underline-offset-2">{r.label} ↗</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>

                  <Link href="/sign-up" className="inline-block mt-4 text-sm font-medium text-brand-700 hover:text-brand-800">
                    {styles.find_tutor}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mt-8 text-center">
          <p className="text-sand-700 mb-4">
            {styles.unsure_body}
          </p>
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            {styles.unsure_cta}
          </Link>
        </div>

        <p className="text-center text-xs text-sand-400 mt-6">
          {styles.help_pre}<Link href="/help" className="text-brand-600 underline">{styles.help_link}</Link>{styles.help_post}
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
