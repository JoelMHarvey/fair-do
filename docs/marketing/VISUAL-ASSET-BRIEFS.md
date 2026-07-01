# fair-do Visual Asset Brief

**Version 1.0 — Creative Director Brief**
**Prepared for: Design Team**
**Date: 1 July 2026**
**Platform: fair-do (UK online tutoring, subscription-only, 0% commission)**

---

## Brand Foundation

Before opening any design tool, internalise the brand personality: **warm without being soft**. fair-do is not a fintech challenger brand (no neon, no aggressive disruption language). It is not a children's educational platform (no primary colours, no rounded bubble fonts). It sits in the register of a trusted professional colleague — someone who speaks plainly about money, backs claims with numbers, and does not perform warmth, but genuinely has it.

**The visual equivalent:** natural light over a kitchen table, not a studio strobe. A well-worn hardback, not a leaflet. Confidence without gloss.

### Colour System

| Token | Hex | Use |
|---|---|---|
| Indigo — Primary | `#4f46e5` | CTAs, active states, logo mark, headline accent |
| Indigo — Dark | `#3730a3` | Hover states, deep backgrounds (reversed assets) |
| Indigo — Light | `#e0e7ff` | Tinted backgrounds, badge fills |
| Sand — Warm | `#faf7f2` | Primary background (never pure white) |
| Sand — Mid | `#f0ead8` | Card backgrounds, section dividers |
| Slate — Body | `#1e293b` | All body text |
| Slate — Muted | `#64748b` | Secondary text, captions |
| White — True | `#ffffff` | Reversed lockups only |
| Amber — Accent | `#f59e0b` | Sparingly — "Founding Member" badge, highlight callouts |

**What to avoid:** Pure black (`#000000`) — use Slate Dark instead. Saturated red or green (too clinical / too "alert"). Cool greys (feel corporate). Royal blue (feels like a bank).

### Typography

**Primary typeface: Inter** (Google Fonts, free)
- Weights in use: 400 (body), 500 (UI labels), 600 (subheads), 700 (headlines)
- Never use Italic except in quotations
- Tracking: slightly open (+0.01em) on caps and small labels

**Accent / display: Lora** (Google Fonts, free)
- Weights in use: 400, 600 (Semibold)
- Use for: pull quotes, brand moments, hero headlines where warmth is needed
- Never use for body copy or UI labels

**Hierarchy example:**
- Hero headline: Lora 600, 48–64px, Slate Dark or White
- Section headline: Inter 700, 28–36px
- Body: Inter 400, 16–18px, 1.6 line-height
- Label / badge: Inter 600, 11–13px, all-caps, +0.08em tracking

### Logo Mark Concept

The logo mark is a double-f ligature (ff) constructed from two offset rectangles or strokes — the second f slightly raised and indented into the first, suggesting both the word "fair" and the idea of fairness as balance. The mark should read equally well at 16px favicon size and at 300px. It is not a face, not a graduation cap, not a lightbulb. It is a typographic mark.

Alternatively (simpler, equally valid): a single lowercase "fd" ligature in Inter 700, with the crossbar of the f extending into and becoming the stem of the d — a single fluid stroke. The key constraint is that it reads as a proper mark at small sizes, not just initials.

---

## Priority 1 Assets

### 1. Logo — Primary Lockup, Reversed, Icon-Only

**Brief:**

The wordmark is set in **Inter 700** (or a slightly customised version with optical kerning tightened). The word "fair" is set in **Indigo `#4f46e5`** and "do" is set in **Slate Dark `#1e293b`** — or alternatively in Inter 700 with "fair" in Indigo and "-do" in the same weight but slightly reduced tracking, separated by an em-dash that is itself set in Indigo. The hyphen/dash between the two words should be considered a design element, not punctuation — it can be replaced by a short indigo rule at 2px height, optically centred on the cap-height.

The icon mark (the ff or fd ligature described above) sits to the **left** of the wordmark at approximately 80% of the cap-height. The gap between mark and wordmark is exactly one x-height.

**Three deliverables:**

**A — Primary (dark on sand):**
- Background: `#faf7f2` (warm sand)
- Mark: Indigo `#4f46e5`
- "fair": Indigo `#4f46e5`
- "do": Slate `#1e293b`
- Formats: SVG (master), PNG @2x, PNG @3x
- Minimum reproduction size: 120px wide

**B — Reversed (light on dark):**
- Background: Indigo `#4f46e5` or Slate `#1e293b`
- Mark: White `#ffffff`
- "fair": White `#ffffff`
- "do": White `#ffffff`
- Use case: dark email headers, dark social cards, press kit dark variant
- Same format deliverables

**C — Icon only (square mark):**
- Dimensions: delivered in SVG; also as 512×512 PNG, 256×256 PNG, 64×64 PNG, 32×32 PNG, 16×16 PNG (favicon)
- Content: the ff or fd ligature mark only, no wordmark
- On Indigo background: white mark
- On white/sand background: Indigo mark
- The mark must be legible at 16×16 — test this before signing off

