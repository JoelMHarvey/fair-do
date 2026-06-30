# fair-do Scale & Expansion

> fair-do Ltd trading as fair-do.com — internal strategy document  
> Date: June 2026

---

## UK Market Opportunity

### Total Market Size

The UK private tutoring market is one of the largest and fastest-growing in Europe. Conservative bottom-up estimates place the school-subject tutoring market at approximately £2 billion per year, based on roughly 2.5 million active tutees spending an average of £800 per year. Broader mid-range estimates from market research firms place the total UK private tutoring market (including languages, music, and skills) at approximately £3.9 billion in 2024, growing at a compound annual growth rate of 9.9% through 2033.

The online tutoring segment — fair-do's immediate addressable market — generated approximately £447 million in 2024 and is forecast to reach £884 million by 2030, growing at a CAGR of 11.8–16.8%. This is the fastest-growing segment within UK education services.

### Structural tailwinds

Three structural events in 2024–2026 have materially expanded the addressable market for a new entrant:

**1. 20% VAT on private school fees (January 2025).** The government's application of VAT to independent school fees pushed average annual costs from £15,000–£20,000 to £18,000–£24,000 for day pupils. The government forecast approximately 37,000 pupil departures; premium tutoring agencies reported a 3x surge in enquiries from August 2025 onwards. Many families substituting private school for state school are directing a portion of saved fees into intensive private tuition — creating a high-value, highly motivated new client cohort.

**2. National Tutoring Programme wind-down (2024).** The NTP's closure removed state-subsidised catch-up tuition from schools, shifting demand to the private market. Parents who previously relied on school-provided sessions must now source and fund tuition independently.

**3. First Tutors closure (May 2026).** First Tutors was a major UK tutoring directory operating for 19 years. Its closure fragmented supply, displacing an estimated tens of thousands of listed tutors actively seeking alternative platforms. This is a live, time-limited acquisition opportunity for fair-do.

### fair-do's addressable market

At 90% tutor retention on a 10% platform fee, fair-do's revenue per pound of gross tutoring value transacted is structurally lower than commission-heavy competitors — but this is intentional. The competitive advantage is in volume capture, not margin extraction. The model requires a larger share of a market where fair pricing is the acquisition mechanism.

At £35–40/hr average session rates, 20 hours per month per active tutor, a platform of 1,000 active tutors would generate approximately £8.4–9.6 million in gross session value annually. At 10% commission, that is £840,000–£960,000 in platform fee revenue before subscriptions and parent portal ARR. The maths scales cleanly.

**Scenario modelling — platform fee revenue at scale:**

| Active tutors | Avg hours/mo | Avg rate | Annual GTV | Platform fee (10%) |
|---|---|---|---|---|
| 100 | 15 | £37 | £666,000 | £66,600 |
| 500 | 18 | £38 | £4,104,000 | £410,400 |
| 1,000 | 20 | £40 | £9,600,000 | £960,000 |
| 5,000 | 20 | £42 | £50,400,000 | £5,040,000 |

Subscriptions (Pro at £15/mo, Studio at £45/mo) and parent portal (£4.99/mo) compound materially on top of this at scale.

---

## Phase 1: 0–100 Tutors (Months 1–6)

### Strategic objective

Prove the model. Establish that tutors choose fair-do because it genuinely pays better and saves admin time, and that students book through it. Reach 100 active tutors and a minimum of 300 booked sessions per month before month six.

### Focus areas

**Tutor supply first.** The marketplace dynamic means no students book if there are no tutors; no tutors list if there are no students. Resolve this by onboarding tutors ahead of demand, using the commission-rate story as the acquisition hook. Target displaced First Tutors users and tutors currently paying 40–50% to MyTutor. The message: "You earn £40/hr. On MyTutor you keep £20–24. On fair-do you keep £36. Same session, same work."

**Handpick early cohort.** Aim for subject diversity and geographic spread across the UK (Maths, English, Sciences, French/Spanish for GCSE/A-level; tutors in London, Manchester, Birmingham, Edinburgh). Quality signal matters more than volume in this phase.

