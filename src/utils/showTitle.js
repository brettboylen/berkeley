export function isSunday(dateStr) {
  if (!dateStr) return false
  return new Date(`${dateStr}T12:00:00`).getDay() === 0
}

export function formatShowTitle(item) {
  const name = item?.headliner ?? ''
  if (item?.psychedelicSunday) {
    return `Psychedelic Sunday — ${name}`
  }
  return name
}