**Mood:** The logo should feel like it belongs on a letter to a parent from a credible professional organisation — not a startup sticker, not a textbook cover. Think: the kind of logo you see on a well-run independent school's headed paper, made a little warmer and more contemporary.

---

### 2. Social Profile Images — All Platforms (1:1, 400×400)

**Dimensions:** 400×400px, delivered as PNG
**Safe zone:** Keep the mark centred within a 320×320px inner safe zone — platform UIs crop circles aggressively

**Content:**
- The icon-only mark (the ff or fd ligature) centred on an Indigo `#4f46e5` background
- No wordmark — the mark alone must carry the brand at this size
- Indigo background with white mark is the primary variant
- Alternate: White/sand background with Indigo mark (for platforms where indigo background reads as a generic "blue logo")

**Platform-specific delivery:**
- Instagram: 400×400 PNG (will display as circle — check safe zone)
- Twitter/X: 400×400 PNG (circle crop, 2px further crop than Instagram)
- LinkedIn: 400×400 PNG (circle on profile, square in some feed contexts)
- TikTok: 400×400 PNG (circle, always)
- Facebook Page: 400×400 PNG
- YouTube: 800×800 PNG (scale-up of same mark — do not just resize the 400px version; re-export at native size)

**Mood:** Consistent and immediately recognisable. When a tutor shares their profile link, the platform's icon in the preview should feel professional and calm — like a law firm or a good GP practice, not a games app.

---

### 3. OG Image / Link Preview (1200×630)

**Dimensions:** 1200×630px, PNG
**Note to designer:** The engineering team has already built this as a dynamically generated indigo card in code. Your job is to define the static fallback and establish the visual template so the code-generated version matches.

**Layout:**
- Background: Indigo `#4f46e5` (full bleed)
- Top-left: Logo reversed lockup (white), padded 48px from edges
- Centre/left-weighted: Primary headline in Lora 600, white, approximately 52px
  - Default text: "Built for tutors. Not built on them."
  - The dynamic version will swap this for page-specific copy
- Below headline: One-line descriptor in Inter 400, white at 70% opacity, approximately 20px
  - Default: "UK online tutoring — flat subscription, 0% commission"
- Bottom-right: A subtle geometric element — a thin white rule (1px) or a partial arc suggesting connection/circle — NOT an illustration, NOT a stock photo. Keep it architectural.
- Bottom-left: URL in Inter 500, white at 60% opacity, 14px: "fair-do.co.uk"

**What not to do:** No stock photos of smiling children or tutors. No gradient that goes too dark (keep the indigo flat and confident). No drop shadows on text (the indigo already provides contrast). No emoji or decorative stars.

**Mood:** The link preview someone sees when a tutor shares their profile or a parent shares an article should feel like a considered design decision, not an afterthought. Clean, confident, immediately readable on any device.

---

### 4. Email Header Banner (600×200)

**Dimensions:** 600×200px (standard email width), PNG @2x (1200×400px actual file)
**Format note:** Export at 2x and set HTML width=600 — this ensures retina clarity in email clients

**Layout:**
- Background: Warm sand `#faf7f2`
- Left: Logo primary lockup (indigo on sand), vertically centred, left-padded 32px
- Right: Thin vertical rule (1px, `#e0e7ff`) then a very short two-word descriptor: "fair-do" in muted slate at 12px (optional — may omit if logo reads cleanly alone)
- Bottom edge: 2px Indigo rule spanning full width (visually anchors the banner above the email body)

**Alternate — dark header variant (for tutor-facing emails):**
- Background: Indigo `#4f46e5`
- Logo reversed lockup (white)
- Bottom edge: 2px amber `#f59e0b` rule
- Use for: welcome emails to tutors, subscription confirmation, Pro upgrade confirmation

**Mood:** Email headers are skimmed, not read. The brand should land in 0.3 seconds. Avoid complexity. Avoid centred layouts that look like newsletter templates from 2015.

---

### 5. Tutor Profile Placeholder Avatar (400×400)

**Dimensions:** 400×400px, PNG, displayed as circle in UI
**Safe zone:** 320×320px inner circle

**Brief:**
This appears when a tutor has not uploaded a photo. It must not look like a generic grey silhouette (which feels unwelcoming and slightly dehumanising). It should feel warm and considered.

**Design:**
- Background: Indigo Light `#e0e7ff`
- Centred: a simple, single-weight line illustration of a person from the shoulders up — not a stock icon, not a cartoon, not the default iOS/Android avatar. Commission a custom version.
- The figure should be gender-neutral: no hair style that reads strongly gendered, no tie or gendered clothing. A clean collarline.
- Line colour: Indigo `#4f46e5`
- Line weight: 2px at 400px export size (scales proportionally)
- No face detail — just the outline of head and shoulders. The simplicity is the point.
- Bottom of the circle (visible when avatar is cropped circular): the letters "fd" in Inter 600, Indigo `#4f46e5`, at approximately 16px — this acts as a subtle brand mark within the placeholder