**Free tier as on-ramp.** The Free tier (up to 8 students) allows tutors to try fair-do with zero upfront cost and no friction. This is the right acquisition mechanic at this stage. Upgrade conversion to Pro or Studio should be a secondary KPI, not a primary pressure.

**Zero-to-one student acquisition.** Support tutors in getting their first fair-do student by: (a) SEO-optimised tutor profile pages indexed by Google; (b) direct outreach to parent Facebook groups and Mumsnet tutoring threads; (c) encouraging tutors to bring their existing clients onto the platform for scheduling and payment benefits.

### Phase 1 KPIs

| KPI | Target (Month 6) |
|---|---|
| Listed tutors | 100 |
| Active tutors (≥1 session in last 30 days) | 60 |
| Booked sessions/month | 300 |
| Free-to-Pro/Studio conversion rate | 15% |
| Tutor NPS | ≥55 |
| Parent portal subscribers | 100 |
| Session completion rate | ≥90% |
| Average tutor profile completeness | ≥85% |

### Infrastructure at this scale

At 100 tutors and 300 sessions per month, infrastructure is minimal. A Neon (PostgreSQL) database on a starter tier handles the data volume comfortably. Clerk handles authentication at negligible cost. Daily.co video infrastructure at 300 sessions/month is approximately $150–$300/month at standard per-participant-minute pricing. Stripe processes payments; no custom payment infrastructure needed. Total third-party infrastructure cost at this scale: under £1,000/month.

Support load at 100 tutors is manageable by the founding team. No dedicated support headcount required in Phase 1.

### Phase 1 revenue projection

| Revenue stream | Monthly (Month 6) |
|---|---|
| Platform fee (300 sessions × £37 avg × 10%) | £1,110 |
| Tutor subscriptions (15 Pro × £15 + 3 Studio × £45) | £360 |
| Parent portal (100 × £4.99) | £499 |
| **Total MRR** | **~£1,969** |

Phase 1 is pre-profitability by design. The objective is evidence of product-market fit, not revenue. A 10% platform fee at this scale covers less than infrastructure costs. The investment is in proof-of-concept and tutor satisfaction.

---

## Phase 2: 100–1,000 Tutors (Months 6–18)

### Strategic objective

Build growth loops that reduce the marginal cost of acquiring each subsequent tutor and student. Reach 1,000 active tutors, 3,000+ sessions per month, and initial profitability on an operating basis before month 18.

### Tutor growth loops

**Referral scheme.** Tutors who refer a colleague receive one month of their current subscription tier free when the referred tutor completes their first five paid sessions. A tutor with a strong peer network (common in teaching circles, university graduate communities, subject-specialist forums) can generate three to five referrals within weeks of joining. Target referral activation rate: 20% of active tutors generate at least one accepted referral.

**Community seeding.** Teachers and tutors congregate in specific online communities: The TES forums, NQT (now ECT) Facebook groups, subject-specific professional networks (e.g., MEI for maths teachers, NATE for English teachers), the Tutors' Association. Build fair-do presence in these communities through genuine participation, not spam. The fair-trade story is inherently shareable and generates organic discussion.

**Tutor-led client acquisition.** As fair-do builds a genuine reputation among tutors as a platform that pays fairly, tutors promote it to their own prospective students. This turns the tutor base into a distributed sales force. Provide tutors with a shareable booking link, a personal landing page, and a referral code for students.

**September surge capture.** September is the highest-volume month for new student acquisition. By Phase 2, fair-do must have full discovery infrastructure live: postcode-based search, subject filters, level filters, price range filters, DBS-verified badge, and review display. Tutors who cannot be easily found in September miss a disproportionate share of annual revenue.

### Student growth tactics

