import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Help & FAQs — fair-do',
  description: 'Find your way around fair-do — how tutoring works, pricing, finding a tutor, and how to get in touch.',
}

const LINKS = [
  { name: 'How tutoring works', detail: 'Subjects, levels and what a lesson looks like.', href: '/styles' },
  { name: 'Find a tutor', detail: 'Answer one short question and get matched.', href: '/sign-up' },
  { name: 'Pricing', detail: 'Simple, fair pricing — and exactly what you keep.', href: '/pricing' },
  { name: 'Thinking about an AI tutor?', detail: 'An honest look at what AI can and can\'t do.', href: '/ai-therapy' },
  { name: 'Raise a concern', detail: 'Tell us if something has gone wrong.', href: '/complaints' },
  { name: 'Terms & privacy', detail: 'How fair-do works and how we handle your data.', href: '/terms' },
]

const FAQ = [
  { q: 'How do I find the right tutor?', a: 'Tell us the subject and level you need and we\'ll match you with tutors who fit. You can read each tutor\'s profile, see their qualifications, and switch at any time if it isn\'t the right fit.' },
  { q: 'How do lessons happen?', a: 'Lessons are booked and held through fair-do, including secure video for online tuition. Your tutor sets their own availability, and you\'ll get reminders before each lesson.' },
  { q: 'Are tutors qualified and checked?', a: 'Tutors hold recognised teaching qualifications (such as QTS, PGCE or a relevant subject degree) and, where they work with children, an appropriate DBS check. Details are shown on each tutor\'s profile.' },
  { q: 'How much does it cost?', a: 'Tutors set their own fees, which you\'ll see before you book. See our pricing page for how the platform itself works.' },
  { q: 'How do I get in touch?', a: 'Email us at support@fair-do.com and we\'ll be glad to help.' },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/90 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Home</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">Help &amp; FAQs</h1>
        <p className="text-sand-600 mb-8">Everything you need to get started with fair-do. Can&apos;t find an answer? Email us any time.</p>

        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">Quick links</h2>
        <div className="space-y-3 mb-10">
          {LINKS.map(r => (
            <Link key={r.name} href={r.href} className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
              <p className="font-medium text-brand-900">{r.name}</p>
              <p className="text-sm text-sand-600 mt-1">{r.detail}</p>
            </Link>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">Common questions</h2>
        <div className="space-y-3 mb-10">
          {FAQ.map(f => (
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
          <p className="font-medium text-brand-800 mb-1">Still need a hand?</p>
          <p>
            Email us at <a href="mailto:support@fair-do.com" className="text-brand-700 underline">support@fair-do.com</a> and we&apos;ll get back to you. Looking for a tutor? <Link href="/sign-up" className="text-brand-700 underline">Get matched</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
