// fair-do breathing lotus — calm hero centerpiece. Pure CSS (no JS); the
// animation + scoped .fl- styles live in globals.css. 4-7-8 breathing cycle,
// respects prefers-reduced-motion. Per-petal keyframes (no CSS var() inside
// @keyframes — that doesn't animate reliably on iOS Safari).
export function BreathingLotus({ className }: { className?: string }) {
  return (
    <div
      className={`fl-lotus-wrap ${className ?? ''}`}
      role="img"
      aria-label="An animated lotus flower that slowly closes and opens to guide calm breathing."
    >
      <svg className="fl-lotus" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="flHalo" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#7fc4b8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7fc4b8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flPetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f9183" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="flPetalLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57b3a4" />
            <stop offset="100%" stopColor="#2f9183" />
          </linearGradient>
        </defs>
        <circle className="fl-halo" cx="100" cy="118" r="78" fill="url(#flHalo)" />
        <g fill="url(#flPetal)">
          <path className="fl-petal fl-o-n58" d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" />
          <path className="fl-petal fl-o-p58" d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" />
          <path className="fl-petal fl-o-n34" d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" />
          <path className="fl-petal fl-o-p34" d="M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z" />
        </g>
        <g fill="url(#flPetalLight)">
          <path className="fl-petal fl-m-n20" d="M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z" />
          <path className="fl-petal fl-m-p20" d="M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z" />
        </g>
        <g fill="#bfe6df">
          <path className="fl-petal fl-i-n8" d="M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z" />
          <path className="fl-petal fl-i-p8" d="M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z" />
          <path className="fl-petal fl-i-z" d="M100 150 C88 138 88 112 100 82 C112 112 112 138 100 150 Z" />
        </g>
      </svg>
    </div>
  )
}
