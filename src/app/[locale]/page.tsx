import { notFound } from 'next/navigation'
import { getDictionary, isValidLocale, type Locale } from '@/lib/dictionaries'
import { NON_EN_LOCALES } from '@/lib/locale-config'
import { TeacherHome } from '@/components/TeacherHome'

export async function generateStaticParams() {
  return NON_EN_LOCALES.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale) || locale === 'en') return {}
  const { home } = await getDictionary(locale as Locale)
  return {
    title: `fair-do — ${home.hero_h1_line1} ${home.hero_h1_line2}`,
    description: home.hero_body,
    alternates: {
      canonical: `https://fair-do.com/${locale}`,
      languages: {
        'en': 'https://fair-do.com',
        'fr': 'https://fair-do.com/fr',
        'de': 'https://fair-do.com/de',
        'it': 'https://fair-do.com/it',
        'es': 'https://fair-do.com/es',
        'pt': 'https://fair-do.com/pt',
        'x-default': 'https://fair-do.com',
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
  return <TeacherHome t={home} />
}
