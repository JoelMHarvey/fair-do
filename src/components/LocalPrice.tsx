import { convertMinor, formatMinor } from '@/lib/currency'
import { getRates } from '@/lib/fx-rates'
import { getVisitorCurrency } from '@/lib/visitor-currency'

// Shows a price in its charge currency (authoritative) with an estimated
// conversion to the visitor's currency. Display-only: the actual charge is
// always in `base` (the therapist's settlement currency / Faresay's billing).
export async function LocalPrice({
  minor, base = 'GBP', whole = false, className, approxClassName = 'text-sand-400 font-normal',
}: {
  minor: number
  base?: string
  whole?: boolean
  className?: string
  approxClassName?: string
}) {
  const ccy = await getVisitorCurrency()
  const baseStr = formatMinor(minor, base, whole)
  if (ccy === base.toUpperCase()) return <span className={className}>{baseStr}</span>
  const rates = await getRates()
  const localStr = formatMinor(convertMinor(minor, base, ccy, rates), ccy, whole)
  return (
    <span className={className}>
      {baseStr} <span className={approxClassName}>≈ {localStr}</span>
    </span>
  )
}
