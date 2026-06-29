import type { Metadata } from 'next'
import { getDictionary } from '@/lib/dictionaries'
import { TherapistHome } from '@/components/TherapistHome'

export const metadata: Metadata = {
  title: 'Faresay — your whole practice, in one calm place',
  description: 'The simple, private practice tool for therapists: your clients, scheduling, secure video and payments in one place. Set up in minutes, run it from your phone.',
  alternates: {
    canonical: 'https://faresay.com',
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

export default async function Home() {
  const { home } = await getDictionary('en')
  return <TherapistHome t={home} />
}
