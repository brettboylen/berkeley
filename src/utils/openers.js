export const MAX_OPENERS = 2

export function parseOpenersFromFields(hasOpeners, opener1 = '', opener2 = '') {
  if (!hasOpeners) return []
  return [opener1, opener2]
    .map((name) => name?.trim())
    .filter(Boolean)
    .slice(0, MAX_OPENERS)
}

export function openersToFields(source) {
  const openers = Array.isArray(source) ? source : source?.openers ?? []
  const openersPending = Array.isArray(source) ? false : !!source?.openersPending

  if (openersPending) {
    return {
      hasOpeners: true,
      openersLater: true,
      opener1: '',
      opener2: '',
    }
  }

  return {
    hasOpeners: openers.length > 0 || openersPending,
    openersLater: openersPending,
    opener1: openers[0] ?? '',
    opener2: openers[1] ?? '',
  }
}

export function buildOpenersUpdate(hasOpeners, openersLater, opener1 = '', opener2 = '') {
  if (!hasOpeners) {
    return { openers: [], openersPending: false }
  }
  if (openersLater) {
    return { openers: [], openersPending: true }
  }
  return {
    openers: parseOpenersFromFields(true, opener1, opener2),
    openersPending: false,
  }
}

export function normalizeOpeners(openers) {
  if (Array.isArray(openers)) {
    return openers.map((name) => name?.trim()).filter(Boolean).slice(0, MAX_OPENERS)
  }
  if (typeof openers === 'string') {
    return openers
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .slice(0, MAX_OPENERS)
  }
  return []
}

/** Opener names are optional — contributors may add them after confirmation. */
export function openersAreValid() {
  return true
}

export function formatOpenersLabel(item) {
  if (item?.openersPending) return 'Openers TBD'
  if (item?.openers?.length) return `with ${item.openers.join(', ')}`
  return null
}
