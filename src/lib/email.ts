import { Resend } from 'resend'
import { buildSessionICS } from './ics'
import type { EmailBrand } from './email-brand'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// Resend resolves `{ error }` on an API failure instead of throwing, so a naive
// `await sendEmail(...)` silently swallows dropped emails. This wrapper
// throws, so callers' `.catch()` / `Promise.allSettled` accounting (reminder guards,
// broadcast delivered-counts) actually reflect failures.
async function sendEmail(payload: Parameters<InstanceType<typeof Resend>['emails']['send']>[0]) {
  const resend = getResend()
  const { error } = await resend.emails.send(payload)
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}

const FROM = process.env.RESEND_FROM ?? 'fair-do <onboarding@resend.dev>'
const APP = () => process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'

// When branded, swap the display name to the studio while keeping the verified
// sending address (preserves SPF/DKIM — no deliverability risk).
function senderFrom(brand?: EmailBrand | null): string {
  if (!brand) return FROM
  const addr = FROM.match(/<([^>]+)>/)?.[1] ?? FROM
  return `${brand.practiceName} <${addr}>`
}

// Shared branded shell. Gmail strips inline SVG, so the unbranded logo is a
// styled wordmark. With a brand, the studio logo (or name in the accent colour)
// replaces the fair-do header, and the CTA button uses the brand colour.
function layout(
  opts: { heading: string; body: string; cta?: { label: string; url: string }; preheader?: string },
  brand?: EmailBrand | null,
): string {
  const color = brand?.color ?? '#217567'

  const headerHtml = brand
    ? `<div style="padding:6px 6px 16px">
        ${brand.logoUrl
          ? `<img src="${brand.logoUrl}" alt="${escapeHtml(brand.practiceName)}" style="height:40px;display:block;max-width:220px" />`
          : `<span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:${color}">${escapeHtml(brand.practiceName)}</span>`}
      </div>`
    : `<div style="padding:6px 6px 16px">
        <span style="display:inline-block;width:16px;height:16px;border-radius:5px;background:#217567;vertical-align:middle;margin-right:8px"></span>
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#1d5d53;vertical-align:middle">fair-do</span>
      </div>`

  const footerHtml = brand
    ? `<div style="text-align:center;padding:18px 8px;color:#b8a78e;font-size:12px;line-height:1.6">
        ${brand.footerLine ? `<p style="margin:0 0 4px">${escapeHtml(brand.footerLine)}</p>` : ''}
        <p style="margin:0 0 4px">Powered by <a href="https://fair-do.com" style="color:#b8a78e;text-decoration:underline">fair-do</a></p>
      </div>`
    : `<div style="text-align:center;padding:18px 8px;color:#b8a78e;font-size:12px;line-height:1.6">
        <p style="margin:0 0 4px">fair-do · fair rates for independent tutors</p>
      </div>`

  return `
<div style="background:#faf8f5;padding:24px 0;font-family:Helvetica,Arial,sans-serif">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preheader}</div>` : ''}
  <div style="max-width:560px;margin:0 auto">
    ${headerHtml}
    <div style="background:#ffffff;border:1px solid #e8e1d5;border-radius:16px;padding:32px">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#193e39;margin:0 0 14px">${opts.heading}</h1>
      <div style="color:#665a4b;font-size:15px;line-height:1.6">${opts.body}</div>
      ${opts.cta ? `<div style="margin-top:26px"><a href="${opts.cta.url}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">${opts.cta.label}</a></div>` : ''}
    </div>
    ${footerHtml}
  </div>
</div>`
}

// Escapes user-authored text before it goes into an HTML email.
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const strong = (t: string) => `<strong style="color:#2e2920">${t}</strong>`
const link = (t: string, url: string) => `<a href="${url}" style="color:#217567;text-decoration:underline">${t}</a>`

// ── fair-do-to-teacher emails (never branded) ─────────────────────────────────

