export const MAX_OPENERS = 2

export function parseOpenersFromFields(hasOpeners, opener1 = '', opener2 = '') {
  if (!hasOpeners) return []
  return [opener1, opener2]
    .map((name) => name?.trim())
    .filter(Boolean)
    .slice(0, MAX_OPENERS)
}

export function openersToFields(openers) {
  const list = openers ?? []
  return {
    hasOpeners: list.length > 0,
    opener1: list[0] ?? '',
    opener2: list[1] ?? '',
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

export function openersAreValid(hasOpeners, opener1 = '') {
  return !hasOpeners || !!opener1?.trim()
}