**Alternate tints (for variety — generate 4 total):**
- Version A: Indigo Light background `#e0e7ff`, Indigo line `#4f46e5` (primary)
- Version B: Sand Mid background `#f0ead8`, Slate line `#1e293b`
- Version C: Indigo background `#4f46e5`, White line `#ffffff`
- Version D: White background `#ffffff`, Slate Muted line `#64748b`

The system can rotate these or assign them deterministically by tutor ID so a page of tutors without photos has natural variety rather than a wall of identical grey blobs.

---

## Priority 2 Assets

### 6. Instagram Carousel Template (1080×1080) — "The Maths" Carousel, 5 Slides

**Dimensions:** 1080×1080px per slide, PNG or as an editable Figma/Canva template
**Series title:** "The maths of tutoring platforms"

**Slide 1 — Hook / Cover**
- Background: Indigo `#4f46e5`
- Headline (Lora 600, white, 56px, centred): "You teach. They take."
- Subhead (Inter 400, white 80%, 22px): "What 25–40% commission actually costs a tutor."
- Bottom: "fair-do" wordmark reversed, small (24px equivalent)
- Visual element: Minimal — perhaps a single large percentage symbol "25–40%" in white at very large size (200px+) positioned behind/under the headline at 10% opacity as a texture
- Mood: Arresting. The white-on-indigo with a single bold claim should stop the scroll.

**Slide 2 — The Problem (Competitor)**
- Background: Warm sand `#faf7f2`
- Top label (Inter 600 caps, Indigo, 12px): "ON A COMMISSION PLATFORM"
- Large visual: A horizontal bar divided into two segments
  - Left segment: `#4f46e5` Indigo, labelled "You keep" with a large number below: "£620"
  - Right segment: `#f0ead8` Sand Mid with a dashed border, labelled "Platform takes" with "£180"
  - This represents a £800 month at 20% commission — make the numbers feel real
- Below bar: Inter 400, Slate, 16px: "A tutor charging £40/hr, 20 sessions/week, on a 20% commission platform. Every month."
- No logo on this slide — keep it neutral/factual

**Slide 3 — The Contrast (fair-do)**
- Background: Warm sand `#faf7f2`
- Top label (Inter 600 caps, Indigo, 12px): "ON FAIR-DO"
- Same bar layout as Slide 2 — but now the full bar is Indigo, labelled "You keep" with "£800"
- The right segment is gone — or rendered as a thin ghost/outline bar to show the absence
- Below bar: Inter 400, Slate, 16px: "Same tutor. Same hours. £0 commission. £29/month subscription."
- Smaller text below: "That's £9,252 more per year." (Inter 600, Indigo)
- Mood: The visual contrast between Slide 2 and 3 should be immediately legible when swiped

**Slide 4 — The Scale Proof**
- Background: Slate Dark `#1e293b`
- White text only
- Headline (Lora 600, white, 44px): "The UK tutoring market is worth £6–8bn a year."
- Body (Inter 400, white 80%, 18px, max 3 lines): "Commission platforms extract hundreds of millions of that from the people doing the actual teaching. fair-do takes a subscription. Nothing else."
- Visual: Small, subtle grid of indigo dots (5×5) bottom-right — each dot represents £100m, with one dot glowing amber to represent the commission extracted. Minimalist data art.
- Mood: Serious. The dark slide signals a gear-change in tone — this is the "systemic problem" beat before the resolution.

**Slide 5 — CTA / Resolution**
- Background: Warm sand `#faf7f2`
- Top: Logo primary lockup (medium, centred, 160px wide)
- Headline (Lora 600, Indigo, 36px, centred): "Built for tutors. Not built on them."
- Body (Inter 400, Slate, 16px, centred, max 2 lines): "Free forever for up to 8 students. No commission. No credit card needed."
- CTA block: Indigo rounded rectangle (8px radius), white text (Inter 600, 18px): "fair-do.co.uk"
- Bottom: Instagram handle in Inter 400, Slate Muted, 13px: "@fair.do.uk" (or whatever handle is secured)

**Template system note:** Build Slide 1 and 5 as locked brand shells. Slides 2–4 should be editable templates so the content team can swap the numbers, the claim, and the subject without touching the brand architecture.

---

### 7. LinkedIn Banner (1584×396)

**Dimensions:** 1584×396px, PNG @2x
**Note:** LinkedIn crops aggressively on mobile — keep critical content within a 1260×396px inner safe zone, centred

**Layout:**
- Background: Warm sand `#faf7f2`
- Left (roughly 40% of width): Logo primary lockup at 240px wide, vertically centred, left-padded 80px
- Vertical rule: 1px Indigo Light `#e0e7ff`, full height, positioned at 42% from left
- Right (roughly 58% of width): Two-line statement
  - Line 1 (Inter 700, Slate Dark, 28px): "0% commission. Flat subscription."
  - Line 2 (Inter 400, Slate Muted, 20px): "The UK tutoring platform that pays tutors fairly."
  - These are right-padded 80px and vertically centred

**Mood:** LinkedIn is a professional context. The banner should feel like a company that has its finances sorted and its values clear. No illustrations, no stock photography, no icons. Just typography and the brand colour — understated confidence.

