---
name: faresay-design
description: Use this skill to generate well-branded interfaces and assets for Faresay (a calm, fair UK therapy platform), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Brand in one line:** calm, warm, fair. Evergreen-teal + warm-sand + coral, Fraunces serif headings over Inter, soft pills & rounded-3xl cards, gentle fades, plain-English copy.
- **Tokens:** link `styles.css`; build with `var(--accent)`, `var(--font-display)`, `var(--radius-xl)`, `var(--color-brand-900)` etc. — never raw hex.
- **Components:** load `_ds_bundle.js`, then `const { Button, Card, Badge, Avatar, Tag, Stat, Input, Logo, BreathingLotus, TherapistCard } = window.FaresayDesignSystem_e2ff75`.
- **Cards** are white, rounded-3xl, hairline sand border, quiet shadow. **Buttons** are pills. **Headings** use Fraunces at 600.
- **Voice:** sentence case (lowercase "faresay"), British English, fairness quantified (£, %, "up to 90%"). Emoji used sparingly for warmth.
- **Assets:** `assets/logo-mark.svg`, app icons, OG image.
- **Examples to copy from:** `ui_kits/marketing/` (homepage) and `ui_kits/app/` (client flow).

Honour `prefers-reduced-motion` and keep visible focus rings — accessibility is part of the calm.
