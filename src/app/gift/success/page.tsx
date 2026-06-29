import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = { title: 'Gift sent — Faresay' }

export default function GiftSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-coral-50/40 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center">
        <Logo />
      </nav>
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-5">🎁</div>
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-3">Gift on its way</h1>
        <p className="text-sand-600 mb-8">
          The voucher code is in the recipient&apos;s inbox (or yours, if you kept it). It can be redeemed at any time against any therapist.
        </p>
        <Link href="/" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition">
          Back home
        </Link>
      </div>
    </main>
  )
}
