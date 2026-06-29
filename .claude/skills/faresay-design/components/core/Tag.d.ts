import * as React from 'react'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

/** Quiet sand-tinted chip for specialisms/approaches — meant to cluster. */
export function Tag(props: TagProps): React.JSX.Element
