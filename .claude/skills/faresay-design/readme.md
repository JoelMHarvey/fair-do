> ⚠️ **MODEL NOTE (read first).** This system was reverse-engineered from an earlier build, so some copy
> examples below describe the **old marketplace model** ("15%", "therapists keep 85%", "up to 90%", "matched
> with clients"). Faresay's **current** model is **practice software the therapist subscribes to** — a fair
> subscription + a small card commission (2.5/1/0%), the **therapist owns their clients and records**, and it is
> **not a marketplace** and takes **no cut of sessions**. The *visual* system (colours, type, components, mark) is
> current and correct; reword any copy to the subscription/ownership model before publishing.

# Faresay Design System

> Therapy that's fair. A calm, warm design system for **Faresay** — the simple, private practice tool (and marketplace) for UK therapy.

Faresay is therapy, made fair. Built by technologists who couldn't stomach an industry where big platforms pocket up to 65% of every session fee, Faresay flips the model on its head: therapists keep 85%, clients pay less, and no company profits from human suffering in the middle. Every therapist is verified against BACP, UKCP, BPS or NCS, sessions run over encrypted video, and your data is never sold or used to sell ads. It's the rare platform that's genuinely on both sides — the client's and the therapist's — because fairer economics are the entire point, not a marketing angle.

For therapists, it's a chance to earn what they're worth: set your own rates and hours, get matched with clients who actually fit your specialisms, and be paid within two days while Faresay quietly handles the bookings, payments and admin. For clients, it's properly-vetted, genuinely affordable therapy from real, accredited professionals — because when sessions cost less, more people who need help can actually get it. Fair for the people who do the work. Fair for the people who need it. That's Faresay.

## Sources

This system was reverse-engineered from the product codebase:

- **GitHub:** [`JoelMHarvey/faresay`](https://github.com/JoelMHarvey/faresay) — Next.js 16 · TypeScript · Tailwind v4. The brand foundations come from `src/app/globals.css` (the Tailwind `@theme`), `layout.tsx` (fonts), and components under `src/components/` and `src/app/`.

Explore that repository directly to design with deeper fidelity — the matching algorithm, booking/payment flows, onboarding and dashboards all live there.

---

## Content fundamentals — how Faresay writes

The voice is **calm, plain-English, and warm** — a steady hand, never clinical and never salesy.

- **Person:** Speaks to **you** ("You deserve to feel better", "Your clients stay yours"). Warm and direct. Says **we** for the company, with heart ("We think therapists deserve better tools").
- **Tone:** Reassuring and unhurried. Short, confident sentences. Calming verbs ("untangle", "talk it through", "in one calm place"). Honest and anti-hype — it names the unfairness it's fixing ("no company profiting from human suffering").
- **Casing:** Sentence case everywhere — including the lowercase **"faresay"** wordmark. UPPERCASE only for small tracked eyebrows ("FOR CLIENTS", "FOR THERAPISTS").
- **Numbers:** British. £ prices, "50-minute session", "up to 90%", "15%". Fairness is always quantified.
- **British English:** "personalised", "specialisms", "programme", "Europe/London".
- **Trust & safety:** Credentials (BACP, UKCP, BPS, NCPS) are stated plainly. Crisis signposting (999 / Samaritans) is always one click away — calm, not alarmist.
- **Emoji:** Used **sparingly** as gentle, friendly iconography on feature cards and bands — 🤝 🪶 🔒 💷 ⚡ 📱 🌱 ✍️ 💬. Never decorative clutter. Unicode glyphs ★ ✓ ⏱ 🗣 mark ratings, verification, availability and languages.

Example copy, verbatim from the product:

> "Therapy that works. **Priced fairly.**" "Your whole practice, **in one calm place.**" "No subscription. No lock-in. Just therapy — at a price that's fair."

---

## Visual foundations

**Palette.** Three warm families, deliberately avoiding cold greys:

- **Brand** — a calming evergreen teal. `brand-600 (#217567)` is the primary action colour; `brand-900 (#193e39)` is the deep-green ink used for headings and full-bleed bands.
- **Sand** — warm neutrals that replace greys. `sand-50 (#faf8f5)` is the page; `sand-200` borders; `sand-800/900` text.
- **Coral** — a warm accent (`coral-500 #e1542f`) for highlights, "Founding" badges and the occasional emphasis.
- **Amber** — reserved strictly for star ratings.

**Type.** **Fraunces** (a warm, slightly characterful serif) for all display/headings and big numbers, almost always at 600 with tight `-0.02em` tracking. **Inter** for body, labels and UI. Headings carry the brand colour; body sits at sand-800 on the warm page.

**Shape & depth.** Soft and rounded. **Pill** buttons, chips and badges (`9999px`); **rounded-3xl (24px)** cards; 12–16px on inputs and small tiles. Borders are a hairline `sand-200`. Shadows are quiet and warm-tinted — `shadow-sm` at rest, deepening on hover; primary CTAs carry a brand-tinted glow (`0 12px 28px rgba(33,117,103,.20)`).

**Backgrounds.** No photography in chrome. Calm tools instead: soft top-down gradients (`brand-50 → sand-50`), large blurred colour blobs behind heroes (brand + coral, very low opacity), and full-bleed `brand-900` bands for rhythm breaks. The signature motif is the **breathing lotus** — a pure-CSS lotus whose petals slowly close and open on a 4-7-8 breathing cadence.

**Motion.** Gentle and calm — `fade-up` (16px rise) and `fade-in`, eased on `cubic-bezier(0.32, 0.72, 0, 1)`, staggered down lists. **No bounce, no spin.** Everything respects `prefers-reduced-motion` (anxious/vestibular-sensitive users see content, not movement).

**Hover & press.** Hovers are gentle: primary buttons darken (`brand-600 → 700`) and lift `-1px`; secondary/ghost warm their border to brand and tint their fill `brand-50`; cards warm their border and deepen their shadow. No aggressive scaling.

**Focus.** Always-visible keyboard focus — a 2px `brand-400` outline with 2px offset, only on `:focus-visible`. Accessibility is part of the calm.

**Layout.** Centred, generous, breathing. `max-w-6xl (1152px)` for marketing, `max-w-3xl (768px)` for text and app columns. Sections breathe at 80–112px vertical rhythm. Sticky, blurred translucent nav.

---

## Iconography

Faresay has **no icon font and almost no custom SVG icons**. Its iconographic vocabulary is, by design, minimal and warm:

- **Emoji as feature icons** — feature/benefit cards and bands use a small, consistent emoji set (🤝 🪶 🔒 💷 ⚡ 📱 🌱 ✍️ 💬). This is intentional brand voice, not placeholder.
- **Unicode glyphs as UI marks** — ★ (ratings/founding), ✓ (verified / feature ticks), ✗, ⏱ (next available), 🗣 (languages), + (expanders).
- **The logo mark** — a teal disc with a hand-drawn "smile" stroke (two gentle arcs). See `assets/logo-mark.svg`. The only bespoke brand glyph.
- **The breathing lotus** — the one elaborate SVG, used as a hero centrepiece, not an icon.

When you need UI icons the product doesn't supply (e.g. a calendar or chevron in a new screen), reach for a **thin-stroke, rounded line set** (Lucide is the closest CDN match — `stroke-width: 1.8`, round caps, matching the logo's stroke). Flag any such addition as a substitution. Keep emoji for warmth, line icons for function — don't mix a heavy filled icon set in.

Assets in `assets/`: `logo-mark.svg` (the disc smile), `icon-192/512.png` & `apple-touch-180.png` (app icons), `opengraph-image.png` (brand OG card).

---

## What's in here (index)

**Foundations** (`tokens/`, shown as cards in the Design System tab)

- `colors.css` — brand / sand / coral / amber scales + semantic aliases
- `typography.css` — Fraunces + Inter, type scale, weights, tracking
- `spacing.css` — spacing scale, radii, shadows, calm-motion tokens
- `fonts.css` — Inter + Fraunces (Google Fonts)
- `base.css` — element resets, motion helpers, focus, reduced-motion
- `styles.css` (root) — the single entry point consumers link

**Components** (`components/`)

- `core/` — `Button`, `Badge`, `Card`, `Avatar`, `Tag`, `Stat`
- `forms/` — `Input` (input + textarea)
- `brand/` — `Logo`, `BreathingLotus`
- `patterns/` — `TherapistCard` (the composed marketplace listing)

**UI kits** (`ui_kits/`)

- `marketing/` — the `faresay.com` homepage + pricing page, recreated
- `app/` — an interactive client flow (dashboard → find a therapist → book → confirm)

**Social media kit** (`social/`) — branded, export-ready post templates at native pixel sizes for LinkedIn, Instagram, Facebook, X and YouTube. Open `social/Social Media Kit.html` for the whole set on one canvas.

**Motion** (`video/`) — `Therapist Onboarding.html`, a ~28s on-brand film of a therapist's first-time setup (timeline-based, export-ready to MP4).

**Specimen cards** (`guidelines/`) — the colour, type, spacing and brand cards in the Design System tab.

`SKILL.md` — makes this folder usable as a downloadable Agent Skill.

---

## Using it

Consumers link the single stylesheet and read components off the global namespace:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script>
  const { Button, TherapistCard, Logo } = window.FaresayDesignSystem_e2ff75
</script>
```

Build with the tokens (`var(--accent)`, `var(--font-display)`, `var(--radius-xl)`) rather than raw hex, so everything stays on-brand and calm.
