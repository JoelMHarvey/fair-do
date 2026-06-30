import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { TeacherHome } from '@/components/TeacherHome'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return { title: meta.home.title, description: meta.home.description, alternates: await localeAlternates('/') }
}

export default async function Home() {
  // /es etc. are rewritten to / by the middleware with x-locale set, so the
  // home page renders in the requested locale at real /es URLs.
  const { home } = await getDictionary(await getLocaleFromHeaders())
  return <TeacherHome t={home} />
}
