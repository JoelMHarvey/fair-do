// fair-do hero mark — ascending "growth" bars topped by a spark. Pure CSS (no JS);
// the animation + scoped .hm- styles live in globals.css. Bars rise in a slow
// staggered wave (learning progress), the amber spark gently pulses. Respects
// prefers-reduced-motion (everything settles static).
export function HeroMark({ className }: { className?: string }) {
  // x positions for five evenly-spaced bars, increasing height left→right.
  const bars = [
    { x: 26, h: 46 },
    { x: 58, h: 68 },
    { x: 90, h: 92 },
    { x: 122, h: 116 },
    { x: 154, h: 140 },
  ]
  const baseY = 168
  return (
    <div
      className={`hm-wrap ${className ?? ''}`}
      role="img"
      aria-label="An animated chart of rising bars, representing steady learning progress."
    >
      <svg className="hm-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hmHalo" cx="50%" cy="58%" r="58%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hmBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        <circle className="hm-halo" cx="100" cy="120" r="82" fill="url(#hmHalo)" />

        <g fill="url(#hmBar)">
          {bars.map((b, i) => (
            <rect
              key={b.x}
              className={`hm-bar hm-b${i}`}
              x={b.x}
              y={baseY - b.h}
              width="20"
              height={b.h}
              rx="7"
            />
          ))}
        </g>

        {/* amber spark above the tallest bar (outer g holds position so the
            CSS animation transform on .hm-spark doesn't clobber it) */}
        <g transform="translate(164 22)">
          <g className="hm-spark">
            <path
              d="M0 -13 C1.6 -4 4 -1.6 13 0 C4 1.6 1.6 4 0 13 C-1.6 4 -4 1.6 -13 0 C-4 -1.6 -1.6 -4 0 -13 Z"
              fill="#f59e0b"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
