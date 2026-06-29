import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/dictionaries'
import { I18N_ENABLED } from '@/lib/locale-config'

// Locale layout for non-English pages. English stays at root (app/page.tsx).
// Root layout reads x-locale header (set by proxy.ts) so html lang is already correct.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Dark unless i18n is enabled. Only non-English locales valid here; English at root.
  if (!I18N_ENABLED || !isValidLocale(locale) || locale === 'en') notFound()
  return <>{children}</>
}
