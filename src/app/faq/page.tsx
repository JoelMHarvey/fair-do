import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'FAQ — fair-do',
  description: 'Common questions about fair-do: what it is, pricing, student ownership, data security, and getting set up as a tutor.',
}

export default async function FaqPage() {
  const { faq } = await getDictionary(await getLocaleFromHeaders())
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-10">{faq.heading}</h1>

          <div className="space-y-5">
            {faq.items.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-sand-200 p-6 shadow-sm">
                <h2 className="font-display font-semibold text-brand-900 mb-2">{q}</h2>
                <p className="text-sand-700 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-sm text-sand-500">
            {faq.footer_pre}{' '}
            <Link href="/pricing" className="text-brand-700 hover:underline">{faq.footer_link}</Link>{faq.footer_mid}{' '}
            <a href="mailto:hello@fair-do.com" className="text-brand-700 hover:underline">hello@fair-do.com</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
