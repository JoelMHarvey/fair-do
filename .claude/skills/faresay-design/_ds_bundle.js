/* @ds-bundle: {"format":3,"namespace":"FaresayDesignSystem_e2ff75","components":[{"name":"BreathingLotus","sourcePath":"components/brand/BreathingLotus.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"TherapistCard","sourcePath":"components/patterns/TherapistCard.jsx"}],"sourceHashes":{"components/brand/BreathingLotus.jsx":"fe500c83d852","components/brand/Logo.jsx":"3bc4eeaf98a1","components/core/Avatar.jsx":"490579aa2769","components/core/Badge.jsx":"24a6872c7ee5","components/core/Button.jsx":"1789b62bf708","components/core/Card.jsx":"a6308add9ebf","components/core/Stat.jsx":"4fd953f7006c","components/core/Tag.jsx":"1dea1ef6eac2","components/core/tweaks-panel.jsx":"6591467622ed","components/forms/Input.jsx":"2904be45861f","components/patterns/TherapistCard.jsx":"aabb7de60050","social/social.js":"ed2501033279","ui_kits/app/AppData.jsx":"36d7cbc6bcc7","ui_kits/app/Screens.jsx":"51eb844fd640","ui_kits/marketing/Chrome.jsx":"29332354df9e","ui_kits/marketing/Pricing.jsx":"02cd00369cbd","ui_kits/marketing/Sections.jsx":"d9389022dbac","video/animations.jsx":"a8d2a696abaa","video/movie.jsx":"b975f55c19c2","video/parts.jsx":"1f183766f7e7","video/tweaks-panel.jsx":"6591467622ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FaresayDesignSystem_e2ff75 = window.FaresayDesignSystem_e2ff75 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/BreathingLotus.jsx
try { (() => {
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
`;
function BreathingLotus({
  size = 200,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fl-lotus-wrap",
    style: {
      '--fl-size': `${size}px`,
      ...style
    },
    role: "img",
    "aria-label": "A lotus that slowly closes and opens to guide calm breathing."
  }, /*#__PURE__*/React.createElement("style", null, CSS), /*#__PURE__*/React.createElement("svg", {
    className: "fl-lotus",
    viewBox: "0 0 200 200",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "flHalo",
    cx: "50%",
    cy: "55%",
    r: "55%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#7fc4b8",
    stopOpacity: "0.9"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#7fc4b8",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "flPetal",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#2f9183"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#217567"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "flPetalLight",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#57b3a4"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#2f9183"
  }))), /*#__PURE__*/React.createElement("circle", {
    className: "fl-halo",
    cx: "100",
    cy: "118",
    r: "78",
    fill: "url(#flHalo)"
  }), /*#__PURE__*/React.createElement("g", {
    fill: "url(#flPetal)"
  }, /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-o-n58",
    d: "M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-o-p58",
    d: "M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-o-n34",
    d: "M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-o-p34",
    d: "M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z"
  })), /*#__PURE__*/React.createElement("g", {
    fill: "url(#flPetalLight)"
  }, /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-m-n20",
    d: "M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-m-p20",
    d: "M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z"
  })), /*#__PURE__*/React.createElement("g", {
    fill: "#bfe6df"
  }, /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-i-n8",
    d: "M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-i-p8",
    d: "M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "fl-petal fl-i-z",
    d: "M100 150 C88 138 88 112 100 82 C112 112 112 138 100 150 Z"
  }))));
}
Object.assign(__ds_scope, { BreathingLotus });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BreathingLotus.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Faresay logo — teal disc with the calm "smile" mark + lowercase Fraunces
 * wordmark. Set `tone="light"` for use on dark (brand-900) surfaces.
 */
function Logo({
  tone = 'dark',
  size = 28,
  showWord = true,
  style,
  ...rest
}) {
  const light = tone === 'light';
  const disc = light ? '#ffffff' : '#217567';
  const stroke = light ? '#217567' : '#ffffff';
  const word = light ? '#ffffff' : 'var(--color-brand-900)';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 28 28",
    width: size,
    height: size,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "14",
    cy: "14",
    r: "14",
    fill: disc
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2",
    fill: "none",
    stroke: stroke,
    strokeWidth: "1.8",
    strokeLinecap: "round"
  })), showWord && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: `${Math.round(size * 0.72)}px`,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: word
    }
  }, "faresay"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Therapist / user avatar. Square-rounded (rounded-2xl) tile with brand-tinted
 * background and Fraunces initials, matching the product's therapist cards.
 * Pass `src` for a photo; otherwise initials from `name` are shown.
 */
function Avatar({
  name = '',
  src,
  size = 56,
  style,
  ...rest
}) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-brand-100)',
      color: 'var(--color-brand-700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: Math.round(size * 0.34),
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, initials));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Small pill label. Used for credential badges, "Founding", ratings, status.
 * Faresay badges are soft-tinted with a matching border — never loud.
 */
function Badge({
  children,
  tone = 'neutral',
  icon,
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      background: 'var(--surface-muted)',
      color: 'var(--text-muted)',
      borderColor: 'transparent'
    },
    brand: {
      background: 'var(--accent-soft)',
      color: 'var(--color-brand-700)',
      borderColor: 'var(--border-brand)'
    },
    solid: {
      background: 'var(--accent)',
      color: '#fff',
      borderColor: 'transparent'
    },
    coral: {
      background: 'var(--color-coral-50)',
      color: 'var(--color-coral-600)',
      borderColor: 'var(--color-coral-200)'
    },
    amber: {
      background: 'var(--color-amber-50)',
      color: 'var(--color-amber-700)',
      borderColor: 'var(--color-amber-200)'
    },
    outline: {
      background: 'var(--surface-card)',
      color: 'var(--text-muted)',
      borderColor: 'var(--border-default)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontFamily: 'var(--font-sans)',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1,
      padding: '5px 11px',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid',
      whiteSpace: 'nowrap',
      ...tones[tone],
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, icon), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Faresay primary action. Pill-shaped, calm, with a brand-tinted shadow on
 * the primary variant. Hovers lift gently (-1px) — never bounce.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  disabled = false,
  fullWidth = false,
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 18px',
      fontSize: '14px'
    },
    md: {
      padding: '12px 26px',
      fontSize: '15px'
    },
    lg: {
      padding: '16px 32px',
      fontSize: '16px'
    }
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) ease, color var(--dur-fast) ease, border-color var(--dur-fast) ease, transform var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-brand)',
      boxShadow: 'var(--shadow-cta)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--color-brand-800)',
      borderColor: 'var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-brand-700)',
      borderColor: 'var(--border-brand)'
    },
    inverse: {
      background: 'var(--surface-card)',
      color: 'var(--color-brand-900)'
    },
    coral: {
      background: 'var(--highlight)',
      color: 'var(--text-on-brand)'
    }
  };
  const hoverFor = {
    primary: (el, on) => {
      el.style.background = on ? 'var(--accent-hover)' : 'var(--accent)';
      el.style.transform = on ? 'translateY(-1px)' : 'none';
    },
    secondary: (el, on) => {
      el.style.borderColor = on ? 'var(--border-brand)' : 'var(--border-strong)';
      el.style.background = on ? 'var(--accent-soft)' : 'var(--surface-card)';
    },
    ghost: (el, on) => {
      el.style.background = on ? 'var(--accent-soft)' : 'transparent';
    },
    inverse: (el, on) => {
      el.style.background = on ? 'var(--color-brand-50)' : 'var(--surface-card)';
    },
    coral: (el, on) => {
      el.style.background = on ? 'var(--color-coral-600)' : 'var(--highlight)';
    }
  };
  const handlers = disabled ? {} : {
    onMouseEnter: e => hoverFor[variant]?.(e.currentTarget, true),
    onMouseLeave: e => hoverFor[variant]?.(e.currentTarget, false)
  };
  const props = {
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    ...handlers,
    ...rest
  };
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href
    }, props), children);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The Faresay surface. White, rounded-3xl (24px), 1px sand border, quiet shadow.
 * Set `interactive` for the hover-lift used on therapist/listing cards.
 */
function Card({
  children,
  interactive = false,
  padding = 'lg',
  as = 'div',
  style,
  ...rest
}) {
  const pads = {
    none: 0,
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px'
  };
  const El = as;
  const base = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-sm)',
    padding: pads[padding] ?? padding,
    transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease',
    display: 'block',
    ...style
  };
  const handlers = interactive ? {
    onMouseEnter: e => {
      e.currentTarget.style.borderColor = 'var(--border-brand)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = 'var(--border-default)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }
  } : {};
  return /*#__PURE__*/React.createElement(El, _extends({
    style: base
  }, handlers, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Headline stat tile — the "You pay £40–55", "Therapist keeps 90%" cards from
 * the homepage and dashboard. Big Fraunces value, small muted label + sub.
 */
function Stat({
  label,
  value,
  sub,
  accent = 'brand',
  align = 'center',
  style,
  ...rest
}) {
  const accents = {
    brand: 'var(--color-brand-600)',
    coral: 'var(--color-coral-500)',
    dark: 'var(--color-sand-900)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      padding: '24px 20px',
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '13px',
      color: 'var(--text-subtle)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '40px',
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      color: accents[accent] ?? accent
    }
  }, value), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '13px',
      color: 'var(--text-subtle)'
    }
  }, sub));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Specialism / approach chip — the small sand-tinted tags on therapist cards
 * ("Anxiety", "CBT", "EMDR"). Quieter than a Badge; meant to cluster.
 */