**SEO at scale.** Each tutor profile is an indexable page. 1,000 tutors means 1,000 pages capturing long-tail searches: "GCSE Maths tutor Manchester", "A-level Chemistry tutor online", "11-plus tutor London". Ensure schema markup, tutor bio depth, and subject keyword coverage are optimised. This compounds over time with zero marginal cost per click.

**Parent portal as standalone funnel.** The parent portal (£4.99/month) gives parents a dashboard to manage tutor relationships, track session history, and receive progress reports. Market this directly to parents via Mumsnet, parenting blogs, and targeted Facebook/Instagram ads. The portal is a low-friction entry point that feeds booking demand to tutors on the platform.

**Review and trust infrastructure.** Deploy DBS-verified badge (enabled by the January 2026 regulatory change allowing self-employed individuals to obtain Enhanced DBS checks directly), verified review system, and session-count display on tutor profiles. These are the primary trust signals that convert a browsing parent into a first booking.

**First paid acquisition experiments.** Test Google Ads targeting "online tutor UK", "GCSE tutor near me", "find a tutor" at modest budget (£500–£1,000/month trial). Measure cost-per-tutor-registration and cost-per-first-booking. If CPA is within acceptable range, scale; if not, hold and focus on organic/referral channels.

### Phase 2 KPIs

| KPI | Target (Month 18) |
|---|---|
| Listed tutors | 1,000 |
| Active tutors (≥1 session in last 30 days) | 600 |
| Sessions/month | 3,000 |
| Tutor referral activation rate | 20% |
| Free-to-Pro/Studio conversion rate | 22% |
| Parent portal subscribers | 1,500 |
| Tutor NPS | ≥60 |
| Parent NPS | ≥50 |
| Monthly operating profitability | Achieved by month 15 |

### Phase 2 revenue projection (Month 18)

| Revenue stream | Monthly |
|---|---|
| Platform fee (3,000 sessions × £38 avg × 10%) | £11,400 |
| Tutor subscriptions (180 Pro × £15 + 60 Studio × £45) | £5,400 |
| Parent portal (1,500 × £4.99) | £7,485 |
| **Total MRR** | **~£24,285** |
| **ARR run-rate** | **~£291,420** |

---

## Phase 3: 1,000+ Tutors and B2B (Year 2+)

### Strategic objective

Diversify revenue beyond individual tutor commissions and subscriptions. Add institutional channels that provide predictable, high-value contract revenue and expand the platform's legitimacy with parents and schools.

---

### B2B: Schools and Learning Centres

**The opportunity.** UK secondary schools and academy trusts allocate budget to tuition support, particularly for disadvantaged pupils. The Pupil Premium grant (£1,480 per qualifying pupil in 2025/26) is specifically designated for interventions including tutoring. Schools that previously relied on the National Tutoring Programme now have no centrally-approved channel; they must source and vet tutors independently or via their own networks.

fair-do can position as the school-preferred tutoring infrastructure layer: a vetted pool of DBS-checked tutors, transparent pricing, session records the school can access, and payment infrastructure that satisfies procurement requirements.

**Product: School Partnership Licence.** A per-school annual subscription giving designated staff access to a curated tutor pool, usage dashboard, session reports, and Pupil Premium-eligible invoicing. Pilot pricing: £500–£1,500 per year per school depending on size, plus standard platform fees on booked sessions. A multi-school MAT (Multi-Academy Trust) licence at £3,000–£8,000 per trust.

**The NTP gap.** The National Tutoring Programme ended in 2024. Tutors who were NTP-approved are now active in the private market and frequently note the loss of a structured institutional referral channel. fair-do does not need to become an NTP accredited provider to serve this gap — it needs to be the platform schools trust when they need to recommend a tutor to a parent.

**Tutoring hubs and learning centres.** Private tutoring centres (Explore Learning, Kip McGrath, independents) have their own admin pain. A white-label or API version of fair-do's booking and payment layer could serve these as a B2B SaaS product. Timeline: Phase 3 only; requires separate product track.

