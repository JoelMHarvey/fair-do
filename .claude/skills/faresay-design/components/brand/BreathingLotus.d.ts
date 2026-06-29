import * as React from 'react'

export interface BreathingLotusProps {
  /** Pixel width/height of the lotus. Default 200. */
  size?: number
  style?: React.CSSProperties
}

/** Animated breathing lotus — Faresay's calm hero centrepiece (pure CSS, reduced-motion aware). */
export function BreathingLotus(props: BreathingLotusProps): React.JSX.Element