---

### 8. TikTok Thumbnail Frame (1080×1920 Vertical)

**Dimensions:** 1080×1920px, PNG
**Context:** This is the frozen first frame that appears before a TikTok video plays. It must communicate the video's topic instantly and make someone stop scrolling.

**Template layout:**
- Background: Full bleed — use either Indigo `#4f46e5` or Warm Sand `#faf7f2` depending on video topic (dark for "industry critique" videos, light for "tutor tips" videos)
- Top-right: Logo icon mark only (80px), reversed or standard based on background
- Centre (hero text zone, 1080×700px centred vertically): Large headline text
  - Style: Inter 700, white (on Indigo) or Indigo (on Sand), 72–96px
  - Typically a short provocation: "25% commission?", "Why tutors lose £8k/year", "The maths no one shows you"
  - Text should be set with tight tracking (−0.02em) at this size
- Below hero text: One-line descriptor in Inter 400, 24px, at 70% opacity
- Bottom strip (height: 160px): Solid Indigo band (on sand backgrounds) or Indigo Dark band (on indigo backgrounds) containing:
  - Left: "@fair.do.uk" in Inter 600, white, 20px
  - Right: A directional indicator (▶ or ↑ in white) suggesting "watch now" — not text, just the glyph

**Template variants needed:**
- Dark (Indigo background): for critique/comparison content
- Light (Sand background): for advice/tip content
- Both must work as frozen video stills (no motion graphics — just the static frame)

**Mood:** TikTok thumbnails compete with extreme visual noise. The temptation is to over-design. Resist it. A strong typographic claim on a clean background beats every illustrative approach here. The brand mark plus a bold number or question is all that's needed.

---

### 9. Press Kit Logo Pack

**Deliverables:**

| File | Dimensions | Format | Background |
|---|---|---|---|
| `fair-do-logo-primary.svg` | Vector | SVG | Transparent |
| `fair-do-logo-primary-2x.png` | 480×120px | PNG | Transparent |
| `fair-do-logo-reversed.svg` | Vector | SVG | Transparent |
| `fair-do-logo-reversed-2x.png` | 480×120px | PNG | Transparent |
| `fair-do-logo-on-indigo.png` | 480×120px | PNG | Indigo `#4f46e5` |
| `fair-do-logo-on-sand.png` | 480×120px | PNG | Sand `#faf7f2` |
| `fair-do-logo-on-white.png` | 480×120px | PNG | White `#ffffff` |
| `fair-do-logo-on-dark.png` | 480×120px | PNG | Slate `#1e293b` |
| `fair-do-icon-only.svg` | Vector | SVG | Transparent |
| `fair-do-icon-only-512.png` | 512×512px | PNG | Transparent |
| `fair-do-icon-on-indigo-512.png` | 512×512px | PNG | Indigo `#4f46e5` |

**Naming convention:** All files snake_case, no version numbers in filename (the kit is the master version). Include a `PRESS-KIT-README.txt` with: usage guidelines (minimum size, clear space rules — minimum clear space = 1× the height of the mark on all sides), hex values, typeface names, and a single sentence on brand tone.

**Clear space rule:** Enforce 1× the height of the icon mark as minimum clear space on all four sides of the full lockup. Nothing should crowd the logo.

---

### 10. "Founding Member" Badge (Circle Badge, 200×200)

**Dimensions:** 200×200px, PNG with transparent background; also SVG
**Context:** Displayed on tutor profiles in the platform UI. Founding tutors (those who joined in the first 6 weeks) earn this badge permanently.

**Design:**
- Outer ring: 4px stroke, Amber `#f59e0b`, circle at full 200px diameter
- Inner ring: 2px stroke, Amber at 40% opacity, inset 8px from outer ring
- Background fill: Warm sand `#faf7f2` within the inner ring (or transparent if the tutor profile card handles the background)
- Centre top (arc text): "FOUNDING MEMBER" in Inter 600, 10px, caps, letter-spacing +0.12em, colour: Amber `#f59e0b` — set along the top arc of the inner ring
- Centre: The logo icon mark (ff or fd ligature) at approximately 60px, in Indigo `#4f46e5`
- Centre bottom (arc text): "fair-do" in Inter 400, 9px, colour: Slate Muted `#64748b` — set along the bottom arc
- Between the top arc text and icon: a thin 1px Amber horizontal rule, 40px wide, centred

**Quality check:** At 40×40px (smallest likely display size), the badge should read as "a gold ring with an indigo mark". The text will not be legible at that size — that is acceptable. The badge reads as a quality signal; the tooltip or hover state confirms the text.

**Mood:** It should feel like a small honour — something a tutor would want on their profile. Amber signals warmth and rarity without competing with the core Indigo brand. Think: a pin badge from a professional body, not a gamification sticker.

---

## Priority 3 Assets

### 11. Parent Portal Explainer Graphic (Landing Page)

**Dimensions:** 1440×800px desktop / 768×600px tablet (both required), PNG
**Context:** Appears on the parent-facing landing page to explain what parents see in the portal

