// Seed data for the Faresay app UI kit (fictional therapists, calm copy).
const THERAPISTS = [
  {
    id: 't1', name: 'Priya Patel', credential: '✓ BACP verified', tagline: 'Anxiety & burnout',
    bio: 'I help people untangle anxiety and rebuild a steadier, kinder pace of life. Warm, practical, and led by what matters to you.',
    price: '£55', intro: '£35', rating: 4.9, ratingCount: 28, founding: true, bestMatch: true,
    specialisms: ['Anxiety', 'CBT', 'Burnout', 'EMDR'], languages: ['English', 'Hindi'], nextAvailable: 'Tomorrow 14:00',
  },
  {
    id: 't2', name: 'Daniel Okafor', credential: 'UKCP registered', tagline: 'Relationships & identity',
    bio: 'A relational, person-centred space to make sense of who you are and how you connect. No judgement, no rush.',
    price: '£60', rating: 4.8, ratingCount: 19, founding: false,
    specialisms: ['Relationships', 'Identity', 'Person-centred'], languages: ['English'], nextAvailable: 'Thu 09:30',
  },
  {
    id: 't3', name: 'Sarah Mitchell', credential: '✓ BACP verified', tagline: 'Trauma & EMDR',
    bio: 'Specialist trauma work using EMDR and a steady, body-aware approach. We move at the pace your nervous system can hold.',
    price: '£65', rating: 5.0, ratingCount: 41, founding: true,
    specialisms: ['Trauma', 'EMDR', 'PTSD'], languages: ['English'], nextAvailable: 'Today 18:00',
  },
  {
    id: 't4', name: 'James Lin', credential: 'BPS registered', tagline: 'Low mood & self-esteem',
    bio: 'Gentle CBT and compassion-focused work for low mood and the inner critic. Small, doable steps toward feeling more like yourself.',
    price: '£48', rating: 4.7, ratingCount: 12, founding: false,
    specialisms: ['Depression', 'Self-esteem', 'CBT'], languages: ['English', 'Mandarin'], nextAvailable: 'Fri 11:00',
  },
]

const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '18:00']
const DAYS = [
  { d: 'Tue', n: '24' }, { d: 'Wed', n: '25' }, { d: 'Thu', n: '26' },
  { d: 'Fri', n: '27' }, { d: 'Mon', n: '30' },
]

Object.assign(window, { FARESAY_THERAPISTS: THERAPISTS, FARESAY_SLOTS: SLOTS, FARESAY_DAYS: DAYS })