function Tag({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: '12px',
      color: 'var(--text-muted)',
      background: 'var(--surface-muted)',
      padding: '3px 10px',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text field with a calm label. White surface, sand border, brand focus ring.
 * Works for input or textarea (`multiline`). Supports a small hint line.
 */
function Input({
  label,
  hint,
  multiline = false,
  rows = 4,
  id,
  style,
  ...rest
}) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const field = {
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    color: 'var(--text-body)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    outline: 'none',
    transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : undefined,
    ...style
  };
  const focus = {
    onFocus: e => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-soft)';
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = 'var(--border-strong)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--text-strong)'
    }
  }, label), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    style: field
  }, focus, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    style: field
  }, focus, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-subtle)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/patterns/TherapistCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Therapist listing card — the core marketplace object. Composes Avatar, Badge,
 * Tag and Button. Mirrors the product's /therapists results row.
 */
function TherapistCard({
  name,
  credential,
  tagline,
  bio,
  photo,
  price,
  priceCaption = 'per session',
  rating,
  ratingCount,
  founding = false,
  bestMatch = false,
  specialisms = [],
  nextAvailable,
  onBook,
  onView,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      padding: '24px',
      transition: 'border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease',
      ...style
    },
    onMouseEnter: e => {
      e.currentTarget.style.borderColor = 'var(--border-brand)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = 'var(--border-default)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: photo,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: '18px',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, name), bestMatch && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "solid"
  }, "Best match"), rating != null && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "amber",
    icon: "\u2605"
  }, rating, ratingCount != null ? ` (${ratingCount})` : ''), founding && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "coral",
    icon: "\u2605"
  }, "Founding")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: '14px',
      color: 'var(--text-subtle)'
    }
  }, credential, tagline ? ` · ${tagline}` : ''), bio && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: '14px',
      color: 'var(--text-muted)',
      lineHeight: 1.5
    }
  }, bio), specialisms.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '12px'
    }
  }, specialisms.slice(0, 4).map(s => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: s
  }, s))), nextAvailable && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--color-brand-600)'
    }
  }, "\u23F1 Next: ", nextAvailable)), price && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, price), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '11px',
      color: 'var(--text-subtle)'
    }
  }, priceCaption))), (onBook || onView) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid var(--color-sand-100)'
    }
  }, onBook && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onBook,
    fullWidth: true
  }, "Book session"), onView && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onView,
    variant: "secondary"
  }, "View profile")));
}
Object.assign(__ds_scope, { TherapistCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/TherapistCard.jsx", error: String((e && e.message) || e) }); }

// social/social.js
try { (() => {
// Faresay social kit — injects the logo lockup and the lotus motif so each
// template stays tiny. Usage:
//   <span class="s-logo" data-logo="light" style="font-size:34px"></span>
//   <div data-lotus="full" style="width:320px"></div>   full | mark
// data-logo: "light" (white, for dark bg) | "dark" (teal, for light bg)

(function () {
  function logoSVG(light) {
    const disc = light ? '#ffffff' : '#217567';
    const stroke = light ? '#217567' : '#ffffff';
    return `<svg viewBox="0 0 28 28" width="1em" height="1em" style="width:1.05em;height:1.05em" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="${disc}"/>
      <path d="M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  function wordColor(light) {
    return light ? '#ffffff' : '#193e39';
  }

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
    </svg>`;
  }
  function render() {
    document.querySelectorAll('[data-logo]').forEach(el => {
      const light = el.getAttribute('data-logo') !== 'dark';
      const markOnly = el.hasAttribute('data-mark-only');
      el.classList.add('s-logo');
      el.innerHTML = logoSVG(light) + (markOnly ? '' : `<span class="s-word" style="color:${wordColor(light)}">faresay</span>`);
    });
    document.querySelectorAll('[data-lotus]').forEach(el => {
      el.innerHTML = lotusSVG();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);else render();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "social/social.js", error: String((e && e.message) || e) }); }

// ui_kits/app/AppData.jsx
try { (() => {
// Seed data for the Faresay app UI kit (fictional therapists, calm copy).
const THERAPISTS = [{
  id: 't1',
  name: 'Priya Patel',
  credential: '✓ BACP verified',
  tagline: 'Anxiety & burnout',
  bio: 'I help people untangle anxiety and rebuild a steadier, kinder pace of life. Warm, practical, and led by what matters to you.',
  price: '£55',
  intro: '£35',
  rating: 4.9,
  ratingCount: 28,
  founding: true,
  bestMatch: true,
  specialisms: ['Anxiety', 'CBT', 'Burnout', 'EMDR'],
  languages: ['English', 'Hindi'],
  nextAvailable: 'Tomorrow 14:00'
}, {
  id: 't2',
  name: 'Daniel Okafor',
  credential: 'UKCP registered',
  tagline: 'Relationships & identity',
  bio: 'A relational, person-centred space to make sense of who you are and how you connect. No judgement, no rush.',
  price: '£60',
  rating: 4.8,
  ratingCount: 19,
  founding: false,
  specialisms: ['Relationships', 'Identity', 'Person-centred'],
  languages: ['English'],
  nextAvailable: 'Thu 09:30'
}, {
  id: 't3',
  name: 'Sarah Mitchell',
  credential: '✓ BACP verified',
  tagline: 'Trauma & EMDR',
  bio: 'Specialist trauma work using EMDR and a steady, body-aware approach. We move at the pace your nervous system can hold.',
  price: '£65',
  rating: 5.0,
  ratingCount: 41,
  founding: true,
  specialisms: ['Trauma', 'EMDR', 'PTSD'],
  languages: ['English'],
  nextAvailable: 'Today 18:00'
}, {
  id: 't4',
  name: 'James Lin',
  credential: 'BPS registered',
  tagline: 'Low mood & self-esteem',
  bio: 'Gentle CBT and compassion-focused work for low mood and the inner critic. Small, doable steps toward feeling more like yourself.',
  price: '£48',
  rating: 4.7,
  ratingCount: 12,
  founding: false,
  specialisms: ['Depression', 'Self-esteem', 'CBT'],
  languages: ['English', 'Mandarin'],
  nextAvailable: 'Fri 11:00'
}];
const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '18:00'];
const DAYS = [{
  d: 'Tue',
  n: '24'
}, {
  d: 'Wed',
  n: '25'
}, {
  d: 'Thu',
  n: '26'
}, {
  d: 'Fri',
  n: '27'
}, {
  d: 'Mon',
  n: '30'
}];
Object.assign(window, {
  FARESAY_THERAPISTS: THERAPISTS,
  FARESAY_SLOTS: SLOTS,
  FARESAY_DAYS: DAYS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppData.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Faresay app screens — client dashboard, therapist directory, booking flow.
// Recreates /dashboard, /therapists and /book/[id] using the DS components.
const {
  Logo,
  Button,
  Card,
  Badge,
  Tag,
  Avatar,
  Stat,
  TherapistCard
} = window.FaresayDesignSystem_e2ff75;
function AppNav({
  view,
  go
}) {
  const link = (v, label) => /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(v);
    },
    style: {
      fontSize: 14,
      textDecoration: 'none',
      fontWeight: view === v ? 600 : 400,
      color: view === v ? 'var(--color-brand-700)' : 'var(--text-muted)'
    }
  }, label);
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      borderBottom: '1px solid var(--border-default)',
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 960,
      margin: '0 auto',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, link('dashboard', 'Dashboard'), link('directory', 'Find a therapist'), /*#__PURE__*/React.createElement(Avatar, {
    name: "Alex Rivera",
    size: 32
  }))));
}
function Dashboard({
  go,
  sessions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 768,
      margin: '0 auto',
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      marginBottom: 4
    }
  }, "Welcome back, Alex"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-subtle)',
      fontSize: 14,
      marginTop: 0,
      marginBottom: 32
    }
  }, "Your therapy dashboard"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Upcoming sessions",
    value: String(sessions.length),
    accent: "dark",
    align: "left"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "My therapists",
    value: sessions.length ? '1' : '0',
    accent: "dark",
    align: "left"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Credit balance",
    value: "\xA30.00",
    accent: "brand",
    align: "left"
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--color-sand-900)',
      margin: 0
    }
  }, "Upcoming sessions"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('directory');
    },
    style: {
      fontSize: 14,
      color: 'var(--color-brand-600)',
      textDecoration: 'none'
    }
  }, "+ Book new")), sessions.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    padding: "xl",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-subtle)',
      fontSize: 14,
      marginTop: 0,
      marginBottom: 12
    }
  }, "No sessions booked yet"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => go('directory')
  }, "Find a therapist")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, sessions.map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: s.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--color-sand-900)'
    }
  }, s.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 14,
      color: 'var(--text-subtle)'
    }
  }, s.day, " 26 June \xB7 ", s.time))), /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Confirmed")))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      background: 'var(--color-brand-50)',
      borderColor: 'var(--border-brand)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "Refer a friend, you both get \xA310"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "Share faresay.com/r/ALEX10 \u2014 fair therapy spreads by word of mouth.")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Copy link"))));
}
function Directory({
  onBook
}) {
  const [sort, setSort] = React.useState('match');
  const therapists = window.FARESAY_THERAPISTS;
  const tab = (v, label) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setSort(v),
    style: {
      padding: '8px 18px',
      borderRadius: 9999,
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      border: sort === v ? '1px solid transparent' : '1px solid var(--border-default)',
      background: sort === v ? 'var(--accent)' : 'var(--surface-card)',
      color: sort === v ? '#fff' : 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      transition: 'all var(--dur-fast) ease'
    }
  }, label);
  const sorted = [...therapists].sort((a, b) => {
    if (sort === 'cheapest') return parseInt(a.price.slice(1)) - parseInt(b.price.slice(1));
    return 0;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: '0 auto',
      padding: '40px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      marginBottom: 8
    }
  }, "Your matches"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 0,
      marginBottom: 24
    }
  }, "Therapists suited to ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-brand-700)',
      fontWeight: 500
    }
  }, "anxiety, burnout")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, tab('match', 'Best match'), tab('cheapest', 'Cheapest'), tab('soonest', 'Soonest')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, sorted.map((t, i) => /*#__PURE__*/React.createElement(TherapistCard, _extends({
    key: t.id
  }, t, {
    bestMatch: sort === 'match' && i === 0,
    price: t.intro || t.price,
    priceCaption: t.intro ? 'first session' : 'per session',
    onBook: () => onBook(t),
    onView: () => onBook(t)
  })))));
}
function Booking({
  therapist,
  go,
  confirm
}) {
  const [day, setDay] = React.useState(2);
  const [slot, setSlot] = React.useState('14:00');
  const days = window.FARESAY_DAYS,
    slots = window.FARESAY_SLOTS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: '0 auto',
      padding: '40px 24px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('directory');
    },
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      textDecoration: 'none'
    }
  }, "\u2190 Back to matches"), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: therapist.name,
    size: 56
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, therapist.name), therapist.founding && /*#__PURE__*/React.createElement(Badge, {
    tone: "coral",
    icon: "\u2605"
  }, "Founding")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 14,
      color: 'var(--text-subtle)'
    }
  }, therapist.credential, " \xB7 ", therapist.tagline))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      lineHeight: 1.6,
      marginBottom: 0
    }
  }, therapist.bio), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 14
    }
  }, therapist.specialisms.map(s => /*#__PURE__*/React.createElement(Tag, {
    key: s
  }, s)))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      margin: '32px 0 16px'
    }
  }, "Choose a time"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-subtle)',
      margin: '0 0 12px'
    }
  }, "All times Europe/London \xB7 50-minute session"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setDay(i),
    style: {
      width: 64,
      padding: '10px 0',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      textAlign: 'center',
      border: day === i ? '1px solid var(--accent)' : '1px solid var(--border-default)',
      background: day === i ? 'var(--color-brand-50)' : 'var(--surface-card)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)'
    }
  }, d.d), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: day === i ? 'var(--color-brand-700)' : 'var(--text-body)'
    }
  }, d.n)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10,
      marginBottom: 28
    }
  }, slots.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSlot(s),
    style: {
      padding: '12px 0',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      border: slot === s ? '1px solid var(--accent)' : '1px solid var(--border-default)',
      background: slot === s ? 'var(--accent)' : 'var(--surface-card)',
      color: slot === s ? '#fff' : 'var(--text-body)'
    }
  }, s))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, therapist.intro ? 'First session (intro rate)' : 'Session fee'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, therapist.intro || therapist.price)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      margin: '0 0 16px'
    }
  }, days[day].d, " ", days[day].n, " June \xB7 ", slot, " \xB7 Cancel free up to 24h before"), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    onClick: () => confirm({
      name: therapist.name,
      day: days[day].d,
      time: slot
    })
  }, "Confirm & pay ", therapist.intro || therapist.price)));
}
function Confirmation({
  session,
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 520,
      margin: '0 auto',
      padding: '80px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'var(--color-brand-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      fontSize: 32
    }
  }, "\uD83C\uDF3F"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 32,
      marginBottom: 12
    }
  }, "You're booked in"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 16,
      marginTop: 0,
      marginBottom: 28,
      lineHeight: 1.6
    }
  }, "Your session with ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-body)'
    }
  }, session.name), " is confirmed for ", session.day, " 26 June at ", session.time, ". We've emailed you a calendar invite and a secure video link."), /*#__PURE__*/React.createElement(Button, {
    onClick: () => go('dashboard')
  }, "Go to dashboard"));
}
Object.assign(window, {
  AppNav,
  Dashboard,
  Directory,
  Booking,
  Confirmation
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Chrome.jsx
try { (() => {
// Faresay marketing chrome — sticky nav + footer. Recreates SiteNav/SiteFooter.
const {
  Logo,
  Button
} = window.FaresayDesignSystem_e2ff75;
function Nav({
  links = ['Features', 'Pricing', 'Find a therapist']
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(232,225,213,0.7)',
      background: 'rgba(250,248,245,0.8)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1152,
      margin: '0 auto',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("div", {
    className: "nav-center",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      textDecoration: 'none',
      color: 'inherit'
    },
    onClick: e => e.preventDefault()
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-muted)',
      textDecoration: 'none'
    }
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Start free"))));
}
function Footer() {
  const cols = [{
    h: 'Clients',
    items: ['Find a therapist', 'Therapy styles', 'AI therapy?', 'Blog', 'How it works', 'Gift a session', 'FAQ']
  }, {
    h: 'Therapists',
    items: ['Join Faresay', 'Why Faresay', 'For business']
  }, {
    h: 'Company',
    items: ['About', 'Urgent help', 'Privacy', 'Terms', 'Complaints']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--border-default)',
      background: 'rgba(243,239,232,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1152,
      margin: '0 auto',
      padding: '48px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      marginTop: 12,
      maxWidth: 260,
      lineHeight: 1.6
    }
  }, "The simple, private way for therapists to run their practice \u2014 your clients, scheduling, secure video and payments in one place.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--color-sand-900)',
      marginBottom: 12
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, c.items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      textDecoration: 'none'
    }
  }, i))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-default)',
      marginTop: 40,
      paddingTop: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      margin: 0
    }
  }, "\xA9 ", new Date().getFullYear(), " Faresay Ltd \xB7 Company No. 17302034 (England & Wales)"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      textDecoration: 'none'
    }
  }, "In emergency call 999 \u2014 urgent help \u2192"))));
}
Object.assign(window, {
  Nav,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Pricing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Faresay pricing page — faithful recreation of /pricing (pricing/page.tsx).
// Subscription model: Starter free · Practice £29/mo · Clinic coming soon.
const {
  Button,
  Card,
  Badge
} = window.FaresayDesignSystem_e2ff75;
const TIERS = [{
  name: 'Starter',
  price: 'Free',
  cadence: '',
  tagline: 'Everything to run your practice.',
  features: ['Unlimited clients', 'Scheduling + secure video', 'Card payments & payouts', 'Reminders & messaging', 'Runs on your phone'],
  note: 'A small commission (2.5%) applies on card payments + stripe transaction fee',
  cta: 'Start free',
  highlight: false
}, {
  name: 'Practice',
  price: '£29',
  cadence: '/month',
  tagline: 'For an established solo practice.',
  features: ['Everything in Starter', 'Lower payment commission', 'Per-client pricing & packages', 'Priority support', 'Your booking page'],
  note: '1% commission + stripe transaction fee',
  cta: 'Start free',
  highlight: true
}, {
  name: 'Clinic',
  price: 'Coming soon',
  cadence: '',
  tagline: 'For group practices & clinics.',
  features: ['Multiple therapists, one clinic', 'Shared team calendar', 'Clinic admin & reporting'],
  note: 'In development — register your interest and we\u2019ll keep you posted.',
  cta: 'Register interest',
  highlight: false
}];
const FAQ = [{
  q: 'Do I have to pay to start?',
  a: 'No. Starter is free — run your whole practice on it. You only pay if you choose a plan with lower commission and extra tools.'
}, {
  q: 'What\u2019s the commission?',
  a: 'A small percentage on card payments your clients make, which covers payment processing and the platform. Paid plans reduce it. (Founding rates are lower still.)'
}, {
  q: 'Can I cancel any time?',
  a: 'Yes. No lock-in. If you cancel a paid plan it simply runs to the end of the period, then drops to Starter — your clients and records stay with you.'
}, {
  q: 'Are my clients mine?',
  a: 'Always. You own the relationship and the records. Faresay is your tool, never a middleman.'
}];
function Faq({
  q,
  a
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '16px 20px',
      background: open ? 'rgba(250,248,245,0.6)' : 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--color-sand-800)',
      textAlign: 'left'
    }
  }, q, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      color: 'var(--color-brand-600)',
      fontSize: 18,
      transition: 'transform var(--dur-fast) ease',
      transform: open ? 'rotate(45deg)' : 'none'
    },
    "aria-hidden": "true"
  }, "+")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 20px',
      fontSize: 14,
      color: 'var(--text-body)',
      lineHeight: 1.7
    }
  }, a));
}
function Pricing() {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: 'linear-gradient(to bottom, var(--color-brand-50), var(--color-sand-50) 50%, var(--color-sand-50))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1024,
      margin: '0 auto',
      padding: '80px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 560,
      margin: '0 auto 16px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 48,
      marginBottom: 0
    }
  }, "Simple, fair pricing"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-body)',
      marginTop: 16
    }
  }, "Start free and pay as you grow. No lock-in, no surprises \u2014 and we grow only when you do.")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "coral"
  }, "\uD83D\uDE80 Founding pricing \u2014 locked for early therapists")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20,
      alignItems: 'start'
    }
  }, TIERS.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.name,
    style: {
      borderRadius: 'var(--radius-xl)',
      padding: 28,
      background: 'var(--surface-card)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-sm)',
      border: t.highlight ? '1px solid var(--color-brand-400)' : '1px solid var(--border-default)',
      outline: t.highlight ? '1px solid var(--border-brand)' : 'none'
    }
  }, t.highlight && /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--color-brand-700)',
      background: 'var(--color-brand-50)',
      padding: '4px 10px',
      borderRadius: 9999,
      marginBottom: 12
    }
  }, "Most popular"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      marginBottom: 4
    }
  }, t.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      margin: '0 0 16px'
    }
  }, t.tagline), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, t.price), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, t.cadence)), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1
    }
  }, t.features.map(f => /*#__PURE__*/React.createElement("li", {
    key: f,
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 14,
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-brand-600)'
    },
    "aria-hidden": "true"
  }, "\u2713"), f))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      margin: '0 0 20px'
    }
  }, t.note), /*#__PURE__*/React.createElement(Button, {
    variant: t.highlight ? 'primary' : 'secondary',
    fullWidth: true
  }, t.cta)))), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 12,
      color: 'var(--text-subtle)',
      marginTop: 24
    }
  }, "Prices shown are launch pricing and may change. Founding therapists keep their rate."), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: '64px auto 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 24
    }
  }, "Questions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, FAQ.map(f => /*#__PURE__*/React.createElement(Faq, _extends({
    key: f.q
  }, f))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg"
  }, "Start free \u2192"))));
}
Object.assign(window, {
  Pricing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Pricing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Sections.jsx
try { (() => {
// Faresay practice-portal homepage sections — faithful recreation of the CURRENT
// homepage (TherapistHome.tsx). Therapist-first: subscription tool, not a fee.
const {
  Button,
  Card,
  BreathingLotus
} = window.FaresayDesignSystem_e2ff75;
const BENEFITS = [{
  icon: '🤝',
  title: 'Your clients stay yours',
  body: 'You own the relationship and the record. Faresay is your tool — never a middleman between you and the people you help.'
}, {
  icon: '🪶',
  title: 'Genuinely simple',
  body: 'Set up in about 15 minutes — no tech skills needed. Import your client list, book a session, done. Plain-English help on every page.'
}, {
  icon: '🔒',
  title: 'Private by design',
  body: 'Encrypted, with UK/EU data residency and appropriate safeguards. You stay the data controller — in control of your clients\u2019 information.'
}, {
  icon: '💷',
  title: 'Set your own prices',
  body: 'Your rate, your hours, even a different price per client. You keep what you charge — Faresay is a simple monthly subscription, not a cut of every session.'
}, {
  icon: '⚡',
  title: 'Get paid automatically',
  body: 'Clients pay by card; the money lands in your bank about two business days after each session. No chasing, no spreadsheets.'
}, {
  icon: '📱',
  title: 'Runs from your phone',
  body: 'Add Faresay to your home screen and run your whole practice from a phone — no computer required.'
}];
const STEPS = [{
  n: 1,
  title: 'Add your clients',
  body: 'Invite them by email or import your whole list — set up in minutes.'
}, {
  n: 2,
  title: 'Book sessions',
  body: 'Pick a time — we create a private video room and email your client automatically.'
}, {
  n: 3,
  title: 'Get paid',
  body: 'Connect payments once; the money arrives in your bank after each session.'
}];
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      background: 'linear-gradient(to bottom, var(--color-brand-50), var(--color-sand-50) 55%, var(--color-sand-50))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -96,
      right: -96,
      zIndex: -1,
      height: 384,
      width: 384,
      borderRadius: '50%',
      background: 'rgba(215,240,232,0.5)',
      filter: 'blur(60px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 160,
      left: -96,
      zIndex: -1,
      height: 320,
      width: 320,
      borderRadius: '50%',
      background: 'rgba(253,228,217,0.4)',
      filter: 'blur(60px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 768,
      margin: '0 auto',
      padding: '64px 32px 64px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(BreathingLotus, {
    size: 200,
    style: {
      marginBottom: 24
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: 9999,
      border: '1px solid var(--border-brand)',
      background: 'rgba(255,255,255,0.6)',
      padding: '6px 16px',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--color-brand-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      height: 6,
      width: 6,
      borderRadius: '50%',
      background: 'var(--color-brand-500)'
    }
  }), "The calm practice tool for therapists"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 60,
      lineHeight: 1.05,
      marginTop: 24,
      marginBottom: 0
    }
  }, "Your whole practice,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-brand-600)'
    }
  }, "in one calm place.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 20,
      color: 'var(--text-body)',
      marginTop: 24,
      maxWidth: 560,
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.6
    }
  }, "Faresay brings your clients, scheduling, secure video and payments together \u2014 simple enough to run from your phone, private enough for the work you do."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 36,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg"
  }, "Start free"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "ghost"
  }, "See how it works")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-subtle)',
      marginTop: 16
    }
  }, "Free to start \xB7 set up in ~15 minutes \xB7 keep your own clients")));
}
function EthosBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-brand-900)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 768,
      margin: '0 auto',
      padding: '64px 32px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-brand-200)',
      fontSize: 14,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 12
    }
  }, "Made by people with heart"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      fontWeight: 500,
      lineHeight: 1.3,
      margin: 0,
      color: '#fff'
    }
  }, "We think therapists deserve better tools \u2014 and fairer terms. Faresay grows when you grow. No lock-in, no games, and no company profiting from human suffering.")));
}
function Benefits() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1024,
      margin: '0 auto',
      padding: '80px 32px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 30,
      textAlign: 'center',
      marginBottom: 12
    }
  }, "Everything your practice needs"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      textAlign: 'center',
      maxWidth: 560,
      margin: '0 auto 48px'
    }
  }, "No more juggling a calendar, a payment app, a video tool and a spreadsheet. It's all here \u2014 and it's built to stay out of your way."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, BENEFITS.map(b => /*#__PURE__*/React.createElement(Card, {
    key: b.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      marginBottom: 12
    },
    "aria-hidden": "true"
  }, b.icon), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      marginBottom: 6
    }
  }, b.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      lineHeight: 1.6,
      margin: 0
    }
  }, b.body)))));
}
function HowItWorks() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'rgba(243,239,232,0.6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 896,
      margin: '0 auto',
      padding: '80px 32px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 30,
      textAlign: 'center',
      marginBottom: 48
    }
  }, "Up and running this week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    }
  }, STEPS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: 'var(--color-brand-600)',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      marginBottom: 6
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      lineHeight: 1.6,
      margin: 0
    }
  }, s.body))))));
}
function PrivacyBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 896,
      margin: '0 auto',
      padding: '80px 32px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "xl",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      marginBottom: 12
    },
    "aria-hidden": "true"
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 24,
      marginBottom: 8
    }
  }, "Privacy you can stand behind"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      maxWidth: 620,
      margin: '0 auto',
      lineHeight: 1.7
    }
  }, "Your clients trust you with the most sensitive things. We treat their information the same way \u2014 encrypted, with UK/EU data residency, and never sold or shared. You remain the data controller, in control of your records, always.")));
}
function FinalCTA() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'linear-gradient(to bottom, var(--color-sand-50), var(--color-brand-50))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: '0 auto',
      padding: '80px 32px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, "Start your practice on Faresay"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-body)',
      marginBottom: 32
    }
  }, "Free to begin, fair as you grow. We'll set you up personally."), /*#__PURE__*/React.createElement(Button, {
    size: "lg"
  }, "Start free \u2192"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-subtle)',
      marginTop: 24
    }
  }, "Looking for a therapist instead? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: 'var(--color-brand-700)',
      textDecoration: 'underline'
    }
  }, "Find one here"), ".")));
}
Object.assign(window, {
  Hero,
  EthosBand,
  Benefits,
  HowItWorks,
  PrivacyBand,
  FinalCTA
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Sections.jsx", error: String((e && e.message) || e) }); }

// video/animations.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx — timeline engine. Exports (on window): Stage, Sprite,
//   TextSprite, ImageSprite, RectSprite, VideoSprite, PlaybackBar,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <Sprite start={0} end={3}>
//       <TextSprite text="Hello" x={100} y={300} size={72} color="#111" />
//     </Sprite>
//     <Sprite start={2} end={8}>
//       <ImageSprite src="hero.png" x={200} y={120} width={640} height={360} kenBurns />
//     </Sprite>
//   </Stage>
//
// Stage({width,height,duration,background,fps,loop,autoplay}) — auto-scales to
//   viewport; scrubber + play/pause + ←/→ seek + space + 0-reset; persists
//   playhead. The canvas is an <svg><foreignObject>, export-ready: Share →
//   Export → Video (or the PlaybackBar's download button) renders it to .mp4.
//   Screenshot tools DOM-rerender (not pixel-capture) and unwrap this wrapper
//   so captures should work — but if one comes back black, that's a capture
//   artifact, not a render bug; trust the live preview.
// Sprite({start,end,keepMounted}) — mounts children only while playhead is in
//   [start,end]. Children read {localTime, progress, duration} via useSprite().
// useTime() → seconds; useTimeline() → {time,duration,playing,setTime,setPlaying}.
// TextSprite({text,x,y,size,color,font,weight,align,entryDur,exitDur}) — fades/scales in+out.
// ImageSprite({src,x,y,width,height,fit,radius,kenBurns,placeholder}) — same, with optional ken-burns.
// RectSprite({x,y,width,height,color,radius}) — solid box with entry/exit.
// VideoSprite({src,start,end,speed,style}) — looped <video> clip synced to the
//   timeline; its audio is mixed into the exported video.
// Easing.{linear,easeIn/Out/InOut Quad/Cubic/Quart/Quint/Expo/Back, …}
// interpolate([t0,t1,…],[v0,v1,…],ease?) → (t)=>v  — piecewise tween.
// animate({from,to,start,end,ease}) → (t)=>v  — single tween.
//
// Build scenes by composing Sprites inside Stage. Absolutely-position elements.
//
// In a .dc.html project, put your scene in a sibling my-scene.jsx (reading
// {Stage, Sprite, useTime, Easing, …} from window is safe) and mount BOTH:
//   <x-import component-from-global-scope="MyScene"
//             from="./animations.jsx ./my-scene.jsx"></x-import>
// The two files in from= load in order, so my-scene.jsx can use the globals
// animations.jsx set.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: t => t,
  // Quad
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Cubic
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // Quart
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - --t * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // Expo
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },
  // Sine
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  // Back (overshoot)
  easeOutBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: t => {
    const c1 = 1.70158,
      c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  // Elastic
  easeOutElastic: t => {
    const c4 = 2 * Math.PI / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return t => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic
}) {
  return t => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({
  time: 0,
  duration: 10,
  playing: false
});
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({
  localTime: 0,
  progress: 0,
  duration: 0
});
const useSprite = () => React.useContext(SpriteContext);
function Sprite({
  start = 0,
  end = Infinity,
  children,
  keepMounted = false
}) {
  const {
    time
  } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value = {
    localTime,
    progress,
    duration,
    visible
  };
  return /*#__PURE__*/React.createElement(SpriteContext.Provider, {
    value: value
  }, typeof children === 'function' ? children(value) : children);
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0,
  y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em'
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let ty = 0;
  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }
  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity'
    }
  }, text);
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null // {label: string} for striped placeholder
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }
  const content = placeholder ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, placeholder.label || 'image') : /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: fit,
      display: 'block'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity'
    }
  }, content);
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const {
    localTime,
    duration
  } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }
  const overrides = render ? render(spriteCtx) : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides
    }
  });
}

