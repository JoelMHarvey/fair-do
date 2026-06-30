/**
 * Spanish translation smoke test. Parity (i18n-parity.test) proves es.json has
 * the same STRUCTURE as en; this proves it actually carries Spanish CONTENT and
 * that the verbatim rules (identifiers, placeholders, brand) were respected — so
 * a regression back to English stubs, or a broken placeholder, is caught.
 */
import { describe, it, expect } from 'vitest'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

describe('es.json is translated', () => {
  it('representative UI strings differ from English', () => {
    expect(es.home.hero_cta_primary).not.toBe(en.home.hero_cta_primary)
    expect(es.nav.pricing).not.toBe(en.nav.pricing)
    expect(es.faq.heading).not.toBe(en.faq.heading)
    expect(es.pricing.h1).not.toBe(en.pricing.h1)
    expect(es.email.teacher_approved.subject).not.toBe(en.email.teacher_approved.subject)
  })

  it('the bulk of leaves are actually translated (not stubs)', () => {
    let total = 0
    let translated = 0
    const walk = (a: unknown, b: unknown) => {
      if (Array.isArray(a) && Array.isArray(b)) a.forEach((v, i) => walk(v, b[i]))
      else if (a && typeof a === 'object' && b && typeof b === 'object')
        for (const k of Object.keys(a)) walk((a as never)[k], (b as never)[k])
      else { total++; if (a !== b) translated++ }
    }
    walk(en, es)
    expect(translated / total).toBeGreaterThan(0.7)
  })
})

describe('es.json respects the verbatim rules', () => {
  it('keeps logic identifier values in English', () => {
    expect(es.resource_library.categories.map(c => c.value))
      .toEqual(en.resource_library.categories.map(c => c.value))
    expect(es.styles.subjects.map(s => s.key)).toEqual(en.styles.subjects.map(s => s.key))
  })

  it('preserves every email placeholder token', () => {
    const blob = JSON.stringify(es.email)
    for (const token of ['{firstName}', '{amount}', '{date}', '{displayName}', '{qualificationBody}', '{cancelLink}']) {
      expect(blob).toContain(token)
    }
  })

  it('keeps the fair-do brand name untranslated', () => {
    expect(JSON.stringify(es)).toContain('fair-do')
  })
})
