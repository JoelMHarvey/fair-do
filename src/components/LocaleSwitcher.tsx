'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NON_EN_LOCALES } from '@/lib/locale-config'

const LOCALE_LINKS = [
  { code: 'en', label: 'EN', href: '/' },
  ...NON_EN_LOCALES.map(l => ({ code: l, label: l.toUpperCase(), href: `/${l}` })),
] as const

export function LocaleSwitcher() {
  const pathname = usePathname()
  const currentLocale =
    NON_EN_LOCALES.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? 'en'

  return (
    <div className="flex items-center gap-0.5" aria-label="Language">
      {LOCALE_LINKS.map(({ code, label, href }) => (
        <Link
          key={code}
          href={href}
          hrefLang={code}
          className={`px-1.5 py-0.5 text-xs font-medium rounded transition ${
            currentLocale === code
              ? 'bg-brand-600 text-white'
              : 'text-sand-500 hover:text-brand-700'
          }`}
          aria-current={currentLocale === code ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
