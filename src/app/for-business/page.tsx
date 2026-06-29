import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'Faresay for Business — affordable employee therapy',
  description: 'Give your team access to verified UK therapists. Transparent per-session pricing, no per-seat lock-in, simple invoicing.',
}

const BENEFITS = [
  { icon: '💷', title: 'Pay for what\'s used', body: 'No fixed per-seat fees. Top up a shared credit pool and your team draws from it as they need support.' },
  { icon: '🔒', title: 'Private by design', body: 'You see usage totals, never who attended or what was discussed. UK GDPR special-category data stays protected.' },
  { icon: '✓', title: 'Verified therapists only', body: 'Every therapist holds current BACP, UKCP, BPS or NCPS registration. Verified before they ever take a booking.' },
  { icon: '📊', title: 'Simple reporting', body: 'Monthly invoice, utilisation summary, and spend — everything finance needs, nothing they don\'t.' },
]

export default function ForBusinessPage() {
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-coral-50 px-4 py-1.5 text-sm font-medium text-coral-600">
            🎉 10% off all sessions for your first month
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 mt-6 leading-tight">
            Mental health support<br />your team will actually use
          </h1>
          <p className="text-lg text-sand-700 mt-6 max-w-xl mx-auto">
            EAPs are expensive and barely touched. Faresay gives your people real therapists at a fair price — and you only pay for sessions taken.
          </p>
          <div className="mt-9">
            <a
              href="mailto:business@faresay.com?subject=Faresay%20for%20Business"
              className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BENEFITS.map(b => (
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
          <h2 className="font-display text-3xl font-semibold text-center mb-10">How it works</h2>
          <div className="space-y-4">
            {[
              ['Fund a credit pool', 'Top up an amount that suits your headcount. Credits never expire.'],
              ['Invite your team', 'Staff join with their work email and book the therapist that fits them.'],
              ['Sessions draw from the pool', 'Each booking is covered automatically — no expense claims, no friction.'],
              ['Monthly summary', 'You get utilisation and spend. Always anonymised.'],
            ].map(([t, b], i) => (
              <div key={t} className="flex gap-4 items-start bg-brand-800/50 border border-brand-700/40 rounded-2xl p-5">
                <span className="font-display text-2xl font-semibold text-coral-300 shrink-0">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-brand-100/80 text-sm mt-1">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center px-5">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-4">Ready to look after your team?</h2>
        <p className="text-sand-600 mb-8 max-w-md mx-auto">Tell us your headcount and we&apos;ll size a plan. No sales theatre.</p>
        <a
          href="mailto:business@faresay.com?subject=Faresay%20for%20Business"
          className="inline-block bg-brand-600 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
        >
          business@faresay.com
        </a>
        <p className="mt-6 flex gap-5 justify-center text-sm">
          <Link href="/org" className="text-brand-700 hover:text-brand-800 font-medium">Already a customer? Manage your plan →</Link>
        </p>
        <p className="mt-2"><Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Back home</Link></p>
      </section>

      <SiteFooter />
    </>
  )
}