**Go-to-market.** Direct outreach to heads of year, SENDCOs (Special Educational Needs and Disabilities Coordinators), and school business managers in target areas. Partner with local authority pupil referral unit networks. Attend BETT and other UK education sector conferences from Year 2.

---

### B2B: Corporate and Adult Learning

**The opportunity.** UK employers spent approximately £6.6 billion on workplace learning and development in 2024. Language tuition, professional exam preparation (CIMA, ACCA, CFA, CIPD, PRINCE2), coding literacy, and communication skills are recurring L&D line items. Most of this spend goes through training companies, not individual tutors — because procurement departments need invoices, compliance records, and a single point of contact.

fair-do can serve as that aggregator for the independent tutor market, enabling tutors who currently cannot access corporate clients (no procurement capability, no business invoicing, no NDAs) to do so through the platform.

**Product: Corporate L&D Portal.** Employer dashboard enabling a company to: search fair-do's tutor pool by skill (CIMA exam prep, business French, Python, data literacy), book and pay centrally, receive attendance records and progress reports, and generate receipts for expense reimbursement or benefit-in-kind reporting. Price: platform fee (10%) on sessions booked, plus an optional admin subscription at £99–£299/month for enhanced reporting and account management.

**Target clients.** Professional services firms (law, accountancy, consulting) funding trainees' professional exam tuition. Financial services firms with language tuition budgets. Tech companies funding coding upskilling. SMEs with small L&D budgets who want flexibility without training company minimum commitments.

**Timeline.** Year 2 product track. Requires: company account type in the data model, group billing, VAT invoicing (B2B sessions are between VAT-registered entities), and a tutor-facing professional skills category expansion.

---

### B2B: Sixth Forms and Further Education

**The opportunity.** Sixth form colleges and FE colleges are under-resourced for small-group and individual tuition support, particularly for resit students (GCSE English and Maths resits are a statutory requirement for students who did not achieve a grade 4) and students with SEND.

**Product: FE Tuition Partnership.** Similar structure to the school partnership licence but calibrated for FE procurement and funding rules. Colleges can fund tuition through the Adult Education Budget (AEB) or 16–19 Bursary Fund. fair-do would need to understand the specific funding compliance requirements for each stream.

**Timeline.** Year 2–3. Lower priority than school partnerships and corporate L&D due to more complex funding compliance; however, the resit market (approximately 40% of 16–18 year olds in FE requiring English and/or Maths tuition) is large enough to warrant a dedicated product track.

---

## Subject and Niche Expansion

### Phase 1: Core academic (GCSE and A-level)

Launch with the subjects that generate the highest search volume and clearest parental demand: Mathematics, English Language and Literature, Biology, Chemistry, Physics, French, Spanish. These cover the majority of GCSE and A-level examination cohorts and represent the clearest product-market fit for fair-do's commission story (tutors in these subjects typically charge £35–55/hr, making the £/hour saving from 10% vs 40% commission immediately visible).

Secondary Phase 1 subject: 11-plus and 13-plus entrance exam preparation. This is a high-anxiety, high-willingness-to-pay segment; parents in this cohort are often seeking tutors 12–18 months before the exam date, creating long client relationships and high LTV.

### Phase 2: Creative and skills subjects

Add Musical instruments (piano, guitar, violin — large established demand, often overlooked by academic-focused platforms), Art and Design (GCSE/A-level portfolio prep), Coding for children (Scratch, Python, Swift — growing rapidly, strong parent interest driven by digital careers narrative), Drama, and Photography.

Also add: Oxbridge and Ivy League preparation (admissions interviews, personal statement coaching, super-curricular reading). This is a premium niche — tutors charge £60–£150/hr — where the absolute savings from 10% vs 40% commission are highest.

### Phase 3: University and professional qualifications

University-level subject tuition (mathematics, economics, law, sciences), dissertation and essay coaching, and professional qualification preparation (ACCA, CIMA, CFA, LNAT, BMAT, UCAT). These segments have higher average session rates (£50–£100+/hr) and tend to be self-paying adults or employers — different acquisition channels and willingness-to-pay dynamics.

