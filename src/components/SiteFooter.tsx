import Link from 'next/link'
import { Logo } from './Logo'
import { CurrencySwitcher } from './CurrencySwitcher'
import { DIRECTORY_ENABLED } from '@/lib/practice'

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-sand-100/50 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="text-sm text-sand-600 mt-3 max-w-xs leading-relaxed">
              The simple way for tutors to run their studio — your students, scheduling, secure video and payments in one place.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">Students</h3>
            <ul className="space-y-2 text-sm text-sand-600">
              {DIRECTORY_ENABLED && <li><Link href="/tutors" className="hover:text-brand-700">Find a tutor</Link></li>}
              <li><Link href="/subjects" className="hover:text-brand-700">Subjects</Link></li>
              <li><Link href="/blog" className="hover:text-brand-700">Blog</Link></li>
              <li><Link href="/#how" className="hover:text-brand-700">How it works</Link></li>
              <li><Link href="/gift" className="hover:text-brand-700">Gift a lesson</Link></li>
              <li><Link href="/faq" className="hover:text-brand-700">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">Tutors</h3>
            <ul className="space-y-2 text-sm text-sand-600">
              <li><Link href="/sign-up?role=teacher" className="hover:text-brand-700">Join fair-do</Link></li>
              <li><Link href="/for-tutors" className="hover:text-brand-700">Why fair-do</Link></li>
              <li><Link href="/compare" className="hover:text-brand-700">Compare</Link></li>
              <li><Link href="/for-schools" className="hover:text-brand-700">For schools</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-sand-600">
              <li><Link href="/about" className="hover:text-brand-700">About</Link></li>
              <li><Link href="/values" className="hover:text-brand-700">Our values</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-700">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-700">Terms</Link></li>
              <li><Link href="/complaints" className="hover:text-brand-700">Complaints</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sand-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sand-500">© {new Date().getFullYear()} fair-do Ltd</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <CurrencySwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
