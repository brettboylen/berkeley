<script setup>
import { computed } from 'vue'
import { VENUE } from '../data/venue'
import { cellStyle, PSYCHEDELIC_SUNDAY_STYLE, PSYCHE_SUNDAY_LABEL, HOUSE_CELL_STYLE, SHEET_WIDTH_PX, SHEET_HEIGHT_PX } from '../utils/printWallCalendar'

const props = defineProps({
  sheet: {
    type: Object,
    required: true,
  },
})

const theme = computed(() => props.sheet.theme)

const patternStyle = computed(() => {
  const accent = theme.value.accent
  const sidebar = theme.value.sidebarBg
  switch (theme.value.pattern) {
    case 'gingham':
      return {
        backgroundImage: `linear-gradient(45deg, ${accent} 25%, transparent 25%), linear-gradient(-45deg, ${accent} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${accent} 75%), linear-gradient(-45deg, transparent 75%, ${accent} 75%)`,
        backgroundSize: '28px 28px',
        backgroundPosition: '0 0, 0 14px, 14px -14px, -14px 0',
      }
    case 'sun':
      return { background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }
    case 'leaves':
      return {
        backgroundImage: `radial-gradient(circle at 20% 30%, ${accent} 2px, transparent 2px), radial-gradient(circle at 70% 60%, ${sidebar} 2px, transparent 2px)`,
        backgroundSize: '48px 48px',
      }
    default:
      return {
        backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }
  }
})
</script>

