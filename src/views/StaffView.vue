<script setup>
import { ref, computed } from 'vue'
import { useStaffAuth } from '../composables/useStaffAuth'
import { useShows } from '../composables/useShows'
import { useContributors } from '../composables/useContributors'
import { PROMOTION_FIELDS, STATUSES } from '../data/constants'
import StatusBadge from '../components/StatusBadge.vue'
import { formatShowTitle } from '../utils/showTitle'
import { downloadIcsFile } from '../utils/calendarExport'
import {
  getContributorLastActivity,
  isContributorInactive,
} from '../utils/contributorActivity'

const { isAuthenticated, login, logout } = useStaffAuth()
const {
  shows,
  requests,
  heldShows,
  confirmHeldShow,
  releaseHeldShow,
  updatePromotion,
  updateShowStatus,
  approveRequest,
  rejectRequest,
} = useShows()
const { contributors, removeContributor, removeContributors } = useContributors()

const password = ref('')
const loginError = ref('')
const actionMessage = ref('')

const promotableShows = computed(() =>
  [...shows.value]
    .filter((s) => ['confirmed', 'promoted'].includes(s.status))
    .sort((a, b) => a.date.localeCompare(b.date))
)

const staffPendingRequests = computed(() =>
  requests.value.filter((r) => r.reviewStatus === 'pending')
)

const contributorRows = computed(() =>
  contributors.value
    .map((name) => {
      const lastActivity = getContributorLastActivity(name, shows.value, requests.value)
      return {
        name,
        lastActivity,
        inactive: isContributorInactive(name, shows.value, requests.value),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
)

const inactiveContributors = computed(() =>
  contributorRows.value.filter((row) => row.inactive)
)

function tryLogin() {
  loginError.value = ''
  if (!login(password.value)) {
    loginError.value = 'Incorrect password.'
  }
}

function promotionProgress(show) {
  const total = PROMOTION_FIELDS.length
  const done = PROMOTION_FIELDS.filter((f) => show.promotion[f.key]).length
  return Math.round((done / total) * 100)
}

function formatDate(dateStr, weekday = false) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: weekday ? 'long' : undefined,
    month: 'short',
    day: 'numeric',
    year: weekday ? 'numeric' : undefined,
  })
}

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function handleConfirm(showId) {
  if (confirmHeldShow(showId)) {
    actionMessage.value = 'Show confirmed — it will now appear on the public calendar and can receive posters.'
  }
}

function handleRelease(showId) {
  if (window.confirm('Release this hold? The date will be marked canceled and available for rebooking.')) {
    if (releaseHeldShow(showId)) {
      actionMessage.value = 'Hold released — date marked canceled.'
    }
  }
}

