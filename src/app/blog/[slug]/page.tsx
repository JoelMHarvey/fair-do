import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getPost, POSTS } from '@/lib/blog'
import { ldJson } from '@/lib/jsonld'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Not found' }
  return { title: `${post.title} — Faresay`, description: post.description }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { '@type': 'Organization', name: 'Faresay' },
            url: `https://faresay.com/blog/${post.slug}`,
          }),
        }}
      />
      <SiteNav />
      <article className="max-w-2xl mx-auto px-5 sm:px-8 pt-16 pb-16">
        <Link href="/blog" className="text-sm text-sand-500 hover:text-brand-700">← All articles</Link>
        <p className="text-xs text-sand-500 mt-6 mb-2">{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readMins} min read</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 leading-tight mb-6">{post.title}</h1>

        <div className="space-y-6 text-sand-700 leading-relaxed text-[17px]">
          {post.sections.map((s, i) => (
            <div key={i}>
              {s.h && <h2 className="font-display text-xl font-semibold text-brand-900 mb-2 mt-8">{s.h}</h2>}
              {s.p.map((para, j) => <p key={j} className="mb-3">{para}</p>)}
            </div>
          ))}
        </div>

        <div className="bg-coral-50 border border-coral-200 rounded-2xl p-5 mt-10 text-sm text-sand-700">
          If you need help right now, please see <Link href="/help" className="text-brand-700 underline">urgent support</Link>. Faresay is not a crisis service.
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mt-6 text-center">
          <p className="text-sand-700 mb-4">Ready to talk to someone? Get matched with a verified therapist in minutes.</p>
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition">Find your therapist</Link>
        </div>
      </article>
      <SiteFooter />
    </>
  )
}
