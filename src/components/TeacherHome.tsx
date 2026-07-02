import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { HeroMark } from '@/components/HeroMark'
import { DIRECTORY_ENABLED } from '@/lib/practice'
import type en from '@/messages/en.json'

type HomeT = typeof en['home']

// `welcome` — enterprise portal only: the tenant school's welcome message,
// rendered as plain text (never HTML) above the hero. null/undefined on the apex.
export function TeacherHome({ t, welcome }: { t: HomeT; welcome?: { schoolName: string; message: string } | null }) {
  return (
    <>
      <SiteNav />

      <main id="main-content">
      {welcome && (
        <section className="border-b border-brand-100 bg-brand-50">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 text-center">
            <p className="text-sm font-semibold text-brand-700">{welcome.schoolName}</p>
            <p className="text-sand-700 mt-1 whitespace-pre-line">{welcome.message}</p>
          </div>
        </section>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-coral-100/40 blur-3xl" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-16 text-center">
          <HeroMark className="mb-6" />
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {t.hero_badge}
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-[1.05] text-brand-900 mt-6">
            {t.hero_h1_line1}
            <br />
            <span className="text-brand-600">{t.hero_h1_line2}</span>
          </h1>
          <p className="text-lg sm:text-xl text-sand-700 mt-6 max-w-xl mx-auto leading-relaxed">
            {t.hero_body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <Link
              href="/sign-up?role=teacher"
              className="bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              {t.hero_cta_primary}
            </Link>
            <Link
              href="/for-tutors"
              className="px-7 py-3.5 rounded-full font-medium text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
            >
              {t.hero_cta_secondary}
            </Link>
          </div>
          <p className="text-sm text-sand-500 mt-4">{t.hero_footnote}</p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">
          {t.features_heading}
        </h2>
        <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">{t.features_sub}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.map(f => (
            <div key={f.title} className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
              <div className="text-3xl mb-3" aria-hidden>{f.icon}</div>
              <h3 className="font-display text-lg font-semibold text-brand-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-sand-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Savings band */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-5">
              {t.savings_heading}
            </h2>
            <p className="text-brand-200 text-lg leading-relaxed mb-10">{t.savings_body}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-6">
                <p className="text-brand-300 text-sm font-medium mb-2">{t.savings_before_label}</p>
                <p className="font-display text-4xl font-semibold">£1,575</p>
                <p className="text-brand-400 text-sm mt-1">per month · after 25% taken</p>
              </div>
              <div className="bg-coral-500/20 border border-coral-400/30 rounded-2xl p-6">
                <p className="text-coral-200 text-sm font-medium mb-2">{t.savings_after_label}</p>
                <p className="font-display text-4xl font-semibold">£2,071</p>
                <p className="text-coral-200 text-sm mt-1">per month · after £29 plan fee</p>
              </div>
            </div>
            <p className="text-brand-500 text-xs mt-5">{t.savings_note}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-12">
            {t.how_heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-sand-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy band */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="text-3xl mb-3" aria-hidden>🔒</div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-2">
            {t.privacy_heading}
          </h2>
          <p className="text-sand-600 max-w-2xl mx-auto leading-relaxed">{t.privacy_body}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-sand-50 to-brand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-3">
            {t.cta_heading}
          </h2>
          <p className="text-sand-700 mb-8">{t.cta_sub}</p>
          <Link
            href="/sign-up?role=teacher"
            className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
          >
            {t.cta_button}
          </Link>
          {DIRECTORY_ENABLED && (
            <p className="text-sm text-sand-500 mt-6">
              {t.cta_footer_pre}{' '}
              <Link href="/tutors" className="text-brand-700 underline hover:text-brand-800">
                {t.cta_footer_link}
              </Link>.
            </p>
          )}
        </div>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}
