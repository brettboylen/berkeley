<script setup>
import { computed } from 'vue'
import { useShows } from '../composables/useShows'
import { formatShowTitle } from '../utils/showTitle'
import { isDateBlockedForMusic, getRecurringEventForDate } from '../utils/recurringEvents'

const props = defineProps({
  modelValue: { type: String, default: '' },
  monthsAhead: { type: Number, default: 6 },
})

const emit = defineEmits(['update:modelValue'])

const { getContributorItemsForDate } = useShows()

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const months = computed(() => {
  const result = []
  let year = today.getFullYear()
  let month = today.getMonth()

  for (let i = 0; i < props.monthsAhead; i++) {
    result.push(buildMonth(year, month))
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }
  return result
})

function buildMonth(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = []

  for (let i = 0; i < startPad; i++) {
    days.push(null)
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push(buildDay(dateStr, d))
  }

  return {
    label: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    days,
  }
}

function buildDay(dateStr, dayNum) {
  const isPast = dateStr < todayStr
  const blocked = isDateBlockedForMusic(dateStr)
  const items = getContributorItemsForDate(dateStr)
  const musicItems = items.filter((e) => e.kind !== 'recurring')
  const recurring = getRecurringEventForDate(dateStr)

  let status = 'open'
  if (blocked) status = 'house'
  else if (musicItems.length) status = 'booked'

  return {
    dateStr,
    dayNum,
    isPast,
    isToday: dateStr === todayStr,
    isSelected: dateStr === props.modelValue,
    status,
    items,
    recurring,
    summary: status === 'house'
      ? recurring?.name ?? 'House event'
      : musicItems.length
        ? musicItems.map((e) => formatShowTitle(e.item)).join(', ')
        : 'Open',
  }
}

function dayClasses(day) {
  if (!day) return ''
  if (day.isSelected) return 'ring-2 ring-berkeley-red bg-berkeley-red/10'
  if (day.isPast) return 'bg-stone-100 text-stone-400 cursor-not-allowed'
  if (day.status === 'house') return 'bg-stone-200/80 text-stone-600'
  if (day.status === 'booked') return 'bg-berkeley-yellow/50 text-stone-800 hover:bg-berkeley-yellow/70 cursor-pointer'
  return 'bg-berkeley-green/15 text-berkeley-green-dark hover:bg-berkeley-green/25 cursor-pointer'
}

function selectDay(day) {
  if (!day || day.isPast) return
  emit('update:modelValue', day.dateStr)
}
</script>

<template>
  <div class="relative">
    <p class="pointer-events-none absolute bottom-0 left-0 right-2 z-20 py-2 text-center text-[10px] font-heading font-bold uppercase tracking-wide text-stone-500 bg-gradient-to-t from-white via-white/95 to-transparent">
      Scroll for more months
    </p>
    <div class="max-h-[28rem] min-h-[16rem] overflow-y-auto overscroll-y-contain rounded-xl border-2 border-stone-900/10 bg-white pr-1 shadow-inner">
    <div v-for="(month, monthIdx) in months" :key="month.label" :class="monthIdx ? 'border-t-2 border-stone-100' : ''">
      <h4 class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 font-display text-lg uppercase tracking-wide text-stone-900 border-b border-stone-100">
        {{ month.label }}
      </h4>

      <div class="grid grid-cols-7 bg-berkeley-green/90">
        <div
          v-for="label in weekdayLabels"
          :key="`${month.label}-${label}`"
          class="py-1.5 text-center text-[10px] font-heading font-bold text-white uppercase tracking-widest"
        >
          {{ label }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-px bg-stone-100 p-px">
        <div
          v-for="(day, idx) in month.days"
          :key="`${month.label}-${idx}`"
          class="min-h-[4.25rem] bg-white"
        >
          <button
            v-if="day"
            type="button"
            class="w-full h-full min-h-[4.25rem] p-1.5 text-left transition-colors flex flex-col"
            :class="dayClasses(day)"
            :disabled="day.isPast"
            @click="selectDay(day)"
          >
            <span
              class="text-xs font-heading font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0"
              :class="day.isToday ? 'bg-berkeley-red text-white' : ''"
            >
              {{ day.dayNum }}
            </span>
            <span class="mt-0.5 text-[10px] font-heading font-semibold uppercase leading-tight line-clamp-2">
              {{ day.summary }}
            </span>
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