export async function sendTeacherApproved(opts: { email: string; firstName: string; qualificationBody: string }) {
  await sendEmail({
    from: FROM,
    to: opts.email,
    subject: 'You\'re approved — welcome to fair-do',
    html: layout({
      heading: `Welcome to fair-do, ${opts.firstName}`,
      preheader: 'Your profile is live — students can book you now.',
      body: `<p style="margin:0 0 10px">Your ${opts.qualificationBody} credentials have been verified, and your profile is now live. Students can book lessons with you.</p>
        <p style="margin:0;color:#80705c;font-size:14px">You keep <strong style="color:#217567">what you charge</strong> — we take no commission on your own students. Payouts reach your bank 2 business days after each completed lesson.</p>`,
      cta: { label: 'Go to your dashboard', url: `${APP()}/teacher/dashboard` },
    }),
  })
}

// Ad-hoc message from an admin to a teacher during review — e.g. asking for a
// missing certificate or a clarification before approving. Platform-branded.
export async function sendTeacherAdminMessage(opts: { email: string; firstName: string; subject: string; body: string }) {
  const htmlBody = escapeHtml(opts.body).replace(/\r?\n/g, '<br>')
  await sendEmail({
    from: FROM,
    to: opts.email,
    subject: opts.subject,
    html: layout({
      heading: opts.subject,
      preheader: opts.body.slice(0, 110),
      body: `<p style="margin:0 0 12px">Hi ${escapeHtml(opts.firstName)},</p>
        <div style="color:#665a4b;font-size:15px;line-height:1.6">${htmlBody}</div>
        <p style="margin:16px 0 0;color:#80705c;font-size:14px">— The fair-do team</p>`,
    }),
  })
}

/** @deprecated use sendTeacherAdminMessage */
export const sendTherapistAdminMessage = sendTeacherAdminMessage

export async function sendTeacherRejected(opts: { email: string; firstName: string; qualificationBody: string }) {
  await sendEmail({
    from: FROM,
    to: opts.email,
    subject: 'Your fair-do application — next steps',
    html: layout({
      heading: `Hi ${opts.firstName},`,
      preheader: 'A quick note about your application.',
      body: `<p style="margin:0 0 12px">We weren't able to verify your ${opts.qualificationBody} credentials with the details provided — often this is an expired qualification or a reference entry error.</p>
        <p style="margin:0">Please re-apply with updated details, or email ${link('support@fair-do.com', 'mailto:support@fair-do.com')} if you believe this is a mistake.</p>`,
    }),
  })
}

// Qualification expiry nudge. `kind` is "qualification" or "dbs".
export async function sendCredentialExpiryReminder(opts: {
  email: string; firstName: string; kind: 'registration' | 'insurance'; body?: string; expiry: Date; daysUntil: number
}) {
  const label = opts.kind === 'registration' ? `${opts.body ?? 'qualification'} credential` : 'DBS certificate'
  const when = opts.expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const expired = opts.daysUntil <= 0
  const heading = expired ? `Your ${label} has expired` : `Your ${label} expires soon`
  const lead = expired
    ? `Our records show your ${label} expired on ${strong(when)}. To keep your fair-do profile active, please renew it and update your details. If we don't have a valid date on file, your profile will be paused from new bookings.`
    : `Your ${label} on file expires on ${strong(when)} — that's ${strong(`${opts.daysUntil} day${opts.daysUntil === 1 ? '' : 's'}`)} away. Please renew it in good time so your profile stays active.`
  await sendEmail({
    from: FROM, to: opts.email,
    subject: expired ? `Action needed: your ${label} has expired` : `Reminder: your ${label} expires in ${opts.daysUntil} days`,
    html: layout({
      heading,
      preheader: expired ? 'Renew to keep your profile active.' : `Expires ${when}.`,
      body: `<p style="margin:0 0 12px">Hi ${opts.firstName},</p><p style="margin:0 0 12px">${lead}</p>
        <p style="margin:0;color:#80705c;font-size:14px">Already renewed? Update the date on your profile and this reminder stops.</p>`,
      cta: { label: 'Update my details', url: `${APP()}/teacher/profile` },
    }),
  })
}

