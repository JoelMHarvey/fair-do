import { describe, it, expect } from 'vitest'
import { brandRamp, tenantThemeCss, contrastOnWhite, relativeLuminance, hexToOklch, HEX_RE, type RampStep } from './theme'

const STEPS: RampStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

// A hue sweep including the hard cases: yellow (high-luminance), near-black
// and near-white (no meaningful hue/chroma).
const INPUTS = {
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#facc15',
  pureYellow: '#ffff00',
  nearBlack: '#0a0a0a',
  nearWhite: '#fafaf9',
}

function hueDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

describe('brandRamp', () => {
  it('returns null for invalid input', () => {
    for (const bad of ['', 'red', '#fff', '#12345g', '4f46e5', '#4f46e5aa', '#4f46e', 'rgb(0,0,0)']) {
      expect(brandRamp(bad), bad).toBeNull()
    }
  })

  it('returns all ten steps as valid lowercase hex', () => {
    const ramp = brandRamp('#4F46E5')
    expect(ramp).not.toBeNull()
    for (const step of STEPS) {
      expect(ramp![step]).toMatch(/^#[0-9a-f]{6}$/)
      expect(HEX_RE.test(ramp![step])).toBe(true)
    }
  })

  it.each(Object.entries(INPUTS))('600 and 700 pass WCAG AA (4.5:1) on white for %s', (_name, hex) => {
    const ramp = brandRamp(hex)!
    expect(contrastOnWhite(ramp[600])).toBeGreaterThanOrEqual(4.5)
    expect(contrastOnWhite(ramp[700])).toBeGreaterThanOrEqual(4.5)
    // 700 must still read darker than 600
    expect(relativeLuminance(ramp[700])).toBeLessThan(relativeLuminance(ramp[600]))
  })

  it.each(Object.entries(INPUTS))('luminance decreases monotonically 50→900 for %s', (_name, hex) => {
    const ramp = brandRamp(hex)!
    for (let i = 1; i < STEPS.length; i++) {
      const lighter = relativeLuminance(ramp[STEPS[i - 1]])
      const darker = relativeLuminance(ramp[STEPS[i]])
      expect(darker, `${STEPS[i]} vs ${STEPS[i - 1]}`).toBeLessThan(lighter)
    }
  })

  it.each(Object.entries(INPUTS))('50 is a near-white tint for %s', (_name, hex) => {
    const ramp = brandRamp(hex)!
    expect(contrastOnWhite(ramp[50])).toBeLessThan(1.3)
  })

  it('preserves the input hue for saturated colours', () => {
    for (const hex of [INPUTS.blue, INPUTS.red, INPUTS.green]) {
      const input = hexToOklch(hex)
      const ramp = brandRamp(hex)!
      for (const step of [400, 500, 600] as RampStep[]) {
        expect(hueDelta(hexToOklch(ramp[step]).h, input.h), `${hex} @ ${step}`).toBeLessThan(6)
      }
    }
  })

  it('gives near-neutral inputs a near-neutral ramp', () => {
    for (const hex of [INPUTS.nearBlack, INPUTS.nearWhite]) {
      const ramp = brandRamp(hex)!
      for (const step of STEPS) {
        expect(hexToOklch(ramp[step]).c, `${hex} @ ${step}`).toBeLessThan(0.03)
      }
    }
  })
})

describe('tenantThemeCss', () => {
  it('returns null when no valid colour is set', () => {
    expect(tenantThemeCss({})).toBeNull()
    expect(tenantThemeCss({ brandColor: null, accentColor: null })).toBeNull()
    expect(tenantThemeCss({ brandColor: 'blue', accentColor: '#fff' })).toBeNull()
  })

  it('emits a :root block with all brand tokens', () => {
    const css = tenantThemeCss({ brandColor: '#2563eb' })!
    expect(css.startsWith(':root{')).toBe(true)
    expect(css.endsWith('}')).toBe(true)
    for (const step of STEPS) expect(css).toContain(`--color-brand-${step}:#`)
    expect(css).not.toContain('--color-coral-')
  })

  it('emits coral (accent) tokens 50–600 only when accentColor is set', () => {
    const css = tenantThemeCss({ brandColor: '#2563eb', accentColor: '#dc2626' })!
    for (const step of [50, 100, 200, 300, 400, 500, 600]) expect(css).toContain(`--color-coral-${step}:#`)
    expect(css).not.toContain('--color-coral-700')
  })

  it('accent alone still produces an override', () => {
    const css = tenantThemeCss({ brandColor: 'nope', accentColor: '#dc2626' })!
    expect(css).toContain('--color-coral-500:#')
    expect(css).not.toContain('--color-brand-')
  })

  it('is a single line safe to inline in a <style> tag', () => {
    const css = tenantThemeCss({ brandColor: '#16a34a', accentColor: '#facc15' })!
    expect(css).not.toMatch(/[\n<>]/)
  })
})
