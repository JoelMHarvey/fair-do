import { prisma } from '@/lib/prisma'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { requireSchoolAdmin, SchoolAccessError } from '@/lib/org'
import { getSchoolApiContext } from '@/lib/school'
import { allDaySpan, EVENT_KINDS, parseICS } from '@/lib/school-calendar'
import { z } from 'zod'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/

// Manual event: all-day by default (dates only, end inclusive as typed);
// adding times makes it a timed event on startDate.
const eventSchema = z.object({
  title: z.string().min(1).max(160),
  kind: z.enum(EVENT_KINDS),
  startDate: z.string().regex(DATE),
  endDate: z.string().regex(DATE).optional(),
  startTime: z.string().regex(TIME).optional(),
  endTime: z.string().regex(TIME).optional(),
})

// ICS import: preview parses and returns the events; commit stores them with
// the admin-chosen kind applied to the whole file.
const importSchema = z.object({
  ics: z.string().min(1).max(1_000_000),
  kind: z.enum(EVENT_KINDS).default('event'),
  commit: z.boolean().default(false),
})

const bodySchema = z.union([z.object({ event: eventSchema }), importSchema])

function forbidden() {
  return Response.json({ error: 'School admin access required' }, { status: 403 })
}

type Ctx = { params: Promise<{ id: string }> }

async function calendarForOrg(id: string, orgId: string) {
  return prisma.orgCalendar.findFirst({ where: { id, organisationId: orgId } })
}

export async function GET(_req: Request, { params }: Ctx) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    const { id } = await params
    if (!(await calendarForOrg(id, org.id))) return Response.json({ error: 'Calendar not found' }, { status: 404 })

    const events = await prisma.orgCalendarEvent.findMany({ where: { calendarId: id }, orderBy: { startsAt: 'asc' } })
    return Response.json({ events })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}

export async function POST(req: Request, { params }: Ctx) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    const { id } = await params
    if (!(await calendarForOrg(id, org.id))) return Response.json({ error: 'Calendar not found' }, { status: 404 })

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

    // ── Single manual event ──────────────────────────────────────────────
    if ('event' in parsed.data) {
      const ev = parsed.data.event
      const timed = !!ev.startTime
      let startsAt: Date
      let endsAt: Date
      let allDay: boolean
      if (timed) {
        startsAt = new Date(`${ev.startDate}T${ev.startTime}:00Z`)
        endsAt = ev.endTime ? new Date(`${ev.endDate ?? ev.startDate}T${ev.endTime}:00Z`) : startsAt
        allDay = false
        if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || endsAt < startsAt) {
          return Response.json({ error: 'Invalid date/time range' }, { status: 400 })
        }
      } else {
        const span = allDaySpan(ev.startDate, ev.endDate)
        if (!span) return Response.json({ error: 'Invalid date range' }, { status: 400 })
        ;({ startsAt, endsAt } = span)
        allDay = true
      }
      const event = await prisma.orgCalendarEvent.create({
        data: { calendarId: id, title: ev.title, kind: ev.kind, startsAt, endsAt, allDay },
      })
      return Response.json({ event }, { status: 201 })
    }

    // ── ICS import (preview → commit) ────────────────────────────────────
    const { ics, kind, commit } = parsed.data
    const events = parseICS(ics)
    if (events.length === 0) {
      return Response.json({ error: 'No events found in that file — is it a valid .ics calendar?' }, { status: 422 })
    }
    if (events.length > 1000) {
      return Response.json({ error: 'That file has more than 1,000 events — import a smaller range.' }, { status: 422 })
    }
    if (!commit) {
      return Response.json({ preview: events.map(e => ({ title: e.title, startsAt: e.startsAt, endsAt: e.endsAt, allDay: e.allDay })) })
    }
    const created = await prisma.orgCalendarEvent.createMany({
      data: events.map(e => ({ calendarId: id, title: e.title, kind, startsAt: e.startsAt, endsAt: e.endsAt, allDay: e.allDay })),
    })
    return Response.json({ imported: created.count }, { status: 201 })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}

// DELETE /api/school/calendars/[id]/events?eventId=… — remove one event.
export async function DELETE(req: Request, { params }: Ctx) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })
  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    const { org } = await requireSchoolAdmin(tenantScopedOrgId)
    const { id } = await params
    if (!(await calendarForOrg(id, org.id))) return Response.json({ error: 'Calendar not found' }, { status: 404 })

    const eventId = new URL(req.url).searchParams.get('eventId')
    if (!eventId) return Response.json({ error: 'eventId required' }, { status: 400 })

    // Scoped deleteMany: an eventId from another calendar/tenant deletes nothing.
    const res = await prisma.orgCalendarEvent.deleteMany({ where: { id: eventId, calendarId: id } })
    if (res.count === 0) return Response.json({ error: 'Event not found' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (e) {
    if (e instanceof SchoolAccessError) return forbidden()
    throw e
  }
}
