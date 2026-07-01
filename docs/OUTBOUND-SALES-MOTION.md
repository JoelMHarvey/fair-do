# fair-do — Outbound Sales Motion: 5,000 Users

*Document owner: Sales Director · Last updated: 1 July 2026 · Status: Ready to execute*

---

## Executive Summary

- **The single lever:** Every tutor converted brings 8–12 existing students with them at near-zero incremental cost — so tutor acquisition is the only critical path. Parent and school acquisition are downstream effects, not parallel tracks.
- **The unfair advantage:** No competitor offers 0% commission on a tutor's own students and AI-assisted lesson planning. Both are differentiated simultaneously — the commission argument wins the first conversation; the prep-time argument creates switching costs that keep tutors on the platform.
- **The 90-day ambition is a stretch goal, not a commitment:** The contactable outbound universe is 8,000–15,000 tutors, not 250,000. 5,000 registered users requires cold outbound *plus* a live referral loop from Day 14. Gate all outbound behind a production-ready technical stack before contacting a single prospect.

---

## Target: How We Get to 5,000 Users

### The Funnel Maths

| Segment | Target (Day 90) | Derivation |
|---|---|---|
| Tutors | 1,500 registered | ~12% conversion from contactable universe of ~12,000 via cold email + referral |
| Students (via tutors) | 3,200 | Each converted tutor migrates average 8 existing students via the tutor-to-parent referral flow |
| School seats | 300 | 4 school accounts × avg 75 seats each |
| **Total registered users** | **~5,000** | Tutors + students + school seats |

**Critical dependency:** The tutor-to-parent flow must be a product feature, not a manual ask. When a tutor migrates, the platform sends a co-branded email to their student list on the tutor's behalf ("I've moved to fair-do — here's how to book me"). Without this automation, the student number does not materialise.

### 90-Day Milestone Plan

| Milestone | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| Registered tutors | 300 | 800 | 1,500 |
| Active students | 150 | 700 | 3,200 |
| School accounts | 0 | 2 | 4 |
| Total registered users | 450 | 1,500 | ~5,000 |
| MRR (Pro £29 + School £79) | £145 | £435 | £1,160+ |
| Weekly active tutoring hours | 45 | 120 | 150+ |