// Sent when an expired credential has passed the grace window and the profile is paused.
export async function sendCredentialSuspended(opts: {
  email: string; firstName: string; kind: 'registration' | 'insurance'; body?: string; expiry: Date
}) {
  const label = opts.kind === 'registration' ? `${opts.body ?? 'qualification'} credential` : 'DBS certificate'
  const when = opts.expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  await sendEmail({
    from: FROM, to: opts.email,
    subject: 'Your fair-do profile has been paused',
    html: layout({
      heading: 'Your profile has been paused',
      preheader: 'Renew your credentials to reactivate.',
      body: `<p style="margin:0 0 12px">Hi ${opts.firstName},</p>
        <p style="margin:0 0 12px">Your ${label} expired on ${strong(when)} and is now past our grace period, so we've paused your profile from taking new bookings.</p>
        <p style="margin:0 0 12px">Any lessons already booked are unaffected — please continue to honour them. To reactivate, renew your ${label} and update the date on your profile, or email ${link('support@fair-do.com', 'mailto:support@fair-do.com')} for help.</p>`,
      cta: { label: 'Update my details', url: `${APP()}/teacher/profile` },
    }),
  })
}

// Operational alert digest to the on-call/founder inbox. Never branded.
export async function sendOpsAlert(opts: { to: string; firing: string[]; resolved: string[] }) {
  const sev = opts.firing.length > 0
  const items = (arr: string[], colour: string) => arr.map(s => `<li style="margin:6px 0;color:${colour}">${s}</li>`).join('')
  const body = `
    ${opts.firing.length ? `<p style="margin:0 0 6px;font-weight:bold;color:#c93f1f">New / ongoing issues</p><ul style="margin:0 0 14px;padding-left:18px">${items(opts.firing, '#c93f1f')}</ul>` : ''}
    ${opts.resolved.length ? `<p style="margin:0 0 6px;font-weight:bold;color:#217567">Resolved</p><ul style="margin:0 0 6px;padding-left:18px">${items(opts.resolved, '#217567')}</ul>` : ''}`
  await sendEmail({
    from: FROM, to: opts.to,
    subject: sev ? `⚠️ fair-do: ${opts.firing.length} issue${opts.firing.length === 1 ? '' : 's'}` : '✅ fair-do: issues resolved',
    html: layout({
      heading: sev ? 'fair-do monitoring alert' : 'fair-do: all clear',
      preheader: sev ? opts.firing[0] : 'Previously-flagged issues are resolved.',
      body,
      cta: { label: 'Open health dashboard', url: `${APP()}/admin/health` },
    }),
  })
}