---

## Geographic Expansion

### UK-first strategy

The UK market is the right initial focus for structural reasons beyond just market size. The DBS check system, UK curriculum (GCSE, A-level, Highers, International Baccalaureate in UK context), UK banking and Stripe entity, GDPR and UK GDPR compliance, and cultural familiarity with tutoring as a professional service all give fair-do natural advantages in this market that would require rebuilding from scratch internationally.

Within the UK, prioritise England first (largest population, standardised GCSE/A-level curriculum, highest tutoring spend), then Scotland (Highers curriculum; smaller market but coherent), Wales, and Northern Ireland in parallel once the platform is stable.

### Geographic sequencing within England

London and South East first: highest tutor density, highest session rates (London premium of £10–20/hr), highest parent spend, highest competition from existing platforms. Winning here validates the model against the strongest incumbents.

Northern cities second (Manchester, Leeds, Sheffield, Liverpool, Birmingham): substantial tutor supply from large university populations; lower average rates but strong demand and less incumbent competition than London. Faster community-building potential through regional teacher networks.

### International expansion path

International expansion is a Year 3+ consideration. Three markets are most analogous to the UK:

**Australia.** Similar tutoring culture, English-speaking, comparable regulatory environment, growing market. Australian curriculum (ATAR, VCE, HSC) differs by state, requiring curriculum-specific tutor categorisation. A-level tutors are not directly transferable. Requires: separate Stripe entity (AUD), Australian ABN/GST compliance, Working With Children checks (state-by-state equivalent to DBS). Smaller total market than UK (~£500M equivalent); manageable expansion risk.

**Canada.** English-speaking in most provinces; similar private tutoring culture. Curriculum varies by province (Ontario, BC, Quebec). Provincial regulation of education. Market size comparable to Australia. Timezone overlap with UK Eastern time is manageable for async platform operations. Challenges: French-language requirement in Quebec, fragmented provincial curriculum.

**United States.** The largest English-speaking tutoring market globally (estimated $10–15 billion), growing rapidly post-pandemic. However, the market is structurally different: tutor supply is fragmented across states, regulation varies significantly, tax reporting (1099 filing, state withholding) is complex, and incumbents (Wyzant, Varsity Tutors, Chegg Tutors, TutorMe) are well-capitalised. The fair-trade/fair-commission message translates, but the trust and compliance infrastructure would need significant rebuild. High reward, high risk. Year 4+ at earliest.

**Key international challenges:** Each jurisdiction requires: equivalent of DBS checks (Working With Children checks, fingerprinting, background check providers), local currency and tax entity, curriculum knowledge to categorise tutors accurately, local payment rails (not all Stripe products available in all markets), and timezone coverage for live support.

---

## Infrastructure Scaling

| Metric | 0–100 tutors | 100–1,000 tutors | 1,000–10,000 tutors |
|---|---|---|---|
| **Video (Daily.co)** | ~300 sessions/mo; ~$150–300/mo | ~3,000 sessions/mo; ~$1,500–3,000/mo | ~30,000 sessions/mo; negotiate enterprise contract; est. $10,000–15,000/mo |
| **Database (Neon)** | Starter tier; <£50/mo | Scale tier; £150–400/mo | Business/Enterprise; £500–2,000/mo; consider read replicas |
| **Auth (Clerk)** | Free–Starter; <£25/mo | Pro; £100–300/mo | Enterprise contract; custom pricing |
| **File storage (CDN)** | Minimal; <£20/mo | Profile photos, session recordings if stored; £100–300/mo | Significant if recordings retained; £500–2,000/mo; review retention policy |
| **Email (transactional)** | Resend/Postmark; <£30/mo | £60–150/mo | £300–600/mo |
| **Monitoring / observability** | Vercel Analytics + Sentry free tier; <£50/mo | Sentry Team; £80/mo | Sentry Business + DataDog or equivalent; £500–1,500/mo |
| **Support headcount** | 0 FTE (founding team) | 0.5–1 FTE (part-time) | 2–4 FTE support agents |
| **Engineering headcount** | 1–2 FTE | 2–3 FTE | 4–8 FTE |
| **Total infra cost estimate** | ~£350–700/mo | ~£2,200–5,000/mo | ~£15,000–25,000/mo |

