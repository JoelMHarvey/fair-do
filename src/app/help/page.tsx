import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export const metadata = {
  title: 'Help & FAQs — fair-do',
  description: 'Find your way around fair-do — how tutoring works, pricing, finding a tutor, and how to get in touch.',
}

export default async function HelpPage() {
  const { help } = await getDictionary(await getLocaleFromHeaders())
  const links = [
    { name: help.link_works_name, detail: help.link_works_detail, href: '/styles' },
    { name: help.link_find_name, detail: help.link_find_detail, href: '/sign-up' },
    { name: help.link_pricing_name, detail: help.link_pricing_detail, href: '/pricing' },
    { name: help.link_ai_name, detail: help.link_ai_detail, href: '/ai-tutoring' },
    { name: help.link_concern_name, detail: help.link_concern_detail, href: '/complaints' },
    { name: help.link_terms_name, detail: help.link_terms_detail, href: '/terms' },
  ]
  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/90 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">{help.nav_home}</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">{help.heading}</h1>
        <p className="text-sand-600 mb-8">{help.intro}</p>

        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">{help.quick_links_heading}</h2>
        <div className="space-y-3 mb-10">
          {links.map(r => (
            <Link key={r.name} href={r.href} className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
              <p className="font-medium text-brand-900">{r.name}</p>
              <p className="text-sm text-sand-600 mt-1">{r.detail}</p>
            </Link>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">{help.common_questions_heading}</h2>
        <div className="space-y-3 mb-10">
          {help.faq.map(f => (
            <details key={f.q} className="group bg-white rounded-2xl border border-sand-200">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-medium text-sand-800 hover:bg-sand-50">
                {f.q}
                <span className="shrink-0 text-brand-600 transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-sand-700 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-sm text-sand-700">
          <p className="font-medium text-brand-800 mb-1">{help.still_heading}</p>
          <p>
            {help.still_body_pre}<a href="mailto:support@fair-do.com" className="text-brand-700 underline">support@fair-do.com</a>{help.still_body_mid}<Link href="/sign-up" className="text-brand-700 underline">{help.still_body_link}</Link>{help.still_body_post}
          </p>
        </div>
      </div>
    </main>
  )
}
