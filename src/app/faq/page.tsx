import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata = {
  title: 'FAQ — fair-do',
  description: 'Common questions about fair-do: what it is, pricing, student ownership, data security, and getting set up as a tutor.',
}

const FAQS = [
  {
    q: 'What is fair-do?',
    a: 'fair-do is software for independent tutors. You bring your own students and run your tutoring your way — fair-do gives you scheduling, secure video lessons, and card payments in one place. It\'s a tool you subscribe to, not a marketplace that finds students for you.',
  },
  {
    q: 'How much does it cost?',
    a: 'fair-do is a monthly subscription. Starter is free, Tutor is around £29/month, and Academy is coming soon. On top of the plan, there\'s a small commission on card payments to cover processing. Full, current details are on our pricing page.',
  },
  {
    q: 'Are my students mine?',
    a: 'Yes. The tutoring relationship and your student records belong to you. fair-do is the software and payment processor you use to run your tutoring — we don\'t own, route, or reassign your students.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. fair-do is built around UK GDPR. For your student data, you are the data controller and fair-do acts as your processor. We use trusted infrastructure providers to run the service, and some sub-processors are based in the US under Standard Contractual Clauses (SCCs). Our privacy notice sets out exactly who we use and why.',
  },
  {
    q: 'Are tutors qualified?',
    a: 'fair-do is for qualified tutors. During onboarding we ask for teaching qualifications (such as QTS or a PGCE) and a current DBS check, and verify the details before a profile goes live.',
  },
  {
    q: 'How do I get set up?',
    a: 'Create an account, choose "I am a tutor", and complete onboarding — your profile, qualification details, availability, and connecting your bank via Stripe so you can take card payments. Once your details are verified you\'re ready to schedule students and run lessons.',
  },
  {
    q: 'How do payments work?',
    a: 'Students pay by card through Stripe. Money goes to your connected account and typically reaches your bank around 2 business days after a lesson. fair-do\'s own charge is your monthly plan plus a small card commission — see pricing for the details.',
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
            <a href="mailto:hello@fair-do.com" className="text-brand-700 hover:underline">hello@fair-do.com</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
