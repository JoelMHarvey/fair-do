# Practice Portal — UK Legal Brief & Questions (for tonight)

> **Read this before the lawyer meeting.** The model has pivoted from a **B2C care marketplace** to a
> **B2B SaaS practice portal** (`model-comparison.md`). That changes Faresay's legal role
> fundamentally, so the questions to ask counsel change too. This **supersedes** the marketplace brief
> (`uk-legal-regulatory-brief.md`) for the current direction — bring both: the marketplace one stays
> relevant for the *future* "find clients" add-on. Preparatory material, not legal advice.
> Last updated: 26 June 2026

---

## The one change that reframes the whole conversation
**Marketplace:** Faresay arranged care, owned the client, was the **data controller**, and carried
care-intermediary + crisis liability close to home.

**Practice portal:** Faresay sells **software** to therapists. The **therapist owns the client and the
clinical record and is the data controller**; **Faresay is a data processor** acting on the
therapist's instructions. Clinical and crisis responsibility sit with the therapist. Faresay is a
tool, one step removed from care.

Almost every legal question below flows from that single shift. **Lead the meeting with it.**

## Priority questions for counsel (tonight)

1. **Role confirmation.** Confirm Faresay is a **processor** of therapists' client data and the
   therapist is the **controller**. Where does Faresay remain a **controller** in its own right
   (therapist account data, billing, product analytics)? Get the dual role mapped cleanly.

2. **DPA with every therapist (the central instrument).** We need an **Article 28 Data Processing
   Agreement** signed with each therapist before real client data is processed. Ask counsel to
   produce/review a **standard DPA template** covering: documented-instructions only, confidentiality,
   **Art 32 security**, **sub-processor flow-down** (Clerk, Daily.co, Resend, Neon), **international
   transfers** (IDTA/SCCs for any non-UK leg), **breach notification to the controller**, assistance
   with DSARs/DPIAs, and deletion/return on termination.

3. **The "managed / accountless client" feature.** Therapists can add clients who never log in, and
   the therapist asserts consent on their behalf. Confirm this is lawful as **processor acting on the
   controller's documented instruction**, and that the DPA + the therapist's own lawful basis cover it.

4. **Contracts — what replaces what.** The primary contract becomes a **B2B SaaS subscription
   agreement** with the therapist (replacing the marketplace **therapist/contractor agreement**). Does
   Faresay still need any **client-facing terms**, given the client now contracts with the *therapist*,
   not Faresay? What minimal platform notice does the end-client need?

5. **Liability shift + residual platform duties.** Clinical care, duty of care, crisis and
   safeguarding move to the **therapist** (controller/provider). What **residual obligations** stay
   with Faresay as the tool — crisis signposting in the UI, what to do if the platform *itself*
   surfaces risk, acceptable-use/abuse, and the **limitation-of-liability** wording for SaaS terms?

6. **CQC / regulated activity.** As a **pure software tool** (not arranging or providing care), confirm
   Faresay is **outside CQC registration** — and what facts would tip it back in (e.g. the marketplace
   add-on, or doing anything clinical).

7. **Payments / fee characterisation.** Revenue = **subscription (SaaS)** + a **small commission** on
   client→therapist payments via Stripe Connect (therapist sets the price and owns the client). Is the
   commission clean now (vs the marketplace fee-split concern), or does it still need careful
   characterisation? Any issue charging both a subscription and a commission ("pay twice")?

8. **Cross-border — does the portal dissolve the problem?** This was the marketplace's biggest blocker
   (a UK therapist treating a client physically abroad). Under the portal, the **therapist** decides
   whom they can lawfully treat and where — it's **their** licensure question, not Faresay's, because
   Faresay is just the tool. **Confirm** Faresay-as-software isn't liable for where a therapist's client
   sits, and what (if any) terms put that responsibility squarely on the therapist.

9. **The future marketplace add-on (gate it).** When we later switch on "find clients" matching, Faresay
   re-enters **intermediary/controller** territory **for those introductions only**. Confirm we can run
   the portal as **processor-only now** and treat the add-on as a **separate, later legal workstream**.

10. **B2B vs consumer + housekeeping.** Customer is now a therapist (business/sole trader) → largely
    **B2B**, lighter consumer-law exposure on the core sale (confirm). Plus: **ICO registration**, the
    **DPO trigger** (large-scale special-category processing, even as processor), and **ASA/advertising**
    for the new B2B claims and any "verified therapist" / efficacy language.

## What's deferred or changed from the marketplace brief
- **Per-corridor cross-border licensure** → becomes the **therapist's** responsibility under the portal
  (revisit only for the marketplace add-on).
- **Care-intermediary / controller crisis liability** → **shifts to the therapist**.
- **Therapist employment / worker status** → far less central (the therapist is now a *customer*, not
  supply Faresay directs). Revisit only if/when marketplace supply recruitment restarts.
- **Consumer-contract / 14-day cancellation mechanics** → recedes (B2B sale), but the therapist's own
  clients remain consumers — the therapist's responsibility.

## Still relevant, unchanged
- The **high security bar** for special-category data (Art 32) — non-negotiable either model.
- **UK GDPR + DPA 2018 + ICO.**
- **Data residency** (EU/UK) and the US sub-processors (Clerk/Daily/Resend) needing transfer mechanisms.

## Bring to the meeting
- `model-comparison.md` (so counsel sees the pivot and the hybrid plan).
- This brief + `uk-legal-regulatory-brief.md` (for the add-on/future).
- The **single ask to walk out with:** *a DPA template we can sign with design-partner therapists*, so
  the validation pilot (`pp-validation-plan.md`) can process real client data lawfully.

## Linked documents
- `model-comparison.md` · `therapist-portal-pivot.md` · `pp-validation-plan.md` ·
  `uk-legal-regulatory-brief.md` (marketplace/future) · `pp-risk-register.md`
