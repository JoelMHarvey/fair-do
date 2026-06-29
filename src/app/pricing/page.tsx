import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { LocalPrice } from '@/components/LocalPrice'

export const metadata = {
  title: 'Pricing — fair-do',
  description: 'Simple, fair pricing for your tutoring practice. Start free, pay as you grow. Founding pricing locked for early tutors.',
}

const TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    cadence: '',
    tagline: 'Everything to run your practice.',
    features: ['Unlimited students', 'Scheduling + secure video', 'Card payments & payouts', 'Reminders & messaging', 'Runs on your phone'],
    note: 'No commission — you keep what you charge.',
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Practice',
    price: '£29',
    pricePence: 2900,
    cadence: '/month',
    tagline: 'For an established solo practice.',
    features: ['Everything in Starter', 'No commission, ever', 'Per-student pricing & packages', 'Branded email & invite letterhead', 'Targeted student messaging & invites', 'Earnings insights & analytics', 'In-app AI assistant', 'Priority support', 'Your booking page'],
    note: 'Founding tutors lock a lower rate — see below.',
    cta: 'Start free',
    highlight: true,
  },
  {
    name: 'Clinic',
    price: 'Coming soon',
    cadence: '',
    tagline: 'For group practices & studios.',
    features: ['Multiple tutors, one studio', 'Shared team calendar', 'Studio admin & reporting'],
    note: 'In development — register your interest and we\'ll keep you posted.',
    cta: 'Register interest',
    highlight: false,
  },
]

const FAQ = [
  { q: 'Do I have to pay to start?', a: 'No. Starter is free — run your whole practice on it. You only pay if you choose a plan with extra tools.' },
  { q: 'Do you take a commission?', a: 'No. We take no commission on your lessons — you keep what you charge. You pay a flat monthly plan for the software; the only per-lesson cost is Stripe\'s standard card-processing fee, which we keep none of.' },
  { q: 'Can I cancel any time?', a: 'Yes. No lock-in. If you cancel a paid plan it simply runs to the end of the period, then drops to Starter — your students and records stay with you.' },
  { q: 'Are my students mine?', a: 'Always. You own the relationship and the records. fair-do is your tool, never a middleman.' },
]

export default function PricingPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  return (
    <>
      <SiteNav />
      <main className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900">Simple, fair pricing</h1>
            <p className="text-sand-700 mt-4">Start free and pay as you grow. No lock-in, no surprises — and we grow only when you do.</p>
          </div>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral-50 border border-coral-200 text-coral-700 text-sm font-medium px-4 py-1.5">
              🚀 Founding pricing — locked for early tutors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {TIERS.map(t => (
              <div
                key={t.name}
                className={`rounded-3xl border p-7 shadow-sm bg-white flex flex-col ${t.highlight ? 'border-brand-400 ring-1 ring-brand-200' : 'border-sand-200'}`}
              >
                {t.highlight && <span className="self-start text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full mb-3">Most popular</span>}
                <h2 className="font-display text-xl font-semibold text-brand-900">{t.name}</h2>
                <p className="text-sm text-sand-600 mt-1 mb-4">{t.tagline}</p>
                <div className="mb-5">
                  <span className="font-display text-4xl font-semibold text-brand-900">
                    {'pricePence' in t && t.pricePence ? <LocalPrice minor={t.pricePence} base="GBP" whole approxClassName="text-lg font-normal text-sand-400" /> : t.price}
                  </span>
                  <span className="text-sand-500">{t.cadence}</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {t.features.map(f => (
                    <li key={f} className="flex gap-2 text-sm text-sand-700"><span className="text-brand-600" aria-hidden>✓</span>{f}</li>
                  ))}
                </ul>
                <p className="text-xs text-sand-500 mb-5">{t.note}</p>
                <Link
                  href={t.name === 'Clinic' ? 'mailto:support@fair-do.com' : '/sign-up?role=therapist'}
                  className={`text-center py-3 rounded-full font-medium transition ${t.highlight ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' : 'border border-brand-200 text-brand-700 hover:bg-brand-50'}`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-sand-400 mt-6">Prices shown are launch pricing and may change. Founding tutors keep their rate.</p>

          <div className="text-center mt-8 flex flex-col sm:flex-row gap-x-8 gap-y-2 justify-center">
            <Link href="/pricing/explained" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
              See exactly what you&apos;ll keep →
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
              How fair-do compares →
            </Link>
          </div>

          <div className="max-w-2xl mx-auto mt-16">
            <h2 className="font-display text-2xl font-semibold text-brand-900 text-center mb-6">Questions</h2>
            <div className="space-y-3">
              {FAQ.map(f => (
                <details key={f.q} className="group bg-white rounded-2xl border border-sand-200 shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-medium text-sand-800 hover:bg-sand-50">
                    {f.q}
                    <span className="shrink-0 text-brand-600 transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-sand-700 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/sign-up?role=therapist" className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              Start free →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
