<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  getItemsForDate: {
    type: Function,
    required: true,
  },
  linkBuilder: {
    type: Function,
    default: (entry) => (entry.kind === 'show' ? `/show/${entry.item.id}` : null),
  },
  labelBuilder: {
    type: Function,
    default: (entry) => entry.item.headliner,
  },
  classBuilder: {
    type: Function,
    required: true,
  },
})

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
)

const daysInMonth = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startPad = first.getDay()
  const days = []

  for (let i = 0; i < startPad; i++) {
    days.push({ date: null, items: [] })
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: d,
      dateStr,
      items: props.getItemsForDate(dateStr),
      isToday:
        d === today.getDate() &&
        currentMonth.value === today.getMonth() &&
        currentYear.value === today.getFullYear(),
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToday() {
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<template>
  <div>
    <div class="flex items-center justify-end gap-2 mb-4">
      <button
        type="button"
        class="w-9 h-9 rounded-full bg-white border-2 border-stone-900/10 font-heading text-lg hover:bg-berkeley-yellow transition-colors shadow-sm"
        aria-label="Previous month"
        @click="prevMonth"
      >
        ‹
      </button>
      <span class="font-display text-2xl min-w-[10rem] text-center tracking-wide">{{ monthLabel }}</span>
      <button
        type="button"
        class="w-9 h-9 rounded-full bg-white border-2 border-stone-900/10 font-heading text-lg hover:bg-berkeley-yellow transition-colors shadow-sm"
        aria-label="Next month"
        @click="nextMonth"
      >
        ›
      </button>
      <button
        type="button"
        class="ml-1 px-4 py-1.5 text-sm font-heading font-semibold uppercase rounded-full border-2 border-stone-900/10 bg-white hover:bg-berkeley-yellow transition-colors"
        @click="goToday"
      >
        Today
      </button>
    </div>

    <div class="panel">
      <div class="grid grid-cols-7 bg-berkeley-green border-b-2 border-stone-900/10">
        <div
          v-for="day in weekdayLabels"
          :key="day"
          class="py-2.5 text-center text-xs font-heading font-bold text-white uppercase tracking-widest"
        >
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 auto-rows-fr min-h-[28rem] bg-white">
        <div
          v-for="(cell, idx) in daysInMonth"
          :key="idx"
          class="min-h-[5.5rem] border-b border-r border-stone-100 p-1.5"
          :class="{ 'bg-stone-50/80': !cell.date }"
        >
          <template v-if="cell.date">
            <div
              class="text-sm font-heading font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full"
              :class="cell.isToday ? 'bg-berkeley-red text-white' : 'text-stone-700'"
            >
              {{ cell.date }}
            </div>
            <div class="space-y-0.5">
              <template v-for="entry in cell.items.slice(0, 2)" :key="`${entry.kind}-${entry.item.id}`">
                <RouterLink
                  v-if="linkBuilder(entry)"
                  :to="linkBuilder(entry)"
                  class="block text-xs px-1.5 py-0.5 rounded-md truncate font-heading font-semibold uppercase transition-colors"
                  :class="classBuilder(entry)"
                >
                  {{ labelBuilder(entry) }}
                </RouterLink>
                <span
                  v-else
                  class="block text-xs px-1.5 py-0.5 rounded-md truncate font-heading font-semibold uppercase"
                  :class="classBuilder(entry)"
                >
                  {{ labelBuilder(entry) }}
                </span>
              </template>
              <p v-if="cell.items.length > 2" class="text-xs text-stone-400 px-1 font-heading">
                +{{ cell.items.length - 2 }} more
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
