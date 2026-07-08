/** 24h HH:mm */
export const DEFAULT_STANDARD_SHOW_TIME = '20:00'

/** Default live-music start times for wall-calendar PDF (weekday: 0=Sun … 6=Sat). */
export const PDF_MUSIC_NIGHT_TIMES = {
  0: '18:00', // Sun
  4: '20:00', // Thu
  5: '20:30', // Fri
  6: '20:00', // Sat
}

export function formatShowTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return m === '00' ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`
}

export const PDF_MUSIC_NIGHT_SCHEDULE = [
  { label: 'Thursday', time: PDF_MUSIC_NIGHT_TIMES[4] },
  { label: 'Friday', time: PDF_MUSIC_NIGHT_TIMES[5] },
  { label: 'Saturday', time: PDF_MUSIC_NIGHT_TIMES[6] },
  { label: 'Sunday', time: PDF_MUSIC_NIGHT_TIMES[0] },
].map(({ label, time }) => ({
  label,
  timeLabel: formatShowTime(time),
}))

export function isNonStandardShowTime(time, standardTime) {
  return !!time && time !== standardTime
}

export function musicCellTimeLabel(show, standardTime) {
  const time = show?.time || standardTime
  return formatShowTime(time)
}