// Gift vouchers — platform-issued, not studio-branded.
export async function sendGiftVoucher(opts: { to: string; code: string; amountPence: number; message?: string; fromPurchaser: boolean }) {
  const amount = `£${(opts.amountPence / 100).toFixed(2)}`
  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: opts.fromPurchaser ? `Your fair-do gift receipt — ${amount}` : `You've been gifted ${amount} of tuition`,
    html: layout({
      heading: opts.fromPurchaser ? 'Thank you for your gift' : 'A gift for you',
      preheader: opts.fromPurchaser ? 'Your voucher code is inside.' : `${amount} of tuition, on someone who cares.`,
      body: `
        <p style="margin:0 0 16px">${opts.fromPurchaser
          ? `Your ${amount} tuition voucher is ready. Share this code with your recipient:`
          : `Someone wants to help you learn. Here's ${amount} of tuition credit, on them.`}</p>
        ${opts.message ? `<blockquote style="border-left:3px solid #217567;padding-left:14px;color:#665a4b;font-style:italic;margin:0 0 16px">${opts.message}</blockquote>` : ''}
        <div style="background:#f0faf7;border:1px solid #b0e1d3;border-radius:14px;padding:20px;text-align:center;margin:0 0 4px">
          <p style="font-size:13px;color:#80705c;margin:0 0 6px">Voucher code</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:2px;color:#1d5d53;margin:0;font-family:'Courier New',monospace">${opts.code}</p>
        </div>`,
      cta: { label: 'Redeem now', url: `${APP()}/redeem` },
    }),
  })
}

// ── Student-facing emails (brandable) ─────────────────────────────────────────
// All accept `brand?: EmailBrand | null`. Callers resolve the brand via
// `resolveEmailBrand(teacherId)` from `./email-brand` before calling.
// Passing null/undefined → fair-do default rendering.

// Double opt-in confirmation for a public self-booking.
export async function sendSelfBookingConfirm(opts: {
  email: string; firstName: string; teacherName: string; scheduledAt: Date; confirmUrl: string
  brand?: EmailBrand | null
}) {
  const when = opts.scheduledAt.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.email,
    replyTo: opts.brand?.replyTo,
    subject: `Confirm your lesson with ${opts.brand?.practiceName ?? opts.teacherName}`,
    html: layout({
      heading: 'Confirm your booking',
      preheader: `Tap to confirm ${when}.`,
      body: `<p style="margin:0 0 12px">Hi ${opts.firstName},</p>
        <p style="margin:0 0 12px">You requested a lesson with ${strong(opts.brand?.practiceName ?? opts.teacherName)} on ${strong(when)}. Tap below to confirm — your booking isn't held until you do.</p>
        <p style="margin:0;color:#80705c;font-size:14px">Didn't request this? You can ignore this email; nothing was booked.</p>`,
      cta: { label: 'Confirm my lesson', url: opts.confirmUrl },
    }, opts.brand),
  })
}

