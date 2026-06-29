import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { isFounder } from '@/lib/founder'

export const metadata = { title: 'Brand assets — fair-do', robots: { index: false, follow: false } }

type Item = { file: string; name: string; type: string; image: boolean; pad?: boolean; wide?: boolean }
type Group = { title: string; note?: string; items: Item[] }

const GROUPS: Group[] = [
  {
    title: 'Logo & icons',
    items: [
      { file: 'fair-do-logo-mark.svg', name: 'Logo mark', type: 'SVG · vector', image: true, pad: true },
      { file: 'fair-do-icon-512.png', name: 'App icon (large)', type: 'PNG · 512', image: true, pad: true },
      { file: 'fair-do-icon-192.png', name: 'App icon', type: 'PNG · 192', image: true, pad: true },
      { file: 'fair-do-apple-touch-180.png', name: 'Apple touch icon', type: 'PNG · 180', image: true, pad: true },
      { file: 'fair-do-social-card.png', name: 'Social / OG card', type: 'PNG · 1200×630', image: true },
    ],
  },
  {
    title: 'Social media kit',
    note: 'Ready-to-post creative for each platform, at the right dimensions.',
    items: [
      { file: 'social/instagram-post.png', name: 'Instagram post', type: '1080×1080', image: true },
      { file: 'social/instagram-story.png', name: 'Instagram story', type: '1080×1920', image: true },
      { file: 'social/facebook-post.png', name: 'Facebook post', type: '1200×630', image: true },
      { file: 'social/facebook-cover.png', name: 'Facebook cover', type: '1640×624', image: true, wide: true },
      { file: 'social/linkedin-post.png', name: 'LinkedIn post', type: '1200×627', image: true },
      { file: 'social/linkedin-banner.png', name: 'LinkedIn banner', type: '1584×396', image: true, wide: true },
      { file: 'social/x-post.png', name: 'X post', type: '1600×900', image: true },
      { file: 'social/x-header.png', name: 'X header', type: '1500×500', image: true, wide: true },
      { file: 'social/youtube-thumbnail.png', name: 'YouTube thumbnail', type: '1280×720', image: true },
      { file: 'social/youtube-banner.png', name: 'YouTube banner', type: '2560×1440', image: true, wide: true },
    ],
  },
  {
    title: 'Brand guidelines',
    note: 'Reference cards — colours, type, spacing, logo, voice.',
    items: [
      { file: 'guidelines/color-brand.png', name: 'Brand colour scale', type: 'card', image: true, wide: true },
      { file: 'guidelines/color-accent.png', name: 'Accent colour', type: 'card', image: true, wide: true },
      { file: 'guidelines/color-sand.png', name: 'Sand scale', type: 'card', image: true, wide: true },
      { file: 'guidelines/color-semantic.png', name: 'Semantic colours', type: 'card', image: true, wide: true },
      { file: 'guidelines/type-display.png', name: 'Display type', type: 'card', image: true, wide: true },
      { file: 'guidelines/type-text.png', name: 'Text type', type: 'card', image: true, wide: true },
      { file: 'guidelines/spacing-scale.png', name: 'Spacing scale', type: 'card', image: true, wide: true },
      { file: 'guidelines/spacing-radii.png', name: 'Radii', type: 'card', image: true, wide: true },
      { file: 'guidelines/brand-logo.png', name: 'Logo usage', type: 'card', image: true, wide: true },
      { file: 'guidelines/brand-lotus.png', name: 'Lotus motif', type: 'card', image: true, wide: true },
      { file: 'guidelines/brand-voice.png', name: 'Voice', type: 'card', image: true, wide: true },
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
            Logo, icons, the full social media kit, guideline cards, and the brand tokens — for partners, press, and ad creative. Click any to download.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <a
              href="/brand/fair-do-brand-kit.zip"
              download
              className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-brand-700 transition shadow-sm"
            >
              Download the full kit (.zip) ↓
            </a>
            <Link
              href="/founder"
              className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-brand-300 rounded-full px-4 py-2 text-sm font-medium text-brand-800 transition"
            >
              ← Back to docs
            </Link>
          </div>

          <div className="space-y-12">
            {GROUPS.map((g) => (
              <section key={g.title}>
                <h2 className="font-display text-lg font-semibold text-brand-900">{g.title}</h2>
                {g.note && <p className="text-sand-500 text-sm mb-4">{g.note}</p>}
                <div className={`grid gap-4 ${g.note ? 'mt-2' : 'mt-4'} grid-cols-2 sm:grid-cols-3`}>
                  {g.items.map((a) => (
                    <a
                      key={a.file}
                      href={`/brand/${a.file}`}
                      download
                      className={`group bg-white rounded-2xl border border-sand-200 hover:border-brand-300 hover:shadow-sm transition p-4 flex flex-col ${a.wide ? 'sm:col-span-2' : ''}`}
                    >
                      <div className={`${a.wide ? 'h-28' : 'h-32'} rounded-xl bg-sand-50 border border-sand-100 flex items-center justify-center overflow-hidden ${a.pad ? 'p-4' : 'p-2'}`}>
                        {a.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/brand/${a.file}`} alt={a.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="font-mono text-xs text-sand-500">{'{ }'} tokens</span>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-brand-900">{a.name}</p>
                      <p className="text-xs text-sand-500">{a.type}</p>
                      <span className="mt-2 text-xs font-medium text-brand-600 group-hover:text-brand-700">Download ↓</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="text-xs text-sand-400 mt-12">
            Generated from the fair-do design system. Source of truth is the repo.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
