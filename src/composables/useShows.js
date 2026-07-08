import { ref, computed } from 'vue'
import { initialShows } from '../data/constants'
import {
  isDateBlockedForMusic,
  recurringCalendarEntry,
} from '../utils/recurringEvents'
import { isSunday } from '../utils/showTitle'
import { useContributors } from './useContributors'
import { normalizeOpeners } from '../utils/openers'

const shows = ref(structuredClone(initialShows))

let nextShowId = 14

const PUBLIC_STATUSES = ['confirmed', 'promoted']
const CONTRIBUTOR_SHOW_STATUSES = ['confirmed', 'promoted', 'held']
const CONTRIBUTOR_EDITABLE_STATUSES = ['confirmed', 'promoted', 'held']

function defaultPromotion() {
  return {
    flierReceived: false,
    facebookEvent: false,
    earlySocial: false,
    dayOfPost: false,
    printed: false,
    displayed: false,
  }
}

export function useShows() {
  const publicShows = computed(() =>
    shows.value.filter((s) => PUBLIC_STATUSES.includes(s.status))
  )

  const activeShows = computed(() =>
    shows.value.filter((s) => s.status !== 'canceled')
  )

  const heldShows = computed(() =>
    [...shows.value]
      .filter((s) => s.status === 'held')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  )

  function getPublicShowsForDate(dateStr) {
    return shows.value.filter(
      (s) => s.date === dateStr && PUBLIC_STATUSES.includes(s.status)
    )
  }

  function getPublicItemsForDate(dateStr) {
    const dateShows = getPublicShowsForDate(dateStr).map((s) => ({
      kind: 'show',
      item: s,
    }))
    const recurring = recurringCalendarEntry(dateStr)
    return recurring ? [recurring, ...dateShows] : dateShows
  }

  function getContributorItemsForDate(dateStr) {
    const dateShows = shows.value
      .filter((s) => s.date === dateStr && CONTRIBUTOR_SHOW_STATUSES.includes(s.status))
      .map((s) => ({ kind: 'show', item: s }))

    const recurring = recurringCalendarEntry(dateStr)
    const items = [...dateShows]
    if (recurring) items.unshift(recurring)
    return items
  }

  function getShowsForDate(dateStr) {
    return shows.value.filter((s) => s.date === dateStr && s.status !== 'canceled')
  }

  function getShowById(id) {
    return shows.value.find((s) => s.id === id)
  }

  function getConfirmedShowsForMonth(monthStr) {
    return shows.value.filter(
      (s) =>
        s.date.startsWith(monthStr) &&
        s.status === 'confirmed'
    )
  }

  function getConfirmedShowsForContributor(contributor) {
    return shows.value.filter(
      (s) =>
        s.contributor === contributor &&
        s.status === 'confirmed' &&
        !s.flier
    )
  }

  function getContributorShows(contributor) {
    return shows.value.filter(
      (s) => s.contributor === contributor && PUBLIC_STATUSES.includes(s.status)
    )
  }

  function getContributorManageableShows(contributor) {
    return [...shows.value]
      .filter(
        (s) =>
          s.contributor === contributor &&
          CONTRIBUTOR_EDITABLE_STATUSES.includes(s.status)
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }

  function getContributorPromotableShows(contributor) {
    return [...shows.value]
      .filter(
        (s) =>
          s.contributor === contributor &&
          PUBLIC_STATUSES.includes(s.status)
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }

  function getAllPromotableShows() {
    return [...shows.value]
      .filter((s) => PUBLIC_STATUSES.includes(s.status))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }

  function updateContributorShow(showId, contributor, updates) {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || show.contributor !== contributor) return { ok: false, error: 'not_found' }
    if (!CONTRIBUTOR_EDITABLE_STATUSES.includes(show.status)) {
      return { ok: false, error: 'not_editable' }
    }

    const openers = updates.openers !== undefined
      ? normalizeOpeners(updates.openers)
      : show.openers
    const openersPending = updates.openersPending !== undefined
      ? !!updates.openersPending
      : show.openersPending

    const lineupChanged =
      (updates.headliner?.trim() && updates.headliner.trim() !== show.headliner) ||
      (updates.openers !== undefined &&
        JSON.stringify(openers) !== JSON.stringify(show.openers)) ||
      (updates.openersPending !== undefined && openersPending !== !!show.openersPending)

    show.headliner = updates.headliner?.trim() || show.headliner
    show.openers = openers
    show.openersPending = openersPending
    show.time = updates.time ?? show.time
    show.description = updates.description?.trim() || show.description
    show.genre = updates.genre ?? show.genre
    show.actType = updates.actType ?? show.actType
    show.psychedelicSunday = isSunday(show.date) && !!updates.psychedelicSunday

    if (lineupChanged && show.flier) {
      show.posterStale = true
      show.promotion.printed = false
      show.promotion.displayed = false
    }

    return { ok: true, show }
  }

  function cancelContributorShow(showId, contributor, reason = '') {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || show.contributor !== contributor) return { ok: false, error: 'not_found' }
    if (!CONTRIBUTOR_EDITABLE_STATUSES.includes(show.status)) {
      return { ok: false, error: 'not_editable' }
    }

    show.status = 'canceled'
    const note = reason.trim()
      ? `[Canceled by ${contributor}] ${reason.trim()}`
      : `[Canceled by ${contributor}]`
    show.internalNotes = show.internalNotes
      ? `${show.internalNotes}\n${note}`
      : note

    return { ok: true, show }
  }

  function updatePromotion(showId, field, value) {
    const show = shows.value.find((s) => s.id === showId)
    if (show) {
      show.promotion[field] = value
      const promo = show.promotion
      const allDone = Object.values(promo).every(Boolean)
      const anyDone = Object.values(promo).some(Boolean)
      if (allDone && show.status === 'confirmed') {
        show.status = 'promoted'
      } else if (!allDone && show.status === 'promoted' && anyDone) {
        show.status = 'confirmed'
      }
    }
  }

  function updateShowStatus(showId, status) {
    const show = shows.value.find((s) => s.id === showId)
    if (show) show.status = status
  }

  function updateShowTime(showId, time) {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || !time) return false
    show.time = time
    return true
  }

  function confirmHeldShow(showId) {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || show.status !== 'held') return false
    show.status = 'confirmed'
    if (!show.promotion) {
      show.promotion = defaultPromotion()
    }
    return true
  }

  function releaseHeldShow(showId) {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || show.status !== 'held') return false
    show.status = 'canceled'
    return true
  }

  function addBookingRequest(form) {
    if (isDateBlockedForMusic(form.date)) return null

    const show = {
      id: String(nextShowId++),
      headliner: form.headliner,
      openers: normalizeOpeners(form.openers),
      openersPending: !!form.openersPending,
      date: form.date,
      time: form.time,
      description: form.description,
      genre: form.genre,
      actType: form.actType,
      contributor: form.contributor?.trim() ?? '',
      status: 'held',
      psychedelicSunday: isSunday(form.date) && !!form.psychedelicSunday,
      internalNotes: '',
      submittedAt: new Date().toISOString(),
      flier: null,
      promotion: defaultPromotion(),
    }
    shows.value.unshift(show)
    useContributors().registerContributor(show.contributor)
    return show
  }

  function uploadFlier(showId, file, uploadedBy = 'Contributor') {
    const show = shows.value.find((s) => s.id === showId)
    if (!show || show.status !== 'confirmed') return null

    const isReplace = !!show.flier
    if (show.flier?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(show.flier.url)
    }

    const url = URL.createObjectURL(file)
    show.flier = {
      url,
      filename: file.name,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      version: (show.flier?.version ?? 0) + 1,
    }
    show.posterStale = false
    updatePromotion(showId, 'flierReceived', true)
    return { flier: show.flier, replaced: isReplace }
  }

  return {
    shows,
    publicShows,
    activeShows,
    heldShows,
    getPublicShowsForDate,
    getPublicItemsForDate,
    getContributorItemsForDate,
    getShowsForDate,
    getShowById,
    isDateBlockedForMusic,
    getConfirmedShowsForMonth,
    getConfirmedShowsForContributor,
    getContributorShows,
    getContributorManageableShows,
    getContributorPromotableShows,
    getAllPromotableShows,
    updateContributorShow,
    cancelContributorShow,
    updatePromotion,
    updateShowStatus,
    updateShowTime,
    confirmHeldShow,
    releaseHeldShow,
    addBookingRequest,
    uploadFlier,
  }
}
