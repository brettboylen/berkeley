<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useShows } from '../composables/useShows'
import { useWallCalendarSettings } from '../composables/useWallCalendarSettings'
import WallCalendarSheet from './WallCalendarSheet.vue'
import { buildWallCalendarSheets, downloadWallCalendarPdf, SHEET_WIDTH_PX, SHEET_HEIGHT_PX } from '../utils/printWallCalendar'
import { formatShowTitle } from '../utils/showTitle'
import { formatShowTime, isNonStandardShowTime } from '../utils/showTime'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
})

const { shows, updateShowTime } = useShows()
const { standardShowTime, setStandardShowTime } = useWallCalendarSettings()

const captureRefs = ref([])
const previewWrapRefs = ref([])
const previewScales = ref([0.55, 0.55])
const downloadingIndex = ref(-1)
const downloadingAll = ref(false)
const downloadError = ref('')
const printingIndex = ref(-1)

const calendarSheets = computed(() =>
  buildWallCalendarSheets(shows.value, standardShowTime.value)
)

const printableShows = computed(() => {
  const seen = new Set()
  return calendarSheets.value
    .flatMap((sheet) => sheet.musicShows)
    .filter((show) => {
      if (seen.has(show.id)) return false
      seen.add(show.id)
      return true
    })
})

function previewScale(index) {
  return previewScales.value[index] ?? 0.55
}

function previewBoxStyle(index) {
  const scale = previewScale(index)
  return {
    width: `${SHEET_WIDTH_PX * scale}px`,
    height: `${SHEET_HEIGHT_PX * scale}px`,
  }
}

function previewInnerStyle(index) {
  const scale = previewScale(index)
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: `${SHEET_WIDTH_PX}px`,
    height: `${SHEET_HEIGHT_PX}px`,
  }
}

function setCaptureRef(el, index) {
  if (el) captureRefs.value[index] = el
}

function setPreviewWrapRef(el, index) {
  if (el) {
    previewWrapRefs.value[index] = el
    resizeObserver?.observe(el)
  }
}

function refreshPreviewScales() {
  previewScales.value = calendarSheets.value.map((_, index) => {
    const wrap = previewWrapRefs.value[index]
    if (!wrap) return 0.55
    const width = wrap.getBoundingClientRect().width
    if (width < 48) return 0.55
    return Math.min(1, Math.max(0.4, (width - 16) / SHEET_WIDTH_PX))
  })
}

function schedulePreviewRefresh() {
  nextTick(() => {
    requestAnimationFrame(() => {
      refreshPreviewScales()
    })
  })
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function handleStandardTimeChange(event) {
  setStandardShowTime(event.target.value)
}

function handleShowTimeChange(showId, event) {
  updateShowTime(showId, event.target.value)
}

async function handleDownloadPdf(index) {
  const element = captureRefs.value[index]
  const sheet = calendarSheets.value[index]
  if (!element || !sheet) return

  downloadError.value = ''
  downloadingIndex.value = index
  try {
    await downloadWallCalendarPdf(
      element,
      `berkeley-calendar-${sheet.monthLabel.toLowerCase()}-${sheet.yearLabel}.pdf`
    )
  } catch {
    downloadError.value = `Could not generate PDF for ${sheet.monthLabel}. Try again or use Print.`
  } finally {
    downloadingIndex.value = -1
  }
}

async function handleDownloadAll() {
  downloadError.value = ''
  downloadingAll.value = true
  try {
    for (let i = 0; i < calendarSheets.value.length; i++) {
      await handleDownloadPdf(i)
    }
  } finally {
    downloadingAll.value = false
  }
}

function handlePrint(index) {
  printingIndex.value = index
  nextTick(() => {
    window.print()
  })
}

function onAfterPrint() {
  printingIndex.value = -1
}

let resizeObserver
onMounted(() => {
  window.addEventListener('afterprint', onAfterPrint)
  resizeObserver = new ResizeObserver(() => schedulePreviewRefresh())
  schedulePreviewRefresh()
  window.addEventListener('resize', schedulePreviewRefresh)
})

onUnmounted(() => {
  window.removeEventListener('afterprint', onAfterPrint)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', schedulePreviewRefresh)
})

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) schedulePreviewRefresh()
  },
  { immediate: true }
)

watch(calendarSheets, schedulePreviewRefresh)
</script>