// ── Font inlining ───────────────────────────────────────────────────────────
// Copy every @font-face rule from the page into a <style> inside the svg's
// foreignObject, with font URLs rewritten to data: URLs. Makes the svg
// self-describing so serializing it alone (video export fast path) still
// renders with the right fonts. Sets data-om-fonts-inlined on the svg when
// done so the exporter can wait for it.

function useInlineFontsInto(svgRef) {
  React.useEffect(() => {
    const svg = svgRef.current;
    const host = svg && svg.querySelector('foreignObject > div');
    if (!svg || !host) return;
    let cancelled = false;
    (async () => {
      const rules = [];
      for (const ss of document.styleSheets) {
        let cssRules;
        try {
          cssRules = ss.cssRules;
        } catch {
          // Cross-origin sheet without crossorigin attr (e.g. the standard
          // fonts.googleapis.com <link>) — fetch the CSS text directly and
          // regex-extract the @font-face blocks.
          if (ss.href) {
            try {
              const txt = await fetch(ss.href).then(r => {
                if (!r.ok) throw 0;
                return r.text();
              });
              for (const ff of txt.match(/@font-face\s*{[^}]*}/g) || []) rules.push({
                css: ff,
                base: ss.href
              });
            } catch {}
          }
          continue;
        }
        if (!cssRules) continue;
        for (const r of cssRules) {
          if (r.type === CSSRule.FONT_FACE_RULE) {
            rules.push({
              css: r.cssText,
              base: ss.href || location.href
            });
          }
        }
      }
      const toDataURL = url => fetch(url).then(r => {
        if (!r.ok) throw 0;
        return r.blob();
      }).then(b => new Promise(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = () => res(url);
        fr.readAsDataURL(b);
      })).catch(() => url);
      const parts = await Promise.all(rules.map(async ({
        css,
        base
      }) => {
        const re = /url\((['"]?)([^'")]+)\1\)/g;
        let out = css,
          m;
        while (m = re.exec(css)) {
          const u = m[2];
          if (u.startsWith('data:')) continue;
          let abs;
          try {
            abs = new URL(u, base).href;
          } catch {
            continue;
          }
          out = out.split(m[0]).join(`url("${await toDataURL(abs)}")`);
        }
        return out;
      }));
      if (cancelled || !parts.length) {
        svg.setAttribute('data-om-fonts-inlined', 'true');
        return;
      }
      const style = document.createElement('style');
      style.textContent = parts.join('\n');
      host.insertBefore(style, host.firstChild);
      svg.setAttribute('data-om-fonts-inlined', 'true');
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children
}) {
  // Props arrive as strings when Stage is mounted via <x-import> (DC
  // projects) — coerce so style={{width}} gets a number React can px-ify.
  width = +width || 1280;
  height = +height || 720;
  duration = +duration || 10;
  fps = +fps || 60;
  if (typeof loop === 'string') loop = loop !== 'false';
  if (typeof autoplay === 'string') autoplay = autoplay !== 'false';
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch {
      return 0;
    }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try {
      localStorage.setItem(persistKey + ':t', String(time));
    } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = ts => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime(t => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;else {
            next = duration;
            setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  // Video-export protocol: the exporter dispatches this event per frame;
  // pause + sync the playhead so the capture sees exactly that timestamp.
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onSeek = e => {
      setPlaying(false);
      setTime(clamp(e.detail.time, 0, duration));
    };
    el.addEventListener('data-om-seek-to-time-frame', onSeek);
    return () => el.removeEventListener('data-om-seek-to-time-frame', onSeek);
  }, [duration]);

  // Inline @font-face rules into the svg's foreignObject so the svg is
  // self-describing — serializing it alone (for video export) then renders
  // with the right fonts. Sets data-om-fonts-inlined once done.
  useInlineFontsInto(canvasRef);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({
    time: displayTime,
    duration,
    playing,
    setTime,
    setPlaying
  }), [displayTime, duration, playing]);
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#0a0a0a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    ref: canvasRef,
    width: width,
    height: height,
    "data-om-exportable-video-with-duration-secs": duration,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      flexShrink: 0,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("foreignObject", {
    x: "0",
    y: "0",
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement("div", {
    xmlns: "http://www.w3.org/1999/xhtml",
    style: {
      width,
      height,
      background,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctxValue
  }, children))))), /*#__PURE__*/React.createElement(PlaybackBar, {
    time: displayTime,
    actualTime: time,
    duration: duration,
    playing: playing,
    onPlayPause: () => setPlaying(p => !p),
    onReset: () => {
      setTime(0);
    },
    onSeek: t => setTime(t),
    onHover: t => setHoverTime(t)
  }));
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({
  time,
  duration,
  playing,
  onPlayPause,
  onReset,
  onSeek,
  onHover
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback(e => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = e => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };
  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };
  const onTrackDown = e => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = e => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? time / duration * 100 : 0;
  const fmt = t => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor(total * 100 % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };
  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
  return /*#__PURE__*/React.createElement("div", {
    "data-omelette-chrome": true,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: onReset,
    title: "Return to start (0)"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2v10M12 2L5 7l7 5V2z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement(IconButton, {
    onClick: onPlayPause,
    title: "Play/pause (space)"
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2l9 5-9 5V2z",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'right',
      color: '#f6f4ef'
    }
  }, fmt(time)), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onMouseMove: onTrackMove,
    onMouseLeave: onTrackLeave,
    onMouseDown: onTrackDown,
    style: {
      flex: 1,
      height: 22,
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 4,
      background: 'rgba(255,255,255,0.12)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 4,
      background: 'oklch(72% 0.12 250)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${pct}%`,
      top: '50%',
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      background: '#fff',
      borderRadius: 6,
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'left',
      color: 'rgba(246,244,239,0.55)'
    }
  }, fmt(duration)), typeof VideoEncoder !== 'undefined' && /*#__PURE__*/React.createElement(IconButton, {
    title: "Export video",
    onClick: () => window.parent.postMessage({
      type: 'omelette:request-video-export'
    }, '*')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 2v7m0 0L4 6m3 3l3-3M2 12h10",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))));
}
function IconButton({
  children,
  onClick,
  title
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      color: '#f6f4ef',
      cursor: 'pointer',
      padding: 0,
      transition: 'background 120ms'
    }
  }, children);
}

// ── VideoSprite ─────────────────────────────────────────────────────────────
// Renders a <video> that loops within [start,end] of its source at `speed`,
// kept in sync with the Stage's playhead. Carries the
// data-om-exportable-video-play-* attrs so video export can mix its audio.
//
//   <VideoSprite src="clip.mp4" start={2} end={5} speed={1}
//     style={{ width: 640, height: 360 }} />

function VideoSprite({
  src,
  start = 0,
  end,
  speed = 1,
  style,
  ...rest
}) {
  start = +start || 0;
  speed = +speed || 1;
  if (end != null) end = +end || undefined;
  const t = useTime();
  const ref = React.useRef(null);
  const span = Math.max(0.001, (end ?? start + 1) - start);
  React.useEffect(() => {
    const v = ref.current;
    if (!v || v.readyState < 1) return;
    const target = start + t * speed % span;
    if (Math.abs(v.currentTime - target) > 0.05) v.currentTime = target;
  }, [t, start, span, speed]);
  return /*#__PURE__*/React.createElement("video", _extends({
    ref: ref,
    src: src,
    muted: true,
    playsInline: true,
    preload: "auto",
    "data-om-exportable-video-play-start": start,
    "data-om-exportable-video-play-end": end ?? start + span,
    "data-om-exportable-video-play-speed": speed,
    style: {
      display: 'block',
      objectFit: 'cover',
      ...style
    }
  }, rest));
}
Object.assign(window, {
  Easing,
  interpolate,
  animate,
  clamp,
  TimelineContext,
  useTime,
  useTimeline,
  Sprite,
  SpriteContext,
  useSprite,
  TextSprite,
  ImageSprite,
  RectSprite,
  VideoSprite,
  Stage,
  PlaybackBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "video/animations.jsx", error: String((e && e.message) || e) }); }

