# Internationalisation — fair-do

**Status:** Phase 0 complete — locale routing pipeline proven, English-only content.
Code already supports **6 locales** (`en`, `fr`, `de`, `it`, `es`, `pt`) behind
`I18N_ENABLED`; only hero strings are translated so far. Phase 1 (string extraction)
not started.

> This is the **tutoring** plan. It is *not* the Faresay therapy plan with the words
> swapped — a tutoring marketplace has a problem therapy didn't: the **curriculum is
> country-specific** (§0.5). That changes the strategy.

---

## 0. First decide: who are we translating *for*?

For a UK tutoring platform there are **three** distinct moves, not two. Pick before
more code.

| | **A1. UK families, other languages** | **A2. International SEO/reach** | **B. Foreign market entry** |
|---|---|---|---|
| Who | UK families who'd rather use the site in Polish/Urdu/etc. — kids still sit **UK exams** | FR/DE/IT/ES speakers searching, same UK product | Actually operating in France/Germany/etc. |
| Curriculum | **UK** (GCSE/A-Level/KS) — unchanged ✅ | UK — but confusing to a foreign family | **Re-do** per country (Bac, Abitur, Maturità…) |
| Adds | Translate UI + emails; keep the taxonomy | + hreflang/SEO | + local levels/exams, EUR, local safeguarding + law, in-language support |
| Effort | Weeks | Weeks | A quarter+ per country |
| Verdict | **Do first** | Optional | Defer (this is `US-EXPANSION-PLAN.md` shape) |

**Near-term win for a UK tutoring platform is A1, not A2.** Big UK communities (Polish,
Urdu/Punjabi, Romanian, Bengali, Arabic, Portuguese…) want UK-curriculum tutoring for
their children but convert better with the site, onboarding, and emails in their
language. Kids still sit GCSEs — so **nothing about the education model changes**, only
the wrapper. Cheapest, highest-ROI i18n.

### 0.5 Tutoring-specific catch — curriculum doesn't translate

The taxonomy in `src/lib/taxonomy.ts` (`LEVELS`: KS1…GCSE/A-Level/IB; subjects; exam
boards) is the **UK education system**. Translating UI to French does **not** make a
UK-GCSE marketplace useful to a family in Lyon — they want the *Brevet* and the
*Baccalauréat*. So:

- **A1 / A2** (UK product, other language): fine — keep the UK taxonomy, translate
  labels. A French-speaking London parent still wants GCSE Maths.
- **B** (operate in FR/DE/IT/ES): must localise the **whole curriculum model** — levels,
  exams, subjects, teaching-credential bodies — per country. Far bigger lift than the
  therapy plan (therapy approaches were ~universal; national exam systems are not).
  Treat B as market-entry, country by country, like the US plan.

**This plan covers A1 (A2 as a bonus).** Everything country-operational is "Track B" and
deferred. Note: moment the site speaks a language, speakers of it arrive — so **safety +
legal** (§5) apply even to A1.

### 0.6 Which locales — align the code to the strategy

Code ships `fr/de/it/es/pt` (inherited from the therapy plan's reach). If A1 (UK
families) is the priority, higher-value languages are the ones **UK families actually
speak** — overlap the app's own `LANGUAGES` list: **Polish, Urdu, Punjabi, Romanian,
Bengali, Arabic, Portuguese, Welsh**. Decision needed (§8): keep fr/de/it/es/pt, or
repoint the locale set at UK-community languages. (RTL — Arabic/Urdu — adds layout work;
flag if chosen.)

---

## 1. Technical approach (Next.js 16 App Router)

- **Current build:** Next.js 16 built-in **JSON-dictionary** approach (no next-intl).
  `src/lib/dictionaries.ts` `getDictionary(locale)` loads `src/messages/{locale}.json`;
  `app/[locale]/page.tsx` renders from it; `LocaleSwitcher` in `SiteNav`.
- **Routing:** locale path prefix — `/fr`, `/de`… English at root. Locale resolved in
  `src/proxy.ts` (negotiates `Accept-Language` + persists `NEXT_LOCALE` cookie),
  forwarded to server components.
- **Middleware composition (the integration risk):** `proxy.ts` already runs
  `clerkMiddleware` **and** the locale logic together — locale resolved first, then
  `auth.protect()`. Built and working; keep it if adding locales rather than introducing
  next-intl.
- **Formatting:** dates/numbers via `Intl`; currency via existing `LocalPrice` +
  `getVisitorCurrency`. GBP stays the charge currency (UK product); display currency is a
  separate choice (§8).
- **If scope grows** (pluralisation, gender, ICU messages): revisit `next-intl`. JSON is
  fine for UI strings; gets thin for complex plural rules in some target languages.

---

## 2. The real work: string extraction

All copy is **hardcoded in JSX** across the public pages + shared components (`SiteNav`,
`SiteFooter`, forms, dashboards…). Phase 1 is mechanically extracting every user-facing
string into `messages/en.json` and replacing it with `t('key')`. That's the bulk;
translation is comparatively easy once keys exist.

**Surface to translate (A1):**
- Marketing: home, about, pricing, compare, for-schools, for-tutors, faq, help,
  ai-tutoring, gift, values, /styles (subjects).
- Shared UI: nav, footer, buttons, **onboarding (student + teacher)**, dashboards, the
  booking + self-book flows, error/empty states.
