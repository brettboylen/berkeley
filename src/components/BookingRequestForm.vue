<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useShows } from '../composables/useShows'
import { GENRES, ACT_TYPES } from '../data/constants'
import ContributorNameInput from './ContributorNameInput.vue'
import BookingAvailabilityCalendar from './BookingAvailabilityCalendar.vue'
import OpenerFields from './OpenerFields.vue'
import { parseOpenersFromFields, openersAreValid } from '../utils/openers'
import { getRecurringEventForDate, formatEventTime } from '../utils/recurringEvents'
import { formatShowTitle, isSunday } from '../utils/showTitle'

const { addBookingRequest, getShowsForDate, isDateBlockedForMusic } = useShows()

const submitted = ref(false)
const dateConflict = ref(null)
const blockedRecurring = ref(null)

const form = reactive({
  headliner: '',
  hasOpeners: false,
  opener1: '',
  opener2: '',
  date: '',
  time: '20:00',
  description: '',
  genre: '',
  actType: '',
  contributor: '',
  psychedelicSunday: false,
})

const isSundayDate = computed(() => isSunday(form.date))

const previewTitle = computed(() =>
  form.headliner.trim()
    ? formatShowTitle({ headliner: form.headliner.trim(), psychedelicSunday: form.psychedelicSunday })
    : ''
)

const canSubmit = computed(
  () => !blockedRecurring.value && openersAreValid(form.hasOpeners, form.opener1)
)

watch(isSundayDate, (sunday) => {
  if (!sunday) form.psychedelicSunday = false
})

watch(() => form.date, () => {
  checkDate()
})

function onCalendarDateSelect(dateStr) {
  form.date = dateStr
  checkDate()
}

function checkDate() {
  blockedRecurring.value = null
  dateConflict.value = null

  if (!form.date) return

  if (!isSunday(form.date)) {
    form.psychedelicSunday = false
  }

  if (isDateBlockedForMusic(form.date)) {
    blockedRecurring.value = getRecurringEventForDate(form.date)
    return
  }

  const existing = getShowsForDate(form.date).filter(
    (s) => ['confirmed', 'promoted', 'held'].includes(s.status)
  )
  dateConflict.value = existing.length ? existing : null
}