export async function sendBookingConfirmed(opts: {
  clientEmail: string; clientFirstName: string; teacherEmail: string
  teacherFirstName: string; teacherLastName: string; sessionId: string; scheduledAt: Date; ratePence: number
  brand?: EmailBrand | null
  locale?: string
}) {
  const resend = getResend()
  const clientLocale = opts.locale ?? 'en-GB'
  const dateStrClient = opts.scheduledAt.toLocaleString(clientLocale, { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const dateStrTeacher = opts.scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const rateStr = `£${(opts.ratePence / 100).toFixed(0)}`
  const sessionUrl = `${APP()}/session/${opts.sessionId}`
  const ics = buildSessionICS({
    sessionId: opts.sessionId,
    start: opts.scheduledAt,
    teacherName: `${opts.teacherFirstName} ${opts.teacherLastName}`,
    joinUrl: sessionUrl,
    practiceName: opts.brand?.practiceName,
  })
  const icsAttachment = { filename: 'fair-do-lesson.ics', content: Buffer.from(ics).toString('base64') }
  const displayName = opts.brand?.practiceName ?? `${opts.teacherFirstName} ${opts.teacherLastName}`

  await Promise.allSettled([
    // Student copy — branded, localised
    resend.emails.send({
      from: senderFrom(opts.brand),
      to: opts.clientEmail,
      replyTo: opts.brand?.replyTo,
      subject: `Lesson confirmed — ${displayName}, ${dateStrClient}`,
      attachments: [icsAttachment],
      html: layout({
        heading: `You're booked, ${opts.clientFirstName}`,
        preheader: `Your lesson with ${displayName} is confirmed for ${dateStrClient}.`,
        body: `
          <p style="margin:0 0 4px">Tutor: ${strong(displayName)}</p>
          <p style="margin:0 0 4px">When: ${strong(dateStrClient)}</p>
          <p style="margin:0 0 14px">Paid: ${strong(rateStr)}</p>
          <p style="margin:0 0 6px;color:#80705c;font-size:14px">The calendar invite is attached, and the video room opens 10 minutes before your lesson.</p>
          <p style="margin:0;color:#80705c;font-size:14px">Need to cancel? ${link('Manage your booking', sessionUrl)} — free up to 24 hours before.</p>`,
        cta: { label: 'View lesson', url: sessionUrl },
      }, opts.brand),
    }),
    // Teacher copy — always platform-branded, always en-GB
    resend.emails.send({
      from: FROM, to: opts.teacherEmail,
      subject: `New lesson booked — ${dateStrTeacher}`,
      attachments: [icsAttachment],
      html: layout({
        heading: `New lesson, ${opts.teacherFirstName}`,
        preheader: `${opts.clientFirstName} booked you for ${dateStrTeacher}.`,
        body: `<p style="margin:0 0 4px">Student: ${strong(opts.clientFirstName)}</p>
          <p style="margin:0">When: ${strong(dateStrTeacher)}</p>`,
        cta: { label: 'View lesson', url: sessionUrl },
      }),
    }),
  ])
}

export async function sendSessionReminder(opts: {
  clientEmail: string; clientFirstName: string; teacherFirstName: string; teacherLastName: string; sessionId: string; scheduledAt: Date
  brand?: EmailBrand | null
  locale?: string
}) {
  const clientLocale = opts.locale ?? 'en-GB'
  const dateStr = opts.scheduledAt.toLocaleString(clientLocale, { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const sessionUrl = `${APP()}/session/${opts.sessionId}`
  const displayName = opts.brand?.practiceName ?? `${opts.teacherFirstName} ${opts.teacherLastName}`
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.clientEmail,
    replyTo: opts.brand?.replyTo,
    subject: `Reminder: your lesson tomorrow — ${dateStr}`,
    html: layout({
      heading: `See you soon, ${opts.clientFirstName}`,
      preheader: `Your lesson with ${displayName} is coming up.`,
      body: `<p style="margin:0 0 4px">Your lesson with ${strong(displayName)} is on ${strong(dateStr)}.</p>
        <p style="margin:0 0 14px;color:#80705c;font-size:14px">The room opens 10 minutes before.</p>
        <p style="margin:0;color:#80705c;font-size:14px">Can't make it? ${link('Cancel here', sessionUrl)} — cancellations within 24 hours are non-refundable.</p>`,
      cta: { label: 'View lesson', url: sessionUrl },
    }, opts.brand),
  })
}

export async function sendNoShowNotice(opts: {
  clientEmail: string; clientFirstName: string; teacherName: string; scheduledAt: Date
  reason: 'teacher-no-show' | 'no-one-joined' | 'student-no-show'; refunded: boolean
  brand?: EmailBrand | null
}) {
  const dateStr = opts.scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const displayName = opts.brand?.practiceName ?? opts.teacherName
  const body =
    opts.reason === 'student-no-show'
      ? `Our records show the lesson with ${displayName} on ${strong(dateStr)} wasn't attended from your side. As the tutor was available, this lesson isn't refundable — but if something went wrong, ${link('tell us', 'mailto:support@fair-do.com')}.`
      : opts.reason === 'teacher-no-show'
        ? `We're sorry — it looks like your tutor didn't join the lesson on ${strong(dateStr)}.`
        : `It looks like the lesson on ${strong(dateStr)} didn't take place.`
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.clientEmail,
    replyTo: opts.brand?.replyTo,
    subject: `About your lesson — ${dateStr}`,
    html: layout({
      heading: `Hi ${opts.clientFirstName},`,
      preheader: 'An update about your recent lesson.',
      body: `<p style="margin:0">${body}</p>
        ${opts.refunded ? `<p style="margin:14px 0 0;color:#217567">A full refund has been issued — card refunds take 5–10 business days; credit/voucher funds are back in your balance now.</p>` : ''}`,
      cta: opts.reason !== 'student-no-show' ? { label: 'Book another lesson', url: `${APP()}/tutors` } : undefined,
    }, opts.brand),
  })
}

