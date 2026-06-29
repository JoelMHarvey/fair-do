// Single source of truth for where each teaching qualification body's public
// register lives and what to match against it. Used by the admin verification
// card so the verifier can confirm a tutor's credentials in one click.
//
// Keys are matched (case-insensitively) against Teacher.qualificationBody.

export type Register = {
  label: string            // full body name
  url: string              // public register / check page
  checkBy: string          // what you search the register by
  country: string          // ISO 3166-1 alpha-2
  automated: boolean       // true if a programmatic lookup is feasible
  notes?: string           // admin guidance
}

const REGISTERS: Record<string, Register> = {
  // ── United Kingdom ────────────────────────────────────────────────────────
  QTS: {
    label: 'Qualified Teacher Status (Teaching Regulation Agency)',
    url: 'https://teacherservices.education.gov.uk/check-a-teacher',
    checkBy: 'TRN (Teacher Reference Number) + date of birth, or name',
    country: 'GB',
    automated: false,
    notes: 'TRA public check confirms QTS award and any prohibition orders.',
  },
  QTLS: {
    label: 'Qualified Teacher Learning and Skills (Society for Education and Training)',
    url: 'https://set.et-foundation.co.uk/membership/qtls-status',
    checkBy: 'name or SET membership number',
    country: 'GB',
    automated: false,
  },
  PGCE: {
    label: 'Postgraduate Certificate in Education',
    url: 'https://teacherservices.education.gov.uk/check-a-teacher',
    checkBy: 'awarding university certificate; cross-check QTS via TRA',
    country: 'GB',
    automated: false,
    notes: 'Verify the certificate document; a PGCE usually comes with QTS — check TRA too.',
  },
  CERTED: {
    label: 'Certificate in Education',
    url: 'https://set.et-foundation.co.uk',
    checkBy: 'awarding institution certificate',
    country: 'GB',
    automated: false,
  },
  ABRSM: {
    label: 'Associated Board of the Royal Schools of Music',
    url: 'https://gb.abrsm.org/en/our-music-syllabus/find-a-teacher/',
    checkBy: 'name (then confirm diploma certificate, e.g. DipABRSM/LRSM)',
    country: 'GB',
    automated: false,
    notes: 'Music tutors — confirm the diploma certificate provided.',
  },
  TRINITY: {
    label: 'Trinity College London',
    url: 'https://www.trinitycollege.com',
    checkBy: 'certificate / diploma document',
    country: 'GB',
    automated: false,
  },
  CELTA: {
    label: 'Certificate in English Language Teaching to Adults (Cambridge)',
    url: 'https://www.cambridgeenglish.org/teaching-english/teaching-qualifications/celta/',
    checkBy: 'Cambridge certificate (verify the certificate document)',
    country: 'GB',
    automated: false,
  },
  TEFL: {
    label: 'Teaching English as a Foreign Language',
    url: 'https://www.accreditat.com', // accreditation body for many TEFL providers
    checkBy: 'provider certificate (confirm an accredited provider)',
    country: 'GB',
    automated: false,
    notes: 'TEFL is unregulated — confirm the issuing provider is accredited (e.g. Accreditat, ODLQC).',
  },
  ICF: {
    label: 'International Coaching Federation',
    url: 'https://apps.coachingfederation.org/eweb/CCFDynamicPage.aspx?webcode=ccfsearch',
    checkBy: 'name or ICF credential ID',
    country: 'GB',
    automated: false,
    notes: 'For coaching/mentoring tutors.',
  },
  DEGREE: {
    label: 'University degree (subject specialist)',
    url: 'https://www.hedd.ac.uk', // Higher Education Degree Datacheck
    checkBy: 'degree certificate; HEDD for verification if in doubt',
    country: 'GB',
    automated: false,
    notes: 'For subject-specialist tutors without QTS — verify the degree certificate.',
  },

  // ── DBS (safeguarding, separate from qualification) ────────────────────────
  DBS: {
    label: 'Disclosure and Barring Service (update service)',
    url: 'https://www.gov.uk/dbs-update-service',
    checkBy: 'DBS certificate number + applicant details (with their consent)',
    country: 'GB',
    automated: false,
    notes: 'Required for tutors teaching under-18s. Enhanced check recommended. Certificates do not expire but go stale — re-check via the update service.',
  },
}

export function registerFor(body: string | null | undefined): Register | null {
  if (!body) return null
  const key = body.toUpperCase().replace(/[^A-Z]/g, '') // normalise "CELTA / TEFL" etc.
  return REGISTERS[key] ?? REGISTERS[body.toUpperCase()] ?? null
}

export function registersForCountry(countryCode: string): Register[] {
  const code = countryCode.toUpperCase()
  return Object.values(REGISTERS).filter(r => r.country === code)
}
