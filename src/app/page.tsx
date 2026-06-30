import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/i18n-seo'
import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { TeacherHome } from '@/components/TeacherHome'

const baseMetadata: Metadata = {
  title: 'fair-do — your whole tutoring business, in one calm place',
  description: 'The simple, private tool for independent tutors: your students, scheduling, secure video and payments in one place. Set up in minutes, run it from your phone.',
}

export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, alternates: await localeAlternates('/') }
}

export default async function Home() {
  // /es etc. are rewritten to / by the middleware with x-locale set, so the
  // home page renders in the requested locale at real /es URLs.
  const { home } = await getDictionary(await getLocaleFromHeaders())
  return <TeacherHome t={home} />
}