export async function sendClientInvite(opts: {
  to: string; firstName?: string | null; practiceName: string; acceptUrl: string
  customRatePence?: number | null; note?: string | null
  brand?: EmailBrand | null
}) {
  const hi = escapeHtml(opts.firstName?.trim() ? opts.firstName.trim() : 'there')
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  const note = opts.note ? escapeHtml(opts.note) : null
  const rateLine = opts.customRatePence != null
    ? `<p style="margin:0 0 14px">Your lesson rate is ${strong(`£${(opts.customRatePence / 100).toFixed(0)}`)}/lesson.</p>`
    : ''
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.to,
    replyTo: opts.brand?.replyTo,
    subject: `${opts.brand?.practiceName ?? opts.practiceName} has invited you to book lessons on fair-do`,
    html: layout({
      heading: `Hi ${hi},`,
      preheader: `${practice} uses fair-do to manage lessons, payments and your calendar.`,
      body: `
        <p style="margin:0 0 14px">${strong(practice)} would like to see you on fair-do — a simple, secure place to book lessons, join by video and pay, all in one spot.</p>
        ${note ? `<blockquote style="border-left:3px solid #217567;padding-left:14px;color:#665a4b;font-style:italic;margin:0 0 16px">${note}</blockquote>` : ''}
        ${rateLine}
        <p style="margin:0;color:#80705c;font-size:14px">Accepting just links you to your tutor's studio — nothing is charged until you book a lesson.</p>`,
      cta: { label: 'Accept your invite', url: opts.acceptUrl },
    }, opts.brand),
  })
}

export async function sendSessionScheduledByTherapist(opts: {
  clientEmail: string; clientFirstName: string; teacherFirstName: string; teacherLastName: string
  practiceName: string; scheduledAt: Date; ratePence: number; sessionUrl: string; payUrl?: string
  brand?: EmailBrand | null
}) {
  const dateStr = opts.scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const rateStr = `£${(opts.ratePence / 100).toFixed(0)}`
  const needsPay = !!opts.payUrl
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  const hiName = escapeHtml(opts.clientFirstName)
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.clientEmail,
    replyTo: opts.brand?.replyTo,
    subject: needsPay
      ? `Confirm your lesson with ${opts.brand?.practiceName ?? opts.teacherFirstName} — ${dateStr}`
      : `Lesson booked with ${opts.brand?.practiceName ?? opts.teacherFirstName} — ${dateStr}`,
    html: layout({
      heading: `Hi ${hiName},`,
      preheader: needsPay
        ? `${practice} has scheduled a lesson — confirm and pay to lock it in.`
        : `${practice} has booked you in for ${dateStr}.`,
      body: `
        <p style="margin:0 0 4px">${strong(practice)} has scheduled a lesson for you.</p>
        <p style="margin:0 0 4px">When: ${strong(dateStr)}</p>
        <p style="margin:0 0 14px">${needsPay ? 'Amount to confirm' : 'Fee'}: ${strong(rateStr)}</p>
        ${needsPay
          ? `<p style="margin:0;color:#80705c;font-size:14px">Tap below to confirm and pay securely. Your video room opens 10 minutes before the lesson.</p>`
          : `<p style="margin:0;color:#80705c;font-size:14px">Your video room opens 10 minutes before the lesson. Your tutor will arrange payment with you directly.</p>`}`,
      cta: needsPay
        ? { label: 'Confirm & pay', url: opts.payUrl! }
        : { label: 'View lesson', url: opts.sessionUrl },
    }, opts.brand),
  })
}

