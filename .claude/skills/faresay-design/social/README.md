# Faresay social media kit

Branded, **export-ready** post templates at each platform's native pixel size. Each file is a self-contained graphic built on the design-system tokens (`styles.css`) + `social.css`, with the logo and lotus injected by `social.js`.

**Start here:** open `Social Media Kit.html` for the whole kit on one pannable canvas.

## Formats

| Platform | File | Size |
|---|---|---|
| LinkedIn | `linkedin-post.html` | 1200×627 |
| LinkedIn | `linkedin-banner.html` | 1584×396 |
| Instagram | `instagram-post.html` | 1080×1080 |
| Instagram | `instagram-story.html` | 1080×1920 |
| Facebook | `facebook-post.html` | 1200×630 |
| Facebook | `facebook-cover.html` | 1640×624 |
| X (Twitter) | `x-post.html` | 1600×900 |
| X (Twitter) | `x-header.html` | 1500×500 |
| YouTube | `youtube-thumbnail.html` | 1280×720 |
| YouTube | `youtube-banner.html` | 2560×1440 (1546×423 safe zone) |

## Exporting

Open any file and use **Save as PDF** (it sizes the page to the design automatically) or screenshot at full resolution. To re-export as PNG, open the file and capture it 1:1.

## Editing

- **Themes:** `s-dark` (evergreen), `s-sand` (cream gradient), `s-brand` (teal) on the `.s-frame`.
- **Copy:** edit the headline / sub / eyebrow text directly; `.accent` colours a phrase.
- **Building blocks** (in `social.css`): `.s-eyebrow`, `.s-headline`, `.s-sub`, `.s-cta`, `.s-chip`, `.s-url`, `.s-blob` (decorative gradient orbs).
- **Logo / lotus:** `<span data-logo="light|dark">` and `<div data-lotus>` — injected by `social.js`.

Headlines, taglines and CTAs are pulled from the live product voice ("Your whole practice, in one calm place.", "Therapy that's fair.", "Start free").
