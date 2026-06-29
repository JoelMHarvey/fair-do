import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { regionConfig } from '@/lib/locale'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Urgent help & crisis support — Faresay',
  description: 'If you need help right now — crisis and mental health helplines for the UK and US.',
}

const SPECIALISED = [
  { name: 'Papyrus HOPELINE247', contact: '0800 068 4141', detail: 'Under-35s with thoughts of suicide, and anyone worried about a young person.', href: 'tel:08000684141' },
  { name: 'CALM (Campaign Against Living Miserably)', contact: '0800 58 58 58', detail: '5pm–midnight, for anyone struggling — strong focus on men.', href: 'tel:0800585858' },
  { name: 'Mind infoline', contact: '0300 123 3393', detail: 'Mon–Fri 9am–6pm. Information on mental health support and services.', href: 'tel:03001233393' },
  { name: 'National Domestic Abuse Helpline', contact: '0808 2000 247', detail: 'Free, 24/7, run by Refuge.', href: 'tel:08082000247' },
  { name: 'Shout for veterans / NHS', contact: 'Text SHOUT', detail: 'Specialist routes via SHOUT and NHS for veterans and frontline workers.', href: 'sms:85258?&body=SHOUT' },
]

export default async function HelpPage() {
  // Region: use the signed-in client's country if known, else default UK.
  let region: string = 'UK'
  const { userId } = await auth()
  if (userId) {
    const u = await prisma.user.findUnique({ where: { clerkId: userId }, select: { country: true } })
    if (u) region = u.country
  }
  const config = regionConfig(region)
  const isUK = config.region === 'UK'

  return (
    <main className="min-h-screen bg-sand-50">
      <nav className="border-b border-sand-200 bg-white/90 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Home</Link>
      </nav>

      {/* Urgent banner */}
      <div className="bg-coral-500 text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-6 text-center">
          <p className="font-display text-2xl font-semibold mb-1">In immediate danger? Call {config.emergencyNumber}.</p>
          <p className="text-coral-50 text-sm">Faresay is not a crisis service. The lines below are free and here for you right now.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">Urgent help</h1>
        <p className="text-sand-600 mb-8">You don&apos;t have to be in crisis to call. If things feel too much, reach out.</p>

        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">Right now, 24/7</h2>
        <div className="space-y-3 mb-10">
          {config.crisisLines.map(r => (
            <a key={r.name} href={r.href} className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="font-medium text-brand-900">{r.name}</p>
                <p className="font-display text-lg font-semibold text-brand-700">{r.contact}</p>
              </div>
              <p className="text-sm text-sand-600 mt-1">{r.detail}</p>
            </a>
          ))}
        </div>

        {isUK && (
        <>
        <h2 className="text-sm font-semibold text-sand-500 uppercase tracking-wide mb-3">Specialised support</h2>
        <div className="space-y-3 mb-10">
          {SPECIALISED.map(r => (
            <a key={r.name} href={r.href} className="block bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand-300 transition">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="font-medium text-brand-900">{r.name}</p>
                <p className="font-display text-base font-semibold text-brand-700">{r.contact}</p>
              </div>
              <p className="text-sm text-sand-600 mt-1">{r.detail}</p>
            </a>
          ))}
        </div>
        </>
        )}

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-sm text-sand-700">
          <p className="font-medium text-brand-800 mb-1">How Faresay fits</p>
          <p>
            Faresay is for ongoing therapy with a regular therapist — not emergencies or acute crisis. If you&apos;re safe and looking for longer-term support, <Link href="/therapists" className="text-brand-700 underline">find a therapist</Link>. If you&apos;re in crisis, please use the lines above first.
          </p>
        </div>
      </div>
    </main>
  )
}
