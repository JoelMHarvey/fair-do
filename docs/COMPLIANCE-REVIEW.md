# Compliance Review — fair-do (Go-Live)

**Date:** July 2026
**Scope:** UK GDPR / Data Protection Act 2018 readiness for the fair-do studio portal, with focus on (a) the controller/processor split, (b) sub-processor transparency, (c) children's data, and (d) AI processing of minors' lesson transcripts.

**Method:** Applied two Lawvable legal-AI skills to fair-do's own artifacts —
- **Legal Compliance Checker** → *Privacy Policy Generator* (`privacy-policy-stephane-boghossian`, AGPL-3.0): confirmed-practices-only, source-cited, mandatory lawyer referral where children + AI are involved.
- **Legal Document Review** → *Contract Review / Playbook Reviewer* (`contract-review-anthropic`, Apache-2.0): GREEN / YELLOW / RED severity classification.

**Artifacts reviewed:** `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `docs/SUBPROCESSORS.md`.

> ⚠️ **Not legal advice.** This is an engineering-side gap analysis. The children's-data and AI wording, the DPA artifact, ICO registration, and the SCC/IDTA claims must be reviewed and signed off by a qualified data-protection lawyer before go-live.

---

## Severity matrix

| # | Finding | Severity | Status after this PR |
|---|---------|----------|----------------------|
| 1 | Privacy §5 listed only 6 sub-processors vs 15 in the register — omitted Anthropic (minors' transcripts), Cloudinary, Twilio, Sentry, Upstash, Onfido, Vercel, IMAP, GitHub. UK GDPR Art 13/14 transparency + Art 28 failure. | 🔴 RED | **Fixed** — §5 now lists the full register with purpose + region + safeguard. |
| 2 | No children's-data section despite tutors teaching minors (UK Children's Code / Age Appropriate Design Code). | 🔴 RED | **Fixed (wording)** — new §10 added; requires lawyer sign-off. |
| 3 | No disclosure that AI (Anthropic) processes lesson transcripts, including minors'. | 🔴 RED | **Fixed (wording)** — new §11 added; requires lawyer sign-off. |
| 4 | No breach-notification clause (controller 72h ICO duty; processor "without undue delay" to controller). | 🟡 YELLOW | **Fixed** — new §12 added. |
| 5 | ICO registration shown as "pending"; registered entity is a placeholder. | 🟡 YELLOW | **Open — user action.** |
| 6 | SCC / IDTA / "Article 28 terms in place" claims asserted for all sub-processors but not evidenced. | 🟡 YELLOW | **Open — must verify each DPA, esp. Anthropic, before relying on the claim.** |
| 7 | Controller/processor split correctly stated; students' data handled as processor under Art 28. | 🟢 GREEN | No change needed. |

---

## Code-side changes made in this PR

`src/app/privacy/page.tsx`:
1. **§5 Sub-processors** — replaced the 6-item list with the full 15-entry register from `docs/SUBPROCESSORS.md`, each with purpose, region and transfer safeguard. Anthropic entry flags minors' transcripts and cross-refs §11.
2. **§6 International transfers** — broadened the named US sub-processor list.
3. **§10 Children's data** (new) — Children's Code alignment: no child accounts, no profiling of children, no advertising use, data-minimisation; tutor is controller and owns lawful basis / parental consent.
4. **§11 AI features** (new) — discloses transcripts → Anthropic for lesson notes and support triage; tutor-instructed and tutor-controlled sharing; not used to train third-party models; no automated decision-making; feature can be disabled.
5. **§12 Data breaches** (new) — controller ICO 72h duty; processor "without undue delay" notification to the tutor.
6. Version bumped 2.0 → 2.1.

---

## Remaining items — NOT code (owner / lawyer)

These block a clean go-live for minors' data and are outside engineering:

- [ ] **ICO registration** — complete registration; replace `[PLACEHOLDER: registered entity]` and the "pending" language with the real registered controller.
- [ ] **Anthropic DPA / SCCs** — execute (or confirm) a signed DPA + transfer safeguard with Anthropic covering minors' transcript processing. **Until confirmed, keep `AI_NOTES_ENABLED=false`** so no minor's transcript leaves to the AI sub-processor without a lawful transfer.
- [ ] **Verify every "SCCs / IDTA in place" claim** in §5 against the actual signed agreement per sub-processor; correct any that are not yet in place (zero-hallucination rule — do not assert a safeguard that is not signed).
- [ ] **Formal DPA artifact for tutors** — produce the Article 28 Data Processing Agreement the privacy page already references, for tutors to accept at sign-up.
- [ ] **Lawyer sign-off** — children's-data (§10) and AI (§11) wording reviewed by a DP lawyer before go-live. Children + AI is a hard-risk combination.
