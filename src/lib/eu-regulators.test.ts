import { describe, it, expect } from 'vitest'
import { verificationProviderFor, countryVerificationSummary } from './eu-regulators'
import { regionConfig } from './locale'
import { registerFor, registersForCountry } from './credential-registers'

// ── regionConfig EU entries ───────────────────────────────────────────────────

describe('regionConfig — EU countries', () => {
  it('PT uses EUR', () => {
    expect(regionConfig('PT').currencyCode).toBe('EUR')
    expect(regionConfig('PT').currencySymbol).toBe('€')
  })

  it('FR uses EUR', () => {
    expect(regionConfig('FR').currencyCode).toBe('EUR')
  })

  it('PT has directory verification approach', () => {
    expect(regionConfig('PT').verificationApproach).toBe('directory')
  })

  it('FR has directory verification approach', () => {
    expect(regionConfig('FR').verificationApproach).toBe('directory')
  })

  it('ES has fragmented verification approach', () => {
    expect(regionConfig('ES').verificationApproach).toBe('fragmented')
  })

  it('IT has fragmented verification approach', () => {
    expect(regionConfig('IT').verificationApproach).toBe('fragmented')
  })

  it('DE has manual-review verification approach', () => {
    expect(regionConfig('DE').verificationApproach).toBe('manual-review')
  })

  it('PT has OPP as credential body', () => {
    expect(regionConfig('PT').credentialBodies).toContain('OPP')
  })

  it('FR has RPPS as credential body', () => {
    expect(regionConfig('FR').credentialBodies).toContain('RPPS')
  })

  it('PT does not scope by region', () => {
    expect(regionConfig('PT').scopesByRegion).toBe(false)
  })

  it('ES scopes by region', () => {
    expect(regionConfig('ES').scopesByRegion).toBe(true)
  })

  it('IT scopes by region', () => {
    expect(regionConfig('IT').scopesByRegion).toBe(true)
  })

  it('DE scopes by region (Bundesland)', () => {
    expect(regionConfig('DE').scopesByRegion).toBe(true)
  })

  it('PT emergency number is 112', () => {
    expect(regionConfig('PT').emergencyNumber).toBe('112')
  })

  it('FR emergency number is 15 (SAMU)', () => {
    expect(regionConfig('FR').emergencyNumber).toBe('15')
  })

  it('FR crisis lines include 3114 (suicide prevention)', () => {
    const lines = regionConfig('FR').crisisLines
    expect(lines.some(l => l.contact.includes('3114'))).toBe(true)
  })

  it('DE crisis lines include Telefonseelsorge', () => {
    const lines = regionConfig('DE').crisisLines
    expect(lines.some(l => l.name.includes('Telefonseelsorge'))).toBe(true)
  })

  it('all EU configs have at least 2 crisis lines', () => {
    for (const c of ['PT', 'FR', 'IT', 'ES', 'DE']) {
      expect(regionConfig(c).crisisLines.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('UK config unchanged — still has BACP', () => {
    expect(regionConfig('UK').credentialBodies).toContain('BACP')
    expect(regionConfig('UK').emergencyNumber).toBe('999')
  })
})

// ── credential-registers EU entries ──────────────────────────────────────────

describe('credential-registers — EU', () => {
  it('OPP register has PT country code', () => {
    expect(registerFor('OPP')?.country).toBe('PT')
  })

  it('RPPS register has FR country code', () => {
    expect(registerFor('RPPS')?.country).toBe('FR')
  })

  it('OPP is flagged as automated (directory lookup feasible)', () => {
    expect(registerFor('OPP')?.automated).toBe(true)
  })

  it('RPPS is flagged as automated', () => {
    expect(registerFor('RPPS')?.automated).toBe(true)
  })

  it('COP is not automated (fragmented regional colleges)', () => {
    expect(registerFor('COP')?.automated).toBe(false)
  })

  it('PTK is not automated', () => {
    expect(registerFor('PTK')?.automated).toBe(false)
  })

  it('registersForCountry("PT") returns OPP', () => {
    const regs = registersForCountry('PT')
    expect(regs.some(r => r.label.includes('Ordem dos Psicólogos'))).toBe(true)
  })

  it('registersForCountry("FR") returns RPPS and ARS registers', () => {
    const regs = registersForCountry('FR')
    expect(regs.some(r => r.label.includes('Partagé'))).toBe(true)   // RPPS full name
    expect(regs.some(r => r.label.includes('Agences'))).toBe(true)   // ARS full name
  })

  it('registersForCountry("ES") returns COP register', () => {
    const regs = registersForCountry('ES')
    expect(regs.length).toBeGreaterThan(0)
    expect(regs.some(r => r.label.includes('Psicología'))).toBe(true)
  })

  it('UK registers still resolve (NCS alias)', () => {
    expect(registerFor('NCS')).not.toBeNull()
    expect(registerFor('BACP')?.country).toBe('GB')
  })
})

// ── verificationProviderFor ───────────────────────────────────────────────────

describe('verificationProviderFor', () => {
  it('returns provider for PT', () => {
    expect(verificationProviderFor('PT')).not.toBeNull()
  })

  it('returns provider for FR', () => {
    expect(verificationProviderFor('FR')).not.toBeNull()
  })

  it('returns provider for ES', () => {
    expect(verificationProviderFor('ES')).not.toBeNull()
  })

  it('returns provider for IT', () => {
    expect(verificationProviderFor('IT')).not.toBeNull()
  })

  it('returns provider for DE', () => {
    expect(verificationProviderFor('DE')).not.toBeNull()
  })

  it('returns null for unknown country', () => {
    expect(verificationProviderFor('XX')).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(verificationProviderFor('pt')).not.toBeNull()
  })
})

// ── VerificationProvider.verify ───────────────────────────────────────────────

describe('VerificationProvider.verify', () => {
  const INPUT = { country: 'PT', credentialType: 'OPP', number: '12345', name: 'Ana Costa' }

  it('PT verify returns manual-review-required (until API automated)', async () => {
    const result = await verificationProviderFor('PT')!.verify(INPUT)
    expect(result.status).toBe('manual-review-required')
  })

  it('PT verify includes OPP lookup URL', async () => {
    const result = await verificationProviderFor('PT')!.verify(INPUT)
    expect(result.lookupUrl).toContain('ordemdospsicologos.pt')
  })

  it('FR verify returns manual-review-required', async () => {
    const result = await verificationProviderFor('FR')!.verify({ ...INPUT, country: 'FR', credentialType: 'RPPS', number: '12345678901' })
    expect(result.status).toBe('manual-review-required')
  })

  it('ES verify includes region in evidence when provided', async () => {
    const result = await verificationProviderFor('ES')!.verify({ ...INPUT, country: 'ES', credentialType: 'COP', region: 'madrid' })
    expect(result.evidence).toContain('madrid')
  })

  it('ES verify includes regional URL for known region', async () => {
    const result = await verificationProviderFor('ES')!.verify({ ...INPUT, country: 'ES', credentialType: 'COP', region: 'madrid' })
    expect(result.lookupUrl).toContain('copmadrid')
  })

  it('DE verify evidence flags [LEGAL] warning', async () => {
    const result = await verificationProviderFor('DE')!.verify({ ...INPUT, country: 'DE', credentialType: 'PTK' })
    expect(result.evidence).toContain('[LEGAL]')
  })

  it('all providers have sopDescription()', () => {
    for (const c of ['PT', 'FR', 'IT', 'ES', 'DE']) {
      const desc = verificationProviderFor(c)!.sopDescription()
      expect(typeof desc).toBe('string')
      expect(desc.length).toBeGreaterThan(20)
    }
  })
})

// ── countryVerificationSummary ────────────────────────────────────────────────

describe('countryVerificationSummary', () => {
  it('PT summary has correct fields', () => {
    const s = countryVerificationSummary('PT')
    expect(s.country).toBe('PT')
    expect(s.verificationApproach).toBe('directory')
    expect(s.registers.length).toBeGreaterThan(0)
    expect(s.sopDescription).toBeTruthy()
  })

  it('DE summary carries legal warning in sopDescription', () => {
    const s = countryVerificationSummary('DE')
    expect(s.sopDescription).toContain('[LEGAL')
  })
})
