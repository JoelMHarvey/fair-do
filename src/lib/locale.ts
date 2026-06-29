export type Region = 'UK' | 'US' | 'PT' | 'FR' | 'IT' | 'ES' | 'DE'

// Languages a therapist can offer sessions in (UK/US-relevant set).
export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Polish',
  'Romanian', 'Urdu', 'Punjabi', 'Hindi', 'Bengali', 'Gujarati', 'Tamil',
  'Arabic', 'Farsi', 'Turkish', 'Mandarin', 'Cantonese', 'Welsh', 'Greek',
  'Russian', 'Ukrainian', 'Somali', 'Yoruba', 'British Sign Language',
]

export type CrisisLine = { name: string; contact: string; detail: string; href: string }

export type RegionConfig = {
  region: Region
  label: string
  currencySymbol: string
  currencyCode: string
  credentialBodies: string[]
  credentialLabel: string
  // How therapist credentials are verified in this country.
  // 'directory' = public lookup URL exists; 'manual-review' = human check required;
  // 'fragmented' = regional sub-registers, manual-review fallback needed.
  verificationApproach: 'directory' | 'manual-review' | 'fragmented'
  // Whether professional indemnity insurance is legally required. [LEGAL] confirm per country.
  requiresInsurance: boolean
  // Professional titles accepted on Faresay in this market. [LEGAL] confirm before launch.
  acceptedTitles: string[]
  scopesByState: boolean
  // True for countries with regional registration bodies (ES, IT).
  scopesByRegion: boolean
  emergencyNumber: string
  crisisLines: CrisisLine[]
}

const UK: RegionConfig = {
  region: 'UK',
  label: 'United Kingdom',
  currencySymbol: '£',
  currencyCode: 'GBP',
  credentialBodies: ['BACP', 'UKCP', 'BPS', 'NCS'],
  credentialLabel: 'registration',
  verificationApproach: 'manual-review',
  requiresInsurance: true,
  acceptedTitles: ['Counsellor', 'Psychotherapist', 'Psychologist', 'CBT Therapist', 'EMDR Therapist'],
  scopesByState: false,
  scopesByRegion: false,
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
  credentialBodies: ['LPC', 'LCSW', 'LMFT', 'LMHC', 'PsyD', 'PhD (Clinical)'],
  credentialLabel: 'license',
  verificationApproach: 'manual-review',
  requiresInsurance: true,
  acceptedTitles: ['LPC', 'LCSW', 'LMFT', 'LMHC', 'Psychologist (PsyD/PhD)'],
  scopesByState: true,
  scopesByRegion: false,
  emergencyNumber: '911',
  crisisLines: [
    { name: 'Emergency services', contact: '911', detail: 'Immediate danger or risk to life.', href: 'tel:911' },
    { name: '988 Suicide & Crisis Lifeline', contact: '988', detail: 'Free, 24/7, call or text.', href: 'tel:988' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', detail: 'Free 24/7 text support.', href: 'sms:741741?&body=HOME' },
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', detail: 'Treatment referral & info, 24/7.', href: 'tel:18006624357' },
  ],
}

// ── EU markets ────────────────────────────────────────────────────────────────
// [LEGAL] All acceptedTitles and requiresInsurance values must be confirmed with
// local legal counsel before launch in each country.

const PT: RegionConfig = {
  region: 'PT',
  label: 'Portugal',
  currencySymbol: '€',
  currencyCode: 'EUR',
  // Single national register (OPP) with a searchable directory — easiest to verify.
  credentialBodies: ['OPP'],
  credentialLabel: 'Cédula Profissional',
  verificationApproach: 'directory',
  requiresInsurance: true, // [LEGAL] confirm
  acceptedTitles: ['Psicólogo', 'Psicólogo Especialista'], // [LEGAL] confirm
  scopesByState: false,
  scopesByRegion: false,
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
  // RPPS (Répertoire Partagé des Professionnels de Santé) — national, searchable.
  // Note: "psychothérapeute" (registered since 2010) and "psychologue" use different
  // registers — confirm accepted titles with legal counsel before launch. [LEGAL]
  credentialBodies: ['RPPS', 'ARS'],
  credentialLabel: 'numéro RPPS',
  verificationApproach: 'directory',
  requiresInsurance: true, // [LEGAL] confirm
  acceptedTitles: ['Psychologue', 'Psychothérapeute'], // [LEGAL] confirm which registers apply
  scopesByState: false,
  scopesByRegion: false,
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
  // Ordine degli Psicologi with regional Albi — nationally coordinated but regionally administered.
  credentialBodies: ['OPL', 'OPR'],
  credentialLabel: 'numero di iscrizione Albo',
  verificationApproach: 'fragmented',
  requiresInsurance: true, // [LEGAL] confirm
  acceptedTitles: ['Psicologo', 'Psicoterapeuta'], // [LEGAL] confirm
  scopesByState: false,
  scopesByRegion: true,
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
  // Regional Colegios Oficiales de Psicólogos (COP) — no single national lookup.
  // Verification requires checking the correct regional college per therapist.
  // Manual-review fallback is required. [LEGAL] confirm which regional colleges to accept.
  credentialBodies: ['COP'],
  credentialLabel: 'número de colegiación',
  verificationApproach: 'fragmented',
  requiresInsurance: true, // [LEGAL] confirm
  acceptedTitles: ['Psicólogo', 'Psicólogo Sanitario', 'Psicoterapeuta'], // [LEGAL] confirm
  scopesByState: false,
  scopesByRegion: true,
  emergencyNumber: '112',
  crisisLines: [
    { name: 'Emergencias', contact: '112', detail: 'Peligro inmediato o riesgo vital.', href: 'tel:112' },
    { name: 'Teléfono de la Esperanza', contact: '717 003 717', detail: 'Atención en crisis, 24 horas.', href: 'tel:717003717' },
    { name: 'Línea de Atención a la Conducta Suicida', contact: '024', detail: 'Línea nacional gratuita, 24/7.', href: 'tel:024' },
  ],
}

// Germany is the most nuanced market: the Heilpraktiker für Psychotherapie policy
// decision (do you accept them alongside Approbierte Psychotherapeuten?) must be
// made by Joel before dev starts. [LEGAL] + brand decision. Launch last.
const DE: RegionConfig = {
  region: 'DE',
  label: 'Germany',
  currencySymbol: '€',
  currencyCode: 'EUR',
  // State Psychotherapeutenkammern + KVs for Approbierte Psychotherapeuten.
  // Heilpraktiker für Psychotherapie use a separate, non-licensed pathway.
  // [LEGAL] confirm eligibility policy before accepting any registrations.
  credentialBodies: ['PTK', 'KV'],
  credentialLabel: 'Approbationsurkunde',
  verificationApproach: 'manual-review',
  requiresInsurance: true, // [LEGAL] confirm
  acceptedTitles: ['Psychologischer Psychotherapeut', 'Kinder- und Jugendlichenpsychotherapeut'], // [LEGAL] — Heilpraktiker decision pending
  scopesByState: false,
  scopesByRegion: true, // Approbation is issued per state (Bundesland)
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

// States Faresay is LIVE in. Start with NY; add codes here (or via
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
