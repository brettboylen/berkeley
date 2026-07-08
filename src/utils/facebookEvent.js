import { formatShowTitle } from './showTitle'
import { VENUE } from '../data/venue'

function formatTime12(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function formatLongDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function buildFacebookEventFields(show) {
  const title = formatShowTitle(show)
  const dateLine = `${formatLongDate(show.date)} · ${formatTime12(show.time)}`
  const openerLine = show.openers?.length ? `\n\nWith ${show.openers.join(', ')}` : ''

  const description = `${show.description}${openerLine}

Live music at ${VENUE.name} — ${VENUE.addressShort}
Follow ${VENUE.instagramFollowLabel} for updates.`

  const location = `${VENUE.name}, ${VENUE.addressShort}`

  const fullPaste = `${title}

${dateLine}
${location}

${description}`

  return { title, dateLine, location, description, fullPaste }
}

export const FACEBOOK_CREATE_EVENT_URL = 'https://www.facebook.com/events/create/'
