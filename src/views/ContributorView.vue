<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useShows } from '../composables/useShows'
import ShowCalendarGrid from '../components/ShowCalendarGrid.vue'
import BookingRequestForm from '../components/BookingRequestForm.vue'
import ContributorShowEditForm from '../components/ContributorShowEditForm.vue'
import ContributorNameInput from '../components/ContributorNameInput.vue'
import ShowPoster from '../components/ShowPoster.vue'
import PosterUploadModal from '../components/PosterUploadModal.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { formatShowTitle } from '../utils/showTitle'

const CONTRIBUTOR_NAME_KEY = 'berkeley-contributor-name'

const { isAuthenticated, login, logout } = useAuth()
const {
  pendingRequests,
  getContributorItemsForDate,
  getConfirmedShowsForMonth,
  getContributorManageableShows,
  getAllPromotableShows,
  getShowById,
  updateContributorShow,
  cancelContributorShow,
} = useShows()

const password = ref('')
const loginError = ref('')
const activeTab = ref('calendar')
const contributorName = ref(sessionStorage.getItem(CONTRIBUTOR_NAME_KEY) ?? '')
const editingShowId = ref('')
const cancelingShowId = ref('')
const cancelReason = ref('')
const manageMessage = ref('')
const manageError = ref('')

const today = new Date()
const selectedMonth = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
)
const posterModalShowId = ref('')
const uploadSuccess = ref(false)
const uploadSuccessReplaced = ref(false)

const tabs = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'manage', label: 'My Shows' },
  { id: 'facebook', label: 'Facebook Event Kits' },
  { id: 'request', label: 'Request Booking' },
  { id: 'poster', label: 'Upload / Replace Poster' },
]

const monthShows = computed(() =>
  [...getConfirmedShowsForMonth(selectedMonth.value)].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  )
)

const posterModalShow = computed(() =>
  posterModalShowId.value ? getShowById(posterModalShowId.value) ?? null : null
)

const trimmedContributorName = computed(() => contributorName.value.trim())

const manageableShows = computed(() =>
  trimmedContributorName.value
    ? getContributorManageableShows(trimmedContributorName.value)
    : []
)

const allPromotableShows = computed(() => getAllPromotableShows())

const editingShow = computed(() =>
  editingShowId.value ? getShowById(editingShowId.value) ?? null : null
)

watch(contributorName, (name) => {
  const trimmed = name.trim()
  if (trimmed) sessionStorage.setItem(CONTRIBUTOR_NAME_KEY, trimmed)
  else sessionStorage.removeItem(CONTRIBUTOR_NAME_KEY)
  editingShowId.value = ''
  cancelingShowId.value = ''
  manageMessage.value = ''
  manageError.value = ''
})