At 1,000–10,000 tutors, the most significant variable cost is video infrastructure. Evaluate whether session recordings should be stored (meaningful storage cost; significant parent-value feature) or streamed only (lower cost). Daily.co enterprise pricing negotiation is the most impactful cost lever at this scale. If video infrastructure becomes a margin constraint, evaluate alternatives (LiveKit self-hosted on GCP/AWS; 100ms).

---

## Product Expansion Roadmap (beyond Phase 2 features)

### Group lessons

One tutor, two to six students sharing a session and splitting the cost. This increases tutor hourly effective yield (a tutor charging £12/student × 4 students earns £48 while offering a savings vs. £35–40 for a 1:1 session). For parents, group sessions reduce per-session cost, making tutoring accessible to lower-income households. The parent portal and tutor subscription tiers provide natural mechanics to gate this feature (Studio tier for tutors; parent portal for discovery).

Group lesson infrastructure requires: multi-participant scheduling, split billing across multiple student accounts, a fair attribution model for the platform fee, and group-aware video sessions. Timeline: Phase 3.

### Tutor CPD marketplace

Tutors often want to upskill — in pedagogy, in subject content, in online teaching tools. A curated CPD (Continuing Professional Development) marketplace, where experienced tutors or subject experts sell short courses to other tutors, creates a new revenue stream (fair-do takes a margin on CPD sales) and deepens platform engagement. Tutors who complete CPD on the platform can display accredited badges on their profiles — a trust signal for parents. Timeline: Year 3.

### Subject-specialist curriculum tools

At-platform curriculum resources: topic checklists aligned to AQA/Edexcel/OCR specifications, editable lesson plan templates, flashcard builders, mock exam question banks. These reduce tutor session-prep time and create a reason to stay within the fair-do ecosystem rather than using Google Classroom or Notion alongside. Potential to monetise as a Studio-tier exclusive or bolt-on. Timeline: Year 2–3.

### School reporting dashboard

For the B2B school channel: a dashboard giving pastoral leads and SENDCOs visibility into which students are attending sessions, which tutors they are matched with, session duration and frequency, and a simplified progress summary. Must be built with UK GDPR data-sharing agreements with schools as data controllers. Timeline: Year 2 alongside school partnership product.

### AI-powered student progress analytics

Using session notes, tutor-submitted progress updates, and (if recorded) session transcripts, generate a structured progress timeline for each student — surfaced in the parent portal as a readable summary rather than raw data. This is the kind of feature that meaningfully differentiates fair-do from a directory in the parent's perception: evidence that the platform adds value beyond being a booking layer. Timeline: Year 3; requires robust privacy framework, explicit data consent, and careful model selection to avoid hallucinating academic assessments.

---

## Revenue Model at Scale

### Assumptions at 1,000 active tutors (Year 2 steady state)

- 1,000 active tutors averaging 20 hours of platform sessions per month
- Average session rate: £40/hr
- Subscription mix: 40% Free (no sub revenue), 40% Pro (£15/mo), 20% Studio (£45/mo)
- Parent portal: 3,000 subscribers at £4.99/mo (3:1 student-to-tutor ratio)
- B2B school partnerships: 10 schools at average £1,000/year contract value
- Platform fee: 10% on all sessions booked through the platform

### Annual revenue breakdown at 1,000 active tutors

| Stream | Calculation | Annual |
|---|---|---|
| Platform fee | 1,000 tutors × 20 hrs × £40 × 10% × 12 months | £960,000 |
| Pro subscriptions | 400 tutors × £15 × 12 months | £72,000 |
| Studio subscriptions | 200 tutors × £45 × 12 months | £108,000 |
| Parent portal | 3,000 × £4.99 × 12 months | £179,640 |
| School partnerships | 10 schools × £1,000 avg | £10,000 |
| **Total ARR** | | **~£1,329,640** |

