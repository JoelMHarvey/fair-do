import * as React from 'react'

export interface TherapistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  /** Registration body + verification, e.g. "BACP registered". */
  credential: string
  tagline?: string
  bio?: string
  photo?: string
  /** Pre-formatted price string, e.g. "£55". */
  price?: string
  priceCaption?: string
  rating?: number
  ratingCount?: number
  founding?: boolean
  bestMatch?: boolean
  specialisms?: string[]
  /** Pre-formatted next-available string, e.g. "Tomorrow 14:00". */
  nextAvailable?: string
  onBook?: React.MouseEventHandler
  onView?: React.MouseEventHandler
}

/**
 * Therapist listing card — the core marketplace object.
 *
 * @startingPoint section="Patterns" subtitle="Therapist directory listing card" viewport="700x320"
 */
export function TherapistCard(props: TherapistCardProps): React.JSX.Element
