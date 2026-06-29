import * as React from 'react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Full name — initials are derived when no `src` is given. */
  name?: string
  /** Photo URL. Falls back to initials when absent. */
  src?: string
  /** Pixel size of the square tile. Default 56. */
  size?: number
}

/** Rounded-square avatar tile with brand-tinted initials. */
export function Avatar(props: AvatarProps): React.JSX.Element