// video/movie.jsx
try { (() => {
// Faresay onboarding film — composes the scenes on the timeline.
const {
  Stage,
  Sprite,
  useSprite,
  Easing,
  interpolate,
  clamp
} = window;
const F = window.Faresay;
const {
  C,
  SERIF,
  SANS,
  typed,
  Logo,
  Lotus,
  Browser,
  Cursor,
  Stepper,
  Field,
  Btn,
  Screen,
  OptsCtx,
  useOpts,
  SX,
  SY,
  SW,
  SH
} = F;

// ── Target measurement ──────────────────────────────────────────────────────
// Each interactive box registers its element; the cursor (which lives INSIDE the
// same screen container) reads each target's centre via offsetLeft/Top walking —
// pure layout pixels, immune to the Stage's scale transform. No hand-tuned px.
function useTargets() {
  const innerRef = React.useRef(null);
  const store = React.useRef({});
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useLayoutEffect(() => {
    force();
  }, []);
  const reg = name => el => {
    if (el) store.current[name] = el;
  };
  return {
    innerRef,
    reg,
    store
  };
}

// Centre of `el` relative to `stop` (the screen inner container), in layout px.
function centerOf(el, stop) {
  let x = el.offsetWidth / 2,
    y = el.offsetHeight / 2,
    n = el;
  while (n && n !== stop) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return {
    x,
    y
  };
}

// Resolve keyframes [[t, target, press?]…] where target is a registered name
// or a literal [x, y] (screen-local). The cursor tip is nudged onto the centre.
const TIP_X = 3,
  TIP_Y = 2;
function resolveCursor(lt, kfs, store, innerRef) {
  const stop = innerRef.current;
  const pts = kfs.map(k => {
    let c;
    if (typeof k[1] === 'string') {
      const el = store.current[k[1]];
      c = el && stop ? centerOf(el, stop) : {
        x: SW / 2,
        y: SH / 2
      };
    } else c = {
      x: k[1][0],
      y: k[1][1]
    };
    return [k[0], c.x, c.y, k[2] || 0];
  });
  const ts = pts.map(p => p[0]);
  const x = interpolate(ts, pts.map(p => p[1]), Easing.easeInOutCubic)(lt) - TIP_X;
  const y = interpolate(ts, pts.map(p => p[2]), Easing.easeInOutCubic)(lt) - TIP_Y;
  const pressed = interpolate(ts, pts.map(p => p[3]))(lt) > 0.5;
  return {
    x,
    y,
    pressed
  };
}
const blink = lt => Math.floor(lt * 2) % 2 === 0;

// ── Caption (lower-third, calm) ──
function Caption({
  text
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const o = useOpts();
  if (!o.captions) return null;
  const op = clamp(Math.min(localTime / 0.4, (duration - localTime) / 0.4), 0, 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 38,
      display: 'flex',
      justifyContent: 'center',
      opacity: op
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 16,
      color: C.sand600,
      background: 'rgba(255,255,255,0.7)',
      padding: '8px 20px',
      borderRadius: 999,
      border: `1px solid ${C.sand200}`
    }
  }, text));
}

// ═══ SCENE A — Sign up (0–5) ═══
function SceneSignUp() {
  const {
    localTime: lt
  } = useSprite();
  const {
    reg,
    store,
    innerRef
  } = useTargets();
  const emailP = clamp((lt - 0.8) / 1.4, 0, 1);
  const focusEmail = lt > 0.55 && lt < 2.5;
  const cur = resolveCursor(lt, [[0, [760, 470]], [0.7, 'email'], [2.6, 'email'], [3.1, 'continue'], [3.35, 'continue', 1], [3.5, 'continue'], [5, 'continue']], store, innerRef);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, {
    innerRef: innerRef,
    bg: `linear-gradient(to bottom, ${C.brand50}, ${C.sand50} 60%)`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 250,
      top: 36,
      width: 440,
      padding: 40,
      boxSizing: 'border-box',
      background: C.white,
      borderRadius: 24,
      border: `1px solid ${C.sand200}`,
      boxShadow: '0 12px 28px rgba(46,41,32,0.08)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Lotus, {
    size: 92,
    bloom: 1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 30,
      fontWeight: 600,
      color: C.brand900,
      letterSpacing: '-0.02em',
      marginBottom: 6
    }
  }, "Create your practice"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 14.5,
      color: C.sand600,
      marginBottom: 26
    }
  }, "Free to start \xB7 set up in ~15 minutes"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Work email",
    value: typed('maya@chentherapy.co.uk', emailP),
    caret: focusEmail && blink(lt),
    focus: focusEmail,
    boxRef: reg('email')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Continue",
    w: "100%",
    boxRef: reg('continue'),
    press: cur.pressed && lt > 3.2 && lt < 3.6 ? 1 : 0
  }))), /*#__PURE__*/React.createElement(Cursor, cur)));
}

