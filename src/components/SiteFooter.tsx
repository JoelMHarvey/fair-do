import Link from 'next/link'
import { Logo } from './Logo'
import { CurrencySwitcher } from './CurrencySwitcher'
import { DIRECTORY_ENABLED } from '@/lib/practice'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'

export async function SiteFooter() {
  const { footer } = await getDictionary(await getLocaleFromHeaders())
  return (
    <footer className="border-t border-sand-200 bg-sand-100/50 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="text-sm text-sand-600 mt-3 max-w-xs leading-relaxed">
              {footer.tagline}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">{footer.col_clients}</p>
            <ul className="space-y-2 text-sm text-sand-600">
              {DIRECTORY_ENABLED && <li><Link href="/tutors" className="hover:text-brand-700">{footer.link_find_tutor}</Link></li>}
              <li><Link href="/subjects" className="hover:text-brand-700">{footer.link_subjects}</Link></li>
              <li><Link href="/blog" className="hover:text-brand-700">{footer.link_blog}</Link></li>
              <li><Link href="/#how" className="hover:text-brand-700">{footer.link_how_it_works}</Link></li>
              <li><Link href="/gift" className="hover:text-brand-700">{footer.link_gift}</Link></li>
              <li><Link href="/faq" className="hover:text-brand-700">{footer.link_faq}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">{footer.col_tutors}</p>
            <ul className="space-y-2 text-sm text-sand-600">
              <li><Link href="/sign-up?role=teacher" className="hover:text-brand-700">{footer.link_join}</Link></li>
              <li><Link href="/for-tutors" className="hover:text-brand-700">{footer.link_why}</Link></li>
              <li><Link href="/compare" className="hover:text-brand-700">{footer.link_compare}</Link></li>
              <li><Link href="/for-schools" className="hover:text-brand-700">{footer.link_business}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-sand-900 uppercase tracking-wide mb-3">{footer.col_company}</p>
            <ul className="space-y-2 text-sm text-sand-600">
              <li><Link href="/about" className="hover:text-brand-700">{footer.link_about}</Link></li>
              <li><Link href="/values" className="hover:text-brand-700">{footer.link_values}</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-700">{footer.link_privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-brand-700">{footer.link_terms}</Link></li>
              <li><Link href="/safeguarding-policy" className="hover:text-brand-700">{footer.link_safeguarding ?? 'Safeguarding'}</Link></li>
              <li><Link href="/complaints" className="hover:text-brand-700">{footer.link_complaints}</Link></li>
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