**Design concept — "The parent's view" graphic:**
- Style: A stylised browser or device frame (laptop silhouette, 2px Slate border, 8px corner radius) containing a simplified, non-functional mock of the parent portal UI
- The mock UI should show (not real data, but plausible):
  - Tutor name and avatar (use the placeholder avatar)
  - A session log: three rows — "Mon 24 June, 60 min, Physics — Chapter 4 Forces" with a green dot (completed)
  - A small progress note field with 2–3 lines of lorem-tutor text: "Excellent session. [Student] grasped Newton's third law with the rocket analogy. Homework: past paper Q4."
  - A "Next session" indicator with a calendar icon
- Outside the device frame, 3 floating call-out labels connected by thin dashed lines (Indigo `#4f46e5`, 1px):
  - "Session notes from every lesson"
  - "Upcoming schedule at a glance"
  - "Direct message your tutor"
- Background of the full graphic: Warm sand `#faf7f2`
- Callout bubbles: White fill, 1px Indigo border, Inter 500 12px, Slate Dark text

**Mood:** This is a reassurance graphic for parents, not a product screenshot. It should feel transparent, clear, and calm — the visual equivalent of "we will keep you informed."

---

### 12. Feature Comparison Table (Social-Designed Version)

**Dimensions:** 1080×1350px (portrait, Instagram-optimised), PNG
**Also:** 1200×800px landscape version for LinkedIn/blog embeds

**Content:** The comparison should cover 8–10 rows (the most differentiating features) against 4 competitors: Tutorful, MyTutor, Spires, GoStudent

**Suggested rows:**
1. Commission on tutor's own students
2. Service fee added at parent checkout
3. Monthly subscription for unlimited students
4. Integrated video classroom
5. Collaborative whiteboard
6. Parent portal
7. Group lessons
8. AI post-session summaries
9. Schools / B2B channel
10. Founding Member programme

**Visual design:**
- Header row: Indigo `#4f46e5` background, white text, Inter 600 12px caps
- fair-do column: Indigo Light `#e0e7ff` background — slightly highlighted
- Competitor columns: White background
- Row alternation: odd rows on `#faf7f2`, even rows on `#ffffff`
- Checkmarks: filled Indigo circle with white tick (Inter or SVG icon)
- X marks: Slate Muted circle outline with Slate Muted dash (not a red X — the goal is calm factual comparison, not attack advertising)
- Partial support: Amber `#f59e0b` circle with white tilde (~)
- Row labels: Inter 500 13px, Slate Dark
- Cell values (where text rather than icon): Inter 400 12px, Slate Muted
- "fair-do" column header should include the reversed logo icon (16px) to the left of the text

**Mood:** The table should feel like it was prepared by someone who did the research, not someone who ran a hit job. Calm, factual, clear. The visual advantage of the fair-do column should be self-evident from the density of indigo ticks — no arrows, no superlatives, no stars.

---

### 13. Infographic: "Where Your Lesson Fee Goes" (Horizontal Bar Comparison)

**Dimensions:** 1200×675px, PNG (landscape, Twitter/LinkedIn-optimised)
**Also:** 1080×1920px vertical version for Instagram/TikTok story

**Concept:** Five horizontal bars, one per platform, showing the split between tutor earnings and platform take as proportional segments. This is the visual version of the key proof point: "Tutors keep 100% on fair-do vs 60–75% on commission platforms."

**Layout (landscape):**

```
Platform label    [========================================] bar (full width)
Tutorful          [==========================] Tutor 65%  |  Platform 35%
MyTutor           [========================] Tutor 60%    |  Platform 40%
Spires            [===========================] Tutor 67% |  Platform 33%
GoStudent         [==========================] Tutor 65%  |  Platform 35%
fair-do           [========================================] Tutor 100% | Sub £29
```

**Visual design:**
- Background: Warm sand `#faf7f2`
- Title (Inter 700, Slate Dark, 22px, left-aligned): "Where your lesson fee goes"
- Subtitle (Inter 400, Slate Muted, 15px): "Per £800/month earned (20 sessions at £40/hr)"
- Bar height: 48px each, 16px gap between bars
- Bar corner radius: 6px
- Tutor segment: Indigo `#4f46e5`
- Platform segment: `#e2e8f0` (cool light grey — neutral, not aggressive)
- fair-do bar: Full-width Indigo, no split. The "platform" portion is simply absent.
- Within each bar: percentage label in white Inter 600 14px (tutor keep %), and if the platform segment is wide enough, the platform % in Slate text
- fair-do bar label: "100% to tutor" in white Inter 600 14px, followed by a small separator and "£29/mo subscription" in Indigo Light `#e0e7ff` Inter 400 13px
- Platform name labels (left of bars): Inter 600, 14px, Slate Dark. fair-do label in Indigo `#4f46e5`
- Source footnote: Inter 400 11px, Slate Muted: "Platform fee rates sourced from publicly listed rates, July 2026. Commission platforms may vary by subject and experience level."
- fair-do logo mark (icon only, 40px) bottom-right

