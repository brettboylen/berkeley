<script setup>
import ShowPoster from './ShowPoster.vue'
import StatusBadge from './StatusBadge.vue'
import { formatShowTitle } from '../utils/showTitle'

defineProps({
  shows: {
    type: Array,
    required: true,
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
})

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}
</script>

<template>
  <div class="space-y-4">
    <RouterLink
      v-for="show in shows"
      :key="show.id"
      :to="`/show/${show.id}`"
      class="flex gap-4 panel p-4 hover:border-berkeley-red/30 transition-colors group"
    >
      <ShowPoster :show="show" size="md" />

      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-heading text-xs uppercase tracking-widest text-stone-500">
              {{ new Date(show.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              }) }}
              · {{ formatTime(show.time) }}
            </p>
            <h3 class="font-display text-xl sm:text-2xl tracking-wide uppercase group-hover:text-berkeley-red transition-colors truncate">
              {{ formatShowTitle(show) }}
            </h3>
            <p v-if="show.psychedelicSunday" class="text-xs font-heading font-bold uppercase tracking-wide text-sky-600 mt-0.5">
              Psychedelic Sunday Series
            </p>
            <p v-if="show.openers?.length" class="text-sm text-stone-500 font-medium truncate">
              with {{ show.openers.join(', ') }}
            </p>
          </div>
          <StatusBadge v-if="showStatus" :status="show.status" />
        </div>
        <p v-if="show.description" class="mt-2 text-sm text-stone-600 line-clamp-2">
          {{ show.description }}
        </p>
      </div>
    </RouterLink>

    <p v-if="!shows.length" class="text-center text-stone-500 py-12 font-heading uppercase tracking-wide">
      No upcoming shows scheduled.
    </p>
  </div>
</template>
