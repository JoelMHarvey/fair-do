import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'About — Faresay',
  description: 'We are technologists with a heart. Therapists should earn enough to focus on the work, therapy should reach more people, and no company should profit from human suffering.',
}

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-sand-50" />
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wide mb-3">Our story</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-900 leading-tight">
            Technologists with a heart
          </h1>
          <p className="text-lg text-sand-700 mt-6">
            We build software. But we built Faresay because something in this industry felt broken — and we couldn&apos;t look away.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-20">
        <div className="prose prose-sand max-w-none space-y-6 text-sand-700 leading-relaxed text-[17px]">
          <p>
            Therapy works. The evidence is overwhelming, and most of us have felt it ourselves or watched it change someone we love. We wanted to make it a little easier to reach — and a lot fairer for the people who provide it.
          </p>
          <p>
            Therapists train for years and carry the emotional weight of the work. We think they should be paid well enough to focus on it — not lose a slice of every session to a platform. So we built Faresay as fair, simple software therapists can afford: a flat monthly subscription, never a cut of your clinical fee.
          </p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">What we believe</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-800 mb-1">Therapists should earn enough to focus on the work</p>
              <p className="text-sand-600 text-[16px]">Not juggle three platforms, not burn out. Faresay is one affordable tool to run the whole practice — a flat monthly plan, not a cut of your sessions.</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-800 mb-1">Therapy should reach more people</p>
              <p className="text-sand-600 text-[16px]">Lower fees aren&apos;t a marketing trick — they&apos;re the point. When sessions cost less, more people who need help can actually get it.</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-200 p-5">
              <p className="font-medium text-brand-800 mb-1">No company should profit from human suffering</p>
              <p className="text-sand-600 text-[16px]">We take a small, transparent, fixed fee to keep the lights on — and nothing more. The pain people bring to therapy is not a margin to be optimised.</p>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">How we keep therapists trustworthy</h2>
          <p>
            Every therapist on Faresay holds current registration with <strong>BACP, UKCP, BPS, or NCPS</strong>. We check registration before a profile goes live, and keep a record of each check.
          </p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">Your data, treated with care</h2>
          <p>
            Mental health information is some of the most sensitive data there is. Sessions run over encrypted video. We store only what&apos;s necessary, never sell it, and never use suffering to sell ads. See our <Link href="/privacy" className="text-brand-700 underline">Privacy Policy</Link>.
          </p>

          <h2 className="font-display text-2xl font-semibold text-brand-900 !mb-3 !mt-12">Say hello</h2>
          <p>
            We&apos;re a small team and we read everything. <a href="mailto:hello@faresay.com" className="text-brand-700 underline">hello@faresay.com</a>
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
            Find your therapist
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
