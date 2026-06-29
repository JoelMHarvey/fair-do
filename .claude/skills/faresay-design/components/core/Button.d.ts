import * as React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'coral'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  /** Visual style. primary = brand CTA; secondary = white/outline; ghost = soft; inverse = white-on-dark; coral = warm accent. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Render as an anchor when set. */
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  onClick?: React.MouseEventHandler
}

/**
 * Pill-shaped action button. The primary CTA across Faresay.
 *
 * @startingPoint section="Core" subtitle="Pill button — primary, secondary, ghost, coral" viewport="700x140"
 */
export function Button(props: ButtonProps): React.JSX.Element
