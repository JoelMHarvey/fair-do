import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { POSTS } from '@/lib/blog'

export const metadata = {
  title: 'The fair-do blog — tutoring, plainly explained',
  description: 'Honest, plain-English writing about tutoring, learning, exams, and finding the right tutor — from the team building fairer private tuition.',
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <>
      <SiteNav />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">The fair-do blog</h1>
          <p className="text-lg text-sand-700 mt-6">Tutoring, plainly explained. No jargon, no judgement.</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-16 space-y-4">
        {posts.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block bg-white rounded-3xl border border-sand-200 p-6 sm:p-7 shadow-sm hover:border-brand-300 transition">
            <p className="text-xs text-sand-500 mb-2">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {p.readMins} min read</p>
            <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">{p.title}</h2>
            <p className="text-sand-600">{p.description}</p>
            <span className="inline-block mt-3 text-sm font-medium text-brand-700">Read →</span>
          </Link>
        ))}
      </div>
      <SiteFooter />
    </>
  )
}
