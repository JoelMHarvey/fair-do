// Tenant theming — one school brand hex → a full 50–900 palette via OKLCH
// (docs/ENTERPRISE-SCHOOLS-PLAN.md D3). Dependency-free and client-safe (no
// 'server-only'): the branding editor imports brandRamp for its live preview,
// the root layout uses tenantThemeCss to override the @theme tokens in
// src/app/globals.css.

// Same #rrggbb rule as src/lib/email-brand.ts.
export const HEX_RE = /^#[0-9a-fA-F]{6}$/

export type RampStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

const STEPS: RampStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

// Fixed OKLCH lightness per step (tuned near Tailwind's own scales) so a ramp
// from ANY hue keeps the same perceived weight as the stock indigo palette.
const STEP_L: Record<RampStep, number> = {
  50: 0.97, 100: 0.94, 200: 0.885, 300: 0.81, 400: 0.71,
  500: 0.61, 600: 0.52, 700: 0.455, 800: 0.395, 900: 0.34,
}

// Max chroma per step (scaled by input saturation, then gamut-clamped) — light
// tints stay washed, mid-tones carry the colour.
const STEP_C: Record<RampStep, number> = {
  50: 0.02, 100: 0.045, 200: 0.09, 300: 0.14, 400: 0.2,
  500: 0.24, 600: 0.25, 700: 0.23, 800: 0.2, 900: 0.17,
}

// Steps used as text/CTA on white must hold WCAG contrast for any hue —
// high-luminance hues (yellow, lime) are darkened until they pass. Targets
// increase down the ramp so enforcement can never invert its order.
const MIN_CONTRAST: Partial<Record<RampStep, number>> = { 600: 4.5, 700: 5.2, 800: 6.5, 900: 8 }

// ── sRGB ⇄ OKLCH (Björn Ottosson's OKLab, standard matrices) ────────────────

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function hexToLinearRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255)]
}

/** hex → { l, c, h } in OKLCH. Exposed for tests + preview; assumes valid #rrggbb. */
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const [r, g, b] = hexToLinearRgb(hex)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(a, bb)
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
  ]
}

function inGamut(rgb: [number, number, number]): boolean {
  return rgb.every(v => v >= -1e-4 && v <= 1 + 1e-4)
}

// Reduce chroma (hue and lightness held) until the colour fits sRGB.
function oklchToHex(l: number, c: number, h: number): string {
  let rgb = oklchToLinearRgb(l, c, h)
  if (!inGamut(rgb)) {
    let lo = 0
    let hi = c
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchToLinearRgb(l, mid, h))) lo = mid
      else hi = mid
    }
    rgb = oklchToLinearRgb(l, lo, h)
  }
  const to255 = (v: number) => Math.max(0, Math.min(255, Math.round(linearToSrgb(v) * 255)))
  return '#' + rgb.map(v => to255(v).toString(16).padStart(2, '0')).join('')
}

// ── WCAG relative-luminance contrast ─────────────────────────────────────────

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinearRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio of a colour against white (AA text needs ≥ 4.5). */
export function contrastOnWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Derive a full 50–900 palette from one #rrggbb brand colour, or null when the
 * hex is invalid. Hue is preserved; lightness follows a fixed scale; 600–900
 * are darkened as needed so they pass WCAG AA (4.5:1) as text on white for any
 * input hue. Near-neutral inputs produce a near-neutral ramp.
 */
export function brandRamp(hex: string): Record<RampStep, string> | null {
  if (!HEX_RE.test(hex)) return null
  const { c, h } = hexToOklch(hex)
  // Dull inputs get a proportionally dull ramp; ≥0.15 chroma counts as fully saturated.
  const sat = Math.min(1, c / 0.15)
  const ramp = {} as Record<RampStep, string>
  for (const step of STEPS) {
    let l = STEP_L[step]
    let out = oklchToHex(l, STEP_C[step] * sat, h)
    const min = MIN_CONTRAST[step]
    while (min && contrastOnWhite(out) < min && l > 0.05) {
      l -= 0.01
      out = oklchToHex(l, STEP_C[step] * sat, h)
    }
    ramp[step] = out
  }
  return ramp
}

// globals.css only defines coral (accent) tokens 50–600.
const CORAL_STEPS: RampStep[] = [50, 100, 200, 300, 400, 500, 600]

/**
 * One `:root{…}` block overriding the @theme tokens in globals.css with the
 * tenant's brand ramp (+ accent → coral tokens when accentColor is set).
 * Returns null — no override, stock fair-do theme — when neither colour is a
 * valid #rrggbb.
 */
export function tenantThemeCss(org: { brandColor?: string | null; accentColor?: string | null }): string | null {
  const brand = org.brandColor ? brandRamp(org.brandColor) : null
  const accent = org.accentColor ? brandRamp(org.accentColor) : null
  if (!brand && !accent) return null
  const vars: string[] = []
  if (brand) for (const step of STEPS) vars.push(`--color-brand-${step}:${brand[step]}`)
  if (accent) for (const step of CORAL_STEPS) vars.push(`--color-coral-${step}:${accent[step]}`)
  return `:root{${vars.join(';')}}`
}
