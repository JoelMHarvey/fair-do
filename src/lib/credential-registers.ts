// Single source of truth for where each accreditation body's public register lives
// and what to match against it. Used by the admin verification card and the
// CREDENTIAL-VERIFICATION.md SOP so they never drift apart.
//
// EU registers: verify the lookup URL is current before launching in each country.
// All [LEGAL] items must be confirmed with local counsel before accepting registrations.

export type Register = {
  label: string            // full body name
  url: string              // public register / check page
  checkBy: string          // what you search the register by
  country: string          // ISO 3166-1 alpha-2
  automated: boolean       // true if a programmatic lookup is feasible
  notes?: string           // admin guidance / [LEGAL] flags
}

const REGISTERS: Record<string, Register> = {
  // ── United Kingdom ────────────────────────────────────────────────────────
  BACP: {
    label: 'British Association for Counselling and Psychotherapy',
    url: 'https://www.bacp.co.uk/search/Register',
    checkBy: 'name or BACP membership number',
    country: 'GB',
    automated: false,
  },
  UKCP: {
    label: 'UK Council for Psychotherapy',
    url: 'https://www.psychotherapy.org.uk/find-a-therapist/',
    checkBy: 'name (then confirm the UKCP number)',
    country: 'GB',
    automated: false,
  },
  BPS: {
    // Practitioner psychologists are statutorily regulated by the HCPC — the
    // authoritative check. BPS membership is supplementary, not a licence.
    label: 'British Psychological Society (statutory register: HCPC)',
    url: 'https://www.hcpc-uk.org/check-the-register/',
    checkBy: 'name or HCPC registration number',
    country: 'GB',
    automated: false,
  },
  NCPS: {
    label: 'National Counselling & Psychotherapy Society',
    url: 'https://www.ncps.com/check-the-register',
    checkBy: 'name or NCPS membership number',
    country: 'GB',
    automated: false,
  },

  // ── Portugal ──────────────────────────────────────────────────────────────
  // Single national register — the easiest EU country to verify.
  OPP: {
    label: 'Ordem dos Psicólogos Portugueses',
    url: 'https://diretorio.ordemdospsicologos.pt',
    checkBy: 'Cédula Profissional number or name',
    country: 'PT',
    automated: true, // public directory supports name + number search
    notes: 'Mandatory registration to practise in Portugal. [LEGAL] confirm accepted titles.',
  },

  // ── France ────────────────────────────────────────────────────────────────
  // RPPS replaced ADELI as of June 2024 for psychologists.
  // "Psychothérapeute" uses a separate ARS register. [LEGAL] confirm which you accept.
  RPPS: {
    label: 'Répertoire Partagé des Professionnels de Santé',
    url: 'https://annuaire.sante.fr',
    checkBy: '11-digit RPPS number or name',
    country: 'FR',
    automated: true,
    notes: '[LEGAL] Psychologues use RPPS; psychothérapeutes may use ARS register. Confirm accepted titles.',
  },
  ARS: {
    label: 'Agences Régionales de Santé (psychothérapeutes)',
    url: 'https://www.psychotherapeutes.eu/annuaire-psychotherapeutes',
    checkBy: 'name or ARS registration number',
    country: 'FR',
    automated: false,
    notes: '[LEGAL] Only for psychothérapeute title. Confirm with counsel whether you accept this alongside RPPS.',
  },

  // ── Italy ─────────────────────────────────────────────────────────────────
  // Nationally coordinated Ordine degli Psicologi but registration is per regional Albo.
  OPL: {
    label: 'Ordine degli Psicologi (nazionale)',
    url: 'https://www.ordinepsicologi.it/it/pubblico/trova-psicologo',
    checkBy: 'name or Albo registration number',
    country: 'IT',
    automated: false,
    notes: '[LEGAL] Regional Albo entry required. Psychotherapy also requires specific postgraduate training.',
  },
  OPR: {
    label: 'Ordine degli Psicologi (regionale)',
    url: 'https://www.ordinepsicologi.it/it/ordini-regionali',
    checkBy: 'name via the correct regional Albo page',
    country: 'IT',
    automated: false,
    notes: 'Use OPL national search first; fall back to regional Albo if not found.',
  },

  // ── Spain ─────────────────────────────────────────────────────────────────
  // No single national lookup — verification must route to the correct regional college.
  // Build a manual-review queue with region-of-registration captured at onboarding.
  COP: {
    label: 'Consejo General de la Psicología (Colegios Oficiales de Psicólogos)',
    url: 'https://www.cop.es/index.php?page=colegios',
    checkBy: 'número de colegiación via the correct regional college page',
    country: 'ES',
    automated: false,
    notes: '[LEGAL] Regional colleges: Madrid (COPM), Andalucía, Cataluña, etc. No single national API. Manual review required. Confirm accepted titles.',
  },

  // ── Germany ───────────────────────────────────────────────────────────────
  // Approbierte Psychotherapeuten only (per default policy). Heilpraktiker decision
  // requires explicit [LEGAL] + brand sign-off before enabling.
  PTK: {
    label: 'Psychotherapeutenkammer (Bundesland-level)',
    url: 'https://www.bptk.de/service/adressen-der-ptk/',
    checkBy: 'Approbation via the relevant state Kammer',
    country: 'DE',
    automated: false,
    notes: '[LEGAL] Approbation is state-issued. Confirm which Kammern to accept and whether Heilpraktiker für Psychotherapie are in scope.',
  },
  KV: {
    label: 'Kassenärztliche Vereinigung (for panel therapists)',
    url: 'https://www.kbv.de/html/arztsuche.php',
    checkBy: 'LANR (Lebenslange Arztnummer) or name',
    country: 'DE',
    automated: false,
    notes: 'Supplementary check for panel psychotherapists. Not all private therapists are KV-listed.',
  },
}

// Schema comment uses the legacy "NCS" code; treat it as NCPS.
REGISTERS.NCS = REGISTERS.NCPS

export function registerFor(body: string | null | undefined): Register | null {
  if (!body) return null
  return REGISTERS[body.toUpperCase()] ?? null
}

export function registersForCountry(countryCode: string): Register[] {
  const code = countryCode.toUpperCase()
  return Object.values(REGISTERS).filter(r => r.country === code)
}