export async function sendClientBroadcast(opts: {
  to: string; clientFirstName: string; practiceName: string; subject: string; body: string
  brand?: EmailBrand | null
}) {
  const htmlBody = escapeHtml(opts.body).replace(/\r?\n/g, '<br>')
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.to,
    replyTo: opts.brand?.replyTo,
    subject: opts.subject,
    html: layout({
      heading: opts.subject,
      preheader: opts.body.slice(0, 110),
      body: `
        <p style="margin:0 0 14px">Hi ${escapeHtml(opts.clientFirstName)},</p>
        <div style="color:#665a4b;font-size:15px;line-height:1.6">${htmlBody}</div>
        <p style="margin:18px 0 0;color:#b8a78e;font-size:12px">You're receiving this because you're a student of ${practice} on fair-do.</p>`,
    }, opts.brand),
  })
}

// A personalised calendar invite to one student (named, on the studio letterhead, with
// the .ics attached). `ics` is built per-student by the caller so the ATTENDEE is this person.
export async function sendClientEventInvite(opts: {
  to: string; clientFirstName: string; practiceName: string
  title: string; whenLabel: string; location?: string; joinUrl?: string; note?: string
  ics: string
  brand?: EmailBrand | null
}) {
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  const noteHtml = opts.note?.trim() ? `<div style="color:#665a4b;font-size:15px;line-height:1.6;margin:0 0 14px">${escapeHtml(opts.note).replace(/\r?\n/g, '<br>')}</div>` : ''
  const rows = [
    `<p style="margin:0 0 4px">When: ${strong(escapeHtml(opts.whenLabel))}</p>`,
    opts.location ? `<p style="margin:0 0 4px">Where: ${strong(escapeHtml(opts.location))}</p>` : '',
    opts.joinUrl ? `<p style="margin:0 0 4px">Join: ${link('Open link', opts.joinUrl)}</p>` : '',
  ].filter(Boolean).join('')
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.to,
    replyTo: opts.brand?.replyTo,
    subject: `Invitation: ${opts.title}`,
    attachments: [{ filename: 'invite.ics', content: Buffer.from(opts.ics).toString('base64'), contentType: 'text/calendar' }],
    html: layout({
      heading: escapeHtml(opts.title),
      preheader: `${opts.title} — ${opts.whenLabel}`,
      body: `
        <p style="margin:0 0 14px">Hi ${escapeHtml(opts.clientFirstName)},</p>
        ${noteHtml}
        ${rows}
        <p style="margin:14px 0 0;color:#80705c;font-size:14px">The calendar invite is attached — open it to add this to your calendar.</p>
        <p style="margin:14px 0 0;color:#b8a78e;font-size:12px">You're receiving this because you're a student of ${practice} on fair-do.</p>`,
    }, opts.brand),
  })
}