// ═══ SCENE B — Profile (5–11.5) ═══
const CHIPS = ['Anxiety', 'CBT', 'Trauma', 'Burnout', 'EMDR'];
function SceneProfile() {
  const {
    localTime: lt
  } = useSprite();
  const {
    reg,
    store,
    innerRef
  } = useTargets();
  const nameP = clamp((lt - 0.5) / 1.1, 0, 1);
  const showBacp = lt > 2.4;
  const rateP = clamp((lt - 2.7) / 0.7, 0, 1);
  const chipOn = i => i === 0 && lt > 3.9 || i === 1 && lt > 4.7;
  const cur = resolveCursor(lt, [[0, [720, 120]], [0.5, 'name'], [1.7, 'name'], [2.0, 'reg'], [2.2, 'reg', 1], [2.4, 'reg'], [2.7, 'rate'], [3.5, 'rate'], [3.9, 'chip0'], [4.0, 'chip0', 1], [4.1, 'chip0'], [4.7, 'chip1'], [4.8, 'chip1', 1], [4.9, 'chip1'], [5.7, 'continue'], [5.9, 'continue', 1], [6.1, 'continue'], [6.5, 'continue']], store, innerRef);
  const nameFocus = lt > 0.4 && lt < 1.8;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, {
    innerRef: innerRef
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 30
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 76
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    step: 1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 122,
      fontFamily: SERIF,
      fontSize: 26,
      fontWeight: 600,
      color: C.brand900,
      letterSpacing: '-0.02em',
      whiteSpace: 'nowrap'
    }
  }, "Tell us about your practice"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 170,
      top: 168,
      width: 640,
      padding: 34,
      boxSizing: 'border-box',
      background: C.white,
      borderRadius: 22,
      border: `1px solid ${C.sand200}`,
      boxShadow: '0 8px 22px rgba(46,41,32,0.06)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Full name",
    value: typed('Dr Maya Chen', nameP),
    caret: nameFocus && blink(lt),
    focus: nameFocus,
    boxRef: reg('name')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Registration body",
    value: showBacp ? 'BACP' : '',
    focus: lt > 1.9 && lt < 2.6,
    w: 272,
    boxRef: reg('reg')
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Session rate",
    value: rateP > 0 ? '£' + typed('55', rateP) : '',
    focus: lt > 2.6 && lt < 3.6,
    w: 272,
    boxRef: reg('rate')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 500,
      color: C.sand800,
      marginBottom: 9
    }
  }, "Specialisms"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      flexWrap: 'wrap'
    }
  }, CHIPS.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c,
    ref: i === 0 ? reg('chip0') : i === 1 ? reg('chip1') : undefined,
    style: {
      fontFamily: SANS,
      fontSize: 13.5,
      padding: '7px 15px',
      borderRadius: 999,
      border: `1px solid ${chipOn(i) ? C.brand400 : C.sand300}`,
      background: chipOn(i) ? C.brand50 : C.white,
      color: chipOn(i) ? C.brand700 : C.sand600,
      fontWeight: chipOn(i) ? 600 : 400
    }
  }, chipOn(i) ? '✓ ' : '', c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Continue",
    boxRef: reg('continue'),
    press: cur.pressed && lt > 5.8 && lt < 6.2 ? 1 : 0
  }))), /*#__PURE__*/React.createElement(Cursor, cur)));
}

