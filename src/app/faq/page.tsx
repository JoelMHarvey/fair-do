import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'FAQ — Faresay',
  description: 'Common questions about Faresay: what it is, pricing, client ownership, data security, and getting set up as a therapist.',
}

const FAQS = [
  {
    q: 'What is Faresay?',
    a: 'Faresay is practice software for therapists. You bring your own clients and run your practice your way — Faresay gives you scheduling, secure video sessions, and card payments in one place. It\'s a tool you subscribe to, not a marketplace that finds clients for you.',
  },
  {
    q: 'How much does it cost?',
    a: 'Faresay is a monthly subscription. Starter is free, Practice is around £29/month, and Clinic is coming soon. On top of the plan, there\'s a small commission on card payments to cover processing. Full, current details are on our pricing page.',
  },
  {
    q: 'Are my clients mine?',
    a: 'Yes. The therapeutic relationship and your client records belong to you. Faresay is the software and payment processor you use to run your practice — we don\'t own, route, or reassign your clients.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Faresay is built around UK GDPR. For your client data, you are the data controller and Faresay acts as your processor. We use trusted infrastructure providers to run the service, and some sub-processors are based in the US under Standard Contractual Clauses (SCCs). Our privacy notice sets out exactly who we use and why.',
  },
  {
    q: 'Are therapists qualified?',
    a: 'Faresay is for registered professionals. During onboarding we ask for current registration with a recognised body (such as BACP, UKCP, BPS, or NCPS in the UK) and verify the details before a practice goes live.',
  },
  {
    q: 'Is Faresay a crisis service?',
    a: 'No. Faresay supports planned, ongoing therapy and is not a crisis service. If someone is in immediate danger, call 999. For urgent mental health support, contact Samaritans (116 123, free, 24/7) or text SHOUT to 85258.',
  },
  {
    q: 'How do I get set up?',
    a: 'Create an account, choose "I am a therapist", and complete onboarding — your profile, registration details, availability, and connecting your bank via Stripe so you can take card payments. Once your details are verified you\'re ready to schedule clients and run sessions.',
  },
  {
    q: 'How do payments work?',
    a: 'Clients pay by card through Stripe. Money goes to your connected account and typically reaches your bank around 2 business days after a session. Faresay\'s own charge is your monthly plan plus a small card commission — see pricing for the details.',
  },
]

export default function FaqPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-10">Frequently asked questions</h1>

          <div className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-sand-200 p-6 shadow-sm">
                <h2 className="font-display font-semibold text-brand-900 mb-2">{q}</h2>
                <p className="text-sand-700 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-sm text-sand-500">
            See full plans on our{' '}
            <Link href="/pricing" className="text-brand-700 hover:underline">pricing page</Link>, or email{' '}
            <a href="mailto:hello@faresay.com" className="text-brand-700 hover:underline">hello@faresay.com</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
