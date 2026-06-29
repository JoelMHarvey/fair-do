import React from 'react'

/**
 * Faresay breathing lotus — the calm hero centerpiece. Pure-CSS petals that
 * slowly close and open on a 4-7-8 breathing cadence. Respects
 * prefers-reduced-motion (petals hold still). Injects its own scoped keyframes
 * once so it works standalone in any page.
 */
const CSS = `
.fl-lotus-wrap{width:var(--fl-size,200px);aspect-ratio:1/1;margin:0 auto;filter:drop-shadow(0 14px 30px rgba(33,117,103,.20))}
.fl-lotus{width:100%;height:100%;display:block;overflow:visible}
.fl-petal{transform-box:fill-box;transform-origin:50% 100%;will-change:transform;animation-duration:var(--fl-dur,20s);animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.fl-o-n58{animation-name:fl-o-n58}.fl-o-p58{animation-name:fl-o-p58}.fl-o-n34{animation-name:fl-o-n34}.fl-o-p34{animation-name:fl-o-p34}
.fl-m-n20{animation-name:fl-m-n20}.fl-m-p20{animation-name:fl-m-p20}.fl-i-n8{animation-name:fl-i-n8}.fl-i-p8{animation-name:fl-i-p8}.fl-i-z{animation-name:fl-i-z}
.fl-halo{transform-box:fill-box;transform-origin:center;will-change:transform,opacity;animation:fl-halo var(--fl-dur,20s) ease-in-out infinite}
@keyframes fl-o-n58{0%{transform:rotate(-58deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.66) scaleX(.9)}95%,100%{transform:rotate(-58deg) scaleY(1) scaleX(1)}}
@keyframes fl-o-p58{0%{transform:rotate(58deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.66) scaleX(.9)}95%,100%{transform:rotate(58deg) scaleY(1) scaleX(1)}}
@keyframes fl-o-n34{0%{transform:rotate(-34deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.66) scaleX(.9)}95%,100%{transform:rotate(-34deg) scaleY(1) scaleX(1)}}
@keyframes fl-o-p34{0%{transform:rotate(34deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.66) scaleX(.9)}95%,100%{transform:rotate(34deg) scaleY(1) scaleX(1)}}
@keyframes fl-m-n20{0%{transform:rotate(-20deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.72) scaleX(.9)}95%,100%{transform:rotate(-20deg) scaleY(1) scaleX(1)}}
@keyframes fl-m-p20{0%{transform:rotate(20deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.72) scaleX(.9)}95%,100%{transform:rotate(20deg) scaleY(1) scaleX(1)}}
@keyframes fl-i-n8{0%{transform:rotate(-8deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.82) scaleX(.94)}95%,100%{transform:rotate(-8deg) scaleY(1) scaleX(1)}}
@keyframes fl-i-p8{0%{transform:rotate(8deg) scaleY(1) scaleX(1)}20%,55%{transform:rotate(0) scaleY(.82) scaleX(.94)}95%,100%{transform:rotate(8deg) scaleY(1) scaleX(1)}}
@keyframes fl-i-z{0%{transform:scaleY(1) scaleX(1)}20%,55%{transform:scaleY(.82) scaleX(.94)}95%,100%{transform:scaleY(1) scaleX(1)}}
@keyframes fl-halo{0%{transform:scale(1);opacity:.55}20%,55%{transform:scale(.8);opacity:.3}95%,100%{transform:scale(1);opacity:.55}}
@media (prefers-reduced-motion:reduce){.fl-petal,.fl-halo{animation:none!important}}
`

export function BreathingLotus({ size = 200, style }) {
  return (
    <div className="fl-lotus-wrap" style={{ '--fl-size': `${size}px`, ...style }} role="img" aria-label="A lotus that slowly closes and opens to guide calm breathing.">
      <style>{CSS}</style>
      <svg className="fl-lotus" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="flHalo" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#7fc4b8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7fc4b8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flPetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f9183" />
            <stop offset="100%" stopColor="#217567" />
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
