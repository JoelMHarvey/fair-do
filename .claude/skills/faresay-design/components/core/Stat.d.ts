import * as React from 'react'

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small label above the value. */
  label: string
  /** Headline value (e.g. "£40–55", "up to 90%"). */
  value: React.ReactNode
  /** Optional caption below. */
  sub?: string
  /** Value colour. */
  accent?: 'brand' | 'coral' | 'dark'
  align?: 'left' | 'center'
}

/**
 * Headline stat tile with a big Fraunces value.
 *
 * @startingPoint section="Core" subtitle="Headline number tiles" viewport="700x180"
 */
export function Stat(props: StatProps): React.JSX.Element