**Mood:** This is the single most powerful visual the brand has. The visual argument is made by the geometry alone — one bar that goes all the way to the edge, four that do not. Do not over-label it. Let the bars speak. The only annotation needed is the percentages and the platform names.

---

### 14. Email Spot Illustrations (3 for Welcome Emails)

**Dimensions:** Each 480×240px, PNG @2x (960×480px file), transparent background
**Style:** Flat line illustration, single-weight strokes (2px at 480px), limited to 2 colours maximum per illustration (Indigo + one accent, or Indigo + Sand)
**Tone:** Considered, warm, not childlike. These should feel like the illustrations in a good independent financial services guide or a well-designed professional newsletter — not an edtech app.

**Illustration 1 — "Welcome" (used in tutor welcome email)**
- Scene: An open laptop on a wooden desk, viewed from a slight above-angle. On the screen: a simplified version of the fair-do interface (just enough detail to be suggestive — the sidebar, a booking card, a video frame outline). Next to the laptop, a single mug of tea (UK signalling). No people, no face.
- Palette: Indigo lines on transparent, with the laptop screen filled with Indigo Light `#e0e7ff`

**Illustration 2 — "You're earning fairly" (used in first payment confirmation email)**
- Scene: A simplified hand holding a phone, on screen a single large number with a £ sign. Around the phone, small floating circles radiating outward — each containing a tiny clock icon (suggesting session time converting to earnings). No percentage-take visible — this is about the tutor's full earnings.
- Palette: Indigo lines, Amber `#f59e0b` for the phone screen and the floating circles

**Illustration 3 — "Your students are waiting" (used in nudge email for tutors who have not yet added students)**
- Scene: Two overlapping speech-bubble shapes (not cartoonish — more geometric, square-cornered), one slightly larger than the other, suggesting a conversation waiting to happen. Inside the larger bubble: a simple waveform or ellipsis (the "typing" indicator). Clean, minimal, abstract.
- Palette: Indigo `#4f46e5` for the larger bubble, Indigo Light `#e0e7ff` for the smaller

**Technical note:** Export with transparent background. The email template places these on the warm sand `#faf7f2` background — the designer should proof against that background before signing off, not against white.

---

## Photography / Video Direction

### Art Direction Brief — Tutor Photography

**When to use:** Testimonial sections, blog articles, press materials, "Meet the tutors" features

**The brief in one sentence:** Shoot tutors as the skilled professionals they are, not as supporting characters in a child's learning journey.

**Location:**
- Natural indoor light preferred. A home office, a kitchen table, a good independent coffee shop — not a studio. Not a classroom with chalkboards.
- Window light from the left or right (never behind the subject). No ring lights, no artificial warmth. The light should feel like a Thursday afternoon, not a product shoot.

**Composition:**
- Mid-shot to three-quarter shot (head and torso, not headshot-tight, not full-length). Subject looking slightly off-camera or directly at camera — both work. Never awkward "I'm pretending to type" staging.
- Background: Soft-focus interior. Warm tones preferred. A bookshelf in background is fine. A branded background is not.
- Subject/background ratio: Subject sharp, background at f/2.8 or equivalent (bokeh but not excessive)

**Wardrobe:**
- Smart casual, not formal. A good jumper, an open collar, a quality jacket. Never a suit, never a tabard, never branded clothing.
- Colour: Earth tones, navy, white, grey. Avoid red, avoid logos, avoid patterns that clash with the indigo UI.

**Mood references (describe, not show):**
- The portrait style of Kinfolk magazine (relaxed, natural, confident)
- LinkedIn profile photos from the kind of barristers or consultants who clearly took it seriously
- Emphatically not: Shutterstock "tutor pointing at whiteboard", not "teacher high-fiving student"

**Editing / colour grade:**
- Slightly warm (add +5–8% warmth in post), slightly desaturated (−10–15% saturation) — not Instagram warm, not vintage, just organic
- Skin tones accurate and unmanipulated
- Shadows lifted slightly (shadow lift +20 in Lightroom or equivalent) — open, readable faces
- No artificial vignette, no grain filter, no presets that date the image

**What every tutor photo must convey:** This person is good at what they do, charges what they're worth, and does not need a platform to validate them. The platform is lucky to have them.

---

### B-Roll Brief — Short-Form Video

**Context:** B-roll for the four scripted TikTok/Reel videos in MARKETING.md, plus general platform explainer use

**Shot list (25 clips, 3–8 seconds each):**

*Tutor working shots:*
1. Hands typing on a laptop keyboard — close, natural light
2. A notebook open with handwritten workings (maths equations or essay notes) — slightly above angle
3. A phone screen showing a calendar with sessions booked — finger scrolling
4. Over-shoulder: a video call in progress (actor, not identifiable student) — blurred screen content for privacy
5. A mug of tea being picked up from a desk — the most domestic possible shot
6. Close-up: a pen underlining something in a textbook
7. A tutor looking directly into camera and then looking down at notes — natural movement
8. Two hands on a keyboard — one typing, one resting: working, not performing

