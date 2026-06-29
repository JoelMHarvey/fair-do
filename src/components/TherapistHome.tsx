import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { BreathingLotus } from '@/components/BreathingLotus'
import { DIRECTORY_ENABLED } from '@/lib/practice'
import type en from '@/messages/en.json'

type HomeT = typeof en['home']

const BENEFIT_ICONS = ['🤝', '🪶', '🔒', '💷', '⚡', '📱'] as const

export function TherapistHome({ t }: { t: HomeT }) {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-coral-100/40 blur-3xl" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-16 text-center">
          <BreathingLotus className="mb-6" />
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
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
            <Link href="/sign-up?role=therapist" className="bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              {t.hero_cta_primary}
            </Link>
            <Link href="/for-therapists" className="px-7 py-3.5 rounded-full font-medium text-brand-700 border border-brand-200 hover:bg-brand-50 transition">
              {t.hero_cta_secondary}
            </Link>
          </div>
          <p className="text-sm text-sand-500 mt-4">{t.hero_footnote}</p>
        </div>
      </section>

      {/* Ethos */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-brand-200 text-sm font-medium uppercase tracking-wide mb-3">{t.ethos_eyebrow}</p>
          <p className="font-display text-2xl sm:text-3xl font-medium leading-snug">
            {t.ethos_body}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">{t.benefits_heading}</h2>
        <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">{t.benefits_sub}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.benefits.map((b, i) => (
            <div key={b.title} className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
              <div className="text-3xl mb-3" aria-hidden>{BENEFIT_ICONS[i]}</div>
              <h3 className="font-display text-lg font-semibold text-brand-900 mb-1.5">{b.title}</h3>
              <p className="text-sm text-sand-600 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-12">{t.how_heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">{i + 1}</div>
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
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-2">{t.privacy_heading}</h2>
          <p className="text-sand-600 max-w-2xl mx-auto leading-relaxed">{t.privacy_body}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-sand-50 to-brand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-3">{t.cta_heading}</h2>
          <p className="text-sand-700 mb-8">{t.cta_sub}</p>
          <Link href="/sign-up?role=therapist" className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            {t.cta_button}
          </Link>
          {DIRECTORY_ENABLED && (
            <p className="text-sm text-sand-500 mt-6">
              {t.cta_footer_pre}{' '}
              <Link href="/tutors" className="text-brand-700 underline hover:text-brand-800">{t.cta_footer_link}</Link>.
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
