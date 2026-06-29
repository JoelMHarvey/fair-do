export type Region = 'UK' | 'US' | 'PT' | 'FR' | 'IT' | 'ES' | 'DE'

// Languages a tutor can teach in (UK/US-relevant set).
export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Polish',
  'Romanian', 'Urdu', 'Punjabi', 'Hindi', 'Bengali', 'Gujarati', 'Tamil',
  'Arabic', 'Farsi', 'Turkish', 'Mandarin', 'Cantonese', 'Welsh', 'Greek',
  'Russian', 'Ukrainian', 'Somali', 'Yoruba', 'British Sign Language',
]

export type CrisisLine = { name: string; contact: string; detail: string; href: string }

// Per-region presentation + safeguarding signposting. Teaching-credential
// verification lives in src/lib/credential-registers.ts (the live source of
// truth), not here — this config is only currency, region label, and the
// emergency/welfare lines shown on /help.
export type RegionConfig = {
  region: Region
  label: string
  currencySymbol: string
  currencyCode: string
  emergencyNumber: string
  crisisLines: CrisisLine[]
}

const UK: RegionConfig = {
  region: 'UK',
  label: 'United Kingdom',
  currencySymbol: '£',
  currencyCode: 'GBP',
  emergencyNumber: '999',
  crisisLines: [
    { name: 'Emergency services', contact: '999', detail: 'Immediate danger or risk to life.', href: 'tel:999' },
    { name: 'Samaritans', contact: '116 123', detail: 'Free, 24/7, any kind of distress.', href: 'tel:116123' },
    { name: 'SHOUT crisis text', contact: 'Text SHOUT to 85258', detail: 'Free 24/7 text support.', href: 'sms:85258?&body=SHOUT' },
    { name: 'NHS 111', contact: '111 — option 2', detail: 'Urgent mental health support, 24/7.', href: 'tel:111' },
  ],
}

const US: RegionConfig = {
  region: 'US',
  label: 'United States',
  currencySymbol: '$',
  currencyCode: 'USD',
  emergencyNumber: '911',
  crisisLines: [
    { name: 'Emergency services', contact: '911', detail: 'Immediate danger or risk to life.', href: 'tel:911' },
    { name: '988 Suicide & Crisis Lifeline', contact: '988', detail: 'Free, 24/7, call or text.', href: 'tel:988' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', detail: 'Free 24/7 text support.', href: 'sms:741741?&body=HOME' },
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', detail: 'Treatment referral & info, 24/7.', href: 'tel:18006624357' },
  ],
}

// ── EU markets ────────────────────────────────────────────────────────────────

const PT: RegionConfig = {
  region: 'PT',
  label: 'Portugal',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emergencyNumber: '112',
  crisisLines: [
    { name: 'Emergência', contact: '112', detail: 'Perigo imediato ou risco de vida.', href: 'tel:112' },
    { name: 'SOS Voz Amiga', contact: '213 544 545', detail: 'Apoio emocional, diariamente 16h–24h.', href: 'tel:213544545' },
    { name: 'Linha de Apoio à Saúde Mental', contact: '808 24 24 24', detail: 'Linha de crise do SNS, 24/7.', href: 'tel:808242424' },
  ],
}

const FR: RegionConfig = {
  region: 'FR',
  label: 'France',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emergencyNumber: '15',
  crisisLines: [
    { name: 'SAMU', contact: '15', detail: 'Urgence médicale immédiate.', href: 'tel:15' },
    { name: 'Numéro national prévention suicide', contact: '3114', detail: 'Gratuit, 24h/24, 7j/7.', href: 'tel:3114' },
    { name: 'SOS Amitié', contact: '09 72 39 40 50', detail: 'Écoute et soutien, tous les jours.', href: 'tel:0972394050' },
  ],
}

const IT: RegionConfig = {
  region: 'IT',
  label: 'Italy',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emergencyNumber: '112',
  crisisLines: [
    { name: 'Emergenza', contact: '112', detail: 'Pericolo immediato o rischio per la vita.', href: 'tel:112' },
    { name: 'Telefono Amico', contact: '02 2327 2327', detail: 'Ascolto e supporto emotivo.', href: 'tel:0223272327' },
    { name: 'Telefono Azzurro', contact: '19696', detail: 'Supporto a bambini e adolescenti, 24/7.', href: 'tel:19696' },
  ],
}

const ES: RegionConfig = {
  region: 'ES',
  label: 'Spain',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emergencyNumber: '112',
  crisisLines: [
    { name: 'Emergencias', contact: '112', detail: 'Peligro inmediato o riesgo vital.', href: 'tel:112' },
    { name: 'Teléfono de la Esperanza', contact: '717 003 717', detail: 'Atención en crisis, 24 horas.', href: 'tel:717003717' },
    { name: 'Línea de Atención a la Conducta Suicida', contact: '024', detail: 'Línea nacional gratuita, 24/7.', href: 'tel:024' },
  ],
}

const DE: RegionConfig = {
  region: 'DE',
  label: 'Germany',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emergencyNumber: '112',
  crisisLines: [
    { name: 'Notruf', contact: '112', detail: 'Unmittelbare Lebensgefahr oder medizinischer Notfall.', href: 'tel:112' },
    { name: 'Telefonseelsorge', contact: '0800 111 0 111', detail: 'Kostenlos, 24/7, anonyme Krisenbegleitung.', href: 'tel:08001110111' },
    { name: 'Telefonseelsorge (alternativ)', contact: '0800 111 0 222', detail: 'Kostenlos, 24/7.', href: 'tel:08001110222' },
  ],
}

const CONFIGS: Record<Region, RegionConfig> = { UK, US, PT, FR, IT, ES, DE }

export function regionConfig(region: string | null | undefined): RegionConfig {
  return CONFIGS[(region as Region) ?? 'UK'] ?? UK
}

export function formatMoney(minorUnits: number, region: string | null | undefined): string {
  const c = regionConfig(region)
  return `${c.currencySymbol}${(minorUnits / 100).toFixed(2)}`
}

// States fair-do is LIVE in. Start with NY; add codes here (or via
// NEXT_PUBLIC_ACTIVE_US_STATES="NY,NJ") to expand coverage state by state.
const ENV_STATES = (process.env.NEXT_PUBLIC_ACTIVE_US_STATES ?? '')
  .split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
export const LAUNCH_US_STATES: string[] = ENV_STATES.length ? ENV_STATES : ['NY']

export function isStateLive(code: string | null | undefined): boolean {
  return !!code && LAUNCH_US_STATES.includes(code.toUpperCase())
}

export function activeUsStates() {
  return US_STATES.filter(s => LAUNCH_US_STATES.includes(s.code))
}

// All US states (full target coverage). LAUNCH_US_STATES gates which are live.
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' },
]