// ═══ SCENE C — Availability (11.5–17) ═══
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
function SceneAvailability() {
  const {
    localTime: lt
  } = useSprite();
  const {
    reg,
    store,
    innerRef
  } = useTargets();
  // rows toggle on over time; cursor taps Tue + Thu
  const on = i => {
    const base = [true, false, true, false, true]; // Mon/Wed/Fri preset on
    if (i === 1 && lt > 1.6) return true;
    if (i === 3 && lt > 2.6) return true;
    return base[i] && lt > 0.4 + i * 0.12;
  };
  const cur = resolveCursor(lt, [[0, [740, 120]], [1.4, 'tue'], [1.55, 'tue', 1], [1.7, 'tue'], [2.4, 'thu'], [2.55, 'thu', 1], [2.7, 'thu'], [4.6, 'continue'], [4.8, 'continue', 1], [5.0, 'continue'], [5.5, 'continue']], store, innerRef);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, {
    innerRef: innerRef
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 30
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 76
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    step: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 122,
      fontFamily: SERIF,
      fontSize: 26,
      fontWeight: 600,
      color: C.brand900,
      letterSpacing: '-0.02em',
      whiteSpace: 'nowrap'
    }
  }, "When are you available?"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 158,
      fontFamily: SANS,
      fontSize: 14,
      color: C.sand600
    }
  }, "Toggle your days. Set hours per day \u2014 all times Europe/London."), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 170,
      top: 196,
      width: 640,
      background: C.white,
      borderRadius: 22,
      border: `1px solid ${C.sand200}`,
      boxShadow: '0 8px 22px rgba(46,41,32,0.06)',
      overflow: 'hidden'
    }
  }, DAYS.map((d, i) => {
    const active = on(i);
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 26px',
        borderTop: i ? `1px solid ${C.sand100}` : 'none',
        background: active ? C.brand50 + '88' : C.white
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: i === 1 ? reg('tue') : i === 3 ? reg('thu') : undefined,
      style: {
        width: 40,
        height: 23,
        borderRadius: 999,
        background: active ? C.brand600 : C.sand300,
        position: 'relative',
        transition: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 2.5,
        left: active ? 20 : 2.5,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: C.white,
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 500,
        color: active ? C.sand900 : C.sand400
      }
    }, d)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: SANS,
        fontSize: 14,
        color: active ? C.sand700 : C.sand400,
        whiteSpace: 'nowrap'
      }
    }, active ? '09:00 – 17:00' : 'Unavailable'));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 660,
      top: 486
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Continue",
    boxRef: reg('continue'),
    press: cur.pressed && lt > 4.7 && lt < 5.1 ? 1 : 0
  })), /*#__PURE__*/React.createElement(Cursor, cur)));
}

