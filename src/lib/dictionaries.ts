import 'server-only'
import { headers } from 'next/headers'

export { LOCALES, NON_EN_LOCALES, isValidLocale, type Locale, type NonEnLocale } from './locale-config'
import { isValidLocale, type Locale } from './locale-config'

// Resolve the active locale from the x-locale header set by proxy.ts.
// Falls back to 'en' when absent or invalid. Use in server components/pages
// so they read the right dictionary without threading params everywhere.
export async function getLocaleFromHeaders(): Promise<Locale> {
  const raw = (await headers()).get('x-locale') ?? 'en'
  return isValidLocale(raw) ? raw : 'en'
}

const dictionaries: Record<Locale, () => Promise<typeof import('../messages/en.json')>> = {
  en: () => import('../messages/en.json'),
  fr: () => import('../messages/fr.json') as Promise<typeof import('../messages/en.json')>,
  de: () => import('../messages/de.json') as Promise<typeof import('../messages/en.json')>,
  it: () => import('../messages/it.json') as Promise<typeof import('../messages/en.json')>,
  es: () => import('../messages/es.json') as Promise<typeof import('../messages/en.json')>,
  pt: () => import('../messages/pt.json') as Promise<typeof import('../messages/en.json')>,
}

export async function getDictionary(locale: Locale) {
  // Return `.default` (the parsed JSON object) rather than the import Module
  // namespace. A Module has a null prototype and cannot be serialized across
  // the Server→Client Component boundary (DictProvider is 'use client').
  // Spread the import Module namespace into a fresh plain object. The Module
  // has a null prototype and cannot be serialized across the Server→Client
  // boundary (DictProvider is 'use client'); a plain object can.
  const mod = await dictionaries[locale]()
  return { ...mod }
}