function handleSubmit() {
  checkDate()
  if (!canSubmit.value) return

  const result = addBookingRequest({
    headliner: form.headliner,
    date: form.date,
    time: form.time,
    description: form.description,
    genre: form.genre,
    actType: form.actType,
    contributor: form.contributor,
    psychedelicSunday: form.psychedelicSunday,
    openers: parseOpenersFromFields(form.hasOpeners, form.opener1, form.opener2),
  })
  if (!result) return

  submitted.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function submitAnother() {
  Object.assign(form, {
    headliner: '',
    hasOpeners: false,
    opener1: '',
    opener2: '',
    date: '',
    time: '20:00',
    description: '',
    genre: '',
    actType: '',
    contributor: form.contributor,
    psychedelicSunday: false,
  })
  submitted.value = false
  dateConflict.value = null
  blockedRecurring.value = null
}
</script>

<template>
  <div>
    <div v-if="submitted" class="card-block p-6 sm:p-8 text-center">
      <h2 class="font-display text-4xl uppercase tracking-wide">Request Submitted!</h2>
      <p class="mt-3 text-white/90 font-medium">
        Your booking request has been recorded. Staff will review it informally —
        you'll hear back via email or group chat.
      </p>
      <button
        type="button"
        class="mt-6 btn-primary !bg-white !text-berkeley-green hover:!bg-berkeley-yellow"
        @click="submitAnother"
      >
        Submit Another
      </button>
    </div>

    <div v-else class="space-y-6">
      <p class="text-sm text-stone-600 font-medium panel p-4 sm:p-5">
        Submit a booking request for staff review. Use the scrollable calendar to check open dates as you complete the form.
        Monday–Wednesday are reserved for house events and cannot be booked for live music.
      </p>

      <div class="grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-6 items-start">
        <section
          id="booking-availability-calendar"
          class="panel p-5 sm:p-6 order-1 lg:order-2 lg:sticky lg:top-24 scroll-mt-24"
        >
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">Review open dates</h3>
          <p class="text-sm text-stone-600 font-medium mb-4">
            Scroll through upcoming months. Click a day to set your request date.
          </p>

          <BookingAvailabilityCalendar
            :model-value="form.date"
            @update:model-value="onCalendarDateSelect"
          />

          <div class="mt-4 flex flex-wrap gap-3 text-xs font-heading font-semibold uppercase tracking-wide text-stone-600">
            <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-berkeley-green/30 border border-berkeley-green/40"></span> Open</span>
            <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-berkeley-yellow/60 border border-berkeley-yellow"></span> Booked</span>
            <span class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-stone-200"></span> House event</span>
            <span class="flex items-center gap-2"><span class="w-4 h-4 rounded ring-2 ring-berkeley-red bg-berkeley-red/10"></span> Selected</span>
          </div>
        </section>

        <form class="panel p-6 sm:p-8 space-y-5 order-2 lg:order-1" @submit.prevent="handleSubmit">
          <div>
            <label for="headliner" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
              Headliner <span class="text-berkeley-red">*</span>
            </label>
            <input id="headliner" v-model="form.headliner" type="text" required class="input-field" placeholder="Band or artist name" />
          </div>

          <OpenerFields
            id-prefix="booking"
            v-model:has-openers="form.hasOpeners"
            v-model:opener1="form.opener1"
            v-model:opener2="form.opener2"
          />

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="date" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
                Date <span class="text-berkeley-red">*</span>
              </label>
              <input id="date" v-model="form.date" type="date" required class="input-field" @change="checkDate" />
            </div>
            <div>
              <label for="time" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
                Time <span class="text-berkeley-red">*</span>
              </label>
              <input id="time" v-model="form.time" type="time" required class="input-field" />
            </div>
          </div>

          <div
            v-if="isSundayDate"
            class="rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-4"
          >
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="form.psychedelicSunday"
                type="checkbox"
                class="mt-1 w-4 h-4 rounded border-stone-300 text-sky-500 focus:ring-sky-400"
              />
              <span>
                <span class="font-heading font-bold uppercase tracking-wide text-stone-900 block">
                  Psychedelic Sunday event
                </span>
                <span class="text-sm text-stone-600 mt-1 block">
                  Check this if the show is part of our Psychedelic Sunday series. The listing will
                  appear as “Psychedelic Sunday” ahead of the band name.
                </span>
              </span>
            </label>
            <p v-if="previewTitle" class="mt-3 text-sm font-medium text-sky-800 border-t border-sky-200 pt-3">
              Preview: <span class="font-heading font-bold uppercase">{{ previewTitle }}</span>
            </p>
          </div>

          <div
            v-if="blockedRecurring"
            class="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <p class="font-heading font-bold uppercase">This date is not available for live music.</p>
            <p class="mt-1 font-medium">
              {{ blockedRecurring.name }} · {{ formatEventTime(blockedRecurring.time) }}
            </p>
            <p class="mt-2 text-red-800">Please choose Thursday, Friday, or Sunday instead.</p>
          </div>

          <div
            v-else-if="dateConflict"
            class="rounded-xl border-2 border-berkeley-yellow bg-berkeley-yellow/40 px-4 py-3 text-sm"
          >
            <p class="font-heading font-bold uppercase text-stone-900">This date already has show(s):</p>
            <ul class="mt-1 list-disc list-inside font-medium">
              <li v-for="show in dateConflict" :key="show.id">
                {{ formatShowTitle(show) }} ({{ show.status }})
              </li>
            </ul>
            <p class="mt-2 text-stone-700">You can still submit — staff will review.</p>
          </div>

          <div>
            <label for="genre" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
              Genre <span class="text-berkeley-red">*</span>
            </label>
            <select id="genre" v-model="form.genre" required class="input-field">
              <option value="" disabled>Select genre</option>
              <option v-for="g in GENRES" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div>
            <label for="actType" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
              Act type <span class="text-berkeley-red">*</span>
            </label>
            <select id="actType" v-model="form.actType" required class="input-field">
              <option value="" disabled>Select act type</option>
              <option v-for="t in ACT_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label for="description" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
              Description <span class="text-berkeley-red">*</span>
            </label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="3"
              class="input-field resize-y"
              placeholder="Provide exciting information about this act for use in social media promotion."
            />
          </div>

          <ContributorNameInput id="contributor" v-model="form.contributor" />

          <button type="submit" class="btn-primary" :disabled="!canSubmit">Submit Booking Request</button>
        </form>
      </div>
    </div>
  </div>
</template>
