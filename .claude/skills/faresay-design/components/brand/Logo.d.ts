import * as React from 'react'

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 'dark' = teal mark + dark word (light bg); 'light' = white mark + word (dark bg). */
  tone?: 'dark' | 'light'
  /** Pixel size of the mark. Default 28. */
  size?: number
  /** Show the "faresay" wordmark. Default true. */
  showWord?: boolean
}

/** Faresay logo — teal disc smile mark + lowercase Fraunces wordmark. */
export function Logo(props: LogoProps): React.JSX.Element