// ═══ SCENE D — Payments (17–22.5) ═══
function ScenePayments() {
  const {
    localTime: lt
  } = useSprite();
  const {
    reg,
    store,
    innerRef
  } = useTargets();
  const connecting = lt > 1.4 && lt < 2.8;
  const done = lt >= 2.8;
  const cur = resolveCursor(lt, [[0, [740, 130]], [1.05, 'connect'], [1.3, 'connect', 1], [1.5, 'connect'], [2.8, 'connect'], [4.4, 'continue'], [4.6, 'continue', 1], [4.8, 'continue'], [5.5, 'continue']], store, innerRef);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, {
    innerRef: innerRef
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 30
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 76
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    step: 3
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 122,
      fontFamily: SERIF,
      fontSize: 26,
      fontWeight: 600,
      color: C.brand900,
      letterSpacing: '-0.02em',
      whiteSpace: 'nowrap'
    }
  }, "Get paid automatically"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 230,
      top: 186,
      width: 520,
      padding: 34,
      boxSizing: 'border-box',
      background: C.white,
      borderRadius: 22,
      border: `1px solid ${C.sand200}`,
      boxShadow: '0 8px 22px rgba(46,41,32,0.06)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      marginBottom: 10
    }
  }, done ? '🌿' : '💷'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 21,
      fontWeight: 600,
      color: C.brand900,
      marginBottom: 6
    }
  }, done ? 'Payouts ready' : 'Connect payouts'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 14,
      color: C.sand600,
      lineHeight: 1.6,
      marginBottom: 22,
      maxWidth: 380,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }, done ? 'Money lands in your bank about two business days after each session. No chasing, no spreadsheets.' : 'Securely link your bank through Stripe. Your clients pay by card; you keep what you charge.'), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: SANS,
      fontSize: 14,
      fontWeight: 600,
      color: C.brand700,
      background: C.brand50,
      border: `1px solid ${C.brand200}`,
      padding: '9px 18px',
      borderRadius: 999
    }
  }, "\u2713 Bank account connected") : connecting ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: SANS,
      fontSize: 14,
      color: C.sand600,
      padding: '9px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: `2.5px solid ${C.sand200}`,
      borderTopColor: C.brand600,
      display: 'inline-block',
      transform: `rotate(${lt * 720}deg)`
    }
  }), " Connecting securely\u2026") : /*#__PURE__*/React.createElement(Btn, {
    label: "Connect with Stripe",
    boxRef: reg('connect'),
    press: cur.pressed && lt > 1.2 && lt < 1.6 ? 1 : 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 660,
      top: 460
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Continue",
    ghost: !done,
    boxRef: reg('continue'),
    press: cur.pressed && lt > 4.5 && lt < 4.9 ? 1 : 0
  })), /*#__PURE__*/React.createElement(Cursor, cur)));
}

// ═══ SCENE E — Done (22.5–28.5) ═══
function SceneDone() {
  const {
    localTime: lt
  } = useSprite();
  const bloom = clamp((lt - 0.2) / 1.2, 0, 1);
  const titleOp = clamp((lt - 0.9) / 0.6, 0, 1);
  const dashY = F.lerp(40, 0, clamp((lt - 1.8) / 0.8, 0, 1));
  const dashOp = clamp((lt - 1.8) / 0.8, 0, 1);
  return /*#__PURE__*/React.createElement(Screen, {
    bg: `linear-gradient(to bottom, ${C.sand50}, ${C.brand50})`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 40,
      top: 36
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    step: 5
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 86,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Lotus, {
    size: 110,
    bloom: bloom
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: titleOp,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 34,
      fontWeight: 600,
      color: C.brand900,
      letterSpacing: '-0.02em'
    }
  }, "You're all set, Maya"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 16,
      color: C.sand600,
      marginTop: 8
    }
  }, "Your practice is ready. Add your first client whenever you like."))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 200,
      right: 200,
      top: 320,
      opacity: dashOp,
      transform: `translateY(${dashY}px)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.white,
      borderRadius: 18,
      border: `1px solid ${C.sand200}`,
      boxShadow: '0 12px 28px rgba(46,41,32,0.10)',
      padding: 22,
      display: 'flex',
      gap: 14
    }
  }, [['Clients', '0'], ['This week', '£0'], ['Sessions', '0']].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '10px 0',
      background: C.sand50,
      borderRadius: 12,
      border: `1px solid ${C.sand200}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 12,
      color: C.sand500
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontSize: 28,
      fontWeight: 600,
      color: C.brand700
    }
  }, v))))));
}

// ═══ MOVIE ═══
function Movie({
  opts
}) {
  const o = {
    captions: true,
    pointer: true,
    pointerSize: 26,
    ripple: true,
    ...(opts || {})
  };
  return /*#__PURE__*/React.createElement(OptsCtx.Provider, {
    value: o
  }, /*#__PURE__*/React.createElement(Stage, {
    width: 1280,
    height: 720,
    duration: 28.5,
    background: C.sand100
  }, /*#__PURE__*/React.createElement(Browser, {
    url: "faresay.com/sign-up"
  }), /*#__PURE__*/React.createElement(Sprite, {
    start: 0,
    end: 5
  }, /*#__PURE__*/React.createElement(SceneSignUp, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 0,
    end: 5
  }, /*#__PURE__*/React.createElement(Caption, {
    text: "Maya starts her practice \u2014 one email to begin."
  })), /*#__PURE__*/React.createElement(Sprite, {
    start: 5,
    end: 11.5
  }, /*#__PURE__*/React.createElement(SceneProfile, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 5,
    end: 11.5
  }, /*#__PURE__*/React.createElement(Caption, {
    text: "Step 1 \u2014 her details, rate and specialisms."
  })), /*#__PURE__*/React.createElement(Sprite, {
    start: 11.5,
    end: 17
  }, /*#__PURE__*/React.createElement(SceneAvailability, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 11.5,
    end: 17
  }, /*#__PURE__*/React.createElement(Caption, {
    text: "Step 2 \u2014 the days she works."
  })), /*#__PURE__*/React.createElement(Sprite, {
    start: 17,
    end: 22.5
  }, /*#__PURE__*/React.createElement(ScenePayments, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 17,
    end: 22.5
  }, /*#__PURE__*/React.createElement(Caption, {
    text: "Step 3 \u2014 connect payouts, once."
  })), /*#__PURE__*/React.createElement(Sprite, {
    start: 22.5,
    end: 28.5
  }, /*#__PURE__*/React.createElement(SceneDone, null))));
}
window.Movie = Movie;
})(); } catch (e) { __ds_ns.__errors.push({ path: "video/movie.jsx", error: String((e && e.message) || e) }); }

