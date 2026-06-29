import 'server-only'

export { LOCALES, NON_EN_LOCALES, isValidLocale, type Locale, type NonEnLocale } from './locale-config'
import type { Locale } from './locale-config'

const dictionaries: Record<Locale, () => Promise<typeof import('../messages/en.json')>> = {
  en: () => import('../messages/en.json'),
  fr: () => import('../messages/fr.json') as Promise<typeof import('../messages/en.json')>,
  de: () => import('../messages/de.json') as Promise<typeof import('../messages/en.json')>,
  it: () => import('../messages/it.json') as Promise<typeof import('../messages/en.json')>,
  es: () => import('../messages/es.json') as Promise<typeof import('../messages/en.json')>,
  pt: () => import('../messages/pt.json') as Promise<typeof import('../messages/en.json')>,
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]()
}