### Cost structure at this scale (annual estimate)

| Cost | Annual estimate |
|---|---|
| Infrastructure (video, DB, auth, CDN, email, monitoring) | £50,000–70,000 |
| Engineering (3 FTE at blended £70k incl. on-costs) | £210,000 |
| Support (1.5 FTE) | £60,000 |
| Marketing / paid acquisition | £60,000–100,000 |
| Finance, legal, compliance | £30,000–50,000 |
| DBS umbrella body partnership fees | £5,000–10,000 |
| Other operating costs | £20,000–30,000 |
| **Total operating cost** | **~£435,000–520,000** |

**Operating profit at 1,000 active tutors: approximately £810,000–895,000 before founder salaries and tax.** At this scale, fair-do is profitable on an operating basis and self-funding, with room for reinvestment into Phase 3 growth.

### Path to £5M ARR

5,000 active tutors, following the same model, generates approximately £5.1–5.5M ARR inclusive of subscriptions and parent portal. At that scale, the B2B revenue streams (school partnerships, corporate L&D) should be contributing an additional £500,000–1,000,000. The business is generating meaningful free cash flow for international expansion or product investment without requiring external capital.

---

## Key Risks and Mitigants

### Tutor churn

**Risk.** Tutors who built their client base using fair-do's platform move off-platform once the relationship is established, to avoid the 10% fee. This is the structural threat to every marketplace.

**Mitigants.** (1) Make the platform genuinely better than DIY for ongoing admin: automated session reminders, payment protection, tax receipt generation, progress reports for parents. A tutor who values the time saved at £10/hour would need to save 36 minutes per session to break even on the 10% fee versus self-managed invoicing — credible for tutors managing ten or more clients. (2) Parent portal creates client-side stickiness: parents booking through the portal have an expectation of staying on-platform. (3) Review and reputation data is platform-held: tutors with 40 verified reviews on fair-do have a genuine reason not to start over elsewhere. (4) Free tier is available: tutors with fewer than 8 students pay no subscription, making the net cost of staying on-platform extremely low.

### Price war from incumbents

**Risk.** Tutorful, MyTutor, or a well-capitalised new entrant drops commission to 15% or below to neutralise fair-do's core proposition.

**Mitigants.** Incumbents' cost structures are built around 25–40% take rates; dropping to 10–15% would require fundamental restructuring of investor return expectations or cost models. Superprof already offers near-zero commission but provides no integrated tooling, demonstrating that simply reducing commission is insufficient — the full-service experience at fair-do's price is the offer. If an incumbent matches on price, the competition shifts to product quality and brand trust — terrain where fair-do can compete. Additionally, the ethical positioning becomes more defensible over time as tutors and parents associate the fair-do brand with fair treatment.

### Google Meet remaining "good enough"

**Risk.** Self-employed tutors continue to use free tools (Google Meet, Zoom, Calendly, bank transfer) and see no reason to pay 10% to a platform.

**Mitigants.** The DIY stack has no client acquisition capability — fair-do offers discoverability. The DIY stack has no payment protection — fair-do holds payment in escrow and releases post-session, protecting tutors from non-payment and no-shows. The DIY stack has no professional trust signals for parents (DBS badge, verified reviews, session count). The 10% fee buys meaningful things. Focus marketing on tutors for whom non-payment and no-shows are already a real, experienced problem — these are the natural early adopters.

### Schools contracting directly with tutors

**Risk.** A school that connects with tutors via fair-do later contracts with them directly, cutting the platform out of B2B revenue.

**Mitigants.** Contractual terms can restrict direct solicitation, though enforcement against schools is impractical. The more durable mitigant is building value in the school-facing product (compliance records, invoicing, pupil data security) that the school cannot easily replicate with a direct arrangement. Schools deal with procurement compliance, safeguarding due diligence, and payment processing that fair-do's platform simplifies — the school has a reason to stay on-platform even if they could theoretically go direct.