function exportToGoogleCalendar() {
  if (!promotableShows.value.length) {
    actionMessage.value = 'No confirmed or promoted shows to export.'
    return
  }
  downloadIcsFile(promotableShows.value)
  actionMessage.value = `Downloaded ${promotableShows.value.length} show(s) as berkeley-shows.ics — import via Google Calendar → Settings → Import & export.`
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatLastActivity(date) {
  if (!date) return 'No submissions on record'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function handleRemoveContributor(name) {
  if (!window.confirm(`Remove "${name}" from the contributor suggestion list? They can still type their name when booking.`)) {
    return
  }
  removeContributor(name)
  actionMessage.value = `Removed ${name} from contributor suggestions.`
}

function handleRemoveInactiveContributors() {
  const names = inactiveContributors.value.map((row) => row.name)
  if (!names.length) return

  const label = names.length === 1 ? names[0] : `${names.length} contributors`
  if (!window.confirm(`Remove ${label} from the suggestion list? No booking requests or shows in the last month.`)) {
    return
  }

  removeContributors(names)
  actionMessage.value = `Removed ${names.length} inactive contributor(s) from suggestions.`
}
</script>

<template>
  <div>
    <div v-if="!isAuthenticated" class="max-w-lg mx-auto">
      <div class="text-center mb-8">
        <h2 class="section-title">Staff View</h2>
        <p class="text-stone-600 mt-3 font-medium leading-relaxed">
          Confirm held dates, review booking requests, track promotion, export to Google Calendar,
          and open Facebook Event Kits to copy show details into Facebook.
        </p>
      </div>

      <form class="panel p-6 space-y-4" @submit.prevent="tryLogin">
        <div>
          <label for="staff-password" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
            Password
          </label>
          <input
            id="staff-password"
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="Enter staff password"
          />
        </div>
        <p v-if="loginError" class="text-sm text-berkeley-red font-medium">{{ loginError }}</p>
        <button type="submit" class="btn-primary w-full">Enter Staff View</button>
      </form>
    </div>

    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h2 class="section-title">Staff View</h2>
          <p class="text-stone-600 mt-2 font-medium max-w-2xl">
            Confirm held dates, review booking requests, and track promotion steps.
            Use the quick links below to jump to Facebook Event Kits or Google Calendar export at the bottom of the page.
          </p>
        </div>
        <button type="button" class="btn-secondary shrink-0" @click="logout">Sign out</button>
      </div>

      <p
        v-if="actionMessage"
        class="mb-6 rounded-xl border-2 border-berkeley-green bg-berkeley-green/10 px-4 py-3 text-sm font-medium text-stone-800"
      >
        {{ actionMessage }}
      </p>

      <nav
        class="sticky top-[4.25rem] sm:top-[4.75rem] z-40 -mx-4 px-4 py-3 mb-8 bg-stone-100/95 backdrop-blur-sm border-y-2 border-stone-900/10 flex flex-wrap gap-2"
        aria-label="Staff quick links"
      >
        <button
          type="button"
          class="btn-secondary !text-xs sm:!text-sm !px-4 !py-2"
          @click="scrollToSection('facebook-event-kits')"
        >
          Facebook Event Kits ↓
        </button>
        <button
          type="button"
          class="btn-secondary !text-xs sm:!text-sm !px-4 !py-2"
          @click="scrollToSection('calendar-export')"
        >
          Google Calendar Export ↓
        </button>
      </nav>

      <section class="mb-10">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-4">
          Held Dates
          <span class="text-base font-heading text-stone-500">({{ heldShows.length }})</span>
        </h3>

        <div v-if="heldShows.length" class="space-y-4">
          <article
            v-for="show in heldShows"
            :key="show.id"
            class="panel p-5 sm:p-6 border-l-4 border-berkeley-yellow"
          >
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <StatusBadge status="held" />
                  <span class="text-sm font-heading uppercase tracking-wide text-stone-500">
                    {{ formatDate(show.date, true) }} · {{ formatTime(show.time) }}
                  </span>
                </div>

                <h4 class="font-display text-2xl uppercase tracking-wide text-stone-900">
                  {{ formatShowTitle(show) }}
                </h4>
                <p v-if="show.openers?.length" class="text-sm text-stone-500 font-medium mt-1">
                  with {{ show.openers.join(', ') }}
                </p>

                <dl class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Contributor</dt>
                    <dd class="font-semibold">{{ show.contributor }}</dd>
                  </div>
                  <div>
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Genre</dt>
                    <dd class="font-semibold">{{ show.genre }}</dd>
                  </div>
                  <div v-if="show.actType">
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Act type</dt>
                    <dd class="font-semibold">{{ show.actType }}</dd>
                  </div>
                </dl>

                <p class="mt-3 text-sm text-stone-600">{{ show.description }}</p>
                <p v-if="show.internalNotes" class="mt-2 text-sm text-stone-500 italic">
                  Note: {{ show.internalNotes }}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button type="button" class="btn-primary !text-sm" @click="handleConfirm(show.id)">
                  Confirm show
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-full border-2 border-stone-300 text-stone-700 text-sm font-heading font-bold uppercase hover:bg-stone-50 transition-colors"
                  @click="handleRelease(show.id)"
                >
                  Release hold
                </button>
                <RouterLink
                  :to="`/show/${show.id}`"
                  class="text-center text-sm font-heading font-bold uppercase tracking-wide text-stone-500 hover:text-berkeley-red transition-colors py-2"
                >
                  View details
                </RouterLink>
              </div>
            </div>
          </article>
        </div>

        <p v-else class="panel p-6 text-sm text-stone-600 font-medium">
          No held dates right now. Use the All Shows table below to set a date to <strong>Held</strong>.
        </p>
      </section>

      <section v-if="staffPendingRequests.length" class="mb-10">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-4">
          Pending Requests
          <span class="text-base font-heading text-berkeley-red">({{ staffPendingRequests.length }})</span>
        </h3>

        <div class="space-y-4">
          <div v-for="req in staffPendingRequests" :key="req.id" class="panel p-5 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h4 class="font-display text-2xl uppercase tracking-wide">{{ formatShowTitle(req) }}</h4>
                <p v-if="req.openers?.length" class="text-sm text-stone-500 font-medium">
                  with {{ req.openers.join(', ') }}
                </p>
                <dl class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div>
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Date</dt>
                    <dd class="font-semibold">{{ formatDate(req.date) }} at {{ req.time }}</dd>
                  </div>
                  <div>
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Genre</dt>
                    <dd class="font-semibold">{{ req.genre }}</dd>
                  </div>
                  <div>
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Act type</dt>
                    <dd class="font-semibold">{{ req.actType }}</dd>
                  </div>
                  <div class="col-span-2">
                    <dt class="font-heading text-xs uppercase tracking-wide text-stone-400">Submitted by</dt>
                    <dd class="font-semibold">{{ req.contributor }}</dd>
                  </div>
                </dl>
                <p class="mt-2 text-sm text-stone-600">{{ req.description }}</p>
              </div>

              <div class="flex gap-2 shrink-0">
                <button type="button" class="btn-secondary !text-sm !px-4 !py-2" @click="approveRequest(req.id)">
                  Approve
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-full border-2 border-stone-300 text-stone-700 text-sm font-heading font-bold uppercase hover:bg-stone-50 transition-colors"
                  @click="rejectRequest(req.id)"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-10 panel p-5 sm:p-6 border-2 border-stone-300/80 bg-white">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">Edit Contributors</h3>
        <p class="text-sm text-stone-600 font-medium mb-4 max-w-2xl">
          Manage the name suggestions shown on booking forms. Removing a name cleans the list — contributors can still type any name when submitting.
          New names are added automatically when someone submits a booking request.
        </p>

        <div
          v-if="inactiveContributors.length"
          class="rounded-xl border-2 border-berkeley-yellow bg-berkeley-yellow/30 px-4 py-4 mb-5"
        >
          <p class="font-heading font-bold uppercase tracking-wide text-sm text-stone-900 mb-2">
            {{ inactiveContributors.length }} contributor{{ inactiveContributors.length === 1 ? '' : 's' }} inactive 1+ month
          </p>
          <p class="text-sm text-stone-700 mb-3">
            {{
              inactiveContributors.map((row) => row.name).join(', ')
            }}
            — no booking requests or shows in the last month.
          </p>
          <button
            type="button"
            class="btn-primary !text-sm !bg-stone-900 hover:!bg-stone-800"
            @click="handleRemoveInactiveContributors"
          >
            Remove all inactive
          </button>
        </div>

        <div v-if="contributorRows.length" class="space-y-2">
          <div
            v-for="row in contributorRows"
            :key="row.name"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 panel p-3"
            :class="row.inactive ? 'border-l-4 border-berkeley-yellow' : ''"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-heading font-bold uppercase tracking-wide text-stone-900">{{ row.name }}</p>
                <span
                  v-if="row.inactive"
                  class="text-[10px] font-heading font-bold uppercase tracking-wide text-berkeley-red bg-berkeley-red/10 px-2 py-0.5 rounded-full"
                >
                  Inactive 1+ mo
                </span>
                <span
                  v-else
                  class="text-[10px] font-heading font-bold uppercase tracking-wide text-berkeley-green-dark bg-berkeley-green/10 px-2 py-0.5 rounded-full"
                >
                  Active
                </span>
              </div>
              <p class="text-sm text-stone-500 mt-1">
                Last activity: {{ formatLastActivity(row.lastActivity) }}
              </p>
            </div>
            <button
              type="button"
              class="btn-secondary !text-xs !px-4 !py-2 !text-berkeley-red !border-berkeley-red/30 shrink-0 self-start sm:self-center"
              @click="handleRemoveContributor(row.name)"
            >
              Remove
            </button>
          </div>
        </div>

        <p v-else class="text-sm text-stone-500 font-medium">
          No contributors on the suggestion list. Names are added when booking requests are submitted.
        </p>
      </section>

      <section class="mb-10">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">Promotion Tracker</h3>
        <p class="text-sm text-stone-600 font-medium mb-4 max-w-2xl">
          Check off promotion steps as you go. To create a Facebook event, use the
          <strong>Open Facebook Event Kit</strong> buttons in each row below or jump to
          <button type="button" class="text-berkeley-red font-semibold underline hover:text-berkeley-red-dark" @click="scrollToSection('facebook-event-kits')">
            Facebook Event Kits
          </button>
          at the bottom of the page.
        </p>

        <div class="hidden lg:block panel overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-berkeley-green text-white text-left">
              <tr>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Show</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Date</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Status</th>
                <th
                  v-for="field in PROMOTION_FIELDS"
                  :key="field.key"
                  class="px-2 py-3 font-heading font-bold text-center text-[10px] uppercase tracking-wide"
                >
                  {{ field.label }}
                </th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs text-center">Done</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Facebook Event Kit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="show in promotableShows" :key="show.id" class="hover:bg-berkeley-yellow/20">
                <td class="px-4 py-3">
                  <RouterLink
                    :to="`/show/${show.id}`"
                    class="font-display text-base uppercase tracking-wide hover:text-berkeley-red"
                  >
                    {{ formatShowTitle(show) }}
                  </RouterLink>
                  <p class="text-xs text-stone-400 font-heading uppercase">{{ show.contributor }}</p>
                </td>
                <td class="px-4 py-3 whitespace-nowrap font-medium">{{ formatDate(show.date) }}</td>
                <td class="px-4 py-3"><StatusBadge :status="show.status" /></td>
                <td v-for="field in PROMOTION_FIELDS" :key="field.key" class="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    :checked="show.promotion[field.key]"
                    class="w-4 h-4 rounded border-stone-300 text-berkeley-red focus:ring-berkeley-red"
                    @change="updatePromotion(show.id, field.key, $event.target.checked)"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-berkeley-red rounded-full transition-all"
                        :style="{ width: `${promotionProgress(show)}%` }"
                      />
                    </div>
                    <span class="text-xs font-heading font-bold w-8">{{ promotionProgress(show) }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <RouterLink
                    :to="`/staff/event/${show.id}`"
                    class="inline-block btn-primary !text-[10px] !px-3 !py-1.5 whitespace-nowrap"
                  >
                    Open kit
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lg:hidden space-y-4">
          <div v-for="show in promotableShows" :key="show.id" class="panel p-4">
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <RouterLink
                  :to="`/show/${show.id}`"
                  class="font-display text-xl uppercase tracking-wide hover:text-berkeley-red"
                >
                  {{ formatShowTitle(show) }}
                </RouterLink>
                <p class="text-sm text-stone-500 font-medium">
                  {{ formatDate(show.date) }} · {{ show.contributor }}
                </p>
              </div>
              <StatusBadge :status="show.status" />
            </div>

            <div class="space-y-2">
              <label v-for="field in PROMOTION_FIELDS" :key="field.key" class="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  :checked="show.promotion[field.key]"
                  class="w-4 h-4 rounded border-stone-300 text-berkeley-red focus:ring-berkeley-red"
                  @change="updatePromotion(show.id, field.key, $event.target.checked)"
                />
                {{ field.label }}
              </label>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <div class="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div class="h-full bg-berkeley-red rounded-full" :style="{ width: `${promotionProgress(show)}%` }" />
              </div>
              <span class="text-xs font-heading font-bold">{{ promotionProgress(show) }}%</span>
            </div>
            <RouterLink
              :to="`/staff/event/${show.id}`"
              class="inline-block mt-4 btn-primary !text-sm w-full text-center"
            >
              Open Facebook Event Kit
            </RouterLink>
          </div>
        </div>

        <p v-if="!promotableShows.length" class="text-center text-stone-500 py-12 font-heading uppercase tracking-wide">
          No confirmed shows to track yet.
        </p>
      </section>

      <section class="mb-10">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-4">All Shows</h3>
        <div class="panel overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-stone-900 text-white text-left">
              <tr>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Show</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Date</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Contributor</th>
                <th class="px-4 py-3 font-heading font-bold uppercase tracking-wide text-xs">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="show in shows" :key="show.id" class="hover:bg-stone-50">
                <td class="px-4 py-3">
                  <RouterLink :to="`/show/${show.id}`" class="font-semibold hover:text-berkeley-red">
                    {{ formatShowTitle(show) }}
                  </RouterLink>
                </td>
                <td class="px-4 py-3">{{ formatDate(show.date) }}</td>
                <td class="px-4 py-3">{{ show.contributor }}</td>
                <td class="px-4 py-3">
                  <select
                    :value="show.status"
                    class="rounded-lg border-2 border-stone-300 px-2 py-1 text-sm bg-white font-heading uppercase"
                    @change="updateShowStatus(show.id, $event.target.value)"
                  >
                    <option v-for="(meta, key) in STATUSES" :key="key" :value="key">
                      {{ meta.label }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="facebook-event-kits"
        class="mb-10 panel p-5 sm:p-6 border-2 border-berkeley-red/30 bg-berkeley-red/5 scroll-mt-28 sm:scroll-mt-32"
      >
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">
          Facebook Event Kits
        </h3>
        <p class="text-sm text-stone-600 font-medium mb-5 max-w-2xl">
          One kit per show — copy the title, date, location, and description into Facebook, download the poster,
          then mark the event created in the kit.
        </p>

        <div v-if="promotableShows.length" class="grid sm:grid-cols-2 gap-4">
          <article
            v-for="show in promotableShows"
            :key="show.id"
            class="panel p-4 bg-white flex flex-col gap-3"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge :status="show.status" />
                <span
                  v-if="show.promotion.facebookEvent"
                  class="text-xs font-heading font-bold uppercase tracking-wide text-berkeley-green-dark"
                >
                  Facebook event done
                </span>
                <span
                  v-else
                  class="text-xs font-heading font-bold uppercase tracking-wide text-berkeley-red"
                >
                  Needs Facebook event
                </span>
              </div>
              <h4 class="font-display text-xl uppercase tracking-wide text-stone-900">
                {{ formatShowTitle(show) }}
              </h4>
              <p class="text-sm text-stone-500 font-medium mt-1">
                {{ formatDate(show.date) }} · {{ formatTime(show.time) }}
              </p>
            </div>
            <RouterLink
              :to="`/staff/event/${show.id}`"
              class="btn-primary !text-sm w-full text-center"
            >
              Open Facebook Event Kit
            </RouterLink>
          </article>
        </div>

        <p v-else class="text-sm text-stone-500 font-medium">
          No confirmed or promoted shows yet — confirm a held date or approve a booking request first.
        </p>
      </section>

      <section
        id="calendar-export"
        class="mb-10 panel p-5 sm:p-6 border-2 border-berkeley-green/30 bg-berkeley-green/5 scroll-mt-28 sm:scroll-mt-32"
      >
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-2">Google Calendar Export</h3>
        <p class="text-sm text-stone-600 font-medium mb-4 max-w-2xl">
          Download all confirmed and promoted shows as a single file for Google Calendar.
        </p>
        <div class="flex flex-col sm:flex-row flex-wrap gap-3">
          <button type="button" class="btn-primary !text-sm" @click="exportToGoogleCalendar">
            Download .ics for Google Calendar
          </button>
          <p class="text-xs text-stone-500 self-center font-medium">
            {{ promotableShows.length }} show(s) ready to export
          </p>
        </div>
        <p class="mt-3 text-xs text-stone-500">
          In Google Calendar: Settings → Import &amp; export → Import → select
          <strong>berkeley-shows.ics</strong>.
        </p>
      </section>
    </div>
  </div>
</template>
