import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  /** Adds the hover lift (border → brand, deeper shadow) used on listing cards. */
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string
  /** Element/tag to render as (e.g. 'a', 'section'). */
  as?: React.ElementType
}

/**
 * White rounded-3xl surface with a soft sand border — the base container.
 *
 * @startingPoint section="Core" subtitle="Rounded-3xl surface — static & interactive" viewport="700x180"
 */
export function Card(props: CardProps): React.JSX.Element
