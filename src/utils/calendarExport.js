import { formatShowTitle } from './showTitle'
import { VENUE } from '../data/venue'

function pad(n) {
  return String(n).padStart(2, '0')
}

function parseLocalDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0)
}

function formatIcsUtc(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

function escapeIcs(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function buildDescription(show) {
  const lines = [show.description]
  if (show.openers?.length) {
    lines.push(`With ${show.openers.join(', ')}`)
  }
  lines.push(`Genre: ${show.genre}`)
  if (show.actType) lines.push(`Act type: ${show.actType}`)
  lines.push(`Booked by: ${show.contributor}`)
  return lines.filter(Boolean).join('\n')
}

export function buildShowEvent(show) {
  const start = parseLocalDateTime(show.date, show.time)
  const end = new Date(start.getTime() + VENUE.defaultShowHours * 60 * 60 * 1000)
  const now = new Date()

  return [
    'BEGIN:VEVENT',
    `UID:berkeley-show-${show.id}@berkeleycafe`,
    `DTSTAMP:${formatIcsUtc(now)}`,
    `DTSTART;TZID=America/New_York:${show.date.replace(/-/g, '')}T${show.time.replace(':', '')}00`,
    `DTEND;TZID=America/New_York:${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`,
    `SUMMARY:${escapeIcs(formatShowTitle(show))}`,
    `DESCRIPTION:${escapeIcs(buildDescription(show))}`,
    `LOCATION:${escapeIcs(`${VENUE.name}, ${VENUE.addressShort}`)}`,
    'END:VEVENT',
  ].join('\r\n')
}

export function generateIcsCalendar(shows) {
  const events = shows.map(buildShowEvent).join('\r\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Berkeley Cafe//Music Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Berkeley Cafe Shows',
    'X-WR-TIMEZONE:America/New_York',
    'BEGIN:VTIMEZONE',
    'TZID:America/New_York',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcsFile(shows, filename = 'berkeley-shows.ics') {
  const content = generateIcsCalendar(shows)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
