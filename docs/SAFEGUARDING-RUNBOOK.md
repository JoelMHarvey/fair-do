# Safeguarding Runbook

Operator-facing step-by-step procedures for each class of safeguarding situation. Reference alongside `docs/SAFEGUARDING-POLICY.md`.

**Responsible person:** Joel Harvey  
**Emergency contacts:** 999 (immediate danger) · 101 (police, non-urgent) · NSPCC 0808 800 5000  
**LADO:** Contact via the local authority for the area where the tutor is based.

---

## How to use this runbook

Read the situation type, follow the numbered steps in order. Do **not** skip the record-keeping step — a written record is required even if you decide not to escalate further.

---

## Situation 1 — Tutor reports a student disclosure during a lesson

*A tutor contacts you saying a student disclosed abuse, neglect, or harm.*

1. **Acknowledge within 1 hour.** Reply to the tutor: "Thank you for reporting this — I am treating it as urgent. Please do not contact the student about this."
2. **Get the details.** Ask the tutor to send (if not already provided):
   - The student's first name and age group
   - What was said, in the student's own words
   - Date and time of the lesson
   - Whether they have concerns the child is in immediate danger *right now*
3. **If immediate danger:** instruct the tutor to call 999 and give the student's address if they have it. You may also call 999 yourself.
4. **If not immediate danger but serious concern:** call the NSPCC professional helpline (0808 800 5000) for guidance on whether to refer. They will tell you whether to contact the local authority children's social care or the police.
5. **If you decide to refer:** contact the student's local authority children's social care or call 101. Give them:
   - The student's first name, age, and area (you may not have full address)
   - A factual account of the disclosure
   - Your name and the platform (fair-do)
   - Do **not** tell the tutor or the student's family that you have referred without checking with the authority first (it could compromise an investigation).
6. **Record everything.** Log in your safeguarding record:
   - Date/time you were notified
   - Tutor username and student first name
   - Summary of what was disclosed
   - Who you consulted (NSPCC, social care, police)
   - What action was taken and by whom
   - Date/time of each step
7. **Follow up with the tutor** to confirm the situation has been referred and they should continue as normal unless instructed otherwise.
8. **Do not discuss the case** with anyone not directly involved.

---

## Situation 2 — Parent or student reports tutor conduct

*A parent or student emails alleging inappropriate behaviour by a tutor — inappropriate comment, contact outside the platform, making a student uncomfortable.*

1. **Acknowledge within 2 hours.** Reply: "Thank you for letting us know. We take this seriously. We will not share your identity with the tutor while we investigate."
2. **Suspend the tutor account immediately** via `/admin` → tutor profile → Suspend. Do this before contacting the tutor.
3. **Preserve evidence.** Screenshot or export:
   - The message thread between tutor and student (admin panel)
   - Any resource files shared
   - Session join/leave logs (Daily webhook data)
4. **Do not alert the tutor** at this stage.
5. **Assess severity.** Is the allegation:
   - Criminal (sexual communication with a child, assault, harassment)? → Step 6a
   - Serious but not criminal (inappropriate comment, persistent boundary-crossing)? → Step 6b
   - Ambiguous or possibly a misunderstanding? → Step 6c
6. **Escalate or investigate:**
   - **6a (criminal):** Contact police on 101. They will advise whether to preserve further evidence. Also contact LADO if the tutor works with children in regulated settings.
   - **6b (serious):** Contact LADO for guidance. Also consider referring to the Teaching Regulation Agency (TRA) if the tutor holds QTS.
   - **6c (ambiguous):** Contact the tutor in writing, stating you have received a concern and are investigating, and that their account is suspended pending outcome. Ask for their account of events. Do not share details of the complainant.
7. **Outcome options:**
   - **Reinstate** — concern not upheld; document reasoning; lift suspension.
   - **Permanent removal** — concern upheld or tutor resigns during investigation. If removal is safeguarding-related, you have a **legal duty to refer to the DBS** (failure is a criminal offence). Do this via the DBS referral form.
   - **Refer to TRA** — if the tutor holds QTS and conduct amounts to serious misconduct.
8. **Record everything** (same fields as Situation 1). Note outcome and rationale.
9. **Follow up with the complainant.** You may not be able to share the outcome, but confirm the report has been acted on.

---

## Situation 3 — Police or statutory authority contacts fair-do

*Police, social services, or LADO contacts you requesting information about a tutor or student.*

1. **Do not discuss the case informally.** Ask for the officer/social worker's name, force/authority, badge/warrant number, and contact number.
2. **Call them back on a published number** to verify identity before sharing anything.
3. **Do not tip off the subject.** A police data request often comes with an instruction not to tell the person being investigated. Even if it doesn't, do not tell them while an investigation is active.
4. **Data sharing:** You may share data under:
   - **Section 29 DPA 2018** — crime prevention/detection (police)
   - **Schedule 2 Part 1 GDPR** — vital interests (child at immediate risk)
   - A formal court order or production order (must be complied with)
   If in doubt, take 30 minutes to call a solicitor before sharing.
5. **What to share:** lesson logs, message threads, join/leave timestamps, DBS numbers, profile data — whatever is specifically requested and relevant.
6. **Record:** who contacted you, what was requested, what was shared, under which legal basis, on what date.
7. **Do not delete or modify** any data relating to the investigation. If you receive a preservation request, do not run any automated data-deletion jobs that might affect the relevant records.

