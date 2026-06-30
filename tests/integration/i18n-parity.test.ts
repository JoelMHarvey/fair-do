/**
 * i18n key-parity guard.
 *
 * en.json is the source of truth. Every other locale must have the EXACT same
 * set of key paths (including array lengths) — no missing keys (which would
 * render blank) and no stray keys (dead translations). Content may still be an
 * English stub pending real translation; this test only checks structure.
 */
import { describe, it, expect } from 'vitest'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import itLocale from '@/messages/it.json'
import es from '@/messages/es.json'
import pt from '@/messages/pt.json'
import { NON_EN_LOCALES } from '@/lib/locale-config'

const locales: Record<string, unknown> = { fr, de, it: itLocale, es, pt }

// Collect every leaf key-path. Arrays use numeric indices so a translation
// with the wrong number of items (e.g. 6 FAQs instead of 7) is caught.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    )
  }
  return [prefix]
}

const enPaths = keyPaths(en).sort()

describe('i18n locale parity', () => {
  it('every non-en locale is registered in the test', () => {
    expect(Object.keys(locales).sort()).toEqual([...NON_EN_LOCALES].sort())
  })

  for (const loc of NON_EN_LOCALES) {
    it(`${loc}.json has identical key structure to en.json`, () => {
      const locPaths = keyPaths(locales[loc]).sort()
      const missing = enPaths.filter(p => !locPaths.includes(p))
      const extra = locPaths.filter(p => !enPaths.includes(p))
      expect({ missing, extra }).toEqual({ missing: [], extra: [] })
    })
  }
})
