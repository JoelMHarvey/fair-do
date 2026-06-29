# Internationalisation — French / German / Italian site versions

**Status:** Phase 0 complete on `feat/i18n` — routing pipeline proven, English only. Phase 1 (string extraction) not yet started.
**Goal:** serve the Faresay site in **French, German, Italian** (alongside English).

---

## 0. First decide: translation, or market entry?

These are very different in scope — pick before any code:

| | **A. Localisation only (recommended first)** | **B. Market entry (FR/DE/IT operations)** |
|---|---|---|
| What | The same UK product, UI translated, for FR/DE/IT speakers + SEO. | Actually operating in those countries. |
| Adds | Translations, routing, hreflang. | Per-country **therapist registration bodies**, **EUR** pricing/payouts, **local crisis lines**, country legal/tax, regulated-health rules, support in-language. |
| Effort | Weeks. | A quarter+ per country (this is the `US-EXPANSION-PLAN.md` shape). |

This plan covers **A**. Anything country-specific (regulation, payments, registration) is flagged as "Track B" and deferred. **Important:** the moment the site speaks French, French speakers will arrive — so the **safety + legal** items in §5 are not optional even for A.

---

## 1. Technical approach (Next.js 16 App Router)

- **Library: `next-intl`** — the standard App Router i18n. (Next dropped built-in i18n routing in App Router.)
- **Routing:** locale path prefix — `/fr`, `/de`, `/it`; English stays at the root (`localePrefix: 'as-needed'`). Locale detected from the path, with `Accept-Language` for the initial redirect + a persisted cookie.
- **Middleware composition (the key integration risk):** the app already runs **`clerkMiddleware`** in `src/proxy.ts`. `next-intl`'s middleware must be **composed inside** Clerk's (both want to own the request) — run the next-intl handler first to resolve the locale, then Clerk's `auth.protect()`. This is the one part to prototype before committing; budget for it.
- **Messages:** `messages/{en,fr,de,it}.json`. Components read via `useTranslations()` (client) / `getTranslations()` (server).
- **Formatting:** dates/numbers via `Intl`; currency — the app already has `LocalPrice` + `getVisitorCurrency`, so EUR display is mostly there.

---

## 2. The real work: string extraction

Today all copy is **hardcoded in JSX** across ~17 public pages + shared components (`SiteNav`, `SiteFooter`, `Logo`, forms…). Phase 1 is mechanically extracting every user-facing string into `messages/en.json` and replacing it with a `t('key')`. That's the bulk of the effort — translation is comparatively easy once the keys exist.

**Surface to translate (Track A):**
- Marketing pages: home, about, pricing, compare, for-business, faq, help, ai-therapy, gift, styles.
- Shared UI: nav, footer, buttons, forms, onboarding, dashboards, error/empty states, the `/onboarding/connect` + booking flows.
- **Emails** (16 templates in `src/lib/email.ts`) — localise to the recipient's locale (store a `locale` on the user).
- **SEO:** translated `metadata`, `hreflang` alternates, per-locale `sitemap`, `<html lang>`.

---

## 3. What is NOT translated (boundaries)

- **User-generated content** — therapist bios/taglines, client questionnaires, messages, notes. Therapists write their own copy; never machine-translate it.
- **Blog** — decide per post; likely keep English + translate a few cornerstone posts. Don't block launch on the whole blog.
- **Legal docs** (`/privacy`, `/terms`) — see §5.

---

## 4. Translation workflow

- **Marketing/UI:** machine-translate (DeepL is strong for FR/DE/IT) as a **first pass**, then **human review** by a native speaker. Don't ship raw MT as final brand copy.
- **Safety + legal + clinical copy:** professional/qualified translation + review only — **never** unreviewed MT (§5).
- Keep `en.json` the source of truth; lint for missing keys per locale in CI so a missing translation is caught, not shipped blank.

---

## 5. ⚠️ Safety & legal — non-negotiable even for "translation only"

- **Crisis lines are country-specific and safety-critical.** The UK shows Samaritans 116 123 / 999. A French/German/Italian visitor in distress **must** see *their* country's lines (e.g. FR 3114, DE Telefonseelsorge 0800 111 0 111, IT Telefono Amico 02 2327 2327 — verify current numbers). Wrong number to a distressed user is a real harm. `locale.ts` already models `CrisisLine`; extend it per locale and select by locale, not region.
- **Legal docs:** the English `/privacy` + `/terms` are authoritative. Options: (a) keep English authoritative and add clearly-labelled *informational* translations with a "the English version governs" note, or (b) commission qualified legal translations. Don't auto-translate legal text and present it as binding.
- **No new health claims** in translation — keep the same careful, non-clinical framing (the voice rules) in every language.

---

## 6. Phased build

- **Phase 0 — plumbing ✅:** locale routing via `app/[locale]/` (fr/de/it at `/fr`, `/de`, `/it`; English stays at root); `src/lib/dictionaries.ts` getDictionary helper; `src/messages/{en,fr,de,it}.json` with hero strings; `LocaleSwitcher` in SiteNav; `[locale]/page.tsx` renders translated hero from dictionary. No next-intl needed — using Next.js 16 built-in JSON-dictionary approach. Clerk `proxy.ts` adds locale paths as public routes. Build clean, TypeScript clean. Note: `<html lang>` stays `en` until Phase 1 moves all routes under `[locale]`.
- **Phase 1 — extraction:** move all UI strings to `messages/en.json`; refactor pages/components to `t()`. CI check for key parity.
- **Phase 2 — FR/DE/IT UI:** translate marketing + UI (MT + native review); **per-locale crisis lines + safety copy** (§5).
- **Phase 3 — emails + SEO:** localise the 16 email templates to the user's locale; hreflang, per-locale sitemap, translated metadata.
- **Phase 4 — legal + blog:** counsel-reviewed legal translations (or authoritative-en + disclaimer); translate cornerstone blog posts.

---

## 7. Testing plan

- **Unit:** message-key parity across `en/fr/de/it` (no missing/extra keys); `Intl` date/number/currency formatting per locale; crisis-line selection returns the correct country's lines for each locale.
- **Integration:** middleware resolves locale **and** Clerk auth still gates protected routes per locale (`/fr/dashboard` redirects to sign-in just like `/dashboard`); locale cookie persistence; email rendered in the user's locale.
- **E2E (Playwright):** switch language → nav/home/pricing render translated; `<html lang>` + hreflang correct; a distressed-path page shows the right crisis line for the locale.
- **SEO:** hreflang alternates + per-locale sitemap entries present and correct.

---

## 8. Effort & open decisions

- **Effort:** Phase 0–1 ≈ 1–2 weeks (mostly extraction); Phase 2 per language ≈ days of translation + review; Phases 3–4 ≈ 1–2 weeks. Plus translation cost (MT + native review per language).
- **Decisions to make:**
  1. **Scope** — Track A (translation) now, Track B (market entry) later? (Recommend A.)
  2. **Which languages first** — all three, or start with one to prove the pipeline?
  3. **Routing** — path prefix (`/fr`) (recommended) vs subdomain/ccTLD (only if Track B).
  4. **Legal docs** — authoritative-English + informational translation, or commissioned legal translation?
  5. **Currency** — show EUR to FR/DE/IT visitors (reuse `LocalPrice`), or keep GBP?
  6. **Gate** — ship behind a flag / per-locale until each language is fully reviewed.

---

## 9. Why this might wait

If FR/DE/IT aren't target markets yet, this is reach beyond the UK beachhead — the same "prove the core first" logic as clinics and US expansion. Worth doing when there's real demand or an SEO/marketing reason; the plan is ready to execute when that's true.
