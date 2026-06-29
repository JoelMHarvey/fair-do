import type { Metadata } from 'next'
import { getDictionary } from '@/lib/dictionaries'
import { TeacherHome } from '@/components/TeacherHome'

export const metadata: Metadata = {
  title: 'fair-do — your whole tutoring business, in one calm place',
  description: 'The simple, private tool for independent tutors: your students, scheduling, secure video and payments in one place. Set up in minutes, run it from your phone.',
  alternates: {
    canonical: 'https://fair-do.com',
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

export default async function Home() {
  const { home } = await getDictionary('en')
  return <TeacherHome t={home} />
}
