import { notFound } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import { isFounder, readDoc, docTitle } from '@/lib/founder'

export const metadata = { robots: { index: false, follow: false } }

// Repoint intra-doc markdown links at the founder portal; neutralise non-page links.
function prep(md: string): string {
  return md
    .replace(/\]\((?:\.\/)?([A-Za-z0-9_-]+)\.md\)/g, (_m, name: string) => `](/founder/${name.toLowerCase()})`)
    .replace(/\]\(([A-Za-z0-9_./-]+)\.csv\)/g, '] (download in repo)')
    .replace(/\]\((\.claude\/[^)]+)\)/g, '] (in project repo)')
}

export default async function FounderDoc({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!(await isFounder())) notFound()

  const md = await readDoc(slug)
  if (md == null) notFound()

  const html = await marked.parse(prep(md), { gfm: true })
  const title = docTitle(slug) ?? 'Document'

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
          <Link href="/founder" className="text-sm text-brand-700 hover:underline">← All documents</Link>
          <h1 className="font-display text-3xl font-semibold text-brand-900 mt-3 mb-8">{title}</h1>
          <article className="doc-prose" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="mt-12 pt-6 border-t border-sand-200">
            <Link href="/founder" className="text-sm text-brand-700 hover:underline">← All documents</Link>
          </div>
        </div>
      </main>
    </>
  )
}
