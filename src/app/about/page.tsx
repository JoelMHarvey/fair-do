import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

const baseMetadata: Metadata = {
  title: 'About — fair-do',
  description: 'We are technologists with a heart. Tutors should earn enough to focus on teaching, good tuition should reach more people, and no company should get rich off the work tutors do.',
}

export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, alternates: await localeAlternates('/about') }
}

export default async function AboutPage() {
  const { about } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">{about.eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            {about.h1}
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            {about.lead}
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-20">
        <div className="prose prose-sand max-w-none space-y-6 text-sand-700 leading-relaxed text-[17px]">
          <p>{about.p1}</p>
          <p>{about.p2}</p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">{about.believe_heading}</h2>
          <div className="space-y-4">
            {about.beliefs.map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-sand-200 p-5">
                <p className="font-medium text-brand-800 mb-1">{title}</p>
                <p className="text-sand-600 text-[16px]">{body}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">{about.trust_heading}</h2>
          <p>
            {about.trust_body_pre}<strong>{about.trust_body_strong}</strong>{about.trust_body_post}
          </p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">{about.data_heading}</h2>
          <p>
            {about.data_body_pre}<Link href="/privacy" className="text-brand-700 underline">{about.privacy_link}</Link>{about.data_body_post}
          </p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">{about.hello_heading}</h2>
          <p>
            {about.hello_body}<a href="mailto:hello@fair-do.com" className="text-brand-700 underline">hello@fair-do.com</a>
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            {about.cta}
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
