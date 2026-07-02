import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { getTenant } from '@/lib/tenant'
import { TeacherHome } from '@/components/TeacherHome'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(await getLocaleFromHeaders())
  return { title: meta.home.title, description: meta.home.description, alternates: await localeAlternates('/') }
}

export default async function Home() {
  // /es etc. are rewritten to / by the middleware with x-locale set, so the
  // home page renders in the requested locale at real /es URLs.
  const { home } = await getDictionary(await getLocaleFromHeaders())
  // Tenant (school) hosts get the school's welcome message above the hero;
  // getTenant() is null on the apex, which renders exactly as before.
  const tenant = await getTenant()
  const welcome = tenant?.welcomeMessage
    ? { schoolName: tenant.name, message: tenant.welcomeMessage }
    : null
  return <TeacherHome t={home} welcome={welcome} />
}
