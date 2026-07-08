import { ref } from 'vue'
import { CONTRIBUTORS as DEFAULT_CONTRIBUTORS } from '../data/constants'

const STORAGE_KEY = 'berkeley-contributor-registry'

function loadContributors() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.every((name) => typeof name === 'string')) {
        return parsed
      }
    }
  } catch {
    /* use defaults */
  }
  return [...DEFAULT_CONTRIBUTORS]
}

const contributors = ref(loadContributors())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contributors.value))
}

export function useContributors() {
  function registerContributor(name) {
    const trimmed = name?.trim()
    if (!trimmed || contributors.value.includes(trimmed)) return

    contributors.value = [...contributors.value, trimmed].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    )
    persist()
  }

  function removeContributor(name) {
    contributors.value = contributors.value.filter((contributor) => contributor !== name)
    persist()
  }

  function removeContributors(names) {
    const removeSet = new Set(names)
    contributors.value = contributors.value.filter((contributor) => !removeSet.has(contributor))
    persist()
  }

  return {
    contributors,
    registerContributor,
    removeContributor,
    removeContributors,
  }
}
