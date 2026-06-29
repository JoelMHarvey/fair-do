import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  /** Field label rendered above the control. */
  label?: string
  /** Small helper line below the field. */
  hint?: string
  /** Render a textarea instead of an input. */
  multiline?: boolean
  rows?: number
}

/**
 * Labelled text field with a calm brand focus ring.
 *
 * @startingPoint section="Forms" subtitle="Text field & textarea with focus ring" viewport="700x200"
 */
export function Input(props: InputProps): React.JSX.Element
