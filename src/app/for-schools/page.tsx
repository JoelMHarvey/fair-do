import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'fair-do for Schools — managed tutoring for your students',
  description: 'Give your pupils access to verified UK tutors. Transparent per-lesson pricing, no per-seat lock-in, simple invoicing.',
}

export default async function ForSchoolsPage() {
  const { for_schools } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-coral-50 px-4 py-1.5 text-sm font-medium text-coral-600">
            {for_schools.hero_badge}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 mt-6 leading-tight">
            {for_schools.hero_title_line1}<br />{for_schools.hero_title_line2}
          </h1>
          <p className="text-lg text-sand-700 mt-6 max-w-xl mx-auto">
            {for_schools.hero_subtitle}
          </p>
          <div className="mt-9">
            <a
              href="mailto:schools@fair-do.com?subject=fair-do%20for%20Schools"
              className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              {for_schools.hero_cta}
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {for_schools.benefits.map(b => (
            <div key={b.title} className="bg-white rounded-3xl border border-sand-200 p-7 shadow-sm">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-display text-xl font-semibold text-brand-900 mb-2">{b.title}</h3>
              <p className="text-sand-600 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-center mb-10">{for_schools.how_heading}</h2>
          <div className="space-y-4">
            {for_schools.steps.map(({ title, body }, i) => (
              <div key={title} className="flex gap-4 items-start bg-brand-800/50 border border-brand-700/40 rounded-2xl p-5">
                <span className="font-display text-2xl font-semibold text-coral-300 shrink-0">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-brand-100/80 text-sm mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center px-5">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-4">{for_schools.final_heading}</h2>
        <p className="text-sand-600 mb-8 max-w-md mx-auto">{for_schools.final_body}</p>
        <a
          href="mailto:schools@fair-do.com?subject=fair-do%20for%20Schools"
          className="inline-block bg-brand-600 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
        >
          schools@fair-do.com
        </a>
        <p className="mt-6 flex gap-5 justify-center text-sm">
          <Link href="/org" className="text-brand-700 hover:text-brand-800 font-medium">{for_schools.manage_link}</Link>
        </p>
        <p className="mt-2"><Link href="/" className="text-sm text-sand-500 hover:text-brand-700">{for_schools.back_home}</Link></p>
      </section>

      <SiteFooter />
    </>
  )
}