*Platform / product shots:*
9. A laptop screen showing the fair-do booking page (record actual UI) — slow pan across
10. A phone showing the tutor profile page — hand tilting phone slightly
11. A monitor showing the video classroom interface — no identifiable content on screen
12. A hand tapping "Accept booking" on a phone screen — close crop

*Environment / texture shots:*
13. Sunlight through a window onto a wooden desk — lingering, 6 seconds
14. A bookshelf, slightly out of focus — 4 seconds
15. Rain on a window — optional, for moodier cuts
16. A front door closing (tutor arriving home to start their day) — from inside, warm interior light
17. A coffee shop counter, out of focus, tutor in sharp focus working at table in foreground

*Money / value shots (to use over voiceover on the maths video):*
18. A phone calculator — blurred, suggestion only, never show an actual number being typed
19. An envelope being sealed (evoking invoice, payment)
20. A card reader — close crop, no brand visible
21. A notification appearing on a locked phone screen (blurred content, just the pop and glow)

*Wildcard / brand-mood shots:*
22. A library or independent bookshop interior — wide, deserted, golden light
23. A chessboard, mid-game — close crop, out of focus edge
24. Hands holding a coffee cup at a table — both hands visible, unhurried
25. An open window with trees outside — summer, natural sound if audio captured

**Audio note:** Capture natural sound on all clips (keyboard, cup, ambient room sound). The video team will use this as texture under the scripted VO — none of the B-roll needs sync dialogue.

---

### Colour Grading Direction

**Target feel:** Warm but not vintage. Natural but not raw. Confident without being polished.

**Lightroom / DaVinci / Premiere settings (approximate translation):**
- White balance: Slightly warm (5600–6000K equivalent, or +8 in Lightroom temperature slider)
- Tint: Very slight green push (+3–4) — removes the purple cast that cheap indoor light introduces
- Exposure: Standard. Never blown highlights.
- Contrast: Reduce slightly from default (−10 to −15). The image should breathe.
- Highlights: Pull down slightly (−20) — retain window light detail
- Shadows: Lift slightly (+15 to +25) — open, accessible, not moody
- Whites: Standard or +5
- Blacks: +5 to +10 (lifted blacks = lifted feel)
- Clarity: 0 or −5 (no sharpening, no texture enhancement — this is not a landscape)
- Vibrance: −10 to −15 (desaturate slightly overall)
- Saturation: −5 (supporting the vibrance reduction)
- HSL Adjustments: Reds +10 saturation (warm skin tones), Blues −10 saturation (cools any environmental blue cast), Greens −5 saturation

**LUT reference (if using DaVinci):** A gentle warm-neutral LUT at 30–40% opacity, then adjust on top. Do not use any LUT at full strength.

**The test:** Screenshot any colour-graded frame next to the brand colour palette. The warmth of the footage should feel like it belongs in the same world as `#faf7f2` and `#4f46e5`. If it feels like it belongs on Instagram or in a coffee brand video, dial back the warmth and lift the saturation back slightly.

---

## Icon System

### 5 Custom Icons

**Style brief (applies to all 5):**
- Type: Line icons (not filled, not duotone at this stage)
- Weight: 1.5px stroke at 24×24px grid (export at 24px, 48px, and SVG)
- Corner radius: 2px on all joins and corners — enough to feel warm, not enough to feel bubbly or childlike
- Join style: Round line caps on open paths
- Colour: Designed in Slate Dark `#1e293b`; the implementation colours them via CSS/SVG currentColor so one master works in all contexts
- Grid: Design on a 24×24px grid with a 2px safe zone on all sides (effective drawing area: 20×20px)
- Optical consistency: All icons must feel the same visual weight when placed side-by-side. Check this at actual display size (24px), not design size.
- Do not use: Any icon from an existing library (Heroicons, Material, Feather) without meaningful modification — these must feel like a proprietary set

---

**Icon 1 — Session (represents a live tutoring session)**

Concept: A video camera with a small play indicator
- Main body: A rounded rectangle (4px radius) representing the camera body — 14×10px centred
- Lens: A small circle (3px diameter) inside, slightly left of centre
- Viewfinder wing: A chevron shape (two diagonal lines forming a >) on the right side of the rectangle — suggesting the folded-wing camera icon but without literal wings

Alternative simpler concept: Two overlapping speech bubbles (as a dialogue metaphor for live session), slightly squared. The overlap region is negative space (not filled). Each bubble has a small horizontal rule inside suggesting text/voice.

Decision: Use the camera-plus-lens approach for the literal meaning of "video session", but ask the designer to also produce the speech-bubble variant and test both in context.

---

**Icon 2 — Payment (represents tutor earnings, the subscription, the money model)**

Concept: A coin or banknote that emphatically does not look like a generic "money" icon
- Preferred: A pound sign (£) within a thin circle — but the circle is not closed; it opens at the top-right with a small gap and a small arrow pointing outward, suggesting money flowing *to* the tutor, not being extracted
- The £ glyph should be drawn as a custom path (matching the Inter typeface £ character at 14px) rather than using a system font glyph — for consistency at icon scale
- Stroke weight: consistent with the rest of the system (1.5px)