---

## Situation 4 — Teaching Regulation Agency notifies you of a struck-off tutor

*The TRA (or another regulatory body) contacts fair-do to say a tutor has been struck off, prohibited, or is under investigation.*

1. **Suspend the account immediately** before confirming the details.
2. **Reply to the TRA/regulatory body** to confirm receipt and request the formal notice in writing.
3. **Check the TRA database** yourself to verify: [Check a teacher's record — GOV.UK](https://www.gov.uk/check-teachers-record)
4. **If confirmed struck off:** remove the account permanently. Cancel any upcoming booked sessions and refund students.
5. **Notify affected students/parents** (those with upcoming sessions only) in plain terms: "The tutor on your upcoming booking is no longer available. Your lesson has been cancelled and you will receive a full refund." Do not give the reason.
6. **DBS referral:** if you are dismissing the tutor for safeguarding reasons, refer to the DBS even if the TRA is already involved.
7. **Record:** date notified, source, tutor name and username, date of suspension, date of account removal, sessions cancelled, refunds issued.

---

## Situation 5 — Tutor's DBS expires and they continue teaching (missed by the cron)

*The credentials cron should catch this automatically, but if a gap occurs and a tutor is found to have an expired DBS.*

1. **Suspend immediately** via admin panel.
2. **Email the tutor:** "Your DBS certificate has expired. Your account has been paused. Please renew and upload your updated certificate to reactivate."
3. **Do not reactivate** until the new DBS certificate is received and reviewed.
4. **Cancel any sessions** scheduled during the gap period? This is a judgment call based on how long the gap was and the age group of students. For any sessions that took place during the gap with under-18 students, note this in your records.
5. **Record:** the gap duration, sessions affected, action taken.

---

## Situation 6 — Possible grooming / inappropriate content in messages or resources

*You spot or are alerted to concerning language in the message thread or an inappropriate file in the resource library.*

1. **Preserve evidence immediately.** Screenshot or export before taking any action that might be visible to the tutor.
2. **Suspend the tutor account.**
3. **Assess:** Is this clearly criminal (sexual communication with a child under 16 is a criminal offence under Section 15A Sexual Offences Act 2003)?
   - **Yes:** report to police on 101 (or 999 if child is at immediate risk). If the content includes images of child sexual abuse, report to the **Internet Watch Foundation** (IWF) at report.iwf.org.uk.
   - **Unclear / boundary violation:** contact NSPCC or LADO for guidance.
4. **Do not delete the content** until police advise it is safe to do so.
5. **Notify the student's parent/guardian** (if the student is a minor) that you are investigating a concern. Do not share specifics.
6. **Record everything.**

---

## Situation 7 — Student discloses self-harm or suicidal ideation via message

*A student sends a message through the platform that suggests they are harming themselves or thinking about suicide.*

1. **Do not ignore it.** Even if it seems hyperbolic, treat it as real.
2. **If the tutor has flagged it:** acknowledge the tutor and advise them to:
   - Tell the student they are being heard and taken seriously.
   - Not make promises about confidentiality.
   - Share the Samaritans number (116 123, free, 24/7) with the student.
   - If the student is a minor and in immediate risk: the tutor should contact the student's parent/guardian and/or 999.
3. **If you've spotted it directly (e.g. admin view):** contact the tutor immediately so they can respond in-session.
4. **If the student is an adult:** signpost support (Samaritans 116 123, CALM 0800 58 58 58). You cannot share their details with a third party without consent unless they are in immediate danger.
5. **Record:** date, student username, nature of concern, action taken, who was contacted.
6. **Follow up with the tutor** to check how the student is doing.

---

## Record-keeping template

Use this for every situation. Store in a secure, access-controlled location (not a shared inbox).

```
Date/time of concern: 
Reported by (tutor username or external party): 
Student (first name + age group only): 
Summary of concern (factual, in reporter's own words): 

Actions taken:
  [ ]  [Date/time] Acknowledged reporter
  [ ]  [Date/time] Account suspended
  [ ]  [Date/time] Evidence preserved
  [ ]  [Date/time] External consultation (who: )
  [ ]  [Date/time] Referral made (to: )
  [ ]  [Date/time] Outcome: [reinstated / removed / referred / pending]
  [ ]  [Date/time] DBS referral (if dismissal for safeguarding reasons)
  [ ]  [Date/time] Complainant follow-up

Notes / rationale for decisions:
```

---

## Quick-reference response times

| Situation | First response | Resolution target |
|-----------|---------------|-------------------|
| Child in immediate danger | Call 999 now | Same day |
| Tutor conduct complaint | 2 hours | Account suspended within 2 hours; investigation within 48 hours |
| Student disclosure via tutor | 1 hour | Referral decision within 24 hours |
| TRA / regulatory notification | Same day | Account removed same day if confirmed |
| Expired DBS | Same day | Account suspended same day |
| Police / statutory data request | Same day | Data shared within timeframe specified (usually 24–72 hours) |
| Self-harm disclosure | Same day | Tutor contacted within 1 hour |

---

*Last updated: July 2026. Review alongside SAFEGUARDING-POLICY.md.*