// video/parts.jsx
try { (() => {
// Faresay onboarding film — "Maya sets up her practice".
// A calm, on-brand walkthrough of a therapist's first-time setup.
// Built on the animations.jsx timeline engine (globals on window).
const {
  Stage,
  Sprite,
  useTime,
  useSprite,
  Easing,
  interpolate,
  clamp
} = window;

// ── Brand tokens (literals so the film is self-contained & export-safe) ──
const C = {
  brand50: '#f0faf7',
  brand100: '#d7f0e8',
  brand200: '#b0e1d3',
  brand400: '#4fad99',
  brand500: '#2f9180',
  brand600: '#217567',
  brand700: '#1d5d53',
  brand900: '#193e39',
  sand50: '#faf8f5',
  sand100: '#f3efe8',
  sand200: '#e8e1d5',
  sand300: '#d6cab7',
  sand400: '#b8a78e',
  sand500: '#9c8870',
  sand600: '#80705c',
  sand800: '#4a4137',
  sand900: '#2e2920',
  coral500: '#e1542f',
  coral50: '#fef4f0',
  coral200: '#fac7b3',
  coral600: '#c93f1f',
  amber50: '#fffbeb',
  amber700: '#b45309',
  white: '#ffffff'
};
const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

// ── Small helpers ──
const lerp = (a, b, t) => a + (b - a) * t;
const typed = (full, p) => full.slice(0, Math.round(full.length * clamp(p, 0, 1)));

// ── Logo ──
function Logo({
  size = 26,
  tone = 'dark',
  word = true
}) {
  const light = tone === 'light';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 28 28",
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "14",
    cy: "14",
    r: "14",
    fill: light ? C.white : C.brand600
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 18c0-3 2-5 5-5s5 2 5 5M9.5 11.5c.8-1.2 2.3-2 4.5-2s3.7.8 4.5 2",
    fill: "none",
    stroke: light ? C.brand600 : C.white,
    strokeWidth: "1.8",
    strokeLinecap: "round"
  })), word && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: size * 0.74,
      letterSpacing: '-0.02em',
      color: light ? C.white : C.brand900
    }
  }, "faresay"));
}

// ── Lotus (static SVG; scale animated via timeline) ──
function Lotus({
  size = 120,
  bloom = 1
}) {
  const s = lerp(0.7, 1, clamp(bloom, 0, 1));
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 200 200",
    style: {
      transform: `scale(${s})`,
      transformOrigin: '50% 75%',
      filter: 'drop-shadow(0 14px 30px rgba(33,117,103,0.20))'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "flH",
    cx: "50%",
    cy: "55%",
    r: "55%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#7fc4b8",
    stopOpacity: "0.9"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#7fc4b8",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "flP",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#2f9183"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#217567"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "flL",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#57b3a4"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#2f9183"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "100",
    cy: "118",
    r: "78",
    fill: "url(#flH)",
    opacity: lerp(0.2, 0.55, clamp(bloom, 0, 1))
  }), /*#__PURE__*/React.createElement("g", {
    fill: "url(#flP)"
  }, [-58, 58, -34, 34].map((r, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: "M100 150 C76 132 70 86 100 40 C130 86 124 132 100 150 Z",
    style: {
      transformBox: 'fill-box',
      transformOrigin: '50% 100%',
      transform: `rotate(${r * lerp(1, 1, 1)}deg)`
    }
  }))), /*#__PURE__*/React.createElement("g", {
    fill: "url(#flL)"
  }, [-20, 20].map((r, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: "M100 150 C80 134 76 96 100 56 C124 96 120 134 100 150 Z",
    style: {
      transformBox: 'fill-box',
      transformOrigin: '50% 100%',
      transform: `rotate(${r}deg)`
    }
  }))), /*#__PURE__*/React.createElement("g", {
    fill: "#bfe6df"
  }, [-8, 8, 0].map((r, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: "M100 150 C86 138 84 108 100 74 C116 108 114 138 100 150 Z",
    style: {
      transformBox: 'fill-box',
      transformOrigin: '50% 100%',
      transform: `rotate(${r}deg)`
    }
  }))));
}

// ── Browser chrome (fixed frame for the whole film) ──
const BX = 150,
  BY = 64,
  BW = 980,
  BH = 588,
  BAR = 46;
const SX = BX,
  SY = BY + BAR,
  SW = BW,
  SH = BH - BAR;
function Browser({
  url
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: BX,
      top: BY,
      width: BW,
      height: BH,
      borderRadius: 18,
      background: C.white,
      boxShadow: '0 30px 70px rgba(46,41,32,0.20), 0 6px 16px rgba(46,41,32,0.08)',
      overflow: 'hidden',
      border: `1px solid ${C.sand200}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: BAR,
      background: C.sand100,
      borderBottom: `1px solid ${C.sand200}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: '#e9756b'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: '#f0c150'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: '#7bc47f'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.white,
      border: `1px solid ${C.sand200}`,
      borderRadius: 999,
      padding: '5px 18px',
      fontFamily: SANS,
      fontSize: 12.5,
      color: C.sand500,
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      minWidth: 280,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.brand500,
      fontSize: 11
    }
  }, "\uD83D\uDD12"), url)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52
    }
  })));
}

// ── Options context (driven by the Tweaks panel) ──
const OptsCtx = React.createContext({
  captions: true,
  pointer: true,
  pointerSize: 26,
  ripple: true
});
const useOpts = () => React.useContext(OptsCtx);

// ── Cursor — points its tip at (x, y). Honours the Tweaks panel. ──
function Cursor({
  x,
  y,
  pressed
}) {
  const o = useOpts();
  if (!o.pointer) return null;
  const sz = o.pointerSize || 26;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      zIndex: 50,
      pointerEvents: 'none'
    }
  }, o.ripple && pressed && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: sz * 0.18,
      top: sz * 0.10,
      width: sz * 1.5,
      height: sz * 1.5,
      marginLeft: -sz * 0.75,
      marginTop: -sz * 0.75,
      borderRadius: '50%',
      border: `2px solid ${C.brand500}`,
      opacity: 0.55,
      transform: 'scale(1.15)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${(pressed ? 0.82 : 1) * (sz / 26)})`,
      transformOrigin: 'top left',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 2 L4 19 L9 14.5 L12 21 L15 19.5 L12 13 L19 13 Z",
    fill: C.white,
    stroke: C.sand900,
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  }))));
}

// ── Reusable screen primitives ──
function Stepper({
  step
}) {
  const labels = ['Profile', 'Availability', 'Payments', 'Done'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 26
    }
  }, labels.map((l, i) => {
    const active = i + 1 === step,
      done = i + 1 < step;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: done ? C.brand600 : active ? C.brand600 : C.sand200,
        color: done || active ? C.white : C.sand500,
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, done ? '✓' : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? C.brand700 : done ? C.sand600 : C.sand400
      }
    }, l)), i < labels.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 2,
        background: done ? C.brand400 : C.sand200,
        borderRadius: 2
      }
    }));
  }));
}
function Field({
  label,
  value,
  caret,
  w = '100%',
  focus,
  boxRef
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 500,
      color: C.sand800,
      marginBottom: 7
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      height: 46,
      border: `1.5px solid ${focus ? C.brand600 : C.sand300}`,
      boxShadow: focus ? `0 0 0 3px ${C.brand50}` : 'none',
      borderRadius: 11,
      background: C.white,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      fontFamily: SANS,
      fontSize: 15,
      color: value ? C.sand900 : C.sand400
    }
  }, value || '', caret && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1.5,
      height: 20,
      background: C.brand600,
      marginLeft: 1
    }
  })));
}
function Btn({
  label,
  w,
  press = 0,
  ghost,
  boxRef
}) {
  return /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      padding: '0 26px',
      width: w,
      borderRadius: 999,
      fontFamily: SANS,
      fontSize: 15,
      fontWeight: 500,
      background: ghost ? C.white : C.brand600,
      color: ghost ? C.brand700 : C.white,
      border: ghost ? `1px solid ${C.sand300}` : '1px solid transparent',
      boxShadow: ghost ? 'none' : '0 10px 22px rgba(33,117,103,0.22)',
      transform: `scale(${1 - press * 0.05})`
    }
  }, label);
}

// ── Screen wrapper: fades content in/out within its Sprite window ──
function Screen({
  children,
  pad = 52,
  bg = C.sand50,
  outerRef,
  innerRef
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const op = clamp(Math.min(localTime / 0.45, (duration - localTime) / 0.4), 0, 1);
  return /*#__PURE__*/React.createElement("div", {
    ref: outerRef,
    style: {
      position: 'absolute',
      left: SX,
      top: SY,
      width: SW,
      height: SH,
      background: bg,
      opacity: op,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: innerRef,
    style: {
      position: 'absolute',
      inset: 0,
      padding: pad,
      boxSizing: 'border-box'
    }
  }, children));
}
window.Faresay = {
  C,
  SERIF,
  SANS,
  lerp,
  typed,
  Logo,
  Lotus,
  Browser,
  Cursor,
  Stepper,
  Field,
  Btn,
  Screen,
  OptsCtx,
  useOpts,
  BX,
  BY,
  BW,
  BH,
  BAR,
  SX,
  SY,
  SW,
  SH
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "video/parts.jsx", error: String((e && e.message) || e) }); }

// video/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "video/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BreathingLotus = __ds_scope.BreathingLotus;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.TherapistCard = __ds_scope.TherapistCard;

})();
