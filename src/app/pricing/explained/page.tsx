import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { PRACTICE_TIERS } from '@/lib/billing'

export const metadata = {
  title: 'What you\'ll keep — fair-do pricing in plain English',
  description: 'Exactly how fair-do pricing works: a flat monthly plan, no per-lesson commission, and Stripe\'s standard processing fee — with worked examples of what lands in your bank.',
}

const gbp = (pence: number) => `£${(pence / 100).toFixed(2)}`
const gbp0 = (pence: number) => `£${Math.round(pence / 100)}`

// UK card, Stripe Standard pricing (1.5% + 20p). Illustrative — Stripe's actual
// fee varies by card type (EEA/international higher).
const stripeFee = (pence: number) => Math.round(pence * 0.015) + 20
const commission = (pence: number, bps: number) => Math.round((pence * bps) / 10000)
const youKeep = (pence: number, bps: number) => pence - stripeFee(pence) - commission(pence, bps)

const EXAMPLES = [5000, 8000] // £50 and £80 sessions

export default function PricingExplainedPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  return (
    <>
      <SiteNav />
      <main className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <Link href="/pricing" className="text-sm text-sand-500 hover:text-brand-700">← Pricing</Link>
          <h1 className="font-display text-4xl font-semibold text-brand-900 mt-4">What you&apos;ll actually keep</h1>
          <p className="text-lg text-sand-700 mt-4 leading-relaxed">
            No marketplace cut, no surprises. You set your own price and keep it — minus only the card-processing
            costs. Here&apos;s the whole picture in plain English.
          </p>

          {/* Three numbers */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-12 mb-4">Three numbers, that&apos;s it</h2>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-900">1. Your monthly plan</p>
              <p className="text-sm text-sand-600 mt-1">
                Free on Starter, {gbp0(2900)}/month on Practice, {gbp0(7900)}/month on Clinic. A flat fee for the
                software — nothing to do with how much you earn. Cancel any time.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-900">2. No per-lesson commission</p>
              <p className="text-sm text-sand-600 mt-1">
                We take <strong>no commission</strong> on your lessons — not a cut of your fee, not a referral fee,
                not a marketplace charge. You keep what you charge. The only per-lesson cost is Stripe&apos;s processing
                fee below, which we keep none of.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-900">3. Stripe&apos;s processing fee</p>
              <p className="text-sm text-sand-600 mt-1">
                Card payments are handled by Stripe, who charge roughly <strong>1.5% + 20p</strong> per UK-card
                payment (more for EEA/international cards). This goes to Stripe, not to us — it&apos;s the same fee any
                business pays to take cards.
              </p>
            </div>
          </div>

          {/* Worked example */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-12 mb-4">A worked example</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-6">
            <p className="text-sm text-sand-600 mb-4">You charge a student <strong className="text-brand-900">{gbp0(6000)}</strong> for a lesson, on the <strong>Practice</strong> plan (no commission):</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-sand-600">Student pays</span><span className="font-medium text-brand-900">{gbp(6000)}</span></div>
              <div className="flex justify-between"><span className="text-sand-600">− Stripe processing (~1.5% + 20p)</span><span className="text-coral-600">−{gbp(stripeFee(6000))}</span></div>
              <div className="flex justify-between"><span className="text-sand-600">− fair-do commission</span><span className="text-brand-700">£0.00</span></div>
              <div className="border-t border-sand-200 pt-2 flex justify-between"><span className="font-medium text-brand-900">Lands in your bank</span><span className="font-display text-lg font-semibold text-brand-700">≈ {gbp(youKeep(6000, 0))}</span></div>
            </div>
            <p className="text-xs text-sand-400 mt-4">Your {gbp0(2900)}/month plan is separate — across a typical week of lessons it works out to pennies per lesson.</p>
          </div>

          {/* Per-tier table */}
          <h2 className="font-display text-2xl font-semibold text-brand-900 mt-12 mb-4">What you keep, per plan</h2>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-50 text-sand-600 text-left">
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Commission</th>
                  {EXAMPLES.map(p => <th key={p} className="px-4 py-3 font-medium text-right">{gbp0(p)} lesson</th>)}
                </tr>
              </thead>
              <tbody>
                {PRACTICE_TIERS.map((t, i) => (
                  <tr key={t.id} className={i > 0 ? 'border-t border-sand-100' : ''}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-brand-900">{t.name}</span>
                      <span className="text-sand-400"> · {t.pricePence ? `${gbp0(t.pricePence)}/mo` : 'free'}</span>
                    </td>
                    <td className="px-4 py-3 text-sand-600">{(t.commissionBps / 100).toFixed(t.commissionBps % 100 ? 1 : 0)}%</td>
                    {EXAMPLES.map(p => (
                      <td key={p} className="px-4 py-3 text-right font-medium text-brand-700">≈ {gbp(youKeep(p, t.commissionBps))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-sand-400 mt-3">
            &quot;You keep&quot; = the lesson price minus only Stripe&apos;s processing fee (we take no commission), before your monthly plan.
            Figures are illustrative for a UK-card payment at Stripe Standard pricing (1.5% + 20p); EEA/international
            cards cost a little more. You always set your own price and keep the relationship with your student.
          </p>

          <div className="mt-12 text-center">
            <Link href="/sign-up?role=teacher" className="inline-block bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              Start free
            </Link>
            <p className="text-sm text-sand-500 mt-3">Free to start · keep your own students · cancel any time</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
