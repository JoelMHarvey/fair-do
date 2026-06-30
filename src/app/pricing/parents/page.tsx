import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { PARENT_PORTAL_ENABLED, PARENT_PORTAL_PRICE_PENCE } from '@/lib/parent'
import { LocalPrice } from '@/components/LocalPrice'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return {
    title: meta.pricing_parents.title,
    description: meta.pricing_parents.description,
    alternates: await localeAlternates('/pricing/parents'),
  }
}

export default async function ParentPricingPage() {
  if (!PARENT_PORTAL_ENABLED) notFound()
  const { pricing } = await getDictionary(await getLocaleFromHeaders())
  const c = pricing.parents

  return (
    <>
      <SiteNav />
      <main className="bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium px-4 py-1.5 mb-4">
              {c.eyebrow}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900">{c.h1}</h1>
            <p className="text-sand-700 mt-4">{c.lead}</p>
          </div>

          <div className="rounded-3xl border border-brand-400 ring-1 ring-brand-200 bg-white shadow-sm p-7 sm:p-9">
            <div className="mb-6">
              <span className="font-display text-5xl font-semibold text-brand-900">
                <LocalPrice minor={PARENT_PORTAL_PRICE_PENCE} base="GBP" approxClassName="text-lg font-normal text-sand-400" />
              </span>
              <span className="text-sand-500">{c.cadence}</span>
              <p className="text-sm text-brand-700 mt-2 font-medium">{c.price_note}</p>
            </div>

            <ul className="space-y-2.5 mb-2">
              {c.features.map(f => (
                <li key={f} className="flex gap-2 text-sm text-sand-700"><span className="text-brand-600" aria-hidden>✓</span>{f}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-sand-100 border border-sand-200 p-6 mt-6 text-center">
            <p className="font-display text-lg font-semibold text-brand-900">{c.cta}</p>
            <p className="text-sm text-sand-600 mt-1">{c.cta_note}</p>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-800 underline underline-offset-4">
              {c.back_link}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