- **Emails** (`src/lib/email.ts`) — render in the recipient's locale (`User.locale`
  column already exists; wire it through).
- **SEO:** translated `metadata`, `hreflang` alternates, per-locale `sitemap`,
  `<html lang>` (still `en` until all routes move under `[locale]`).

---

## 3. What is NOT translated (boundaries)

- **User-generated content** — tutor bios/taglines, student questionnaires, messages,
  lesson notes. Never machine-translate someone's own words.
- **Curriculum structure** stays UK for A1 (§0.5) — UI labels around it get translated,
  the levels/exams model does not change.
- **Blog** — translate cornerstone posts only; don't block on the whole blog.
- **Legal docs** — see §5.

---

## 4. Translation workflow

- **Marketing/UI:** machine-translate (DeepL strong for European languages; for
  Urdu/Punjabi/Bengali/Arabic use a service with real coverage) as a **first pass**, then
  **native-speaker review**. Never ship raw MT as final brand copy.
- **Safety + safeguarding + legal copy:** qualified human translation only — **never**
  unreviewed MT (§5).
- `en.json` is the source of truth; **CI lints for missing/extra keys per locale** so a
  gap is caught, not shipped blank.

---

## 5. ⚠️ Safety & legal — non-negotiable even for "translation only"

- **Safeguarding lines are safety-critical and depend on where the user *is*, not what
  language they read.** Students are often children. UK shows NSPCC `0808 800 5000` /
  Childline `0800 1111` / `999`.
  - **A1** (UK families, other language): they're physically in the UK → still show
    **UK** lines, just translated. Do **not** show French numbers to a Polish family in
    Birmingham.
  - **A2/B** (in-country): show that country's lines (FR 119, DE 116 111, IT 19696 —
    verify current numbers).
  - `src/lib/locale.ts` models `CrisisLine` per **region** — for A1, select by region
    (UK), not by language. Get this distinction right.
- **DBS / safeguarding framing** must stay accurate in every language — it's UK child
  protection; translation must not soften it.
- **Legal docs:** English `/privacy` + `/terms` are authoritative. Either (a) keep
  English authoritative + clearly-labelled *informational* translations ("the English
  version governs"), or (b) commission qualified legal translations. Never auto-translate
  legal text and present it as binding.

---

## 6. Phased build

- **Phase 0 — plumbing ✅:** `[locale]` routing, `getDictionary`, `messages/*.json` (hero
  only), `LocaleSwitcher`, Clerk+locale middleware in `proxy.ts`. Behind `I18N_ENABLED`.
- **Phase 0.5 — strategy lock:** pick A1 vs A2; pick the locale set (§0.6); confirm
  UK-taxonomy-stays. **Do before extraction.**
- **Phase 1 — extraction:** all UI strings → `messages/en.json`; pages/components →
  `t()`; CI key-parity check.
- **Phase 2 — first language end-to-end:** translate marketing + UI + onboarding for
  **one** locale (prove the pipeline + native review), region-correct safeguarding.
- **Phase 3 — emails + SEO:** localise email templates to `User.locale`; hreflang,
  per-locale sitemap, translated metadata.
- **Phase 4 — remaining locales + legal/blog:** roll out the chosen set; counsel-reviewed
  legal (or authoritative-en + disclaimer); cornerstone blog posts.

---

## 7. Testing plan

- **Unit:** message-key parity across every locale (no missing/extra keys); `Intl`
  date/number/currency per locale; **safeguarding-line selection returns the correct
  *region's* lines** (UK lines for a UK visitor regardless of language).
- **Integration:** middleware resolves locale **and** Clerk still gates protected routes
  per locale (`/fr/dashboard` redirects to sign-in like `/dashboard`); cookie
  persistence; email rendered in `User.locale`.
- **E2E:** switch language → nav/home/pricing translated; `<html lang>` + hreflang
  correct; safeguarding page shows the right region's line.

---

## 8. Effort & open decisions

- **Effort:** Phase 0.5–1 ≈ 1–2 weeks (mostly extraction); each language ≈ days of
  translation + native review; Phases 3–4 ≈ 1–2 weeks. Plus per-language translation cost.
- **Decisions:**
  1. **A1 vs A2** — translate-for-UK-families first (recommended) vs international SEO.
  2. **Locale set** — keep `fr/de/it/es/pt`, or repoint at UK-community languages
     (Polish/Urdu/Punjabi/Romanian/Bengali/Arabic/Portuguese/Welsh)? (RTL adds work.)
  3. **Curriculum** — confirm UK taxonomy stays for A1; market-entry (B) is a separate,
     per-country project.
  4. **Routing** — path prefix (`/fr`, built) vs subdomain (only for B).
  5. **Legal docs** — authoritative-English + informational translation, or commissioned.
  6. **Display currency** — GBP everywhere (UK product) vs EUR for in-country (B only).
  7. **Gate** — keep `I18N_ENABLED` + ship per-locale only once fully reviewed.

---

## 9. Why this might wait

If the UK English market isn't saturated yet, even A1 is reach beyond the beachhead —
same "prove the core first" logic as schools/US. But A1 is the cheapest expansion move
(no new curriculum, no new payments, no new regulation — a translated wrapper on the same
UK product), so it's the natural **first** expansion once there's signal that
non-English-speaking UK families are a real segment. The pipeline is built and ready when
that's true.
