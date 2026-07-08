<script setup>
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  show: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

function formatTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: props.compact ? 'short' : 'long',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <RouterLink
    :to="`/show/${show.id}`"
    class="block rounded-xl border border-stone-200 bg-white p-4 hover:border-berkeley-300 hover:shadow-md transition-all group"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="font-display text-lg text-stone-900 group-hover:text-berkeley-700 transition-colors truncate">
          {{ show.headliner }}
        </h3>
        <p v-if="show.openers?.length" class="text-sm text-stone-500 mt-0.5 truncate">
          with {{ show.openers.join(', ') }}
        </p>
      </div>
      <StatusBadge :status="show.status" />
    </div>

    <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      <div>
        <dt class="text-stone-400">Date</dt>
        <dd class="font-medium">{{ formatDate(show.date) }}</dd>
      </div>
      <div>
        <dt class="text-stone-400">Time</dt>
        <dd class="font-medium">{{ formatTime(show.time) }}</dd>
      </div>
      <div v-if="!props.compact">
        <dt class="text-stone-400">Genre</dt>
        <dd>{{ show.genre }}</dd>
      </div>
    </dl>

    <p v-if="!props.compact && show.description" class="mt-3 text-sm text-stone-600 line-clamp-2">
      {{ show.description }}
    </p>
  </RouterLink>
</template>
