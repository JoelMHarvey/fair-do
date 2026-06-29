// Country-aware therapist verification engine for EU markets.
//
// Architecture: each country is a VerificationProvider. Where a public directory
// lookup exists (PT, FR) the provider links to it and can be automated later.
// Where registers are fragmented (ES, IT) or involve a policy decision (DE),
// the provider routes to a manual-review queue with structured evidence capture.
//
// Usage (admin verification flow):
//   const provider = verificationProviderFor('PT')
//   const result = await provider.verify({ credentialType: 'OPP', number: '12345', name: 'Ana Costa' })
//
// [LEGAL] All accepted-title lists and insurance requirements must be confirmed
// with local legal counsel before launch in each country. This file models the
// engineering; the compliance sign-off gates each country going live.

import { registerFor, registersForCountry } from './credential-registers'
import { regionConfig } from './locale'

export type VerificationStatus = 'clear' | 'manual-review-required' | 'not-found' | 'pending'

export type VerificationResult = {
  status: VerificationStatus
  // URL for a human reviewer to open in order to confirm the credential.
  lookupUrl?: string
  // Structured evidence to store alongside the check (timestamp added by caller).
  evidence: string
  // Whether this was performed automatically or routed to the manual-review queue.
  method: 'automated-lookup' | 'manual-review'
}

export type VerifyInput = {
  // ISO 3166-1 alpha-2 country code
  country: string
  // Credential type — must be one of the country's accepted credentialBodies
  credentialType: string
  // The credential number provided by the therapist
  number: string
  // Full name as registered, for directory lookups
  name: string
  // Optional: for regionally fragmented countries (ES, IT), which region/college
  region?: string
}

export interface VerificationProvider {
  country: string
  verify(input: VerifyInput): Promise<VerificationResult>
  // Human-readable description of the verification process for admin SOP.
  sopDescription(): string
}

// ── Portugal — OPP (automated directory lookup feasible) ──────────────────────

class OPPProvider implements VerificationProvider {
  country = 'PT'

  async verify(input: VerifyInput): Promise<VerificationResult> {
    const reg = registerFor('OPP')
    return {
      status: 'manual-review-required',
      lookupUrl: reg?.url,
      evidence: `OPP directory search required for Cédula ${input.number} (${input.name}). URL: ${reg?.url}`,
      method: 'manual-review',
    }
    // TODO: when OPP exposes a stable API or scrape-safe endpoint, replace with
    // automated lookup and return status: 'clear' | 'not-found'.
  }

  sopDescription() {
    return 'Search the OPP directory (diretorio.ordemdospsicologos.pt) by Cédula Profissional number and full name. Confirm active registration status and match to the therapist profile. Screenshot the result as evidence.'
  }
}

// ── France — RPPS (automated directory lookup feasible) ───────────────────────

class RPPSProvider implements VerificationProvider {
  country = 'FR'

  async verify(input: VerifyInput): Promise<VerificationResult> {
    const reg = registerFor(input.credentialType === 'ARS' ? 'ARS' : 'RPPS')
    return {
      status: 'manual-review-required',
      lookupUrl: reg?.url,
      evidence: `${input.credentialType ?? 'RPPS'} search required for number ${input.number} (${input.name}). URL: ${reg?.url}`,
      method: 'manual-review',
    }
    // TODO: annuaire.sante.fr supports name/RPPS lookups — automate when API confirmed.
  }

  sopDescription() {
    return 'For psychologues: search annuaire.sante.fr by 11-digit RPPS number. For psychothérapeutes: check ARS regional register. Confirm active status, title, and name match. [LEGAL] confirm which titles Faresay accepts in France before approving any application.'
  }
}

// ── Italy — Ordine Psicologi (fragmented regional Albi) ───────────────────────

class ItalyProvider implements VerificationProvider {
  country = 'IT'

  async verify(input: VerifyInput): Promise<VerificationResult> {
    const reg = registerFor('OPL')
    const regionNote = input.region ? ` (region: ${input.region})` : ''
    return {
      status: 'manual-review-required',
      lookupUrl: reg?.url,
      evidence: `Ordine degli Psicologi check required for Albo number ${input.number}${regionNote} (${input.name}). Check national directory first, then regional Albo if needed.`,
      method: 'manual-review',
    }
  }

  sopDescription() {
    return 'Search the national Ordine degli Psicologi directory (ordinepsicologi.it). If not found, check the regional Albo page for the therapist\'s stated region. Confirm active registration. For Psicoterapeuta title, verify postgraduate training certification exists. Screenshot as evidence.'
  }
}

