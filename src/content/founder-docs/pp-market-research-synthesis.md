# Practice Portal — Market Research (Practice-Management Landscape)

> Companion to the pivot plan (therapist-portal-pivot.md) and its sibling docs
> (pp-business-plan.md, model-comparison.md). Where the original marketplace research
> (market-research-synthesis.md) sized the *demand* side — clients, insurance, expat corridors —
> this doc looks the other way: at the **therapist as buyer** and the **practice-management
> software** they already do (or don't) pay for. UK-first, mirroring the pivot's beachhead.
> **All market-sizing figures here are directional** and flagged `[PLACEHOLDER: verify]` — treat
> them as order-of-magnitude scaffolding, not facts, until validated against primary sources
> (professional-body membership reports, Companies House filings, vendor disclosures).
> Last updated: 26 June 2026

---

## 0. TL;DR — the market in five lines

1. **The buyer is reachable and the pain is real.** UK private-practice therapists number in the
   low-to-mid tens of thousands `[PLACEHOLDER: verify]`, are listed in public directories, and most
   stitch together 4–6 disconnected tools. This is a tractable B2B funnel, unlike the old B2C one.
2. **The incumbents are competent but heavy.** SimplePractice, Cliniko, Power Diary, Halaxy and
   WriteUpp own the category. They are feature-rich, clinically credible, and **subscription-only —
   none takes a commission on session fees.**
3. **The gap is at the bottom.** Solo and early-career therapists are over-served by feature breadth
   they don't need and over-charged for it. They want **simplicity, fast setup, and — quietly —
   help finding clients**. No incumbent leads with any of those.
4. **The pricing norm is the central tension.** Because the category is subscription-only with
   0% commission, a commission *on top* of a subscription reads as "paying twice." Faresay must
   resolve this structurally (free tier monetised by commission, 0% on paid tiers) — see §7.
5. **Why now: AI-native and platform fatigue.** Incumbents are retrofitting AI onto legacy
   admin-heavy products; a simplicity-first, AI-native tool with a fair ethos and *optional* demand
   (the client network) is a defensible wedge into the under-served bottom of the market.

---

## 1. Market size & shape (UK — directional, verify everything)

> **Sizing discipline.** Every number in this section is an estimate or a membership headline, not a
> measured market. The honest position is: *the order of magnitude supports a venture-scale niche,
> the precise figures do not yet exist in this doc.* Flagged accordingly.

**The buyer population — UK private-practice therapists & counsellors.**

| Figure | Directional value | Basis / caveat |
|---|---|---|
| BACP membership (largest UK body) | **~60,000+ members** `[PLACEHOLDER: verify]` | BACP is the largest professional body for counselling/psychotherapy; not all are in *private* practice |
| UKCP membership | **~11,000–13,000** `[PLACEHOLDER: verify]` | Psychotherapists/psychotherapeutic counsellors |
| NCS (National Counselling & Psychotherapy Society) | **~10,000+** `[PLACEHOLDER: verify]` | Overlaps with BACP/UKCP — do not simply sum |
| HCPC-registered practitioner psychologists | **~24,000** `[PLACEHOLDER: verify]` | Includes NHS/employed; private subset smaller |
| **Estimated UK therapists in private practice (the real SAM)** | **~25,000–40,000** `[PLACEHOLDER: verify]` | Derived, heavily caveated — membership overlaps, many work part-time or NHS-employed |
| Of those, the **solo / small-practice beachhead** | **a large majority** `[PLACEHOLDER: verify]` | Private practice in the UK is overwhelmingly sole-trader |

> **Operator note:** the single most load-bearing number for the whole plan — *how many UK
> therapists are in active private practice and would pay for software* — is the one we do not yet
> have to a reliable figure. Membership headlines double-count (a therapist can hold BACP **and**
> UKCP), and include NHS-employed, retired, and trainee members who are not buyers. Before any
> investor-facing TAM/SAM, commission a proper bottom-up count from directory listings + body
> membership reports + a survey of practice status. Until then, plan against the **range**, not a
> point estimate.

**Spend per therapist (the ARPU anchor).** Incumbent pricing (§3) implies a therapist already
spending — or willing to spend — **~£10–70/mo** on practice software, plus separate spend on video,
invoicing and scheduling tools they could consolidate. A consolidation pitch ("replace 4–6 tools
with one") is therefore an *expansion* of wallet share, not only a switch. `[PLACEHOLDER: verify
typical current tool spend per UK solo therapist]`.

**Rough TAM framing (illustrative only — do not cite).**
~30,000 private-practice therapists `[PLACEHOLDER: verify]` × ~£30/mo blended ARPU `[PLACEHOLDER:
verify]` ≈ **~£11m/yr** UK software TAM at the core subscription line alone, before commission and
add-ons. Small by consumer-internet standards, **healthy for a focused B2B SaaS**, and expandable
via add-ons (AI, accounting, client network) and later geographies. Treat as scaffolding.

---

## 2. The incumbent landscape — comparison

Five products define the UK-relevant practice-management category. All are mature, all are
credible, and the pattern is consistent: **subscription-only, feature-rich, no commission on
session fees, aimed broadly across allied-health rather than at solo therapists specifically.**

| Product | Pricing model | Commission on session fees? | Core strengths | Gaps / weaknesses | Who they serve |
|---|---|---|---|---|---|
| **SimplePractice** | Subscription, tiered **~£50–70/mo** `[PLACEHOLDER: verify UK pricing]` | **No** | Polished, big feature set (notes, telehealth, client portal, billing); strong brand; US-dominant | Pricey for solo; US-centric (insurance/CMS features irrelevant in UK); can feel heavy | Established therapists & group practices; US-first |
| **Cliniko** | Subscription, **from ~£35/mo**, scales by practitioner count `[PLACEHOLDER: verify]` | **No** | Clean, reliable, well-liked; strong scheduling/practice ops; good support; privacy-respecting ethos | Broad allied-health (physio/clinics) not therapy-specific; no native demand-gen; AI is nascent | Allied-health clinics & multi-practitioner practices |
| **Power Diary** | Subscription, **~£10–100/mo by practice size** `[PLACEHOLDER: verify]` | **No** | Affordable entry; good scheduling, SMS, templates; AU/UK presence | Dated UX in places; allied-health-generalist; limited AI; demand-gen not a focus | Solo → mid clinics across allied health |
| **Halaxy** | **Freemium** + per-transaction / payment-processing fees `[PLACEHOLDER: verify fee structure]` | **Partial — via payment/transaction fees, not a clinical-revenue cut** | Free entry tier lowers adoption friction; built-in payments/invoicing; global directory | Monetisation via transaction fees can feel opaque; UX complexity; support reputation mixed | Cost-sensitive solo practitioners; international |
| **WriteUpp** | Subscription, **~£25–35/mo** `[PLACEHOLDER: verify]` | **No** | UK-built and UK-focused; simple notes-first design; reasonable price | Smaller feature surface; less brand reach; limited AI/demand-gen | UK solo & small allied-health practices |

> **Operator note — the shape of the gap.** Read the table top-down and a pattern falls out:
> the strong products (SimplePractice, Cliniko) are **broad, clinical, and priced for established
> practices**; the cheap products (Power Diary, WriteUpp) compete on price/notes but are
> **generalist allied-health tools, not therapy-native, and weak on AI and demand**; the one
> freemium player (Halaxy) blurs its pricing through transaction fees. **Nobody owns "the
> radically simple, therapy-native, AI-native tool that also, optionally, helps a solo therapist
> find clients."** That sentence is the wedge.

**What none of them do (the collective gap):**
- **Lead with simplicity for the solo / early-career therapist.** They lead with feature breadth.
- **Help the therapist find clients.** Practice-management software manages a caseload you already
  have; it does not grow it. Faresay's repackaged marketplace (the client network add-on) is a
  category-distinct offer — see therapist-portal-pivot.md §5 Phase D.
- **Ship genuinely AI-native workflows.** AI is being bolted on, not built in.
- **Carry an explicit fairness ethos** ("we grow when you grow"). Pricing is transactional.

---

## 3. Pricing-model norms (the category convention Faresay must navigate)

The defining convention of this market: **subscription-only, flat or tiered by practice size /
practitioner count, with NO commission on the therapist's session fees.** The therapist's clinical
income is theirs; the vendor sells a tool, not a stake.

- **Subscription is universal.** Every major incumbent's core line is a monthly per-seat or
  per-practice fee (~£10–70/mo span across the category) `[PLACEHOLDER: verify]`.
- **Commission on session fees is essentially absent.** Incumbents explicitly do **not** take a cut
  of what the therapist charges their client. The closest exception is **Halaxy**, which monetises
  partly through **payment-processing / transaction fees** — and even that is framed as payment
  infrastructure, not a clinical-revenue share.
- **Freemium exists but is rare** (Halaxy). Most lead with a free trial, not a free tier.

> **The central tension for Faresay (carry this everywhere).** Faresay's preferred model
> (therapist-portal-pivot.md §4, Option A) layers **a small commission on top of a subscription**.
> Against a category norm of 0% commission, this invites the **"why am I paying twice?"** objection
> immediately. This is the single biggest pricing risk in the plan. It is resolvable, but only
> structurally — see §7. The objection is not "your price is high"; it is "your *model* is unusual
> for this category." Positioning has to neutralise that before features even enter the conversation.

---

## 4. The under-served segment (the beachhead, in market terms)

The pivot names the beachhead (therapist-portal-pivot.md §7). The market research confirms *why*
it is under-served rather than merely unserved:

**Who they are.** Solo and early-career UK therapists — newly qualified or going full-time,
BACP/UKCP/NCS registered, running a sole-trader practice from home or a rented room, with a small
but real caseload they manage by hand.

**Why incumbents under-serve them:**
- **Over-featured, over-priced.** The strong incumbents are built for established or multi-seat
  practices; a solo therapist with 10 clients pays for clinical/billing machinery they don't use.
- **Set-up friction.** Feature-rich tools have a real learning curve; an early-career therapist
  wants to be live this week, not after a configuration project.
- **No help with the actual problem.** The early-career therapist's binding constraint is often
  **not enough clients yet** — the one thing practice-management software pointedly does not
  address. Faresay's optional client network speaks directly to this.
- **Generic, not therapy-native.** Power Diary/Cliniko/Halaxy span all of allied health; the solo
  therapist gets a physio-shaped tool with therapy bolted on.

**Why this segment is winnable:**
- **Low switching cost at the bottom.** A therapist with a handful of clients and a spreadsheet has
  little to migrate (§5) — the switching-cost moat that protects incumbents at the top is thin here.
- **Price-sensitive → a £0 entry tier is disproportionately attractive** (and resolves the
  commission tension, §7).
- **Growth-aligned.** As the solo therapist's practice grows, they move up Faresay's tiers — the
  "we grow when you grow" ethos is a *commercial* model here, not just a slogan.

> **Operator note.** "Under-served" is stronger than "unserved." These therapists *can* buy
> SimplePractice or Cliniko today — they just get a tool mis-shaped for their size, priced for
> someone larger, that ignores their actual constraint (demand). That mismatch, not a vacant
> market, is the opening.

---

## 5. Buyer behaviour & switching costs

**How therapists buy software.** Low-frequency, trust-led, peer-influenced. Decisions are shaped by
**recommendations in professional communities** (BACP/UKCP networks, therapist Facebook/Slack/
Discord groups, r/therapists, clinical supervisors, training schools) far more than by paid ads.
The buyer is the user (sole trader), so the sale is personal, not procurement-led. This favours
Faresay's warm-first, community-led GTM (therapist-portal-pivot.md §7) over performance marketing.

**Switching costs — and why they cut both ways:**

| Switching cost | At the **top** (established practices) | At the **bottom** (the beachhead) |
|---|---|---|
| Data migration (client records, notes, history) | High — years of records, clinical notes, billing history | Low — a short client list, often a spreadsheet |
| Workflow re-learning | High — embedded daily habits | Low — habits not yet set |
| Client-facing disruption | High — established clients used to a portal | Low — few clients, or none yet |
| Emotional / risk aversion | High — "don't break what works" | Moderate — open to a better start |

- **The moat protects incumbents at the top, not the bottom.** This is precisely why the beachhead
  is the solo/early-career segment: the people with the least to migrate are the easiest to win.
- **Switching-cost reducers Faresay should ship** (already planned, therapist-portal-pivot.md §5):
  **CSV import**, **<15-minute onboarding**, **run-alongside-your-old-tools** at first, and
  white-glove setup for design partners. These directly attack the only real barrier at the bottom.
- **Retention is the actual game.** Because switching *in* is easy at the bottom, switching *out* is
  too — so the model lives or dies on retention and on the therapist's practice (and Faresay
  spend) growing with them. See pp-business-plan.md for the unit-economics treatment.

---

## 6. Why now

Two structural shifts make a new entrant viable against entrenched incumbents:

1. **AI-native is a genuine reset.** The incumbents are **retrofitting** AI assistants onto products
   architected a decade ago around manual admin. A tool built AI-first — drafting client emails,
   summarising sessions (therapist-supervised), chasing invoices, filling calendar gaps — can offer
   a categorically lighter workflow rather than a feature toggle. This is the differentiation line
   the incumbents structurally struggle to match quickly. (Add-on sequencing: therapist-portal-
   pivot.md §5 Phase C; governance constraints §9.)
2. **Platform fatigue & tool sprawl.** The target therapist juggles 4–6 disconnected tools
   (calendar, Zoom, bank transfer, spreadsheets, invoicing, notes). The appetite for **one simple
   thing that replaces the mess** is high and rising. Consolidation is the pitch; simplicity is the
   proof.

Supporting conditions: **Stripe Billing + Connect** make subscription + commission plumbing
commodity (Faresay already has ~80% of the Connect side built); **professional communities are
mature and reachable** as warm channels; and the **fair-ethos brand** that struggled to
differentiate in a crowded B2C market is a clean, ownable signal in a transactional B2B category.

> **Operator note.** "Why now" is not "AI is hot." It is specifically: *the incumbents' architecture
> makes simplicity + AI-native hard for them to copy fast, and the buyer's tool-sprawl pain is at a
> high.* Those two facts have a shelf life — the window is real but not indefinite.

---

## 7. Resolving the commission tension (the differentiation-enabling pricing call)

The category norm (§3) — subscription-only, 0% commission — is the constraint a differentiation
thesis has to survive. Two structural resolutions (from therapist-portal-pivot.md §4):

- **Free tier monetised by commission (Option A — recommended).** A **£0 entry tier** carries a
  small (~2–3%) commission on payments processed; **paid tiers buy the commission down toward 0%**
  plus features. The therapist who objects to commission simply pays the subscription and owes 0% —
  so the "paying twice" objection self-resolves *at their choice*. Meanwhile the free tier removes
  adoption friction for the price-sensitive beachhead (§4), and revenue scales with therapist
  success (the "we grow when you grow" ethos becomes the literal pricing mechanic).
- **Subscription-only, 0% commission (Option B).** Compete head-on on price/simplicity, matching the
  category convention exactly. Cleaner story, no objection to neutralise — but discards the Connect
  app-fee plumbing already built and caps upside.

> **The strategic read.** Option A turns the category's biggest objection *to* Faresay into a
> feature: commission is the price of *free*, and it disappears the moment you pay. That reframes
> "why pay twice?" into "pay nothing until you're earning, then buy the commission away." This is
> the pricing expression of the differentiation thesis, not a tax bolted onto it. Full pricing
> model and tier numbers live in pp-business-plan.md and the model-comparison.md trade-off.

---

## 8. The differentiation thesis

Against a competent, entrenched, subscription-only incumbent set, Faresay's wedge is **not** more
features. It is a different shape of product for a different (under-served) buyer:

1. **Radical simplicity — the product *is* the pitch.** "The therapy-practice platform that's
   actually simple." Live in under fifteen minutes; replace 4–6 tools; nothing the solo therapist
   doesn't need. Incumbents lead with breadth; Faresay leads with ease. (Simplicity is a canonical
   product promise, not a marketing line — therapist-portal-pivot.md §3–4.)
2. **AI-native, not AI-retrofitted (§6).** A lighter workflow the incumbents' architecture can't
   quickly match.
3. **Fair ethos as a real, ownable signal.** "Fair for therapists; we grow when you grow; no
   company should profit from human suffering" — credible in a category where pricing is purely
   transactional, and expressed *commercially* through the free-tier/commission model (§7).
4. **Optional demand — the category-distinct offer.** The client-finding network (the repackaged
   marketplace) gives Faresay something no practice-management incumbent has: a way to help the
   therapist **grow** their caseload, not just manage it. It addresses the early-career therapist's
   actual binding constraint and, as a by-product, re-accumulates the marketplace liquidity that was
   the original business's hardest asset to build.

**Positioning line (from the pivot):** *"The therapy-practice platform that's actually simple — with
an AI assistant, and a way to find new clients when you want them."*

> **Operator note — what would falsify this thesis.** The thesis breaks if (a) the beachhead's
> switching cost turns out higher than §5 assumes (sticky old tools), (b) an incumbent ships genuine
> AI-native simplicity before Faresay reaches scale, or (c) the commission tension (§3, §7) proves
> un-resolvable in practice and depresses conversion. Each is a thing to *test with design partners*
> (therapist-portal-pivot.md §12), not assume away. The market analysis says the opening is real;
> only paying therapists will say it's winnable.

---

## 9. Open questions / research needed before investor-facing use

- `[RESEARCH NEEDED]` **Bottom-up count of UK therapists in active private practice** — the real
  SAM — de-duplicated across BACP/UKCP/NCS/HCPC and filtered to private (not NHS/retired/trainee).
  This is the most important missing number (§1).
- `[RESEARCH NEEDED]` **Current per-therapist software spend** (practice-mgmt + video + invoicing +
  scheduling) to size the consolidation/wallet-share opportunity (§1).
- `[RESEARCH NEEDED + verify]` **Exact, current UK pricing** for each incumbent in the §2 table —
  several figures are directional and must be checked against live vendor pricing.
- `[RESEARCH NEEDED]` **Halaxy's actual fee structure** — is the transaction fee a true exception to
  the "no commission" norm, or payment-processing pass-through? Material to the §3/§7 tension.
- `[RESEARCH NEEDED]` **Design-partner validation** of the commission-tension resolution (§7) and
  the switching-cost assumptions (§5) — qualitative, from real therapists, not desk research.
- `[RESEARCH NEEDED]` **AI-roadmap scan of incumbents** — how far along are SimplePractice/Cliniko
  on AI? The "why now" window (§6) depends on the answer.

> **Discipline reminder.** Every £-figure and population number in this doc is an estimate flagged
> for verification. The structural analysis (incumbent shape, the under-served bottom, the
> commission tension, the differentiation thesis) is robust and does not depend on the precise
> numbers; the **sizing** does, and must be firmed from primary sources before it goes in front of
> anyone making a funding decision.

## Cross-references
- **therapist-portal-pivot.md** — the strategy source of truth (model, beachhead, pricing options,
  roadmap, legal).
- **pp-business-plan.md** — full pricing model, tiers, and unit economics.
- **model-comparison.md** — Option A vs Option B (and old vs new model) trade-off in detail.
- **market-research-synthesis.md** — the original (demand-side / marketplace) market research this
  doc complements.
