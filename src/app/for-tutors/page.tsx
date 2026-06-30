import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'How fair-do works — the calm tool for independent tutors',
  description:
    'See how fair-do helps you run your whole tutoring business — your own students, scheduling, secure video, payments and reminders, on web and phone. Private, simple, and fair. Start free.',
}

export default async function ForTutorsPage() {
  const { for_tutors } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-coral-100/40 blur-3xl" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {for_tutors.hero_badge}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] text-brand-900 mt-6">
            {for_tutors.hero_title_line1}
            <br />
            <span className="text-brand-600">{for_tutors.hero_title_line2}</span>
          </h1>
          <p className="text-lg sm:text-xl text-sand-700 mt-6 max-w-xl mx-auto leading-relaxed">
            {for_tutors.hero_lead}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <Link
              href="/sign-up?role=teacher"
              className="bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              {for_tutors.hero_cta_primary}
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-3.5 rounded-full font-medium text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
            >
              {for_tutors.hero_cta_secondary}
            </Link>
          </div>
          <p className="text-sm text-sand-500 mt-4">
            {for_tutors.hero_note}
          </p>
        </div>
      </section>

      {/* Feature deep-dive */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">
          {for_tutors.features_heading}
        </h2>
        <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">
          {for_tutors.features_subheading}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {for_tutors.features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl border border-sand-200 p-7 shadow-sm"
            >
              <div className="text-3xl mb-3" aria-hidden>
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-brand-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sand-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethos — made by people with heart */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-brand-200 text-sm font-medium uppercase tracking-wide mb-3">
            {for_tutors.ethos_eyebrow}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-medium leading-snug">
            {for_tutors.ethos_body}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">
            {for_tutors.steps_heading}
          </h2>
          <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">
            {for_tutors.steps_subheading}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {for_tutors.steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-sm text-sand-600 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy band */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="text-3xl mb-3" aria-hidden>
            🔒
          </div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-2">
            {for_tutors.privacy_heading}
          </h2>
          <p className="text-sand-600 max-w-2xl mx-auto leading-relaxed">
            {for_tutors.privacy_body}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-sand-50 to-brand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-3">
            {for_tutors.cta_heading}
          </h2>
          <p className="text-sand-700 mb-8">
            {for_tutors.cta_body}
          </p>
          <Link
            href="/sign-up?role=teacher"
            className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
          >
            {for_tutors.cta_button}
          </Link>
          <p className="text-sm text-sand-500 mt-6">
            {for_tutors.cta_footer_pre}{' '}
            <Link
              href="/pricing"
              className="text-brand-700 underline hover:text-brand-800"
            >
              {for_tutors.cta_footer_link}
            </Link>
            {for_tutors.cta_footer_post}
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