### Regulatory changes to DBS requirements

**Risk.** Government introduces mandatory registration or licensing for private tutors, creating a compliance barrier that disrupts tutor supply or requires significant platform-side compliance infrastructure.

**Mitigants.** Regulatory tightening around DBS is actually a tailwind for a platform that already facilitates Enhanced DBS checks and displays verified badges — it creates a barrier to entry for unvetted independent tutors. fair-do should monitor proposed legislative changes and, if mandatory tutoring registration emerges, position as the compliance-ready platform. Proactive engagement with the Tutors' Association (TTA) supports early visibility of regulatory developments.

### Data breach or safeguarding incident

**Risk.** A safeguarding incident involving a fair-do tutor — or a data breach exposing pupil information — could cause reputational and legal damage disproportionate to the platform's size.

**Mitigants.** DBS verification is a platform baseline requirement (Enhanced DBS for all tutors working with under-18s). Data minimisation: fair-do holds only what is needed for the transaction; detailed session notes are optional and tutor-owned. ICO registration and UK GDPR compliance from day one. Clear safeguarding policy, escalation path, and mechanism to immediately suspend a tutor account under investigation. These are table-stakes for a platform involving minors; the risk of not doing them well exceeds the cost of doing them right.

---

## What We Measure

### North star metric

**Monthly Active Tutoring Hours** — the total hours of live sessions completed on the platform per calendar month. This single metric captures tutor activity, student retention, and platform health simultaneously. If tutors are active and students are returning, this number grows. If either side churns, it falls. All other metrics are either leading indicators (are we building towards this?) or lagging indicators (what's driving it?).

### Leading indicators (weekly)

| Metric | What it signals |
|---|---|
| New tutor registrations per week | Top-of-funnel tutor supply health |
| Tutor profile completion rate | Quality of supply entering the pool |
| First booking rate (tutors who receive ≥1 booking within 30 days of listing) | Marketplace liquidity; are new tutors finding students? |
| New student enquiries per week | Demand-side health; parent discovery is working |
| Referral invites sent per week | Community growth loop activation |

### Lagging indicators (monthly)

| Metric | What it signals |
|---|---|
| Monthly Active Tutoring Hours (north star) | Overall platform health |
| Tutor NPS | Likelihood of organic referral and retention |
| Parent / student NPS | Likelihood of rebooking and word-of-mouth |
| Tutor 90-day retention rate | Are tutors staying after the initial experience? |
| Student rebooking rate (month 2 cohort) | Are students getting value and returning? |
| Free-to-paid tutor conversion rate | Product is demonstrating sufficient value to justify subscription |
| Parent portal churn rate | Standalone value of the portal vs. platform stickiness |
| Revenue per active tutor (platform fee + subscription) | Blended yield per tutor; optimisation target |
| Support tickets per 100 sessions | Operational health; are there platform friction points? |

### Tutor NPS and session cohort analysis

Tutor NPS should be measured quarterly via in-app survey, with follow-up qualitative interviews for detractors (score 0–6). The question is simple: "How likely are you to recommend fair-do to a fellow tutor?" Anything above 50 in the early phase indicates genuine advocacy potential. Target: NPS ≥ 55 at Phase 1 close, ≥ 60 at Phase 2 close.

Student retention cohorts: track month-2 and month-6 rebooking rates by acquisition channel and subject category. This identifies which tutor types and acquisition sources produce the highest-value long-term students, informing where to concentrate growth investment.

Referral activation rate: the proportion of active tutors who have sent at least one referral invite in the last 90 days. Target: 20% by end of Phase 2. A referral activation rate above 15% at steady state suggests the growth loop is functioning without requiring constant paid acquisition to sustain it.

---

*fair-do Ltd — Company number to be confirmed. Registered in England and Wales.*