// ── Spain — COP regional colleges (most fragmented, manual review required) ───

class SpainProvider implements VerificationProvider {
  country = 'ES'

  // Mapping of major regional colleges to their direct verification pages.
  private static REGIONAL_URLS: Record<string, string> = {
    'madrid': 'https://www.copmadrid.org/web/colegiados',
    'andalucia': 'https://www.copao.com/colegiados',
    'cataluna': 'https://www.copc.cat/en/col%C2%B7legiats',
    'valencia': 'https://www.cop-cv.org/db/colegiats',
    'galicia': 'https://www.copgalicia.gal/colexiados',
    'pais-vasco': 'https://www.euskalpsikologia.eus/colegiados',
  }

  async verify(input: VerifyInput): Promise<VerificationResult> {
    const regionKey = (input.region ?? '').toLowerCase().replace(/\s+/g, '-')
    const regionalUrl = SpainProvider.REGIONAL_URLS[regionKey]
    const lookupUrl = regionalUrl ?? registerFor('COP')?.url
    return {
      status: 'manual-review-required',
      lookupUrl,
      evidence: `COP regional check required for número de colegiación ${input.number}${input.region ? ` (${input.region})` : ''} (${input.name}). ${regionalUrl ? `Regional URL: ${regionalUrl}` : 'Regional college unknown — use COP national directory to identify the correct college.'}`,
      method: 'manual-review',
    }
  }

  sopDescription() {
    return 'Identify the therapist\'s regional college from their número de colegiación prefix or stated region. Navigate to the correct regional Colegio de Psicólogos page (see REGIONAL_URLS in eu-regulators.ts). Search by name and colegiación number. If the regional college is not listed, fall back to the COP national directory. [LEGAL] confirm which regional colleges Faresay accepts.'
  }
}

// ── Germany — Approbation + state Psychotherapeutenkammer ─────────────────────
// [LEGAL] + brand decision required on Heilpraktiker für Psychotherapie before launch.

class GermanyProvider implements VerificationProvider {
  country = 'DE'

  async verify(input: VerifyInput): Promise<VerificationResult> {
    const reg = registerFor('PTK')
    const bundesland = input.region ?? 'unknown'
    return {
      status: 'manual-review-required',
      lookupUrl: reg?.url,
      evidence: `Approbation check required for ${input.name} (Bundesland: ${bundesland}, credential: ${input.number}). Check with relevant state Psychotherapeutenkammer. [LEGAL] Confirm Heilpraktiker eligibility policy before approving any DE therapist.`,
      method: 'manual-review',
    }
  }

  sopDescription() {
    return '[LEGAL — do not approve any German therapist until Heilpraktiker policy is decided.] For Approbierte Psychotherapeuten: contact the relevant state Psychotherapeutenkammer (see bptk.de/service/adressen-der-ptk). Request Approbationsurkunde copy from therapist and cross-check with Kammer. Record Kammer name, date of verification, and evidence file. Germany should be the last EU country to launch.'
  }
}

// ── Provider registry ─────────────────────────────────────────────────────────

const PROVIDERS: Record<string, VerificationProvider> = {
  PT: new OPPProvider(),
  FR: new RPPSProvider(),
  IT: new ItalyProvider(),
  ES: new SpainProvider(),
  DE: new GermanyProvider(),
}

export function verificationProviderFor(country: string): VerificationProvider | null {
  return PROVIDERS[country.toUpperCase()] ?? null
}

// Returns all registers + their SOP notes for a country. Used in admin UI.
export function countryVerificationSummary(country: string) {
  const config = regionConfig(country)
  const registers = registersForCountry(country.length === 2 ? countryToISO(country) : country)
  const provider = verificationProviderFor(country)
  return {
    country,
    label: config.label,
    verificationApproach: config.verificationApproach,
    requiresInsurance: config.requiresInsurance,
    acceptedTitles: config.acceptedTitles,
    registers,
    sopDescription: provider?.sopDescription() ?? null,
  }
}

// Maps Region codes used by Faresay to ISO 3166-1 alpha-2 for register lookup.
function countryToISO(region: string): string {
  const MAP: Record<string, string> = { UK: 'GB', US: 'US', PT: 'PT', FR: 'FR', IT: 'IT', ES: 'ES', DE: 'DE' }
  return MAP[region.toUpperCase()] ?? region.toUpperCase()
}
