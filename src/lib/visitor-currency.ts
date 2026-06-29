import { cookies, headers } from 'next/headers'
import { currencyForCountry, isSupportedCurrency } from '@/lib/currency'

// The visitor's display currency: a manual override cookie wins, else the
// Vercel-provided geo country, else GBP. Display-only — never affects charging.
export async function getVisitorCurrency(): Promise<string> {
  const override = (await cookies()).get('ccy')?.value
  if (isSupportedCurrency(override)) return override!.toUpperCase()
  const country = (await headers()).get('x-vercel-ip-country')
  return currencyForCountry(country)
}
