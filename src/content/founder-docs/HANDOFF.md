# Faresay — Session Handoff & Status

> Snapshot for resuming in a fresh session without losing context. Date: 2026-06-24.
> Everything below lives in this repo (`JoelMHarvey/GitHub.io`) on branch
> **`claude/faresay-legal-authority-agent-f40w90`** (PR #1, open — Joel to merge).
> To resume: open this file + the skill at `.claude/skills/faresay-legal-authority/`.

---

## 1. What Faresay is (the brief)
- **Faresay** — therapy / mental-health marketplace. **UK today → expanding to the US (all 50
  states + DC).** Connects clients with licensed mental-health professionals.
- **Model:** **cash-pay / out-of-network** (BetterHelp/Talkspace-style), **15% platform fee**.
- **Posture:** **bootstrapped**, internal operating focus (no near-term raise).
- **Goal of the work:** obtain full legal authority to operate Faresay in every US state, and
  build the supporting documents — with **Joel approving every outbound action and every cost**.
- **Faresay product repo:** `JoelMHarvey/faresay` (TypeScript, private) — **not yet accessible to
  the session** (see Open Items).

## 2. Two big workstreams built

### A. The Claude skill — `.claude/skills/faresay-legal-authority/`
An agent playbook to pursue US legal authority and handle correspondence. Hard rules:
**(1) approve-everything gate, (2) the agent cannot send (Gmail tools are read/draft/label only),
(3) spend nothing silently.** Files:
- `SKILL.md` — playbook, session loop, brand rule (letterhead).
- `references/brief.md` — the mandate + recorded decisions (cash-pay; mailbox; etc.).
- `references/legal-roadmap.md` — US therapy-marketplace legal landscape (CPOM/fee-splitting,
  MSO/friendly-PC, licensing compacts, HIPAA + state privacy, 50-state foreign qualification) and
  a phased plan.
- `references/approval-protocol.md` — the content/request/cost/risk + APPROVE/REJECT format and
  the `faresay/*` Gmail label scheme.
- `references/email-setup.md` — the (now complete) email infra.
- `references/contact-targets.md` — who to contact and in what order.
- `assets/counsel-shortlist.md` — researched firms + chosen 3 + confirmed intake routes.
- `assets/state-tracker.csv` (50 + DC), `assets/decisions-log.md` (running log),
  `assets/templates/` (email + approval templates, `email-letterhead.html`).

### B. Business documents — `faresay/docs/`
Review-ready drafts (legal/clinical ones watermarked & flagged for professional sign-off):
- `CONTEXT.md` (shared fact sheet — keep all docs consistent with this)
- `business-plan.md` · `market-research-synthesis.md` · `business-model-canvas.md`
- `product-requirements-document.md` · `risk-register.md` (28 risks)
- `financial-model.md` + **`financial-model.csv`** (live scenario calculator)
- `terms-of-service.md` ⚠️counsel · `privacy-policy.md` ⚠️counsel ·
  `therapist-agreement.md` ⚠️counsel · `security-data-protection-policy.md` ⚠️counsel/security
- `clinical-governance-policy.md` ⚠️clinical · `crisis-safeguarding-policy.md` ⚠️clinical
- `README.md` (index)

## 3. Email infrastructure — LIVE
- **Receiving:** Cloudflare Email Routing forwards `legal@faresay.com` + `enquiries@faresay.com`
  → **`totallycosmicturtle@gmail.com`** (confirmed working).
- **Sending-as `legal@faresay.com`:** via **Resend** SMTP relay; Gmail "Send mail as" **confirmed**.
- **Agent mailbox:** `totallycosmicturtle@gmail.com` connected to the Gmail tools (read/draft/label
  — **cannot send**; Joel sends manually).
- **Labels:** 7 created — `faresay/inbound-new, pending-approval, approved, sent, rejected,
  awaiting-reply, needs-joel`.
- **Letterhead:** `assets/templates/email-letterhead.html` — dark teal (`#15514e`) "Faresay" text
  on white + teal (`#1F6F6B`) underline (fixed an earlier white-on-white issue). Logo slot ready
  for the real favicon (`cid:faresay-logo`) once the asset is available.

## 4. Counsel outreach (Phase 1) — prepared, awaiting Joel
Chosen 3 firms (from a researched shortlist of 5):
1. **Epstein Becker Green** — Amy Lerman (`alerman@ebglaw.com`), lead author of the Telemental
   Health Laws survey. **Email drafted on letterhead and sitting in Drafts.**
2. **Nixon Gwilt Law** — web "Get Started" form (`nixongwiltlaw.com/get-started`). Paste-text ready.
3. **Cohen Healthcare Law Group** — contact form / (310) 844-3173. **Likely charges for the initial
   consult — ask the fee first.** Paste-text ready.

> ⚠️ **Drafts note:** there are **two** EBG drafts in the mailbox. Use the **newer** one (visible
> dark header); **delete** the older white-on-white one (the Gmail tools can't delete drafts).

## 5. Key strategic findings (from research)
- **Market:** US mental-health treatment market **~$118B (2025) → ~$159B (2030)**; **59.2M US adults
  (23%) in treatment** (SAMHSA 2023); **HRSA: demand +49% by 2033 vs supply +11%**, 137M in
  shortage areas. (Some market-size point figures were unreliable — refresh before investor use.)
- **Demand-constrained, not supply-constrained** — the scarce/expensive side is **clients**, not
  therapists → GTM weights to client acquisition + retention.
- **Insurance shift:** US demand concentrating in-network (Headway/Alma/Grow; Talkspace **and**
  BetterHelp both adding insurance). Cash-pay is the smaller/higher-CAC slice → chosen as a
  deliberate **beachhead**, with **insurance-enablement kept open as a Phase-2 option**.
- **The 15% is tight:** at a $130 cash-pay session, 15% ≈ $19.50 (~$15.40 after processing); over
  8 sessions ≈ $113 LTV → **CAC must stay under ~$38** for a 3:1 ratio. ⇒ low/organic CAC or higher
  sessions-per-client are essential. (CMS CY2025: 90837≈$117, 90834≈$79; cash-pay $100–200.)

## 6. The 3 items most needing professional sign-off
1. **15%-fee characterisation + MSO/PC structure** (CPOM / fee-splitting) — the load-bearing call.
2. **HIPAA covered-entity vs business-associate + controller/processor roles** — drives Privacy /
   Security / Therapist Agreement.
3. **Clinical screening/exclusion thresholds + duty-to-warn / mandatory-reporting matrix** (state-
   by-state) — drives Clinical Governance + Crisis/Safeguarding.

---

## 7. OPEN ITEMS / YET TO DO

### Joel's actions
- [ ] **Approve + send the EBG email** (open the newer Drafts item; **set From → `legal@faresay.com`**).
- [ ] **Delete the old duplicate** white-on-white EBG draft.
- [ ] **Submit the Nixon Gwilt & Cohen forms** (ask Cohen's consult fee before booking).
- [ ] **Provide the Faresay logo/favicon** so it can be embedded in the letterhead — either:
      grant the session access to `JoelMHarvey/faresay`, **or** commit the PNG into this repo
      (e.g. `faresay/docs/assets/faresay-logo.png`), **or** share a public URL / attach it.
      (Brand: teal `#1F6F6B`; lowercase serif "faresay" wordmark; circle mark with white arch.)
- [ ] **Grant `JoelMHarvey/faresay` repo access** for future product work: GitHub App repo access +
      add it as a source repo for the environment, then **start a fresh session** (scope is fixed at
      session start; the add-repo tool was NOT available in this session).
- [ ] **Merge PR #1** when ready.

### Agent's next actions (once unblocked)
- [ ] When counsel **replies arrive**, triage into `faresay/*` labels and bring a scope/fee
      comparison for approval. (Cannot auto-watch the inbox — Joel must ping when mail lands.)
- [ ] **Embed the real logo** in the letterhead + regenerate the EBG draft, once the asset is available.
- [ ] **Financial model:** swap in Faresay's **actual UK numbers**; optional cohort-retention accounting.
- [ ] **Business plan:** refresh hard market-size numbers from primary sources before any investor use.
- [ ] **Legal/clinical docs:** route the watermarked drafts to retained counsel + a clinical advisor.
- [ ] **Legal roadmap Phases 2–5:** entity formation (MSO/PC) → compliance foundations → 50-state
      qualification (registered agent) → ongoing compliance. (See `references/legal-roadmap.md`.)

## 8. How to resume in a fresh session
1. Ensure the session can access **`JoelMHarvey/GitHub.io`** (this repo) and ideally
   **`JoelMHarvey/faresay`**, on branch `claude/faresay-legal-authority-agent-f40w90`.
2. Ensure the **Gmail connector points at `totallycosmicturtle@gmail.com`**.
3. Tell the agent: *"Resume the Faresay legal-authority work — read
   `faresay/docs/HANDOFF.md` and `.claude/skills/faresay-legal-authority/`."*
4. The running log is `.claude/skills/faresay-legal-authority/assets/decisions-log.md`.
