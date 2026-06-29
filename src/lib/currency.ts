// Display-only currency localisation. Sessions are still CHARGED in the
// therapist's settlement currency (GBP/USD) — this only shows the visitor an
// estimate in their own currency. Rates are GBP-based, refreshed daily by
// /api/cron/fx; the static table below is the always-available fallback.

export type CurrencyInfo = { code: string; symbol: string; locale: string; zeroDecimal?: boolean }

export const CURRENCIES: Record<string, CurrencyInfo> = {
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'en-IE' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', zeroDecimal: true },
  CAD: { code: 'CAD', symbol: 'CA$', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  CHF: { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  NZD: { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  SEK: { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  NOK: { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  DKK: { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
  PLN: { code: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  AED: { code: 'AED', symbol: 'AED', locale: 'ar-AE' },
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
}

// Fallback GBP-based rates (1 GBP = N units). Refreshed by the FX cron.
export const FALLBACK_RATES: Record<string, number> = {
  GBP: 1, USD: 1.27, EUR: 1.17, JPY: 190, CAD: 1.72, AUD: 1.92, CHF: 1.12,
  NZD: 2.08, SEK: 13.4, NOK: 13.6, DKK: 8.7, PLN: 5.0, INR: 106, SGD: 1.71, AED: 4.66, ZAR: 23.5,
}

// ISO country (uppercase) → display currency. Defaults to GBP elsewhere.
const COUNTRY_CCY: Record<string, string> = {
  GB: 'GBP', US: 'USD', JP: 'JPY', CA: 'CAD', AU: 'AUD', CH: 'CHF', NZ: 'NZD',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', IN: 'INR', SG: 'SGD', AE: 'AED', ZA: 'ZAR',
  IE: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  PT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR',
  LT: 'EUR', CY: 'EUR', MT: 'EUR', HR: 'EUR',
}

export function currencyForCountry(country: string | null | undefined): string {
  const c = (country ?? '').toUpperCase()
  return COUNTRY_CCY[c] ?? 'GBP'
}

export function isSupportedCurrency(code: string | null | undefined): boolean {
  return !!code && code.toUpperCase() in CURRENCIES
}

// Convert an integer minor-unit amount from one currency to another.
export function convertMinor(amountMinor: number, from: string, to: string, rates: Record<string, number>): number {
  const f = rates[from.toUpperCase()] ?? 1
  const t = rates[to.toUpperCase()] ?? 1
  const fromZero = CURRENCIES[from.toUpperCase()]?.zeroDecimal
  const toInfo = CURRENCIES[to.toUpperCase()]
  const major = amountMinor / (fromZero ? 1 : 100)
  const gbp = major / f
  const targetMajor = gbp * t
  return Math.round(targetMajor * (toInfo?.zeroDecimal ? 1 : 100))
}

// Format an integer minor-unit amount in a currency (e.g. 5000 GBP → "£50.00").
// `whole` drops decimals (for compact "from £50" style displays).
export function formatMinor(amountMinor: number, code: string, whole = false): string {
  const info = CURRENCIES[code.toUpperCase()] ?? CURRENCIES.GBP
  const major = amountMinor / (info.zeroDecimal ? 1 : 100)
  const digits = info.zeroDecimal || whole ? 0 : 2
  try {
    return new Intl.NumberFormat(info.locale, { style: 'currency', currency: info.code, maximumFractionDigits: digits, minimumFractionDigits: digits }).format(major)
  } catch {
    return `${info.symbol}${major.toFixed(digits)}`
  }
}