watch(activeTab, (tab) => {
  if (tab === 'request') {
    nextTick(() => {
      document.getElementById('booking-availability-calendar')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }
})

function tryLogin() {
  loginError.value = ''
  if (!login(password.value)) {
    loginError.value = 'Incorrect password.'
  }
}

function contributorEntryClass(entry) {
  if (entry.kind === 'recurring') return 'bg-stone-300/70 text-stone-800'
  if (entry.kind === 'request') return 'bg-stone-200 text-stone-700'
  const show = entry.item
  if (show.psychedelicSunday) return 'bg-sky-100 text-sky-800 hover:bg-sky-200'
  if (show.status === 'held') return 'bg-berkeley-yellow/60 text-stone-800 hover:bg-berkeley-yellow'
  if (show.status === 'promoted') return 'bg-berkeley-red/15 text-berkeley-red hover:bg-berkeley-red/25'
  return 'bg-berkeley-green/20 text-berkeley-green-dark hover:bg-berkeley-green/30'
}

function contributorLabel(entry) {
  if (entry.kind === 'recurring') return entry.item.name
  if (entry.kind === 'request') {
    return `${formatShowTitle(entry.item)} (pending)`
  }
  return formatShowTitle(entry.item)
}

function contributorLink(entry) {
  if (entry.kind === 'show') return `/show/${entry.item.id}`
  return null
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function openPosterModal(showId) {
  uploadSuccess.value = false
  uploadSuccessReplaced.value = false
  posterModalShowId.value = showId
}

function closePosterModal() {
  posterModalShowId.value = ''
}

function onPosterUploaded({ replaced }) {
  uploadSuccess.value = true
  uploadSuccessReplaced.value = replaced
}

function startEdit(showId) {
  cancelingShowId.value = ''
  cancelReason.value = ''
  manageMessage.value = ''
  manageError.value = ''
  editingShowId.value = showId
}

function closeEdit() {
  editingShowId.value = ''
}

function handleSaveEdit(updates) {
  manageMessage.value = ''
  manageError.value = ''
  const result = updateContributorShow(editingShowId.value, trimmedContributorName.value, updates)
  if (!result.ok) {
    manageError.value = 'Could not save changes. Try again or contact staff.'
    return
  }
  manageMessage.value = 'Show updated — changes appear on the calendar immediately.'
  editingShowId.value = ''
}

function startCancel(showId) {
  editingShowId.value = ''
  manageMessage.value = ''
  manageError.value = ''
  cancelReason.value = ''
  cancelingShowId.value = showId
}

function closeCancel() {
  cancelingShowId.value = ''
  cancelReason.value = ''
}

function confirmCancelShow() {
  manageMessage.value = ''
  manageError.value = ''
  const result = cancelContributorShow(
    cancelingShowId.value,
    trimmedContributorName.value,
    cancelReason.value
  )
  if (!result.ok) {
    manageError.value = 'Could not cancel this show. Try again or contact staff.'
    return
  }
  manageMessage.value = 'Show canceled — staff have been notified via internal notes.'
  cancelingShowId.value = ''
  cancelReason.value = ''
}

function formatOpeners(show) {
  return show.openers?.length ? show.openers.join(', ') : 'No openers — playing both sets'
}

function canUseFacebookKit(show) {
  return ['confirmed', 'promoted'].includes(show.status)
}
</script>

<template>
  <div>
    <div v-if="!isAuthenticated" class="max-w-lg mx-auto">
      <div class="text-center mb-8">
        <h2 class="section-title">Contributor View</h2>
        <p class="text-stone-600 mt-3 font-medium leading-relaxed">
          This section is for bands and bookers who are directly affiliated with Berkeley Cafe.
          Review the calendar, submit booking requests, edit confirmed shows, and upload or replace posters.
        </p>
      </div>

      <div class="rounded-xl bg-berkeley-yellow/30 border-2 border-berkeley-yellow px-4 py-3 text-sm text-stone-800 mb-6">
        <p class="font-heading font-bold uppercase tracking-wide text-stone-900 mb-1">New to Berkeley?</p>
        <p>
          If you are a new band, please submit your music and information through the email on the
          <RouterLink to="/book" class="text-berkeley-red font-semibold underline">Book a Show</RouterLink>
          page.
        </p>
      </div>

      <form class="panel p-6 sm:p-8 space-y-4" @submit.prevent="tryLogin">
        <div>
          <label for="password" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="Enter contributor password"
          />
        </div>
        <p v-if="loginError" class="text-sm text-red-600 font-medium">{{ loginError }}</p>
        <button type="submit" class="btn-primary w-full">Enter Contributor View</button>
      </form>
    </div>

    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 class="section-title">Contributor View</h2>
          <p class="text-stone-600 mt-2 font-medium">
            For bands and bookers directly affiliated with Berkeley Cafe.
            Use <strong>Facebook Event Kits</strong> to copy show details into Facebook or other social media posts.
          </p>
        </div>
        <button type="button" class="text-sm font-heading uppercase tracking-wide text-stone-500 hover:text-berkeley-red" @click="logout">
          Sign out
        </button>
      </div>

      <div class="flex flex-wrap rounded-full border-2 border-stone-900/10 overflow-hidden bg-white shadow-sm mb-8 w-fit max-w-full">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-5 py-2 text-sm font-heading font-semibold uppercase tracking-wide transition-colors border-l-2 border-stone-900/10 first:border-l-0"
          :class="activeTab === tab.id ? 'bg-berkeley-red text-white' : 'text-stone-600 hover:bg-stone-50'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'calendar'">
        <ShowCalendarGrid
          :get-items-for-date="getContributorItemsForDate"
          :class-builder="contributorEntryClass"
          :label-builder="contributorLabel"
          :link-builder="contributorLink"
        />

        <div class="mt-4 flex flex-wrap gap-4 text-sm font-heading font-semibold uppercase tracking-wide text-stone-600">
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-berkeley-green/40"></span> Confirmed</span>
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-berkeley-red/30"></span> Promoted</span>
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-berkeley-yellow"></span> Held</span>
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-sky-200"></span> Psychedelic Sunday</span>
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-stone-300"></span> House event (no music booking)</span>
          <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-stone-200 border border-stone-300"></span> Pending request</span>
        </div>

        <section v-if="pendingRequests.length" class="mt-10">
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-4">All Pending Requests</h3>
          <div class="space-y-3">
            <div v-for="req in pendingRequests" :key="req.id" class="panel p-4 flex justify-between gap-3">
              <div>
                <h4 class="font-display text-xl uppercase tracking-wide">{{ formatShowTitle(req) }}</h4>
                <p class="text-sm text-stone-500">{{ formatDate(req.date) }} · {{ req.actType }}</p>
                <p class="text-sm text-stone-600 font-medium mt-1">
                  Submitted by: {{ req.contributor }}
                </p>
              </div>
              <span class="font-heading text-xs uppercase font-bold text-stone-500">pending</span>
            </div>
          </div>
        </section>
      </section>

      <section v-else-if="activeTab === 'manage'">
        <div class="panel p-5 sm:p-6 mb-6">
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-2">My Shows</h3>
          <p class="text-sm text-stone-600 mb-6">
            Update openers and lineup details after confirmation, or cancel a show if plans change.
            Date changes still require staff — contact Alex or use group chat.
          </p>

          <ContributorNameInput
            id="manage-contributor"
            v-model="contributorName"
            hint="Enter the same name you use when submitting bookings — type freely if you are new."
          />

          <div v-if="manageMessage" class="rounded-xl bg-berkeley-green/15 border-2 border-berkeley-green px-4 py-3 text-sm text-berkeley-green-dark font-medium mb-4 mt-6">
            {{ manageMessage }}
          </div>
          <div v-if="manageError" class="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
            {{ manageError }}
          </div>

          <div v-if="trimmedContributorName && !manageableShows.length" class="text-stone-500 text-sm">
            No confirmed, promoted, or held shows booked under {{ trimmedContributorName }}.
          </div>

          <div v-else-if="trimmedContributorName" class="space-y-4">
            <div
              v-for="show in manageableShows"
              :key="show.id"
              class="panel p-4"
              :class="{ 'ring-2 ring-berkeley-green/40': editingShowId === show.id }"
            >
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h4 class="font-display text-xl uppercase tracking-wide">{{ formatShowTitle(show) }}</h4>
                    <StatusBadge :status="show.status" />
                  </div>
                  <p class="text-sm text-stone-500">{{ formatDate(show.date) }} · {{ show.time }}</p>
                  <p class="text-sm text-stone-600 mt-2">
                    <span class="font-heading font-bold uppercase text-xs tracking-wide text-stone-500">Openers:</span>
                    {{ formatOpeners(show) }}
                  </p>
                </div>
                <div v-if="editingShowId !== show.id && cancelingShowId !== show.id" class="flex flex-wrap gap-2 shrink-0">
                  <RouterLink
                    v-if="canUseFacebookKit(show)"
                    :to="`/contributor/event/${show.id}`"
                    class="btn-primary !text-sm !px-4 !py-2 text-center"
                  >
                    Event kit
                  </RouterLink>
                  <button type="button" class="btn-primary !text-sm !px-4 !py-2" @click="startEdit(show.id)">
                    Edit
                  </button>
                  <button type="button" class="btn-secondary !text-sm !px-4 !py-2 !text-berkeley-red !border-berkeley-red/30" @click="startCancel(show.id)">
                    Cancel show
                  </button>
                </div>
              </div>

              <ContributorShowEditForm
                v-if="editingShowId === show.id && editingShow"
                :show="editingShow"
                class="mt-4"
                @save="handleSaveEdit"
                @cancel="closeEdit"
              />

              <div
                v-if="cancelingShowId === show.id"
                class="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-4 space-y-3"
              >
                <p class="font-heading font-bold uppercase tracking-wide text-red-900 text-sm">
                  Cancel this show?
                </p>
                <p class="text-sm text-red-800">
                  This removes {{ formatShowTitle(show) }} from the public calendar. Staff will see your note in internal notes.
                </p>
                <div>
                  <label :for="`cancel-reason-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
                    Reason (optional)
                  </label>
                  <textarea
                    :id="`cancel-reason-${show.id}`"
                    v-model="cancelReason"
                    rows="2"
                    class="input-field resize-y bg-white"
                    placeholder="e.g. Band unavailable, rescheduling, lineup fell through"
                  />
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn-primary !bg-berkeley-red hover:!bg-berkeley-red-dark !text-sm !px-4 !py-2" @click="confirmCancelShow">
                    Yes, cancel show
                  </button>
                  <button type="button" class="btn-secondary !text-sm !px-4 !py-2" @click="closeCancel">
                    Keep show
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'facebook'">
        <div class="panel p-5 sm:p-6 border-2 border-berkeley-red/30 bg-berkeley-red/5">
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">Facebook Event Kits</h3>
          <p class="text-sm text-stone-600 mb-6 max-w-2xl">
            Copy event title, date, location, and description into Facebook or other social media posts.
            Download the poster for the cover photo, then mark the event created when you're done.
            Use <strong>My Shows</strong> to edit or cancel shows booked under your name.
          </p>

          <div v-if="!allPromotableShows.length" class="text-stone-500 text-sm">
            No confirmed or promoted shows yet.
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-4">
            <article
              v-for="show in allPromotableShows"
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
                  {{ formatDate(show.date) }} · {{ show.time }}
                </p>
                <p class="text-xs text-stone-400 font-heading uppercase mt-1">
                  Booked by {{ show.contributor }}
                </p>
              </div>
              <RouterLink
                :to="`/contributor/event/${show.id}`"
                class="btn-primary !text-sm w-full text-center"
              >
                Open Facebook Event Kit
              </RouterLink>
            </article>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'request'">
        <BookingRequestForm />
      </section>

      <section v-else-if="activeTab === 'poster'">
        <div class="panel p-5 sm:p-6">
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-2">Upload or Replace Show Poster</h3>
          <p class="text-sm text-stone-600 mb-6">
            Find a confirmed show by month, then upload a new poster or replace an existing one.
            Replace the poster when the lineup changes — headliner, opener order, or opener names.
          </p>

          <div class="mb-6 max-w-xs">
            <label for="poster-month" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
              Show month
            </label>
            <input id="poster-month" v-model="selectedMonth" type="month" class="input-field" />
          </div>

          <div v-if="monthShows.length" class="space-y-3 mb-8">
            <h4 class="font-heading text-sm uppercase tracking-wide text-stone-500 font-bold">
              Confirmed shows in {{ selectedMonth }}
            </h4>
            <div
              v-for="show in monthShows"
              :key="show.id"
              class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 panel p-3 sm:p-4"
            >
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <ShowPoster :show="show" size="sm" />
                <div class="flex-1 min-w-0">
                  <p class="font-display text-lg uppercase tracking-wide truncate">{{ formatShowTitle(show) }}</p>
                  <p class="text-sm text-stone-500">{{ formatDate(show.date) }}</p>
                  <p
                    v-if="show.posterStale"
                    class="text-xs font-heading uppercase font-bold text-amber-700 mt-1"
                  >
                    Lineup changed — replace poster
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <StatusBadge :status="show.status" class="hidden sm:inline-flex" />
                <button
                  type="button"
                  class="btn-primary flex-1 sm:flex-none min-h-[48px] px-6 py-3 text-sm sm:text-xs sm:min-h-0 sm:py-2.5"
                  @click="openPosterModal(show.id)"
                >
                  {{ show.flier ? 'Replace Poster' : 'Upload Poster' }}
                </button>
              </div>
            </div>
          </div>

          <p v-else class="text-stone-500 text-sm mb-8">No confirmed shows in this month.</p>

          <div v-if="uploadSuccess" class="rounded-xl bg-berkeley-green/15 border-2 border-berkeley-green px-4 py-3 text-sm text-berkeley-green-dark font-medium">
            {{
              uploadSuccessReplaced
                ? 'Poster replaced — promotion tracker updated automatically.'
                : 'Poster uploaded — promotion tracker updated automatically.'
            }}
          </div>
        </div>
      </section>

      <PosterUploadModal
        :show="posterModalShow"
        @close="closePosterModal"
        @uploaded="onPosterUploaded"
      />
    </div>
  </div>
</template>
