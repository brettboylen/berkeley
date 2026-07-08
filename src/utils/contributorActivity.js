const INACTIVE_MS = 30 * 24 * 60 * 60 * 1000

export function getContributorLastActivity(name, shows) {
  const timestamps = []

  for (const show of shows) {
    if (show.contributor !== name || show.status === 'canceled') continue
    if (show.submittedAt) {
      timestamps.push(new Date(show.submittedAt).getTime())
    } else if (show.date) {
      timestamps.push(new Date(`${show.date}T12:00:00`).getTime())
    }
  }

  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps))
}

export function isContributorInactive(name, shows, inactiveMs = INACTIVE_MS) {
  const lastActivity = getContributorLastActivity(name, shows)
  if (!lastActivity) return true
  return Date.now() - lastActivity.getTime() > inactiveMs
}
