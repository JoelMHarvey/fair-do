import 'server-only'
import type { Metadata } from 'next'
import { LOCALES, I18N_ENABLED, type Locale } from './locale-config'
import { getLocaleFromHeaders } from './dictionaries'

const BASE = 'https://fair-do.com'

// Absolute URL for a base path in a given locale. English is at the root;
// other locales are path-prefixed (/es/pricing). basePath uses '' or '/x'
// (a lone '/' is treated as the home root).
export function localeUrl(basePath: string, locale: Locale): string {
  const path = basePath === '/' ? '' : basePath
  return locale === 'en' ? `${BASE}${path}` : `${BASE}/${locale}${path}`
}

// hreflang alternates map for a path — every locale version + x-default.
// Returns undefined when i18n is OFF, so we never advertise /es URLs that 404.
export function hreflangLanguages(basePath: string): Record<string, string> | undefined {
  if (!I18N_ENABLED) return undefined
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = localeUrl(basePath, l)
  languages['x-default'] = localeUrl(basePath, 'en')
  return languages
}

// Per-page Metadata.alternates: self-canonical for the REQUEST locale (so
// /es/pricing canonicalises to itself, not /pricing) plus the hreflang set.
// Use in a page's generateMetadata: `alternates: await localeAlternates('/pricing')`.
export async function localeAlternates(basePath: string): Promise<Metadata['alternates']> {
  const locale = await getLocaleFromHeaders()
  return {
    canonical: localeUrl(basePath, locale),
    languages: hreflangLanguages(basePath),
  }
}
