const INACTIVE_MS = 30 * 24 * 60 * 60 * 1000

export function getContributorLastActivity(name, shows, requests) {
  const timestamps = []

  for (const request of requests) {
    if (request.contributor === name && request.submittedAt) {
      timestamps.push(new Date(request.submittedAt).getTime())
    }
  }

  for (const show of shows) {
    if (show.contributor === name && show.status !== 'canceled') {
      timestamps.push(new Date(`${show.date}T12:00:00`).getTime())
    }
  }

  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps))
}

export function isContributorInactive(name, shows, requests, inactiveMs = INACTIVE_MS) {
  const lastActivity = getContributorLastActivity(name, shows, requests)
  if (!lastActivity) return true
  return Date.now() - lastActivity.getTime() > inactiveMs
}
