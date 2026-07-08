/** Recurring house events — weekday index: 0=Sun, 1=Mon, … */
export const RECURRING_EVENTS = [
  { weekday: 1, id: 'recurring-bingo', name: 'Berkeley Bingo', time: '20:00' },
  { weekday: 2, id: 'recurring-karaoke', name: 'Blacklight Karaoke!', time: '20:00' },
  { weekday: 3, id: 'recurring-open-mic', name: 'Open Mic!', time: '20:00' },
]

export function getRecurringEventForDate(dateStr) {
  const weekday = new Date(`${dateStr}T12:00:00`).getDay()
  return RECURRING_EVENTS.find((e) => e.weekday === weekday) ?? null
}

export function isDateBlockedForMusic(dateStr) {
  return getRecurringEventForDate(dateStr) !== null
}

export function recurringCalendarEntry(dateStr) {
  const event = getRecurringEventForDate(dateStr)
  if (!event) return null
  return { kind: 'recurring', item: { ...event, date: dateStr } }
}

export function formatEventTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}
