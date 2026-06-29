import { notFound } from 'next/navigation'
import { getDictionary, isValidLocale, type Locale } from '@/lib/dictionaries'
import { NON_EN_LOCALES } from '@/lib/locale-config'
import { TherapistHome } from '@/components/TherapistHome'

export async function generateStaticParams() {
  return NON_EN_LOCALES.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale) || locale === 'en') return {}
  const { home } = await getDictionary(locale as Locale)
  return {
    title: `Faresay — ${home.hero_h1_line1} ${home.hero_h1_line2}`,
    description: home.hero_body,
    alternates: {
      canonical: `https://faresay.com/${locale}`,
      languages: {
        'en': 'https://faresay.com',
        'fr': 'https://faresay.com/fr',
        'de': 'https://faresay.com/de',
        'it': 'https://faresay.com/it',
        'es': 'https://faresay.com/es',
        'pt': 'https://faresay.com/pt',
        'x-default': 'https://faresay.com',
      },
    },
  }
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isValidLocale(locale) || locale === 'en') notFound()

  const { home } = await getDictionary(locale as Locale)
  return <TherapistHome t={home} />
}
