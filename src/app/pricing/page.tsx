import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { PARENT_PORTAL_ENABLED } from '@/lib/parent'
import { LocalPrice } from '@/components/LocalPrice'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return { title: meta.pricing.title, description: meta.pricing.description, alternates: await localeAlternates('/pricing') }
}

// Structural tier config — copy lives in the dictionary (pricing.tiers[id]).
// pricePence drives LocalPrice; enterprise has no pricePence so c.price ("Custom") is shown.
const TIERS = [
  { id: 'free', highlight: false },
  { id: 'pro', pricePence: 2900, highlight: true },
  { id: 'school', pricePence: 7900, highlight: false },
  { id: 'enterprise', highlight: false },
] as const

export default async function PricingPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { pricing } = await getDictionary(await getLocaleFromHeaders())

  return (
    <>
      <SiteNav />
      <main id="main-content" className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900">{pricing.h1}</h1>
            <p className="text-sand-700 mt-4">{pricing.lead}</p>
          </div>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral-50 border border-coral-200 text-coral-700 text-sm font-medium px-4 py-1.5">
              {pricing.founding_badge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {TIERS.map(t => {
              const c = pricing.tiers[t.id]
              return (
                <div
                  key={t.id}
                  className={`rounded-3xl border p-7 shadow-sm bg-white flex flex-col ${t.highlight ? 'border-brand-400 ring-1 ring-brand-200' : 'border-sand-200'}`}
                >
                  {t.highlight && <span className="self-start text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full mb-3">{pricing.most_popular}</span>}
                  <h2 className="font-display text-xl font-semibold text-brand-900">{c.name}</h2>
                  <p className="text-sm text-sand-600 mt-1 mb-4">{c.tagline}</p>
                  <div className="mb-5">
                    <span className="font-display text-4xl font-semibold text-brand-900">
                      {'pricePence' in t && t.pricePence ? <LocalPrice minor={t.pricePence} base="GBP" whole approxClassName="text-lg font-normal text-sand-500" /> : c.price}
                    </span>
                    <span className="text-sand-500">{c.cadence}</span>
                  </div>
                  <ul className="space-y-2 mb-5 flex-1">
                    {c.features.map(f => (
                      <li key={f} className="flex gap-2 text-sm text-sand-700"><span className="text-brand-600" aria-hidden>✓</span>{f}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-sand-500 mb-5">{c.note}</p>
                  <Link
                    href={t.id === 'enterprise' ? 'mailto:support@fair-do.com' : '/sign-up?role=teacher'}
                    className={`text-center py-3 rounded-full font-medium transition ${t.highlight ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' : 'border border-brand-200 text-brand-700 hover:bg-brand-50'}`}
                  >
                    {c.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="text-center text-xs text-sand-600 mt-6">{pricing.prices_note}</p>

          <div className="text-center mt-8 flex flex-col sm:flex-row gap-x-8 gap-y-2 justify-center">
            <Link href="/pricing/explained" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
              {pricing.link_explained}
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
              {pricing.link_compare}
            </Link>
            {PARENT_PORTAL_ENABLED && (
              <Link href="/pricing/parents" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
                {pricing.link_parents}
              </Link>
            )}
          </div>

          <div className="max-w-2xl mx-auto mt-16">
            <h2 className="font-display text-2xl font-semibold text-brand-900 text-center mb-6">{pricing.faq_heading}</h2>
            <div className="space-y-3">
              {pricing.faq_items.map(f => (
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
            <Link href="/sign-up?role=teacher" className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              {pricing.cta_button}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