<template>
  <div
    class="wall-calendar-sheet relative overflow-hidden flex"
    :style="{
      width: `${SHEET_WIDTH_PX}px`,
      height: `${SHEET_HEIGHT_PX}px`,
      background: theme.pageBg,
    }"
  >
    <div
      v-if="theme.pattern === 'gingham'"
      class="absolute inset-0 opacity-[0.12] pointer-events-none"
      :style="patternStyle"
    />
    <div
      v-else-if="theme.pattern === 'sun'"
      class="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 pointer-events-none"
      :style="patternStyle"
    />
    <div
      v-else-if="theme.pattern === 'leaves'"
      class="absolute inset-0 opacity-[0.09] pointer-events-none"
      :style="patternStyle"
    />
    <div
      v-else
      class="absolute inset-0 opacity-[0.1] pointer-events-none"
      :style="patternStyle"
    />

    <aside
      class="relative z-10 flex flex-col shrink-0 text-white px-4 py-4"
      :style="{
        width: '210px',
        background: theme.sidebarBg,
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }"
    >
      <div
        class="wall-calendar-logo-wrap rounded-lg px-3 py-2.5 mb-2 w-full"
        style="background: #FAF8F4; box-shadow: 0 1px 4px rgba(0,0,0,0.12);"
      >
        <img
          src="/assets/logo-transparent.png"
          alt="Berkeley Cafe"
          class="wall-calendar-logo block w-[150px] max-w-full h-auto object-contain object-left"
        />
      </div>
      <h1
        class="uppercase leading-[0.92] tracking-wide mb-1"
        style="font-family: 'Bebas Neue', Impact, sans-serif; font-size: 34px;"
      >
        Berkeley<br />Cafe
      </h1>
      <p
        class="uppercase tracking-[0.12em] text-white mb-3"
        style="font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 700;"
      >
        Live Music Calendar
      </p>

      <div
        class="rounded-lg px-3 py-3 mb-4"
        style="background: rgba(0,0,0,0.15); font-family: 'Oswald', sans-serif;"
      >
        <p class="uppercase tracking-wide text-white font-bold text-[15px] mb-2">
          Live music times
        </p>
        <ul class="space-y-1.5 text-[14px] leading-snug text-white font-semibold">
          <li v-for="night in sheet.musicNightSchedule" :key="night.label">
            <strong>{{ night.label }}</strong> · {{ night.timeLabel }}
          </li>
        </ul>
      </div>

      <div class="space-y-3.5 text-[15px] leading-snug mb-auto" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
        <div class="flex items-center gap-3">
          <span
            class="w-6 h-6 rounded-sm shrink-0"
            :style="{ background: theme.accentLight, border: `3px solid ${theme.accent}` }"
          />
          <span>Booked live music</span>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="w-6 h-6 rounded-sm shrink-0"
            :style="{ background: PSYCHEDELIC_SUNDAY_STYLE.background, border: `3px solid ${PSYCHEDELIC_SUNDAY_STYLE.borderColor}` }"
          />
          <span class="italic">{{ PSYCHE_SUNDAY_LABEL }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="w-6 h-6 rounded-sm shrink-0"
            :style="{ background: HOUSE_CELL_STYLE.background, border: `3px solid ${HOUSE_CELL_STYLE.borderColor}` }"
          />
          <span>Weekly recurring events</span>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="w-6 h-6 rounded-sm shrink-0 bg-white"
            :style="{ border: `3px dashed ${theme.accent}` }"
          />
          <span>Open to book</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/25">
        <p class="text-[13px] uppercase tracking-wide text-white mb-1.5 font-bold" style="font-family: 'Oswald', sans-serif;">
          Book a show
        </p>
        <p class="text-[14px] leading-snug text-white font-semibold">
          {{ VENUE.addressShort }}
        </p>
        <p class="text-[14px] mt-1 text-white/95 font-semibold">{{ VENUE.instagram }}</p>
      </div>
    </aside>

    <div class="relative z-10 flex-1 flex flex-col px-5 py-4 min-w-0">
      <header class="mb-2 flex items-end gap-3 shrink-0">
        <h2
          class="uppercase leading-none tracking-wide"
          :style="{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '64px',
            color: '#1C1917',
          }"
        >
          {{ sheet.monthLabel }}
        </h2>
        <span
          class="uppercase pb-1"
          :style="{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '26px',
            fontWeight: 700,
            color: '#1C1917',
            letterSpacing: '0.12em',
          }"
        >
          {{ sheet.yearLabel }}
        </span>
      </header>

      <div
        class="grid grid-cols-7 gap-1.5 mb-2 shrink-0"
        style="font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.05em; color: #1C1917;"
      >
        <span v-for="label in sheet.weekdayLabels" :key="label" class="text-center uppercase">
          {{ label }}
        </span>
      </div>

      <div class="grid grid-cols-7 gap-1.5 flex-1 min-h-0 content-start">
        <template v-for="(day, index) in sheet.days" :key="index">
          <div v-if="!day" class="min-h-[96px]" />
          <div
            v-else
            class="min-h-[96px] rounded-lg border-[3px] flex flex-col p-1.5 min-w-0 overflow-hidden"
            :class="day.isToday ? 'ring-2 ring-stone-900 ring-offset-1' : ''"
            :style="cellStyle(day, sheet.theme)"
          >
            <span
              class="leading-none shrink-0"
              style="font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 700; color: inherit;"
            >
              {{ day.dayNum }}
            </span>
            <template v-if="day.kind === 'music'">
              <span
                v-if="day.seriesLabel"
                class="leading-[1.15] mt-0.5 italic"
                style="font-size: 11px; font-weight: 700; font-family: 'Barlow', sans-serif; color: inherit;"
              >
                {{ day.seriesLabel }}
              </span>
              <span
                class="leading-[1.2] mt-0.5 line-clamp-2 break-words"
                style="font-size: 12px; font-weight: 700; font-family: 'Barlow', sans-serif; color: inherit;"
              >
                {{ day.shortLabel }}
              </span>
              <span
                class="leading-none mt-auto pt-1"
                style="font-size: 12px; font-weight: 700; font-family: 'Oswald', sans-serif; color: inherit;"
              >
                {{ day.timeLabel }}
              </span>
            </template>
            <template v-else-if="day.kind === 'house'">
              <span
                class="leading-[1.2] mt-1 line-clamp-2 break-words"
                style="font-size: 12px; font-weight: 700; font-family: 'Barlow', sans-serif; color: inherit;"
              >
                {{ day.shortLabel }}
              </span>
              <span
                class="leading-none mt-auto pt-1"
                style="font-size: 12px; font-weight: 700; font-family: 'Oswald', sans-serif; color: inherit;"
              >
                {{ day.timeLabel }}
              </span>
            </template>
            <span
              v-else-if="day.shortLabel"
              class="leading-[1.2] mt-auto line-clamp-2 font-bold"
              style="font-size: 12px; font-family: 'Oswald', sans-serif; color: inherit;"
            >
              {{ day.shortLabel }}
            </span>
          </div>
        </template>
      </div>

      <div
        v-if="sheet.openDates.length"
        class="mt-2 rounded-lg px-3 py-2.5 shrink-0"
        :style="{ background: 'rgba(255,255,255,0.85)', border: `2px dashed ${theme.accent}` }"
      >
        <p
          class="uppercase tracking-wide mb-2"
          :style="{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1C1917' }"
        >
          Open to book
        </p>
        <ul class="space-y-1" style="font-size: 13px; line-height: 1.4; color: #1C1917; font-weight: 600;">
          <li v-for="dateStr in sheet.openDates" :key="dateStr">
            {{
              new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })
            }}
          </li>
        </ul>
      </div>

      <p
        class="text-right mt-2 shrink-0 font-semibold"
        style="font-size: 13px; color: #1C1917; font-family: 'Oswald', sans-serif; letter-spacing: 0.03em;"
      >
        Printed {{ sheet.generatedAt }} · {{ VENUE.website }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.wall-calendar-sheet {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.wall-calendar-sheet img.wall-calendar-logo-wrap {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.wall-calendar-logo {
  display: block;
  background: transparent;
  border: none;
  box-shadow: none;
}
</style>