**Pre-launch gate (Days −14 to 0):** Stripe Connect live in production, Daily.co room creation tested end-to-end, Resend transactional emails firing, 5+ anchor tutors (founder's personal network) with completed profiles and first reviews. Do not contact cold prospects until this gate is cleared.

---

## ICP Definitions

### ICP 1 — Independent Tutor: Commission-Squeezed Professional *(Supply side, primary)*

**Who they are:** Age 25–45, degree-educated, often with a PGCE or subject specialism in STEM, English, or MFL. 3–10 years tutoring experience. 8–20 active students. Earns £30–£65/hr. Tutoring is a primary income source. Currently on Tutorful, MyTutor, or Spires for 2+ years.

**Where to find them:**
- Tutorful, MyTutor, Spires public profiles (names + subjects publicly listed)
- Facebook groups: UK Tutors (47k members), Private Tutors UK (28k), Maths Tutors UK (14k), GCSE and A Level Tutors UK (9.5k)
- LinkedIn: job title search "private tutor" or "freelance tutor", UK location
- Reddit: r/uktutors, r/tutoring, r/TeachingUK
- TES Community tutoring subforum

**Trigger event (externally observable proxies):**
- Posts in tutor Facebook groups complaining about commission rates or platform algorithm changes — monitor via keyword alerts ("commission", "Tutorful fee", "platform cut")
- Tutors who publicly announce they are "going independent" on LinkedIn or X
- Platform policy change announcements (Tutorful rate changes, MyTutor IXL migration communications) generate spikes of visible tutor frustration — monitor and intercept within 48 hours
- September new academic year: new students = new commission relationships beginning. Highest-intent outbound window is September and January, not July.

**Decision criteria:**
1. 0% commission on their own students (non-negotiable for switchers)
2. Reliable payment processing — no chasing parents for bank transfers
3. Booking and scheduling automation
4. Integrated video and whiteboard
5. Profile and review ownership and portability
6. Low onboarding friction — under 30 minutes, no mid-term disruption to existing students
7. No lock-in contract

**UK pool size:** 20,000–30,000 deduplicated platform-registered tutors (Tutorful: 20k+, MyTutor: ~10k active, Spires: several thousand, TutorHunt/Superprof UK: 5k–8k active — deduped). The immediately contactable segment with enrichable email is 8,000–15,000.

---

### ICP 2 — Tutoring Agency or Small Network Owner *(B2B, School tier)*

**Who they are:** Owner-operator of a regional tutoring agency, age 35–55. Manages 10–50 tutors as contractors. Annual revenue £100k–£800k. Uses spreadsheets, WhatsApp, and Notion/Airtable. Invoices via Xero or FreeAgent. No dedicated tutoring platform software.

**Where to find them:**
- LinkedIn: "Director" or "Founder" of a tutoring/education agency
- UK Tutoring Association and NTA membership directories
- Local BNI chapters and Chamber of Commerce
- Regional parent Facebook groups (where they advertise)
- Companies House SIC 8559 ("Other education not elsewhere classified"): ~4,200 active entities, subset of 800–1,500 managing 10+ tutors

**Trigger event:** A payment dispute or missed invoice that causes a parent or tutor to leave; a failed attempt to scale past 20 tutors with spreadsheets; a key tutor going direct with parents because the agency's payment process is slow.

**Decision criteria:** Multi-tutor dashboard, automated tutor payout at agency's chosen split, parent portal, branding control (platform operates under agency name), flat predictable fee, reporting, DBS status visibility, UK-based support.

**UK pool size:** 800–1,500 agencies large enough to need platform tooling. One agency account at £79/month typically covers 20–50 tutors and 100–200 students — highest per-account user contribution of any segment.

---

### ICP 3 — Parent of a GCSE or A-Level Student *(Demand side)*

**Who they are:** Parent aged 38–52, household income £55k–£120k, one or two children aged 14–18 in Years 10–13. Currently paying for tuition via Tutorful or MyTutor, or via word-of-mouth. Paying £35–£80/hr. Cost-conscious but quality-driven.

**Where to find them:** Mumsnet Secondary Education board, local Facebook parent groups ("GCSE Help UK", "[Town] Mums"), school WhatsApp parent groups (word-of-mouth), Netmums, NextDoor.

**Trigger event:** Discovering the Tutorful service fee gap when their tutor mentions their own rate is lower than the invoice total; child's mock results arriving and increasing session frequency; a trusted tutor leaving a platform and needing to continue outside it.

**Decision criteria:** Transparent all-in pricing, tutor quality and reviews, automated invoicing, lesson notes via Parent Portal, secure integrated payment, UK-based platform.

**UK pool size:** 400,000–600,000 parents paying for GCSE/A-Level tuition in England. ~150,000–250,000 currently booking through a platform. **This segment is acquired primarily through tutors, not independent outbound.** The only owned parent acquisition channels before Day 60 are Mumsnet organic presence (60-day lead time) and SEO content.

---

## Messaging

### Tutors

| Element | Copy |
|---|---|
| **Headline** | Keep every penny from students you already have |
| **Value prop** | fair-do charges 0% on every lesson with your own students. Replace platform commission with a flat £29/month and keep income you've already earned. |
| **Top differentiator** | Unlike Tutorful (where your students pay a hidden 35% service fee on top of your rate, making you look expensive) or MyTutor (which keeps 40% of every lesson regardless of how long you've had that client), fair-do charges nothing on your own students and adds nothing at checkout. |
| **Emotional core** | Financial control — what you charge is what you earn, with no silent partner taking a cut in perpetuity. The relationship being taxed is not an abstraction: you built it, planned every lesson, tracked their progress. The platform profited from it every week. |
| **Cold email subject** | The student you found, built up, and kept for 2 years — Tutorful still takes 40% of every lesson |
| **Social proof hook** | "Tutors who move 10+ students in their first week recover the annual Pro cost in under two months. Here's the working: [rate × weekly lessons × 0.35 × 52] versus £348/year flat." |

**Proof points (apply in this order — lead with the relationship, then the maths, then the platform:**
1. You've been teaching the same student for three years. You planned every lesson, tracked their progress, messaged their parent after the mock. Tutorful charged them 35% more than your rate for the privilege — and they will keep doing it next year.
2. Take your hourly rate, multiply by your weekly lesson count, multiply by 0.35 — that's roughly what you hand over every week. For most tutors on our waitlist this sits between £60 and £200 per week.
3. Founding tutors lock in a 90% marketplace rate by the terms of their founding agreement — not a promotional rate that can be withdrawn. The founding cohort closes at 500 tutors because we personally onboard each one; that's not something we can do at scale.

---

### Schools and Agencies

| Element | Copy |
|---|---|
| **Headline** | One platform. Every tutor. Zero commission chaos. |
| **Value prop** | fair-do gives schools and agencies a workspace to manage tutor rosters, scheduling, invoicing, and parent reporting at a flat £79/month with no per-session commission. |
| **Top differentiator** | Unlike MyTutor — now owned by US edtech company IXL Learning, creating real uncertainty about UK-market focus — fair-do is a flat subscription with no per-lesson extraction and no acquisition risk. |
| **Emotional core** | Operational clarity — knowing exactly what the platform costs every month, owning the client relationships, and having parent reporting sorted without building it yourself. |
| **Cold email subject** | Parents are asking what happened in last Tuesday's session. Can you tell them? |

**Improved opener (from adversarial review — use verbatim):**

> Last term, a parent at one of your sessions called the office three times asking what was covered. Your tutor didn't reply until Wednesday. You had no notes, no attendance log, no way to tell that parent anything — because the session happened somewhere between a WhatsApp thread and a PDF invoice that may or may not have arrived.
>
> That's not a staffing problem. It's an infrastructure problem. And it's the same conversation happening in pastoral offices across the country every single week.
>
> fair-do is a school-facing platform that gives every tutor session a record: lesson notes posted automatically after each hour, attendance confirmed, invoices generated and stored for the parent. The Parent Portal means families see what happened in Tuesday's session without calling you. Your front desk stops being the liaison between a parent's anxiety and a tutor's availability.
>
> Flat £79/month. No per-session fee. No commission on sessions your school arranged.
>
> If you have five minutes, I'll show you what a session record looks like from the parent's side — it's the thing that tends to end the conversation about whether this is worth trialling.

**Proof points (in buyer-priority order):**
1. **Parent Portal first:** Lesson notes go directly to families automatically after every session — cutting inbound calls to your front desk without extra staff time.
2. **Flat cost second:** £79/month covers unlimited tutors and students — one fixed cost regardless of lesson volume. A school running 200 hours/term saves up to £2,400/term versus a 25% commission platform.
3. **Tutor retention third:** Tutors under a School account retain their own professional profiles and reviews — they stay because they own their reputation, reducing turnover.

---

### Parents

| Element | Copy |
|---|---|
| **Headline** | Pay your tutor. Not the platform's service fee. |
| **Value prop** | fair-do shows you exactly what a tutor charges, with nothing added at checkout — the price you see is the price you pay. |
| **Cold email subject** | That £40/hr tutor is actually costing you £54 on Tutorful |
| **Cold email opener** | If you've booked through Tutorful recently, the tutor's rate and your actual invoice are two different numbers. Tutorful adds a 35% service fee at checkout that the tutor never sees and that doesn't make the lesson any better. |
| **Top differentiator** | Unlike Tutorful, where a tutor posting £30/hr becomes £40.50/hr by the time you confirm payment, fair-do has no service fee. The tutor sets their rate and that is the rate. |

---

## Outbound Sequences

### Sequence A: Independent Tutor (7-touch, 30-day cadence)

*Note: Sequence extended to 30 days from original 21. LinkedIn touches replaced with Facebook Group engagement (connection limits and variable post availability make LinkedIn impractical at volume). Referral mechanic inserted at Day 10. SMS moved to Day 20 (earlier in the sequence when relationship still has momentum). Breakup email stripped to genuine closure.*

---

**Touch 1 — Day 1 — Email**

Subject: The student you found, built up, and kept for 2 years — Tutorful still takes 40% of every lesson

Hi [FIRST_NAME],

You've been teaching the same student for three years. You planned every lesson, built their confidence up from scratch, messaged their parent the night before the mock. Tutorful charged them 35% more than your posted rate for the privilege of hosting that relationship — and they'll keep doing it next year, and the year after.

fair-do works differently. 0% commission on every student you bring yourself. Flat £29/month. No service fees added on top of your rate at checkout.

Take your hourly rate, multiply by your weekly lesson count, multiply by 0.35 — that's roughly what you hand over every week. For most tutors this sits between £60 and £200 per week.

Your profile, your reviews, your clients — all yours to keep.

Worth a look: fair-do.com/tutors

[SENDER_NAME]

---

**Touch 2 — Day 4 — Facebook Group Comment + DM**

*Action: Comment on a recent post the tutor has made in a UK tutor Facebook group (UK Tutors, Maths Tutors UK, etc.). If no recent post, post a genuinely useful commission comparison image in the group and DM active commenters individually.*

DM text:

Hi [FIRST_NAME] — noticed you tutor [SUBJECT]. Quick question: how much unpaid prep time do you put in per new student?

Most tutors we speak to lose 45–90 minutes building lesson plans from scratch every time. We're building AI-assisted lesson planning into fair-do — curriculum-aligned, editable, done in minutes. No other platform offers this. Happy to share more if useful.

[SENDER_NAME], fair-do

---

**Touch 3 — Day 7 — Email**

Subject: What [PLATFORM] cost you last year — the exact sums

Hi [FIRST_NAME],

Platform commission is easy to ignore week by week. It's harder to ignore annually.

Take your current hourly rate (let's call it [RATE]), multiply by your typical weekly lesson count ([WEEKLY_HOURS] hours), multiply by 0.35, multiply by 48 working weeks. That's a rough figure for what a commission platform like Tutorful extracts from your income every year — not from students it sends you, but from students you already have.

For most tutors on our waitlist, that number sits between £3,000 and £8,000.

On fair-do, you keep every penny of those earnings. Pro costs £348/year. The difference between what a commission platform takes and what fair-do costs is the gap that matters.

No credit card required. Free tier covers up to 8 students at 0% commission.

Start free: fair-do.com/tutors

[SENDER_NAME]

*[If no reply to Touches 1–3: pivot from cost to professional autonomy and platform dependency in Touch 4.]*

---

**Touch 4 — Day 10 — Email (social proof + referral mechanic)**

Subject: "The easiest financial decision I've made" — and a question

Hi [FIRST_NAME],

Tutors in our early cohort who moved 10+ existing students to fair-do in their first week recovered the annual Pro cost within two months — and that was just on lessons they were already delivering.

One tutor, after doing the annual maths on their tax return for the first time, described it as "the easiest financial decision I've made in four years of tutoring."

Moving is simpler than most tutors expect:
1. Create your profile (10 minutes)
2. Send your students a direct booking link — we provide a pre-written template
3. Keep 100% of every lesson from that point forward

Your reviews and reputation travel with you. They always belonged to you.

One more thing: know another tutor on Tutorful or MyTutor? If they sign up using your referral link and complete their profile, you both receive a free month of Pro. Tutors tell their peers; we built that into how the economics work.

Start free: fair-do.com/tutors

[SENDER_NAME]

---

**Touch 5 — Day 15 — Email (value-add, no direct ask)**

Subject: Free: AI lesson plan template for GCSE [SUBJECT] (no strings)

Hi [FIRST_NAME],

Nothing to sign up for with this one — just a resource.

We've put together a curriculum-aligned AI lesson plan template for GCSE [SUBJECT] that takes a student's current level and exam target and outputs a structured session plan in under two minutes. We built it because tutors consistently tell us that prep time — 45–90 minutes per new student — is the biggest unpaid overhead in their week, and no existing platform does anything about it.

You can use it whether you join fair-do or not: [LINK TO FREE TEMPLATE/CALCULATOR]

If you do want to see how it works inside the platform, fair-do.com/tutors is still there.

[SENDER_NAME]

---

**Touch 6 — Day 20 — SMS**

Hi [FIRST_NAME], this is [SENDER_NAME] from fair-do. Is there a specific concern holding you back from switching? Happy to answer directly — no pitch. fair-do.com/tutors if you want the short version.

---

**Touch 7 — Day 30 — Email (genuine breakup)**

Subject: Closing your file, [FIRST_NAME]

Hi [FIRST_NAME],

I'll take you off this list after today — no hard feelings at all.

If the timing is ever right, fair-do.com is there. Founding Tutor places are capped at 500 because we're personally onboarding each one — once they're filled, the terms change.

Wishing you a full diary.

[SENDER_NAME]

*Sequence ends. Re-enrol in 90 days if tutor is still listed on a competing platform.*

---

### Sequence B: Head of Department / School Buyer (5-touch, 14-day cadence)

*Note: Split from agency sequence — this version is for school HoDs and SENCOs. Agency owners receive Sequence B2 (not included in this document — separate demo-led track). All school outreach to fire in September, not July. A Day 9 preview email is added before the Day 10 call.*

---

**Touch 1 — Day 1 — Email**

Subject: Parents are asking what happened in last Tuesday's session. Can you tell them?

Hi [FIRST_NAME],

Last term, a parent at one of your sessions called the office three times asking what was covered. Your tutor didn't reply until Wednesday. You had no notes, no attendance log, no way to tell that parent anything — because the session happened somewhere between a WhatsApp thread and a PDF invoice that may or may not have arrived.

That's not a staffing problem. It's an infrastructure problem. And it's the same conversation happening in pastoral offices across the country every single week.

fair-do is a school-facing platform that gives every tutor session a record: lesson notes posted automatically after each hour, attendance confirmed, invoices generated and stored for the parent. The Parent Portal means families see what happened in Tuesday's session without calling you. Your front desk stops being the liaison between a parent's anxiety and a tutor's availability.

Flat £79/month. No per-session fee. No commission on sessions your school arranged.

If you have five minutes, I'll show you what a session record looks like from the parent's side — it's the thing that tends to end the conversation about whether this is worth trialling.

Would a 20-minute call make sense?

[SENDER_NAME]
fair-do.com/schools

---

**Touch 2 — Day 4 — LinkedIn DM**

Hi [FIRST_NAME] — I saw [SCHOOL_NAME] recently [LINKEDIN_ACTIVITY, e.g. "posted about your tutoring programme"]. Relevant timing: fair-do School gives departments a session record for every tutoring hour — lesson notes go directly to the Parent Portal, attendance confirmed, invoices generated automatically.

We're working with a small cohort of pilot schools. Happy to share what it looks like in practice if useful.

[SENDER_NAME]

---

**Touch 3 — Day 7 — Email (cost case)**

Subject: What 200 tutoring hours per term costs on a commission model vs fair-do

Hi [FIRST_NAME],

A school running 200 tutoring hours per term at £40/hour through a typical commission platform pays roughly £8,000 to tutors — plus a 20–35% platform fee on top, making the real cost £9,600–£10,800 per term.

On fair-do School at £79/month: the total platform cost is £237 per term. The remaining budget goes to tutors, not to the platform.

That's a difference of up to £2,400 per term available to extend your programme, pay tutors better, or return to the budget.

I've built a model using typical secondary school volumes if you'd like to see the exact numbers for [SCHOOL_NAME]. Takes 20 minutes.

[SENDER_NAME]

---

**Touch 4a — Day 9 — Email (call preview)**

Subject: Calling you tomorrow morning, [FIRST_NAME]

Hi [FIRST_NAME],

I'll try you briefly tomorrow morning on [PHONE] — just to follow up on the fair-do note I sent last week. I'll be quick, and if it's not the right time I'll leave a number.

If a call doesn't suit, replying to this email works equally well.

[SENDER_NAME]

---

**Touch 4b — Day 10 — Phone call**

Voicemail script:

"Hi [FIRST_NAME], this is [SENDER_NAME] from fair-do. I've been in touch about tracking tutoring outcomes against attendance and session records at [SCHOOL_NAME]. We're offering a small cohort of pilot schools the first term free — zero cost to try it before committing. If that sounds worth five minutes, call me on [PHONE] or just reply to my email. Thanks."

---

**Touch 5 — Day 14 — Email (genuine close)**

Subject: Last email from me, [FIRST_NAME]

Hi [FIRST_NAME],

I'll stop here — I know your inbox doesn't need more noise.

If parent reporting, tutoring admin, or programme costs become a priority at [SCHOOL_NAME], fair-do School is £79/month with no commission, a Parent Portal, and automatic session records. We have a small pilot cohort getting the first term free. If that changes the calculation, reply to this email and I'll hold a spot.

Good luck with the term ahead.

[SENDER_NAME]
fair-do.com/schools

*Sequence ends. Re-enrol in May–June (new academic year planning window).*

---

## Objection Handling Bank

| Objection | Type | Response | Follow-up question | Priority |
|---|---|---|---|---|
| I already use Tutorful and I have students there | Logical | Tutorful did the work of getting those relationships started — fair-do is built for exactly this moment. You bring those students across (a quick message), and from that point you pay 0% commission on every lesson. Parents often welcome the switch because they pay less at checkout — the 35% service fee disappears. | "How many students do you have on Tutorful? I can show you what you'd keep in month one." | HIGH |
| I can't afford another monthly subscription | Logical | The free tier is genuinely free — no card, 0% commission, up to 8 students. If you go Pro at £29/month, you earn it back in one 43-minute lesson at £40/hr. After that every remaining lesson that month is pure gain compared to commission. | "What's your current rate and roughly how many lessons per week? I want to show you the exact monthly figure." | HIGH |
| I don't trust a new platform — what if it shuts down? | Emotional | Your risk on fair-do is structurally lower than on any commission platform: your client relationships, profile URL, and reviews belong to you and travel with you. Nothing is lost if anything changes. The founding cohort is the business model — we're building unit economics that work from Day 1, which is why we can afford 0% commission rather than extracting 35–40% to prop up growth. | "What would give you enough confidence to run a handful of students on the free tier first?" | HIGH |
| My students' parents won't switch platforms | Emotional | In practice, parents switch when there's a clear upside for them. Fair-do removes the hidden 35% service fee at checkout — the same lesson costs them less. The message to parents isn't 'move because it suits me' — it's 'I've found a way for you to pay less, with cleaner invoicing and a parent portal that shows session notes automatically.' | "Which of your parents would be the easiest first conversation — someone budget-conscious, or someone who values transparency?" | HIGH |
| I tried another platform and it didn't work | Emotional | Tell me more — 'didn't work' usually means one of two things: the platform failed to send new students, or it created admin friction that outweighed the benefit. Fair-do is built for tutors who already have students and are losing commission on them — the win is immediate and doesn't depend on marketplace luck. The free tier has 0% commission, so the downside of trying is genuinely zero. | "Was the platform you tried primarily commission-based, subscription-based, or both — and did it ever actually send you new students?" | MEDIUM |
| Tutorful gives me a steady stream of new students | Logical | That's a real advantage — we're not asking you to walk away from it. The smartest move most tutors make is to keep Tutorful for new student discovery while migrating existing students to fair-do where no commission is taken. Every student Tutorful sends eventually becomes a relationship you own — at which point you're paying commission indefinitely on a relationship that no longer needs discovering. Run both in parallel for 90 days and compare. | "Of your current active students, how many originally came through Tutorful? Do you know roughly what you're paying in combined commission each month?" | HIGH |
| I don't want to lose my Tutorful reviews | Emotional | On fair-do your reviews are yours permanently — they don't disappear if you cancel. For Tutorful reviews specifically: most tutors keep a minimal Tutorful presence purely to display history, while building fresh reviews on fair-do where checkout is cheaper for parents. Reviews accumulate faster than most tutors expect once families see transparent billing and a parent portal. | "Are your Tutorful reviews primarily from students you sourced yourself, or marketplace leads the platform sent you?" | MEDIUM |
| The commission I pay is just a cost of doing business | Logical | That framing makes sense when the cost is buying you something. But commission on a student you sourced yourself, taught for two years, and would retain regardless isn't a cost of acquisition — it's a tax on retention. At £40/hr with 15 students, the difference between fair-do Pro at £29/month and a 25% commission platform is roughly £1,300/month. Over a year that's more than £15,000. | "If you saw a concrete monthly figure for what you're paying versus a flat subscription, would that change how you think about it?" | MEDIUM |
| I'm worried about the technical side — setting up payments, video calls, all of it | Emotional | That's exactly what we've built to remove. The entire stack from booking confirmation to money in your account is inside fair-do. Setup takes most tutors under an hour: profile, availability, payment details, done. Scheduling, video, whiteboard, payment collection, and invoicing happen automatically after that. If you're spending four-plus hours a week on admin — which is typical — that time disappears almost entirely. | "Which part of your current admin takes the most time each week — invoicing, chasing payments, scheduling, or something else?" | MEDIUM |
| £29/month sounds cheap now but prices always go up | Logical | Founding tutors lock in the rate and the 0% commission on direct students by the terms of their founding agreement — not a promotional price that reverts. We're also structurally incentivised not to raise prices aggressively: our business model only works if tutors stay and refer peers. Compare that to commission platforms where a 1% rate increase is invisible until the annual maths reveal another £500 gone. | "Is price stability the main concern, or is there something else sitting underneath it we haven't addressed?" | MEDIUM |
| I teach a niche subject — I'm not sure fair-do has students looking for me | Logical | For niche subjects, fair-do's value is actually stronger than for generalists — because you almost certainly already source your own students through word of mouth or specialist referrals. The platform's job for you is to handle everything after first contact: professional booking, automated invoicing, a credible profile, and a parent portal that builds trust with specialist families. You keep 100% on every self-sourced student, which on a premium rate compounds quickly. | "What's your typical hourly rate, and are most of your students from personal referrals or platform discovery?" | LOW |
| I teach at a school — this feels built for individual tutors, not us | Logical | The School tier at £79/month is built specifically for your context: multi-staff scheduling, parent portal access across a cohort, shared lesson note visibility, and invoicing that works at organisational scale. The 0% commission model matters even more for a school because every lesson across every staff member compounds. We're also the only platform building AI lesson planning tools aligned to curriculum specs. | "How many tutors or teachers are currently operating under your school account, and what's the biggest admin pain point right now?" | HIGH |

---

## Channel Strategy

### Channel Table

| Channel | Target | Realistic UK Reach | List-Building Method | Expected Response Rate | Cost | When to Activate |
|---|---|---|---|---|---|---|
| Cold email (LinkedIn-sourced) | Platform tutors | 8,000–15,000 enrichable contacts | LinkedIn Sales Navigator + Hunter.io against tutors' own websites (not competitor platform scraping) | Open: 35–50%; Reply: 5–12%; Sign-up: 1.5–4% of list | £79/mo Sales Navigator + £49/mo Hunter.io + £59–99/mo Instantly.ai | Week 2 (after list-build Week 1) |
| Facebook tutor groups | Independent tutors | 40,000–60,000 unique (deduped across groups) | Value-first posting + DM after commenting on their content + resource opt-in posts | Post engagement: 2–5%; DM reply: 20–35%; Email capture from resource: 15–25% | Free | Day 1 |
| LinkedIn outreach | Tutors + school decision-makers | 5,000–8,000 genuine independent tutor profiles (not tutoring company employees) | Sales Navigator Boolean search; 80–100 connection requests/week max; 3-message sequence after connection | Connection acceptance: 25–35%; Reply from connection: 8–15% | £79/mo Sales Navigator | Week 1 (steady, not volume driver) |
| Reddit (r/tutoring, r/uktutors, r/GCSE) | Tutors + students/parents | r/uktutors: 8.5k; r/tutoring: 85k (global); r/GCSE: 180k | Aged account karma-building first 30 days; self-posts with data/analysis; helpful comments only | Upvote rate good post: 5–15%; sign-ups from viral post: 50–200 | Free | Day 35+ (account needs karma first — create account before Day 1) |
| WhatsApp/Telegram tutor groups | Active tutors | 10,000–30,000 (significant overlap) | Ambassador recruitment (3–5 per group before any brand post); resource shares; milestone announcements | Open: 70–90%; engagement: 10–25%; click: 15–30% | Free | Day 1 (ambassador DMs only; no brand post until Week 3) |
| TES Community + Mumsnet | Tutors (TES) + parents (Mumsnet) | TES: ~50k active tutoring subforum users; Mumsnet: 9M monthly | Genuine community participation (10–20 posts before any mention of fair-do) | TES: 5–15 sign-ups per well-positioned thread; Mumsnet: 0.5–1.5% CTR but enormous volume | Free organic; TTA membership ~£100/yr | Day 1 organic (Mumsnet requires 10+ non-promo posts first) |
| Direct school outreach | SENCOs + HoDs + school business managers | ~45,000 reachable school staff; 800–1,500 agency owners | GIAS database (free download from gov.uk) for school staff emails; Companies House for agency contacts | Open: 15–25%; Reply: 3–8%; School account conversion: 0.3–1% of contacts | Free (GIAS) + existing email tool | September (Week 1 of new academic year = Day 65–70) |
| Events (Tutors Association conference) | Professional tutors | ~300–500 attendees | In-person networking; coffee break sponsorship £250–500; collect cards + follow up on LinkedIn within 24h | 30–50% of card exchanges convert to trial sign-up | £100–500 | September (register now) |

### 90-Day Calendar

**Pre-launch (Days −14 to 0)**
- Recruit 5–10 anchor tutors through personal/founder network — their completed profiles and endorsements are the social proof foundation
- Create Reddit account immediately; begin genuine helpful activity in r/GCSE, r/sixthform, r/tutoring — no promotion, no links
- Build and ship the commission loss calculator at fair-do.com/calculator (takes hourly rate + weekly lesson count, outputs personalised annual saving, generates shareable results URL, captures email on results page)
- Configure UTM parameters for every outbound link + GA4 goal for sign-up completion event + "how did you hear about us?" field on sign-up form
- Verify technical stack: Stripe Connect live, Daily.co tested end-to-end, Resend transactional emails firing
- Set up email sending domain (separate from main domain), configure Instantly.ai or Lemlist, A/B test two subject line variants

**Days 1–14 (Sprint 1: Seed)**
- Day 1: Join top 5 UK tutor Facebook groups (UK Tutors, Private Tutors UK, Maths Tutors UK, GCSE and A Level Tutors UK, SEN Tutors UK) with a complete personal profile. Lurk 48 hours. Post first value content — commission comparison screenshot image (no link in post; link in first comment only). Post 7–9pm Tuesday or Thursday.
- Day 1: Begin LinkedIn Sales Navigator list-build; 80 targeted connection requests with personalised notes referencing subject specialism.
- Day 1: Identify 10 WhatsApp groups via Facebook group pinned posts; request to join; DM 3–5 potential ambassadors individually in each group accepted.
- Day 3: Send first cold email batch of 500 tutors (LinkedIn-enriched list; personalised with inferred subject from public data); promote calculator link, not sign-up link directly.
- Day 5: Founder publishes first LinkedIn personal article: "I calculated what UK tutors actually keep after platform commission — the number surprised me." (Pound-sign number in headline; links to calculator.)
- Day 7: Review cold email open rates; kill underperforming subject line; send LinkedIn value message to accepted connections referencing commission calculator.
- Day 10: WhatsApp ambassadors post first authentic mentions in their groups. Brand does not post yet.
- Day 14: Send cold email batch 2 (500 tutors, Spires-sourced via LinkedIn enrichment, Spires-specific commission figures in personalisation). Publish second LinkedIn article: "What parents actually pay when a platform adds a service fee."

**Days 15–30 (Sprint 2: Build)**
- Day 15: Send value-add email (Touch 5) to all tutor prospects — free lesson plan template, no direct ask.
- Day 20: First Reddit long-form post in r/tutoring: commission calculation with data, framed as research, not promotion. No links to fair-do in post body; mention in comments only when directly asked.
- Day 21: Begin SENCO list-build from GIAS database — do not send until September.
- Day 28: Send milestone announcement across all channels: "300 tutors have joined fair-do — here's what they said in week one." Post UTM-tracked link. Facebook group, LinkedIn, WhatsApp ambassadors post simultaneously.
- Day 30: Review attribution dashboard — kill the two lowest-performing channels by sign-up/hour-of-effort. Double down on the two highest performers.

**Days 31–60 (Sprint 3: Accelerate)**
- Day 31: Cold email re-engagement — non-openers from batch 1 receive a different subject line variant.
- Day 35: First Reddit post where fair-do is named openly — account now has 35 days of karma. Frame as "we launched — here's how it works" not a product pitch.
- Day 42: Begin MyTutor tutor list outreach with IXL acquisition angle ("MyTutor is now owned by a US edtech company — here's what that means for UK tutors").
- Day 45: Add student-side Facebook outreach — join parent groups with content about hidden service fees. Mumsnet: begin participating in tutoring threads, purely helpfully, no link for first 15 posts.
- Day 50: Introduce parent share mechanic — post-booking flow gives parents a personalised "you saved £X vs Tutorful this month" card, shareable to school WhatsApp groups.
- Day 55: TES Community: post detailed forum thread in tutoring subforum — commission breakdown framed as analysis. Plant now for indexing momentum.
- Day 58: Confirm Tutors Association conference registration and inquire about coffee break sponsorship.
- Day 60: Launch referral programme live to existing tutors (referral link in tutor dashboard + email announcement). Referral badge: any tutor who refers a tutor who completes their profile earns a Founding badge even after organic cohort closes.

*Note: Referral programme was originally planned for Day 60 — this is the correct launch date. The Founding badge referral extension is the accelerator. Day 60 is not too late if anchor tutors begin DM-ing their networks immediately.*

**Days 61–90 (Sprint 4: Scale)**
- Day 65: First school email batch fires — September Week 1. 200 SENCOs from GIAS list; subject "Parents are asking what happened in last Tuesday's session. Can you tell them?"
- Day 70: Follow up school batch with Day 7 cost email. Begin call preview emails (Touch 4a) for high-value targets.
- Day 72: Reddit 45-day transparency post: "We launched 45 days ago — here is what happened." Honest data. Performs extremely well on Reddit.
- Day 75: Founding Tutor badge urgency — "100 spots remain" announcement. All channels simultaneously. WhatsApp ambassadors briefed to post one final personal recommendation.
- Day 80: Begin MAT outreach — 50 largest MATs in England, Directors of Learning, two-week free trial offer for School tier.
- Day 85: Reddit student-facing guide in r/GCSE: "How to find a tutor without paying a 35% service fee." Consumer advice; mentions fair-do naturally.
- Day 90: Close Founding Tutor cohort. Publish 90-day transparency report (user numbers, tutor earnings vs previous platform, student cost savings). Use as PR asset — pitch to TES, Schools Week, and Guardian Education simultaneously. Post to Reddit, LinkedIn, and all active channels.

### Week 1 Priority Action

**Build and ship the commission loss calculator at fair-do.com/calculator before any other outbound fires.**

The calculator (hourly rate × weekly lessons × 0.35 × 48 weeks = annual commission cost; vs. £348/year fair-do Pro) serves every channel simultaneously: it is the CTA in cold email, the hook for Facebook group posts, the anchor for LinkedIn articles, the WhatsApp ambassador share asset, and the Reddit data-journalism hook. It captures email on the results page with genuine reason to provide it ("save your calculation"). It lowers commitment versus a direct sign-up link. Tutors will forward a personalised financial insight to peers in a way they would never forward a platform sign-up link.

Simultaneously, create the Reddit account and begin karma-building — this has a 30-day lead time and costs nothing to start today.

---

## Referral and Viral Lever

**The core flywheel: 300 tutors → 5,000 users without additional outbound spend.**

### The Tutor-to-Parent Viral Loop

When a tutor migrates to fair-do, the platform triggers a co-branded email to their student contact list on the tutor's behalf:

> "Hi [STUDENT NAME], [TUTOR NAME] here. I've moved my tutoring to a new platform called fair-do. You can book sessions at my exact hourly rate — no extra fees added at checkout. Here's your direct booking link: [LINK]. Your lesson history and notes will continue as normal."

This is not outbound — it is a product feature. At 8 students per tutor and 300 tutors, this generates 2,400 parent activations from a single product email. No CAC. No additional effort. The parent conversion rate on this email is high because it comes from a trusted tutor, not from fair-do.

### The Parent Savings Share

After each booked lesson, parents receive a personalised "you saved £X vs Tutorful this month" notification, formatted as a shareable card. Parents share this to school WhatsApp groups and Mumsnet threads where tutoring is discussed. Each share reaches 20–100 other parents. This is the parent-side viral coefficient and it requires zero spend.

### The Founding Badge Referral Extension

Any tutor who refers a tutor who completes their profile earns a Founding badge even after the organic cohort closes. Founding tutors each have a tutor network of 10–20 peers. At 200 Founding tutors, this surfaces 2,000–4,000 warm tutor prospects through peer recommendation — the highest-converting acquisition channel available.

### The Maths: 300 Tutors to 5,000 Users

| Source | Users |
|---|---|
| 300 tutors × 8 students migrated via co-branded email | 2,400 students |
| 300 tutors × referral programme (15% of tutors refer 1 tutor who converts) | 45 additional tutors → 360 additional students |
| School accounts (4 × avg 75 seats) | 300 school seats |
| Platform direct sign-ups from calculator shares + Mumsnet + Reddit | ~400 |
| **Total** | **~3,500** (tutors + students + school seats) |
| Day 90 tutor count at current growth rate | 1,500 tutors |
| **Grand total** | **~5,000** |

The 5,000 target is achievable only with the co-branded student migration email live and the referral mechanic active from Day 14. Neither is optional.

---

## Tools and Stack

| Function | Tool | Cost |
|---|---|---|
| CRM and sequence management | HubSpot Free (up to 1M contacts) or Attio for lightweight pipeline management | Free–£29/mo |
| Cold email sending | Instantly.ai (sending, rotation, warmup) | £59–99/mo |
| Email enrichment | Hunter.io (domain search against tutor personal websites) | £49/mo |
| LinkedIn automation | LinkedIn Sales Navigator (list-building) + PhantomBuster for view automation (max 150 views/day, within ToS) | £79/mo + £49/mo |
| Contact data scraping | Apify (for public profile data — NOT competitor platforms; LinkedIn only) | £20–50 one-time |
| UK school contact data | GIAS database via gov.uk (free download) | Free |
| B2B data enrichment | Cognism UK (for agency owner contacts) | £300–600/mo (optional; use only if Hunter.io insufficient) |
| UTM tracking + analytics | GA4 (free) + Plausible (£9/mo) for privacy-friendly parallel view | Free + £9/mo |
| Tutor-to-parent email automation | Resend (already in stack) + automation trigger on tutor profile completion | Already in stack |
| Commission calculator | Built in-house as a Next.js page at fair-do.com/calculator | Development cost only |
| WhatsApp Business | WhatsApp Business API via Twilio (for optional Touch 6 DM) | Pay-as-go |
| Event management | Eventbrite (free for ticket scanning) | Free |

**Total monthly tooling cost (Months 1–3):** approximately £250–£350/month excluding Cognism. This is negligible relative to the outbound volume achievable.

---

## Legal and Compliance Notes

### GDPR and Cold Email

**Critical issue identified in adversarial review:** ICO guidance treats sole traders as individuals for GDPR purposes in some contexts, meaning consent (not Legitimate Interest) may be required for cold email to individual tutors. **Before sending a single cold email:**

1. Conduct and document a Legitimate Interest Assessment (LIA) covering: the specific data processed, the legitimate interest pursued, and the balancing test against tutor rights. Publish this on fair-do.com/privacy.
2. Use a soft opt-in approach where possible: direct tutors to the calculator landing page first (genuinely useful, no obligation), capture email with explicit consent tick-box, then enter them into the sequence. This removes GDPR exposure entirely.
3. Every outbound email must include: a genuine unsubscribe link, the sender's legal name and address, and a reason for contact ("You are listed as a tutor on [Platform]"). Unsubscribe requests must be processed within 10 days.
4. Publish a privacy notice covering prospecting data — what is collected, how it is used, how long it is retained.

### Competitor Platform Scraping

**Do not scrape Tutorful, MyTutor, or Spires for email addresses.** This violates their Terms of Service and creates potential Computer Misuse Act 1990 exposure. Instead:
- Use LinkedIn Sales Navigator for tutor identification
- Use Hunter.io domain search against tutors' own personal websites (publicly listed contact emails)
- Use the GIAS database for school contacts (public data, explicitly published for this purpose)
- Purchase a compliant UK tutor data list from a licensed B2B provider (Cognism or DueDil) if volume is insufficient

### LinkedIn ToS

LinkedIn permits up to 100–150 personalised connection requests per week. Do not exceed this. PhantomBuster profile viewing automation is permitted at a maximum of 150 views/day. Do not use data export tools that violate LinkedIn's user agreement. All LinkedIn Sales Navigator data is subject to LinkedIn's permitted-use terms — bulk export for permanent storage outside LinkedIn requires a Data Service Agreement.

### Reddit ToS

Do not send Reddit DMs for commercial outreach — this violates Reddit's Terms of Service and risks permanent account ban. Restrict Reddit activity to public helpful comments, self-posts with genuine data, and responses to explicit platform recommendation requests. Never initiate a DM for commercial purposes.

---

## Success Metrics and Weekly Dashboard

### North Star Metric

**Weekly active tutoring hours on platform.** Phase 1 gate: 150 hours/week by Week 6. This is the only metric that confirms both supply (tutors) and demand (students booking) are working simultaneously.

### Weekly Monday Morning Dashboard

| Metric | Week 2 target | Week 4 target | Week 8 target | Week 12 target |
|---|---|---|---|---|
| Registered tutors | 25 | 100 | 500 | 1,200 |
| Completed tutor profiles | 15 | 70 | 350 | 900 |
| Registered students | 5 | 40 | 250 | 800 |
| School accounts | 0 | 0 | 1 | 3 |
| Weekly active tutoring hours | 2 | 15 | 75 | 150 |
| MRR | £0 | £58 | £290 | £725 |
| Tutor blended CAC | — | Track only | <£35 | <£18 |
| Parent blended CAC | — | — | <£15 | <£12 |
| Cold email open rate | >35% | >35% | >30% | >28% |
| Cold email reply rate | >5% | >5% | >6% | >7% |
| Referral sign-ups (% of total) | 0% | 5% | 20% | 35% |
| Calculator completions | 50 | 200 | 800 | 2,000 |

### Leading Indicators to Check Weekly

1. **Calculator completions to sign-ups conversion rate** — if this drops below 20%, the sign-up funnel has friction; investigate the page.
2. **Tutor profile completion rate** — tutors who sign up but do not complete their profile within 48 hours churn permanently. Target >70% completion within 48 hours.
3. **Student migration rate per tutor** — target 8 students migrated per tutor in first 14 days. If below 5, the co-branded migration email is not firing or tutors are not sending their student list.
4. **Channel attribution breakdown** — check every Monday which channels drove sign-ups in the prior week. Kill bottom performers. Reallocate time to top performers every 14 days.

### CAC Definitions (must be documented consistently across Sales, Finance, and Marketing)

- **Paid tutor CAC:** total paid media spend ÷ tutors acquired via paid channels only
- **Blended tutor CAC:** total sales and marketing spend (including tool costs, time, events) ÷ total tutors acquired all channels
- **Paid parent CAC:** total paid media spend ÷ parents acquired via paid channels only
- **Blended parent CAC:** total S&M spend ÷ parents acquired all channels
- **Indirect LTV adjustment:** each parent conversion adds £14–£58 additional tutor LTV (parents retained = tutors retained). Track separately from direct parent CAC.

---

## Open Questions and Risks

### Risk 1: Technical Stack Not Ready at Outbound Launch

**Scenario:** Stripe Connect, Daily.co, or Resend are not fully operational when the first 500 cold emails go out. Early tutors sign up, encounter a broken payment or video flow, and churn immediately. Early churn in a marketplace startup destroys social proof at exactly the moment it is needed most.

**Mitigation:** Enforce the pre-launch technical gate as a hard condition (not a target) before any cold outbound fires. Compress the outbound timeline by 2 weeks if necessary — a late start with a working product beats an on-time start with a broken one. Test the full end-to-end flow (sign-up → profile completion → student booking → payment → video session → post-session summary) with 5 internal test accounts before approaching external tutors.

### Risk 2: Referral Mechanic Delayed Beyond Day 14

**Scenario:** The referral programme is deprioritised in favour of outbound sequencing and launches at Day 60 as originally planned. Without tutor-to-tutor referral compounding from Week 2, reaching 1,500 registered tutors by Day 90 requires acquiring every tutor through cold outbound — which at realistic conversion rates (1.5–4% of contactable universe) caps tutor acquisition at 120–400 from cold outreach alone.

**Mitigation:** Treat the Day 14 referral launch as non-negotiable. The co-branded student migration email and the referral badge mechanism are product features, not marketing campaigns — they must be in the sprint backlog before outbound begins. If engineering capacity is constrained, a manual workaround (founder personally sends co-branded migration emails on behalf of the first 50 tutors) preserves the flywheel effect while the automated version is built.

### Risk 3: Commission Messaging Loses Credibility Without Student Supply

**Scenario:** Tutors who investigate fair-do visit the marketplace and find fewer than 50 active profiles. The value proposition ("be found by parents searching for tutors") is undermined by an empty directory. Platform-savvy tutors will not migrate students to a platform where there are no organic parents searching — making the 0% commission argument insufficient on its own.

**Mitigation:** Do not present fair-do primarily as a marketplace in outbound messaging until the marketplace has substance (target: 300+ tutors with complete profiles). Until then, lead exclusively with the zero-commission-on-own-students argument and the admin automation argument — both of which deliver value immediately regardless of marketplace depth. Publish the tutor count publicly (e.g., "Join 147 tutors") and update it weekly — transparent traction builds more trust than a polished empty product.
