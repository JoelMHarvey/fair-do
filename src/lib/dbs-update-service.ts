// DBS Update Service API client.
//
// The DBS Update Service (gov.uk) allows registered employers to check the
// currency of an existing DBS certificate at any time, with the applicant's
// consent. Certificates do not expire but the service will report if new
// information has been added since the certificate was issued ("updated").
//
// To activate: register as an employer with the DBS Update Service at
// https://www.gov.uk/dbs-update-service, obtain API credentials, and set:
//   DBS_UPDATE_SERVICE_ORG_ID    — your registered organisation ID
//   DBS_UPDATE_SERVICE_API_KEY   — API key from the DBS portal
//
// API docs: https://www.check-the-dbs-update-service.service.gov.uk/api/docs
//
// Status values returned by checkDbsCertificate:
//   CLEAR    — certificate is current, no new information
//   UPDATED  — new information has been added — trigger admin re-review
//   NOT_FOUND — certificate number not found (may be pre-Update-Service)
//   CONSENT_REQUIRED — applicant consent not on file for this check
//   ERROR    — API unavailable or credentials invalid

export type DbsCheckStatus = 'clear' | 'updated' | 'not_found' | 'consent_required' | 'error'

export type DbsCheckResult = {
  status: DbsCheckStatus
  checkedAt: Date
  certificateDate?: string     // date of the DBS certificate as held by the service
  nextCheckRecommendedAt?: Date // we recommend re-checking after 12 months
}

type DbsApiResponse = {
  result: 'CLEAR' | 'UPDATED' | 'NOT_FOUND' | 'CONSENT_REQUIRED' | 'ERROR'
  certificateDate?: string
}

const BASE_URL = 'https://www.check-the-dbs-update-service.service.gov.uk/v1'

function isConfigured(): boolean {
  return !!(process.env.DBS_UPDATE_SERVICE_ORG_ID && process.env.DBS_UPDATE_SERVICE_API_KEY)
}

// Check a DBS certificate status.
// Requires the teacher's consent (dbsUpdateConsent=true) before calling.
export async function checkDbsCertificate(opts: {
  certificateNumber: string
  dateOfBirth: string          // YYYY-MM-DD
  firstName: string
  lastName: string
}): Promise<DbsCheckResult> {
  const now = new Date()
  const nextCheck = new Date(now)
  nextCheck.setFullYear(nextCheck.getFullYear() + 1)

  if (!isConfigured()) {
    // Not yet registered — return a sentinel that won't auto-suspend anyone.
    return { status: 'error', checkedAt: now }
  }

  try {
    const res = await fetch(`${BASE_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Org-Id':   process.env.DBS_UPDATE_SERVICE_ORG_ID!,
        'X-Api-Key':  process.env.DBS_UPDATE_SERVICE_API_KEY!,
      },
      body: JSON.stringify({
        certificateNumber: opts.certificateNumber,
        dateOfBirth:       opts.dateOfBirth,
        firstName:         opts.firstName,
        lastName:          opts.lastName,
      }),
    })

    if (!res.ok) {
      console.error('[dbs] API error', res.status, await res.text().catch(() => ''))
      return { status: 'error', checkedAt: now }
    }

    const data: DbsApiResponse = await res.json()

    const statusMap: Record<DbsApiResponse['result'], DbsCheckStatus> = {
      CLEAR:             'clear',
      UPDATED:           'updated',
      NOT_FOUND:         'not_found',
      CONSENT_REQUIRED:  'consent_required',
      ERROR:             'error',
    }

    return {
      status: statusMap[data.result] ?? 'error',
      checkedAt: now,
      certificateDate: data.certificateDate,
      nextCheckRecommendedAt: data.result === 'CLEAR' ? nextCheck : undefined,
    }
  } catch (e) {
    console.error('[dbs] fetch failed:', e instanceof Error ? e.message : e)
    return { status: 'error', checkedAt: now }
  }
}

export { isConfigured as dbsUpdateServiceConfigured }
