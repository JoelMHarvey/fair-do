import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50 px-6 text-center">
      <Logo />
      <h1 className="font-display text-5xl font-semibold text-brand-900 mt-8">Page not found</h1>
      <p className="text-sand-600 mt-4 max-w-md">
        We couldn&apos;t find that page. It may have moved, or the link might be out of date.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/"
          className="bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm"
        >
          Back to home
        </Link>
        <Link
          href="/help"
          className="px-6 py-3 rounded-full font-medium text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
        >
          Need urgent help?
        </Link>
      </div>
    </main>
  )
}