---

**Icon 3 — Schedule (represents booking, calendar, session scheduling)**

Concept: A calendar tile with a minimal indicator
- Outer shape: A rounded rectangle (3px radius), 18×18px
- Top border: A slightly thicker or doubly-stroked top edge (the "binding" of the calendar) — achieved by a 2px line across the top, 2px below the outer edge
- Two small circles (1.5px diameter each) at top-left and top-right of the outer edge (the ring holes)
- Inside: A single dot in the lower-centre of the calendar face (representing "a date is set") — 2px diameter filled circle
- Do NOT include a date number inside the calendar — this makes the icon specific to a date rather than generic, and it reduces legibility at small sizes

---

**Icon 4 — Safeguarding (represents the platform's DBS/safeguarding framework)**

Concept: A shield with a small verified-checkmark
- Shield: Standard shield outline, 16×18px, 2px radius on the bottom point and side curves — not a superhero shield (avoid the sharp-bottom gothic shape) — more like a crest shield, gently rounded bottom
- Inside the shield: A small tick/checkmark (not a checkmark-in-circle, just a clean path tick) — 8px wide, stroked at 1.5px, centred lower-third of the shield interior
- The shield should feel protective but not aggressive — it is a quality signal, not a security warning

---

**Icon 5 — Community (represents the tutor community, the founding member cohort, shared belonging)**

Concept: Three overlapping person-silhouettes
- Three simplified head-and-shoulder shapes (no face detail, no hair) in a slight fan arrangement
- The leftmost and rightmost figures are at 85% opacity of the stroke (or slightly offset/behind) to create depth without additional colour
- Figures are slightly overlapping (the right edge of each figure coincides with 30% of the next figure's width)
- This arrangement should read at 24px as "a group of people" — test at that size; if it reads as abstract noise, simplify to two figures

---

## Asset Delivery Specifications

### File Naming Convention

All files should follow the pattern:
`fair-do_[asset-name]_[variant]_[dimensions].[ext]`

Examples:
- `fair-do_logo-primary_on-sand_480x120.png`
- `fair-do_social-profile_instagram_400x400.png`
- `fair-do_icon-session_24px.svg`
- `fair-do_carousel-the-maths_slide-01_1080x1080.png`

### Folder Structure

```
/fair-do-assets/
  /01-logo/
    /primary/
    /reversed/
    /icon-only/
    /press-kit/
  /02-social/
    /profile-images/
    /og-image/
    /carousel-the-maths/
    /linkedin-banner/
    /tiktok-frames/
  /03-email/
    /header-banners/
    /spot-illustrations/
  /04-ui/
    /placeholder-avatars/
    /founding-member-badge/
    /icons/
  /05-infographics/
    /fee-comparison/
    /feature-table/
    /parent-portal-explainer/
  /06-photography/
    [raw originals]
    /edited/
    /social-crops/
```

### Format and Colour Profile

- All raster files: sRGB colour profile (not Adobe RGB, not Display P3 — web-safe)
- PNG: exported with transparency where specified; without for social/email where background is declared
- SVG: cleaned paths, no embedded fonts (convert all text to outlines), no linked images
- Minimum DPI: 144ppi at intended display size (effectively: export @2x, declare @1x)

### Figma Handoff Requirements

- Deliver a Figma file containing all assets with:
  - Components for each icon at 24px and 48px
  - Auto-layout email banner components (editable text fields)
  - Carousel template as a reusable Figma component set
  - Colour styles matching the full colour system in this brief
  - Text styles for each typographic role defined above
  - A "do not do" page showing common misuse (wrong background, wrong font weight, logo on busy background)

---

## Prioritised Delivery Schedule

| Week | Deliverables |
|---|---|
| Week 1 | Logo suite (all variants + SVG masters), social profile images (all platforms), OG image |
| Week 2 | Email header banners (both variants), placeholder avatars (all 4 tints), icon system (all 5 icons) |
| Week 3 | Instagram carousel — "The Maths" (all 5 slides), LinkedIn banner, Founding Member badge |
| Week 4 | TikTok thumbnail frame templates, press kit pack, spot illustrations (all 3) |
| Month 2 | Fee comparison infographic, feature comparison table (social version), parent portal explainer graphic, B-roll shoot and grade |

---

## Approval Process

1. Designer submits initial concepts for logo mark only (3 directions) — Creative Director selects one direction to develop
2. Logo refined to final, then all Priority 1 assets derived from confirmed logo system
3. All assets reviewed against this brief before final export — the question at every review is: "Does this feel like a trusted professional colleague, or does it feel like it's trying too hard?"
4. No asset is considered final until it has been tested at its smallest intended display size (not just full-size preview)

---

*Brief prepared by: Creative Director, fair-do*
*For questions on brand voice or positioning context: refer to MARKETING.md*
*For competitive positioning: refer to COMPETITIVE-ANALYSIS.md*

---
