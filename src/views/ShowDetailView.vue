<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useShows } from '../composables/useShows'
import { useAuth } from '../composables/useAuth'
import { PROMOTION_FIELDS } from '../data/constants'
import StatusBadge from '../components/StatusBadge.vue'
import ShowPoster from '../components/ShowPoster.vue'
import { formatShowTitle } from '../utils/showTitle'

const route = useRoute()
const { getShowById } = useShows()
const { isAuthenticated } = useAuth()

const show = computed(() => getShowById(route.params.id))

const canContributorEdit = computed(() => {
  const s = show.value
  return (
    isAuthenticated.value &&
    s &&
    ['confirmed', 'promoted', 'held'].includes(s.status)
  )
})

const contributorEditTo = computed(() =>
  show.value
    ? { path: '/contributor', query: { tab: 'manage', edit: String(show.value.id) } }
    : '/contributor'
)

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div v-if="show" class="max-w-2xl mx-auto">
    <RouterLink
      to="/"
      class="inline-flex items-center gap-1 text-sm font-heading font-bold uppercase tracking-wide text-berkeley-red hover:text-berkeley-red-dark mb-6"
    >
      ← Back to calendar
    </RouterLink>

    <article class="panel overflow-hidden">
      <div class="bg-berkeley-green px-6 py-8 text-white text-center">
        <div>
          <StatusBadge :status="show.status" size="md" />
          <h2 class="font-display text-4xl sm:text-5xl uppercase tracking-wide mt-3">
            {{ formatShowTitle(show) }}
          </h2>
          <p v-if="show.psychedelicSunday" class="text-sky-200 font-heading font-bold uppercase tracking-wide text-sm mt-2">
            Psychedelic Sunday Series
          </p>
          <p v-if="show.openers?.length" class="text-lg text-white/90 mt-1 font-heading uppercase tracking-wide">
            with {{ show.openers.join(', ') }}
          </p>
          <p v-else-if="show.openersPending" class="text-lg text-white/90 mt-1 font-heading uppercase tracking-wide italic">
            Openers TBD
          </p>
        </div>
      </div>

      <div v-if="show.flier" class="bg-stone-100 p-6 flex justify-center border-b-2 border-stone-900/10">
        <ShowPoster :show="show" size="lg" />
      </div>

      <div class="p-6 sm:p-8">
        <dl class="grid sm:grid-cols-2 gap-4 text-sm">
          <div class="bg-berkeley-yellow/40 rounded-xl p-4">
            <dt class="font-heading text-xs uppercase tracking-widest text-stone-500 font-bold">Date</dt>
            <dd class="font-semibold text-stone-900 mt-1">{{ formatDate(show.date) }}</dd>
          </div>
          <div class="bg-berkeley-yellow/40 rounded-xl p-4">
            <dt class="font-heading text-xs uppercase tracking-widest text-stone-500 font-bold">Time</dt>
            <dd class="font-semibold text-stone-900 mt-1">{{ formatTime(show.time) }}</dd>
          </div>
          <div class="bg-stone-50 rounded-xl p-4">
            <dt class="font-heading text-xs uppercase tracking-widest text-stone-500 font-bold">Genre</dt>
            <dd class="font-semibold text-stone-900 mt-1">{{ show.genre }}</dd>
          </div>
          <div class="bg-stone-50 rounded-xl p-4">
            <dt class="font-heading text-xs uppercase tracking-widest text-stone-500 font-bold">Booked by</dt>
            <dd class="font-semibold text-stone-900 mt-1">{{ show.contributor }}</dd>
          </div>
        </dl>

        <div class="mt-6">
          <h3 class="font-heading text-xs uppercase tracking-widest text-stone-500 font-bold">About the Show</h3>
          <p class="mt-2 text-stone-700 leading-relaxed">{{ show.description }}</p>
        </div>

        <div v-if="show.internalNotes" class="mt-6 rounded-xl bg-berkeley-yellow/30 border-2 border-berkeley-yellow px-4 py-3">
          <h3 class="font-heading text-xs uppercase tracking-widest text-stone-700 font-bold">Staff Notes</h3>
          <p class="mt-1 text-sm text-stone-800">{{ show.internalNotes }}</p>
        </div>

        <div
          v-if="canContributorEdit"
          class="mt-8 rounded-xl border-2 border-berkeley-green/40 bg-berkeley-green/10 p-5 sm:p-6"
        >
          <p class="font-heading text-xs uppercase tracking-widest text-berkeley-green-dark font-bold mb-1">Contributor tools</p>
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-2">Edit this show</h3>
          <p class="text-sm text-stone-600 mb-4">
            Update openers, lineup, and show details after confirmation.
          </p>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3">
            <RouterLink
              :to="contributorEditTo"
              class="btn-primary !text-sm text-center"
            >
              Edit show (add openers)
            </RouterLink>
            <RouterLink
              to="/contributor"
              class="btn-secondary !text-sm text-center"
            >
              Contributor View
            </RouterLink>
          </div>
        </div>

        <div
          v-if="['confirmed', 'promoted'].includes(show.status)"
          class="mt-6 rounded-xl border-2 border-berkeley-red/30 bg-berkeley-red/5 p-5 sm:p-6"
        >
          <p class="font-heading text-xs uppercase tracking-widest text-berkeley-red font-bold mb-1">Staff tools</p>
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-2">Facebook Event Kit</h3>
          <p class="text-sm text-stone-600 mb-4">
            Copy event details and download the poster to create this show on Facebook.
            Staff password required.
          </p>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3">
            <RouterLink
              :to="`/staff/event/${show.id}`"
              class="btn-primary !text-sm text-center"
            >
              Open Facebook Event Kit
            </RouterLink>
            <RouterLink
              to="/staff"
              class="btn-secondary !text-sm text-center"
            >
              Staff View
            </RouterLink>
          </div>
        </div>

        <div
          v-if="['confirmed', 'promoted'].includes(show.status)"
          class="mt-6 pt-6 border-t-2 border-stone-100"
        >
          <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-4">Promotion Status</h3>
          <ul class="grid sm:grid-cols-2 gap-2">
            <li
              v-for="field in PROMOTION_FIELDS"
              :key="field.key"
              class="flex items-center gap-2 text-sm font-medium"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="show.promotion[field.key]
                  ? 'bg-berkeley-green text-white'
                  : 'bg-stone-200 text-stone-400'"
              >
                {{ show.promotion[field.key] ? '✓' : '·' }}
              </span>
              {{ field.label }}
            </li>
          </ul>
        </div>
      </div>
    </article>
  </div>

  <div v-else class="text-center py-16">
    <p class="font-heading uppercase tracking-wide text-stone-500">Show not found.</p>
    <RouterLink to="/" class="text-berkeley-red font-heading font-bold uppercase mt-2 inline-block hover:underline">
      Back to calendar
    </RouterLink>
  </div>
</template>
