import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { localeAlternates } from '@/lib/i18n-seo'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return { title: meta.values.title, description: meta.values.description, alternates: await localeAlternates('/values') }
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-brand-900 mt-12 mb-4">{children}</h2>
}

export default async function ValuesPage() {
  const { values } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <article className="max-w-2xl mx-auto px-5 sm:px-8 py-16 text-sand-700 text-lg leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-3">{values.eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">{values.h1}</h1>
          <p className="mt-5">
            {values.intro}
          </p>

          <H>{values.bothered_heading}</H>
          <p>
            {values.bothered_p1}
          </p>
          <p className="mt-4">
            {values.bothered_p2}
          </p>
          <p className="mt-4">{values.bothered_p3}</p>

          <H>{values.believe_heading}</H>
          {values.beliefs.map(({ strong, body }, i) => (
            <p key={strong} className={i === 0 ? 'mt-2' : 'mt-4'}><strong className="text-brand-900">{strong}</strong> {body}</p>
          ))}

          <H>{values.promise_tutors_heading}</H>
          <p>{values.promise_tutors_intro}</p>
          {values.promise_tutors_points.map((point) => (
            <p key={point} className="mt-4">{point}</p>
          ))}

          <H>{values.promise_students_heading}</H>
          <p>{values.promise_students_intro}</p>
          {values.promise_students_points.map((point) => (
            <p key={point} className="mt-4">{point}</p>
          ))}

          <H>{values.going_heading}</H>
          <p>
            {values.going_p1}
          </p>
          <p className="mt-4">
            {values.going_p2}
          </p>
          <p className="mt-4">
            {values.going_p3}
          </p>

          <H>{values.hello_heading}</H>
          <p>{values.hello_body}</p>
          <p className="mt-3"><a href="mailto:hello@fair-do.com" className="text-brand-700 underline hover:text-brand-800">hello@fair-do.com</a></p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/for-tutors" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
              {values.cta_primary}
            </Link>
            <Link href="/sign-up" className="inline-block bg-white border border-sand-200 text-brand-800 px-6 py-3 rounded-full font-medium hover:border-brand-300 transition">
              {values.cta_secondary}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
