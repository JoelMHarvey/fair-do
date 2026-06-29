import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/SiteFooter'
import { isFounder, DOC_GROUPS, buildSearchIndex } from '@/lib/founder'
import DocSearch from './DocSearch'

export const metadata = { title: 'Business documentation — Faresay', robots: { index: false, follow: false } }

export default async function FounderDocsIndex() {
  if (!(await isFounder())) notFound()

  const index = await buildSearchIndex()

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-2">Founder · private</p>
          <h1 className="font-display text-4xl font-semibold text-brand-900">Business documentation</h1>
          <p className="text-sand-700 mt-3 mb-6">
            Strategy, both business models, the UK launch pack, draft policies and internal context —
            all in one place. Visible only to you.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/founder/health" className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> System health &amp; live metrics →
            </Link>
            <Link href="/founder/architecture" className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition">
              <span className="w-2 h-2 rounded-full bg-brand-600" /> System diagrams →
            </Link>
            <Link href="/founder/brand" className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition">
              <span className="w-2 h-2 rounded-full bg-coral-500" /> Brand assets →
            </Link>
            <Link href="/founder/health#e2e" className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> E2E tests →
            </Link>
          </div>

          <DocSearch groups={DOC_GROUPS} index={index} />

          <p className="text-xs text-sand-400 mt-12">
            Drafts, not legal advice. Source of truth lives in the project repo; this is a read-only view.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
