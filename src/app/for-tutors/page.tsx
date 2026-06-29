import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'How fair-do works — the calm tool for independent tutors',
  description:
    'See how fair-do helps you run your whole tutoring business — your own students, scheduling, secure video, payments and reminders, on web and phone. Private, simple, and fair. Start free.',
}

const FEATURES = [
  {
    icon: '🤝',
    title: 'Your students stay yours',
    body: 'You own the relationship and the record — full stop. fair-do is the software you run your tutoring with, never a middleman who owns your students or rents them back to you. If you ever leave, your student list and your notes go with you.',
  },
  {
    icon: '🧰',
    title: 'Everything in one place',
    body: 'Your students, your schedule, secure video, payments and automatic reminders — all in a single calm place. No more stitching together a calendar, a video app, a card reader and a spreadsheet, and hoping they keep in step.',
  },
  {
    icon: '🪶',
    title: 'Genuinely simple',
    body: 'Set up in about 15 minutes, with no tech skills needed. Every page is written in plain English, with help right where you are — no manuals, no jargon. And because it installs as an app on your phone, you can run the whole thing from your pocket.',
  },
  {
    icon: '🔒',
    title: 'Private and secure',
    body: 'Everything is encrypted, with UK/EU data residency and appropriate safeguards for any services outside the UK. You stay in control: you are the data controller for your students\' information, and fair-do is simply your processor. We never sell or share what your students trust you with.',
  },
  {
    icon: '💷',
    title: 'Set your own prices',
    body: 'Your tutoring, your rates. Charge what you\'re worth, set a different price for a particular student if you like, or offer a package of lessons. You decide — we just make it easy to take the payment.',
  },
  {
    icon: '⚡',
    title: 'Get paid automatically',
    body: 'Students pay by card and the money lands in your bank through Stripe, about two business days after each lesson. No invoices to chase, no end-of-month reconciling. You keep what you charge — fair-do is a flat monthly subscription, not a cut of your lessons.',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Add your students',
    body: 'Invite them by email or bring your whole list across. You own the relationship and the records — your tutoring runs on your terms.',
  },
  {
    n: 2,
    title: 'Book lessons',
    body: 'Pick a time and fair-do creates a private, secure video room and emails your student the details. Reminders go out on their own.',
  },
  {
    n: 3,
    title: 'Get paid',
    body: 'Connect payments once. After each lesson the fee is taken and paid out to your bank — no chasing, no spreadsheets.',
  },
]

export default function ForTutorsPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-coral-100/40 blur-3xl" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            How fair-do works
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] text-brand-900 mt-6">
            Run your whole tutoring business,
            <br />
            <span className="text-brand-600">the gentle way.</span>
          </h1>
          <p className="text-lg sm:text-xl text-sand-700 mt-6 max-w-xl mx-auto leading-relaxed">
            fair-do is the calm, private software you use to run your own
            tutoring — your students, scheduling, secure video, payments
            and reminders, together in one place. On your computer and on your
            phone. Built for you, not for shareholders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <Link
              href="/sign-up?role=teacher"
              className="bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-3.5 rounded-full font-medium text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
            >
              See pricing
            </Link>
          </div>
          <p className="text-sm text-sand-500 mt-4">
            Free to start · set up in ~15 minutes · keep your own students
          </p>
        </div>
      </section>

      {/* Feature deep-dive */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">
          Everything your tutoring needs
        </h2>
        <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">
          A closer look at how fair-do takes the admin off your plate, so you
          can give your attention to the work that matters.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl border border-sand-200 p-7 shadow-sm"
            >
              <div className="text-3xl mb-3" aria-hidden>
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-brand-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sand-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethos — made by people with heart */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-brand-200 text-sm font-medium uppercase tracking-wide mb-3">
            Made by people with heart
          </p>
          <p className="font-display text-2xl sm:text-3xl font-medium leading-snug">
            We believe tutors deserve better tools and fairer terms.
            fair-do only grows when you grow — so there&rsquo;s no lock-in, no hidden
            games, and no company getting rich off your hard work. Keep your
            students, keep your records, and leave whenever you like.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display text-3xl font-semibold text-brand-900 text-center mb-3">
            Up and running this week
          </h2>
          <p className="text-sand-600 text-center max-w-xl mx-auto mb-12">
            Three small steps — that&rsquo;s the whole thing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-sm text-sand-600 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy band */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="text-3xl mb-3" aria-hidden>
            🔒
          </div>
          <h2 className="font-display text-2xl font-semibold text-brand-900 mb-2">
            Privacy you can stand behind
          </h2>
          <p className="text-sand-600 max-w-2xl mx-auto leading-relaxed">
            Your students trust you with their learning and their details.
            We treat their information with care — encrypted, with UK/EU data
            residency, and never sold or shared. You are the data controller;
            fair-do is your processor and nothing more. You stay in control of
            your records, always.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-sand-50 to-brand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-brand-900 mb-3">
            Start tutoring on fair-do
          </h2>
          <p className="text-sand-700 mb-8">
            Free to begin and fair as you grow. Set up in about 15 minutes, on
            web or phone — and we&rsquo;ll be here if you need a hand.
          </p>
          <Link
            href="/sign-up?role=teacher"
            className="inline-block bg-brand-600 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
          >
            Start free →
          </Link>
          <p className="text-sm text-sand-500 mt-6">
            Want the numbers first?{' '}
            <Link
              href="/pricing"
              className="text-brand-700 underline hover:text-brand-800"
            >
              See pricing
            </Link>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