<template>
  <section
    id="wall-calendar-print"
    class="panel p-5 sm:p-6 border-2 border-berkeley-yellow/50 bg-berkeley-yellow/10 staff-wall-calendar"
  >
    <div class="staff-wall-calendar-controls">
      <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">
        Wall Calendar Print
      </h3>
      <p class="text-sm text-stone-600 font-medium mb-5 max-w-2xl">
        Two landscape letter posters (11″ × 8.5″) — one PDF per month. Public-facing confirmed shows,
        with start times on each date. Standard time applies unless overridden below.
      </p>

      <div class="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          class="btn-primary !text-sm"
          :disabled="downloadingAll || downloadingIndex >= 0"
          @click="handleDownloadAll"
        >
          {{ downloadingAll ? 'Generating PDFs…' : 'Download Both Months (2 PDFs)' }}
        </button>
      </div>

      <div class="panel p-4 bg-white mb-6 max-w-3xl">
        <h4 class="font-heading text-sm uppercase tracking-wide text-stone-700 font-bold mb-3">
          Show times
        </h4>
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 mb-3">
          <div class="sm:w-48">
            <label for="standard-show-time" class="block text-xs font-heading font-bold uppercase tracking-wide text-stone-500 mb-1.5">
              Standard start time
            </label>
            <input
              id="standard-show-time"
              type="time"
              class="input-field"
              :value="standardShowTime"
              @change="handleStandardTimeChange"
            />
          </div>
          <p class="text-sm text-stone-600 flex-1">
            Printed as “Music at <strong>{{ formatShowTime(standardShowTime) }}</strong> unless otherwise noted.”
            Override individual shows below when doors or set times differ.
          </p>
        </div>

        <p class="text-xs text-berkeley-green-dark font-semibold bg-berkeley-green/10 border border-berkeley-green/30 rounded-lg px-3 py-2 mb-4">
          Editing a show’s start time here updates it everywhere instantly — the public calendar,
          the show detail page, and this printable poster all stay in sync.
        </p>

        <div v-if="printableShows.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-heading uppercase tracking-wide text-stone-500 border-b border-stone-200">
                <th class="pb-2 pr-4 font-bold">Show</th>
                <th class="pb-2 pr-4 font-bold">Date</th>
                <th class="pb-2 font-bold">Start time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="show in printableShows" :key="show.id">
                <td class="py-2 pr-4 font-semibold">{{ formatShowTitle(show) }}</td>
                <td class="py-2 pr-4 text-stone-600">{{ formatDate(show.date) }}</td>
                <td class="py-2">
                  <input
                    type="time"
                    class="input-field !py-1.5 !text-sm max-w-[9rem]"
                    :value="show.time"
                    @change="handleShowTimeChange(show.id, $event)"
                  />
                  <span
                    v-if="isNonStandardShowTime(show.time, standardShowTime)"
                    class="ml-2 text-xs font-heading uppercase text-amber-700 font-bold"
                  >
                    Non-standard
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-stone-500">No confirmed shows in the next two printable months.</p>
      </div>

      <div v-if="downloadError" class="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
        {{ downloadError }}
      </div>
    </div>

    <div class="space-y-10">
      <article
        v-for="(sheet, index) in calendarSheets"
        :key="`${sheet.year}-${sheet.month}`"
        class="staff-wall-calendar-month"
        :class="{ 'staff-wall-calendar-month--printing': printingIndex === index }"
      >
        <div class="staff-wall-calendar-controls flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h4 class="font-display text-xl uppercase tracking-wide text-stone-900">
              {{ sheet.monthLabel }} {{ sheet.yearLabel }}
            </h4>
            <p class="text-xs text-stone-500 font-medium">
              {{ sheet.musicShows.length }} show(s) · {{ sheet.openDates.length }} open night(s)
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="btn-primary !text-sm"
              :disabled="downloadingAll || downloadingIndex >= 0"
              @click="handleDownloadPdf(index)"
            >
              {{
                downloadingIndex === index
                  ? 'Generating…'
                  : `Download ${sheet.monthLabel} PDF`
              }}
            </button>
            <button type="button" class="btn-secondary !text-sm" @click="handlePrint(index)">
              Print {{ sheet.monthLabel }}
            </button>
          </div>
        </div>

        <p class="staff-wall-calendar-controls text-xs font-heading uppercase tracking-wide text-stone-500 font-bold mb-2">
          Preview
        </p>
        <div
          :ref="(el) => setPreviewWrapRef(el, index)"
          class="staff-wall-calendar-preview w-full min-h-[220px] rounded-xl border-2 border-stone-900/15 bg-stone-200/50 overflow-auto p-2"
        >
          <div class="mx-auto" :style="previewBoxStyle(index)">
            <div :style="previewInnerStyle(index)">
              <WallCalendarSheet :sheet="sheet" />
            </div>
          </div>
        </div>

        <div
          :ref="(el) => setCaptureRef(el, index)"
          class="staff-wall-calendar-capture"
          aria-hidden="true"
        >
          <WallCalendarSheet :sheet="sheet" />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.staff-wall-calendar-capture {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
  z-index: -1;
}

@media print {
  :global(body *) {
    visibility: hidden;
  }

  .staff-wall-calendar,
  .staff-wall-calendar * {
    visibility: visible;
  }

  .staff-wall-calendar {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: white;
  }

  .staff-wall-calendar-controls,
  .staff-wall-calendar-preview {
    display: none !important;
  }

  .staff-wall-calendar-month {
    display: none;
  }

  .staff-wall-calendar-month--printing {
    display: block !important;
  }

  .staff-wall-calendar-month--printing .staff-wall-calendar-capture {
    position: static;
    left: auto;
    top: auto;
    pointer-events: auto;
    z-index: auto;
  }

  @page {
    size: 11in 8.5in landscape;
    margin: 0;
  }
}
</style>
