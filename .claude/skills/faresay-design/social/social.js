// Faresay social kit — injects the logo lockup and the lotus motif so each
// template stays tiny. Usage:
//   <span class="s-logo" data-logo="light" style="font-size:34px"></span>
//   <div data-lotus="full" style="width:320px"></div>   full | mark
// data-logo: "light" (white, for dark bg) | "dark" (teal, for light bg)

(function () {
  function logoSVG(light) {
    const disc = light ? '#ffffff' : '#217567'
    const stroke = light ? '#217567' : '#ffffff'
    return `<svg viewBox="0 0 28 28" width="1em" height="1em" style="width:1.05em;height:1.05em" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="${disc}"/>
      <path d="M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  }
  function wordColor(light) { return light ? '#ffffff' : '#193e39' }

  // Static, fully-open lotus (the breathing-lotus resting pose).
  function lotusSVG() {
    return `<svg class="s-lotus" viewBox="0 0 200 200" width="100%" height="100%" style="overflow:visible;filter:drop-shadow(0 18px 36px rgba(33,117,103,0.28))" aria-hidden="true">
      <defs>
        <radialGradient id="lwH" cx="50%" cy="55%" r="55%"><stop offset="0%" stop-color="#7fc4b8" stop-opacity="0.9"/><stop offset="100%" stop-color="#7fc4b8" stop-opacity="0"/></radialGradient>
        <linearGradient id="lwP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2f9183"/><stop offset="100%" stop-color="#217567"/></linearGradient>
        <linearGradient id="lwL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#57b3a4"/><stop offset="100%" stop-color="#2f9183"/></linearGradient>
      </defs>
      <circle cx="100" cy="118" r="80" fill="url(#lwH)"/>
      <g fill="url(#lwP)">
        <path d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" transform="rotate(-58 100 150)"/>
        <path d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" transform="rotate(58 100 150)"/>
        <path d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" transform="rotate(-34 100 150)"/>
        <path d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" transform="rotate(34 100 150)"/>
      </g>
      <g fill="url(#lwL)">
        <path d="M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z" transform="rotate(-20 100 150)"/>
        <path d="M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z" transform="rotate(20 100 150)"/>
      </g>
      <g fill="#bfe6df">
        <path d="M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z" transform="rotate(-8 100 150)"/>
        <path d="M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z" transform="rotate(8 100 150)"/>
        <path d="M100 150 C88 138 88 112 100 82 C112 112 112 138 100 150 Z"/>
      </g>
    </svg>`
  }

  function render() {
    document.querySelectorAll('[data-logo]').forEach(el => {
      const light = el.getAttribute('data-logo') !== 'dark'
      const markOnly = el.hasAttribute('data-mark-only')
      el.classList.add('s-logo')
      el.innerHTML = logoSVG(light) + (markOnly ? '' : `<span class="s-word" style="color:${wordColor(light)}">faresay</span>`)
    })
    document.querySelectorAll('[data-lotus]').forEach(el => { el.innerHTML = lotusSVG() })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render)
  else render()
})()
