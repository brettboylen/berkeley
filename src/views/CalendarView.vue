<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShows } from '../composables/useShows'
import ShowList from '../components/ShowList.vue'
import ShowCalendarGrid from '../components/ShowCalendarGrid.vue'
import HoursSection from '../components/HoursSection.vue'
import RecurringEventsSection from '../components/RecurringEventsSection.vue'
import { formatShowTitle } from '../utils/showTitle'

const PAGE_SIZE = 8

const route = useRoute()
const { publicShows, getPublicItemsForDate } = useShows()

const viewMode = ref('list')
const currentPage = ref(1)

const upcomingList = computed(() =>
  [...publicShows.value].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  )
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(upcomingList.value.length / PAGE_SIZE))
)

const paginatedShows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return upcomingList.value.slice(start, start + PAGE_SIZE)
})

watch(upcomingList, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

function entryClass(entry) {
  if (entry.kind === 'recurring') {
    return 'bg-stone-300/70 text-stone-800'
  }
  if (entry.kind === 'show' && entry.item.psychedelicSunday) {
    return 'bg-sky-100 text-sky-800 hover:bg-sky-200'
  }
  const show = entry.item
  if (show.status === 'promoted') return 'bg-berkeley-red/15 text-berkeley-red hover:bg-berkeley-red/25'
  return 'bg-berkeley-green/20 text-berkeley-green-dark hover:bg-berkeley-green/30'
}

function entryLabel(entry) {
  if (entry.kind === 'recurring') return entry.item.name
  if (entry.kind === 'show') return formatShowTitle(entry.item)
  return entry.item.headliner
}

function goToPage(page) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  document.getElementById('shows-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToShowsList() {
  nextTick(() => {
    setTimeout(() => {
      document.getElementById('shows-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  })
}

onMounted(() => {
  if (route.query.scroll === 'shows') {
    scrollToShowsList()
  }
})

watch(
  () => route.query.scroll,
  (value) => {
    if (value === 'shows') scrollToShowsList()
  }
)
</script>

<template>
  <div>
    <div id="shows-list" class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 scroll-mt-24">
      <div>
        <h2 class="section-title">Live Music Calendar</h2>
        <p class="text-stone-600 mt-2 font-medium">
          Berkeley's legacy of fine local music continues! Check out upcoming shows and special events below.
        </p>
      </div>
      <RouterLink to="/book" class="btn-primary shrink-0">
        Book a Show
      </RouterLink>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div class="flex rounded-full border-2 border-stone-900/10 overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          class="px-5 py-2 text-sm font-heading font-semibold uppercase tracking-wide transition-colors"
          :class="viewMode === 'list' ? 'bg-berkeley-red text-white' : 'text-stone-600 hover:bg-stone-50'"
          @click="viewMode = 'list'"
        >
          List
        </button>
        <button
          type="button"
          class="px-5 py-2 text-sm font-heading font-semibold uppercase tracking-wide transition-colors border-l-2 border-stone-900/10"
          :class="viewMode === 'month' ? 'bg-berkeley-red text-white' : 'text-stone-600 hover:bg-stone-50'"
          @click="viewMode = 'month'"
        >
          Month
        </button>
      </div>

      <p v-if="viewMode === 'list' && upcomingList.length" class="text-sm font-heading uppercase tracking-wide text-stone-500">
        {{ upcomingList.length }} show{{ upcomingList.length === 1 ? '' : 's' }}
        · Page {{ currentPage }} of {{ totalPages }}
      </p>
    </div>

    <template v-if="viewMode === 'list'">
      <ShowList :shows="paginatedShows" :show-status="false" />

      <nav
        v-if="totalPages > 1"
        class="mt-8 flex items-center justify-center gap-2"
        aria-label="Show list pagination"
      >
        <button
          type="button"
          class="px-4 py-2 rounded-full border-2 border-stone-900/10 bg-white text-sm font-heading font-semibold uppercase tracking-wide hover:bg-berkeley-yellow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="w-9 h-9 rounded-full text-sm font-heading font-bold transition-colors"
            :class="page === currentPage
              ? 'bg-berkeley-red text-white'
              : 'bg-white border-2 border-stone-900/10 text-stone-600 hover:bg-berkeley-yellow'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          class="px-4 py-2 rounded-full border-2 border-stone-900/10 bg-white text-sm font-heading font-semibold uppercase tracking-wide hover:bg-berkeley-yellow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </nav>
    </template>

    <ShowCalendarGrid
      v-else
      :get-items-for-date="getPublicItemsForDate"
      :class-builder="entryClass"
      :label-builder="entryLabel"
    />

    <div v-if="viewMode === 'month'" class="mt-4 flex flex-wrap gap-4 text-sm font-heading font-semibold uppercase tracking-wide text-stone-600">
          <span class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-sky-200"></span> Psychedelic Sunday
      </span>
      <span class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-stone-300"></span> House event (no music booking)
      </span>
    </div>

    <div class="mt-16 space-y-16">
      <RecurringEventsSection />
      <HoursSection />
    </div>
  </div>
</template>
