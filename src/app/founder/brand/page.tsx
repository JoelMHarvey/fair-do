import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { isFounder } from '@/lib/founder'

export const metadata = { title: 'Brand assets — fair-do', robots: { index: false, follow: false } }

type Item = { file: string; href?: string; name: string; type: string; image: boolean; pad?: boolean; wide?: boolean }
type Group = { title: string; note?: string; items: Item[] }

const GROUPS: Group[] = [
  {
    title: 'Logo & icons',
    items: [
      { file: 'fair-do-logo-mark.svg', name: 'Logo mark', type: 'SVG · vector', image: true, pad: true },
      { file: 'fair-do-icon-512.png', name: 'App icon (large)', type: 'PNG · 512', image: true, pad: true },
      { file: 'fair-do-icon-192.png', name: 'App icon', type: 'PNG · 192', image: true, pad: true },
      { file: 'fair-do-apple-touch-180.png', name: 'Apple touch icon', type: 'PNG · 180', image: true, pad: true },
      { file: 'opengraph-image', href: '/opengraph-image', name: 'Social / OG card', type: 'PNG · 1200×630 · live', image: true },
    ],
  },
  {
    title: 'Design tokens',
    items: [
      { file: 'fair-do-brand-tokens.css', name: 'Brand tokens', type: 'CSS · colours + fonts', image: false },
    ],
  },
]

export default async function FounderBrandPage() {
  if (!(await isFounder())) notFound()

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-2">Founder · private</p>
          <h1 className="font-display text-4xl font-semibold text-brand-900">Brand assets</h1>
          <p className="text-sand-700 mt-3 mb-6">
            Logo, app icons, and the brand tokens — for partners, press, and ad creative. Click any to download.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/founder"
              className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition"
            >
              ← Back to docs
            </Link>
          </div>
          <div className="rounded-2xl border border-coral-200 bg-coral-50/60 px-5 py-4 mb-12 text-sm text-sand-700">
            <span className="font-medium text-coral-700">Not yet built:</span> a social media kit (LinkedIn/Instagram/X/YouTube templates
            at native pixel sizes) and printable brand-guideline cards. The full spec for these lives in{' '}
            <Link href="/founder/marketing-assets" className="text-brand-700 underline hover:text-brand-800">
              Visual Asset Briefs
            </Link>{' '}
            — this is a design-production pass (Canva or a designer), not a code change.
          </div>

          <div className="space-y-12">
            {GROUPS.map((g) => (
              <section key={g.title}>
                <h2 className="font-display text-lg font-semibold text-brand-900">{g.title}</h2>
                {g.note && <p className="text-sand-500 text-sm mb-4">{g.note}</p>}
                <div className={`grid gap-4 ${g.note ? 'mt-2' : 'mt-4'} grid-cols-2 sm:grid-cols-3`}>
                  {g.items.map((a) => {
                    const href = a.href ?? `/brand/${a.file}`
                    return (
                      <a
                        key={a.file}
                        href={href}
                        download
                        className={`group bg-white rounded-2xl border border-sand-200 hover:border-brand-300 hover:shadow-sm transition p-4 flex flex-col ${a.wide ? 'sm:col-span-2' : ''}`}
                      >
                        <div className={`${a.wide ? 'h-28' : 'h-32'} rounded-xl bg-sand-50 border border-sand-100 flex items-center justify-center overflow-hidden ${a.pad ? 'p-4' : 'p-2'}`}>
                          {a.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={href} alt={a.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="font-mono text-xs text-sand-500">{'{ }'} tokens</span>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-medium text-brand-900">{a.name}</p>
                        <p className="text-xs text-sand-500">{a.type}</p>
                        <span className="mt-2 text-xs font-medium text-brand-600 group-hover:text-brand-700">Download ↓</span>
                      </a>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <p className="text-xs text-sand-400 mt-12">
            Generated from the fair-do codebase (globals.css tokens, app icons). Source of truth is the repo.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