export async function sendSessionSeriesScheduled(opts: {
  clientEmail: string; clientFirstName: string; teacherFirstName: string; teacherLastName: string
  practiceName: string; firstDate: Date; count: number; viaPackage: boolean; sessionUrl: string
  brand?: EmailBrand | null
}) {
  const dateStr = opts.firstDate.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.clientEmail,
    replyTo: opts.brand?.replyTo,
    subject: `${opts.count} lessons booked with ${opts.brand?.practiceName ?? opts.teacherFirstName} — starting ${opts.firstDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
    html: layout({
      heading: `Hi ${escapeHtml(opts.clientFirstName)},`,
      preheader: `${practice} has booked you a weekly series of ${opts.count} lessons.`,
      body: `
        <p style="margin:0 0 4px">${strong(practice)} has scheduled a weekly series for you.</p>
        <p style="margin:0 0 4px">Lessons: ${strong(`${opts.count}, weekly`)}</p>
        <p style="margin:0 0 14px">First lesson: ${strong(dateStr)}</p>
        <p style="margin:0;color:#80705c;font-size:14px">${opts.viaPackage
          ? 'These come from your package — nothing more to pay. Each room opens 10 minutes before.'
          : 'Your tutor will arrange payment with you directly. Each room opens 10 minutes before.'}</p>`,
      cta: { label: 'View your next lesson', url: opts.sessionUrl },
    }, opts.brand),
  })
}

export async function sendPackageOffered(opts: {
  clientEmail: string; clientFirstName: string; practiceName: string
  packageName: string; sessionsTotal: number; pricePence: number; payUrl: string
  brand?: EmailBrand | null
}) {
  const price = `£${(opts.pricePence / 100).toFixed(0)}`
  const per = `£${(opts.pricePence / opts.sessionsTotal / 100).toFixed(0)}`
  const practice = escapeHtml(opts.brand?.practiceName ?? opts.practiceName)
  await sendEmail({
    from: senderFrom(opts.brand),
    to: opts.clientEmail,
    replyTo: opts.brand?.replyTo,
    subject: `${opts.brand?.practiceName ?? opts.practiceName} — your ${opts.packageName}`,
    html: layout({
      heading: `Hi ${escapeHtml(opts.clientFirstName)},`,
      preheader: `${practice} has put together a ${opts.sessionsTotal}-lesson package for you.`,
      body: `
        <p style="margin:0 0 4px">${strong(practice)} has offered you a lesson package.</p>
        <p style="margin:0 0 4px">Package: ${strong(escapeHtml(opts.packageName))}</p>
        <p style="margin:0 0 4px">Lessons: ${strong(String(opts.sessionsTotal))} (${per} each)</p>
        <p style="margin:0 0 14px">Total: ${strong(price)}</p>
        <p style="margin:0;color:#80705c;font-size:14px">Pay once below — then each lesson you book draws from your package, no card needed.</p>`,
      cta: { label: 'Buy package', url: opts.payUrl },
    }, opts.brand),
  })
}

export async function sendCancellationNotice(opts: {
  clientEmail: string; clientFirstName: string; teacherEmail: string
  teacherFirstName: string; teacherLastName: string; scheduledAt: Date; cancelledBy: 'student' | 'teacher'; refunded: boolean
  brand?: EmailBrand | null
  locale?: string
}) {
  const resend = getResend()
  const clientLocale = opts.locale ?? 'en-GB'
  const dateStrClient = opts.scheduledAt.toLocaleString(clientLocale, { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const dateStrTeacher = opts.scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  const displayName = opts.brand?.practiceName ?? `${opts.teacherFirstName} ${opts.teacherLastName}`

  await Promise.allSettled([
    // Student copy — branded, localised
    resend.emails.send({
      from: senderFrom(opts.brand),
      to: opts.clientEmail,
      replyTo: opts.brand?.replyTo,
      subject: `Lesson cancelled — ${dateStrClient}`,
      html: layout({
        heading: 'Lesson cancelled',
        preheader: `Your lesson on ${dateStrClient} was cancelled.`,
        body: `<p style="margin:0">Your lesson with ${strong(displayName)} on ${strong(dateStrClient)} has been cancelled.</p>
          ${opts.refunded
            ? `<p style="margin:14px 0 0;color:#217567">A full refund has been issued — card refunds appear in 5–10 business days; credit/voucher funds are back in your balance now.</p>`
            : `<p style="margin:14px 0 0;color:#80705c;font-size:14px">As this was cancelled within 24 hours, no refund is available.</p>`}`,
        cta: { label: 'Find another time', url: `${APP()}/tutors` },
      }, opts.brand),
    }),
    // Teacher copy — always platform-branded, always en-GB
    resend.emails.send({
      from: FROM, to: opts.teacherEmail,
      subject: `Lesson cancelled — ${dateStrTeacher}`,
      html: layout({
        heading: 'Lesson cancelled',
        preheader: `A lesson on ${dateStrTeacher} was cancelled.`,
        body: `<p style="margin:0">Your lesson with ${strong(opts.clientFirstName)} on ${strong(dateStrTeacher)} has been cancelled by the ${opts.cancelledBy === 'teacher' ? 'tutor' : 'student'}.</p>`,
      }),
    }),
  ])
}
