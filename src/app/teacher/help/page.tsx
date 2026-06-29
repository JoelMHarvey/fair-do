import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TherapistNav } from '@/components/TherapistNav'
import { PageHeader, HelpHint } from '@/components/Guidance'

export const metadata = { title: 'Help — Faresay', robots: { index: false, follow: false } }

type Guide = { id: string; q: string; a: React.ReactNode }
type Section = { title: string; guides: Guide[] }

const SECTIONS: Section[] = [
  {
    title: 'Getting started',
    guides: [
      { id: 'what-is-faresay', q: 'What is Faresay, in one line?', a: <>Your whole private practice in one place — your own clients, your own prices, scheduling, secure video, reminders and payments. You keep your clients; Faresay is just your tools.</> },
      { id: 'first-steps', q: 'I just signed up — what do I do first?', a: <>Follow the <strong>Getting started</strong> checklist on your <Link href="/teacher/dashboard" className="text-brand-700 underline">dashboard</Link>. It walks you through it: complete your profile, connect payments, add your first client, and book your first session. Each step links straight to the right place.</> },
      { id: 'is-it-secure', q: 'Is my clients’ information safe?', a: <>Yes. Everything is encrypted and stored securely in the UK/EU. Mental-health information is treated as the most sensitive category of data and protected accordingly.</> },
    ],
  },
  {
    title: 'Your clients',
    guides: [
      { id: 'add-client', q: 'How do I add a client?', a: <>Go to <Link href="/teacher/clients" className="text-brand-700 underline">My clients</Link> and use <strong>Add a client</strong>. Enter their email and an optional rate; they get a secure link to join. To add lots at once, use <strong>Import</strong> and upload a spreadsheet (CSV).</> },
      { id: 'invite-link', q: 'What happens when I invite a client?', a: <>They receive a private, one-time link (valid 14 days). When they open it and confirm, they’re connected to you as an active client. Nothing is shared with anyone else — it’s just between you and them.</> },
      { id: 'import-csv', q: 'How do I import my existing client list?', a: <>On <Link href="/teacher/clients/import" className="text-brand-700 underline">Import clients</Link>, download the example spreadsheet, paste in your clients’ names and emails, and upload it. We’ll create them for you. There’s a tip box on that page if you get stuck.</> },
      { id: 'per-client-rate', q: 'Can I charge different clients different prices?', a: <>Yes. Open a client from <Link href="/teacher/clients" className="text-brand-700 underline">My clients</Link> and set their own rate. That’s the price used when you book their sessions. Leave it blank to use your default rate.</> },
    ],
  },
  {
    title: 'Sessions & video',
    guides: [
      { id: 'book-session', q: 'How do I book a session for a client?', a: <>Open the client from <Link href="/teacher/clients" className="text-brand-700 underline">My clients</Link> and use <strong>Schedule a session</strong>. Pick a date and time; we create the private video room and email your client the details automatically.</> },
      { id: 'video', q: 'How do video sessions work?', a: <>They run in the browser — no app to install. The room opens 10 minutes before the start time. You and your client each get a private link; no one else can join.</> },
      { id: 'reminders', q: 'Do clients get reminders?', a: <>Yes — confirmation and reminder emails are sent automatically, so you don’t have to chase anyone.</> },
    ],
  },
  {
    title: 'Getting paid',
    guides: [
      { id: 'connect-payments', q: 'How do I get set up to take payments?', a: <>On your <Link href="/teacher/dashboard" className="text-brand-700 underline">dashboard</Link> (or <Link href="/teacher/billing" className="text-brand-700 underline">Billing</Link>), connect your account with Stripe — our secure payments partner. It’s a short form (your name, bank details, ID). Once done, you can take card payments and get paid out.</> },
      { id: 'when-paid', q: 'When do I receive my money?', a: <>Payouts reach your bank about 2 business days after a completed, paid session. You can see everything on your <Link href="/teacher/earnings" className="text-brand-700 underline">Earnings</Link> page.</> },
      { id: 'offline', q: 'Can I run a session before payments are set up?', a: <>Yes. You can book and run sessions straight away; just settle payment with your client however you normally do until Stripe is connected. Connect it whenever you’re ready.</> },
    ],
  },
  {
    title: 'Stuck?',
    guides: [
      { id: 'contact', q: 'Something’s not working — who do I ask?', a: <>Email <a href="mailto:support@faresay.com" className="text-brand-700 underline">support@faresay.com</a> any time. Tell us what you were trying to do and what happened — we’ll help. There are no silly questions.</> },
    ],
  },
]

export default async function TherapistHelp() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
      <TherapistNav />

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
        <PageHeader title="Help Centre" subtitle="Short, plain-English answers to everything you can do on Faresay. Click any question." />

        <div className="mb-8">
          <HelpHint>New here? The quickest path is the <strong>Getting started</strong> checklist on your <Link href="/teacher/dashboard" className="text-brand-800 underline">dashboard</Link> — it walks you through setup step by step.</HelpHint>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section key={section.title} id={section.title.toLowerCase().replace(/\s+/g, '-')}>
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.guides.map(g => (
                  <details key={g.id} id={g.id} className="group bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-medium text-sand-800 hover:bg-sand-50">
                      {g.q}
                      <span className="shrink-0 text-brand-600 transition group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <div className="px-5 pb-5 pt-0 text-sm text-sand-700 leading-relaxed">{g.a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-center text-sand-500 text-sm mt-10">
          Still stuck? Email <a href="mailto:support@faresay.com" className="text-brand-700 underline">support@faresay.com</a> — we&apos;re happy to help.
        </p>
      </div>
    </main>
  )
}
