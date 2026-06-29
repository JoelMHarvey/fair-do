/**
 * Teacher credential validation.
 *
 * State of play (2026): none of BACP / UKCP / BPS / NCS expose a public verification API.
 * So full automation isn't possible today. This module defines the seam so we can plug in
 * automation incrementally without touching call sites.
 *
 * Strategy:
 *  1. NOW — manual: admin checks the qualification ref against the body's online register
 *     and approves in /admin. credentialCheckStatus stays null → 'manual'.
 *  2. SOON — identity assurance: Onfido / Yoti document + biometric check confirms the person
 *     is who they claim (doesn't prove qualification, but stops impersonation). Store check id.
 *  3. LATER — register scraping or an official partnership for true
 *     qualification validation.
 */

export type CredentialCheckResult = {
  status: 'pending' | 'clear' | 'consider' | 'manual'
  checkId?: string
}

export async function startCredentialCheck(_opts: {
  teacherId: string
  qualificationBody: string
  qualificationRef: string
}): Promise<CredentialCheckResult> {
  // Onfido integration goes here when ONFIDO_API_TOKEN is configured.
  if (!process.env.ONFIDO_API_TOKEN) {
    return { status: 'manual' }
  }
  // TODO: create Onfido applicant + check, return { status: 'pending', checkId }
  return { status: 'manual' }
}
