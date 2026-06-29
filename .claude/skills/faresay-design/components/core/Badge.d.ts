import * as React from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'solid' | 'coral' | 'amber' | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  /** Colour role. coral = "Founding"; amber = ratings; brand = verified/feature. */
  tone?: BadgeTone
  /** Optional leading glyph (e.g. "★", "✓", emoji). */
  icon?: React.ReactNode
}

/**
 * Soft pill label — credentials, "Founding", ratings, status.
 *
 * @startingPoint section="Core" subtitle="Soft pill labels — tones & icons" viewport="700x120"
 */
export function Badge(props: BadgeProps): React.JSX.Element
