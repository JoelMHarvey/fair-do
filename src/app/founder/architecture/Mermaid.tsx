'use client'

import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

let initialized = false

function init() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    // Render at natural size (don't squeeze to the container) — wide diagrams scroll
    // horizontally instead of shrinking to an unreadable size.
    flowchart: { useMaxWidth: false, nodeSpacing: 55, rankSpacing: 60, padding: 12 },
    er: { useMaxWidth: false, entityPadding: 14 },
    themeVariables: {
      primaryColor: '#eef2ff',
      primaryBorderColor: '#c7d2fe',
      primaryTextColor: '#312e81',
      lineColor: '#c7b9a3',
      secondaryColor: '#fff',
      tertiaryColor: '#fbf8f3',
      fontSize: '17px',
    },
  })
  initialized = true
}

// Renders a Mermaid definition to inline SVG on the client. Founder-only internal
// page, so bundle size isn't a concern. Shows the raw source if a diagram fails to parse.
export function Mermaid({ chart, id }: { chart: string; id: string }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    init()
    let active = true
    mermaid
      .render(`mmd-${id}`, chart)
      .then(({ svg }) => { if (active) { setSvg(svg); setError(false) } })
      .catch((e) => { console.error('[mermaid]', id, e); if (active) setError(true) })
    return () => { active = false }
  }, [chart, id])

  if (error) {
    return <pre className="text-xs text-coral-600 bg-sand-50 rounded-lg p-3 overflow-x-auto">{chart}</pre>
  }
  // Natural-size SVG in a scroll container — readable, pan wide diagrams sideways.
  return <div className="overflow-x-auto -mx-1 [&_svg]:!max-w-none" dangerouslySetInnerHTML={{ __html: svg }} />
}
